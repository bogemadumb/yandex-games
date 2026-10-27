(function (root) {
  var W = 900, H = 1200, DT = 1 / 120, TMAX = 16, REC = 2;
  var G = 32000, SOFT = 42, PR = 8, CORE = 17, SPD_MAX = 620;
  var STAR_R = 17, GOAL_ASSIST = 95;

  function mulberry(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pos(c, t) {
    if (!c.orb) return [c.x, c.y];
    var a = c.orb.ph + c.orb.w * t;
    return [c.orb.cx + Math.cos(a) * c.orb.r, c.orb.cy + Math.sin(a) * c.orb.r];
  }

  function rectDist(h, x, y) {
    var dx = Math.max(Math.abs(x - h.x) - h.w / 2, 0), dy = Math.max(Math.abs(y - h.y) - h.h / 2, 0);
    return Math.sqrt(dx * dx + dy * dy);
  }

  function simulate(L, placed, opt) {
    opt = opt || {};
    var tmax = opt.tmax || TMAX, rec = opt.rec || REC, noPath = opt.noPath;
    var ch = L.fixed.concat(placed || []);
    var n = ch.length;
    var px = L.em.x, py = L.em.y, vx = L.em.vx, vy = L.em.vy;
    var path = noPath ? null : [px, py];
    var stars = L.stars ? L.stars.map(function () { return false; }) : [];
    var cd = 0, steps = Math.floor(tmax / DT), end = 'timeout', k, i, t = 0, last = null;
    var bumpHits = 0;
    for (k = 0; k < steps; k++) {
      t = k * DT;
      var ax = 0, ay = 0;
      for (i = 0; i < n; i++) {
        var c = ch[i], cp = c.orb ? pos(c, t) : null, cx = cp ? cp[0] : c.x, cy = cp ? cp[1] : c.y;
        var dx = cx - px, dy = cy - py, r2 = dx * dx + dy * dy;
        var f = (c.t === 'a' ? 1 : -1) * G * (c.k || 1) / (r2 + SOFT * SOFT);
        ax += f * dx; ay += f * dy;
        if (c.t === 'a' && r2 < CORE * CORE) { end = 'absorb'; last = [cx, cy]; break; }
      }
      if (end === 'absorb') break;
      var gx = L.goal.x - px, gy = L.goal.y - py, gd = Math.sqrt(gx * gx + gy * gy);
      if (gd < L.goal.r - 6) { end = 'goal'; break; }
      if (gd < GOAL_ASSIST && gd > 0.001) { var ga = 520 * (1 - gd / GOAL_ASSIST); ax += gx / gd * ga; ay += gy / gd * ga; }
      vx += ax * DT; vy += ay * DT;
      var sp = Math.sqrt(vx * vx + vy * vy);
      if (sp > SPD_MAX) { vx *= SPD_MAX / sp; vy *= SPD_MAX / sp; }
      px += vx * DT; py += vy * DT;
      var hz = L.haz, hit = false;
      if (hz) for (i = 0; i < hz.length; i++) {
        var h = hz[i];
        if (h.t === 'c') { if ((px - h.x) * (px - h.x) + (py - h.y) * (py - h.y) < (h.r + PR) * (h.r + PR)) { hit = true; break; } }
        else if (rectDist(h, px, py) < PR) { hit = true; break; }
      }
      if (hit) { end = 'hit'; break; }
      var bp = L.bump;
      if (bp) for (i = 0; i < bp.length; i++) {
        var b = bp[i], bx = px - b.x, by = py - b.y, bd = Math.sqrt(bx * bx + by * by), rr = b.r + PR;
        if (bd < rr && bd > 0.001) {
          var nx = bx / bd, ny = by / bd, dv = vx * nx + vy * ny;
          if (dv < 0) { vx -= 2 * dv * nx; vy -= 2 * dv * ny; var s2 = Math.sqrt(vx * vx + vy * vy); if (s2 < 140) { vx *= 1.4; vy *= 1.4; } bumpHits++; }
          px = b.x + nx * rr; py = b.y + ny * rr;
        }
      }
      var po = L.portals;
      if (cd > 0) cd--;
      else if (po) for (i = 0; i < po.length; i++) {
        var q = po[i], d1 = (px - q.a.x) * (px - q.a.x) + (py - q.a.y) * (py - q.a.y), d2 = (px - q.b.x) * (px - q.b.x) + (py - q.b.y) * (py - q.b.y);
        if (d1 < q.r * q.r) { px = q.b.x; py = q.b.y; cd = 70; break; }
        if (d2 < q.r * q.r) { px = q.a.x; py = q.a.y; cd = 70; break; }
      }
      var m = 0;
      if (px < m + PR || px > W - m - PR) { if (L.bounce) { vx = -vx; px = px < W / 2 ? PR : W - PR; bumpHits++; } else { end = 'out'; break; } }
      if (py < m + PR || py > H - m - PR) { if (L.bounce) { vy = -vy; py = py < H / 2 ? PR : H - PR; bumpHits++; } else { end = 'out'; break; } }
      var st = L.stars;
      if (st) for (i = 0; i < st.length; i++) if (!stars[i]) {
        var sx = px - st[i].x, sy = py - st[i].y;
        if (sx * sx + sy * sy < (STAR_R + PR) * (STAR_R + PR)) { stars[i] = k; }
      }
      if (path && k % rec === 0) path.push(px, py);
    }
    if (path) path.push(px, py);
    var got = 0; for (i = 0; i < stars.length; i++) if (stars[i] !== false) got++;
    return { end: end, path: path, t: k * DT, stars: stars, got: got, x: px, y: py, bumps: bumpHits, absorbAt: last, rec: rec };
  }

  function blankLevel(L) { return L; }

  root.Sim = { W: W, H: H, DT: DT, TMAX: TMAX, REC: REC, PR: PR, CORE: CORE, SOFT: SOFT, STAR_R: STAR_R, mulberry: mulberry, pos: pos, simulate: simulate, rectDist: rectDist };
  if (typeof module !== 'undefined') module.exports = root.Sim;
})(typeof window !== 'undefined' ? window : globalThis);
