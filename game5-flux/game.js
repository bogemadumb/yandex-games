(function () {
  'use strict';
  var D = window.Draw, Sim = window.Sim, Gen = window.Gen, FX = window.FX, Scene = window.Scene, Snd = window.Snd, I = window.I18N;
  var W = Sim.W, H = Sim.H, TAU = 6.283185, DBG = new URLSearchParams(location.search).has('debug');
  var PARAMS = new URLSearchParams(location.search);
  var LEVELS = window.LEVELS || [], NLV = LEVELS.length, PER = 6, NW = Math.ceil(NLV / PER);
  var SAVE_KEY = 'flux_v1', HINT_COST = 20, AD_GAP = 90000;
  var cv = document.getElementById('c'), cx = cv.getContext('2d');
  function now() { return performance.now(); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function t(k, a) { return I.t(k, a); }

  // ---------- save ----------
  var S, lastCloudAt = 0;
  function defaults() { return { v: 1, savedAt: 0, st: {}, sp: 0, skin: 0, own: [0], snd: 1, lang: '', daily: { d: 0, done: 0, streak: 0, last: 0 }, lab: { best: 0, runs: 0 }, played: 0, ads: 0 }; }
  function sane(d) {
    if (!d || typeof d !== 'object' || d.v !== 1) return null;
    var b = defaults(); for (var k in b) if (d[k] == null) d[k] = b[k];
    if (typeof d.st !== 'object') d.st = {};
    d.sp = Math.max(0, Math.floor(d.sp) || 0); d.skin = clamp(Math.floor(d.skin) || 0, 0, FX.SKINS.length - 1);
    if (!Array.isArray(d.own)) d.own = [0];
    return d;
  }
  function saveLocal() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
  function save(force) {
    S.savedAt = Date.now(); saveLocal();
    var n = Date.now();
    if (Platform.hasCloud() && (force || n - lastCloudAt > 15000)) {
      lastCloudAt = n;
      try { var p = Platform.saveData({ save: S }); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    }
  }
  function readLocal() { try { var s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function loadState(cloud) {
    var c = [], a = sane(readLocal()), b = cloud && cloud.save ? sane(cloud.save) : null;
    if (a) c.push(a); if (b) c.push(b);
    c.sort(function (x, y) { return y.savedAt - x.savedAt; });
    var r = c[0] || defaults();
    if (a && b) { for (var k in b.st) if ((r.st[k] || 0) < b.st[k]) r.st[k] = b.st[k]; r.sp = Math.max(a.sp, b.sp); }
    return r;
  }
  function starsOf(id) { return S.st[id] == null ? -1 : S.st[id]; }
  function totalStars() { var n = 0; for (var k in S.st) n += Math.max(0, S.st[k]); return n; }
  function maxDone() { var m = 0; for (var k in S.st) if (S.st[k] >= 0) m = Math.max(m, +k); return m; }
  function gate(wd) { return Math.round((wd - 1) * 6.3); }
  function worldOf(id) { return Math.floor((id - 1) / PER) + 1; }
  function unlocked(id) { return id <= maxDone() + 1 && totalStars() >= gate(worldOf(id)); }

  // ---------- layout ----------
  var cw = 0, ch = 0, dpr = 1, U = 1, land = false, LY = {};
  var bgCache = null, bgKey = '';
  function resize() {
    dpr = Math.min(2.5, window.devicePixelRatio || 1);
    cw = window.innerWidth; ch = window.innerHeight;
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
    U = clamp(Math.min(cw, ch) / 400, 0.82, 1.55); land = cw / ch > 1.2;
    bgKey = ''; layout();
  }
  function layout() {
    var topH = 58 * U, pad = 10 * U, tray;
    var invN = L ? L.inv.length : 3;
    var fs, fxp, fyp;
    if (!land) {
      var trH = 112 * U, gapT = 8 * U;
      fs = Math.min((cw - pad * 2) / W, (ch - topH - trH - gapT - pad * 2) / H);
      var fh = H * fs, gh = fh + gapT + trH, y0 = topH + Math.max(pad, (ch - topH - gh) / 2);
      fxp = (cw - W * fs) / 2; fyp = y0;
      tray = { x: Math.max(0, (cw - Math.max(W * fs, Math.min(cw, 520 * U))) / 2), y: y0 + fh + gapT, w: Math.max(W * fs, Math.min(cw, 520 * U)), h: trH };
      if (tray.y + tray.h > ch - 4) tray.y = ch - tray.h - 4;
    } else {
      var trW = 132 * U;
      fs = Math.min((cw - trW - pad * 3) / H, (ch - topH - pad * 2) / W);
      var gw = H * fs + 10 * U + trW, x0 = Math.max(pad, (cw - gw) / 2);
      fxp = x0; fyp = topH + (ch - topH - W * fs) / 2;
      tray = { x: x0 + H * fs + 10 * U, y: fyp, w: trW, h: Math.max(W * fs, 400 * U) };
      if (tray.h > ch - topH - pad) tray.h = ch - topH - pad;
    }
    LY = { topH: topH, tray: tray, fs: fs, fx: fxp, fy: fyp, pad: pad, tp: land };
    var sr = 27 * U, slots = [], i;
    if (!land) {
      var cxs = tray.x + tray.w * 0.38, gap = 64 * U, x0s = cxs - (invN - 1) * gap / 2;
      for (i = 0; i < invN; i++) slots.push({ x: x0s + i * gap, y: tray.y + tray.h * 0.5, r: sr });
      LY.launch = { x: tray.x + tray.w - 52 * U, y: tray.y + tray.h * 0.5, r: 33 * U };
      LY.hint = { x: tray.x + 34 * U, y: tray.y + tray.h * 0.5, r: 22 * U };
      if (LY.hint.x + LY.hint.r + 10 > slots[0].x - sr) { var sh = LY.hint.x + LY.hint.r + 12 + sr - slots[0].x; for (i = 0; i < slots.length; i++) slots[i].x += sh; }
    } else {
      var cys = tray.y + tray.h * 0.36, gap2 = 62 * U, y0s = cys - (invN - 1) * gap2 / 2;
      for (i = 0; i < invN; i++) slots.push({ x: tray.x + tray.w / 2, y: y0s + i * gap2, r: sr });
      LY.launch = { x: tray.x + tray.w / 2, y: tray.y + tray.h - 56 * U, r: 33 * U };
      LY.hint = { x: tray.x + tray.w / 2, y: tray.y + tray.h - 122 * U, r: 22 * U };
    }
    LY.slots = slots;
  }
  function toScr(x, y) { return LY.tp ? [LY.fx + y * LY.fs, LY.fy + x * LY.fs] : [LY.fx + x * LY.fs, LY.fy + y * LY.fs]; }
  function toWorld(px, py) { return LY.tp ? [(py - LY.fy) / LY.fs, (px - LY.fx) / LY.fs] : [(px - LY.fx) / LY.fs, (py - LY.fy) / LY.fs]; }
  function sx(x, y) { return toScr(x, y)[0]; }
  function sy(x, y) { return toScr(x, y)[1]; }

  // ---------- state ----------
  var scr = 'menu', mode = 'camp', T = 0, paused = false, started = false;
  var L = null, lvId = 1, placed = [], pv = null, st = 'edit', run = null, drag = null, hinted = [], fails = 0, idleT = 0, launched = 0;
  var modal = null, failT = 0, winT = 0, lastAdAt = 0, sinceAd = 0, adActive = false, adOv = null, gpOn = false, toastS = '', toastT = 0;
  var fuses = 3, labN = 0, labSeed = 0, dailyLevel = null, tutHandT = 0, lvT = 0, fadeA = 0;
  var scroll = { y: 0, v: 0, max: 0, drag: false, moved: 0 }, btns = [], ptr = { x: -99, y: -99, down: false, id: -1, type: 'mouse' }, pressed = null;
  var bumpFlash = [], menuSpark = null, shopMsg = 0;

  function buzz(ms) { try { if (S && S.snd && navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
  function toast(s) { toastS = s; toastT = 1.8; }

  // ---------- ads ----------
  function updGP() {
    var want = started && scr === 'play' && !modal && !adActive && !document.hidden && !paused && (st === 'edit' || st === 'run');
    if (want === gpOn) return; gpOn = want;
    try { if (want) Platform.gameplayStart(); else Platform.gameplayStop(); } catch (e) {}
  }
  function adStart() { if (adActive) return; adActive = true; paused = true; Snd.setAd(true); updGP(); }
  function adEnd() { if (!adActive) return; adActive = false; paused = false; lastAdAt = Date.now(); sinceAd = 0; Snd.setAd(false); adOv = null; updGP(); }
  function canInterstitial() { return Platform.hasAds() && !adActive && sinceAd >= 2 && Date.now() - lastAdAt >= AD_GAP; }
  function breakpoint(cb) {
    var done = false; function fin() { if (done) return; done = true; if (cb) cb(); }
    if (!canInterstitial()) { fin(); return; }
    adOv = { text: t('adSoon') };
    setTimeout(function () {
      if (!Platform.hasAds() || adActive) { adOv = null; fin(); return; }
      try {
        Platform.showInterstitial({
          onOpen: function () { adStart(); },
          onClose: function () { adEnd(); fin(); },
          onError: function () { adOv = null; lastAdAt = Date.now(); adEnd(); fin(); }
        });
      } catch (e) { adOv = null; lastAdAt = Date.now(); fin(); }
    }, 1200);
  }
  function rewarded(onOk) {
    if (!Platform.hasAds() || adActive) { toast(t('adFail')); return; }
    var got = false;
    try {
      Platform.showRewarded({
        onOpen: function () { adStart(); },
        onRewarded: function () { got = true; },
        onClose: function () { var g = got; adEnd(); if (g) onOk(); else toast(t('noReward')); },
        onError: function () { adEnd(); toast(t('adFail')); }
      });
    } catch (e) { adEnd(); toast(t('adFail')); }
  }

  // ---------- level control ----------
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function setLevel(lv) {
    L = clone(lv); L.w = W; L.h = H; placed = []; hinted = []; fails = 0; idleT = 0; launched = 0; st = 'edit'; run = null; drag = null; modal = null;
    bumpFlash = (L.bump || []).map(function () { return 0; });
    FX.clear(); FX.dustInit(240); layout(); recompute(); lvT = 0; fadeA = 0.6;
    bgKey = ''; updGP();
  }
  function startCamp(id) {
    id = clamp(id, 1, NLV); lvId = id; mode = 'camp'; scr = 'play';
    setLevel(LEVELS[id - 1]); Snd.click();
  }
  function genWithFallback(seed, spec) {
    for (var k = 0; k < 12; k++) { var g = Gen.gen(seed + k * 101, spec); if (g) return g; }
    return null;
  }
  function labSpec(n, rng) {
    var tot = Math.min(5, 1 + Math.floor(n / 3)), nA = Math.max(1, Math.ceil(tot * (0.4 + rng() * 0.3))), nR = tot - nA;
    var sp = { world: 1 + (n % 8), nA: nA, nR: nR, haz: Math.min(5, 1 + Math.floor(n / 2)), rect: 0.5, minTurn: 40 + n * 12, prev: n < 3 ? 2 : (n < 9 ? 1 : 0), minLen: 700 };
    if (n >= 2 && rng() < 0.4) sp.fixedA = 1;
    if (n >= 3 && rng() < 0.35) sp.fixedR = 1;
    if (n >= 5 && (sp.fixedA || sp.fixedR) && rng() < 0.4) sp.orbit = 1;
    if (n >= 4 && rng() < 0.3) { sp.bounce = true; sp.bump = 1 + Math.floor(rng() * 2); }
    if (n >= 6 && rng() < 0.3) { sp.portals = 1; sp.minLen = 900; }
    return sp;
  }
  var labNext = null;
  function labBuild(n) {
    var rng = Sim.mulberry(labSeed + n * 17), g = genWithFallback(labSeed * 3 + n * 977, labSpec(n, rng));
    return g || clone(LEVELS[Math.min(NLV - 1, n)]);
  }
  function startLab(reset) {
    mode = 'lab'; scr = 'play';
    if (reset) { labN = 0; fuses = 3; labSeed = (Date.now() % 1000000) | 0; S.lab.runs++; }
    var g = (labNext && labNext.n === labN && labNext.seed === labSeed) ? labNext.g : labBuild(labN);
    labNext = null; setLevel(g); Snd.click();
  }
  function dayNum() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); }
  function startDaily() {
    var d = dayNum(); mode = 'daily'; scr = 'play';
    var rng = Sim.mulberry(d * 131 + 7), tot = 3 + Math.floor(rng() * 2);
    var sp = { world: 1 + (d % 8), nA: Math.ceil(tot / 2), nR: Math.floor(tot / 2), haz: 4, rect: 0.5, minTurn: 160, prev: 1, fixedA: rng() < 0.6 ? 1 : 0, fixedR: rng() < 0.5 ? 1 : 0 };
    if (rng() < 0.4) { sp.bounce = true; sp.bump = 2; }
    if (rng() < 0.35) sp.portals = 1;
    if (sp.fixedA && rng() < 0.4) sp.orbit = 1;
    var g = genWithFallback(d * 7919 + 11, sp) || clone(LEVELS[d % NLV]);
    setLevel(g); Snd.click();
  }
  function usedInv() {
    var used = {}; placed.forEach(function (p) { used[p.slot] = 1; }); return used;
  }
  function recompute() {
    var pl = placed.map(function (p) { return { t: p.t, x: p.x, y: p.y, k: 1 }; });
    pv = Sim.simulate(L, pl, { rec: 3 });
  }
  function chargesNow(tt) {
    var out = [];
    if (!L) return out;
    L.fixed.forEach(function (c) { var p = Sim.pos(c, tt || 0); out.push({ t: c.t, x: p[0], y: p[1], k: c.k || 1 }); });
    placed.forEach(function (p) { out.push({ t: p.t, x: p.x, y: p.y, k: 1 }); });
    return out;
  }
  function shapeD(h, x, y) { return h.t === 'c' ? Math.sqrt((x - h.x) * (x - h.x) + (y - h.y) * (y - h.y)) - h.r : Sim.rectDist(h, x, y); }
  function validPos(x, y, ignoreIdx) {
    if (x < 55 || x > W - 55 || y < 70 || y > H - 70) return false;
    var i, c;
    for (i = 0; i < L.fixed.length; i++) { c = L.fixed[i]; if (Math.hypot2(c.x - x, c.y - y) < 80) return false; }
    for (i = 0; i < placed.length; i++) if (i !== ignoreIdx && Math.hypot2(placed[i].x - x, placed[i].y - y) < 80) return false;
    for (i = 0; i < L.haz.length; i++) if (shapeD(L.haz[i], x, y) < 30) return false;
    for (i = 0; i < L.bump.length; i++) if (Math.hypot2(L.bump[i].x - x, L.bump[i].y - y) < L.bump[i].r + 34) return false;
    for (i = 0; i < L.portals.length; i++) { var q = L.portals[i]; if (Math.hypot2(q.a.x - x, q.a.y - y) < 55 || Math.hypot2(q.b.x - x, q.b.y - y) < 55) return false; }
    if (Math.hypot2(L.goal.x - x, L.goal.y - y) < 62 || Math.hypot2(L.em.x - x, L.em.y - y) < 78) return false;
    return true;
  }
  Math.hypot2 = function (a, b) { return Math.sqrt(a * a + b * b); };

  // ---------- run ----------
  function launch() {
    if (st !== 'edit' || modal) return;
    var pl = placed.map(function (p) { return { t: p.t, x: p.x, y: p.y, k: 1 }; });
    var r = Sim.simulate(L, pl, {});
    run = { res: r, path: r.path, n: r.path.length / 2, t: 0, trail: [], got: 0, took: r.stars.map(function () { return false; }), hx: L.em.x, hy: L.em.y, last: null };
    st = 'run'; launched++; idleT = 0;
    Snd.launch(); FX.ring(L.em.x, L.em.y, '255,255,255', 70, 0.5);
    FX.burst(L.em.x, L.em.y, 10, { sp: 120, size: 3, life: 0.5, c: '255,255,255' });
    updGP();
  }
  function stopRun() {
    st = 'edit'; run = null; recompute(); updGP();
  }
  function stepRun(dt) {
    var r = run, res = r.res, remain = (r.n - 1) / 60 - r.t, sc = 1;
    if (res.end === 'goal' && remain < 0.5) sc = 0.4;
    r.t += dt * sc * 1.2;
    var f = r.t * 60, i = Math.floor(f), fr = f - i, n = r.n;
    if (i >= n - 1) { i = n - 1; fr = 0; }
    var j = Math.min(n - 1, i + 1);
    var ax = r.path[i * 2], ay = r.path[i * 2 + 1], bx = r.path[j * 2], by = r.path[j * 2 + 1];
    var jump = Math.abs(bx - ax) + Math.abs(by - ay) > 90;
    var x = ax + (bx - ax) * fr, y = ay + (by - ay) * fr;
    if (jump && fr > 0.5) { x = bx; y = by; }
    var px = r.hx, py = r.hy; r.hx = x; r.hy = y;
    if (jump && r.last !== i) { r.trail.length = 0; Snd.portal(); FX.ring(ax, ay, '190,130,255', 60, 0.5); FX.ring(bx, by, '190,130,255', 60, 0.5); FX.burst(bx, by, 12, { c: '200,150,255', sp: 160, size: 3, life: 0.6 }); }
    r.last = i;
    var vx = (x - px) / Math.max(dt, 0.001), vy = (y - py) / Math.max(dt, 0.001);
    if (!jump) FX.emitTrailFx(x, y, S.skin, vx, vy);
    r.trail.push({ x: x, y: y, a: 0 });
    for (var k = r.trail.length - 1; k >= 0; k--) { r.trail[k].a += dt; if (r.trail[k].a > 1.1) { r.trail.splice(0, k + 1); break; } }
    for (k = 0; k < res.stars.length; k++) if (res.stars[k] !== false && !r.took[k] && r.t >= res.stars[k] * Sim.DT) {
      r.took[k] = true; r.got++;
      var s = L.stars[k]; FX.burst(s.x, s.y, 22, { c: '255,226,120', sp: 220, size: 4.5, life: 0.8, k: 't' }); FX.ring(s.x, s.y, '255,226,120', 70, 0.6); Snd.star(r.got - 1); FX.shake(2);
    }
    for (k = 0; k < L.bump.length; k++) {
      var b = L.bump[k], d = Math.hypot2(x - b.x, y - b.y);
      if (d < b.r + 18 && bumpFlash[k] < 0.3) { bumpFlash[k] = 1; Snd.bump(); FX.burst(x, y, 6, { c: '200,225,255', sp: 120, size: 3, life: 0.4 }); }
    }
    if (L.bounce && (x < 14 || x > W - 14 || y < 14 || y > H - 14)) { if (!r.edgeT || T - r.edgeT > 0.2) { r.edgeT = T; Snd.bump(); FX.burst(x, y, 6, { c: '200,225,255', sp: 100, size: 3, life: 0.4 }); } }
    if (i >= n - 1) endRun();
  }
  function endRun() {
    var r = run, res = r.res;
    if (res.end === 'goal') {
      FX.burst(L.goal.x, L.goal.y, 46, { c: '255,215,100', sp: 330, size: 5, life: 1, k: 't' });
      FX.burst(L.goal.x, L.goal.y, 30, { c: '255,255,255', sp: 210, size: 3, life: 0.9 });
      FX.ring(L.goal.x, L.goal.y, '255,215,100', 160, 0.9); FX.ring(L.goal.x, L.goal.y, '255,255,255', 110, 0.7);
      FX.shake(7); Snd.win(); buzz(40); st = 'won'; winT = 0; onWin(r.got);
    } else {
      var col = res.end === 'absorb' ? '56,240,214' : '255,70,100';
      FX.burst(res.x, res.y, 34, { c: col, sp: 260, size: 4, life: 0.8 }); FX.ring(res.x, res.y, col, 90, 0.6);
      FX.shake(res.end === 'hit' ? 9 : 5); buzz(25); if (res.end === 'absorb') Snd.absorb(); else Snd.fail();
      st = 'fail'; failT = 0; fails++;
      if (mode === 'lab') { fuses--; }
    }
    updGP();
  }
  function onWin(got) {
    var rewardBase, first = false, bonus = 0;
    if (mode === 'camp') {
      var old = starsOf(lvId); first = old < 0;
      S.st[lvId] = Math.max(old, got);
      rewardBase = 6 + got * 6 + (first ? 10 : 0);
    } else if (mode === 'lab') {
      labN++; rewardBase = 4 + Math.min(labN, 12) * 2; S.lab.best = Math.max(S.lab.best, labN);
      (function (n, sd) { setTimeout(function () { try { labNext = { n: n, seed: sd, g: labBuild(n) }; } catch (e) {} }, 60); })(labN, labSeed);
    } else {
      var d = dayNum();
      if (S.daily.d !== d || !S.daily.done) {
        var cont = S.daily.last === d - 1; S.daily.streak = cont ? S.daily.streak + 1 : 1; S.daily.last = d; S.daily.d = d; S.daily.done = 1;
        rewardBase = Math.min(100, 30 + S.daily.streak * 8) + got * 5; first = true;
      } else rewardBase = 0;
    }
    S.sp += rewardBase; S.played++; sinceAd++;
    save(true);
    modal = { kind: 'win', t: 0, got: got, reward: rewardBase, doubled: false, first: first, delay: 0.9 };
  }

  // ---------- hints ----------
  function hintFree() { return !!L && hinted.length < L.sol.length; }
  function doHint() {
    if (!hintFree() || st !== 'edit') return;
    var apply = function () {
      var used = {}, i; hinted.forEach(function (h) { used[h] = 1; });
      for (i = 0; i < L.sol.length; i++) if (!used[i]) { hinted.push(i); break; }
      Snd.buy(); toast(t('hint'));
    };
    if (S.sp >= HINT_COST) { S.sp -= HINT_COST; save(); apply(); }
    else rewarded(apply);
  }

  // ---------- buttons / input ----------
  function addBtn(id, x, y, w, h, fn, round) {
    var b = { id: id, x: x, y: y, w: w, h: h, fn: fn, round: round };
    btns.push(b);
    return pressed && pressed.id === id && ptr.down && hit(b, ptr.x, ptr.y);
  }
  function hit(b, px, py) {
    if (b.round) { var cxx = b.x + b.w / 2, cyy = b.y + b.h / 2, r = b.w / 2 + 4; return Math.hypot2(px - cxx, py - cyy) <= r; }
    return px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
  }
  function topBtn(px, py) { for (var i = btns.length - 1; i >= 0; i--) if (hit(btns[i], px, py)) return btns[i]; return null; }
  function onDown(e) {
    Snd.unlock(); if (adOv || adActive) return;
    if (paused && !adActive) { paused = false; return; }
    var rect = cv.getBoundingClientRect();
    ptr.x = e.clientX - rect.left; ptr.y = e.clientY - rect.top; ptr.down = true; ptr.id = e.pointerId; ptr.type = e.pointerType || 'mouse';
    try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    var b = topBtn(ptr.x, ptr.y);
    scroll.moved = 0; scroll.drag = false; scroll.lx = ptr.y; scroll.v = 0;
    if (b) { pressed = b; return; }
    pressed = null;
    if (scr === 'play' && !modal && st === 'edit') startDrag();
    else if (scr === 'map' || scr === 'skins') scroll.drag = true;
    else if (scr === 'play' && !modal && st === 'run') { /* tap during run: ignore */ }
  }
  function onMove(e) {
    var rect = cv.getBoundingClientRect();
    ptr.x = e.clientX - rect.left; ptr.y = e.clientY - rect.top;
    if (!ptr.down) return;
    if (scroll.drag) { var dy = ptr.y - scroll.lx; scroll.lx = ptr.y; scroll.y -= dy; scroll.v = -dy; scroll.moved += Math.abs(dy); clampScroll(); }
    else if (pressed && (scr === 'map' || scr === 'skins')) {
      scroll.moved += Math.abs(ptr.y - (scroll.lx == null ? ptr.y : scroll.lx));
      var dy2 = ptr.y - scroll.lx; scroll.lx = ptr.y;
      if (scroll.moved > 10 * U) { pressed = null; scroll.drag = true; }
      else { scroll.y -= 0; }
    }
    if (drag) moveDrag();
  }
  function onUp(e) {
    if (!ptr.down) return;
    var rect = cv.getBoundingClientRect();
    ptr.x = e.clientX - rect.left; ptr.y = e.clientY - rect.top; ptr.down = false;
    if (drag) { endDrag(); }
    else if (pressed) {
      var b = pressed; pressed = null;
      if (hit(b, ptr.x, ptr.y) && !adActive) { try { b.fn(); } catch (er) { if (window.console) console.warn(er); } }
    }
    scroll.drag = false;
  }
  function clampScroll() { scroll.y = clamp(scroll.y, 0, Math.max(0, scroll.max)); }

  function slotAt(px, py) {
    for (var i = 0; i < LY.slots.length; i++) { var s = LY.slots[i]; if (Math.hypot2(px - s.x, py - s.y) <= s.r + 12 * U) return i; }
    return -1;
  }
  function placedAt(px, py) {
    var pw = toWorld(px, py), X = pw[0], Y = pw[1], best = -1, bd = 1e9;
    for (var i = 0; i < placed.length; i++) { var d = Math.hypot2(placed[i].x - X, placed[i].y - Y) * LY.fs; if (d < Math.max(34, 30 * U) && d < bd) { bd = d; best = i; } }
    return best;
  }
  function startDrag() {
    idleT = 0;
    var si = slotAt(ptr.x, ptr.y);
    if (si >= 0 && !usedInv()[si]) {
      drag = { src: 'slot', slot: si, t: L.inv[si], x: 0, y: 0, valid: false, off: 0 };
      Snd.grab(drag.t); moveDrag(); return;
    }
    var pi = placedAt(ptr.x, ptr.y);
    if (pi >= 0) {
      var p = placed[pi];
      drag = { src: 'placed', idx: pi, slot: p.slot, t: p.t, x: p.x, y: p.y, ox: p.x, oy: p.y, valid: true, off: 0 };
      placed.splice(pi, 1); Snd.grab(drag.t); moveDrag(); return;
    }
    var pe = toWorld(ptr.x, ptr.y), ex = Math.hypot2(pe[0] - L.em.x, pe[1] - L.em.y);
    if (ex < 60) { launch(); }
  }
  function moveDrag() {
    var off = ptr.type === 'touch' ? 60 * U : 0, pw = toWorld(ptr.x, ptr.y - off), pf = toWorld(ptr.x, ptr.y);
    drag.x = pw[0]; drag.y = pw[1]; drag.fx = pf[0]; drag.fy = pf[1]; drag.off = off;
    var inField = drag.x > -30 && drag.x < W + 30 && drag.y > -30 && drag.y < H + 30;
    drag.valid = inField && validPos(drag.x, drag.y, -1);
    drag.overTray = ptr.x >= LY.tray.x && ptr.y >= LY.tray.y;
    var tmp = placed.slice();
    if (drag.valid) { placed.push({ t: drag.t, x: drag.x, y: drag.y, slot: drag.slot }); }
    recompute(); placed = tmp;
  }
  function endDrag() {
    var d = drag; drag = null;
    if (d.valid && !d.overTray) {
      placed.push({ t: d.t, x: Math.round(d.x * 10) / 10, y: Math.round(d.y * 10) / 10, slot: d.slot });
      Snd.drop(d.t); FX.ring(d.x, d.y, d.t === 'a' ? '56,240,214' : '255,92,124', 70, 0.5);
      FX.burst(d.x, d.y, 8, { c: d.t === 'a' ? '56,240,214' : '255,92,124', sp: 110, size: 3, life: 0.5 });
    } else if (d.src === 'placed' && !d.overTray && d.ox != null && validPos(d.ox, d.oy, -1)) {
      placed.push({ t: d.t, x: d.ox, y: d.oy, slot: d.slot }); Snd.deny();
    } else { if (d.src === 'placed') Snd.remove(); else Snd.deny(); }
    recompute();
  }
  function onKey(e) {
    if (e.repeat) return;
    var c = e.code;
    if (scr === 'play' && !modal) {
      if (c === 'Space' || c === 'Enter') { if (st === 'edit') launch(); e.preventDefault(); }
      else if (c === 'KeyR') clearAll();
      else if (c === 'KeyH') doHint();
      else if (c === 'Escape') goBack();
    } else if (c === 'Escape' && scr !== 'menu') goBack();
    else if (modal && (c === 'Space' || c === 'Enter') && modal.kind === 'win') modalNext();
  }
  function clearAll() { if (st !== 'edit') return; if (placed.length) { placed = []; recompute(); Snd.remove(); } }
  function goBack() {
    Snd.back();
    if (scr === 'play') { if (mode === 'camp') { openMap(); } else openMenu(); }
    else openMenu();
  }
  function openMenu() { fadeA = 0.6; scr = 'menu'; modal = null; run = null; st = 'edit'; L = null; updGP(); bgKey = ''; layout(); initMenuSpark(); }
  function openMap() {
    scr = 'map'; fadeA = 0.6; modal = null; run = null; L = null; updGP(); bgKey = '';
    var id = Math.min(NLV, maxDone() + 1), rowsBefore = Math.floor((worldOf(id) - 1)), pos = rowsBefore * mapBlockH() - 40 * U;
    scroll.y = Math.max(0, pos); scroll.v = 0; mapFocus = true;
  }
  var mapFocus = false;
  function openSkins() { fadeA = 0.5; scr = 'skins'; modal = null; scroll.y = 0; bgKey = ''; }

  // ---------- modals ----------
  function modalNext() {
    var m = modal; if (!m) return; Snd.click();
    if (mode === 'camp') {
      var nid = lvId + 1;
      modal = null;
      if (nid > NLV) { openMenu(); return; }
      if (!unlocked(nid)) { openMap(); return; }
      breakpoint(function () { startCamp(nid); });
    } else if (mode === 'lab') { modal = null; breakpoint(function () { startLab(false); }); }
    else { modal = null; openMenu(); }
  }
  function modalDouble() {
    var m = modal; if (!m || m.doubled || !m.reward) return;
    rewarded(function () { S.sp += m.reward; m.doubled = true; save(true); Snd.coin();  });
  }

  // ---------- skip / revive ----------
  function skipLevel() {
    if (mode !== 'camp' || st !== 'edit') return;
    rewarded(function () {
      if (starsOf(lvId) < 0) S.st[lvId] = 0; save(true);
      var nid = lvId + 1; if (nid > NLV) { openMenu(); return; } if (!unlocked(nid)) { openMap(); return; } startCamp(nid);
    });
  }
  function reviveLab() {
    rewarded(function () { fuses = 1; modal = null; st = 'edit'; recompute(); updGP(); Snd.buy(); });
  }

  // ---------- update ----------
  var lastFrame = now();
  function update(dt) {
    T += dt; lvT += dt;
    if (toastT > 0) toastT -= dt;
    if (fadeA > 0) fadeA = Math.max(0, fadeA - dt * 2.2);
    FX.update(dt);
    if (scr === 'play' && L) {
      idleT += dt;
      var cs = chargesNow(st === 'run' && run ? run.t : 0);
      FX.dustUpdate(dt, cs);
      for (var i = 0; i < bumpFlash.length; i++) bumpFlash[i] = Math.max(0, bumpFlash[i] - dt * 4);
      if (st === 'run' && run) stepRun(dt);
      else if (st === 'fail') {
        failT += dt;
        if (run) { for (var k = run.trail.length - 1; k >= 0; k--) { run.trail[k].a += dt * 1.4; if (run.trail[k].a > 1.1) run.trail.splice(k, 1); } }
        if (failT > 0.85) {
          if (mode === 'lab' && fuses <= 0) { st = 'over'; modal = { kind: 'over', t: 0, delay: 0.1, score: labN }; S.lab.best = Math.max(S.lab.best, labN); save(true); updGP(); }
          else { stopRun(); }
        }
      } else if (st === 'won') {
        winT += dt;
        if (run) for (var k2 = run.trail.length - 1; k2 >= 0; k2--) { run.trail[k2].a += dt * 1.2; if (run.trail[k2].a > 1.1) run.trail.splice(k2, 1); }
      }
      if (modal) modal.t += dt;
    } else if (scr === 'menu') {
      menuUpdate(dt);
    } else {
      menuUpdateDust(dt);
    }
    if (scr === 'map' || scr === 'skins') {
      if (!scroll.drag && Math.abs(scroll.v) > 0.05) { scroll.y += scroll.v; scroll.v *= Math.pow(0.02, dt); clampScroll(); }
    }
  }

  // ---------- menu background ----------
  var menuCh = [];
  function initMenuSpark() {
    menuCh = [{ t: 'a', x: W * 0.36, y: H * 0.86, k: 1 }, { t: 'r', x: W * 0.68, y: H * 0.74, k: 1.2 }, { t: 'a', x: W * 0.52, y: H * 0.2, k: 0.8 }];
    FX.dustInit(240); menuSpark = null; menuTrail = [];
  }
  var menuTrail = [];
  function menuUpdateDust(dt) { if (!menuCh.length) initMenuSpark(); FX.dustUpdate(dt, menuCh); }
  function menuUpdate(dt) {
    menuUpdateDust(dt);
    if (!menuSpark || menuSpark.dead) {
      var ang = Math.random() * TAU, rr = 560;
      menuSpark = { x: W / 2 + Math.cos(ang) * rr, y: H / 2 + Math.sin(ang) * rr, vx: -Math.cos(ang + 0.5) * 180, vy: -Math.sin(ang + 0.5) * 180, life: 0 };
      menuTrail = [];
    }
    var m = menuSpark, steps = Math.round(dt / Sim.DT), ax = 0, ay = 0;
    for (var s = 0; s < steps; s++) {
      ax = 0; ay = 0;
      for (var i = 0; i < menuCh.length; i++) {
        var c = menuCh[i], dx = c.x - m.x, dy = c.y - m.y, r2 = dx * dx + dy * dy, f = (c.t === 'a' ? 1 : -1) * 32000 * c.k / (r2 + 1764);
        ax += f * dx; ay += f * dy;
        if (c.t === 'a' && r2 < 400) { m.dead = true; FX.burst(m.x, m.y, 20, { c: '56,240,214', sp: 180, size: 3.5, life: 0.7 }); FX.ring(m.x, m.y, '56,240,214', 70, 0.6); }
      }
      m.vx += ax * Sim.DT; m.vy += ay * Sim.DT;
      var sp = Math.sqrt(m.vx * m.vx + m.vy * m.vy); if (sp > 520) { m.vx *= 520 / sp; m.vy *= 520 / sp; }
      m.x += m.vx * Sim.DT; m.y += m.vy * Sim.DT;
    }
    m.life += dt; if (m.life > 14 || m.x < -300 || m.x > W + 300 || m.y < -300 || m.y > H + 300) m.dead = true;
    menuTrail.push({ x: m.x, y: m.y, a: 0 });
    for (var k = menuTrail.length - 1; k >= 0; k--) { menuTrail[k].a += dt; if (menuTrail[k].a > 1.1) { menuTrail.splice(0, k + 1); break; } }
    FX.emitTrailFx(m.x, m.y, S.skin, m.vx, m.vy);
  }

  // ---------- render helpers ----------
  function bg() {
    var key = cw + 'x' + ch + ':' + (scr === 'play' && L ? L.world : (scr === 'menu' ? 1 : scr === 'skins' ? 4 : 2));
    if (key !== bgKey) {
      bgKey = key; bgCache = document.createElement('canvas'); bgCache.width = Math.round(cw * dpr); bgCache.height = Math.round(ch * dpr);
      var g = bgCache.getContext('2d'); g.scale(dpr, dpr);
      Scene.bgGrad(g, cw, ch, scr === 'play' && L ? L.world : (scr === 'menu' ? 1 : scr === 'skins' ? 4 : 2));
      g.fillStyle = '#fff'; var rng = Sim.mulberry(7);
      for (var i = 0; i < 70; i++) { g.globalAlpha = 0.08 + rng() * 0.25; g.beginPath(); g.arc(rng() * cw, rng() * ch, 0.6 + rng() * 1.4, 0, TAU); g.fill(); }
    }
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.drawImage(bgCache, 0, 0);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function glassBtn(x, y, w, h, r, hot, pressedF, col) {
    cx.save();
    if (pressedF) { cx.translate(x + w / 2, y + h / 2); cx.scale(0.94, 0.94); cx.translate(-(x + w / 2), -(y + h / 2)); }
    D.rr(cx, x, y, w, h, r);
    var g = cx.createLinearGradient(0, y, 0, y + h);
    if (hot) { g.addColorStop(0, col ? col[0] : '#ffe27a'); g.addColorStop(1, col ? col[1] : '#ff9f43'); }
    else { g.addColorStop(0, 'rgba(255,255,255,0.14)'); g.addColorStop(1, 'rgba(255,255,255,0.05)'); }
    cx.fillStyle = g; cx.fill();
    cx.lineWidth = 1.6; cx.strokeStyle = hot ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.22)'; cx.stroke();
    cx.restore();
  }
  function iconBtn(id, x, y, r, name, fn, o) {
    o = o || {};
    var pr = addBtn(id, x - r, y - r, r * 2, r * 2, fn, true);
    cx.save(); cx.translate(x, y); if (pr) cx.scale(0.92, 0.92);
    cx.beginPath(); cx.arc(0, 0, r, 0, TAU);
    if (o.hot) { var g = cx.createLinearGradient(0, -r, 0, r); g.addColorStop(0, o.c0 || '#ffe27a'); g.addColorStop(1, o.c1 || '#ff9f43'); cx.fillStyle = g; } else cx.fillStyle = o.dim ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)';
    cx.fill(); cx.lineWidth = 1.6; cx.strokeStyle = o.hot ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)'; cx.stroke();
    D.icon(cx, name, 0, 0, r * (o.k || 1.05), o.col || (o.hot ? '#2b1600' : '#e8efff'), o.col2);
    cx.restore();
  }
  function pill(x, y, w, h, textStr, ico, col) {
    D.rr(cx, x, y, w, h, h / 2); cx.fillStyle = 'rgba(255,255,255,0.09)'; cx.fill(); cx.strokeStyle = 'rgba(255,255,255,0.18)'; cx.lineWidth = 1.4; cx.stroke();
    D.icon(cx, ico, x + h * 0.52, y + h / 2, h * 0.52, col || '#ffd95a');
    D.txt(cx, textStr, x + h * 0.95, y + h / 2 + 1, h * 0.46, '#fff', 'left', 'Unbounded');
  }
  function sparksW() { return (String(S.sp).length * 11 + 44) * U; }
  function topBar(title, sub, showBack, onBack) {
    var r = 19 * U, y = LY.topH / 2 || 29 * U;
    if (showBack) iconBtn('back', 14 * U + r, y, r, 'back', onBack || goBack);
    var tx = showBack ? 14 * U + r * 2 + 12 * U : 16 * U;
    var rightW = (r * 2 + 8 * U) * (scr === 'play' ? 2 : 1) + sparksW() + 8 * U + 12 * U, maxW = cw - rightW - tx - 6 * U;
    if (title) {
      D.txt(cx, title, tx, y - (sub ? 7 * U : 0), fitSizeU(title, maxW, 17 * U), '#fff', 'left', 'Unbounded');
      if (sub) D.txt(cx, sub, tx, y + 12 * U, fitSize(sub, maxW * 0.55, 11.5 * U), 'rgba(255,255,255,0.6)', 'left', 'Manrope');
    }
    var rx = cw - 12 * U;
    iconBtn('snd', rx - r, y, r, S.snd ? 'snd' : 'mute', toggleSound); rx -= r * 2 + 8 * U;
    if (scr === 'play') {
      iconBtn('reset', rx - r, y, r, 'restart', function () { if (st === 'edit') clearAll(); }, { dim: !placed.length }); rx -= r * 2 + 8 * U;
    }
    var pw = sparksW(); pill(rx - pw, y - 15 * U, pw, 30 * U, String(S.sp), 'bolt'); rx -= pw + 8 * U;
    return rx;
  }
  function fitSizeU(s, maxW, size) {
    cx.font = '700 ' + size + 'px Unbounded,sans-serif'; var w = cx.measureText(s).width;
    return w > maxW ? Math.max(9 * U, size * maxW / w) : size;
  }
  function toggleSound() { S.snd = S.snd ? 0 : 1; Snd.setMuted(!S.snd); Snd.music(!!S.snd && scr !== 'menu' || !!S.snd); if (S.snd) Snd.click(); save(); }

  // ---------- screens ----------
  function drawMenu() {
    var sc = Math.max(cw / W, ch / H) * 1.02, ox = (cw - W * sc) / 2, oy = (ch - H * sc) / 2;
    cx.save(); cx.translate(ox, oy); cx.scale(sc, sc);
    FX.dustDraw(cx, 0.9);
    menuCh.forEach(function (c) { Scene.charge(cx, c.t, c.x, c.y, T, { k: c.k, noHalo: true, alpha: 0.9, scale: 1.1 }); });
    if (menuSpark) { FX.trail(cx, menuTrail, S.skin, T); FX.head(cx, menuSpark.x, menuSpark.y, S.skin, T, 1.1); }
    FX.draw(cx);
    cx.restore();
    var cxm = cw / 2, y0 = ch * (land ? 0.2 : 0.17);
    var bob = Math.sin(T * 1.2) * 3 * U;
    cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = 0.5; cx.drawImage(D.glow('rgba(120,170,255,0.5)', 256), cxm - 190 * U, y0 + bob - 120 * U, 380 * U, 240 * U); cx.restore();
    drawLogo(cxm, y0 + bob);
    D.txt(cx, t('tag'), cxm, y0 + 56 * U + bob, 14 * U, 'rgba(220,235,255,0.85)', 'center', 'Manrope');
    var bw = Math.min(cw - 48 * U, 320 * U), bh = 62 * U, by = ch * (land ? 0.46 : 0.42);
    var next = Math.min(NLV, maxDone() + 1), label = maxDone() === 0 ? t('play') : t('cont', next);
    var pr = addBtn('play', cxm - bw / 2, by, bw, bh, function () { Snd.click(); if (maxDone() === 0) startCamp(1); else if (!unlocked(next)) openMap(); else startCamp(next); });
    glassBtn(cxm - bw / 2, by, bw, bh, 20 * U, true, pr);
    cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = 0.25 + 0.15 * Math.sin(T * 3); D.rr(cx, cxm - bw / 2, by, bw, bh, 20 * U); cx.fillStyle = '#fff'; cx.fill(); cx.restore();
    D.icon(cx, 'play', cxm - bw / 2 + 34 * U, by + bh / 2, 22 * U, '#2b1600');
    D.txt(cx, label, cxm + 14 * U, by + bh / 2 + 1, 19 * U, '#2b1600', 'center', 'Unbounded');
    var gap = 10 * U, tw = (bw - gap * 2) / 3, th = 92 * U, ty = by + bh + 16 * U;
    var tiles = [
      { id: 'lab', ic: 'flask', txt: t('lab'), fn: function () { Snd.click(); startLab(true); }, sub: S.lab.best ? '★ ' + S.lab.best : '' },
      { id: 'daily', ic: 'cal', txt: t('daily'), fn: function () { Snd.click(); startDaily(); }, sub: S.daily.streak ? '' + S.daily.streak : '', dot: S.daily.d !== dayNum() || !S.daily.done },
      { id: 'skins', ic: 'skin', txt: t('skins'), fn: function () { Snd.click(); openSkins(); }, sub: '' }
    ];
    tiles.forEach(function (tl, i) {
      var x = cxm - bw / 2 + i * (tw + gap), p = addBtn(tl.id, x, ty, tw, th, tl.fn);
      glassBtn(x, ty, tw, th, 18 * U, false, p);
      D.icon(cx, tl.ic, x + tw / 2, ty + 32 * U, 28 * U, '#dfe9ff');
      D.txt(cx, tl.txt, x + tw / 2, ty + 66 * U, fitSize(tl.txt, tw - 8 * U, 11.5 * U), '#fff', 'center', 'Manrope');
      if (tl.dot) { cx.fillStyle = '#ff5c7c'; cx.beginPath(); cx.arc(x + tw - 12 * U, ty + 12 * U, 5 * U, 0, TAU); cx.fill(); }
      if (tl.sub) D.txt(cx, tl.sub, x + tw - 10 * U, ty + 16 * U, 11 * U, '#ffd95a', 'right', 'Unbounded');
    });
    var r = 19 * U;
    iconBtn('snd', cw - 12 * U - r, 12 * U + r, r, S.snd ? 'snd' : 'mute', toggleSound);
    iconBtn('lang', cw - 12 * U - r * 3 - 8 * U, 12 * U + r, r, 'lang', cycleLang);
    D.txt(cx, I.get().toUpperCase(), cw - 12 * U - r * 3 - 8 * U, 12 * U + r + 0.5, 9 * U, '#e8efff', 'center', 'Unbounded');
    iconBtn('map', 12 * U + r, 12 * U + r, r, 'grid', function () { Snd.click(); openMap(); });
    var sw = sparksW(); pill(12 * U + r * 2 + 8 * U, 12 * U + r - 15 * U, sw, 30 * U, String(S.sp), 'bolt');
  }
  var logoC = null, logoKey = '';
  function drawLogo(x, y) {
    var key = U + ':' + dpr;
    if (key !== logoKey) {
      logoKey = key; logoC = document.createElement('canvas'); var pw = Math.ceil(300 * U), ph = Math.ceil(150 * U);
      logoC.width = Math.round(pw * dpr); logoC.height = Math.round(ph * dpr); logoC.cssW = pw; logoC.cssH = ph;
      var g = logoC.getContext('2d'); g.scale(dpr, dpr);
      g.shadowColor = 'rgba(100,160,255,0.9)'; g.shadowBlur = 28 * U;
      var lg = g.createLinearGradient(0, ph / 2 - 40 * U, 0, ph / 2 + 40 * U); lg.addColorStop(0, '#ffffff'); lg.addColorStop(1, '#8fd8ff');
      D.txt(g, 'FLUX', pw / 2, ph / 2, 66 * U, lg, 'center', 'Unbounded');
    }
    cx.drawImage(logoC, x - logoC.cssW / 2, y - logoC.cssH / 2, logoC.cssW, logoC.cssH);
  }
  function fitSize(s, maxW, size) {
    cx.font = '700 ' + size + 'px Manrope,sans-serif'; var w = cx.measureText(s).width;
    return w > maxW ? size * maxW / w : size;
  }
  function cycleLang() {
    var o = I.order, i = o.indexOf(I.get()); I.set(o[(i + 1) % o.length]); S.lang = I.get(); save(); Snd.click();
  }

  var MAPCOLS = 3;
  function mapBlockH() { return (44 + 2 * (MAPCOLS === 3 ? 84 : 84) + 30) * U; }
  function drawMap() {
    var rx = topBar(t('map'), t('stars', totalStars()), true, function () { Snd.back(); openMenu(); });
    var cols = cw > 640 ? 6 : 3, rows = Math.ceil(PER / cols), cell = Math.min(92 * U, (Math.min(cw, 640 * U) - 32 * U - (cols - 1) * 10 * U) / cols), gapC = 10 * U;
    MAPCOLS = cols;
    var gridW = cols * cell + (cols - 1) * gapC, gx = (cw - gridW) / 2, blockH = 46 * U + rows * (cell + gapC) + 22 * U;
    scroll.max = NW * blockH - (ch - LY.topH) + 40 * U;
    if (mapFocus) { scroll.y = clamp((worldOf(Math.min(NLV, maxDone() + 1)) - 1) * blockH - 10 * U, 0, Math.max(0, scroll.max)); mapFocus = false; }
    cx.save(); cx.beginPath(); cx.rect(0, LY.topH, cw, ch - LY.topH); cx.clip();
    var y = LY.topH + 8 * U - scroll.y;
    for (var wd = 1; wd <= NW; wd++) {
      var locked = totalStars() < gate(wd);
      if (y + blockH > LY.topH && y < ch) {
        D.txt(cx, t('w' + wd), gx, y + 22 * U, 15 * U, locked ? 'rgba(255,255,255,0.45)' : '#fff', 'left', 'Unbounded');
        if (locked) { D.icon(cx, 'lock', gx + gridW - 98 * U, y + 22 * U, 15 * U, 'rgba(255,255,255,0.5)'); D.txt(cx, t('worldGate', gate(wd)), gx + gridW, y + 22 * U, 11.5 * U, 'rgba(255,255,255,0.55)', 'right', 'Manrope'); }
        else { var ws = 0; for (var q = 1; q <= PER; q++) ws += Math.max(0, starsOf((wd - 1) * PER + q)); D.txt(cx, ws + '/' + PER * 3, gx + gridW, y + 22 * U, 11.5 * U, '#ffd95a', 'right', 'Unbounded'); }
        for (var j = 0; j < PER; j++) {
          var id = (wd - 1) * PER + j + 1, col = j % cols, row = Math.floor(j / cols), x = gx + col * (cell + gapC), yy = y + 40 * U + row * (cell + gapC);
          var ok = unlocked(id), sv = starsOf(id);
          var p = addBtn('lv' + id, x, yy, cell, cell, (function (idd, okk) { return function () { if (okk) startCamp(idd); else { Snd.deny(); toast(totalStars() < gate(worldOf(idd)) ? t('worldGate', gate(worldOf(idd))) : t('locked')); } }; })(id, ok));
          glassBtn(x, yy, cell, cell, 16 * U, sv >= 0, p, sv >= 0 ? ['#3a5cff', '#7a39d8'] : null);
          if (ok && sv < 0 && id === Math.min(NLV, maxDone() + 1)) { cx.save(); cx.strokeStyle = 'rgba(255,226,122,' + (0.5 + 0.4 * Math.sin(T * 4)) + ')'; cx.lineWidth = 3; D.rr(cx, x - 2, yy - 2, cell + 4, cell + 4, 18 * U); cx.stroke(); cx.restore(); }
          if (ok) {
            D.txt(cx, String(id), x + cell / 2, yy + cell * 0.42, 24 * U, '#fff', 'center', 'Unbounded');
            for (var s3 = 0; s3 < 3; s3++) D.icon(cx, 'star', x + cell / 2 + (s3 - 1) * 17 * U, yy + cell * 0.78, 15 * U, sv > s3 ? '#ffd95a' : 'rgba(255,255,255,0.2)');
          } else D.icon(cx, 'lock', x + cell / 2, yy + cell / 2, 26 * U, 'rgba(255,255,255,0.4)');
        }
      }
      y += blockH;
    }
    cx.restore();
  }

  function drawSkins() {
    topBar(t('skins'), null, true, function () { Snd.back(); openMenu(); });
    var cols = cw > 700 ? 3 : 2, gapC = 12 * U, cellW = Math.min(200 * U, (Math.min(cw, 700 * U) - 32 * U - (cols - 1) * gapC) / cols), cellH = 150 * U;
    var gridW = cols * cellW + (cols - 1) * gapC, gx = (cw - gridW) / 2, rows = Math.ceil(FX.SKINS.length / cols);
    scroll.max = rows * (cellH + gapC) + 16 * U + 70 * U - (ch - LY.topH);
    cx.save(); cx.beginPath(); cx.rect(0, LY.topH, cw, ch - LY.topH); cx.clip();
    FX.SKINS.forEach(function (sk, i) {
      var col = i % cols, row = Math.floor(i / cols), x = gx + col * (cellW + gapC), y = LY.topH + 10 * U + row * (cellH + gapC) - scroll.y;
      if (y > ch || y + cellH < LY.topH) return;
      var owned = S.own.indexOf(i) >= 0, sel = S.skin === i;
      var p = addBtn('sk' + i, x, y, cellW, cellH, function () { skinTap(i); });
      glassBtn(x, y, cellW, cellH, 18 * U, sel, p, ['#2f56ff', '#7a39d8']);
      cx.save(); cx.beginPath(); D.rr(cx, x + 6, y + 6, cellW - 12, cellH * 0.55, 14 * U); cx.clip();
      cx.fillStyle = 'rgba(0,0,10,0.35)'; cx.fillRect(x, y, cellW, cellH);
      var pts = [], hx = 0, hy = 0, base = y + 6 + cellH * 0.275, ph = T * 2.1 + i;
      for (var k = 0; k < 36; k++) { var tt = ph - k * 0.045; pts.push({ x: x + cellW * 0.5 + Math.sin(tt) * cellW * 0.34, y: base + Math.sin(tt * 2) * cellH * 0.12, a: (35 - k) * 0.03 }); }
      pts.reverse(); var lastp = pts[pts.length - 1];
      FX.trail(cx, pts, i, T); FX.head(cx, lastp.x, lastp.y, i, T, 0.9);
      cx.restore();
      D.txt(cx, sk.n[I.get()] || sk.n.en, x + cellW / 2, y + cellH * 0.72, fitSize(sk.n[I.get()] || sk.n.en, cellW - 16 * U, 13 * U), '#fff', 'center', 'Manrope');
      if (sel) { D.icon(cx, 'check', x + cellW / 2, y + cellH * 0.88, 16 * U, '#7dffb0'); }
      else if (owned) D.txt(cx, t('owned'), x + cellW / 2, y + cellH * 0.88, 11.5 * U, 'rgba(255,255,255,0.65)', 'center', 'Manrope');
      else { D.icon(cx, 'bolt', x + cellW / 2 - 24 * U, y + cellH * 0.88, 14 * U, S.sp >= sk.cost ? '#ffd95a' : 'rgba(255,255,255,0.4)'); D.txt(cx, String(sk.cost), x + cellW / 2 - 10 * U, y + cellH * 0.88 + 1, 12 * U, S.sp >= sk.cost ? '#ffd95a' : 'rgba(255,255,255,0.5)', 'left', 'Unbounded'); }
    });
    var by = LY.topH + 10 * U + rows * (cellH + gapC) - scroll.y, bw = Math.min(cw - 32 * U, 340 * U), bx = (cw - bw) / 2, bh = 48 * U;
    var pr = addBtn('getsp', bx, by, bw, bh, function () { rewarded(function () { S.sp += 25; save(true); Snd.coin(); }); });
    glassBtn(bx, by, bw, bh, 16 * U, false, pr);
    D.icon(cx, 'video', bx + 32 * U, by + bh / 2, 22 * U, '#ff6b95', '#fff');
    D.txt(cx, '+25', bx + 62 * U, by + bh / 2 + 1, 15 * U, '#ffd95a', 'left', 'Unbounded'); D.icon(cx, 'bolt', bx + 108 * U, by + bh / 2, 16 * U, '#ffd95a');
    D.txt(cx, t('get'), bx + bw - 22 * U, by + bh / 2 + 1, 13 * U, '#fff', 'right', 'Manrope');
    cx.restore();
  }
  function skinTap(i) {
    var sk = FX.SKINS[i];
    if (S.own.indexOf(i) >= 0) { S.skin = i; Snd.click(); save(); return; }
    if (S.sp >= sk.cost) { S.sp -= sk.cost; S.own.push(i); S.skin = i; Snd.buy(); FX.burst(cw / 2, ch / 2, 1, {}); save(true); }
    else { Snd.deny(); toast(t('notEnough')); }
  }

  // ---------- play screen ----------
  function drawHand(x, y, press) {
    cx.save(); cx.translate(x, y);
    cx.globalAlpha = 0.9; cx.fillStyle = 'rgba(255,255,255,0.28)'; cx.beginPath(); cx.arc(0, 0, (press ? 15 : 21) * U, 0, TAU); cx.fill();
    cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(0, 0, (press ? 8 : 11) * U, 0, TAU); cx.fill();
    cx.restore();
  }
  function tutorialHand() {
    if (st !== 'edit' || drag || modal || !L) return;
    var early = mode === 'camp' && lvId <= 2, thr = early ? 1.1 : 9;
    if (idleT < thr) return;
    var used = usedInv(), si = -1, i;
    for (i = 0; i < L.inv.length; i++) if (!used[i]) { si = i; break; }
    var cyc = 2.6, ph = ((idleT - thr) % cyc) / cyc;
    if (si >= 0) {
      var solI = -1, tmp = {}; placed.forEach(function (p) { tmp[p.slot] = 1; });
      var cnt = {}; for (i = 0; i < L.sol.length; i++) if (L.sol[i].t === L.inv[si] && !tmp['s' + i]) { /* pick matching solution not near placed */ var near = false; for (var q = 0; q < placed.length; q++) if (Math.hypot2(placed[q].x - L.sol[i].x, placed[q].y - L.sol[i].y) < 70) near = true; if (!near) { solI = i; break; } }
      if (solI < 0) solI = Math.min(si, L.sol.length - 1);
      var s = LY.slots[si], tsp = toScr(L.sol[solI].x, L.sol[solI].y), tx = tsp[0], ty = tsp[1];
      var k = ph < 0.18 ? 0 : ph < 0.72 ? D.ease((ph - 0.18) / 0.54) : 1, a = ph < 0.1 ? ph / 0.1 : ph > 0.9 ? (1 - ph) / 0.1 : 1;
      var hx = s.x + (tx - s.x) * k, hy = s.y + (ty - s.y) * k, held = ph > 0.18 && ph < 0.78, cc = L.inv[si] === 'a' ? Scene.CA : Scene.CR;
      cx.save(); cx.globalAlpha = a;
      if (held) { cx.strokeStyle = 'rgba(' + cc + ',0.9)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(hx, hy, 24 * U, 0, TAU); cx.stroke(); cx.fillStyle = 'rgba(' + cc + ',0.25)'; cx.fill(); }
      drawHand(hx, hy, held); cx.restore();
    } else if (early && launched === 0) {
      var lc = LY.launch, pr = 0.5 + 0.5 * Math.sin(ph * TAU);
      cx.save(); drawHand(lc.x + 4 * U, lc.y + 6 * U + pr * 4 * U, pr > 0.6); cx.restore();
    }
  }
  function drawPlay() {
    var sub = mode === 'camp' ? t('w' + L.world) : mode === 'lab' ? t('labN', labN + 1) : '';
    var title = mode === 'camp' ? t('level', lvId) : mode === 'lab' ? t('lab') : t('daily');
    var rx = topBar(title, sub, true);
    (function () {
      var bx = 14 * U + 19 * U * 2 + 12 * U, by = LY.topH / 2 + 12 * U, mw = cw - ((19 * 2 + 8) * U * 2 + sparksW() + 20 * U) - bx - 6 * U; cx.font = '700 ' + fitSize(sub || '', mw * 0.55, 11.5 * U) + 'px Manrope,sans-serif';
      var sw = sub ? cx.measureText(sub).width + 10 * U : 0, got = run ? run.got : 0;
      for (var q = 0; q < 3; q++) {
        var lit = q < got, pre = !lit && st === 'edit' && L.prev === 2 && pv && pv.got > q;
        D.icon(cx, 'star', bx + sw + q * 15 * U + 7 * U, by, 13 * U, lit ? '#ffd95a' : pre ? 'rgba(255,217,90,0.5)' : 'rgba(255,255,255,0.2)');
      }
      if (mode === 'lab') for (var f = 0; f < 3; f++) D.icon(cx, 'heart', bx + sw + 3 * 15 * U + 20 * U + f * 17 * U, by, 13 * U, f < fuses ? '#ff5c7c' : 'rgba(255,255,255,0.2)');
    })();

    var sh = FX.shakeOff();
    var intro = D.ease(lvT / 0.5);
    cx.save(); cx.globalAlpha = intro; cx.translate(LY.fx + sh[0], LY.fy + sh[1]); cx.scale(LY.fs, LY.fs); if (LY.tp) cx.transform(0, 1, 1, 0, 0, 0);
    var isc = 0.94 + 0.06 * intro; cx.translate(W / 2, H / 2); cx.scale(isc, isc); cx.translate(-W / 2, -H / 2);
    var tt = (st === 'run' && run) ? run.t : 0;
    Scene.panel(cx, L, T);
    cx.save(); D.rr(cx, 0, 0, W, H, 30); cx.clip();
    FX.dustDraw(cx, 1);
    L.fixed.forEach(function (c) { if (c.orb) Scene.orbitPath(cx, c, T); });
    L.portals.forEach(function (q, i) { Scene.portal(cx, q, i, T); });
    L.haz.forEach(function (h) { Scene.hazard(cx, h, T); });
    L.bump.forEach(function (b, i) { Scene.bump(cx, b, T, bumpFlash[i]); });
    Scene.goal(cx, L.goal, T, st === 'won' ? Math.sin(Math.min(1, winT * 3) * 3.14) * 0.25 : 0);
    L.stars.forEach(function (s, i) {
      var took = run && run.took && run.took[i]; if (took) return;
      var lit = st === 'edit' && pv && pv.stars && pv.stars[i] !== false && L.prev === 2;
      Scene.starIcon(cx, s.x, s.y, T, { lit: lit, scale: lit ? 1.15 : 1 });
    });
    L.fixed.forEach(function (c) { var p = Sim.pos(c, tt); Scene.charge(cx, c.t, p[0], p[1], T, { fixed: true, k: c.k, alpha: 0.95 }); });
    hinted.forEach(function (hi) {
      var g = L.sol[hi]; if (!g) return; var done = false;
      for (var q = 0; q < placed.length; q++) if (placed[q].t === g.t && Math.hypot2(placed[q].x - g.x, placed[q].y - g.y) < 60) done = true;
      if (!done) Scene.hintGhost(cx, g, T);
    });
    if (st === 'edit') Scene.previewLine(cx, pv, L, T, L.prev, null);
    placed.forEach(function (p) { Scene.charge(cx, p.t, p.x, p.y, T, { noHalo: st !== 'edit' }); });
    Scene.emitter(cx, L.em, T);
    if (st === 'edit' || st === 'won' && false) {
      var bobS = 1 + 0.08 * Math.sin(T * 6); FX.head(cx, L.em.x, L.em.y, S.skin, T, bobS);
    }
    if (run) {
      FX.trail(cx, run.trail, S.skin, T);
      if (st === 'run') FX.head(cx, run.hx, run.hy, S.skin, T, 1);
    }
    if (drag) {
      var bad = !drag.valid;
      if (drag.off) { cx.save(); cx.strokeStyle = 'rgba(255,255,255,0.35)'; cx.lineWidth = 2; cx.setLineDash([4, 6]); cx.beginPath(); cx.moveTo(drag.x, drag.y); cx.lineTo(drag.fx, drag.fy); cx.stroke(); cx.restore(); }
      Scene.charge(cx, drag.t, drag.x, drag.y, T, { scale: 1.12, bad: bad && drag.x > 0 && drag.x < W, alpha: bad ? 0.7 : 1 });
    }
    FX.draw(cx);
    cx.restore();
    cx.restore();
    drawTray();
    tutorialHand();
    if (mode === 'camp' && fails >= 5 && st === 'edit' && !modal) {
      var skw = 44 * U; iconBtn('skip', cw - 12 * U - 19 * U - (19 * 2 + 8) * U * (2) - sparksW() - 24 * U - skw / 2, LY.topH / 2, 19 * U, 'skip', skipLevel, { dim: false });
    }
  }
  function drawTray() {
    var tr = LY.tray;
    D.rr(cx, tr.x + 6 * U, tr.y + 4 * U, tr.w - 12 * U, tr.h - 8 * U, 22 * U);
    cx.fillStyle = 'rgba(6,10,30,0.55)'; cx.fill(); cx.strokeStyle = 'rgba(255,255,255,0.14)'; cx.lineWidth = 1.5; cx.stroke();
    var used = usedInv();
    LY.slots.forEach(function (s, i) {
      cx.save(); cx.translate(s.x, s.y);
      if (used[i] || (drag && drag.src === 'slot' && drag.slot === i)) {
        cx.strokeStyle = 'rgba(255,255,255,0.18)'; cx.lineWidth = 2; cx.setLineDash([5, 6]); cx.beginPath(); cx.arc(0, 0, s.r, 0, TAU); cx.stroke();
      } else {
        var ty = L.inv[i], col = ty === 'a' ? Scene.CA : Scene.CR;
        cx.globalCompositeOperation = 'lighter'; cx.drawImage(D.glow('rgba(' + col + ',0.5)', 128), -s.r * 2, -s.r * 2, s.r * 4, s.r * 4); cx.globalCompositeOperation = 'source-over';
        cx.scale(s.r / 30, s.r / 30); cx.translate(0, 0);
        var bob = Math.sin(T * 3 + i) * 1.5;
        cx.translate(0, bob);
        cx.strokeStyle = 'rgba(' + col + ',0.8)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(0, 0, 28, 0, TAU); cx.stroke();
        if (ty === 'a') { cx.fillStyle = '#031014'; cx.beginPath(); cx.arc(0, 0, 14, 0, TAU); cx.fill(); cx.strokeStyle = 'rgb(' + col + ')'; cx.lineWidth = 3.4; cx.stroke(); cx.fillStyle = 'rgb(' + col + ')'; cx.beginPath(); cx.arc(0, 0, 4.4, 0, TAU); cx.fill(); }
        else { cx.fillStyle = 'rgb(' + col + ')'; cx.beginPath(); cx.arc(0, 0, 13, 0, TAU); cx.fill(); cx.strokeStyle = '#fff'; cx.lineWidth = 2.6; cx.beginPath(); cx.moveTo(-6, 0); cx.lineTo(6, 0); cx.moveTo(0, -6); cx.lineTo(0, 6); cx.stroke(); }
      }
      cx.restore();
    });
    var lc = LY.launch, ready = placed.length >= L.inv.length || placed.length > 0, canGo = st === 'edit';
    var pr = addBtn('launch', lc.x - lc.r, lc.y - lc.r, lc.r * 2, lc.r * 2, function () { launch(); }, true);
    cx.save(); cx.translate(lc.x, lc.y); var pulse = canGo && ready ? 1 + 0.05 * Math.sin(T * 5) : 1; cx.scale((pr ? 0.93 : 1) * pulse, (pr ? 0.93 : 1) * pulse);
    cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = canGo && ready ? 0.7 : 0.25; cx.drawImage(D.glow('rgba(255,200,90,0.6)', 128), -lc.r * 2, -lc.r * 2, lc.r * 4, lc.r * 4); cx.globalCompositeOperation = 'source-over'; cx.globalAlpha = 1;
    var g = cx.createLinearGradient(0, -lc.r, 0, lc.r); g.addColorStop(0, canGo ? '#ffe27a' : '#6a6f86'); g.addColorStop(1, canGo ? '#ff9f43' : '#444a63');
    cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, lc.r, 0, TAU); cx.fill(); cx.lineWidth = 2; cx.strokeStyle = 'rgba(255,255,255,0.7)'; cx.stroke();
    D.icon(cx, 'play', 3 * U, 0, lc.r * 0.95, canGo ? '#2b1600' : '#222', null);
    cx.restore();
    var hc = LY.hint, free = hintFree() && st === 'edit';
    iconBtn('hint', hc.x, hc.y, hc.r, 'bulb', doHint, { dim: !free, col: free ? '#ffe27a' : 'rgba(255,255,255,0.3)' });
    if (free) {
      var bx = hc.x + hc.r * 0.75, by2 = hc.y - hc.r * 0.8;
      if (S.sp >= HINT_COST) { D.rr(cx, bx - 14 * U, by2 - 9 * U, 28 * U, 18 * U, 9 * U); cx.fillStyle = '#10153a'; cx.fill(); cx.strokeStyle = '#ffd95a'; cx.lineWidth = 1.4; cx.stroke(); D.txt(cx, String(HINT_COST), bx, by2 + 1, 10 * U, '#ffd95a', 'center', 'Unbounded'); }
      else { cx.fillStyle = '#ff5c7c'; cx.beginPath(); cx.arc(bx, by2, 10 * U, 0, TAU); cx.fill(); D.icon(cx, 'video', bx, by2, 14 * U, '#fff', '#ff5c7c'); }
    }
  }
  function drawModal() {
    var m = modal; if (!m || m.t < m.delay) return;
    var k = D.back(Math.min(1, (m.t - m.delay) / 0.35));
    btns.length = 0;
    cx.save(); cx.fillStyle = 'rgba(2,4,16,' + 0.62 * Math.min(1, (m.t - m.delay) / 0.25) + ')'; cx.fillRect(0, 0, cw, ch);
    var cwid = Math.min(cw - 28 * U, 360 * U), chei = m.kind === 'win' ? 330 * U : 290 * U, x = (cw - cwid) / 2, y = (ch - chei) / 2;
    cx.translate(cw / 2, ch / 2); cx.scale(k, k); cx.translate(-cw / 2, -ch / 2);
    D.rr(cx, x, y, cwid, chei, 26 * U);
    var g = cx.createLinearGradient(0, y, 0, y + chei); g.addColorStop(0, 'rgba(30,38,92,0.96)'); g.addColorStop(1, 'rgba(14,16,48,0.97)');
    cx.fillStyle = g; cx.fill(); cx.strokeStyle = 'rgba(255,255,255,0.28)'; cx.lineWidth = 2; cx.stroke();
    if (m.kind === 'win') {
      D.txt(cx, mode === 'daily' ? t('dailyDone') : t('done'), cw / 2, y + 36 * U, 21 * U, '#fff', 'center', 'Unbounded');
      for (var i = 0; i < 3; i++) {
        var sk = D.back(Math.max(0, Math.min(1, (m.t - m.delay - 0.25 - i * 0.22) / 0.35))), on = i < m.got, sxp = cw / 2 + (i - 1) * 72 * U, syp = y + 100 * U - (i === 1 ? 10 * U : 0);
        if (on && sk > 0.02 && !m['s' + i]) { m['s' + i] = 1; Snd.pop(i); FX.burst(0, 0, 0, {}); }
        cx.save(); cx.translate(sxp, syp); cx.scale(Math.max(0.01, (on ? sk : 1)), Math.max(0.01, (on ? sk : 1)));
        D.star4(cx, 0, 0, 34 * U, 0.4);
        if (on) { cx.fillStyle = '#ffd95a'; cx.fill(); cx.strokeStyle = '#fff3b0'; cx.lineWidth = 3; cx.stroke(); cx.globalCompositeOperation = 'lighter'; cx.drawImage(D.glow('rgba(255,215,90,0.4)', 128), -44 * U, -44 * U, 88 * U, 88 * U); }
        else { cx.fillStyle = 'rgba(255,255,255,0.08)'; cx.fill(); cx.strokeStyle = 'rgba(255,255,255,0.22)'; cx.lineWidth = 2.4; cx.stroke(); }
        cx.restore();
      }
      var rew = m.reward + (m.doubled ? m.reward : 0);
      if (rew > 0) { D.icon(cx, 'bolt', cw / 2 - 34 * U, y + 168 * U, 22 * U, '#ffd95a'); D.txt(cx, '+' + rew, cw / 2 - 16 * U, y + 169 * U, 20 * U, '#ffd95a', 'left', 'Unbounded'); }
      if (mode === 'daily' && S.daily.streak > 0) { D.icon(cx, 'fire', cw / 2 - 34 * U, y + 196 * U, 18 * U, '#ff9f43'); D.txt(cx, t('streak', S.daily.streak), cw / 2 - 16 * U, y + 197 * U, 13 * U, '#ffb766', 'left', 'Manrope'); }
      if (mode === 'lab') D.txt(cx, t('score', labN), cw / 2, y + 197 * U, 13 * U, 'rgba(255,255,255,0.8)', 'center', 'Manrope');
      var by = y + chei - 78 * U, bwid = cwid - 40 * U, bhh = 54 * U, bx = x + 20 * U;
      var pr = addBtn('mnext', bx, by, bwid - (mode === 'daily' ? 0 : 0), bhh, modalNext);
      glassBtn(bx, by, bwid, bhh, 18 * U, true, pr);
      D.txt(cx, mode === 'daily' ? t('menu') : t('next'), bx + bwid / 2 - 10 * U, by + bhh / 2 + 1, 17 * U, '#2b1600', 'center', 'Unbounded'); D.icon(cx, 'next', bx + bwid / 2 + fitW(mode === 'daily' ? t('menu') : t('next'), 17 * U) / 2 + 4 * U, by + bhh / 2, 17 * U, '#2b1600');
      var sy2 = by - 50 * U, r2 = 20 * U;
      iconBtn('mrep', x + 20 * U + r2, sy2, r2, 'restart', function () { Snd.click(); if (mode === 'camp') startCamp(lvId); else { var l0 = clone(L); setLevel(l0); if (mode === 'lab') { /* replay same */ } } });
      iconBtn('mmap', x + 20 * U + r2 * 3 + 10 * U, sy2, r2, 'grid', function () { Snd.click(); if (mode === 'camp') openMap(); else openMenu(); });
      if (m.reward > 0 && !m.doubled) {
        var dw = bwid - r2 * 4 - 20 * U, dx = x + 20 * U + r2 * 4 + 20 * U, pr2 = addBtn('mdbl', dx, sy2 - r2, dw, r2 * 2, modalDouble);
        glassBtn(dx, sy2 - r2, dw, r2 * 2, r2, false, pr2);
        D.icon(cx, 'video', dx + 24 * U, sy2, 20 * U, '#ff6b95', '#fff'); D.txt(cx, '×2', dx + 44 * U, sy2 + 1, 15 * U, '#ffd95a', 'left', 'Unbounded');
        D.icon(cx, 'bolt', dx + dw - 28 * U, sy2, 15 * U, '#ffd95a'); D.txt(cx, '+' + m.reward, dx + dw - 40 * U, sy2 + 1, 13 * U, '#ffd95a', 'right', 'Unbounded');
      }
    } else if (m.kind === 'over') {
      D.txt(cx, t('over'), cw / 2, y + 40 * U, 22 * U, '#fff', 'center', 'Unbounded');
      D.txt(cx, String(m.score), cw / 2, y + 108 * U, 56 * U, '#ffd95a', 'center', 'Unbounded');
      D.txt(cx, t('best', S.lab.best), cw / 2, y + 160 * U, 14 * U, 'rgba(255,255,255,0.75)', 'center', 'Manrope');
      var bw2 = cwid - 40 * U, bx2 = x + 20 * U, by3 = y + chei - 140 * U;
      var p3 = addBtn('oagain', bx2, by3 + 66 * U, bw2, 52 * U, function () { Snd.click(); modal = null; startLab(true); });
      glassBtn(bx2, by3 + 66 * U, bw2, 52 * U, 18 * U, true, p3); D.txt(cx, t('again'), cw / 2, by3 + 66 * U + 27 * U, 16 * U, '#2b1600', 'center', 'Unbounded');
      var p4 = addBtn('orev', bx2, by3, bw2 / 2 - 5 * U, 52 * U, reviveLab);
      glassBtn(bx2, by3, bw2 / 2 - 5 * U, 52 * U, 18 * U, false, p4); D.icon(cx, 'video', bx2 + 26 * U, by3 + 26 * U, 20 * U, '#ff6b95', '#fff'); D.txt(cx, t('revive'), bx2 + 46 * U, by3 + 27 * U, fitSize(t('revive'), bw2 / 2 - 62 * U, 13 * U), '#fff', 'left', 'Manrope');
      var p5 = addBtn('omenu', bx2 + bw2 / 2 + 5 * U, by3, bw2 / 2 - 5 * U, 52 * U, function () { Snd.back(); modal = null; openMenu(); });
      glassBtn(bx2 + bw2 / 2 + 5 * U, by3, bw2 / 2 - 5 * U, 52 * U, 18 * U, false, p5); D.txt(cx, t('menu'), bx2 + bw2 * 0.75 + 5 * U, by3 + 27 * U, 14 * U, '#fff', 'center', 'Manrope');
    }
    cx.restore();
  }
  function fitW(s, size) { cx.font = '700 ' + size + 'px Unbounded,sans-serif'; return cx.measureText(s).width; }

  function drawOverlays() {
    if (toastT > 0) {
      var a = Math.min(1, toastT * 3); cx.save(); cx.globalAlpha = a;
      cx.font = '700 ' + 14 * U + 'px Manrope,sans-serif'; var w2 = cx.measureText(toastS).width + 34 * U;
      D.rr(cx, (cw - w2) / 2, ch - 150 * U, w2, 38 * U, 19 * U); cx.fillStyle = 'rgba(8,10,30,0.92)'; cx.fill(); cx.strokeStyle = 'rgba(255,255,255,0.3)'; cx.lineWidth = 1.4; cx.stroke();
      D.txt(cx, toastS, cw / 2, ch - 150 * U + 20 * U, 14 * U, '#fff', 'center', 'Manrope'); cx.restore();
    }
    if (adOv) {
      cx.fillStyle = 'rgba(0,0,0,0.88)'; cx.fillRect(0, 0, cw, ch); D.txt(cx, adOv.text, cw / 2, ch / 2, 18 * U, '#fff', 'center', 'Manrope');
    }
    if (paused && !adActive) {
      cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(0, 0, cw, ch); D.txt(cx, t('paused'), cw / 2, ch / 2 - 16 * U, 24 * U, '#fff', 'center', 'Unbounded'); D.txt(cx, t('tapResume'), cw / 2, ch / 2 + 22 * U, 14 * U, 'rgba(255,255,255,0.7)', 'center', 'Manrope');
    }
  }

  function render() {
    btns = [];
    bg();
    if (scr === 'menu') drawMenu();
    else if (scr === 'map') { drawBgDust(); drawMap(); }
    else if (scr === 'skins') { drawBgDust(); drawSkins(); }
    else if (scr === 'play' && L) { drawPlay(); drawModal(); }
    if (fadeA > 0) { cx.fillStyle = 'rgba(4,6,20,' + fadeA + ')'; cx.fillRect(0, 0, cw, ch); }
    drawOverlays();
  }
  function drawBgDust() {
    var sc = Math.max(cw / W, ch / H) * 1.02, ox = (cw - W * sc) / 2, oy = (ch - H * sc) / 2;
    cx.save(); cx.translate(ox, oy); cx.scale(sc, sc); FX.dustDraw(cx, 0.55); cx.restore();
  }

  function frame() {
    var n = now(), dt = Math.min(0.05, (n - lastFrame) / 1000); lastFrame = n;
    if (!paused && !window.__manual) update(dt);
    render();
    requestAnimationFrame(frame);
  }

  // ---------- boot ----------
  function setHidden() {
    var h = document.hidden; Snd.setHidden(h);
    if (h) { if (scr === 'play' && st === 'run') paused = true; } else { lastFrame = now(); }
    updGP();
  }
  function start() {
    resize(); window.addEventListener('resize', resize); window.addEventListener('orientationchange', function () { setTimeout(resize, 120); });
    if (window.PointerEvent) {
      cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp);
    } else {
      var tw = function (fn) { return function (e) { var t0 = e.changedTouches && e.changedTouches[0]; if (!t0) return; e.preventDefault(); fn({ clientX: t0.clientX, clientY: t0.clientY, pointerId: t0.identifier, pointerType: 'touch' }); }; };
      cv.addEventListener('touchstart', tw(onDown), { passive: false }); cv.addEventListener('touchmove', tw(onMove), { passive: false }); cv.addEventListener('touchend', tw(onUp), { passive: false }); cv.addEventListener('touchcancel', tw(onUp), { passive: false });
      var mw = function (fn) { return function (e) { fn({ clientX: e.clientX, clientY: e.clientY, pointerId: 1, pointerType: 'mouse' }); }; };
      cv.addEventListener('mousedown', mw(onDown)); window.addEventListener('mousemove', mw(onMove)); window.addEventListener('mouseup', mw(onUp));
    }
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    cv.addEventListener('wheel', function (e) { if (scr === 'map' || scr === 'skins') { scroll.y += e.deltaY; clampScroll(); e.preventDefault(); } }, { passive: false });
    document.addEventListener('keydown', onKey); document.addEventListener('visibilitychange', setHidden);
    document.addEventListener('selectstart', function (e) { e.preventDefault(); });
    Snd.setMuted(!S.snd); initMenuSpark();
    started = true; lastFrame = now(); lastAdAt = Date.now(); openMenu();
    requestAnimationFrame(frame);
    setTimeout(function () { Platform.ready(); updGP(); }, 150);
    Platform.onPause(function () { paused = true; Snd.setAd(true); updGP(); });
    Platform.onResume(function () { if (!adActive) { paused = false; Snd.setAd(false); lastFrame = now(); updGP(); } });
    setInterval(function () { if (S) save(); }, 30000);
    window.addEventListener('pagehide', function () { save(true); });
    var musicStart = function () { Snd.unlock(); Snd.music(true); document.removeEventListener('pointerdown', musicStart); };
    document.addEventListener('pointerdown', musicStart);
    if (DBG) window.__dbg = {
      S: S, get L() { return L; }, get st() { return st; }, get scr() { return scr; }, get modal() { return modal; }, get placed() { return placed; }, get pv() { return pv; }, get run() { return run; }, get LY() { return LY; }, get fails() { return fails; },
      startCamp: startCamp, startLab: startLab, startDaily: startDaily, openMap: openMap, openMenu: openMenu, openSkins: openSkins, launch: launch, clearAll: clearAll, recompute: recompute, doHint: doHint,
      place: function (tp, x, y, slot) { placed.push({ t: tp, x: x, y: y, slot: slot == null ? placed.length : slot }); recompute(); },
      solve: function () { placed = L.sol.map(function (s, i) { return { t: s.t, x: s.x, y: s.y, slot: i }; }); recompute(); },
      step: function (sec) { var n2 = Math.round(sec / 0.016); for (var i = 0; i < n2; i++) update(0.016); },
      render: render, toScr: toScr, toWorld: toWorld, save: save, unlockAll: function () { for (var i = 1; i < NLV; i++) S.st[i] = 3; },
      labAt: function (n, seed) { labSeed = seed; var t0 = performance.now(), g = labBuild(n); return { ms: performance.now() - t0, ok: !!g && g.sol.length > 0 && g.seed != null, inv: g ? g.inv.length : 0 }; }, modalNext: modalNext, btn: function (id) { for (var i = 0; i < btns.length; i++) if (btns[i].id === id) return btns[i]; return null; }, validPos: validPos, inv: function () { return L.inv; }, S2: function () { return S; }, adState: function () { return { adActive: adActive, sinceAd: sinceAd, lastAdAt: lastAdAt }; }, setLastAd: function (v) { lastAdAt = v; }, gp: function () { return gpOn; }, drag: function () { return drag; }
    };
  }
  function fontsReady() {
    var fonts = document.fonts;
    if (!fonts || !fonts.load) return Promise.resolve();
    return Promise.race([Promise.all([fonts.load('700 20px Unbounded', 'Aaя'), fonts.load('700 14px Manrope', 'Aaя')]), new Promise(function (r) { setTimeout(r, 2500); })]).catch(function () {});
  }
  function boot() {
    S = defaults();
    Platform.init().catch(function () {}).then(function () {
      return Platform.showPreloader ? Promise.resolve(Platform.showPreloader()).catch(function () {}) : null;
    }).then(function () {
      var code = PARAMS.get('lang') || Platform.getLang() || navigator.language;
      I.set(I.from(code));
      return Platform.loadData();
    }).then(function (cloud) {
      S = loadState(cloud); if (S.lang && !PARAMS.get('lang')) I.set(S.lang);
      return fontsReady();
    }).then(function () { start(); }).catch(function (e) {
      if (window.console) console.warn('boot', e);
      S = loadState(null); if (!started) start();
    });
  }
  boot();
})();
