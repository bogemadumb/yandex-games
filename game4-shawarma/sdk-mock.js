(function () {
  if (typeof window.YaGames !== 'undefined') return;
  var P = new URLSearchParams(location.search);
  var isLocal = location.protocol === 'file:' || /^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0)$/.test(location.hostname);
  var lang = (P.get('lang') || (navigator.language || 'en').slice(0, 2)).toLowerCase();
  var adMs = parseInt(P.get('adms') || '1200', 10);
  var KEY = 'mock_ysdk_cloud';

  function overlay(text, ms, done) {
    if (!isLocal) { setTimeout(function () { done(false); }, 0); return; }
    var d = document.createElement('div');
    d.id = 'mockad';
    d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#111;color:#fff;display:flex;align-items:center;justify-content:center;font:700 22px sans-serif;text-align:center';
    d.textContent = text;
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); done(true); }, ms);
  }

  var sdk = {
    isMock: true,
    environment: { i18n: { lang: lang }, app: { id: 'mock' } },
    features: {
      LoadingAPI: { ready: function () { window.__mockReady = true; } },
      GameplayAPI: {
        start: function () { window.__mockGp = true; },
        stop: function () { window.__mockGp = false; }
      }
    },
    adv: {
      showFullscreenAdv: function (o) {
        var cb = (o && o.callbacks) || {};
        window.__mockAds = (window.__mockAds || 0) + 1;
        if (cb.onOpen) cb.onOpen();
        overlay('MOCK FULLSCREEN AD', adMs, function (shown) {
          if (cb.onClose) cb.onClose(shown);
        });
      },
      showRewardedVideo: function (o) {
        var cb = (o && o.callbacks) || {};
        window.__mockRewarded = (window.__mockRewarded || 0) + 1;
        if (!isLocal) { if (cb.onError) cb.onError(new Error('no ads')); return; }
        if (cb.onOpen) cb.onOpen();
        overlay('MOCK REWARDED VIDEO', adMs, function () {
          if (cb.onRewarded) cb.onRewarded();
          if (cb.onClose) cb.onClose();
        });
      }
    },
    getPlayer: function () {
      return Promise.resolve({
        getMode: function () { return 'lite'; },
        getData: function () {
          try { return Promise.resolve(JSON.parse(localStorage.getItem(KEY) || '{}')); }
          catch (e) { return Promise.resolve({}); }
        },
        setData: function (d) {
          try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
          return Promise.resolve();
        }
      });
    },
    on: function () {}
  };

  window.YaGames = { init: function () { return Promise.resolve(sdk); } };
})();
