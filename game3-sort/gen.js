(function (root) {
  'use strict';
  var CAP = 4, TOTAL = 320;
  var STEPS = [[1, 3], [9, 4], [22, 5], [40, 6], [62, 7], [90, 8], [124, 9], [164, 10], [210, 11], [262, 12]];

  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function seedOf(n, a) { return (Math.imul(n + 1, 2654435761) ^ Math.imul(a + 7, 40503) ^ 0x5bd1e995) >>> 0; }

  function params(n) {
    var k = 3, lo = 1, hi = STEPS[1][0], i;
    for (i = 0; i < STEPS.length; i++) if (n >= STEPS[i][0]) { k = STEPS[i][1]; lo = STEPS[i][0]; hi = i + 1 < STEPS.length ? STEPS[i + 1][0] : TOTAL + 1; }
    var band = Math.min(1, (n - lo) / Math.max(1, hi - lo));
    var g = Math.min(1, (n - 1) / (TOTAL - 1));
    var e = 2;
    if (n >= 250) e = (n % 2 === 0) ? 1 : 2;
    else if (n >= 140) e = (n % 4 === 0) ? 1 : 2;
    var d = 0.25 + 0.75 * (0.5 * g + 0.5 * band), mix, steps;
    if (e >= 2) { mix = 0.3 + 0.62 * d; steps = Math.round(k * 11 * d); }
    else { mix = 0.9; steps = Math.round(k * (3 + 5 * g + 2 * band)); }
    return { k: k, e: e, band: band, g: g, d: d, mix: mix, steps: Math.max(3, steps) };
  }

  function partial(l) { return l > 0 && l < CAP ? 1 : 0; }

  function revMoves(tubes, last, free) {
    var out = [], si, di, t, l, x, dl;
    for (si = 0; si < tubes.length; si++) {
      t = tubes[si]; l = t.length; if (!l) continue;
      x = t[l - 1];
      if (!free && l > 1 && t[l - 2] !== x) continue;
      for (di = 0; di < tubes.length; di++) {
        if (di === si) continue;
        dl = tubes[di].length; if (dl >= CAP) continue;
        if (last && si === last[1] && di === last[0]) continue;
        if (l === 1 && dl === 0) continue;
        var w = dl === 0 ? 1 : (tubes[di][dl - 1] === x ? 0.35 : 3);
        var d = partial(l - 1) + partial(dl + 1) - partial(l) - partial(dl);
        out.push([si, di, w, d]);
      }
    }
    return out;
  }
  function pickW(list, rnd, wi) {
    var s = 0, i;
    for (i = 0; i < list.length; i++) s += list[i][wi];
    var r = rnd() * s;
    for (i = 0; i < list.length; i++) { r -= list[i][wi]; if (r <= 0) return list[i]; }
    return list[list.length - 1];
  }
  function applyRev(tubes, m, rev) { tubes[m[1]].push(tubes[m[0]].pop()); rev.push([m[0], m[1]]); }

  function mixOf(tubes) {
    var a = 0, mono = 0;
    tubes.forEach(function (t) {
      if (t.length !== CAP) return;
      var d = 0;
      for (var i = 1; i < CAP; i++) if (t[i] !== t[i - 1]) d++;
      a += d; if (!d) mono++;
    });
    return { a: a, mono: mono };
  }
  function inT(tubes) { for (var i = 0; i < tubes.length; i++) if (partial(tubes[i].length)) return false; return true; }

  function consolidate(tubes, rnd, rev, free) {
    var last = rev.length ? rev[rev.length - 1] : null;
    for (var it = 0; it < 300; it++) {
      if (inT(tubes)) return true;
      var ms = revMoves(tubes, last, free), neg = [], zero = [];
      ms.forEach(function (m) { if (m[3] < 0) neg.push(m); else if (m[3] === 0) zero.push(m); });
      var pool = neg.length ? neg : (zero.length ? zero : ms);
      if (!pool.length) return false;
      var m = pool[Math.floor(rnd() * pool.length)];
      applyRev(tubes, m, rev); last = m;
    }
    return inT(tubes);
  }

  function copy(t) { return t.map(function (a) { return a.slice(); }); }

  function generate(n) {
    var P = params(n), k = P.k, nt = k + P.e, best = null, i, a, free = P.e >= 2;
    var need = Math.floor(P.mix * 3 * k);
    var maxMono = n <= 4 ? 1 : (k <= 4 ? 1 : (n < 60 ? 1 : 0));
    for (a = 0; a < 60; a++) {
      var rnd = mulberry(seedOf(n, a));
      var tubes = [], rev = [];
      for (i = 0; i < nt; i++) tubes.push([]);
      for (i = 0; i < k; i++) for (var j = 0; j < CAP; j++) tubes[i].push(i + 1);
      var last = null, ok = true;
      for (var round = 0; round < 6 && ok; round++) {
        var steps = round === 0 ? P.steps : Math.max(4, Math.round(k * 1.5));
        for (var s = 0; s < steps; s++) {
          var ms = revMoves(tubes, last, free);
          if (!ms.length) break;
          var m = pickW(ms, rnd, 2); applyRev(tubes, m, rev); last = m;
        }
        if (!consolidate(tubes, rnd, rev, free)) { ok = false; break; }
        last = rev.length ? rev[rev.length - 1] : null;
        var mx = mixOf(tubes);
        if (mx.a >= need && mx.mono <= maxMono) {
          return finish(n, P, tubes, rev, rnd, a);
        }
        if (!best || mx.a > best.mx.a) best = { tubes: copy(tubes), rev: rev.slice(), mx: mx, rnd: rnd, a: a };
      }
    }
    return finish(n, P, best.tubes, best.rev, best.rnd, best.a);
  }

  function finish(n, P, tubes, rev, rnd, att) {
    var free = P.e >= 2;
    var nt = tubes.length, perm = [], cperm = [], i;
    for (i = 0; i < nt; i++) perm.push(i);
    for (i = nt - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
    for (i = 1; i <= P.k; i++) cperm.push(i);
    for (i = P.k - 1; i > 0; i--) { var j2 = Math.floor(rnd() * (i + 1)), t2 = cperm[i]; cperm[i] = cperm[j2]; cperm[j2] = t2; }
    var out = new Array(nt);
    for (i = 0; i < nt; i++) out[perm[i]] = tubes[i].map(function (c) { return cperm[c - 1]; });
    var fwd = [];
    for (i = rev.length - 1; i >= 0; i--) fwd.push([perm[rev[i][1]], perm[rev[i][0]]]);
    return { n: n, k: P.k, e: P.e, cap: CAP, tubes: out, sol: free ? null : fwd, att: att, mix: mixOf(tubes).a };
  }

  function canMove(tubes, f, t) {
    if (f === t) return false;
    var a = tubes[f], b = tubes[t];
    if (!a.length || b.length >= CAP) return false;
    return !b.length || b[b.length - 1] === a[a.length - 1];
  }
  function isWon(tubes) {
    for (var i = 0; i < tubes.length; i++) {
      var t = tubes[i]; if (!t.length) continue;
      if (t.length !== CAP) return false;
      for (var j = 1; j < CAP; j++) if (t[j] !== t[0]) return false;
    }
    return true;
  }
  function hasMoves(tubes) {
    for (var f = 0; f < tubes.length; f++) for (var t = 0; t < tubes.length; t++) {
      if (!canMove(tubes, f, t)) continue;
      var a = tubes[f];
      if (a.length === CAP && isMono(a)) continue;
      if (isMono(a) && !tubes[t].length) continue;
      return true;
    }
    return false;
  }
  function isMono(a) { for (var i = 1; i < a.length; i++) if (a[i] !== a[0]) return false; return true; }

  root.SortGen = { CAP: CAP, TOTAL: TOTAL, params: params, generate: generate, canMove: canMove, isWon: isWon, hasMoves: hasMoves, mulberry: mulberry };
  if (typeof module !== 'undefined') module.exports = root.SortGen;
})(typeof window !== 'undefined' ? window : globalThis);
