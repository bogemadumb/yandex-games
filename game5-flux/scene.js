(function (w) {
  var D = w.Draw, Sim = w.Sim, W = Sim.W, H = Sim.H, TAU = 6.283185;
  var HUES = [222, 268, 165, 246, 300, 190, 212, 262], SAT = [1, 1, 1, 1, 1, 1, 0.28, 0.3];
  function sat(world) { return SAT[((world || 1) - 1) % SAT.length]; }
  var CA = '56,240,214', CR = '255,92,124', CG = '255,210,90';

  function hue(world) { return HUES[((world || 1) - 1) % HUES.length]; }
  function bgGrad(c, cw, ch, world) {
    var h = hue(world), g = c.createLinearGradient(0, 0, 0, ch);
    var sa = sat(world); g.addColorStop(0, 'hsl(' + h + ',' + 48 * sa + '%,10%)'); g.addColorStop(1, 'hsl(' + ((h + 22) % 360) + ',' + 58 * sa + '%,' + (world === 8 ? 3 : 4.5) + '%)');
    c.fillStyle = g; c.fillRect(0, 0, cw, ch);
    var r = c.createRadialGradient(cw * 0.5, ch * 0.42, 0, cw * 0.5, ch * 0.42, Math.max(cw, ch) * 0.7);
    r.addColorStop(0, 'hsla(' + h + ',' + 70 * sa + '%,38%,0.20)'); r.addColorStop(1, 'hsla(' + h + ',' + 70 * sa + '%,38%,0)');
    c.fillStyle = r; c.fillRect(0, 0, cw, ch);
  }
  function panel(c, L, time) {
    var h = hue(L.world);
    D.rr(c, 0, 0, W, H, 30);
    c.fillStyle = 'hsla(' + h + ',' + 55 * sat(L.world) + '%,12%,0.62)'; c.fill();
    c.save(); D.rr(c, 0, 0, W, H, 30); c.clip();
    c.fillStyle = 'rgba(255,255,255,0.075)';
    for (var x = 50; x < W; x += 50) for (var y = 50; y < H; y += 50) c.fillRect(x - 1.5, y - 1.5, 3, 3);
    c.restore();
    D.rr(c, 0, 0, W, H, 30);
    if (L.bounce) {
      c.save(); c.globalCompositeOperation = 'lighter';
      c.lineWidth = 10; c.strokeStyle = 'rgba(255,255,255,' + (0.1 + 0.05 * Math.sin(time * 3)) + ')'; c.stroke();
      c.lineWidth = 3.5; c.strokeStyle = 'rgba(210,235,255,0.85)'; c.stroke(); c.restore();
    } else { c.lineWidth = 3; c.strokeStyle = 'hsla(' + h + ',80%,65%,0.34)'; c.stroke(); }
  }
  function charge(c, type, x, y, time, o) {
    o = o || {};
    var col = type === 'a' ? CA : CR, s = o.scale || 1, al = o.alpha == null ? 1 : o.alpha, k = Math.sqrt(o.k || 1);
    c.save(); c.translate(x, y); c.scale(s * k, s * k);
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = al * (o.ghost ? 0.55 : 1);
    c.drawImage(D.glow('rgba(' + col + ',0.55)', 160), -80, -80, 160, 160);
    c.lineWidth = 2.4;
    for (var i = 0; i < 3; i++) {
      var p = (time * 0.5 + i / 3) % 1, r, a;
      if (type === 'a') { r = 84 * (1 - p) + 16; a = Math.sin(p * Math.PI) * 0.6; } else { r = 16 + 84 * p; a = (1 - p) * 0.65; }
      c.strokeStyle = 'rgba(' + col + ',' + a + ')'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
    if (type === 'a') {
      c.fillStyle = '#031014'; c.beginPath(); c.arc(0, 0, 16, 0, TAU); c.fill();
      c.lineWidth = 3.4; c.strokeStyle = 'rgb(' + col + ')'; c.stroke();
      c.fillStyle = 'rgba(' + col + ',0.9)'; c.beginPath(); c.arc(0, 0, 4.6, 0, TAU); c.fill();
    } else {
      var gr = c.createRadialGradient(0, -3, 1, 0, 0, 15); gr.addColorStop(0, '#ffd0da'); gr.addColorStop(1, 'rgb(' + col + ')');
      c.fillStyle = gr; c.beginPath(); c.arc(0, 0, 14, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-6, 0); c.lineTo(6, 0); c.moveTo(0, -6); c.lineTo(0, 6); c.stroke();
    }
    if (o.fixed) {
      c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 2.4; c.setLineDash([6, 8]); c.lineDashOffset = -time * 14;
      c.beginPath(); c.arc(0, 0, 27, 0, TAU); c.stroke(); c.setLineDash([]);
    } else if (!o.noHalo) {
      c.strokeStyle = 'rgba(255,255,255,' + (0.18 + 0.12 * Math.sin(time * 4)) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 31, 0, TAU); c.stroke();
    }
    if (o.bad) { c.strokeStyle = 'rgba(255,60,60,0.95)'; c.lineWidth = 3.4; c.beginPath(); c.arc(0, 0, 34, 0, TAU); c.stroke(); }
    c.restore();
  }
  function orbitPath(c, ch, time) {
    c.save(); c.strokeStyle = 'rgba(255,255,255,0.13)'; c.lineWidth = 2; c.setLineDash([3, 9]);
    c.beginPath(); c.arc(ch.orb.cx, ch.orb.cy, ch.orb.r, 0, TAU); c.stroke(); c.setLineDash([]);
    var a = ch.orb.ph + (ch.orb.w > 0 ? 0.55 : -0.55), px = ch.orb.cx + Math.cos(a) * ch.orb.r, py = ch.orb.cy + Math.sin(a) * ch.orb.r;
    c.translate(px, py); c.rotate(a + (ch.orb.w > 0 ? Math.PI / 2 : -Math.PI / 2)); c.fillStyle = 'rgba(255,255,255,0.35)';
    c.beginPath(); c.moveTo(0, -7); c.lineTo(6, 5); c.lineTo(-6, 5); c.closePath(); c.fill();
    c.restore();
  }
  function hazard(c, h, time) {
    var pul = 0.5 + 0.5 * Math.sin(time * 3 + h.x * 0.01);
    c.save();
    function shape() { if (h.t === 'c') { c.beginPath(); c.arc(h.x, h.y, h.r, 0, TAU); } else D.rr(c, h.x - h.w / 2, h.y - h.h / 2, h.w, h.h, 9); }
    c.globalCompositeOperation = 'lighter';
    var gr = h.t === 'c' ? h.r + 22 : Math.max(h.w, h.h) / 2 + 18;
    c.globalAlpha = 0.28 + 0.12 * pul; c.drawImage(D.glow('rgba(255,30,90,0.6)', 128), h.x - gr * 1.5, h.y - gr * 1.5, gr * 3, gr * 3);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    shape(); c.fillStyle = 'rgba(40,4,22,0.92)'; c.fill();
    c.save(); shape(); c.clip();
    c.strokeStyle = 'rgba(255,50,100,0.42)'; c.lineWidth = 3.4;
    var bx = h.t === 'c' ? h.r : h.w / 2, by = h.t === 'c' ? h.r : h.h / 2, off = (time * 12) % 16;
    for (var d = -bx - by - 16; d < bx + by + 16; d += 16) { c.beginPath(); c.moveTo(h.x - bx + d + off, h.y - by); c.lineTo(h.x - bx + d + off + by * 2, h.y + by); c.stroke(); }
    c.restore();
    shape(); c.strokeStyle = 'rgba(255,60,110,' + (0.8 + 0.2 * pul) + ')'; c.lineWidth = 3.6; c.stroke();
    c.restore();
  }
  function bump(c, b, time, flash) {
    c.save(); var s = 1 + (flash || 0) * 0.12;
    c.translate(b.x, b.y); c.scale(s, s);
    c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.3 + (flash || 0) * 0.6; c.drawImage(D.glow('rgba(190,220,255,0.6)', 128), -b.r * 1.9, -b.r * 1.9, b.r * 3.8, b.r * 3.8);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    var gr = c.createRadialGradient(-b.r * 0.3, -b.r * 0.35, 2, 0, 0, b.r); gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(150,190,255,0.12)');
    c.fillStyle = gr; c.beginPath(); c.arc(0, 0, b.r, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(225,238,255,0.9)'; c.lineWidth = 3.2; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 2.4; c.beginPath(); c.arc(0, 0, b.r * 0.62, -2.6, -0.9); c.stroke();
    c.restore();
  }
  function portal(c, q, idx, time) {
    var col = idx ? '255,160,80' : '178,110,255';
    [q.a, q.b].forEach(function (e, k) {
      c.save(); c.translate(e.x, e.y);
      c.globalCompositeOperation = 'lighter'; c.drawImage(D.glow('rgba(' + col + ',0.6)', 128), -70, -70, 140, 140);
      for (var i = 0; i < 3; i++) {
        c.save(); c.rotate(time * (k ? -1.4 : 1.4) * (1 + i * 0.35) + i); c.strokeStyle = 'rgba(' + col + ',' + (0.85 - i * 0.22) + ')'; c.lineWidth = 3.2 - i * 0.6;
        c.setLineDash([10 + i * 4, 9]); c.beginPath(); c.arc(0, 0, 32 - i * 8, 0, TAU); c.stroke(); c.restore();
      }
      c.globalCompositeOperation = 'source-over'; c.fillStyle = 'rgba(8,2,20,0.85)'; c.beginPath(); c.arc(0, 0, 12, 0, TAU); c.fill();
      c.restore();
    });
  }
  function goal(c, g, time, pulse) {
    var s = 1 + 0.05 * Math.sin(time * 3) + (pulse || 0);
    c.save(); c.translate(g.x, g.y); c.scale(s, s);
    c.globalCompositeOperation = 'lighter'; c.drawImage(D.glow('rgba(' + CG + ',0.55)', 192), -100, -100, 200, 200);
    c.strokeStyle = 'rgba(' + CG + ',0.95)'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, g.r - 6, 0, TAU); c.stroke();
    c.save(); c.rotate(time * 0.9); c.setLineDash([14, 12]); c.lineWidth = 3; c.strokeStyle = 'rgba(255,240,180,0.8)'; c.beginPath(); c.arc(0, 0, g.r + 8, 0, TAU); c.stroke(); c.restore();
    c.fillStyle = 'rgba(' + CG + ',0.3)'; c.beginPath(); c.arc(0, 0, g.r - 6, 0, TAU); c.fill();
    c.globalCompositeOperation = 'source-over'; c.fillStyle = '#fff6cf'; c.beginPath(); c.arc(0, 0, 6, 0, TAU); c.fill();
    c.restore();
  }
  function starIcon(c, x, y, time, o) {
    o = o || {};
    var s = (o.scale || 1) * (1 + 0.08 * Math.sin(time * 4 + x)), al = o.alpha == null ? 1 : o.alpha;
    c.save(); c.translate(x, y + Math.sin(time * 2 + y) * 2); c.globalAlpha = al;
    c.globalCompositeOperation = 'lighter'; c.drawImage(D.glow('rgba(255,225,110,' + (o.lit ? 0.9 : 0.5) + ')', 96), -46 * s, -46 * s, 92 * s, 92 * s);
    c.globalCompositeOperation = 'source-over'; c.rotate(Math.sin(time * 1.3 + x) * 0.15);
    D.star4(c, 0, 0, 20 * s, 0.34); c.fillStyle = o.lit ? '#fff9d6' : '#ffd95a'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#fff6c0'; c.stroke();
    c.restore();
  }
  function emitter(c, em, time, hidden) {
    var ang = Math.atan2(em.vy, em.vx), sp = Math.sqrt(em.vx * em.vx + em.vy * em.vy);
    c.save(); c.translate(em.x, em.y);
    c.globalCompositeOperation = 'lighter'; c.drawImage(D.glow('rgba(255,255,255,0.35)', 128), -50, -50, 100, 100);
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 3.2; c.beginPath(); c.arc(0, 0, 21, 0, TAU); c.stroke();
    c.rotate(ang);
    for (var i = 0; i < 3; i++) {
      var p = (time * 1.3 + i / 3) % 1, x = 30 + p * 54;
      c.strokeStyle = 'rgba(255,255,255,' + Math.sin(p * Math.PI) * 0.85 + ')'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(x - 6, -8); c.lineTo(x + 3, 0); c.lineTo(x - 6, 8); c.stroke();
    }
    c.restore();
  }
  function previewLine(c, pv, L, time, mode, tint) {
    if (!pv || !pv.path) return;
    var p = pv.path, n = p.length / 2, use = n;
    if (mode === 1) use = Math.max(2, Math.floor(n * 0.36)); else if (mode === 0) use = Math.min(n, 14);
    if (use < 2) return;
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    function trace(a, b) { c.beginPath(); c.moveTo(p[a * 2], p[a * 2 + 1]); for (var i = a + 1; i < b; i++) c.lineTo(p[i * 2], p[i * 2 + 1]); }
    var col = tint || '255,255,255';
    c.globalCompositeOperation = 'lighter';
    var fadeFrom = mode === 2 ? use : Math.floor(use * 0.55);
    trace(0, fadeFrom); c.strokeStyle = 'rgba(' + col + ',0.07)'; c.lineWidth = 12; c.stroke();
    trace(0, fadeFrom); c.setLineDash([1, 15]); c.lineDashOffset = -time * 34; c.strokeStyle = 'rgba(' + col + ',0.85)'; c.lineWidth = 4.6; c.stroke();
    if (fadeFrom < use) {
      var chunk = 4, tot = use - fadeFrom;
      for (var a = fadeFrom; a < use - 1; a += chunk) {
        var b = Math.min(use, a + chunk + 1), al = 0.85 * (1 - (a - fadeFrom) / tot);
        trace(a, b); c.lineDashOffset = -time * 34 - a * 0; c.strokeStyle = 'rgba(' + col + ',' + al + ')'; c.stroke();
      }
    }
    c.setLineDash([]);
    if (mode === 2) {
      var x = pv.x, y = pv.y, e = pv.end;
      if (e === 'goal') { c.strokeStyle = 'rgba(' + CG + ',0.9)'; c.lineWidth = 3; c.beginPath(); c.arc(L.goal.x, L.goal.y, L.goal.r + 14 + 4 * Math.sin(time * 6), 0, TAU); c.stroke(); }
      else if (e === 'hit' || e === 'out' || e === 'absorb') {
        c.strokeStyle = e === 'absorb' ? 'rgba(' + CA + ',0.95)' : 'rgba(255,70,90,0.95)'; c.lineWidth = 4.2;
        c.beginPath(); c.moveTo(x - 9, y - 9); c.lineTo(x + 9, y + 9); c.moveTo(x + 9, y - 9); c.lineTo(x - 9, y + 9); c.stroke();
      } else { c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); }
    }
    c.restore();
  }
  function hintGhost(c, g, time) {
    c.save(); c.translate(g.x, g.y);
    var pul = 0.5 + 0.5 * Math.sin(time * 4), col = g.t === 'a' ? CA : CR;
    c.strokeStyle = 'rgba(' + col + ',' + (0.55 + 0.4 * pul) + ')'; c.lineWidth = 4; c.setLineDash([9, 8]); c.lineDashOffset = -time * 26;
    c.beginPath(); c.arc(0, 0, 38 + pul * 4, 0, TAU); c.stroke(); c.setLineDash([]);
    c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.35 + 0.3 * pul; c.drawImage(D.glow('rgba(' + col + ',0.8)', 128), -50, -50, 100, 100);
    c.restore();
  }
  w.Scene = { hue: hue, bgGrad: bgGrad, panel: panel, charge: charge, orbitPath: orbitPath, hazard: hazard, bump: bump, portal: portal, goal: goal, starIcon: starIcon, emitter: emitter, previewLine: previewLine, hintGhost: hintGhost, CA: CA, CR: CR, CG: CG };
})(window);
