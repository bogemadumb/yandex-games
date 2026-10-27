(function (w) {
  var U = w.PlatformUtil, sdk = null, pauseFns = [], resumeFns = [], KEY = 'save';
  function cg() { return w.CrazyGames && w.CrazyGames.SDK; }
  function safe(fn) { try { var r = fn(); if (r && r.catch) r.catch(function () {}); return r; } catch (e) {} }
  w.Platform = {
    name: 'crazygames',
    init: function () {
      var s = cg();
      if (!s || !s.init) return Promise.resolve();
      return U.withTimeout(Promise.resolve(s.init()).then(function () { return true; }, function () { return false; }), 5000, false).then(function (ok) {
        if (!ok) return;
        sdk = s;
        safe(function () { return sdk.game.loadingStart(); });
        try {
          var st = sdk.game.settings;
          if (st && st.muteAudio) pauseFns.forEach(function (f) { f(); });
          if (sdk.game.addSettingsChangeListener) sdk.game.addSettingsChangeListener(function (n) {
            (n && n.muteAudio ? pauseFns : resumeFns).forEach(function (f) { f(); });
          });
        } catch (e) {}
      });
    },
    ready: function () { if (sdk) safe(function () { return sdk.game.loadingStop(); }); },
    gameplayStart: function () { if (sdk) safe(function () { return sdk.game.gameplayStart(); }); },
    gameplayStop: function () { if (sdk) safe(function () { return sdk.game.gameplayStop(); }); },
    showPreloader: function () { return Promise.resolve(false); },
    hasAds: function () { return !!(sdk && sdk.ad); },
    showInterstitial: function (cb) {
      cb = cb || {};
      var err = function () { if (cb.onError) cb.onError(); };
      try { sdk.ad.requestAd('midgame', { adStarted: function () { if (cb.onOpen) cb.onOpen(); }, adFinished: function () { if (cb.onClose) cb.onClose(true); }, adError: err }); } catch (e) { err(); }
    },
    showRewarded: function (cb) {
      cb = cb || {};
      var err = function () { if (cb.onError) cb.onError(); };
      try {
        sdk.ad.requestAd('rewarded', {
          adStarted: function () { if (cb.onOpen) cb.onOpen(); },
          adFinished: function () { if (cb.onRewarded) cb.onRewarded(); if (cb.onClose) cb.onClose(); },
          adError: err
        });
      } catch (e) { err(); }
    },
    hasCloud: function () { return !!(sdk && sdk.data); },
    saveData: function (obj) {
      if (!sdk || !sdk.data) return Promise.resolve(false);
      try { sdk.data.setItem(KEY, JSON.stringify(obj)); return Promise.resolve(true); } catch (e) { return Promise.resolve(false); }
    },
    loadData: function () {
      if (!sdk || !sdk.data) return Promise.resolve(null);
      try { var s = sdk.data.getItem(KEY); return Promise.resolve(s ? JSON.parse(s) : null); } catch (e) { return Promise.resolve(null); }
    },
    getLang: function () {
      try { return String((sdk && sdk.user && sdk.user.systemInfo && sdk.user.systemInfo.locale) || '').slice(0, 2); } catch (e) { return ''; }
    },
    onPause: function (fn) { pauseFns.push(fn); },
    onResume: function (fn) { resumeFns.push(fn); }
  };
})(window);
