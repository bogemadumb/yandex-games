(function (w) {
  var U = w.PlatformUtil, CFG = w.PLATFORM_CONFIG || {};
  var SID = CFG.storageId || 'game';
  var CHUNK_BYTES = 3900, HOUR_BUDGET = 800, FALLBACK_KEY = 'vkfb_' + SID;
  var bridge = w.vkBridge, live = false, lang = '';
  var written = {}, prevCount = 0, calls = [];
  var pauseFns = [], resumeFns = [];

  function send(name, params) { return bridge.send(name, params || {}); }

  function chunkString(s) {
    var out = [], cur = '', bytes = 0;
    for (var i = 0; i < s.length;) {
      var cp = s.codePointAt(i), ch = String.fromCodePoint(cp), n = cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
      if (bytes + n > CHUNK_BYTES) { out.push(cur); cur = ''; bytes = 0; }
      cur += ch; bytes += n; i += ch.length;
    }
    out.push(cur);
    return out;
  }
  function budgetLeft() {
    var cut = Date.now() - 3600000;
    calls = calls.filter(function (t) { return t > cut; });
    return HOUR_BUDGET - calls.length;
  }
  function setKey(k, v) {
    calls.push(Date.now());
    return send('VKWebAppStorageSet', { key: k, value: v }).then(function () { written[k] = v; });
  }
  function metaKey() { return SID + '_m'; }
  function partKey(i) { return SID + '_' + i; }

  function saveVK(str) {
    var parts = chunkString(str), meta = parts.length + ':' + str.length;
    var jobs = [];
    parts.forEach(function (p, i) { if (written[partKey(i)] !== p) jobs.push([partKey(i), p]); });
    for (var i = parts.length; i < prevCount; i++) jobs.push([partKey(i), '']);
    if (written[metaKey()] !== meta) jobs.push([metaKey(), meta]);
    if (!jobs.length) return Promise.resolve(true);
    if (jobs.length > budgetLeft()) return Promise.resolve(false);
    var chain = Promise.resolve();
    jobs.forEach(function (j) { chain = chain.then(function () { return setKey(j[0], j[1]); }); });
    return chain.then(function () { prevCount = parts.length; return true; });
  }
  function loadVK() {
    return send('VKWebAppStorageGet', { keys: [metaKey()] }).then(function (r) {
      var m = r && r.keys && r.keys[0] && r.keys[0].value;
      if (!m) return null;
      var n = parseInt(String(m).split(':')[0], 10);
      if (!(n > 0 && n < 200)) return null;
      var keys = [];
      for (var i = 0; i < n; i++) keys.push(partKey(i));
      return send('VKWebAppStorageGet', { keys: keys }).then(function (rr) {
        var map = {};
        (rr.keys || []).forEach(function (o) { map[o.key] = o.value; });
        var s = '';
        for (var j = 0; j < n; j++) { if (map[partKey(j)] == null || map[partKey(j)] === '') return null; s += map[partKey(j)]; written[partKey(j)] = map[partKey(j)]; }
        written[metaKey()] = m; prevCount = n;
        return JSON.parse(s);
      });
    });
  }

  w.Platform = {
    name: 'vk',
    init: function () {
      var lp = U.params.get('vk_language');
      lang = lp ? String(lp).toLowerCase() : '';
      if (lang === 'ua') lang = 'uk';
      var emb = false;
      try { emb = !!(bridge && bridge.isEmbedded && bridge.isEmbedded()); } catch (e) {}
      if (!emb) return Promise.resolve();
      return U.withTimeout(send('VKWebAppInit').then(function () { return true; }, function () { return false; }), 4000, false).then(function (ok) {
        live = ok;
        if (!ok) return;
        try {
          bridge.subscribe(function (e) {
            var t = e && e.detail && e.detail.type;
            if (t === 'VKWebAppViewHide') pauseFns.forEach(function (f) { f(); });
            else if (t === 'VKWebAppViewRestore') resumeFns.forEach(function (f) { f(); });
          });
        } catch (e) {}
      });
    },
    ready: function () {},
    gameplayStart: function () {},
    gameplayStop: function () {},
    showPreloader: function () { return Promise.resolve(false); },
    hasAds: function () { return live; },
    showInterstitial: function (cb) {
      cb = cb || {};
      function err() { if (cb.onError) cb.onError(); }
      if (!live) { err(); return; }
      U.withTimeout(send('VKWebAppCheckNativeAds', { ad_format: 'interstitial' }).then(function (r) { return !!(r && r.result); }, function () { return false; }), 5000, false).then(function (ok) {
        if (!ok) { err(); return; }
        if (cb.onOpen) cb.onOpen();
        return U.withTimeout(send('VKWebAppShowNativeAds', { ad_format: 'interstitial' }).then(function (r) { return !!(r && r.result); }, function () { return false; }), 120000, false).then(function (shown) {
          if (shown) { if (cb.onClose) cb.onClose(true); } else err();
        });
      });
    },
    showRewarded: function (cb) {
      cb = cb || {};
      function err() { if (cb.onError) cb.onError(); }
      if (!live) { err(); return; }
      var fmt = { ad_format: 'reward', use_waterfall: false };
      U.withTimeout(send('VKWebAppCheckNativeAds', fmt).then(function (r) { return !!(r && r.result); }, function () { return false; }), 5000, false).then(function (ok) {
        if (!ok) { err(); return; }
        if (cb.onOpen) cb.onOpen();
        return U.withTimeout(send('VKWebAppShowNativeAds', fmt).then(function (r) { return !!(r && r.result); }, function () { return false; }), 120000, false).then(function (shown) {
          if (shown) { if (cb.onRewarded) cb.onRewarded(); if (cb.onClose) cb.onClose(true); } else err();
        });
      });
    },
    hasCloud: function () { return true; },
    saveData: function (obj) {
      var str;
      try { str = JSON.stringify(obj); } catch (e) { return Promise.resolve(false); }
      if (!live) return Promise.resolve(U.lsSet(FALLBACK_KEY, str));
      return saveVK(str).then(function (ok) { if (!ok) U.lsSet(FALLBACK_KEY, str); return ok; }, function () { U.lsSet(FALLBACK_KEY, str); return false; });
    },
    loadData: function () {
      function fb() { try { var s = U.lsGet(FALLBACK_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
      if (!live) return Promise.resolve(fb());
      return U.withTimeout(loadVK().catch(function () { return null; }), 5000, null).then(function (d) { return d || fb(); });
    },
    getLang: function () { return lang; },
    onPause: function (fn) { pauseFns.push(fn); },
    onResume: function (fn) { resumeFns.push(fn); }
  };
})(window);
