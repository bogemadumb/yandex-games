(function (w) {
  var U = w.PlatformUtil, CFG = (w.PLATFORM_CONFIG && w.PLATFORM_CONFIG.gamepush) || {};
  var PROJECT_ID = +CFG.projectId || 0;
  var PUBLIC_TOKEN = CFG.publicToken || '';
  var FIELD = 'save';
  var SDK_URLS = [
    'https://gs.eponesh.com/sdk/game-score.js',
    'https://s3.gamepush.com/files/gs/sdk/game-score.js',
    'https://s3-eu.gamepush.com/sdk/game-score.js',
    'https://gamepush.com/sdk/game-score.js'
  ];
  var gp = null, cur = null;
  var pauseFns = [], resumeFns = [];
  var pre = null, preDone = false;

  function loadScript(i, q) {
    if (i >= SDK_URLS.length) return;
    var s = document.createElement('script');
    s.async = true; s.src = SDK_URLS[i] + q;
    s.onerror = function () { s.remove(); loadScript(i + 1, q); };
    document.head.appendChild(s);
  }
  function bindEvents() {
    try {
      gp.ads.on('fullscreen:start', function () { if (cur && cur.kind === 'f') cur.open(); });
      gp.ads.on('rewarded:start', function () { if (cur && cur.kind === 'r') cur.open(); });
      gp.ads.on('preloader:start', function () { if (pre && !pre.open) { pre.open = true; pauseFns.forEach(function (f) { f(); }); } });
      gp.ads.on('preloader:close', function () { preEnd(); });
      gp.on('pause', function () { pauseFns.forEach(function (f) { f(); }); });
      gp.on('resume', function () { resumeFns.forEach(function (f) { f(); }); });
    } catch (e) {}
  }
  function preEnd() { if (pre && pre.open) { pre.open = false; resumeFns.forEach(function (f) { f(); }); } }
  function run(kind, cb, call, rewardCheck) {
    cb = cb || {};
    var opened = false;
    var ctx = { kind: kind, open: function () { if (opened) return; opened = true; if (cb.onOpen) cb.onOpen(); } };
    cur = ctx;
    var p;
    try { p = call(); } catch (e) { cur = null; if (cb.onError) cb.onError(); return; }
    Promise.resolve(p).then(function (ok) {
      cur = null;
      if (ok) { ctx.open(); if (rewardCheck && cb.onRewarded) cb.onRewarded(); if (cb.onClose) cb.onClose(true); }
      else if (opened) { if (cb.onClose) cb.onClose(false); }
      else if (cb.onError) cb.onError();
    }, function () { cur = null; if (cb.onError) cb.onError(); });
  }

  w.Platform = {
    name: 'gamepush',
    init: function () {
      if (!PROJECT_ID || !PUBLIC_TOKEN) {
        if (window.console) console.warn('GamePush: PROJECT_ID / PUBLIC_TOKEN not set, running without SDK');
        return Promise.resolve();
      }
      return new Promise(function (resolve) {
        var done = false;
        function fin(g) {
          if (done) return; done = true;
          gp = g || null;
          if (!gp) { resolve(); return; }
          bindEvents();
          U.withTimeout(Promise.resolve(gp.player && gp.player.ready).catch(function () {}), 6000, null).then(function () { resolve(); });
        }
        w.onGPInit = fin;
        loadScript(0, '?projectId=' + PROJECT_ID + '&publicToken=' + encodeURIComponent(PUBLIC_TOKEN) + '&callback=onGPInit');
        setTimeout(function () { fin(null); }, 10000);
      });
    },
    ready: function () { try { if (gp && gp.gameStart) gp.gameStart(); } catch (e) {} },
    gameplayStart: function () { try { if (gp && gp.gameplayStart) gp.gameplayStart(); } catch (e) {} },
    gameplayStop: function () { try { if (gp && gp.gameplayStop) gp.gameplayStop(); } catch (e) {} },
    showPreloader: function () {
      if (preDone) return Promise.resolve(false);
      preDone = true;
      if (!gp || !gp.ads || typeof gp.ads.showPreloader !== 'function' || gp.ads.isPreloaderAvailable === false) return Promise.resolve(false);
      pre = { open: false };
      var p;
      try { p = Promise.resolve(gp.ads.showPreloader()).then(function (ok) { return ok !== false; }, function () { return false; }); }
      catch (e) { p = Promise.resolve(false); }
      return U.withTimeout(p, 8000, false).then(function (r) { preEnd(); return r; });
    },
    hasAds: function () { return !!(gp && gp.ads); },
    showInterstitial: function (cb) {
      run('f', cb, function () { return gp.ads.showFullscreen(); }, false);
    },
    showRewarded: function (cb) {
      run('r', cb, function () { return gp.ads.showRewardedVideo(); }, true);
    },
    hasCloud: function () { return !!(gp && gp.player); },
    saveData: function (obj) {
      if (!gp || !gp.player) return Promise.resolve(false);
      try {
        gp.player.set(FIELD, JSON.stringify(obj));
        return Promise.resolve(gp.player.sync()).then(function () { return true; }, function () { return false; });
      } catch (e) { return Promise.resolve(false); }
    },
    loadData: function () {
      if (!gp || !gp.player) return Promise.resolve(null);
      try { var s = gp.player.get(FIELD); return Promise.resolve(s ? JSON.parse(s) : null); }
      catch (e) { return Promise.resolve(null); }
    },
    getLang: function () { return (gp && gp.language) || ''; },
    onPause: function (fn) { pauseFns.push(fn); },
    onResume: function (fn) { resumeFns.push(fn); }
  };
})(window);
