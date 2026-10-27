(function (w) {
  var glowCache = {};
  function glow(color, size) {
    var key = color + '|' + size;
    if (glowCache[key]) return glowCache[key];
    var c = document.createElement('canvas'); c.width = c.height = size;
    var g = c.getContext('2d'), r = size / 2, gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, color); gr.addColorStop(0.25, color.replace(/[\d.]+\)$/, '0.45)')); gr.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    glowCache[key] = c; return c;
  }
  function rr(c, x, y, ww, hh, r) {
    r = Math.min(r, ww / 2, hh / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + ww, y, x + ww, y + hh, r); c.arcTo(x + ww, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + ww, y, r); c.closePath();
  }
  function txt(c, s, x, y, size, color, align, font, base) {
    c.font = '700 ' + size + 'px ' + (font || 'Unbounded') + ',"Trebuchet MS",sans-serif';
    c.fillStyle = color; c.textAlign = align || 'center'; c.textBaseline = base || 'middle';
    c.fillText(s, x, y);
  }
  function star4(c, x, y, r, k) {
    k = k || 0.38; c.beginPath();
    for (var i = 0; i < 8; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 4, rad = i % 2 ? r * k : r;
      c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    c.closePath();
  }
  function star5(c, x, y, r) {
    c.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.46 : r;
      c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    c.closePath();
  }
  function icon(c, name, x, y, s, col, col2) {
    c.save(); c.translate(x, y); c.scale(s / 24, s / 24);
    c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 2.6; c.strokeStyle = col; c.fillStyle = col;
    switch (name) {
      case 'back': c.beginPath(); c.moveTo(4, -9); c.lineTo(-5, 0); c.lineTo(4, 9); c.stroke(); break;
      case 'play': c.beginPath(); c.moveTo(-5, -9); c.lineTo(9, 0); c.lineTo(-5, 9); c.closePath(); c.fill(); break;
      case 'next': c.beginPath(); c.moveTo(-5, -9); c.lineTo(5, 0); c.lineTo(-5, 9); c.stroke(); break;
      case 'skip': c.beginPath(); c.moveTo(-9, -8); c.lineTo(0, 0); c.lineTo(-9, 8); c.closePath(); c.fill(); c.beginPath(); c.moveTo(1, -8); c.lineTo(10, 0); c.lineTo(1, 8); c.closePath(); c.fill(); break;
      case 'restart': c.beginPath(); c.arc(0, 0, 8, -2.3, 3.4); c.stroke(); c.beginPath(); c.moveTo(-9.5, -9); c.lineTo(-6.5, -3.5); c.lineTo(-12, -3); c.closePath(); c.fill(); break;
      case 'snd': c.beginPath(); c.moveTo(-10, -4); c.lineTo(-5, -4); c.lineTo(1, -9); c.lineTo(1, 9); c.lineTo(-5, 4); c.lineTo(-10, 4); c.closePath(); c.fill();
        c.beginPath(); c.arc(1, 0, 6, -0.9, 0.9); c.stroke(); c.beginPath(); c.arc(1, 0, 11, -0.85, 0.85); c.stroke(); break;
      case 'mute': c.beginPath(); c.moveTo(-10, -4); c.lineTo(-5, -4); c.lineTo(1, -9); c.lineTo(1, 9); c.lineTo(-5, 4); c.lineTo(-10, 4); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(5, -5); c.lineTo(12, 5); c.moveTo(12, -5); c.lineTo(5, 5); c.stroke(); break;
      case 'bulb': c.beginPath(); c.arc(0, -3, 7.5, 2.3, 0.84, false); c.lineTo(3.5, 7); c.lineTo(-3.5, 7); c.closePath(); c.stroke();
        c.beginPath(); c.moveTo(-3, 10.5); c.lineTo(3, 10.5); c.stroke(); break;
      case 'star': star5(c, 0, 1, 11); c.fill(); break;
      case 'starline': star5(c, 0, 1, 10); c.stroke(); break;
      case 'lock': c.beginPath(); c.arc(0, -3, 5, Math.PI, 0); c.stroke(); rr(c, -7.5, -3, 15, 12, 3); c.fill(); break;
      case 'video': rr(c, -10, -7, 20, 14, 4); c.fill(); c.beginPath(); c.moveTo(-2.5, -3.5); c.lineTo(4, 0); c.lineTo(-2.5, 3.5); c.closePath(); c.fillStyle = col2 || '#000'; c.fill(); break;
      case 'bolt': c.beginPath(); c.moveTo(3, -11); c.lineTo(-7, 2); c.lineTo(-1, 2); c.lineTo(-3, 11); c.lineTo(7, -2); c.lineTo(1, -2); c.closePath(); c.fill(); break;
      case 'skin': c.beginPath(); c.arc(5, -5, 4, 0, 7); c.fill(); c.lineWidth = 3; c.beginPath(); c.moveTo(1, -2); c.bezierCurveTo(-4, 2, -8, 4, -11, 10); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(0, -5); c.bezierCurveTo(-3, -2, -6, -1, -9, 2); c.stroke(); break;
      case 'flask': c.beginPath(); c.moveTo(-3, -10); c.lineTo(-3, -3); c.lineTo(-9, 8); c.lineTo(9, 8); c.lineTo(3, -3); c.lineTo(3, -10); c.stroke(); c.beginPath(); c.moveTo(-5, -10); c.lineTo(5, -10); c.stroke(); c.fillRect(-6, 3, 12, 3); break;
      case 'cal': rr(c, -10, -8, 20, 18, 3); c.stroke(); c.beginPath(); c.moveTo(-10, -2); c.lineTo(10, -2); c.moveTo(-5, -11); c.lineTo(-5, -6); c.moveTo(5, -11); c.lineTo(5, -6); c.stroke(); c.beginPath(); c.arc(0, 4, 2.4, 0, 7); c.fill(); break;
      case 'grid': for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) { rr(c, -10 + i * 11, -10 + j * 11, 9, 9, 2.5); c.fill(); } break;
      case 'check': c.lineWidth = 3.4; c.beginPath(); c.moveTo(-8, 0); c.lineTo(-2, 7); c.lineTo(9, -7); c.stroke(); break;
      case 'close': c.beginPath(); c.moveTo(-7, -7); c.lineTo(7, 7); c.moveTo(7, -7); c.lineTo(-7, 7); c.stroke(); break;
      case 'lang': c.beginPath(); c.arc(0, 0, 10, 0, 7); c.stroke(); c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 4.5, 10, 0, 0, 7); c.stroke(); c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.stroke(); break;
      case 'heart': c.beginPath(); c.moveTo(0, 9); c.bezierCurveTo(-14, -1, -8, -11, 0, -4); c.bezierCurveTo(8, -11, 14, -1, 0, 9); c.fill(); break;
      case 'fire': c.beginPath(); c.moveTo(0, -11); c.bezierCurveTo(3, -5, 9, -2, 8, 4); c.bezierCurveTo(7, 10, 3, 11, 0, 11); c.bezierCurveTo(-4, 11, -8, 8, -8, 3); c.bezierCurveTo(-8, -1, -5, -3, -4, -6); c.bezierCurveTo(-2, -4, -1, -3, 0, -3); c.bezierCurveTo(1, -6, 0, -8, 0, -11); c.fill(); break;
    }
    c.restore();
  }
  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3); }
  function easeOutBack(t) { if (t <= 0) return 0; if (t >= 1) return 1; var c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  w.Draw = { glow: glow, rr: rr, txt: txt, star4: star4, star5: star5, icon: icon, ease: ease, back: easeOutBack, clamp: clamp };
})(window);
