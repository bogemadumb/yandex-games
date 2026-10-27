(function (w) {
  var D = w.Draw, Sim = w.Sim, W = Sim.W, H = Sim.H;
  var P = [], shakeAmp = 0, shakeT = 0, MAXP = 600;

  function burst(x, y, n, o) {
    o = o || {};
    for (var i = 0; i < n; i++) {
      if (P.length >= MAXP) P.shift();
      var a = o.dir != null ? o.dir + (Math.random() - 0.5) * (o.spread || 1) : Math.random() * 6.283;
      var sp = (o.sp || 160) * (0.35 + Math.random() * 0.9);
      P.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, l: (o.life || 0.8) * (0.6 + Math.random() * 0.6), m: 0, s: (o.size || 4) * (0.6 + Math.random() * 0.8), c: o.c || '255,230,140', g: o.g || 0, d: o.d == null ? 1.6 : o.d, k: o.k || 'c', r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 8 });
      P[P.length - 1].m = P[P.length - 1].l;
    }
  }
  function ring(x, y, c, size, life) {
    if (P.length >= MAXP) P.shift();
    P.push({ x: x, y: y, vx: 0, vy: 0, l: life || 0.7, m: life || 0.7, s: size || 90, c: c || '255,230,140', g: 0, d: 0, k: 'r', r: 0, vr: 0 });
  }
  function update(dt) {
    for (var i = P.length - 1; i >= 0; i--) {
      var p = P[i]; p.l -= dt;
      if (p.l <= 0) { P.splice(i, 1); continue; }
      p.vx -= p.vx * p.d * dt; p.vy -= p.vy * p.d * dt; p.vy += p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
    }
    if (shakeAmp > 0.1) { shakeT += dt; shakeAmp *= Math.pow(0.002, dt); } else shakeAmp = 0;
  }
  function draw(c) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (var i = 0; i < P.length; i++) {
      var p = P[i], f = p.l / p.m, a = f < 0.5 ? f * 2 : 1;
      if (p.k === 'r') {
        var t = 1 - f; c.strokeStyle = 'rgba(' + p.c + ',' + (a * 0.7 * f) + ')'; c.lineWidth = 3 + 5 * f;
        c.beginPath(); c.arc(p.x, p.y, p.s * D.ease(t), 0, 6.283); c.stroke(); continue;
      }
      c.fillStyle = 'rgba(' + p.c + ',' + (a * 0.9) + ')';
      if (p.k === 's') { c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); c.restore(); }
      else if (p.k === 'p') { c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.beginPath(); c.ellipse(0, 0, p.s * 1.3, p.s * 0.65, 0, 0, 6.283); c.fill(); c.restore(); }
      else if (p.k === 't') { D.star4(c, p.x, p.y, p.s * 1.6, 0.3); c.fill(); }
      else { c.beginPath(); c.arc(p.x, p.y, p.s * (0.4 + 0.6 * f), 0, 6.283); c.fill(); }
    }
    c.restore();
  }
  function shake(a) { shakeAmp = Math.max(shakeAmp, a); }
  function shakeOff() { return shakeAmp > 0.1 ? [Math.sin(shakeT * 91) * shakeAmp, Math.cos(shakeT * 77) * shakeAmp] : [0, 0]; }
  function clear() { P.length = 0; shakeAmp = 0; }

  // ---- flow dust ----
  var dust = [];
  function dustInit(n) {
    dust.length = 0;
    for (var i = 0; i < n; i++) dust.push({ x: Math.random() * W, y: Math.random() * H, age: Math.random() * 6, life: 4 + Math.random() * 5, dx: 0, dy: 0, inf: 0 });
  }
  function field(ch, x, y) {
    var ax = 0, ay = 0, inf = 0;
    for (var i = 0; i < ch.length; i++) {
      var c = ch[i], dx = c.x - x, dy = c.y - y, r2 = dx * dx + dy * dy, s = c.t === 'a' ? 1 : -1, f = s * Sim.SOFT * 0 + s * 32000 * (c.k || 1) / (r2 + 1764);
      ax += f * dx; ay += f * dy; inf += s * (c.k || 1) / (1 + r2 / 40000);
    }
    return [ax, ay, inf];
  }
  function dustUpdate(dt, ch) {
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i]; d.age += dt;
      var f = field(ch, d.x, d.y), m = Math.sqrt(f[0] * f[0] + f[1] * f[1]);
      var sp = m > 0.5 ? Math.min(110, 18 + m * 0.55) : 12;
      if (m > 0.5) { d.dx = f[0] / m; d.dy = f[1] / m; } else { d.dx = Math.cos(d.age * 0.7 + i); d.dy = Math.sin(d.age * 0.5 + i * 2); }
      d.x += d.dx * sp * dt; d.y += d.dy * sp * dt; d.inf = f[2]; d.sp = sp;
      var near = false;
      for (var j = 0; j < ch.length; j++) if (ch[j].t === 'a') { var ex = ch[j].x - d.x, ey = ch[j].y - d.y; if (ex * ex + ey * ey < 400) near = true; }
      if (d.age > d.life || d.x < 0 || d.x > W || d.y < 0 || d.y > H || near) { d.x = Math.random() * W; d.y = Math.random() * H; d.age = 0; d.life = 4 + Math.random() * 5; d.sp = 0; }
    }
  }
  function dustDraw(c, alpha) {
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineWidth = 2.2;
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i], t = d.age / d.life, a = Math.sin(Math.PI * Math.min(1, t)) * alpha, len = 5 + (d.sp || 10) * 0.28;
      var col = d.inf > 0.12 ? '70,235,215' : d.inf < -0.12 ? '255,100,130' : '150,170,230';
      c.strokeStyle = 'rgba(' + col + ',' + a * (Math.abs(d.inf) > 0.12 ? 0.55 : 0.32) + ')';
      c.beginPath(); c.moveTo(d.x - d.dx * len, d.y - d.dy * len); c.lineTo(d.x, d.y); c.stroke();
    }
    c.restore();
  }

  // ---- skins / trail ----
  var SKINS = [
    { id: 'spark', cost: 0, a: '255,236,170', b: '255,190,70', n: { ru: 'Искра', en: 'Spark', tr: 'Kıvılcım' } },
    { id: 'comet', cost: 60, a: '170,235,255', b: '60,130,255', n: { ru: 'Комета', en: 'Comet', tr: 'Kuyruklu yıldız' } },
    { id: 'ember', cost: 120, a: '255,200,110', b: '255,70,40', n: { ru: 'Уголёк', en: 'Ember', tr: 'Kor' } },
    { id: 'petal', cost: 200, a: '255,215,230', b: '255,110,170', n: { ru: 'Лепестки', en: 'Petals', tr: 'Yapraklar' } },
    { id: 'glitch', cost: 320, a: '70,255,170', b: '255,60,210', n: { ru: 'Глитч', en: 'Glitch', tr: 'Glitch' } },
    { id: 'rainbow', cost: 500, a: '255,255,255', b: '255,255,255', n: { ru: 'Радуга', en: 'Rainbow', tr: 'Gökkuşağı' } }
  ];
  function hue2rgb(h) {
    h = ((h % 360) + 360) % 360 / 60; var x = 1 - Math.abs(h % 2 - 1), r = 0, g = 0, b = 0;
    if (h < 1) { r = 1; g = x; } else if (h < 2) { r = x; g = 1; } else if (h < 3) { g = 1; b = x; } else if (h < 4) { g = x; b = 1; } else if (h < 5) { r = x; b = 1; } else { r = 1; b = x; }
    return Math.round(70 + r * 185) + ',' + Math.round(70 + g * 185) + ',' + Math.round(70 + b * 185);
  }
  // pts: [{x,y,a}] oldest first, a = age in s
  function trail(c, pts, skinIdx, time, headScale) {
    var sk = SKINS[skinIdx] || SKINS[0], n = pts.length;
    if (n < 2) return;
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
    for (var pass = 0; pass < 2; pass++) {
      for (var i = 1; i < n; i++) {
        var p0 = pts[i - 1], p1 = pts[i], f = 1 - p1.a / 1.1; if (f <= 0) continue;
        var col = skinIdx === 5 ? hue2rgb(i * 7 + time * 80) : (pass ? sk.a : sk.b);
        var jx = 0, jy = 0;
        if (skinIdx === 4 && pass === 0) { jx = Math.sin(i * 12.9 + time * 40) * 3 * f; jy = Math.cos(i * 7.7 + time * 33) * 3 * f; }
        c.strokeStyle = 'rgba(' + col + ',' + (pass ? f * 0.95 : f * 0.28) + ')';
        c.lineWidth = (pass ? 3.2 : 13) * (0.25 + 0.75 * f);
        c.beginPath(); c.moveTo(p0.x + jx, p0.y + jy); c.lineTo(p1.x + jx, p1.y + jy); c.stroke();
      }
    }
    c.restore();
  }
  function head(c, x, y, skinIdx, time, scale) {
    var sk = SKINS[skinIdx] || SKINS[0], s = scale || 1, gcol = 'rgba(' + (skinIdx === 5 ? hue2rgb(time * 120) : sk.b) + ',0.9)';
    c.save(); c.globalCompositeOperation = 'lighter';
    c.drawImage(D.glow(gcol, 128), x - 44 * s, y - 44 * s, 88 * s, 88 * s);
    c.restore();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, 6.2 * s, 0, 6.283); c.fill();
    c.fillStyle = 'rgba(' + (skinIdx === 5 ? hue2rgb(time * 120) : sk.a) + ',0.9)'; c.beginPath(); c.arc(x, y, 3.4 * s, 0, 6.283); c.fill();
  }
  function emitTrailFx(x, y, skinIdx, vx, vy) {
    var ang = Math.atan2(-vy, -vx);
    if (skinIdx === 2 && Math.random() < 0.8) burst(x, y, 1, { c: Math.random() < 0.5 ? '255,160,60' : '255,90,40', sp: 40, size: 3, life: 0.9, g: -90, d: 1, dir: -1.57, spread: 1.5 });
    else if (skinIdx === 3 && Math.random() < 0.35) burst(x, y, 1, { c: '255,170,205', sp: 50, size: 4, life: 1.1, g: 30, k: 'p', d: 1, dir: ang, spread: 2.5 });
    else if (skinIdx === 4 && Math.random() < 0.5) burst(x, y, 1, { c: Math.random() < 0.5 ? '70,255,170' : '255,60,210', sp: 80, size: 5, life: 0.5, k: 's', d: 3, dir: ang, spread: 3.2 });
    else if (skinIdx === 1 && Math.random() < 0.35) burst(x, y, 1, { c: '190,235,255', sp: 30, size: 2.6, life: 0.7, k: 't', d: 1.2, dir: ang, spread: 3 });
    else if (skinIdx === 0 && Math.random() < 0.25) burst(x, y, 1, { c: '255,225,150', sp: 30, size: 2.2, life: 0.55, k: 't', d: 1.2, dir: ang, spread: 3 });
    else if (skinIdx === 5 && Math.random() < 0.4) burst(x, y, 1, { c: hue2rgb(Math.random() * 360), sp: 40, size: 2.8, life: 0.7, d: 1.2, dir: ang, spread: 3 });
  }

  w.FX = { burst: burst, ring: ring, update: update, draw: draw, shake: shake, shakeOff: shakeOff, clear: clear, dustInit: dustInit, dustUpdate: dustUpdate, dustDraw: dustDraw, field: field, SKINS: SKINS, trail: trail, head: head, emitTrailFx: emitTrailFx, hue2rgb: hue2rgb };
})(window);
