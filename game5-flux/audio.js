(function (w) {
  var ctx = null, master = null, sfx = null, mus = null, verb = null, muted = false, adMute = false, musicOn = false, hidden = false;
  var PENT = [0, 2, 4, 7, 9];
  var CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  var chordIdx = 0, nextChord = 0, nextPluck = 0, timer = 0;
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function unlock() {
    if (!ctx) {
      var AC = w.AudioContext || w.webkitAudioContext; if (!AC) return;
      try {
        ctx = new AC(); master = ctx.createGain(); master.connect(ctx.destination);
        sfx = ctx.createGain(); sfx.gain.value = 0.9; sfx.connect(master);
        mus = ctx.createGain(); mus.gain.value = 0.0; mus.connect(master);
        verb = ctx.createGain(); verb.gain.value = 0.32;
        var dl = ctx.createDelay(1.2); dl.delayTime.value = 0.34;
        var fb = ctx.createGain(); fb.gain.value = 0.42;
        var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
        verb.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(master);
      } catch (e) { ctx = null; return; }
    }
    if (ctx.state === 'suspended' && !hidden) ctx.resume();
    apply();
  }
  function apply() {
    if (!master) return;
    master.gain.value = (muted || adMute) ? 0 : 0.55;
    if (mus) mus.gain.setTargetAtTime(musicOn ? 0.5 : 0, ctx.currentTime, 0.4);
  }
  function tone(f, d, type, vol, slide, delay, toVerb) {
    if (!ctx || muted || adMute) return;
    var t0 = ctx.currentTime + (delay || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(25, f * slide), t0 + d);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(sfx); if (toVerb) g.connect(verb);
    o.start(t0); o.stop(t0 + d + 0.03);
  }
  function noise(d, f0, f1, vol, delay, q) {
    if (!ctx || muted || adMute) return;
    var t0 = ctx.currentTime + (delay || 0), n = Math.floor(ctx.sampleRate * d), buf = ctx.createBuffer(1, n, ctx.sampleRate), ch = buf.getChannelData(0);
    for (var i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = ctx.createBufferSource(); s.buffer = buf;
    var fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = q || 1.2;
    fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(f1, t0 + d);
    var g = ctx.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    s.connect(fl); fl.connect(g); g.connect(sfx); s.start(t0);
  }
  function musTone(f, d, vol, type, lpf) {
    if (!ctx) return;
    var t0 = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
    o.type = type; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = lpf;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + Math.min(1.5, d * 0.35)); g.gain.linearRampToValueAtTime(0.0001, t0 + d);
    o.connect(fl); fl.connect(g); g.connect(mus); o.start(t0); o.stop(t0 + d + 0.05);
  }
  function pluck() {
    if (!ctx) return;
    var ch = CHORDS[chordIdx], root = ch[0] + 12, deg = PENT[Math.floor(Math.random() * 5)], m = root + deg + (Math.random() < 0.4 ? 12 : 0);
    var t0 = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = mtof(m);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.09, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
    o.connect(g); g.connect(mus); g.connect(verb); o.start(t0); o.stop(t0 + 1.7);
  }
  function tick() {
    if (!ctx || !musicOn || muted || adMute || hidden) return;
    var now = ctx.currentTime;
    if (now >= nextChord) {
      chordIdx = (chordIdx + 1) % CHORDS.length; nextChord = now + 9.5;
      CHORDS[chordIdx].forEach(function (m, i) { musTone(mtof(m - (i === 0 ? 12 : 0)), 11, i === 0 ? 0.11 : 0.06, i === 1 ? 'triangle' : 'sine', 900); });
    }
    if (now >= nextPluck) { pluck(); nextPluck = now + 1.1 + Math.random() * 2.6; }
  }
  function setMusic(on) {
    musicOn = !!on; if (!ctx) return;
    if (musicOn && !timer) { nextChord = 0; nextPluck = 0; timer = setInterval(tick, 250); }
    if (!musicOn && timer) { clearInterval(timer); timer = 0; }
    apply();
  }

  w.Snd = {
    unlock: unlock,
    setMuted: function (m) { muted = !!m; apply(); },
    isMuted: function () { return muted; },
    setAd: function (a) { adMute = !!a; apply(); },
    setHidden: function (h) {
      hidden = !!h; if (!ctx) return;
      if (hidden) ctx.suspend(); else if (!adMute) ctx.resume();
    },
    music: setMusic,
    click: function () { tone(760, 0.06, 'sine', 0.13, 1.3); },
    back: function () { tone(520, 0.07, 'sine', 0.12, 0.75); },
    grab: function (t) { tone(t === 'a' ? 420 : 330, 0.08, 'sine', 0.14, t === 'a' ? 1.4 : 1.7); },
    drop: function (t) { if (t === 'a') { tone(560, 0.16, 'sine', 0.2, 0.62, 0, true); tone(280, 0.2, 'triangle', 0.12, 0.7); } else { tone(300, 0.16, 'sine', 0.2, 1.8, 0, true); tone(600, 0.14, 'triangle', 0.08, 1.2); } },
    remove: function () { tone(400, 0.12, 'sine', 0.12, 0.5); },
    deny: function () { tone(160, 0.14, 'square', 0.07, 0.8); },
    launch: function () { noise(0.5, 300, 3200, 0.22, 0, 1.6); tone(180, 0.3, 'sawtooth', 0.05, 3, 0); },
    star: function (n) { var base = [72, 76, 79][Math.min(2, n)]; tone(mtof(base), 0.5, 'triangle', 0.2, 1, 0, true); tone(mtof(base + 12), 0.4, 'sine', 0.1, 1, 0.03, true); },
    win: function () { [60, 64, 67, 72, 76].forEach(function (m, i) { tone(mtof(m), 0.7, 'triangle', 0.17, 1, i * 0.09, true); }); noise(0.6, 4000, 800, 0.08, 0.1, 0.8); },
    fail: function () { tone(190, 0.45, 'sine', 0.28, 0.25); noise(0.28, 900, 120, 0.2, 0, 0.9); },
    absorb: function () { tone(700, 0.5, 'sine', 0.2, 0.18, 0, true); },
    bump: function () { tone(880, 0.07, 'triangle', 0.1, 0.8); },
    portal: function () { tone(300, 0.25, 'sine', 0.12, 3, 0, true); tone(900, 0.25, 'sine', 0.08, 0.4, 0.04, true); },
    pop: function (i) { tone(mtof(72 + i * 4), 0.35, 'triangle', 0.17, 1, 0, true); },
    coin: function () { tone(1320, 0.1, 'square', 0.05, 1, 0); tone(1760, 0.18, 'square', 0.05, 1, 0.07); },
    buy: function () { [67, 72, 76].forEach(function (m, i) { tone(mtof(m), 0.3, 'triangle', 0.15, 1, i * 0.07, true); }); }
  };
})(window);
