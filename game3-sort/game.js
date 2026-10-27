(function () {
  'use strict';

  var GEN = window.SortGen, PARS = window.SortPars || [];
  var PARAMS = new URLSearchParams(location.search);
  var DBG = PARAMS.has('debug');
  var CAP = GEN.CAP, TOTAL = GEN.TOTAL, AD_GAP = 90000, AD_EVERY = 3, SAVE_KEY = 'srt_save_v1';
  var TAU = Math.PI * 2;
  var BASE = ['#ff4d5e', '#ff9a2e', '#ffd93d', '#9be04a', '#1fb86a', '#22d3d3', '#3d8bff', '#7a4dff', '#e05cff', '#ff8fc0', '#a8703a', '#5b6785'];
  var NOTES = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760, 2093, 2349];

  function mixHex(h, to, a) {
    var n = parseInt(h.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var m = parseInt(to.slice(1), 16), r2 = m >> 16, g2 = (m >> 8) & 255, b2 = m & 255;
    return 'rgb(' + Math.round(r + (r2 - r) * a) + ',' + Math.round(g + (g2 - g) * a) + ',' + Math.round(b + (b2 - b) * a) + ')';
  }
  var PAL = BASE.map(function (b) { return { b: b, l: mixHex(b, '#ffffff', 0.55), d: mixHex(b, '#1a1f5a', 0.38) }; });

  var TXT = {
    ru: {
      title: 'Сортировка шаров', level: 'Уровень {n}', moves: 'Ходы {m} / цель {p}', play: 'Играть', cont: 'Продолжить', levels: 'Уровни',
      next: 'Дальше', replay: 'Ещё раз', toMenu: 'В меню', won: 'Уровень пройден!', movesDone: 'Ходов: {m}', best: 'Лучший результат: {b}',
      undo: 'Отмена', restart: 'Заново', tube: 'Пробирка', restartAsk: 'Начать уровень заново?', restartSub: 'Прогресс на этом уровне сбросится.', yes: 'Да, заново', no: 'Нет',
      stuck: 'Ходов не осталось', stuckSub: 'Отмени ход, добавь пробирку или начни уровень заново.', hint: 'Нажми на пробирку, потом на другую, чтобы переложить верхний шар',
      patOn: 'Узоры на шарах включены', patOff: 'Узоры выключены', locked: 'Уровень пока закрыт', hard: 'Сложный: одна пустая пробирка',
      colors: '{n} цветов', undoAdded: '+3 отмены', tubeAdded: 'Пробирка добавлена', tubeUsed: 'Пробирка уже добавлена', nothing: 'Нечего отменять',
      allDone: 'Все уровни пройдены!', allDoneSub: 'Улучши результат: собери три звезды на любом уровне.', totalStars: 'Звёзд: {a} из {b}',
      adSoon: 'Короткая рекламная пауза…', noReward: 'Награда не получена', adFail: 'Реклама сейчас недоступна', close: 'Закрыть', hardTag: 'Сложный',
      undoVideo: 'Отмена за видео', tubeVideo: 'Пробирка за видео', goal: '3 звезды: до {p} ходов'
    },
    en: {
      title: 'Ball Sort', level: 'Level {n}', moves: 'Moves {m} / goal {p}', play: 'Play', cont: 'Continue', levels: 'Levels',
      next: 'Next', replay: 'Replay', toMenu: 'Menu', won: 'Level complete!', movesDone: 'Moves: {m}', best: 'Best result: {b}',
      undo: 'Undo', restart: 'Restart', tube: 'Tube', restartAsk: 'Restart this level?', restartSub: 'Your progress on this level will be lost.', yes: 'Yes, restart', no: 'No',
      stuck: 'No moves left', stuckSub: 'Undo a move, add a tube or restart the level.', hint: 'Tap a tube, then tap another one to move the top ball',
      patOn: 'Ball patterns on', patOff: 'Ball patterns off', locked: 'This level is locked', hard: 'Hard: only one empty tube',
      colors: '{n} colors', undoAdded: '+3 undos', tubeAdded: 'Tube added', tubeUsed: 'Tube already added', nothing: 'Nothing to undo',
      allDone: 'All levels complete!', allDoneSub: 'Improve your results: get three stars on any level.', totalStars: 'Stars: {a} of {b}',
      adSoon: 'Short ad break…', noReward: 'Reward not granted', adFail: 'Ads are unavailable right now', close: 'Close', hardTag: 'Hard',
      undoVideo: 'Undo for a video', tubeVideo: 'Tube for a video', goal: '3 stars: within {p} moves'
    },
    tr: {
      title: 'Top Ayıklama', level: 'Seviye {n}', moves: 'Hamle {m} / hedef {p}', play: 'Oyna', cont: 'Devam et', levels: 'Seviyeler',
      next: 'Sonraki', replay: 'Tekrar', toMenu: 'Menüye', won: 'Seviye tamamlandı!', movesDone: 'Hamle: {m}', best: 'En iyi sonuç: {b}',
      undo: 'Geri al', restart: 'Yeniden', tube: 'Tüp', restartAsk: 'Seviye yeniden başlasın mı?', restartSub: 'Bu seviyedeki ilerlemen sıfırlanacak.', yes: 'Evet, yeniden', no: 'Hayır',
      stuck: 'Hamle kalmadı', stuckSub: 'Bir hamleyi geri al, tüp ekle veya seviyeyi yeniden başlat.', hint: 'Bir tüpe, sonra başka bir tüpe dokun: üstteki top taşınır',
      patOn: 'Top desenleri açık', patOff: 'Top desenleri kapalı', locked: 'Bu seviye henüz kilitli', hard: 'Zor: yalnızca bir boş tüp',
      colors: '{n} renk', undoAdded: '+3 geri alma', tubeAdded: 'Tüp eklendi', tubeUsed: 'Tüp zaten eklendi', nothing: 'Geri alınacak bir şey yok',
      allDone: 'Tüm seviyeler tamamlandı!', allDoneSub: 'Sonuçlarını geliştir: herhangi bir seviyede üç yıldız topla.', totalStars: 'Yıldız: {a} / {b}',
      adSoon: 'Kısa reklam arası…', noReward: 'Ödül verilmedi', adFail: 'Reklamlar şu an kullanılamıyor', close: 'Kapat', hardTag: 'Zor',
      undoVideo: 'Video ile geri al', tubeVideo: 'Video ile tüp', goal: '3 yıldız: en fazla {p} hamle'
    }
  };
  var L = 'en';
  function t(k, v) {
    var s = TXT[L][k]; if (s == null) s = TXT.en[k] || k;
    if (v) for (var a in v) s = s.replace('{' + a + '}', v[a]);
    return s;
  }
  function langFrom(code) {
    code = String(code || 'en').toLowerCase().slice(0, 2);
    if (code === 'tr') return 'tr';
    return ['ru', 'be', 'kk', 'uk', 'uz'].indexOf(code) >= 0 ? 'ru' : 'en';
  }

  var $ = function (id) { return document.getElementById(id); };
  var cv = $('c'), cx = cv.getContext('2d');
  var toastEl = $('toast'), hintEl = $('hint');
  var modalEl = $('modal'), cardEl = $('card'), adovEl = $('adov');

  var S, G = null;
  var paused = false, adActive = false, started = false, lastFrame = 0;
  var lastAdAt = Date.now(), lastCloudAt = 0, gpOn = false;
  var W = 0, H = 0, dpr = 1, D = 40, TW = 51, TH = 170, PADT = 6, POS = [], ROWS = [];
  var flights = [], particles = [], floats = [], lift = [], shake = [], doneT = [], appear = [], landT = {}, hover = -1, shake0 = 0;
  var SPR = [], SPRS = 0, sprKey = '';
  var TOPPAD = 72, BOTPAD = 96;

  function now() { return performance.now() / 1000; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function defaults() {
    var st = [], bm = [];
    for (var i = 0; i <= TOTAL; i++) { st.push(0); bm.push(0); }
    return { v: 1, savedAt: 0, lvl: 1, maxLvl: 1, st: st, bm: bm, since: 0, done: 0, muted: false, pat: false, tut: 0, sv: null };
  }
  function sane(d) {
    if (!d || typeof d !== 'object' || d.v !== 1 || !isFinite(d.maxLvl)) return null;
    var b = defaults();
    for (var k in b) if (d[k] == null) d[k] = b[k];
    if (!Array.isArray(d.st) || d.st.length < TOTAL + 1) d.st = b.st;
    if (!Array.isArray(d.bm) || d.bm.length < TOTAL + 1) d.bm = b.bm;
    d.maxLvl = clamp(Math.floor(d.maxLvl), 1, TOTAL); d.lvl = clamp(Math.floor(d.lvl) || 1, 1, TOTAL);
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

  // ---------- sound ----------
  var Snd = {
    ctx: null, master: null, muted: false, adMute: false,
    unlock: function () {
      if (!this.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        try { this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination); } catch (e) { this.ctx = null; return; }
      }
      if (this.ctx.state === 'suspended' && !document.hidden) this.ctx.resume();
      this.apply();
    },
    apply: function () { if (this.master) this.master.gain.value = (this.muted || this.adMute) ? 0 : 0.5; },
    tone: function (f, d, type, vol, slide, delay) {
      if (!this.ctx || this.muted || this.adMute) return;
      var c = this.ctx, t0 = c.currentTime + (delay || 0);
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t0 + d);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(this.master); o.start(t0); o.stop(t0 + d + 0.02);
    },
    pick: function () { this.tone(520, 0.07, 'sine', 0.14, 1.35); },
    drop: function (ci) { this.tone(230, 0.1, 'triangle', 0.3, 0.7); this.tone(NOTES[(ci - 1) % NOTES.length] * 0.5, 0.16, 'sine', 0.12, 1); },
    done: function () { [659, 784, 988, 1319].forEach(function (f, i) { Snd.tone(f, 0.22, 'triangle', 0.22, 1, i * 0.07); }); Snd.tone(2637, 0.3, 'sine', 0.08, 1, 0.2); },
    deny: function () { this.tone(170, 0.16, 'square', 0.1, 0.7); },
    click: function () { this.tone(700, 0.05, 'sine', 0.15, 1.2); },
    undo: function () { this.tone(420, 0.12, 'sine', 0.16, 0.7); },
    win: function () { [523, 659, 784, 1046, 1319].forEach(function (f, i) { Snd.tone(f, 0.34, 'triangle', 0.25, 1, i * 0.1); }); },
    over: function () { [392, 330, 262, 196].forEach(function (f, i) { Snd.tone(f, 0.3, 'triangle', 0.22, 0.96, i * 0.16); }); }
  };

  // ---------- SDK ----------
  function updGP() {
    var want = started && !document.hidden && !adActive && !modalCur && !!G && !G.won;
    if (want === gpOn) return;
    gpOn = want;
    try { if (want) Platform.gameplayStart(); else Platform.gameplayStop(); } catch (e) {}
  }
  function adStart() {
    if (adActive) return; adActive = true; paused = true;
    Snd.adMute = true; Snd.apply(); updGP();
  }
  function adEnd() {
    if (!adActive) return; adActive = false; paused = false; lastAdAt = Date.now(); lastFrame = now();
    Snd.adMute = false; Snd.apply(); updGP(); adovEl.classList.add('hidden');
  }
  function canInterstitial() { return Platform.hasAds() && !adActive && !modalCur && Date.now() - lastAdAt >= AD_GAP; }
  function breakpoint(cb) {
    var done = false;
    function fin(shown) { if (done) return; done = true; if (cb) cb(shown); }
    if (!canInterstitial()) { fin(false); return; }
    adovEl.classList.remove('hidden'); $('adtxt').textContent = t('adSoon');
    setTimeout(function () {
      if (!Platform.hasAds() || adActive || modalCur) { adovEl.classList.add('hidden'); fin(false); return; }
      try {
        Platform.showInterstitial({
            onOpen: function () { adStart(); },
            onClose: function () { adEnd(); fin(true); },
            onError: function () { adovEl.classList.add('hidden'); lastAdAt = Date.now(); adEnd(); fin(true); }
        });
      } catch (e) { adovEl.classList.add('hidden'); lastAdAt = Date.now(); fin(true); }
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

  // ---------- ui helpers ----------
  var toastTm = 0;
  function toast(s) {
    toastEl.textContent = s; toastEl.classList.add('on');
    clearTimeout(toastTm); toastTm = setTimeout(function () { toastEl.classList.remove('on'); }, 1700);
  }
  var modalCur = null, modalQ = [];
  function showModal(o) { if (modalCur) { modalQ.push(o); return; } openM(o); }
  function openM(o) {
    modalCur = o; cardEl.innerHTML = o.html; cardEl.className = 'card' + (o.cls ? ' ' + o.cls : '');
    if (o.x) { var xb = document.createElement('button'); xb.className = 'x'; xb.innerHTML = '<svg><use href="#i-x"/></svg>'; xb.onclick = function () { Snd.click(); closeM(); }; cardEl.appendChild(xb); }
    var bw = document.createElement('div'); bw.className = 'btns';
    (o.btns || []).forEach(function (b) {
      var e = document.createElement('button'); e.className = 'btn ' + (b.cls || 'green'); e.innerHTML = b.t;
      e.onclick = function () { Snd.click(); b.fn(); }; bw.appendChild(e);
    });
    if (bw.children.length) cardEl.appendChild(bw);
    modalEl.classList.remove('hidden'); if (G) G.sel = -1; updGP(); hintEl.classList.remove('on');
    if (o.onOpen) o.onOpen();
  }
  function closeM() {
    var o = modalCur; if (!o) return;
    modalCur = null; modalEl.classList.add('hidden'); cardEl.innerHTML = '';
    if (o.onClose) o.onClose();
    if (modalQ.length && !modalCur) openM(modalQ.shift()); else { updGP(); showHint(); }
  }
  function ico(id) { return '<svg class="ico"><use href="#' + id + '"/></svg>'; }

  // ---------- level state ----------
  function copyT(a) { return a.map(function (x) { return x.slice(); }); }
  function isDone(tb) {
    if (tb.length !== CAP) return false;
    for (var i = 1; i < CAP; i++) if (tb[i] !== tb[0]) return false;
    return true;
  }
  function parFor(n, k) { var p = PARS[n - 1]; return p > 0 ? p : Math.round(k * 3.4); }
  function goalFor(par) { return par + Math.max(1, Math.round(par * 0.25)); }
  function starsFor(moves, par) {
    if (moves <= goalFor(par)) return 3;
    if (moves <= par + Math.round(par * 0.8) + 2) return 2;
    return 1;
  }
  function validRestore(sv) {
    try {
      if (!sv || !(sv.n >= 1 && sv.n <= TOTAL) || !Array.isArray(sv.t) || !Array.isArray(sv.h)) return false;
      var p = GEN.params(sv.n), nt = p.k + p.e + (sv.x ? 1 : 0);
      if (sv.t.length !== nt) return false;
      var cnt = {}, tot = 0;
      for (var i = 0; i < sv.t.length; i++) {
        if (!Array.isArray(sv.t[i]) || sv.t[i].length > CAP) return false;
        for (var j = 0; j < sv.t[i].length; j++) { var c = sv.t[i][j]; if (!(c >= 1 && c <= p.k)) return false; cnt[c] = (cnt[c] || 0) + 1; tot++; }
      }
      if (tot !== p.k * CAP) return false;
      for (var c2 in cnt) if (cnt[c2] !== CAP) return false;
      return !GEN.isWon(sv.t);
    } catch (e) { return false; }
  }
  function resetAnim() {
    flights = []; lift = []; shake = []; doneT = []; appear = []; landT = {}; hover = -1;
    for (var i = 0; i < 24; i++) { lift.push(0); shake.push(-9); doneT.push(0); appear.push(0); }
  }
  function markDone() { var tm = now(); G.tubes.forEach(function (tb, i) { doneT[i] = isDone(tb) ? tm - 99 : 0; }); }

  function startLevel(n, restoreSv) {
    n = clamp(n, 1, TOTAL);
    var Lv = GEN.generate(n), par = parFor(n, Lv.k);
    G = { n: n, k: Lv.k, e: Lv.e, start: Lv.tubes, tubes: copyT(Lv.tubes), hist: [], undos: 3, extra: 0, won: false, sel: -1, par: par, hard: Lv.e === 1, stuckAt: 0, winAt: 0 };
    if (restoreSv) {
      G.tubes = copyT(restoreSv.t); G.hist = restoreSv.h.map(function (m) { return [m[0], m[1]]; }); G.undos = Math.max(0, restoreSv.u | 0); G.extra = restoreSv.x ? 1 : 0;
    }
    resetAnim(); markDone();
    S.lvl = n; clearTimeout(winTm);
    layout(); updHud(); showHint();
    persistGame(); updGP();
    if (started) { floatText(W / 2, POS.length ? ROWS[0] - D * 0.2 : H / 2, t('level', { n: n }), '#2b4fb8', Math.min(40, D * 0.8), 1.3); }
  }
  function persistGame() {
    if (!G) return;
    S.sv = G.won ? null : (G.hist.length ? { n: G.n, t: G.tubes, h: G.hist, u: G.undos, x: G.extra } : null);
    save(false);
  }

  // ---------- layout ----------
  function layout() {
    W = window.innerWidth; H = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = G ? G.tubes.length : 6;
    var aw = W - 20, ah = H - TOPPAD - BOTPAD, best = null, rows;
    for (rows = 1; rows <= 4; rows++) {
      var per = Math.ceil(n / rows);
      if (per * (rows - 1) >= n) continue;
      var d = Math.min(aw / (per * 1.5), ah / (rows * 5.5), 60);
      if (!best || d > best.d * 1.07) best = { d: d, rows: rows, per: per };
    }
    D = best.d; PADT = D * 0.14; TW = D * 1.28; TH = CAP * D + PADT * 2;
    var rowH = D * 5.5, blockH = best.rows * rowH, y0 = TOPPAD + Math.max(0, (ah - blockH) / 2);
    POS = []; ROWS = [];
    var pitch = Math.min(aw / best.per, D * 1.62), idx = 0;
    for (var r = 0; r < best.rows; r++) {
      var cnt = Math.min(best.per, n - idx), rowTop = y0 + r * rowH, yb = rowTop + D * 1.15 + TH;
      ROWS.push(rowTop + D * 1.15);
      for (var i = 0; i < cnt; i++) { POS.push({ x: W / 2 + (i - (cnt - 1) / 2) * pitch, yb: yb, row: r }); idx++; }
    }
    buildSprites();
    hintEl.style.top = 'calc(env(safe-area-inset-top,0px) + ' + (TOPPAD - 8) + 'px)';
  }

  // ---------- sprites ----------
  function symbol(k, x, y, s, id) {
    k.save(); k.lineJoin = 'round'; k.lineCap = 'round';
    k.fillStyle = '#fff'; k.strokeStyle = 'rgba(15,25,70,.75)'; k.lineWidth = Math.max(1.5, s * 0.34);
    var i, a;
    function fs() { k.stroke(); k.fillStyle = '#fff'; k.fill(); }
    k.beginPath();
    switch (id % 12) {
      case 0: k.arc(x, y, s * 0.55, 0, TAU); fs(); break;
      case 1: k.arc(x, y, s * 0.62, 0, TAU); k.lineWidth = s * 0.75; k.strokeStyle = 'rgba(15,25,70,.75)'; k.stroke(); k.lineWidth = s * 0.34; k.strokeStyle = '#fff'; k.stroke(); break;
      case 2: k.rect(x - s * 0.6, y - s * 0.6, s * 1.2, s * 1.2); fs(); break;
      case 3: k.moveTo(x, y - s * 0.82); k.lineTo(x + s * 0.72, y); k.lineTo(x, y + s * 0.82); k.lineTo(x - s * 0.72, y); k.closePath(); fs(); break;
      case 4: k.moveTo(x, y - s * 0.78); k.lineTo(x + s * 0.8, y + s * 0.62); k.lineTo(x - s * 0.8, y + s * 0.62); k.closePath(); fs(); break;
      case 5: k.moveTo(x, y + s * 0.78); k.lineTo(x + s * 0.8, y - s * 0.62); k.lineTo(x - s * 0.8, y - s * 0.62); k.closePath(); fs(); break;
      case 6:
        for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; var rr = i % 2 ? s * 0.4 : s * 0.9; if (i) k.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else k.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
        k.closePath(); fs(); break;
      case 7: k.moveTo(x - s * 0.8, y); k.lineTo(x + s * 0.8, y); k.moveTo(x, y - s * 0.8); k.lineTo(x, y + s * 0.8); k.lineWidth = s * 0.9; k.strokeStyle = 'rgba(15,25,70,.75)'; k.stroke(); k.lineWidth = s * 0.45; k.strokeStyle = '#fff'; k.stroke(); break;
      case 8: k.moveTo(x - s * 0.6, y - s * 0.6); k.lineTo(x + s * 0.6, y + s * 0.6); k.moveTo(x + s * 0.6, y - s * 0.6); k.lineTo(x - s * 0.6, y + s * 0.6); k.lineWidth = s * 0.9; k.strokeStyle = 'rgba(15,25,70,.75)'; k.stroke(); k.lineWidth = s * 0.45; k.strokeStyle = '#fff'; k.stroke(); break;
      case 9:
        k.moveTo(x, y + s * 0.8); k.bezierCurveTo(x - s * 1.3, y - s * 0.1, x - s * 0.5, y - s * 0.95, x, y - s * 0.3); k.bezierCurveTo(x + s * 0.5, y - s * 0.95, x + s * 1.3, y - s * 0.1, x, y + s * 0.8); k.closePath(); fs(); break;
      case 10: k.moveTo(x - s * 0.8, y - s * 0.35); k.lineTo(x + s * 0.8, y - s * 0.35); k.moveTo(x - s * 0.8, y + s * 0.35); k.lineTo(x + s * 0.8, y + s * 0.35); k.lineWidth = s * 0.9; k.strokeStyle = 'rgba(15,25,70,.75)'; k.stroke(); k.lineWidth = s * 0.4; k.strokeStyle = '#fff'; k.stroke(); break;
      default: k.moveTo(x - s * 0.35, y - s * 0.8); k.lineTo(x - s * 0.35, y + s * 0.8); k.moveTo(x + s * 0.35, y - s * 0.8); k.lineTo(x + s * 0.35, y + s * 0.8); k.lineWidth = s * 0.9; k.strokeStyle = 'rgba(15,25,70,.75)'; k.stroke(); k.lineWidth = s * 0.4; k.strokeStyle = '#fff'; k.stroke();
    }
    k.restore();
  }
  function drawBallOn(k, x, y, r, ci, pat) {
    var pal = PAL[ci];
    var g = k.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r);
    g.addColorStop(0, pal.l); g.addColorStop(0.5, pal.b); g.addColorStop(1, pal.d);
    k.fillStyle = g; k.beginPath(); k.arc(x, y, r, 0, TAU); k.fill();
    k.lineWidth = Math.max(1, r * 0.07); k.strokeStyle = pal.d; k.stroke();
    k.fillStyle = 'rgba(255,255,255,.18)'; k.beginPath(); k.ellipse(x + r * 0.15, y + r * 0.58, r * 0.4, r * 0.14, 0, 0, TAU); k.fill();
    if (pat) symbol(k, x, y + r * 0.04, r * 0.4, ci);
    k.fillStyle = 'rgba(255,255,255,.8)'; k.beginPath(); k.ellipse(x - r * 0.36, y - r * 0.45, r * 0.24, r * 0.14, -0.6, 0, TAU); k.fill();
  }
  function buildSprites() {
    var key = Math.round(D * 10) + '|' + dpr + '|' + (S && S.pat ? 1 : 0);
    if (key === sprKey) return;
    sprKey = key; SPR = [];
    var r = D / 2 * 0.94, sz = Math.ceil((r * 2 + 6) * dpr); SPRS = sz / dpr;
    for (var ci = 0; ci < 12; ci++) {
      var c = document.createElement('canvas'); c.width = c.height = sz;
      var k = c.getContext('2d'); k.scale(dpr, dpr);
      drawBallOn(k, SPRS / 2, SPRS / 2, r, ci, !!(S && S.pat));
      SPR.push(c);
    }
  }
  function drawBall(c, x, y, sx, sy) {
    var s = SPR[c - 1]; if (!s) return;
    cx.drawImage(s, x - SPRS * sx / 2, y - SPRS * sy / 2, SPRS * sx, SPRS * sy);
  }

  // ---------- geometry ----------
  function slotXY(i, j) { var p = POS[i]; return { x: p.x, y: p.yb - PADT - (j + 0.5) * D }; }
  function hoverY(i) { return POS[i].yb - TH - D * 0.62; }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }
  function easeOutBack(p) { var c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); }
  function easeInOut(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function liftedXY(i, j) { var s = slotXY(i, j), hy = hoverY(i); return { x: s.x, y: s.y + (hy - s.y) * easeOutBack(clamp(lift[i], 0, 1)) }; }
  function flyingAt(i, j) { for (var q = 0; q < flights.length; q++) if (flights[q].i === i && flights[q].j === j) return flights[q]; return null; }

  // ---------- effects ----------
  function sparkle(x, y, col, n, power) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * TAU, v = (0.3 + Math.random() * 0.7) * power;
      particles.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * 0.25, life: 0.45 + Math.random() * 0.45, age: 0, col: col, sz: D * (0.07 + Math.random() * 0.09), sq: Math.random() < 0.5 });
    }
  }
  function ring(x, y, col, R) { particles.push({ ring: true, x: x, y: y, R: R, life: 0.55, age: 0, col: col }); }
  function floatText(x, y, s, col, size, life) { size = Math.min(size || D * 0.5, (W - 24) / (s.length * 0.6)); floats.push({ x: x, y: y, s: s, col: col || '#fff', size: size, life: life || 1.1, age: 0 }); }
  function confetti() {
    for (var i = 0; i < 110; i++) {
      particles.push({ x: Math.random() * W, y: -10 - Math.random() * H * 0.25, vx: (Math.random() - 0.5) * 120, vy: 60 + Math.random() * 160, life: 1.6 + Math.random() * 1.2, age: 0, col: BASE[i % BASE.length], sz: 6 + Math.random() * 7, sq: Math.random() < 0.6, conf: true });
    }
  }
  function celebrate(i) {
    var tm = now(); doneT[i] = tm;
    var p = POS[i], col = PAL[G.tubes[i][0] - 1].b, cy = p.yb - TH / 2;
    sparkle(p.x, cy, col, 16, D * 7); sparkle(p.x, cy, '#fff', 8, D * 5); sparkle(p.x, p.yb - TH, '#ffd54a', 8, D * 5);
    ring(p.x, cy, col, D * 2.4); Snd.done();
  }

  // ---------- moves ----------
  function flightFor(c, from, to, fi, fj, ti, tj, first) {
    var tm = now(), hy0 = hoverY(fi), hy2 = hoverY(ti);
    var dist = Math.abs(to.x - from.x) + Math.abs(hy2 - hy0) * 0.6;
    var dA = from.y > hy0 + D * 0.15 ? 0.09 : 0, dB = 0.13 + Math.min(0.2, dist * 0.00032), dC = 0.09 + 0.026 * Math.max(0, (to.y - hy2) / D);
    return { c: c, i: ti, j: tj, x0: from.x, y0: from.y, yh0: hy0, x2: to.x, y2: to.y, yh2: hy2, t0: tm, dA: dA, dB: dB, dC: dC, total: dA + dB + dC, arc: D * (0.35 + Math.min(0.5, dist / (D * 12))), cur: { x: from.x, y: from.y, sx: 1, sy: 1 }, comp: false };
  }
  function flightPos(f, tm) {
    var a = tm - f.t0, o = f.cur, p, e;
    o.sx = 1; o.sy = 1;
    if (a < f.dA) { p = a / f.dA; e = easeOut(p); o.x = f.x0; o.y = f.y0 + (f.yh0 - f.y0) * e; }
    else if (a < f.dA + f.dB) {
      p = (a - f.dA) / f.dB; e = easeInOut(p);
      o.x = f.x0 + (f.x2 - f.x0) * e; o.y = f.yh0 + (f.yh2 - f.yh0) * e - Math.sin(Math.PI * p) * f.arc;
      o.sx = 1 - 0.06 * Math.sin(Math.PI * p); o.sy = 1 + 0.08 * Math.sin(Math.PI * p);
    } else {
      p = clamp((a - f.dA - f.dB) / f.dC, 0, 1); e = p * p;
      o.x = f.x2; o.y = f.yh2 + (f.y2 - f.yh2) * e; o.sy = 1 + 0.12 * p; o.sx = 1 - 0.07 * p;
    }
    return o;
  }

  function doMove(f, tI) {
    var tubes = G.tubes, srcLen = tubes[f].length, c = tubes[f][srcLen - 1];
    var from = liftedXY(f, srcLen - 1), tj = tubes[tI].length, to = slotXY(tI, tj);
    tubes[f].pop(); tubes[tI].push(c); G.hist.push([f, tI]); lift[f] = 0; G.sel = -1;
    var fl = flightFor(c, from, to, f, 0, tI, tj);
    fl.comp = isDone(tubes[tI]); flights.push(fl);
    S.tut = 1; hintEl.classList.remove('on');
    var won = GEN.isWon(tubes);
    if (won) { G.won = true; clearTimeout(winTm); G.winAt = now() + fl.total + 0.7; persistGame(); updGP(); }
    else {
      G.stuckAt = GEN.hasMoves(tubes) ? 0 : now() + fl.total + 0.5;
      persistGame();
    }
    updHud();
  }
  function doUndo(free) {
    if (!G || G.won) return;
    if (!G.hist.length) { toast(t('nothing')); return; }
    if (G.undos <= 0 && !free) { rewarded(function () { G.undos += 3; toast(t('undoAdded')); doUndo(true); }); return; }
    var h = G.hist.pop(), f = h[0], tI = h[1], tubes = G.tubes;
    var slot = tubes[tI].length - 1, fl0 = flyingAt(tI, slot), from;
    if (fl0) { from = { x: fl0.cur.x, y: fl0.cur.y }; flights.splice(flights.indexOf(fl0), 1); } else from = slotXY(tI, slot);
    var c = tubes[tI].pop(), nj = tubes[f].length; tubes[f].push(c);
    if (!isDone(tubes[tI])) doneT[tI] = 0;
    if (G.undos > 0) G.undos--;
    lift[tI] = 0; G.sel = -1; G.stuckAt = 0;
    var fl = flightFor(c, from, slotXY(f, nj), tI, 0, f, nj);
    fl.dA = 0; fl.total = fl.dB + fl.dC; flights.push(fl);
    Snd.undo(); persistGame(); updHud();
  }
  function addTube() {
    if (!G || G.won) return;
    if (G.extra) { toast(t('tubeUsed')); return; }
    rewarded(function () {
      if (!G || G.won || G.extra) return;
      G.extra = 1; G.tubes.push([]); G.stuckAt = 0;
      layout(); appear[G.tubes.length - 1] = now();
      var p = POS[G.tubes.length - 1]; sparkle(p.x, p.yb - TH / 2, '#7bf59a', 12, D * 5); Snd.done();
      toast(t('tubeAdded')); persistGame(); updHud();
    });
  }
  function askRestart() {
    if (!G || G.won || modalCur) return;
    if (!G.hist.length) { toast(t('nothing')); return; }
    showModal({
      html: '<h2>' + t('restartAsk') + '</h2><p>' + t('restartSub') + '</p>',
      btns: [{ t: t('yes'), cls: 'pink', fn: function () { closeM(); startLevel(G.n); } }, { t: t('no'), cls: 'gray', fn: function () { closeM(); } }]
    });
  }

  function tapTube(i) {
    if (!G || G.won || modalCur || adActive || i < 0 || i >= G.tubes.length) return;
    var tubes = G.tubes, tb = tubes[i], tm = now();
    if (G.sel < 0) {
      if (!tb.length) return;
      if (isDone(tb)) { shake[i] = tm; return; }
      if (flyingAt(i, tb.length - 1)) return;
      G.sel = i; Snd.pick(); hintEl.classList.remove('on'); return;
    }
    if (G.sel === i) { G.sel = -1; Snd.click(); return; }
    var f = G.sel;
    if (GEN.canMove(tubes, f, i)) { doMove(f, i); return; }
    if (tb.length && !isDone(tb) && !(tb.length === CAP && tubes[f][tubes[f].length - 1] === tb[tb.length - 1]) && !flyingAt(i, tb.length - 1)) { G.sel = i; Snd.pick(); return; }
    shake[i] = tm; Snd.deny();
  }
  function tubeAt(x, y) {
    var best = -1, bd = 1e9;
    for (var i = 0; i < POS.length; i++) {
      var p = POS[i], hw = Math.max(TW * 0.62, 24), top = p.yb - TH - D * 1.15, bot = p.yb + D * 0.2;
      if (x >= p.x - hw && x <= p.x + hw && y >= top && y <= bot) {
        var d = Math.abs(x - p.x) + Math.abs(y - (p.yb - TH / 2)) * 0.2; if (d < bd) { bd = d; best = i; }
      }
    }
    return best;
  }

  // ---------- win / stuck ----------
  var winTm = 0;
  function onWin() {
    var tm = now(), mv = G.hist.length, st = starsFor(mv, G.par), n = G.n;
    G.stars = st;
    var prevSt = S.st[n], prevBm = S.bm[n];
    S.st[n] = Math.max(prevSt, st); S.bm[n] = prevBm ? Math.min(prevBm, mv) : mv;
    if (n >= S.maxLvl && n < TOTAL) S.maxLvl = n + 1;
    if (!prevSt) S.done++;
    S.since++; S.sv = null; S.tut = 1;
    confetti(); Snd.win();
    var p0 = POS[0]; floatText(W / 2, ROWS[0] - D * 0.2, t('won'), '#e88a00', Math.min(44, D * 0.9), 1.6);
    save(true); updHud(); updGP();
    winTm = setTimeout(showWin, 900);
  }
  function totalStars() { var a = 0; for (var i = 1; i <= TOTAL; i++) a += S.st[i] | 0; return a; }
  function showWin() {
    if (!G || !G.won) return;
    var mv = G.hist.length, st = G.stars || 1, n = G.n, par = G.par, last = n >= TOTAL;
    var html = '<h2>' + t(last ? 'allDone' : 'won') + '</h2><div class="stars">';
    for (var i = 1; i <= 3; i++) html += '<svg class="' + (i <= st ? '' : 's0') + '" style="animation-delay:' + (0.15 + i * 0.22) + 's"><use href="#' + (i <= st ? 'i-star' : 'i-star0') + '"/></svg>';
    html += '</div><p>' + t('movesDone', { m: mv }) + '</p><div class="sub">' + t('best', { b: S.bm[n] }) + (st < 3 ? '<br>' + t('goal', { p: goalFor(par) }) : '') + (last ? '<br>' + t('allDoneSub') : '') + '</div>';
    var btns = [];
    if (!last) btns.push({ t: ico('i-play') + t('next'), cls: 'green pulse', fn: function () { goLevel(n + 1); } });
    if (st < 3 || last) btns.push({ t: ico('i-restart') + t('replay'), cls: 'orange', fn: function () { goLevel(n, true); } });
    btns.push({ t: ico('i-grid') + t('levels'), cls: 'blue', fn: function () { closeM(); openMap(); } });
    showModal({ html: html, btns: btns });
  }
  function showStuck() {
    if (!G || G.won || modalCur) return;
    Snd.over();
    var btns = [];
    if (G.hist.length) btns.push({ t: ico('i-undo') + t('undo') + (G.undos > 0 ? '' : ' <small>' + t('undoVideo').split(' ').slice(-2).join(' ') + '</small>'), cls: 'orange', fn: function () { closeM(); doUndo(); } });
    if (!G.extra) btns.push({ t: ico('i-tube') + t('tube') + ' <small>' + t('tubeVideo').split(' ').slice(-2).join(' ') + '</small>', cls: 'green', fn: function () { closeM(); addTube(); } });
    btns.push({ t: ico('i-restart') + t('restart'), cls: 'pink', fn: function () { closeM(); startLevel(G.n); } });
    showModal({ html: '<h2>' + t('stuck') + '</h2><p>' + t('stuckSub') + '</p>', btns: btns });
  }

  // ---------- flow ----------
  function goLevel(n, noAd) {
    closeM();
    n = clamp(n, 1, TOTAL);
    if (n > S.maxLvl) { toast(t('locked')); return; }
    var go = function () { startLevel(n); };
    if (!noAd && S.since >= AD_EVERY) breakpoint(function (shown) { if (shown) S.since = 0; go(); });
    else go();
  }
  function cur() { return S.maxLvl; }

  // ---------- menus ----------
  function openMenu() {
    if (modalCur) return;
    var live = G && !G.won && G.hist.length > 0;
    var html = '<img class="logo" alt="" src="' + logoUrl() + '"><h2>' + t('title') + '</h2><div class="sub">' + t('level', { n: G ? G.n : S.lvl }) + ' &middot; ' + t('totalStars', { a: totalStars(), b: TOTAL * 3 }) + '</div>';
    var btns = [
      { t: ico('i-play') + (live ? t('cont') : t('play')), cls: 'green', fn: function () { closeM(); if (G && G.won) goLevel(Math.min(TOTAL, G.n + 1)); } },
      { t: ico('i-grid') + t('levels'), cls: 'blue', fn: function () { closeM(); openMap(); } }
    ];
    showModal({ x: !!G, html: html, btns: btns });
  }
  var logoCache = '';
  function logoUrl() {
    if (logoCache) return logoCache;
    var c = document.createElement('canvas'); c.width = c.height = 232; var k = c.getContext('2d');
    k.fillStyle = '#e8eefb'; rrOn(k, 0, 0, 232, 232, 40); k.fill();
    var cols = [0, 6, 3];
    for (var q = 0; q < 3; q++) {
      var x = 44 + q * 72, yb = 206, w = 52, h = 164;
      k.beginPath(); k.moveTo(x - w / 2, yb - h); k.lineTo(x + w / 2, yb - h); k.lineTo(x + w / 2, yb - w / 2); k.arc(x, yb - w / 2, w / 2, 0, Math.PI); k.closePath();
      k.fillStyle = 'rgba(255,255,255,.9)'; k.fill(); k.lineWidth = 4; k.strokeStyle = '#b9ccf0'; k.stroke();
      for (var j = 0; j < 4; j++) drawBallOn(k, x, yb - 25 - j * 40, 19, [cols[q], cols[q], cols[(q + 1) % 3], cols[q]][j], false);
    }
    logoCache = c.toDataURL('image/png');
    return logoCache;
  }
  function rrOn(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function openMap() {
    if (modalCur) return;
    var html = '<h2>' + t('levels') + '</h2><div class="sub">' + t('totalStars', { a: totalStars(), b: TOTAL * 3 }) + '</div><div class="mapbox" id="mapbox">', n = 1, cu = cur();
    while (n <= TOTAL) {
      var k = GEN.params(n).k, e = n;
      while (e + 1 <= TOTAL && GEN.params(e + 1).k === k) e++;
      var dots = ''; for (var q = 0; q < Math.min(k, 6); q++) dots += '<b style="background:' + BASE[q] + '"></b>';
      html += '<div class="chap"><i></i><em>' + dots + '</em>' + t('colors', { n: k }) + '<i></i></div>';
      var row = 0, rowsN = Math.ceil((e - n + 1) / 5);
      for (var s = n; s <= e; s += 5, row++) {
        var rev = row % 2 === 1, cells = [], bars = '', vis = [];
        for (var m = s; m < s + 5; m++) {
          if (m > e) { cells.push('<span class="node" style="visibility:hidden"></span>'); vis.push(false); continue; }
          var locked = m > cu, st = S.st[m] | 0, cls = locked ? 'lock' : (m === cu && st === 0 ? 'cur' : ''), hard = GEN.params(m).e === 1, h = '';
          h += '<button class="node ' + cls + '" data-n="' + m + '" aria-label="' + m + '">' + (locked ? '<svg class="lk"><use href="#i-lock"/></svg>' : m);
          if (!locked) { h += '<span class="ns">'; for (var z = 1; z <= 3; z++) h += '<svg><use href="#' + (z <= st ? 'i-star' : 'i-star0') + '"/></svg>'; h += '</span>'; }
          if (hard && !locked) h += '<span class="hd"><svg><use href="#i-flame"/></svg></span>';
          cells.push(h + '</button>'); vis.push(true);
        }
        if (rev) { cells.reverse(); vis.reverse(); }
        for (var q2 = 0; q2 < 4; q2++) if (vis[q2] && vis[q2 + 1]) bars += '<i class="cb" style="left:calc(10% - 3px + ' + q2 + ' * (20% + 1.5px))"></i>';
        if (row < rowsN - 1) bars += '<i class="cv" style="left:calc(10% - 3px + ' + (rev ? 0 : 4) + ' * (20% + 1.5px))"></i>';
        html += '<div class="mrow">' + bars + cells.join('') + '</div>';
      }
      n = e + 1;
    }
    html += '</div>';
    showModal({
      x: true, cls: 'wide', html: html,
      onOpen: function () {
        var box = $('mapbox'); if (!box) return;
        box.addEventListener('click', function (ev) {
          var el = ev.target.closest ? ev.target.closest('.node') : null; if (!el || !el.dataset.n) return;
          var lv = +el.dataset.n; Snd.click();
          if (lv > cur()) { toast(t('locked')); return; }
          closeM(); if (G && lv === G.n && !G.won) return; goLevel(lv);
        });
        var node = box.querySelector('.node.cur') || box.querySelector('.node[data-n="' + cur() + '"]');
        if (node) setTimeout(function () { var bb = box.getBoundingClientRect(), nb = node.getBoundingClientRect(); box.scrollTop += nb.top - bb.top - box.clientHeight / 2 + nb.height / 2; }, 380);
      }
    });
  }

  // ---------- render ----------
  function glassPath(c, x, yTop, yb, w) {
    var r = w / 2, rt = w * 0.14;
    c.beginPath(); c.moveTo(x - w / 2, yTop + rt); c.arcTo(x - w / 2, yTop, x - w / 2 + rt, yTop, rt); c.lineTo(x + w / 2 - rt, yTop); c.arcTo(x + w / 2, yTop, x + w / 2, yTop + rt, rt);
    c.lineTo(x + w / 2, yb - r); c.arc(x, yb - r, r, 0, Math.PI); c.closePath();
  }
  function drawTube(i, tm) {
    var p = POS[i], tb = G.tubes[i], yTop = p.yb - TH, sel = G.sel === i, n = tb.length;
    var ap = 1, dx = 0;
    if (appear[i]) ap = clamp(easeOutBack(clamp((tm - appear[i]) / 0.5, 0, 1)), 0.01, 1.2);
    if (tm - shake[i] < 0.35) dx = Math.sin((tm - shake[i]) * 50) * D * 0.1 * (1 - (tm - shake[i]) / 0.35);
    cx.save();
    cx.translate(p.x + dx, p.yb); cx.scale(ap, ap); cx.translate(-p.x, -p.yb);
    var done = isDone(tb);
    cx.fillStyle = 'rgba(60,80,170,.14)'; cx.beginPath(); cx.ellipse(p.x, p.yb + D * 0.06, TW * 0.6, D * 0.12, 0, 0, TAU); cx.fill();
    if (sel || (hover === i && !done)) {
      cx.save(); cx.shadowColor = sel ? 'rgba(61,139,255,.8)' : 'rgba(61,139,255,.35)'; cx.shadowBlur = sel ? 22 : 12; glassPath(cx, p.x, yTop, p.yb, TW); cx.fillStyle = 'rgba(255,255,255,.01)'; cx.fill(); cx.restore();
    }
    if (done) {
      cx.save(); cx.shadowColor = 'rgba(255,200,58,' + (0.5 + 0.3 * Math.sin(tm * 3 + i)) + ')'; cx.shadowBlur = 16; glassPath(cx, p.x, yTop, p.yb, TW); cx.fillStyle = 'rgba(255,255,255,.01)'; cx.fill(); cx.restore();
    }
    var g = cx.createLinearGradient(p.x - TW / 2, 0, p.x + TW / 2, 0);
    g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(0.45, 'rgba(255,255,255,.32)'); g.addColorStop(1, 'rgba(235,242,255,.6)');
    glassPath(cx, p.x, yTop, p.yb, TW); cx.fillStyle = g; cx.fill();
    for (var j = 0; j < n; j++) {
      if (j === n - 1 && lift[i] > 0.002) continue;
      if (flyingAt(i, j)) continue;
      var s = slotXY(i, j), sx = 1, sy = 1, yy = s.y, lt = landT[i * 16 + j];
      if (lt) {
        var q = (tm - lt) / 0.3;
        if (q >= 1) delete landT[i * 16 + j]; else { var w = Math.sin(Math.PI * q) * (1 - q * 0.4); sy = 1 - 0.2 * w; sx = 1 + 0.12 * w; yy = s.y + (1 - sy) * D * 0.47; }
      }
      if (done) { var wq = (tm - doneT[i] - j * 0.07) / 0.32; if (wq > 0 && wq < 1) { var b = Math.sin(Math.PI * wq); sx *= 1 + 0.18 * b; sy *= 1 + 0.18 * b; } }
      drawBall(tb[j], s.x, yy, sx, sy);
    }
    glassPath(cx, p.x, yTop, p.yb, TW);
    cx.lineWidth = Math.max(2, D * 0.06); cx.strokeStyle = done ? '#ffc83a' : (sel ? '#3d8bff' : '#b3c7ee'); cx.stroke();
    cx.strokeStyle = 'rgba(255,255,255,.95)'; cx.lineWidth = Math.max(2, TW * 0.06); cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(p.x - TW * 0.3, yTop + TW * 0.2); cx.lineTo(p.x - TW * 0.3, p.yb - TW * 0.62); cx.stroke();
    cx.lineWidth = Math.max(1.5, TW * 0.035); cx.strokeStyle = 'rgba(255,255,255,.7)';
    cx.beginPath(); cx.moveTo(p.x + TW * 0.3, yTop + TW * 0.28); cx.lineTo(p.x + TW * 0.3, yTop + TW * 0.65); cx.stroke();
    rrOn(cx, p.x - TW * 0.58, yTop - D * 0.07, TW * 1.16, D * 0.2, D * 0.1);
    cx.fillStyle = 'rgba(255,255,255,.9)'; cx.fill(); cx.lineWidth = Math.max(1.5, D * 0.045); cx.strokeStyle = done ? '#ffc83a' : '#b3c7ee'; cx.stroke();
    if (done) {
      var lp = clamp((tm - doneT[i]) / 0.5, 0, 1), le = easeOutBack(lp), pal = PAL[tb[0] - 1];
      var ly = yTop - D * 0.28 - (1 - le) * D * 1.2;
      var lg = cx.createLinearGradient(0, ly, 0, ly + D * 0.3); lg.addColorStop(0, pal.l); lg.addColorStop(1, pal.b);
      rrOn(cx, p.x - TW * 0.46, ly, TW * 0.92, D * 0.3, D * 0.13); cx.fillStyle = lg; cx.fill(); cx.lineWidth = Math.max(1.5, D * 0.04); cx.strokeStyle = pal.d; cx.stroke();
    }
    cx.restore();
  }

  function render(tm) {
    cx.clearRect(0, 0, W, H);
    if (!G || !POS.length) return;
    for (var r = 0; r < ROWS.length; r++) {
      var rows = POS.filter(function (p) { return p.row === r; }), x0 = rows[0].x - TW * 0.85, x1 = rows[rows.length - 1].x + TW * 0.85, yb = rows[0].yb;
      var sg = cx.createLinearGradient(0, yb - 2, 0, yb + D * 0.5); sg.addColorStop(0, 'rgba(255,255,255,.75)'); sg.addColorStop(1, 'rgba(255,255,255,.1)');
      rrOn(cx, x0, yb - 2, x1 - x0, D * 0.5, D * 0.22); cx.fillStyle = sg; cx.fill();
    }
    var i;
    for (i = 0; i < G.tubes.length; i++) drawTube(i, tm);
    for (i = 0; i < G.tubes.length; i++) {
      if (lift[i] > 0.002 && G.tubes[i].length) {
        var j = G.tubes[i].length - 1, lp = liftedXY(i, j), bob = G.sel === i ? Math.sin(tm * 6) * D * 0.03 * clamp(lift[i], 0, 1) : 0;
        cx.fillStyle = 'rgba(60,80,170,.12)'; cx.beginPath(); cx.ellipse(lp.x, POS[i].yb - TH - D * 0.1, D * 0.3, D * 0.07, 0, 0, TAU); cx.fill();
        drawBall(G.tubes[i][j], lp.x, lp.y + bob, 1 + 0.06 * lift[i], 1 + 0.06 * lift[i]);
      }
    }
    for (i = 0; i < flights.length; i++) { var f = flights[i], po = flightPos(f, tm); drawBall(f.c, po.x, po.y, po.sx, po.sy); }
    for (var a = 0; a < particles.length; a++) {
      var pt = particles[a], pa = pt.age / pt.life; if (pa >= 1) continue;
      if (pt.ring) {
        cx.strokeStyle = pt.col; cx.globalAlpha = (1 - pa) * 0.8; cx.lineWidth = 6 * (1 - pa) + 1;
        cx.beginPath(); cx.arc(pt.x, pt.y, pt.R * easeOut(pa), 0, TAU); cx.stroke(); cx.globalAlpha = 1;
      } else {
        cx.globalAlpha = pt.conf ? Math.min(1, (1 - pa) * 2) : 1 - pa; cx.fillStyle = pt.col;
        if (pt.sq) { cx.save(); cx.translate(pt.x, pt.y); cx.rotate(pt.age * 6 + a); cx.fillRect(-pt.sz / 2, -pt.sz / 3, pt.sz, pt.sz * 0.66); cx.restore(); }
        else { cx.beginPath(); cx.arc(pt.x, pt.y, pt.sz / 2, 0, TAU); cx.fill(); }
        cx.globalAlpha = 1;
      }
    }
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    for (var b = 0; b < floats.length; b++) {
      var fl = floats[b], fa = fl.age / fl.life; if (fa >= 1) continue;
      var pp = Math.min(1, fa * 5), scf = 0.6 + 0.4 * easeOutBack(pp), alp = fa > 0.7 ? 1 - (fa - 0.7) / 0.3 : 1;
      cx.save(); cx.translate(fl.x, Math.max(fl.size * 0.8, fl.y - fa * D * 0.9)); cx.scale(scf, scf); cx.globalAlpha = Math.max(0, alp);
      cx.font = '800 ' + Math.round(fl.size) + 'px "Trebuchet MS","Segoe UI",Arial,sans-serif';
      cx.lineJoin = 'round'; cx.lineWidth = fl.size * 0.2; cx.strokeStyle = '#fff'; cx.strokeText(fl.s, 0, 0);
      cx.fillStyle = fl.col; cx.fillText(fl.s, 0, 0); cx.restore();
    }
  }

  // ---------- update ----------
  function update(dt) {
    var i, tm = now();
    if (G) {
      for (i = 0; i < G.tubes.length; i++) lift[i] += ((G.sel === i ? 1 : 0) - lift[i]) * (1 - Math.exp(-dt * 22));
      for (i = flights.length - 1; i >= 0; i--) {
        var f = flights[i];
        if (tm >= f.t0 + f.total) {
          flights.splice(i, 1); landT[f.i * 16 + f.j] = tm;
          var p = POS[f.i]; if (p) { var s = slotXY(f.i, f.j); sparkle(s.x, s.y + D * 0.4, '#ffffff', 3, D * 2.4); }
          Snd.drop(f.c);
          if (f.comp && G.tubes[f.i] && isDone(G.tubes[f.i])) celebrate(f.i);
        }
      }
      if (G.won && G.winAt && tm >= G.winAt) { G.winAt = 0; onWin(); }
      if (G.stuckAt && tm >= G.stuckAt) { G.stuckAt = 0; if (!G.won && !GEN.hasMoves(G.tubes)) showStuck(); }
    }
    for (i = particles.length - 1; i >= 0; i--) {
      var pt = particles[i]; pt.age += dt;
      if (pt.age >= pt.life) { particles.splice(i, 1); continue; }
      if (!pt.ring) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += (pt.conf ? 180 : D * 14) * dt; }
    }
    for (i = floats.length - 1; i >= 0; i--) { floats[i].age += dt; if (floats[i].age >= floats[i].life) floats.splice(i, 1); }
  }

  var hudCache = {};
  function setHtml(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).innerHTML = v; } }
  function setBadge(id, mode, val) {
    var e = $(id), key = mode + val; if (hudCache[id] === key) return; hudCache[id] = key;
    e.className = 'bdg' + (mode ? ' on' : '') + (mode === 'v' ? ' vid' : '');
    e.innerHTML = mode === 'v' ? '<svg><use href="#i-vid"/></svg>' : (mode === 'n' ? String(val) : '');
  }
  function updHud() {
    if (!G) return;
    setHtml('lvl', t('level', { n: G.n }) + (G.hard ? ' <svg class="ico" style="width:20px;height:20px;vertical-align:-3px"><use href="#i-flame"/></svg>' : ''));
    setHtml('mv', t('moves', { m: G.hist.length, p: goalFor(G.par) }));
    setBadge('gundo', G.undos > 0 ? 'n' : 'v', G.undos);
    setBadge('gtube', G.extra ? '' : 'v', 0);
    $('btube').classList.toggle('off', !!G.extra);
    $('bundo').classList.toggle('off', !G.hist.length);
    $('bpat').classList.toggle('on', !!S.pat);
  }
  function showHint() {
    if (S.tut || !G || G.hist.length > 0 || modalCur || G.won) { hintEl.classList.remove('on'); return; }
    hintEl.textContent = t('hint'); hintEl.classList.add('on');
  }
  function applyLang() {
    document.documentElement.lang = L; document.title = t('title');
    $('lmap').textContent = t('levels'); $('lundo').textContent = t('undo'); $('lrestart').textContent = t('restart'); $('ltube').textContent = t('tube');
    $('bsnd').setAttribute('aria-label', 'sound'); hudCache = {};
  }
  function setSndIcon() { document.querySelector('#bsnd use').setAttribute('href', Snd.muted ? '#i-mute' : '#i-snd'); }

  function frame() {
    requestAnimationFrame(frame);
    var tm = now(), dt = Math.min(0.05, tm - lastFrame); lastFrame = tm;
    if (paused) dt = 0;
    update(dt); render(tm);
  }

  // ---------- input ----------
  function bindInput() {
    cv.addEventListener('pointerdown', function (e) {
      Snd.unlock(); if (modalCur || adActive || !started || !G) return;
      var i = tubeAt(e.clientX, e.clientY);
      if (i >= 0) tapTube(i);
      else if (G.sel >= 0) { G.sel = -1; Snd.click(); }
    });
    cv.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || !G || modalCur) { hover = -1; return; }
      hover = tubeAt(e.clientX, e.clientY); cv.style.cursor = hover >= 0 ? 'pointer' : 'default';
    });
    cv.addEventListener('pointerleave', function () { hover = -1; });

    $('bsnd').addEventListener('click', function () {
      Snd.unlock(); Snd.muted = !Snd.muted; S.muted = Snd.muted; Snd.apply(); setSndIcon(); Snd.click(); save(false);
    });
    $('bpat').addEventListener('click', function () {
      Snd.unlock(); S.pat = !S.pat; buildSprites(); updHud(); Snd.click(); toast(t(S.pat ? 'patOn' : 'patOff')); save(false);
    });
    $('bmenu').addEventListener('click', function () { Snd.unlock(); Snd.click(); if (modalCur) return; openMenu(); });
    $('bmap').addEventListener('click', function () { Snd.unlock(); Snd.click(); if (modalCur || adActive) return; openMap(); });
    $('bundo').addEventListener('click', function () { Snd.unlock(); if (modalCur || adActive) return; doUndo(); });
    $('brestart').addEventListener('click', function () { Snd.unlock(); Snd.click(); if (adActive) return; askRestart(); });
    $('btube').addEventListener('click', function () { Snd.unlock(); if (modalCur || adActive) return; addTube(); });
    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', function () { setTimeout(layout, 200); });
    window.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    ['gesturestart', 'gesturechange'].forEach(function (g) { document.addEventListener(g, function (e) { e.preventDefault(); }); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        paused = true; persistGame(); save(true);
        if (Snd.ctx && Snd.ctx.state === 'running') Snd.ctx.suspend();
        updGP();
      } else {
        if (!adActive) paused = false;
        lastFrame = now();
        if (Snd.ctx && !adActive) Snd.ctx.resume();
        updGP();
      }
    });
    window.addEventListener('pagehide', function () { persistGame(); save(true); });
    window.addEventListener('blur', function () { persistGame(); save(false); });
  }

  // ---------- boot ----------
  function loadState(cloud) {
    var cands = [];
    var loc = sane(readLocal()); if (loc) cands.push(loc);
    var cl = cloud && cloud.save ? sane(cloud.save) : null; if (cl) cands.push(cl);
    cands.sort(function (a, b) { return b.savedAt - a.savedAt; });
    return cands[0] || defaults();
  }
  function start() {
    resetAnim(); layout(); bindInput(); applyLang();
    Snd.muted = !!S.muted; setSndIcon();
    var sv = S.sv && validRestore(S.sv) ? S.sv : null;
    startLevel(sv ? sv.n : Math.min(S.lvl, S.maxLvl), sv);
    started = true; lastFrame = now();
    requestAnimationFrame(frame);
    openMenu();
    setTimeout(function () {
      Platform.ready();
      updGP();
    }, 120);
    Platform.onPause(function () { paused = true; Snd.adMute = true; Snd.apply(); });
    Platform.onResume(function () { if (!adActive) { paused = false; Snd.adMute = false; Snd.apply(); lastFrame = now(); } });
    if (DBG) window.__dbg = {
      S: S, get paused() { return paused; }, get adOn() { return adActive; }, get G() { return G; }, startLevel: startLevel, goLevel: goLevel, doMove: doMove, doUndo: doUndo, tapTube: tapTube, openMap: openMap, openMenu: openMenu, closeM: closeM,
      onWin: onWin, showStuck: showStuck, canAd: canInterstitial, setLastAd: function (v) { lastAdAt = v; }, save: save, layout: layout,
      pos: function (i) { var p = POS[i]; return { x: p.x, y: p.yb - TH / 2, top: p.yb - TH }; },
      info: function () { return { D: D, TW: TW, TH: TH, W: W, H: H, n: POS.length, rows: ROWS.length, flights: flights.length, modal: !!modalCur, adActive: adActive }; },
      solveWith: function (path) { path.forEach(function (m) { doMove(m[0], m[1]); }); }
    };
  }
  function boot() {
    S = defaults();
    Platform.init().catch(function () {}).then(function () {
      return Platform.showPreloader ? Promise.resolve(Platform.showPreloader()).catch(function () {}) : null;
    }).then(function () {
      var code = PARAMS.get('lang') || Platform.getLang() || navigator.language;
      L = langFrom(code);
      return Platform.loadData();
    }).then(function (cloud) {
      S = loadState(cloud);
      start();
    }).catch(function (e) {
      if (window.console) console.warn('boot', e);
      S = loadState(null); if (!started) start();
    });
  }
  boot();
})();
