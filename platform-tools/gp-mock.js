(function () {
  var P = new URLSearchParams(location.search);
  var mode = P.get('gpmode') || 'ok';
  var adMs = parseInt(P.get('adms') || '300', 10);
  var KEY = 'mock_ysdk_cloud';
  var L = window.__gpLog = [];
  var handlers = {};
  function log(s) { L.push(s); }
  function emit(ev, a) { (handlers[ev] || []).forEach(function (f) { f(a); }); }
  function overlay(text, ms) {
    return new Promise(function (res) {
      var d = document.createElement('div');
      d.className = 'mockgpad';
      d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#111;color:#fff;display:flex;align-items:center;justify-content:center;font:700 22px sans-serif';
      d.textContent = text; document.body.appendChild(d);
      setTimeout(function () { d.remove(); res(); }, ms);
    });
  }
  var ads = {
    isPreloaderAvailable: mode !== 'unavail',
    on: function (ev, f) { (handlers[ev] = handlers[ev] || []).push(f); },
    showPreloader: function () {
      window.__gpPreCalls = (window.__gpPreCalls || 0) + 1;
      log('pre:call');
      if (mode === 'reject') return Promise.reject(new Error('no fill'));
      emit('preloader:start'); log('pre:start');
      if (mode === 'hang') return new Promise(function () {});
      var ms = mode === 'slow' ? 2500 : adMs;
      return overlay('MOCK PRELOADER', ms).then(function () { emit('preloader:close', true); log('pre:close'); return true; });
    },
    showFullscreen: function () {
      window.__mockAds = (window.__mockAds || 0) + 1; emit('fullscreen:start');
      return overlay('MOCK FULLSCREEN', adMs).then(function () { emit('fullscreen:close', true); return true; });
    },
    showRewardedVideo: function () {
      window.__mockRewarded = (window.__mockRewarded || 0) + 1; emit('rewarded:start');
      return overlay('MOCK REWARDED', adMs).then(function () { emit('rewarded:close', true); return true; });
    }
  };
  var store = {}; try { store = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  var gp = {
    isMock: true,
    language: (P.get('lang') || 'en').slice(0, 2),
    ads: ads,
    on: function (ev, f) { (handlers[ev] = handlers[ev] || []).push(f); },
    player: {
      ready: Promise.resolve(),
      get: function (k) { return store[k]; },
      set: function (k, v) { store[k] = v; },
      sync: function () { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} return Promise.resolve(); }
    },
    gameStart: function () { window.__mockReady = true; log('gameStart'); },
    gameplayStart: function () { window.__mockGp = true; log('gameplayStart'); },
    gameplayStop: function () { window.__mockGp = false; }
  };
  window.__gpMock = gp;
})();
