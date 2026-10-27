(function (root) {
  var S = root.Sim || (typeof require !== 'undefined' ? require('./sim.js') : null);
  var W = S.W, H = S.H, R2 = function (n) { return Math.round(n * 10) / 10; };

  function dist(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
  function pdist(path, x, y, upTo) {
    var best = 1e9, n = upTo == null ? path.length / 2 : upTo;
    for (var i = 0; i < n; i++) { var d = dist(path[i * 2], path[i * 2 + 1], x, y); if (d < best) best = d; }
    return best;
  }
  function shapeClear(path, h, upTo) {
    var n = upTo == null ? path.length / 2 : upTo, best = 1e9;
    for (var i = 0; i < n; i++) {
      var x = path[i * 2], y = path[i * 2 + 1];
      var d = h.t === 'c' ? dist(x, y, h.x, h.y) - h.r : S.rectDist(h, x, y);
      if (d < best) best = d;
    }
    return best;
  }
  function shapeDist(h, x, y) { return h.t === 'c' ? dist(x, y, h.x, h.y) - h.r : S.rectDist(h, x, y); }

  function gen(seed, sp) {
    var rng = S.mulberry(seed * 7919 + 13);
    var rnd = function (a, b) { return a + (b - a) * rng(); };
    var pick = function (arr) { return arr[Math.floor(rng() * arr.length)]; };
    for (var attempt = 0; attempt < 600; attempt++) {
      var L = { w: W, h: H, fixed: [], haz: [], bump: [], portals: [], stars: [], bounce: !!sp.bounce, prev: sp.prev == null ? 2 : sp.prev, inv: [], sol: [], world: sp.world || 1 };
      var side = sp.side != null ? sp.side : Math.floor(rng() * 4);
      var ex, ey, base;
      if (side === 0) { ex = rnd(120, W - 120); ey = H - 80; base = -Math.PI / 2; }
      else if (side === 1) { ex = rnd(120, W - 120); ey = 80; base = Math.PI / 2; }
      else if (side === 2) { ex = 80; ey = rnd(260, H - 260); base = 0; }
      else { ex = W - 80; ey = rnd(260, H - 260); base = Math.PI; }
      var ang = base + rnd(-0.7, 0.7), spd = rnd(210, 270);
      L.em = { x: R2(ex), y: R2(ey), vx: R2(Math.cos(ang) * spd), vy: R2(Math.sin(ang) * spd) };

      var all = [];
      var free = function (x, y, d) {
        for (var i = 0; i < all.length; i++) if (dist(all[i][0], all[i][1], x, y) < d) return false;
        return dist(L.em.x, L.em.y, x, y) > 110;
      };
      var rndPt = function (mx, my) { return [rnd(mx, W - mx), rnd(my, H - my)]; };

      var i, p, tries, ok = true;
      for (i = 0; i < (sp.fixedA || 0) + (sp.fixedR || 0); i++) {
        var isA = i < (sp.fixedA || 0), c;
        for (tries = 0; tries < 40; tries++) { p = rndPt(110, 160); if (free(p[0], p[1], 190)) break; }
        if (tries === 40) { ok = false; break; }
        c = { t: isA ? 'a' : 'r', x: R2(p[0]), y: R2(p[1]), k: pick([0.8, 1, 1.3]), fx: 1 };
        if (i < (sp.orbit || 0)) {
          var orr = rnd(70, 130);
          c.orb = { cx: c.x, cy: c.y, r: R2(orr), w: R2((rng() < 0.5 ? -1 : 1) * rnd(0.55, 1.1)), ph: R2(rnd(0, 6.28)) };
          c.x = R2(c.orb.cx + Math.cos(c.orb.ph) * orr); c.y = R2(c.orb.cy + Math.sin(c.orb.ph) * orr);
          all.push([c.orb.cx, c.orb.cy]);
        } else all.push([c.x, c.y]);
        L.fixed.push(c);
      }
      if (!ok) continue;
      for (i = 0; i < (sp.bump || 0); i++) {
        for (tries = 0; tries < 40; tries++) { p = rndPt(150, 220); if (free(p[0], p[1], 190)) break; }
        if (tries === 40) { ok = false; break; }
        L.bump.push({ x: R2(p[0]), y: R2(p[1]), r: R2(rnd(34, 54)) }); all.push(p);
      }
      if (!ok) continue;
      for (i = 0; i < (sp.portals || 0); i++) {
        var a = null, b = null;
        for (tries = 0; tries < 60; tries++) { a = rndPt(130, 200); b = rndPt(130, 200); if (dist(a[0], a[1], b[0], b[1]) > 380 && free(a[0], a[1], 170) && free(b[0], b[1], 170)) break; a = null; }
        if (!a) { ok = false; break; }
        L.portals.push({ a: { x: R2(a[0]), y: R2(a[1]) }, b: { x: R2(b[0]), y: R2(b[1]) }, r: 32 }); all.push(a, b);
      }
      if (!ok) continue;
      var nPl = (sp.nA || 0) + (sp.nR || 0);
      var placed = [];
      for (i = 0; i < nPl; i++) {
        for (tries = 0; tries < 50; tries++) { p = rndPt(100, 150); if (free(p[0], p[1], 150)) break; }
        if (tries === 50) { ok = false; break; }
        placed.push({ t: i < (sp.nA || 0) ? 'a' : 'r', x: R2(p[0]), y: R2(p[1]), k: 1 }); all.push(p);
      }
      if (!ok) continue;
      L.goal = { x: 0, y: 0, r: 36 };
      var pre = S.simulate(L, placed, {});
      var m = pre.path.length / 2;
      var cand = [], len = 0, turn = 0, lastAng = null, lens = [0], turns = [0];
      for (i = 1; i < m; i++) {
        var dx = pre.path[i * 2] - pre.path[i * 2 - 2], dy = pre.path[i * 2 + 1] - pre.path[i * 2 - 1];
        len += Math.sqrt(dx * dx + dy * dy);
        if (Math.sqrt(dx * dx + dy * dy) > 0.01) { var an = Math.atan2(dy, dx); if (lastAng != null) { var dd = an - lastAng; while (dd > Math.PI) dd -= 2 * Math.PI; while (dd < -Math.PI) dd += 2 * Math.PI; turn += Math.abs(dd); } lastAng = an; }
        lens.push(len); turns.push(turn);
      }
      for (i = Math.floor(m * 0.45); i < m - 1; i++) {
        var x = pre.path[i * 2], y = pre.path[i * 2 + 1];
        if (x < 110 || x > W - 110 || y < 130 || y > H - 130) continue;
        if (lens[i] < (sp.minLen || 700) || turns[i] * 180 / Math.PI < (sp.minTurn || 40)) continue;
        if (dist(x, y, L.em.x, L.em.y) < 260) continue;
        if (i * S.REC * S.DT > (sp.maxT || 8.5)) continue;
        cand.push(i);
      }
      if (!cand.length) continue;
      var e = cand[Math.floor(cand.length * (0.35 + 0.65 * rng()))];
      var gx = pre.path[e * 2], gy = pre.path[e * 2 + 1], te = e * S.REC * S.DT;
      var gOk = true;
      for (i = 0; i < L.fixed.length; i++) { var fp = S.pos(L.fixed[i], te); if (dist(fp[0], fp[1], gx, gy) < 85) gOk = false; }
      for (i = 0; i < placed.length; i++) if (dist(placed[i].x, placed[i].y, gx, gy) < 85) gOk = false;
      for (i = 0; i < L.bump.length; i++) if (dist(L.bump[i].x, L.bump[i].y, gx, gy) < L.bump[i].r + 70) gOk = false;
      for (i = 0; i < L.portals.length; i++) if (dist(L.portals[i].a.x, L.portals[i].a.y, gx, gy) < 90 || dist(L.portals[i].b.x, L.portals[i].b.y, gx, gy) < 90) gOk = false;
      if (!gOk) continue;
      L.goal.x = R2(gx); L.goal.y = R2(gy);
      var pathE = pre.path.slice(0, e * 2 + 2);
      // earlier pass through goal region would end the run earlier; require clean approach
      var earlyHit = false;
      for (i = 0; i < e - 30; i++) if (dist(pre.path[i * 2], pre.path[i * 2 + 1], gx, gy) < L.goal.r + 10) { earlyHit = true; break; }
      if (earlyHit) continue;

      var starF = [0.26, 0.5, 0.76], good = true;
      for (i = 0; i < 3; i++) {
        var idx = Math.floor(e * (starF[i] + rnd(-0.05, 0.05)));
        var sx = pre.path[idx * 2], sy = pre.path[idx * 2 + 1];
        if (sx < 70 || sx > W - 70 || sy < 90 || sy > H - 90) { good = false; break; }
        if (dist(sx, sy, L.em.x, L.em.y) < 130 || dist(sx, sy, gx, gy) < 100) { good = false; break; }
        for (var j = 0; j < L.stars.length; j++) if (dist(sx, sy, L.stars[j].x, L.stars[j].y) < 120) good = false;
        var tt = idx * S.REC * S.DT;
        for (j = 0; j < L.fixed.length; j++) { var fq = S.pos(L.fixed[j], tt); if (dist(fq[0], fq[1], sx, sy) < 48) good = false; }
        for (j = 0; j < placed.length; j++) if (dist(placed[j].x, placed[j].y, sx, sy) < 48) good = false;
        for (j = 0; j < L.bump.length; j++) if (dist(L.bump[j].x, L.bump[j].y, sx, sy) < L.bump[j].r + 34) good = false;
        if (!good) break;
        L.stars.push({ x: R2(sx), y: R2(sy) });
      }
      if (!good) continue;

      var nH = sp.haz || 0, hz = [], hAll = [];
      if (nH) {
        var blank = S.simulate(L, [], {});
        for (var hi = 0; hi < nH; hi++) {
          var placedH = false;
          for (tries = 0; tries < 60 && !placedH; tries++) {
            var h, cx, cy;
            var useBlank = hi === 0 && blank.path.length > 40 && (sp.blockBlank !== false) && tries < 40;
            if (useBlank) {
              var bm = blank.path.length / 2, bi = Math.floor(bm * rnd(0.2, 0.8));
              cx = blank.path[bi * 2]; cy = blank.path[bi * 2 + 1];
            } else {
              var pi = Math.floor(e * rnd(0.12, 0.92)), tx = pre.path[pi * 2 + 2] - pre.path[pi * 2], ty = pre.path[pi * 2 + 3] - pre.path[pi * 2 + 1];
              var tl = Math.sqrt(tx * tx + ty * ty) || 1, off = (rng() < 0.5 ? -1 : 1) * rnd(70, 150);
              cx = pre.path[pi * 2] - ty / tl * off; cy = pre.path[pi * 2 + 1] + tx / tl * off;
            }
            if (rng() < (sp.rect || 0)) { var ww = rnd(70, 190), hh = rnd(34, 66); if (rng() < 0.5) { var tmp = ww; ww = hh; hh = tmp; } h = { t: 'b', x: R2(cx), y: R2(cy), w: R2(ww), h: R2(hh) }; }
            else h = { t: 'c', x: R2(cx), y: R2(cy), r: R2(rnd(24, 46)) };
            if (h.x < 50 || h.x > W - 50 || h.y < 70 || h.y > H - 70) continue;
            if (shapeClear(pre.path, h, e + 1) < S.PR + 22) continue;
            if (shapeDist(h, L.em.x, L.em.y) < 120 || shapeDist(h, gx, gy) < 80) continue;
            var bad = false;
            for (j = 0; j < L.stars.length; j++) if (shapeDist(h, L.stars[j].x, L.stars[j].y) < 50) bad = true;
            for (j = 0; j < hz.length; j++) if (Math.abs(hz[j].x - h.x) < 100 && Math.abs(hz[j].y - h.y) < 100) bad = true;
            for (j = 0; j < placed.length; j++) if (shapeDist(h, placed[j].x, placed[j].y) < 60) bad = true;
            for (j = 0; j < L.fixed.length; j++) if (shapeDist(h, L.fixed[j].x, L.fixed[j].y) < 60 || (L.fixed[j].orb && shapeDist(h, L.fixed[j].orb.cx, L.fixed[j].orb.cy) < L.fixed[j].orb.r + 60)) bad = true;
            for (j = 0; j < L.bump.length; j++) if (shapeDist(h, L.bump[j].x, L.bump[j].y) < L.bump[j].r + 20) bad = true;
            for (j = 0; j < L.portals.length; j++) if (shapeDist(h, L.portals[j].a.x, L.portals[j].a.y) < 70 || shapeDist(h, L.portals[j].b.x, L.portals[j].b.y) < 70) bad = true;
            if (bad) continue;
            hz.push(h); placedH = true;
          }
        }
        if (hz.length < Math.min(nH, sp.hazMin == null ? nH : sp.hazMin)) continue;
      }
      L.haz = hz;
      var ver = S.simulate(L, placed, {});
      if (ver.end !== 'goal' || ver.got < 3) continue;
      if (sp.needBlock && L.haz.length) {
        var bk = S.simulate(L, [], {});
        if (bk.end === 'goal') continue;
      }
      L.inv = placed.map(function (c) { return c.t; });
      L.sol = placed.map(function (c) { return { t: c.t, x: c.x, y: c.y }; });
      L.seed = seed;
      return L;
    }
    return null;
  }

  function winRate(L, n, seed) {
    var rng = S.mulberry(seed || 99), wins = 0, star3 = 0;
    for (var k = 0; k < n; k++) {
      var pl = L.inv.map(function (t) { return { t: t, x: 100 + rng() * (W - 200), y: 120 + rng() * (H - 240), k: 1 }; });
      var r = S.simulate(L, pl, { noPath: true });
      if (r.end === 'goal') { wins++; if (r.got === 3) star3++; }
    }
    return { win: wins / n, star3: star3 / n };
  }

  root.Gen = { gen: gen, winRate: winRate };
  if (typeof module !== 'undefined') module.exports = root.Gen;
})(typeof window !== 'undefined' ? window : globalThis);
