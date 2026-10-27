(function () {
  'use strict';
  var TAU = Math.PI * 2;
  var SIZE = 256;

  function sph(c, x, y, r, a, b, d) {
    var g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r);
    g.addColorStop(0, a); g.addColorStop(0.55, b); g.addColorStop(1, d);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }
  function outline(c, w, col) { c.lineWidth = w; c.strokeStyle = col || 'rgba(60,20,20,.35)'; c.lineJoin = 'round'; c.stroke(); }
  function shine(c, x, y, rx, ry, rot, a) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.fillStyle = 'rgba(255,255,255,' + (a == null ? 0.7 : a) + ')';
    c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.fill(); c.restore();
  }
  function leaf(c, x, y, len, wid, rot) {
    c.save(); c.translate(x, y); c.rotate(rot);
    var g = c.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, '#5fe06a'); g.addColorStop(1, '#1f9a3a');
    c.fillStyle = g; c.beginPath(); c.moveTo(0, 0);
    c.quadraticCurveTo(len * 0.5, -wid, len, 0); c.quadraticCurveTo(len * 0.5, wid, 0, 0); c.closePath();
    c.fill(); outline(c, 0.035, 'rgba(0,70,20,.45)');
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 0.02;
    c.beginPath(); c.moveTo(len * 0.08, 0); c.lineTo(len * 0.8, 0); c.stroke();
    c.restore();
  }
  function shade(c, x, y, r) {
    var g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.4, x, y, r * 1.02);
    g.addColorStop(0, 'rgba(0,0,40,0)'); g.addColorStop(1, 'rgba(0,0,40,.38)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }
  function rnd(i) { var s = Math.sin(i * 12.9898) * 43758.5453; return s - Math.floor(s); }

  function dCherry(c) {
    c.lineCap = 'round'; c.strokeStyle = '#4f8a2c'; c.lineWidth = 0.075;
    c.beginPath(); c.moveTo(-0.38, 0.2); c.quadraticCurveTo(-0.32, -0.5, 0.14, -0.84); c.stroke();
    c.beginPath(); c.moveTo(0.42, 0.3); c.quadraticCurveTo(0.34, -0.45, 0.14, -0.84); c.stroke();
    leaf(c, 0.14, -0.84, 0.62, 0.22, -0.2);
    [[-0.4, 0.4, 0.4], [0.42, 0.5, 0.38]].forEach(function (p) {
      sph(c, p[0], p[1], p[2], '#ff8a8a', '#e5173f', '#98002a');
      c.beginPath(); c.arc(p[0], p[1], p[2], 0, TAU); outline(c, 0.04, 'rgba(80,0,20,.5)');
      shine(c, p[0] - p[2] * 0.38, p[1] - p[2] * 0.4, p[2] * 0.2, p[2] * 0.12, -0.7, 0.85);
      c.fillStyle = 'rgba(90,0,20,.3)'; c.beginPath(); c.arc(p[0] + p[2] * 0.05, p[1] - p[2] * 0.82, p[2] * 0.13, 0, TAU); c.fill();
    });
  }
  function dStrawberry(c) {
    leaf(c, 0, -0.52, 0.5, 0.15, 2.5); leaf(c, 0, -0.52, 0.5, 0.15, 0.64);
    c.beginPath(); c.moveTo(0, -0.5);
    c.bezierCurveTo(-0.45, -0.8, -0.97, -0.42, -0.82, 0.1);
    c.bezierCurveTo(-0.7, 0.52, -0.28, 0.82, 0, 0.94);
    c.bezierCurveTo(0.28, 0.82, 0.7, 0.52, 0.82, 0.1);
    c.bezierCurveTo(0.97, -0.42, 0.45, -0.8, 0, -0.5); c.closePath();
    var g = c.createRadialGradient(-0.3, -0.25, 0.1, 0, 0.1, 1.0);
    g.addColorStop(0, '#ff8585'); g.addColorStop(0.55, '#f02a43'); g.addColorStop(1, '#a50f2e');
    c.fillStyle = g; c.fill(); outline(c, 0.045, 'rgba(90,0,20,.5)');
    c.fillStyle = '#ffe58a';
    [[-0.42, -0.15], [0, -0.22], [0.42, -0.15], [-0.58, 0.2], [-0.2, 0.12], [0.2, 0.12], [0.58, 0.2], [-0.36, 0.5], [0, 0.42], [0.36, 0.5], [0, 0.74]].forEach(function (p) {
      c.beginPath(); c.ellipse(p[0], p[1], 0.04, 0.065, 0, 0, TAU); c.fill();
    });
    leaf(c, 0, -0.52, 0.5, 0.15, -2.4); leaf(c, 0, -0.52, 0.5, 0.15, -0.74); leaf(c, 0, -0.52, 0.46, 0.14, -1.57);
    c.strokeStyle = '#3f8a2c'; c.lineWidth = 0.07; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -0.52); c.lineTo(0.03, -0.86); c.stroke();
    shine(c, -0.42, -0.1, 0.1, 0.22, 0.5, 0.55);
  }
  function dLemon(c) {
    c.save(); c.rotate(-0.4);
    c.beginPath(); c.moveTo(-0.98, 0);
    c.bezierCurveTo(-0.82, -0.12, -0.72, -0.64, 0, -0.64);
    c.bezierCurveTo(0.72, -0.64, 0.82, -0.12, 0.98, 0);
    c.bezierCurveTo(0.82, 0.12, 0.72, 0.64, 0, 0.64);
    c.bezierCurveTo(-0.72, 0.64, -0.82, 0.12, -0.98, 0); c.closePath();
    var g = c.createLinearGradient(0, -0.64, 0, 0.64);
    g.addColorStop(0, '#fff38a'); g.addColorStop(0.5, '#ffd91a'); g.addColorStop(1, '#d99a00');
    c.fillStyle = g; c.fill(); outline(c, 0.045, 'rgba(110,70,0,.5)');
    c.fillStyle = 'rgba(200,140,0,.35)';
    [[-0.3, 0.1], [0.1, 0.3], [0.35, -0.1], [-0.05, -0.2], [0.55, 0.15], [-0.6, -0.05]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], 0.025, 0, TAU); c.fill(); });
    shine(c, -0.2, -0.33, 0.28, 0.07, -0.1, 0.7);
    c.restore();
    leaf(c, 0.12, -0.58, 0.55, 0.19, -0.5);
  }
  function dOrange(c) {
    sph(c, 0, 0.1, 0.8, '#ffc27a', '#ff9a1f', '#c75d00');
    c.beginPath(); c.arc(0, 0.1, 0.8, 0, TAU); outline(c, 0.045, 'rgba(110,40,0,.5)');
    c.fillStyle = 'rgba(190,80,0,.3)';
    for (var i = 0; i < 26; i++) { var a = rnd(i) * TAU, r = Math.sqrt(rnd(i + 50)) * 0.7; c.beginPath(); c.arc(Math.cos(a) * r, 0.1 + Math.sin(a) * r, 0.02, 0, TAU); c.fill(); }
    shade(c, 0, 0.1, 0.8);
    shine(c, -0.34, -0.22, 0.2, 0.11, -0.7, 0.75);
    leaf(c, 0.02, -0.66, 0.56, 0.2, -0.55);
    c.fillStyle = '#2f9a3a'; c.beginPath(); c.arc(0, -0.66, 0.07, 0, TAU); c.fill();
  }
  function dApple(c) {
    c.beginPath(); c.moveTo(0, -0.5);
    c.bezierCurveTo(-0.3, -0.8, -0.98, -0.55, -0.88, 0.12);
    c.bezierCurveTo(-0.8, 0.7, -0.32, 0.98, 0, 0.82);
    c.bezierCurveTo(0.32, 0.98, 0.8, 0.7, 0.88, 0.12);
    c.bezierCurveTo(0.98, -0.55, 0.3, -0.8, 0, -0.5); c.closePath();
    var g = c.createRadialGradient(-0.35, -0.2, 0.1, 0, 0.1, 1.05);
    g.addColorStop(0, '#ff8f7a'); g.addColorStop(0.5, '#e8262f'); g.addColorStop(1, '#8f0c1a');
    c.fillStyle = g; c.fill(); outline(c, 0.045, 'rgba(80,0,10,.5)');
    shine(c, -0.5, -0.16, 0.1, 0.24, 0.35, 0.65);
    c.strokeStyle = '#6a3d1a'; c.lineWidth = 0.075; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -0.46); c.quadraticCurveTo(0.02, -0.7, 0.12, -0.88); c.stroke();
    leaf(c, 0.1, -0.8, 0.6, 0.2, -0.25);
  }
  function dWatermelon(c) {
    c.save(); c.translate(0, -0.48);
    function half(r, fill) { c.beginPath(); c.arc(0, 0, r, 0, Math.PI); c.closePath(); c.fillStyle = fill; c.fill(); }
    var rg = c.createLinearGradient(0, 0, 0, 1);
    rg.addColorStop(0, '#5fd35a'); rg.addColorStop(1, '#1f8f3a');
    half(1.0, rg);
    c.strokeStyle = 'rgba(10,80,30,.45)'; c.lineWidth = 0.05; c.lineCap = 'round';
    for (var k = 1; k < 8; k++) { var a = Math.PI * k / 8; c.beginPath(); c.moveTo(Math.cos(a) * 0.9, Math.sin(a) * 0.9); c.lineTo(Math.cos(a) * 1.0, Math.sin(a) * 1.0); c.stroke(); }
    c.beginPath(); c.arc(0, 0, 1.0, 0, Math.PI); c.closePath(); outline(c, 0.045, 'rgba(0,60,20,.55)');
    half(0.9, '#f1ffe0');
    var fg = c.createRadialGradient(0, -0.1, 0.1, 0, 0, 0.85);
    fg.addColorStop(0, '#ff8c96'); fg.addColorStop(0.7, '#ee2e48'); fg.addColorStop(1, '#d11a38');
    half(0.8, fg);
    c.fillStyle = '#2a1a1a';
    [[-0.45, 0.2, 0.3], [-0.15, 0.4, -0.1], [0.2, 0.32, 0.2], [0.5, 0.15, -0.4], [0, 0.12, 0.1], [-0.3, 0.55, 0.2], [0.35, 0.55, -0.2]].forEach(function (p) {
      c.save(); c.translate(p[0], p[1]); c.rotate(p[2]); c.beginPath(); c.ellipse(0, 0, 0.04, 0.085, 0, 0, TAU); c.fill(); c.restore();
    });
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 0.035;
    c.beginPath(); c.moveTo(-0.7, 0.04); c.lineTo(0.7, 0.04); c.stroke();
    c.restore();
  }
  function crater(c, x, y, r) {
    c.fillStyle = 'rgba(110,120,145,.5)'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = r * 0.22; c.beginPath(); c.arc(x - r * 0.08, y - r * 0.08, r * 0.92, Math.PI * 0.9, Math.PI * 1.7); c.stroke();
  }
  function dMoon(c) {
    sph(c, 0, 0, 0.88, '#ffffff', '#e1e6ee', '#8f98ab');
    c.save(); c.beginPath(); c.arc(0, 0, 0.88, 0, TAU); c.clip();
    crater(c, -0.32, -0.3, 0.2); crater(c, 0.34, -0.05, 0.26); crater(c, -0.15, 0.4, 0.16); crater(c, 0.45, 0.5, 0.12); crater(c, -0.58, 0.12, 0.1); crater(c, 0.1, -0.62, 0.09);
    shade(c, 0, 0, 0.88);
    c.restore();
    c.beginPath(); c.arc(0, 0, 0.88, 0, TAU); outline(c, 0.045, 'rgba(40,50,80,.45)');
  }
  function dMars(c) {
    sph(c, 0, 0, 0.88, '#ffb48a', '#e2572b', '#7d230f');
    c.save(); c.beginPath(); c.arc(0, 0, 0.88, 0, TAU); c.clip();
    c.fillStyle = 'rgba(110,30,10,.45)';
    c.beginPath(); c.ellipse(-0.25, 0.1, 0.4, 0.17, 0.3, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(0.35, 0.35, 0.28, 0.13, -0.3, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(0.3, -0.15, 0.2, 0.1, 0.2, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,240,230,.9)'; c.beginPath(); c.ellipse(0, -0.82, 0.38, 0.16, 0, 0, TAU); c.fill();
    shade(c, 0, 0, 0.88); c.restore();
    shine(c, -0.4, -0.38, 0.2, 0.1, -0.7, 0.6);
    c.beginPath(); c.arc(0, 0, 0.88, 0, TAU); outline(c, 0.045, 'rgba(80,20,0,.5)');
  }
  function dEarth(c) {
    sph(c, 0, 0, 0.88, '#9ee6ff', '#2f86f0', '#12388a');
    c.save(); c.beginPath(); c.arc(0, 0, 0.88, 0, TAU); c.clip();
    c.fillStyle = '#5bd36a';
    [[-0.32, -0.28, 0.34, 0.2, 0.5], [-0.12, 0.0, 0.14, 0.3, 0.3], [0.38, 0.22, 0.3, 0.19, -0.4], [0.5, -0.4, 0.2, 0.12, 0.1], [-0.4, 0.52, 0.2, 0.11, 0.2], [0.1, -0.62, 0.18, 0.1, 0]].forEach(function (e) {
      c.beginPath(); c.ellipse(e[0], e[1], e[2], e[3], e[4], 0, TAU); c.fill();
    });
    c.fillStyle = '#c8a45a';
    c.beginPath(); c.ellipse(0.3, 0.2, 0.12, 0.08, -0.4, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.85)';
    [[-0.5, 0.15, 0.26, 0.07, 0.1], [0.2, -0.45, 0.3, 0.07, -0.1], [0.05, 0.62, 0.3, 0.07, 0.1], [0.55, 0.0, 0.18, 0.05, 0]].forEach(function (e) {
      c.beginPath(); c.ellipse(e[0], e[1], e[2], e[3], e[4], 0, TAU); c.fill();
    });
    shade(c, 0, 0, 0.88); c.restore();
    shine(c, -0.4, -0.4, 0.2, 0.1, -0.7, 0.6);
    c.beginPath(); c.arc(0, 0, 0.88, 0, TAU); outline(c, 0.045, 'rgba(0,20,80,.5)');
  }
  function dSaturn(c) {
    c.save(); c.rotate(-0.35);
    function ring(front) {
      c.beginPath(); c.ellipse(0, 0, 1.04, 0.33, 0, front ? 0 : Math.PI, front ? Math.PI : TAU);
      c.lineCap = 'butt'; c.strokeStyle = '#f2cf86'; c.lineWidth = 0.17; c.stroke();
      c.beginPath(); c.ellipse(0, 0, 1.04, 0.33, 0, front ? 0 : Math.PI, front ? Math.PI : TAU);
      c.strokeStyle = '#c8953e'; c.lineWidth = 0.04; c.stroke();
      c.beginPath(); c.ellipse(0, 0, 0.9, 0.27, 0, front ? 0 : Math.PI, front ? Math.PI : TAU);
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 0.03; c.stroke();
    }
    ring(false);
    sph(c, 0, 0, 0.62, '#fff1c0', '#e8b85a', '#8f5a16');
    c.save(); c.beginPath(); c.arc(0, 0, 0.62, 0, TAU); c.clip();
    c.fillStyle = 'rgba(150,90,20,.28)';
    c.fillRect(-1, -0.28, 2, 0.1); c.fillRect(-1, 0.02, 2, 0.14); c.fillRect(-1, 0.34, 2, 0.08);
    shade(c, 0, 0, 0.62); c.restore();
    c.beginPath(); c.arc(0, 0, 0.62, 0, TAU); outline(c, 0.04, 'rgba(90,50,0,.5)');
    shine(c, -0.26, -0.28, 0.14, 0.08, -0.7, 0.6);
    ring(true);
    c.restore();
  }
  function dSun(c) {
    var g = c.createRadialGradient(0, 0, 0.3, 0, 0, 1);
    g.addColorStop(0, 'rgba(255,230,120,.95)'); g.addColorStop(1, 'rgba(255,200,60,0)');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill();
    for (var i = 0; i < 12; i++) {
      c.save(); c.rotate(i * Math.PI / 6);
      c.fillStyle = i % 2 ? '#ffb02e' : '#ff8a00';
      c.beginPath(); c.moveTo(0.6, -0.13); c.lineTo(i % 2 ? 0.88 : 0.98, 0); c.lineTo(0.6, 0.13); c.closePath(); c.fill();
      outline(c, 0.02, 'rgba(150,60,0,.4)'); c.restore();
    }
    sph(c, 0, 0, 0.66, '#fffbc0', '#ffd22e', '#ff8a00');
    c.beginPath(); c.arc(0, 0, 0.66, 0, TAU); outline(c, 0.04, 'rgba(160,70,0,.5)');
    shine(c, -0.26, -0.28, 0.18, 0.1, -0.7, 0.8);
  }
  function dGalaxy(c) {
    c.save(); c.beginPath(); c.arc(0, 0, 0.94, 0, TAU); c.clip();
    var g = c.createRadialGradient(0, 0, 0.05, 0, 0, 0.95);
    g.addColorStop(0, '#8a5cff'); g.addColorStop(0.5, '#3a1d96'); g.addColorStop(1, '#12073a');
    c.fillStyle = g; c.fillRect(-1, -1, 2, 2);
    for (var arm = 0; arm < 2; arm++) {
      for (var k = 0; k < 130; k++) {
        var th = k * 0.115 + arm * Math.PI, r = 0.07 + k * 0.0064;
        var jx = (rnd(k + arm * 200) - 0.5) * 0.09, jy = (rnd(k + arm * 300 + 7) - 0.5) * 0.09;
        var x = r * Math.cos(th) + jx, y = (r * Math.sin(th) + jy) * 0.78;
        var xr = x * Math.cos(-0.5) - y * Math.sin(-0.5), yr = x * Math.sin(-0.5) + y * Math.cos(-0.5);
        c.fillStyle = k % 3 === 0 ? 'rgba(143,227,255,.9)' : (k % 3 === 1 ? 'rgba(255,154,213,.85)' : 'rgba(255,255,255,.8)');
        c.beginPath(); c.arc(xr, yr, 0.018 + rnd(k + 9) * 0.03, 0, TAU); c.fill();
      }
    }
    var cg = c.createRadialGradient(0, 0, 0, 0, 0, 0.36);
    cg.addColorStop(0, 'rgba(255,255,255,1)'); cg.addColorStop(0.4, 'rgba(255,230,160,.8)'); cg.addColorStop(1, 'rgba(255,200,120,0)');
    c.fillStyle = cg; c.beginPath(); c.arc(0, 0, 0.36, 0, TAU); c.fill();
    c.fillStyle = '#fff';
    for (var s = 0; s < 22; s++) { c.globalAlpha = 0.5 + rnd(s + 3) * 0.5; c.beginPath(); c.arc((rnd(s) - 0.5) * 1.8, (rnd(s + 40) - 0.5) * 1.8, 0.012 + rnd(s + 80) * 0.016, 0, TAU); c.fill(); }
    c.globalAlpha = 1; c.restore();
    c.beginPath(); c.arc(0, 0, 0.94, 0, TAU);
    var rg = c.createLinearGradient(-1, -1, 1, 1);
    rg.addColorStop(0, '#fff2a8'); rg.addColorStop(0.5, '#e8a21a'); rg.addColorStop(1, '#fff2a8');
    c.strokeStyle = rg; c.lineWidth = 0.075; c.stroke();
  }

  var DRAW = [dCherry, dStrawberry, dLemon, dOrange, dApple, dWatermelon, dMoon, dMars, dEarth, dSaturn, dSun, dGalaxy];
  var SPR = [], SIL = [];
  DRAW.forEach(function (fn, i) {
    var cv = document.createElement('canvas'); cv.width = cv.height = SIZE;
    var c = cv.getContext('2d');
    c.translate(SIZE / 2, SIZE / 2); c.scale(SIZE / 2 * 0.96, SIZE / 2 * 0.96);
    fn(c);
    SPR.push(cv);
    var s = document.createElement('canvas'); s.width = s.height = 96;
    var sc = s.getContext('2d');
    sc.drawImage(cv, 0, 0, 96, 96);
    sc.globalCompositeOperation = 'source-in';
    sc.fillStyle = 'rgba(20,45,130,.55)'; sc.fillRect(0, 0, 96, 96);
    SIL.push(s);
  });
  window.SPRITES = { SPR: SPR, SIL: SIL };
})();
