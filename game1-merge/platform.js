window.PLATFORM_CONFIG={"platform":"yandex","game":"game1-merge","storageId":"cgm"};
(function (w) {
  var P = new URLSearchParams(location.search);
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function withTimeout(p, ms, val) { return Promise.race([p, delay(ms).then(function () { return val; })]); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  w.PlatformUtil = { params: P, delay: delay, withTimeout: withTimeout, lsGet: lsGet, lsSet: lsSet };
  w.PLATFORM_CONFIG = w.PLATFORM_CONFIG || {};
})(window);

(function (w) {
  var ysdk = null, player = null;
  w.Platform = {
    name: 'yandex',
    init: function () {
      var p0 = (typeof YaGames !== 'undefined') ? YaGames.init() : Promise.reject(new Error('no sdk'));
      return p0.then(function (s) { ysdk = s; }, function () { ysdk = null; }).then(function () {
        if (!ysdk || !ysdk.getPlayer) return;
        return ysdk.getPlayer({ scopes: false }).then(function (pl) { player = pl; }).catch(function () {});
      });
    },
    ready: function () {
      try { if (ysdk && ysdk.features && ysdk.features.LoadingAPI) ysdk.features.LoadingAPI.ready(); } catch (e) {}
    },
    gameplayStart: function () {
      try { var g = ysdk && ysdk.features && ysdk.features.GameplayAPI; if (g) g.start(); } catch (e) {}
    },
    gameplayStop: function () {
      try { var g = ysdk && ysdk.features && ysdk.features.GameplayAPI; if (g) g.stop(); } catch (e) {}
    },
    showPreloader: function () { return Promise.resolve(false); },
    hasAds: function () { return !!(ysdk && ysdk.adv); },
    showInterstitial: function (cb) {
      cb = cb || {};
      var off = function () { if (cb.onError) cb.onError(); };
      ysdk.adv.showFullscreenAdv({ callbacks: { onOpen: cb.onOpen, onClose: cb.onClose, onError: off, onOffline: off } });
    },
    showRewarded: function (cb) {
      cb = cb || {};
      ysdk.adv.showRewardedVideo({ callbacks: { onOpen: cb.onOpen, onRewarded: cb.onRewarded, onClose: cb.onClose, onError: cb.onError } });
    },
    hasCloud: function () { return !!player; },
    saveData: function (obj) {
      if (!player) return Promise.resolve(false);
      try { var p = player.setData(obj, false); return p && p.then ? p.then(function () { return true; }) : Promise.resolve(true); }
      catch (e) { return Promise.resolve(false); }
    },
    loadData: function () {
      if (!player) return Promise.resolve(null);
      return player.getData().catch(function () { return null; });
    },
    getLang: function () {
      return (ysdk && ysdk.environment && ysdk.environment.i18n && ysdk.environment.i18n.lang) || '';
    },
    onPause: function (fn) { try { if (ysdk && ysdk.on) ysdk.on('game_api_pause', fn); } catch (e) {} },
    onResume: function (fn) { try { if (ysdk && ysdk.on) ysdk.on('game_api_resume', fn); } catch (e) {} }
  };
})(window);
