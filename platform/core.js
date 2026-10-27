(function (w) {
  var P = new URLSearchParams(location.search);
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function withTimeout(p, ms, val) { return Promise.race([p, delay(ms).then(function () { return val; })]); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  w.PlatformUtil = { params: P, delay: delay, withTimeout: withTimeout, lsGet: lsGet, lsSet: lsSet };
  w.PLATFORM_CONFIG = w.PLATFORM_CONFIG || {};
})(window);
