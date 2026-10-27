(function (w) {
  var TAU = Math.PI * 2;
  function rr(c, x, y, wd, h, r) {
    r = Math.min(r, wd / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + wd, y, x + wd, y + h, r); c.arcTo(x + wd, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + wd, y, r); c.closePath();
  }
  function hx(h) { var m = parseInt(h.slice(1), 16); return [m >> 16, (m >> 8) & 255, m & 255]; }
  function mix(a, b, k) {
    var A = hx(a), B = hx(b);
    return 'rgb(' + Math.round(A[0] + (B[0] - A[0]) * k) + ',' + Math.round(A[1] + (B[1] - A[1]) * k) + ',' + Math.round(A[2] + (B[2] - A[2]) * k) + ')';
  }
  function lin(c, x0, y0, x1, y1, stops) {
    var g = c.createLinearGradient(x0, y0, x1, y1);
    for (var i = 0; i < stops.length; i += 2) g.addColorStop(stops[i], stops[i + 1]);
    return g;
  }
  function circ(c, x, y, r, fill, stroke, lw) {
    c.beginPath(); c.arc(x, y, r, 0, TAU);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.lineWidth = lw || 1; c.strokeStyle = stroke; c.stroke(); }
  }
  function seeded(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function sky(c, x, y, wd, h, t) {
    c.fillStyle = lin(c, 0, y, 0, y + h, [0, '#59c7ff', 0.55, '#a8e6ff', 1, '#ffeec2']);
    c.fillRect(x, y, wd, h);
    var sx = x + wd * 0.82, sy = y + h * 0.2, R = Math.min(wd, h) * 0.075;
    var g = c.createRadialGradient(sx, sy, R * 0.4, sx, sy, R * 3.2);
    g.addColorStop(0, 'rgba(255,244,170,.9)'); g.addColorStop(1, 'rgba(255,244,170,0)');
    c.fillStyle = g; c.fillRect(sx - R * 3.2, sy - R * 3.2, R * 6.4, R * 6.4);
    circ(c, sx, sy, R, '#fff3a0');
    var cl = [[0.1, 0.14, 1.1, 9], [0.45, 0.3, 0.8, 12], [0.7, 0.1, 0.9, 7], [0.25, 0.42, 0.6, 14]];
    c.fillStyle = 'rgba(255,255,255,.88)';
    for (var i = 0; i < cl.length; i++) {
      var q = cl[i], u = ((q[0] + t * q[3] * 0.0016) % 1.3) - 0.15, cxp = x + u * wd, cyp = y + q[1] * h, s = q[2] * Math.min(wd, h) * 0.09;
      c.beginPath(); c.arc(cxp, cyp, s, 0, TAU); c.arc(cxp + s * 1.1, cyp + s * 0.15, s * 0.8, 0, TAU); c.arc(cxp - s * 1.1, cyp + s * 0.25, s * 0.7, 0, TAU); c.arc(cxp + s * 0.2, cyp - s * 0.45, s * 0.75, 0, TAU); c.fill();
    }
  }

  var FAR = ['#c9a5f0', '#9fd1f7', '#f7b7c7', '#b4e4c1', '#ffd49a', '#a9b9f5'];
  function skyline(c, x0, x1, base, sc, seed, shade, alpha) {
    var r = seeded(seed), x = x0 - 30 * sc;
    c.globalAlpha = alpha == null ? 1 : alpha;
    while (x < x1) {
      var bw = (26 + r() * 30) * sc, bh = (40 + r() * 90) * sc, col = FAR[Math.floor(r() * FAR.length)];
      c.fillStyle = mix(col, shade || '#ffffff', 0.35);
      c.fillRect(x, base - bh, bw, bh);
      if (r() < 0.4) { c.fillStyle = mix(col, '#2d3a78', 0.18); c.fillRect(x + bw * 0.1, base - bh - 6 * sc, bw * 0.8, 6 * sc); }
      c.fillStyle = 'rgba(255,255,255,.55)';
      var cols = Math.max(2, Math.floor(bw / (9 * sc)));
      for (var ry = base - bh + 8 * sc; ry < base - 8 * sc; ry += 12 * sc) for (var k = 0; k < cols; k++) if (r() < 0.7) c.fillRect(x + 4 * sc + k * ((bw - 8 * sc) / cols), ry, 4 * sc, 5 * sc);
      x += bw + (r() * 4) * sc;
    }
    c.globalAlpha = 1;
  }

  function ground(c, x, y, wd, h, sc) {
    c.fillStyle = lin(c, 0, y, 0, y + h, [0, '#f2d9a8', 1, '#e0b878']);
    c.fillRect(x, y, wd, h);
    c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x, y, wd, 3 * sc);
    c.fillStyle = 'rgba(255,255,255,.45)';
    for (var tx = x - ((x % (46 * sc)) + 46 * sc) % (46 * sc); tx < x + wd; tx += 46 * sc) c.fillRect(tx, y + 18 * sc, 24 * sc, 3 * sc);
  }

  function stripedAwning(c, x0, x1, ytop, hh, n, ca, cb, scallop) {
    var wd = (x1 - x0) / n;
    for (var i = 0; i < n; i++) {
      c.fillStyle = i % 2 ? cb : ca;
      c.beginPath(); c.moveTo(x0 + i * wd, ytop); c.lineTo(x0 + (i + 1) * wd, ytop); c.lineTo(x0 + (i + 1) * wd, ytop + hh);
      if (scallop) c.arc(x0 + (i + 0.5) * wd, ytop + hh, wd / 2, 0, Math.PI);
      c.lineTo(x0 + i * wd, ytop + hh); c.closePath(); c.fill();
    }
  }
  function wheel(c, x, y, r) {
    circ(c, x, y, r, '#3a3d4a'); circ(c, x, y, r * 0.55, '#c9ced9'); circ(c, x, y, r * 0.22, '#6b7285');
  }
  function glowLamp(c, x, y, r, col, a) {
    var g = c.createRadialGradient(x, y, 0, x, y, r * 3);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,200,80,0)');
    c.globalAlpha = a == null ? 0.7 : a; c.fillStyle = g; c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); c.globalAlpha = 1;
    circ(c, x, y, r * 0.5, '#fff7c4');
  }

  function spit(c, x, yb, hgt, rot, squash, fire) {
    var wt = hgt * 0.27, wb = hgt * 0.15, sy = 1 + squash * 0.07, sx = 1 - squash * 0.07;
    c.save(); c.translate(x, yb); c.scale(sx, sy);
    c.fillStyle = '#9aa3b5'; c.fillRect(-1.2, -hgt - 8, 2.4, hgt + 8);
    c.fillStyle = '#e24a3b'; circ(c, 0, -hgt - 8, 3.5, '#e24a3b');
    c.beginPath(); c.moveTo(-wb, 0); c.lineTo(-wt, -hgt); c.quadraticCurveTo(0, -hgt - wt * 0.35, wt, -hgt); c.lineTo(wb, 0); c.quadraticCurveTo(0, wb * 0.3, -wb, 0); c.closePath();
    c.fillStyle = lin(c, -wt, 0, wt, 0, [0, '#8a4a1f', 0.3, '#d98a3d', 0.55, '#b86a2a', 1, '#6e3714']); c.fill();
    c.save(); c.clip();
    var bands = 9;
    for (var i = 0; i < bands; i++) {
      var f = i / bands, y0 = -hgt * f, y1 = -hgt * (f + 1 / bands), ww = wb + (wt - wb) * (f + 0.5 / bands);
      for (var k = 0; k < 5; k++) {
        var ph = rot + k * 1.26 + i * 0.5, xx = Math.sin(ph) * ww * 0.92, vis = Math.cos(ph);
        if (vis < 0) continue;
        c.fillStyle = (i + k) % 2 ? 'rgba(255,220,150,' + (0.25 * vis) + ')' : 'rgba(90,40,10,' + (0.35 * vis) + ')';
        c.fillRect(xx - ww * 0.12, y1, ww * 0.24, y0 - y1);
      }
      c.fillStyle = i % 2 ? 'rgba(60,25,5,.22)' : 'rgba(255,235,180,.12)';
      c.fillRect(-wt, y1, wt * 2, (y0 - y1) * 0.5);
    }
    c.fillStyle = lin(c, -wt, 0, wt, 0, [0, 'rgba(0,0,0,.35)', 0.3, 'rgba(255,255,255,.18)', 0.6, 'rgba(0,0,0,0)', 1, 'rgba(0,0,0,.4)']);
    c.fillRect(-wt, -hgt, wt * 2, hgt);
    c.restore();
    c.restore();
  }

  function flame(c, x, y, s, t, k) {
    for (var i = 0; i < 5; i++) {
      var ph = t * 9 + i * 1.7, h = (14 + 9 * Math.sin(ph)) * s * k, wd = 6 * s;
      var fx = x + (i - 2) * 7 * s;
      c.fillStyle = i % 2 ? '#ff8a1f' : '#ffcc2e';
      c.beginPath(); c.moveTo(fx - wd, y); c.quadraticCurveTo(fx - wd * 0.2, y - h * 0.6, fx + Math.sin(ph) * 2 * s, y - h); c.quadraticCurveTo(fx + wd * 0.2, y - h * 0.6, fx + wd, y); c.closePath(); c.fill();
    }
  }

  function stand(c, tier, x, y, s, t, o) {
    o = o || {};
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = 'rgba(70,40,0,.16)'; c.beginPath(); c.ellipse(0, 1, tier === 7 ? 36 : tier === 6 ? 62 : tier >= 5 ? 50 : 52, 5, 0, 0, TAU); c.fill();
    var bob = Math.sin(t * 3 + tier) * 1.2;
    if (tier === 0) {
      wheel(c, -30, -10, 10); wheel(c, 30, -10, 10);
      c.fillStyle = '#2aa89a'; rr(c, -46, -52, 92, 40, 5); c.fill();
      c.fillStyle = '#1d8579'; c.fillRect(-46, -26, 92, 4);
      c.fillStyle = '#ffd34d'; rr(c, -30, -44, 60, 12, 4); c.fill();
      c.fillStyle = '#c3c9d6'; rr(c, -50, -57, 100, 6, 3); c.fill();
      c.fillStyle = '#8a5a2b'; c.fillRect(-46, -128, 4, 74); c.fillRect(42, -128, 4, 74);
      c.fillStyle = lin(c, 0, -100, 0, -50, [0, '#ff9a3d', 1, '#ffd24a']); rr(c, -26, -102, 52, 46, 4); c.fill();
      var fl = 0.12 * Math.sin(t * 17) + 0.1 * Math.sin(t * 7.3);
      c.fillStyle = 'rgba(255,90,0,' + (0.35 + fl) + ')'; rr(c, -26, -102, 52, 46, 4); c.fill();
      spit(c, -2, -57, 48, (o.rot || 0), o.squash || 0, o.fire);
      c.fillStyle = '#fff'; rr(c, 14, -62, 24, 5, 2.5); c.fill();
      for (var i = 0; i < 3; i++) { c.fillStyle = ['#e24a3b', '#8fd14f', '#f6d36a'][i]; circ(c, 18 + i * 8, -66, 3.4, c.fillStyle); }
      stripedAwning(c, -56, 56, -130, 24, 8, '#f04d4d', '#ffffff', true);
      c.fillStyle = '#c93a3a'; rr(c, -58, -134, 116, 6, 3); c.fill();
      if (o.sign) {
        c.fillStyle = '#23386e'; rr(c, -40, -156, 80, 20, 6); c.fill();
        c.strokeStyle = '#ffd34d'; c.lineWidth = 2; rr(c, -40, -156, 80, 20, 6); c.stroke();
        c.fillStyle = '#ffd34d'; c.font = '800 13px "Trebuchet MS",Arial,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.sign, 0, -146);
      }
    } else if (tier === 1) {
      c.fillStyle = '#ff8a3d'; rr(c, -34, -52, 68, 52, 5); c.fill();
      c.fillStyle = '#e06a22'; c.fillRect(-34, -12, 68, 4);
      c.fillStyle = '#7ad0ff'; rr(c, -24, -42, 48, 22, 4); c.fill();
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(-20, -22); c.lineTo(-8, -40); c.lineTo(-2, -40); c.lineTo(-14, -22); c.fill();
      c.fillStyle = '#c43d3d'; c.beginPath(); c.moveTo(-42, -52); c.lineTo(0, -76); c.lineTo(42, -52); c.closePath(); c.fill();
      c.fillStyle = '#9d2c2c'; c.fillRect(-42, -54, 84, 4);
      stripedAwning(c, -30, 30, -49, 8, 6, '#2fc45e', '#ffffff', true);
      c.fillStyle = '#fff'; rr(c, -9, -10, 18, 10, 3); c.fill();
      glowLamp(c, 0, -62 + bob * 0.3, 3, 'rgba(255,230,120,.9)', 0.5);
    } else if (tier === 2) {
      wheel(c, -30, -8, 9); wheel(c, 34, -8, 9);
      c.fillStyle = '#fff1cf'; rr(c, -54, -64, 78, 54, 6); c.fill();
      c.fillStyle = '#ffb340'; c.fillRect(-54, -26, 78, 8);
      c.fillStyle = '#e8453c'; rr(c, 22, -48, 36, 38, 6); c.fill();
      c.fillStyle = '#9fe0ff'; c.beginPath(); c.moveTo(30, -44); c.lineTo(48, -44); c.lineTo(54, -30); c.lineTo(30, -30); c.closePath(); c.fill();
      c.fillStyle = '#23386e'; rr(c, -42, -54, 46, 22, 4); c.fill();
      stripedAwning(c, -46, 8, -58, 8, 6, '#ff4d6d', '#ffffff', true);
      c.fillStyle = '#ffd34d'; rr(c, -44, -78, 52, 14, 5); c.fill();
      c.fillStyle = '#7a4a00'; c.font = '800 9px "Trebuchet MS",Arial,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('GO!', -18, -71);
      c.fillStyle = 'rgba(255,255,255,.5)'; circ(c, -40, -88 - ((t * 14) % 14), 3, 'rgba(255,255,255,' + (0.5 - ((t * 14) % 14) / 30) + ')');
    } else if (tier === 3) {
      c.fillStyle = '#ffe3b0'; rr(c, -18, -62, 52, 58, 4); c.fill();
      c.fillStyle = '#7ad0ff'; rr(c, -10, -52, 36, 24, 3); c.fill();
      c.fillStyle = '#b6761f'; rr(c, 10, -26, 18, 22, 3); c.fill();
      c.fillStyle = '#5a8f3a'; c.beginPath(); c.moveTo(-24, -62); c.lineTo(15, -80); c.lineTo(40, -62); c.closePath(); c.fill();
      [[-34, '#ff4d6d'], [8, '#ffcf3d']].forEach(function (u, k) {
        var ux = u[0] - (k ? 0 : 0);
        if (k === 1) ux = 40;
        c.fillStyle = '#7a4a1f'; c.fillRect(ux - 1, -52, 2, 50);
        c.fillStyle = u[1]; c.beginPath(); c.moveTo(ux - 22, -52); c.quadraticCurveTo(ux, -76, ux + 22, -52); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.moveTo(ux, -68); c.lineTo(ux - 6, -52); c.lineTo(ux, -52); c.closePath(); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ux, -14, 13, 4, 0, 0, TAU); c.fill();
        c.fillStyle = '#c8a46a'; c.fillRect(ux - 1.5, -14, 3, 12);
      });
    } else if (tier === 4) {
      c.fillStyle = '#2b2f6b'; rr(c, -44, -50, 88, 50, 5); c.fill();
      c.fillStyle = '#ffb340'; c.fillRect(-44, -20, 88, 5);
      c.fillStyle = '#1c1f4a'; rr(c, -36, -44, 72, 24, 4); c.fill();
      c.beginPath(); c.moveTo(-52, -50); c.lineTo(-40, -74); c.lineTo(40, -74); c.lineTo(52, -50); c.closePath(); c.fillStyle = '#e8453c'; c.fill();
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-60, -66); c.quadraticCurveTo(0, -48, 60, -66); c.stroke();
      for (var l = 0; l < 7; l++) {
        var lx = -57 + l * 19, ly = -62 + Math.sin((lx + 60) / 120 * Math.PI) * 10 + Math.sin(t * 2 + l) * 0.8;
        glowLamp(c, lx, ly + 2, 4.2, l % 2 ? 'rgba(255,90,70,.95)' : 'rgba(255,200,60,.95)', 0.55);
        circ(c, lx, ly + 2, 3.6, l % 2 ? '#ff5a46' : '#ffc43d');
      }
      c.fillStyle = '#fff'; c.font = '800 10px "Trebuchet MS",Arial,sans-serif'; c.textAlign = 'center'; c.fillText('★ ★ ★', 0, -30);
    } else if (tier === 5) {
      c.fillStyle = '#d4573f'; rr(c, -46, -80, 92, 80, 4); c.fill();
      c.fillStyle = 'rgba(0,0,0,.1)';
      for (var by = -78; by < -2; by += 8) c.fillRect(-46, by, 92, 1.2);
      c.fillStyle = '#8f2e22'; c.fillRect(-50, -86, 100, 8);
      c.fillStyle = '#ffeaa8'; rr(c, -34, -70, 30, 26, 3); c.fill(); rr(c, 4, -70, 30, 26, 3); c.fill();
      c.fillStyle = 'rgba(255,200,80,.7)'; c.fillRect(-32, -30, 4, 0);
      c.fillStyle = '#7a3b18'; rr(c, -9, -36, 18, 36, [9, 9, 0, 0][0]); c.fill();
      stripedAwning(c, -40, 40, -48, 10, 8, '#fff', '#2f9e5a', true);
      c.fillStyle = '#23386e'; rr(c, -26, -102, 52, 16, 5); c.fill();
      c.fillStyle = '#ffd34d'; c.font = '800 10px "Trebuchet MS",Arial,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('RESTO', 0, -94);
    } else if (tier === 6) {
      c.fillStyle = '#e9f4ff'; rr(c, -62, -62, 124, 62, 4); c.fill();
      c.fillStyle = lin(c, 0, -58, 0, -4, [0, '#7fd0ff', 1, '#d9f1ff']); rr(c, -56, -56, 112, 48, 3); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2;
      for (var gx = -28; gx <= 28; gx += 28) { c.beginPath(); c.moveTo(gx, -56); c.lineTo(gx, -8); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.moveTo(-50, -8); c.lineTo(-30, -56); c.lineTo(-18, -56); c.lineTo(-38, -8); c.fill();
      c.fillStyle = '#ff7a2f'; rr(c, -64, -70, 128, 10, 3); c.fill();
      for (var f = 0; f < 6; f++) {
        var fx = -50 + f * 20, wv = Math.sin(t * 4 + f) * 2;
        c.fillStyle = '#ffffff'; c.fillRect(fx, -92, 1.4, 22);
        c.fillStyle = ['#ff4d6d', '#ffcf3d', '#2fc45e', '#3d8bff', '#b45cff', '#ff9a1f'][f]; c.beginPath(); c.moveTo(fx + 1.4, -92); c.lineTo(fx + 15 + wv, -88); c.lineTo(fx + 1.4, -83); c.closePath(); c.fill();
      }
      c.fillStyle = '#23386e'; c.font = '800 11px "Trebuchet MS",Arial,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FOOD HALL', 0, -65);
      c.fillStyle = '#b6761f'; rr(c, -8, -24, 16, 24, 2); c.fill();
    } else {
      c.fillStyle = lin(c, -30, 0, 30, 0, [0, '#c9d6ee', 0.5, '#f1f5ff', 1, '#a9b9d8']); rr(c, -30, -160, 60, 160, 3); c.fill();
      for (var wy = -150; wy < -12; wy += 14) for (var wx = -22; wx <= 14; wx += 12) {
        var lit = Math.sin(wy * 0.7 + wx * 1.3 + Math.floor(t * 0.5)) > -0.25;
        c.fillStyle = lit ? '#ffe27a' : '#7b8fb8'; c.fillRect(wx, wy, 8, 8);
      }
      c.fillStyle = '#7a3b18'; rr(c, -8, -22, 16, 22, 2); c.fill();
      c.fillStyle = '#ffd34d'; c.fillRect(-34, -168, 68, 8);
      c.fillStyle = '#b8860b'; c.fillRect(-34, -163, 68, 2);
      spit(c, 0, -168, 24, t * 1.2, 0, 0);
      c.save(); c.translate(0, -205); c.rotate(t * 0.5);
      c.fillStyle = '#ffd34d'; c.beginPath();
      for (var p = 0; p < 10; p++) { var ang = p * Math.PI / 5 - Math.PI / 2, rad = p % 2 ? 6 : 13; c.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad); }
      c.closePath(); c.fill(); c.restore();
    }
    c.restore();
  }
  var STAND_H = [158, 82, 90, 85, 90, 102, 94, 215];

  var SKIN = ['#ffd3ac', '#f0b98d', '#c98b5b', '#8f5a35', '#ffe0c4'];
  var SHIRT = ['#ff6b6b', '#4dabf7', '#51cf66', '#ffd43b', '#cc5de8', '#ff922b', '#22b8cf', '#f06595'];
  function person(c, x, y, s, look, ph, chef) {
    c.save(); c.translate(x, y); c.scale(s, s);
    var sw = Math.sin(ph) * 3, bob = Math.abs(Math.sin(ph)) * 1.2;
    var skin = SKIN[look % SKIN.length], shirt = chef ? '#ffffff' : SHIRT[(look * 3 + 1) % SHIRT.length], pants = chef ? '#3b4262' : ['#3b4262', '#5a4a3a', '#2f5d8a'][look % 3];
    c.fillStyle = 'rgba(70,40,0,.18)'; c.beginPath(); c.ellipse(0, 0, 8, 2.4, 0, 0, TAU); c.fill();
    c.fillStyle = pants; rr(c, -5 + sw * 0.3, -12, 4, 12, 1.5); c.fill(); rr(c, 1 - sw * 0.3, -12, 4, 12, 1.5); c.fill();
    c.fillStyle = shirt; rr(c, -7, -26 - bob, 14, 16, 5); c.fill();
    if (chef) { c.fillStyle = '#e8453c'; c.fillRect(-4, -26 - bob, 8, 3); }
    c.fillStyle = skin; circ(c, 0, -32 - bob, 6.2, skin);
    if (chef) {
      c.fillStyle = '#fff'; rr(c, -5.5, -39 - bob, 11, 4, 2); c.fill(); circ(c, -3, -41 - bob, 3.6, '#fff'); circ(c, 3, -41.5 - bob, 3.9, '#fff'); circ(c, 0, -43.5 - bob, 4, '#fff');
    } else {
      c.fillStyle = ['#3b2a1e', '#e0b94f', '#7a3b18', '#1f1f2e'][look % 4];
      c.beginPath(); c.arc(0, -33 - bob, 6.4, Math.PI, TAU); c.fill();
    }
    c.fillStyle = '#23386e'; circ(c, -2.2, -32 - bob, 0.9, '#23386e'); circ(c, 2.2, -32 - bob, 0.9, '#23386e');
    c.restore();
  }

  function icon(tier, size, locked) {
    var cv = document.createElement('canvas'); cv.width = cv.height = size * 2;
    var c = cv.getContext('2d'); c.scale(2, 2);
    var s = Math.min((size * 0.86) / STAND_H[tier], (size * 0.92) / (tier === 6 ? 130 : tier === 5 ? 104 : 108));
    var wasLocked = !!locked;
    stand(c, tier, size / 2, size * 0.94, s, 0, { rot: 0.4 });
    if (wasLocked) { c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(40,50,90,.82)'; c.fillRect(0, 0, size, size); }
    return cv.toDataURL();
  }

  w.Art = { sky: sky, skyline: skyline, ground: ground, stand: stand, spit: spit, flame: flame, person: person, icon: icon, rr: rr, circ: circ, STAND_H: STAND_H };
})(window);
