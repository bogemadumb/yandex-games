(function () {
  'use strict';

  var PARAMS = new URLSearchParams(location.search);
  var DBG = PARAMS.has('debug');
  var SZ = 8, NC = 64, AD_GAP = 90000, SAVE_KEY = 'blk_save_v1';
  var TAU = Math.PI * 2;
  var BASE = ['#ff5a6e', '#ff9a2e', '#ffcf33', '#3ed17a', '#2fb8ff', '#6a7bff', '#c45cff', '#ff6bb5'];

  function mixHex(h, to, a) {
    var n = parseInt(h.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var m = parseInt(to.slice(1), 16), r2 = m >> 16, g2 = (m >> 8) & 255, b2 = m & 255;
    return 'rgb(' + Math.round(r + (r2 - r) * a) + ',' + Math.round(g + (g2 - g) * a) + ',' + Math.round(b + (b2 - b) * a) + ')';
  }
  var PAL = BASE.map(function (b) { return { b: b, l: mixHex(b, '#ffffff', 0.42), d: mixHex(b, '#1a1f5a', 0.32) }; });

  var SH_DEF = [
    [1, '#'],
    [3, '##'], [3, '#|#'],
    [3, '###'], [3, '#|#|#'],
    [2, '####'], [2, '#|#|#|#'],
    [1.2, '#####'], [1.2, '#|#|#|#|#'],
    [3, '##|##'],
    [2, '###|###'], [2, '##|##|##'],
    [1, '###|###|###'],
    [3, '#.|##'], [3, '.#|##'], [3, '##|#.'], [3, '##|.#'],
    [1.5, '#..|#..|###'], [1.5, '..#|..#|###'], [1.5, '###|#..|#..'], [1.5, '###|..#|..#'],
    [2, '###|.#.'], [2, '.#.|###'], [2, '#.|##|#.'], [2, '.#|##|.#'],
    [2, '.##|##.'], [2, '##.|.##'], [2, '#.|##|.#'], [2, '.#|##|#.'],
    [2, '#.|#.|##'], [2, '.#|.#|##'], [2, '##|#.|#.'], [2, '##|.#|.#'],
    [2, '###|#..'], [2, '###|..#'], [2, '#..|###'], [2, '..#|###']
  ];
  var SHAPES = SH_DEF.map(function (d) {
    var rows = d[1].split('|'), cells = [];
    for (var r = 0; r < rows.length; r++) for (var c = 0; c < rows[r].length; c++) if (rows[r][c] === '#') cells.push([r, c]);
    return { cells: cells, h: rows.length, w: rows[0].length, wt: d[0], n: cells.length };
  });
  var TOTW = SHAPES.reduce(function (a, s) { return a + s.wt; }, 0);

  var TXT = {
    ru: {
      title: 'Блок Блиц', score: 'Счёт', menu: 'Меню', play: 'Играть', cont: 'Продолжить', newGame: 'Новая игра',
      daily: 'Челлендж дня', ach: 'Достижения', hint: 'Перетащи фигуру на поле', hintTouch: 'Тяни фигуру на поле, она поднимется над пальцем',
      over: 'Игра окончена', noRoom: 'Фигурам больше нет места', newBest: 'Новый рекорд!', bestIs: 'Рекорд: {x}',
      revive: 'Продолжить', reviveSub: 'за видео', reviveInfo: 'Видео очистит зону 3x3 и даст новые фигуры. Один раз за игру.',
      again: 'Играть снова', retry: 'Попробовать снова', toMenu: 'В меню',
      combo: 'Комбо x{n}', w2: 'Хорошо!', w3: 'Отлично!', w4: 'Супер!', w5: 'Невероятно!', perfect: 'Идеально! Поле чисто',
      dailyTitle: 'Челлендж дня', dailySub: 'У всех игроков сегодня одно и то же стартовое поле и одни и те же фигуры. Набери больше за день!',
      todayBest: 'Лучший сегодня', streak: 'Серия дней', dailyOver: 'Результат дня', tomorrow: 'Завтра будет новое поле',
      games: 'Игр', lines: 'Линий', maxCombo: 'Макс. комбо', bestScore: 'Рекорд',
      unlocked: 'Достижение!', locked: 'закрыто',
      a_line: 'Первая линия', d_line: 'Очисти линию', a_combo3: 'Комбо x3', d_combo3: 'Собери комбо x3',
      a_combo5: 'Комбо x5', d_combo5: 'Собери комбо x5', a_quad: 'Квартет', d_quad: 'Очисти 4 линии одним ходом',
      a_s1000: 'Тысяча', d_s1000: 'Набери 1000 очков', a_s5000: 'Мастер', d_s5000: 'Набери 5000 очков',
      a_perfect: 'Идеально', d_perfect: 'Полностью очисти поле', a_lines100: 'Чистильщик', d_lines100: 'Очисти 100 линий',
      a_daily1: 'Игрок дня', d_daily1: 'Сыграй в челлендж дня', a_streak3: 'Серия', d_streak3: 'Играй в челлендж 3 дня подряд',
      adSoon: 'Короткая рекламная пауза…', noReward: 'Награда не получена', adFail: 'Реклама сейчас недоступна', ok: 'Хорошо', close: 'Закрыть'
    },
    en: {
      title: 'Block Blitz', score: 'Score', menu: 'Menu', play: 'Play', cont: 'Continue', newGame: 'New game',
      daily: 'Daily challenge', ach: 'Achievements', hint: 'Drag a piece onto the board', hintTouch: 'Drag a piece onto the board, it floats above your finger',
      over: 'Game over', noRoom: 'No room left for the pieces', newBest: 'New best!', bestIs: 'Best: {x}',
      revive: 'Continue', reviveSub: 'watch video', reviveInfo: 'A video clears a 3x3 area and gives new pieces. Once per game.',
      again: 'Play again', retry: 'Try again', toMenu: 'Menu',
      combo: 'Combo x{n}', w2: 'Nice!', w3: 'Great!', w4: 'Super!', w5: 'Incredible!', perfect: 'Perfect! Board cleared',
      dailyTitle: 'Daily challenge', dailySub: 'Every player gets the same starting board and the same pieces today. Score as high as you can!',
      todayBest: 'Best today', streak: 'Day streak', dailyOver: 'Daily result', tomorrow: 'A new board arrives tomorrow',
      games: 'Games', lines: 'Lines', maxCombo: 'Max combo', bestScore: 'Best',
      unlocked: 'Achievement!', locked: 'locked',
      a_line: 'First line', d_line: 'Clear a line', a_combo3: 'Combo x3', d_combo3: 'Reach a x3 combo',
      a_combo5: 'Combo x5', d_combo5: 'Reach a x5 combo', a_quad: 'Quartet', d_quad: 'Clear 4 lines with one move',
      a_s1000: 'Thousand', d_s1000: 'Score 1000 points', a_s5000: 'Master', d_s5000: 'Score 5000 points',
      a_perfect: 'Perfect', d_perfect: 'Clear the whole board', a_lines100: 'Cleaner', d_lines100: 'Clear 100 lines',
      a_daily1: 'Player of the day', d_daily1: 'Play the daily challenge', a_streak3: 'Streak', d_streak3: 'Play the challenge 3 days in a row',
      adSoon: 'Short ad break…', noReward: 'Reward not granted', adFail: 'Ads are unavailable right now', ok: 'OK', close: 'Close'
    },
    tr: {
      title: 'Blok Blitz', score: 'Skor', menu: 'Menü', play: 'Oyna', cont: 'Devam et', newGame: 'Yeni oyun',
      daily: 'Günün meydan okuması', ach: 'Başarımlar', hint: 'Parçayı tahtaya sürükle', hintTouch: 'Parçayı tahtaya sürükle, parmağının üstünde yükselir',
      over: 'Oyun bitti', noRoom: 'Parçalara yer kalmadı', newBest: 'Yeni rekor!', bestIs: 'Rekor: {x}',
      revive: 'Devam et', reviveSub: 'video izle', reviveInfo: 'Video 3x3 alanı temizler ve yeni parçalar verir. Oyun başına bir kez.',
      again: 'Tekrar oyna', retry: 'Tekrar dene', toMenu: 'Menüye',
      combo: 'Kombo x{n}', w2: 'İyi!', w3: 'Harika!', w4: 'Süper!', w5: 'İnanılmaz!', perfect: 'Mükemmel! Tahta temiz',
      dailyTitle: 'Günün meydan okuması', dailySub: 'Bugün tüm oyuncular aynı başlangıç tahtasını ve aynı parçaları alır. Olabildiğince çok puan topla!',
      todayBest: 'Bugünün en iyisi', streak: 'Gün serisi', dailyOver: 'Günün sonucu', tomorrow: 'Yarın yeni bir tahta gelecek',
      games: 'Oyun', lines: 'Çizgi', maxCombo: 'En yüksek kombo', bestScore: 'Rekor',
      unlocked: 'Başarım!', locked: 'kilitli',
      a_line: 'İlk çizgi', d_line: 'Bir çizgi temizle', a_combo3: 'Kombo x3', d_combo3: 'x3 kombo yap',
      a_combo5: 'Kombo x5', d_combo5: 'x5 kombo yap', a_quad: 'Dörtlü', d_quad: 'Tek hamlede 4 çizgi temizle',
      a_s1000: 'Bin', d_s1000: '1000 puan topla', a_s5000: 'Usta', d_s5000: '5000 puan topla',
      a_perfect: 'Mükemmel', d_perfect: 'Tahtanın tamamını temizle', a_lines100: 'Temizlikçi', d_lines100: '100 çizgi temizle',
      a_daily1: 'Günün oyuncusu', d_daily1: 'Günün meydan okumasını oyna', a_streak3: 'Seri', d_streak3: 'Meydan okumayı art arda 3 gün oyna',
      adSoon: 'Kısa reklam arası…', noReward: 'Ödül verilmedi', adFail: 'Reklamlar şu an kullanılamıyor', ok: 'Tamam', close: 'Kapat'
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
  function fmt(n) {
    n = Math.floor(n);
    return L === 'tr' ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : L === 'ru' ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  var $ = function (id) { return document.getElementById(id); };
  var cv = $('c'), cx = cv.getContext('2d');
  var toastEl = $('toast'), bannerEl = $('banner'), hintEl = $('hint');
  var modalEl = $('modal'), cardEl = $('card'), adovEl = $('adov');

  // ---------- state ----------
  var S, G = null;
  var paused = false, adActive = false, hiddenAt = 0, started = false, lastFrame = 0;
  var lastAdAt = Date.now(), lastCloudAt = 0;
  var gpOn = false;
  var drag = null, pop = [], fxCells = [], particles = [], floats = [], shake = 0, overTm = 0;
  var W = 0, H = 0, dpr = 1, land = false, CELL = 40, BX = 0, BY = 0, GRID = 320, PADP = 9;
  var slots = [], trayCell = 24, hintPos = { x: 0, y: 0 };
  var dispScore = 0;

  function now() { return performance.now() / 1000; }
  function dayKey() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); }

  function defaults() {
    return {
      v: 1, savedAt: 0, best: 0, games: 0, lines: 0, maxCombo: 0, maxLines: 0, perfect: 0, ach: {}, muted: false, tut: 0,
      daily: { day: -1, best: 0, plays: 0, streak: 0, last: -999 }, sv: { classic: null, daily: null }
    };
  }
  function sane(d) {
    if (!d || typeof d !== 'object' || d.v !== 1 || !isFinite(d.best)) return null;
    var b = defaults();
    for (var k in b) if (d[k] == null) d[k] = b[k];
    if (!d.daily || typeof d.daily !== 'object') d.daily = b.daily;
    if (!d.sv || typeof d.sv !== 'object') d.sv = b.sv;
    d.best = Math.max(0, d.best);
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
    pick: function () { this.tone(520, 0.06, 'sine', 0.12, 1.25); },
    put: function () { this.tone(220, 0.1, 'triangle', 0.3, 0.7); this.tone(440, 0.06, 'sine', 0.1, 1); },
    clear: function (n, combo) {
      var sc = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568], b = Math.min(combo - 1, 4), k = Math.min(n + 2, 6);
      for (var i = 0; i < k; i++) Snd.tone(sc[b + i], 0.22, 'triangle', 0.22, 1, i * 0.06);
      this.tone(130, 0.2, 'sine', 0.3, 0.6);
    },
    deny: function () { this.tone(170, 0.16, 'square', 0.1, 0.7); },
    click: function () { this.tone(700, 0.05, 'sine', 0.15, 1.2); },
    fan: function () { [523, 659, 784, 1046].forEach(function (f, i) { Snd.tone(f, 0.3, 'triangle', 0.25, 1, i * 0.1); }); },
    over: function () { [392, 330, 262, 196].forEach(function (f, i) { Snd.tone(f, 0.3, 'triangle', 0.24, 0.96, i * 0.16); }); }
  };

  // ---------- SDK ----------
  function updGP() {
    var want = started && !document.hidden && !adActive && !modalCur && !!G && !G.over;
    if (want === gpOn) return;
    gpOn = want;
    try { if (want) Platform.gameplayStart(); else Platform.gameplayStop(); } catch (e) {}
  }
  function adStart() {
    if (adActive) return; adActive = true; paused = true; drag = null;
    Snd.adMute = true; Snd.apply(); updGP();
  }
  function adEnd() {
    if (!adActive) return; adActive = false; paused = false; lastAdAt = Date.now(); lastFrame = now();
    Snd.adMute = false; Snd.apply(); updGP(); adovEl.classList.add('hidden');
  }
  function canInterstitial() { return Platform.hasAds() && !adActive && !modalCur && Date.now() - lastAdAt >= AD_GAP; }
  function breakpoint(cb) {
    var done = false;
    function fin() { if (done) return; done = true; if (cb) cb(); }
    if (!canInterstitial()) { fin(); return; }
    adovEl.classList.remove('hidden'); $('adtxt').textContent = t('adSoon');
    setTimeout(function () {
      if (!Platform.hasAds() || adActive || modalCur) { adovEl.classList.add('hidden'); fin(); return; }
      try {
        Platform.showInterstitial({
            onOpen: function () { adStart(); },
            onClose: function () { adEnd(); fin(); },
            onError: function () { adovEl.classList.add('hidden'); lastAdAt = Date.now(); adEnd(); fin(); }
        });
      } catch (e) { adovEl.classList.add('hidden'); lastAdAt = Date.now(); fin(); }
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
  var bannerTm = 0;
  function banner(line1, line2) {
    bannerEl.innerHTML = '<svg><use href="#i-medal"/></svg><div><b>' + line1 + '</b>' + line2 + '</div>';
    bannerEl.classList.add('on');
    clearTimeout(bannerTm); bannerTm = setTimeout(function () { bannerEl.classList.remove('on'); }, 2600);
  }
  var modalCur = null, modalQ = [];
  function showModal(o) { if (modalCur) { modalQ.push(o); return; } openM(o); }
  function openM(o) {
    modalCur = o; cardEl.innerHTML = o.html;
    if (o.x) { var xb = document.createElement('button'); xb.className = 'x'; xb.innerHTML = '<svg><use href="#i-x"/></svg>'; xb.onclick = function () { Snd.click(); closeM(); }; cardEl.appendChild(xb); }
    var bw = document.createElement('div'); bw.className = 'btns';
    (o.btns || []).forEach(function (b) {
      var e = document.createElement('button'); e.className = 'btn ' + (b.cls || 'green'); e.innerHTML = b.t;
      e.onclick = function () { Snd.click(); b.fn(); }; bw.appendChild(e);
    });
    if (bw.children.length) cardEl.appendChild(bw);
    modalEl.classList.remove('hidden'); drag = null; updGP(); hintEl.classList.remove('on');
    if (o.onOpen) o.onOpen();
  }
  function closeM() {
    var o = modalCur; if (!o) return;
    modalCur = null; modalEl.classList.add('hidden'); cardEl.innerHTML = '';
    if (o.onClose) o.onClose();
    if (modalQ.length && !modalCur) openM(modalQ.shift()); else updGP();
  }
  function ico(id) { return '<svg class="ico"><use href="#' + id + '"/></svg>'; }

  // ---------- game core ----------
  function rng(g) {
    g.rs = (g.rs + 0x6D2B79F5) >>> 0;
    var x = g.rs; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  }
  function fitsAt(board, sh, r, c) {
    if (r < 0 || c < 0 || r + sh.h > SZ || c + sh.w > SZ) return false;
    for (var i = 0; i < sh.cells.length; i++) if (board[(r + sh.cells[i][0]) * SZ + c + sh.cells[i][1]]) return false;
    return true;
  }
  function fitsAnywhere(board, si) {
    var sh = SHAPES[si];
    for (var r = 0; r <= SZ - sh.h; r++) for (var c = 0; c <= SZ - sh.w; c++) if (fitsAt(board, sh, r, c)) return true;
    return false;
  }
  function pickShape(g) {
    var r = rng(g) * TOTW, i = 0;
    for (; i < SHAPES.length; i++) { r -= SHAPES[i].wt; if (r < 0) break; }
    return Math.min(i, SHAPES.length - 1);
  }
  function newSet(g) {
    var ps = [], i;
    for (i = 0; i < 3; i++) ps.push({ s: pickShape(g), c: Math.floor(rng(g) * PAL.length), p: false });
    var ok = false;
    for (i = 0; i < 3; i++) if (fitsAnywhere(g.board, ps[i].s)) ok = true;
    if (!ok) {
      var st = ps[0].s;
      for (var k = 0; k < SHAPES.length; k++) { var s = (st + k) % SHAPES.length; if (fitsAnywhere(g.board, s)) { ps[0].s = s; break; } }
    }
    return ps;
  }
  function fullLines(board) {
    var rows = [], cols = [], r, c, f;
    for (r = 0; r < SZ; r++) { f = true; for (c = 0; c < SZ; c++) if (!board[r * SZ + c]) { f = false; break; } if (f) rows.push(r); }
    for (c = 0; c < SZ; c++) { f = true; for (r = 0; r < SZ; r++) if (!board[r * SZ + c]) { f = false; break; } if (f) cols.push(c); }
    return { rows: rows, cols: cols };
  }
  function linesWith(board, sh, r0, c0) {
    var b = board.slice();
    for (var i = 0; i < sh.cells.length; i++) b[(r0 + sh.cells[i][0]) * SZ + c0 + sh.cells[i][1]] = 1;
    return fullLines(b);
  }
  function dailySeed() { return ((dayKey() * 2654435761) ^ 0x9E3779B9) >>> 0; }
  function makeGame(mode) {
    var g = { mode: mode, board: [], pieces: [], score: 0, combo: 0, miss: 0, lines: 0, cont: false, moves: 0, over: false, rs: 0, day: dayKey(), setT: 0, maxCombo: 0 };
    for (var i = 0; i < NC; i++) g.board.push(0);
    g.rs = mode === 'daily' ? dailySeed() : ((Math.random() * 4294967296) >>> 0);
    if (mode === 'daily') {
      var n = 12 + Math.floor(rng(g) * 5), k = 0;
      while (k < n) { var p = Math.floor(rng(g) * NC), c = Math.floor(rng(g) * PAL.length); if (!g.board[p]) { g.board[p] = c + 1; k++; } }
      var fl = fullLines(g.board);
      fl.rows.forEach(function (r) { g.board[r * SZ] = 0; }); fl.cols.forEach(function (c) { g.board[c] = 0; });
    }
    g.pieces = newSet(g); g.setT = now();
    refreshFit(g);
    return g;
  }
  function refreshFit(g) { g.pieces.forEach(function (p) { p.fit = !p.p && fitsAnywhere(g.board, p.s); }); }
  function serGame(g) {
    return { m: g.mode, d: g.day, b: g.board.join(''), p: g.pieces.map(function (p) { return [p.s, p.c, p.p ? 1 : 0]; }), sc: g.score, cb: g.combo, ms: g.miss, ln: g.lines, ct: g.cont ? 1 : 0, rs: g.rs, mv: g.moves, mc: g.maxCombo };
  }
  function restoreGame(o) {
    if (!o || typeof o.b !== 'string' || o.b.length !== NC || !Array.isArray(o.p) || o.p.length !== 3) return null;
    var g = makeGame.call(null, 'classic');
    g.mode = o.m === 'daily' ? 'daily' : 'classic'; g.day = o.d | 0;
    g.board = o.b.split('').map(function (ch) { var v = +ch; return v >= 0 && v <= PAL.length ? v : 0; });
    g.pieces = [];
    for (var i = 0; i < 3; i++) {
      var q = o.p[i]; if (!q || q[0] < 0 || q[0] >= SHAPES.length) return null;
      g.pieces.push({ s: q[0] | 0, c: Math.max(0, Math.min(PAL.length - 1, q[1] | 0)), p: !!q[2] });
    }
    g.score = Math.max(0, o.sc | 0); g.combo = Math.max(0, o.cb | 0); g.miss = Math.max(0, o.ms | 0); g.lines = Math.max(0, o.ln | 0);
    g.cont = !!o.ct; g.rs = o.rs >>> 0; g.moves = Math.max(0, o.mv | 0); g.maxCombo = Math.max(0, o.mc | 0); g.over = false; g.setT = now() - 5;
    refreshFit(g);
    if (!g.pieces.some(function (p) { return !p.p; })) { g.pieces = newSet(g); refreshFit(g); }
    return g;
  }
  function persistGame() {
    if (!G) return;
    S.sv[G.mode] = G.over ? null : serGame(G);
  }
  function resetPop() { pop = []; for (var i = 0; i < NC; i++) pop.push(-9); }

  function newGame(mode) {
    G = makeGame(mode); resetPop(); fxCells = []; floats = []; particles = []; drag = null; dispScore = 0; clearTimeout(overTm);
    persistGame(); save(false); updHud(true); updGP(); showHint();
  }
  function useGame(g) {
    G = g; resetPop(); fxCells = []; floats = []; particles = []; drag = null; dispScore = g.score; clearTimeout(overTm);
    updHud(true); updGP(); showHint();
  }

  function cellRC(i) { return { r: Math.floor(i / SZ), c: i % SZ }; }
  function boardCenter(r, c) { return { x: BX + c * CELL + CELL / 2, y: BY + r * CELL + CELL / 2 }; }

  function clearCells(list, orR, orC, col) {
    var tm = now();
    list.forEach(function (i) {
      var rc = cellRC(i), col2 = col != null ? col : G.board[i] - 1;
      var d = Math.abs(rc.r - orR) + Math.abs(rc.c - orC);
      fxCells.push({ r: rc.r, c: rc.c, col: Math.max(0, col2), t0: tm, d: d * 0.032, burst: false });
      G.board[i] = 0;
    });
  }

  function doPlace(slot, r0, c0) {
    var p = G.pieces[slot], sh = SHAPES[p.s], tm = now(), i;
    for (i = 0; i < sh.cells.length; i++) {
      var idx = (r0 + sh.cells[i][0]) * SZ + c0 + sh.cells[i][1];
      G.board[idx] = p.c + 1; pop[idx] = tm;
    }
    p.p = true; p.fit = false; G.moves++; G.score += sh.n;
    var fl = fullLines(G.board), n = fl.rows.length + fl.cols.length, mid = boardCenter(r0 + (sh.h - 1) / 2, c0 + (sh.w - 1) / 2);
    Snd.put();
    var cx0 = mid.x, cy0 = mid.y;
    for (i = 0; i < sh.cells.length; i++) { var pc = boardCenter(r0 + sh.cells[i][0], c0 + sh.cells[i][1]); sparkle(pc.x, pc.y, PAL[p.c].b, 2, CELL * 2.2); }
    if (n > 0) {
      var set = {}, list = [];
      fl.rows.forEach(function (r) { for (var c = 0; c < SZ; c++) set[r * SZ + c] = 1; });
      fl.cols.forEach(function (c) { for (var r = 0; r < SZ; r++) set[r * SZ + c] = 1; });
      for (var k in set) list.push(+k);
      G.combo++; G.miss = 0; G.lines += n;
      if (G.combo > G.maxCombo) G.maxCombo = G.combo;
      var gain = n * n * 10 * G.combo;
      clearCells(list, r0 + (sh.h - 1) / 2, c0 + (sh.w - 1) / 2);
      var empty = G.board.every(function (v) { return !v; });
      G.score += gain;
      Snd.clear(n, G.combo);
      shake = Math.min(14, 3 + n * 2.5 + G.combo);
      floatText(cx0, cy0 - CELL, '+' + fmt(gain), '#ff8a1f', CELL * 0.62);
      var word = n >= 5 ? 'w5' : n >= 4 ? 'w4' : n >= 3 ? 'w3' : n >= 2 ? 'w2' : null;
      if (word) floatText(BX + GRID / 2, BY + GRID * 0.42, t(word), '#2b4fb8', CELL * 0.95, 1.4);
      if (G.combo >= 2) floatText(BX + GRID / 2, BY + GRID * 0.58, t('combo', { n: G.combo }), '#e8461c', CELL * 0.72, 1.4);
      ring(cx0, cy0, PAL[p.c].b, CELL * (1.3 + n * 0.55));
      S.lines += n;
      if (G.combo > S.maxCombo) S.maxCombo = G.combo;
      if (n > S.maxLines) S.maxLines = n;
      if (empty) {
        G.score += 200; S.perfect++;
        floatText(BX + GRID / 2, BY + GRID * 0.3, t('perfect'), '#0d9b52', CELL * 0.62, 1.8);
        Snd.fan(); shake = 16;
        for (var q = 0; q < 6; q++) ring(BX + GRID / 2, BY + GRID / 2, BASE[q], CELL * (2 + q * 0.6));
      }
    } else {
      G.miss++; if (G.miss >= 3) G.combo = 0;
    }
    if (!S.tut) { S.tut = 1; hintEl.classList.remove('on'); }
    if (G.pieces.every(function (x) { return x.p; })) { G.pieces = newSet(G); G.setT = now(); }
    refreshFit(G);
    checkAch();
    updHud(false);
    if (!G.pieces.some(function (x) { return !x.p && x.fit; })) gameOver();
    else { persistGame(); save(false); }
  }

  function gameOver() {
    G.over = true; drag = null; shake = Math.max(shake, 6); Snd.over();
    var newBest = G.score > S.best;
    G.newBest = newBest;
    if (newBest) S.best = G.score;
    if (!G.cont) S.games++;
    if (G.mode === 'daily') {
      var dk = dayKey(), D = S.daily;
      if (D.day !== dk) { D.day = dk; D.best = 0; D.plays = 0; }
      if (D.last !== dk) { D.streak = D.last === dk - 1 ? D.streak + 1 : 1; D.last = dk; }
      D.plays++; if (G.score > D.best) D.best = G.score;
    }
    persistGame(); checkAch(); updHud(false); updGP(); save(true);
    clearTimeout(overTm);
    overTm = setTimeout(showOver, 900);
  }

  function showOver() {
    if (!G || !G.over) return;
    var html = '<h2>' + (G.mode === 'daily' ? t('dailyOver') : t('over')) + '</h2><p>' + t('noRoom') + '</p>' +
      '<div class="big">' + fmt(G.score) + '</div>' +
      (G.newBest ? '<div class="newbest">' + ico('i-star') + t('newBest') + '</div>' : '<div class="sub">' + t('bestIs', { x: fmt(S.best) }) + '</div>') +
      (G.mode === 'daily' ? '<p class="sub">' + t('todayBest') + ': ' + fmt(S.daily.best) + '</p>' : '');
    var btns = [];
    if (!G.cont) {
      html += '<p class="sub">' + t('reviveInfo') + '</p>';
      btns.push({ t: ico('i-play') + t('revive') + ' <small>' + t('reviveSub') + '</small>', cls: 'pink pulse', fn: function () { rewarded(doContinue); } });
    }
    var mode = G.mode;
    btns.push({ t: G.mode === 'daily' ? t('retry') : t('again'), cls: 'green', fn: function () { closeM(); breakpoint(function () { newGame(mode); }); } });
    btns.push({ t: t('toMenu'), cls: 'gray', fn: function () { closeM(); openMenu(); } });
    showModal({ html: html, btns: btns });
  }

  function doContinue() {
    if (!G || !G.over) return;
    var best = -1, br = 0, bc = 0, r, c, rr, cc;
    for (r = 0; r <= SZ - 3; r++) for (c = 0; c <= SZ - 3; c++) {
      var n = 0;
      for (rr = 0; rr < 3; rr++) for (cc = 0; cc < 3; cc++) if (G.board[(r + rr) * SZ + c + cc]) n++;
      if (n > best) { best = n; br = r; bc = c; }
    }
    var list = [];
    for (rr = 0; rr < 3; rr++) for (cc = 0; cc < 3; cc++) { var i = (br + rr) * SZ + bc + cc; if (G.board[i]) list.push(i); }
    clearCells(list, br + 1, bc + 1);
    var cen = boardCenter(br + 1, bc + 1);
    ring(cen.x, cen.y, '#ff6bb5', CELL * 3); shake = 10; Snd.fan();
    G.over = false; G.cont = true; G.newBest = false; G.combo = 0; G.miss = 0;
    G.pieces = newSet(G); G.setT = now(); refreshFit(G);
    closeM(); persistGame(); save(true); updHud(false); updGP();
  }

  // ---------- achievements ----------
  var ACH = [
    { id: 'line', ok: function () { return S.lines >= 1; } },
    { id: 'combo3', ok: function () { return S.maxCombo >= 3; } },
    { id: 'combo5', ok: function () { return S.maxCombo >= 5; } },
    { id: 'quad', ok: function () { return S.maxLines >= 4; } },
    { id: 's1000', ok: function () { return Math.max(S.best, G ? G.score : 0) >= 1000; } },
    { id: 's5000', ok: function () { return Math.max(S.best, G ? G.score : 0) >= 5000; } },
    { id: 'perfect', ok: function () { return S.perfect >= 1; } },
    { id: 'lines100', ok: function () { return S.lines >= 100; }, prog: function () { return [S.lines, 100]; } },
    { id: 'daily1', ok: function () { return S.daily.plays >= 1 || S.daily.streak >= 1; } },
    { id: 'streak3', ok: function () { return S.daily.streak >= 3; }, prog: function () { return [S.daily.streak, 3]; } }
  ];
  function checkAch() {
    ACH.forEach(function (a) {
      if (!S.ach[a.id] && a.ok()) {
        S.ach[a.id] = Date.now(); Snd.fan();
        banner(t('unlocked'), t('a_' + a.id));
      }
    });
  }
  function openAch() {
    var html = '<h2>' + t('ach') + '</h2><div class="stats">' +
      '<div class="stat">' + t('bestScore') + '<b>' + fmt(S.best) + '</b></div><div class="stat">' + t('maxCombo') + '<b>x' + Math.max(1, S.maxCombo) + '</b></div>' +
      '<div class="stat">' + t('games') + '<b>' + fmt(S.games) + '</b></div><div class="stat">' + t('lines') + '<b>' + fmt(S.lines) + '</b></div></div><div class="rows">';
    ACH.forEach(function (a) {
      var got = !!S.ach[a.id], pg = '';
      if (!got && a.prog) { var p = a.prog(); pg = '<div class="pg"><i style="width:' + Math.round(100 * Math.min(1, p[0] / p[1])) + '%"></i></div>'; }
      html += '<div class="row' + (got ? '' : ' lk') + '"><div class="ic"><svg><use href="#' + (got ? 'i-medal' : 'i-lock') + '"/></svg></div><div class="tx"><div class="nm">' + t('a_' + a.id) + '</div><div class="ds">' + t('d_' + a.id) + '</div>' + pg + '</div></div>';
    });
    html += '</div>';
    showModal({ x: true, html: html, onClose: function () { setTimeout(openMenu, 0); } });
  }

  // ---------- menus ----------
  function inProgress(mode) {
    var o = S.sv[mode];
    if (!o || !(o.mv > 0)) return false;
    if (mode === 'daily' && o.d !== dayKey()) return false;
    return true;
  }
  function dailyPlayedToday() { return S.daily.day === dayKey() && S.daily.plays > 0; }
  function resume(mode) {
    closeM();
    if (G && G.mode === mode && !G.over) { updGP(); return; }
    var g = restoreGame(S.sv[mode]);
    if (g) useGame(g); else newGame(mode);
  }
  function startNew(mode) { closeM(); breakpoint(function () { newGame(mode); }); }
  function openMenu() {
    if (modalCur) return;
    var btns = [], cl = inProgress('classic'), live = G && !G.over && G.moves > 0;
    if (cl) {
      btns.push({ t: ico('i-play') + t('cont'), cls: 'green', fn: function () { resume('classic'); } });
      btns.push({ t: t('newGame'), cls: 'orange', fn: function () { startNew('classic'); } });
    } else btns.push({ t: ico('i-play') + t('play'), cls: 'green', fn: function () { startNew('classic'); } });
    btns.push({ t: ico('i-cal') + t('daily') + (dailyPlayedToday() ? '' : '<span class="tag">!</span>'), cls: 'blue', fn: function () { closeM(); openDaily(); } });
    btns.push({ t: ico('i-trophy') + t('ach'), cls: 'gray', fn: function () { closeM(); openAch(); } });
    var html = '<img class="logo" alt="" src="' + logoUrl() + '"><h2>' + t('title') + '</h2><div class="sub">' + t('bestIs', { x: fmt(S.best) }) + '</div>';
    showModal({ x: !!live, html: html, btns: btns });
  }
  function openDaily() {
    var played = dailyPlayedToday(), D = S.daily, cl = inProgress('daily');
    var streak = D.last === dayKey() || D.last === dayKey() - 1 ? D.streak : 0;
    var html = '<h2>' + t('dailyTitle') + '</h2><p>' + t('dailySub') + '</p><div class="stats">' +
      '<div class="stat">' + t('todayBest') + '<b>' + (played ? fmt(D.best) : '-') + '</b></div><div class="stat">' + t('streak') + '<b>' + streak + '</b></div></div>' +
      (played ? '<p class="sub">' + t('tomorrow') + '</p>' : '');
    var btns = [];
    if (cl) btns.push({ t: ico('i-play') + t('cont'), cls: 'green', fn: function () { resume('daily'); } });
    btns.push({ t: ico('i-play') + (played || cl ? t('retry') : t('play')), cls: cl ? 'orange' : 'green', fn: function () { startNew('daily'); } });
    btns.push({ t: t('toMenu'), cls: 'gray', fn: function () { closeM(); openMenu(); } });
    showModal({ html: html, btns: btns });
  }
  var logoCache = '';
  function logoUrl() {
    if (logoCache) return logoCache;
    var c = document.createElement('canvas'); c.width = c.height = 232; var k = c.getContext('2d');
    var s = 54, o = 8;
    k.fillStyle = '#e8eefb'; rrOn(k, 0, 0, 232, 232, 40); k.fill();
    var lay = [[0, 0, 4], [0, 1, 4], [0, 2, 1], [0, 3, 1], [1, 0, 4], [1, 2, 1], [1, 3, 3], [2, 0, 5], [2, 1, 5], [2, 2, 3], [2, 3, 3], [3, 0, 5], [3, 1, 0], [3, 2, 0], [3, 3, 3]];
    lay.forEach(function (q) { blockOn(k, o + 6 + q[1] * s, o + 6 + q[0] * s, s, q[2], 1, 1); });
    logoCache = c.toDataURL('image/png');
    return logoCache;
  }

  // ---------- effects ----------
  function sparkle(x, y, col, n, power) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * TAU, v = (0.3 + Math.random() * 0.7) * power;
      particles.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * 0.25, life: 0.45 + Math.random() * 0.4, age: 0, col: col, sz: CELL * (0.07 + Math.random() * 0.08), sq: Math.random() < 0.5 });
    }
  }
  function ring(x, y, col, R) { particles.push({ ring: true, x: x, y: y, R: R, life: 0.5, age: 0, col: col }); }
  function floatText(x, y, s, col, size, life) { floats.push({ x: x, y: y, s: s, col: col || '#fff', size: size || CELL * 0.5, life: life || 1.1, age: 0 }); }

  // ---------- layout ----------
  function layout() {
    W = window.innerWidth; H = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    land = W / H > 1.15;
    var top = land ? 72 : 100, availH = H - top - 14, B;
    slots = [];
    if (!land) {
      var trayH = Math.max(96, Math.min(150, availH * 0.22)), gap = 38;
      B = Math.min(W - 16, availH - trayH - gap);
      B = Math.max(180, B);
      var totalH = B + gap + trayH, y0 = top + Math.max(0, (availH - totalH) / 2), x0 = (W - B) / 2;
      GRID = B - PADP * 2; CELL = GRID / SZ; BX = x0 + PADP; BY = y0 + PADP;
      var sw = Math.min(W - 16, Math.max(B, 300)) / 3, sx = (W - sw * 3) / 2, ty = y0 + B + gap;
      for (var i = 0; i < 3; i++) slots.push({ x: sx + i * sw, y: ty, w: sw, h: trayH });
      hintPos = { x: W / 2, y: ty - 34 };
      $('hudin').style.maxWidth = B + 'px';
      trayCell = Math.min(CELL * 0.68, sw / 5.3, trayH / 5.3);
    } else {
      var trayW = Math.max(140, Math.min(250, W * 0.2));
      B = Math.min(availH, W - trayW - 70);
      B = Math.max(180, B);
      var tot = B + 36 + trayW, x1 = (W - tot) / 2, y1 = top + (availH - B) / 2;
      GRID = B - PADP * 2; CELL = GRID / SZ; BX = x1 + PADP; BY = y1 + PADP;
      var sh = B / 3;
      for (var j = 0; j < 3; j++) slots.push({ x: x1 + B + 36, y: y1 + j * sh, w: trayW, h: sh });
      hintPos = { x: x1 + B + 36 + trayW / 2, y: y1 + 8 };
      $('hudin').style.maxWidth = tot + 'px';
      trayCell = Math.min(CELL * 0.7, trayW / 5.3, sh / 5.3);
    }
    hintEl.style.left = hintPos.x + 'px'; hintEl.style.top = hintPos.y + 'px';
  }
  function slotCenter(i) { var s = slots[i]; return { x: s.x + s.w / 2, y: s.y + s.h / 2 }; }

  // ---------- render ----------
  function rrOn(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function blockOn(c, x, y, s, ci, alpha, sc) {
    var pal = PAL[ci], gp = s * 0.055, sz = (s - gp * 2) * sc, ox = x + (s - sz) / 2, oy = y + (s - sz) / 2, rad = sz * 0.22;
    c.save(); c.globalAlpha = alpha;
    var g = c.createLinearGradient(0, oy, 0, oy + sz);
    g.addColorStop(0, pal.l); g.addColorStop(0.5, pal.b); g.addColorStop(1, pal.d);
    c.fillStyle = g; rrOn(c, ox, oy, sz, sz, rad); c.fill();
    c.fillStyle = pal.b; rrOn(c, ox + sz * 0.1, oy + sz * 0.08, sz * 0.8, sz * 0.74, rad * 0.7); c.fill();
    var g2 = c.createLinearGradient(0, oy, 0, oy + sz * 0.55);
    g2.addColorStop(0, 'rgba(255,255,255,.55)'); g2.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g2; rrOn(c, ox + sz * 0.12, oy + sz * 0.1, sz * 0.76, sz * 0.4, rad * 0.6); c.fill();
    c.restore();
  }
  function block(x, y, s, ci, alpha, sc) { blockOn(cx, x, y, s, ci, alpha == null ? 1 : alpha, sc == null ? 1 : sc); }
  function drawShape(sh, ci, centerX, centerY, s, alpha) {
    var x0 = centerX - sh.w * s / 2, y0 = centerY - sh.h * s / 2;
    for (var i = 0; i < sh.cells.length; i++) block(x0 + sh.cells[i][1] * s, y0 + sh.cells[i][0] * s, s, ci, alpha);
  }
  function easeOutBack(p) { var c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }

  function dragTarget() {
    if (!drag) return;
    var sh = SHAPES[G.pieces[drag.slot].s];
    var lift = drag.touch ? sh.h * CELL / 2 + CELL * 1.1 + 14 : 0;
    drag.tx = drag.px; drag.ty = drag.py - lift;
    drag.tc = Math.round((drag.tx - sh.w * CELL / 2 - BX) / CELL);
    drag.tr = Math.round((drag.ty - sh.h * CELL / 2 - BY) / CELL);
    drag.ok = fitsAt(G.board, sh, drag.tr, drag.tc);
  }

  function render(tm) {
    cx.clearRect(0, 0, W, H);
    if (!G) return;
    var sx = 0, sy = 0;
    if (shake > 0.3) { sx = (Math.random() - 0.5) * shake; sy = (Math.random() - 0.5) * shake; }
    cx.save(); cx.translate(sx, sy);
    var px = BX - PADP, py = BY - PADP, pw = GRID + PADP * 2;
    cx.save(); cx.shadowColor = 'rgba(60,80,170,.22)'; cx.shadowBlur = 26; cx.shadowOffsetY = 8;
    cx.fillStyle = '#fff'; rrOn(cx, px, py, pw, pw, 24); cx.fill(); cx.restore();
    cx.strokeStyle = '#d4e3ff'; cx.lineWidth = 3; rrOn(cx, px, py, pw, pw, 24); cx.stroke();
    var r, c;
    for (r = 0; r < SZ; r++) for (c = 0; c < SZ; c++) {
      cx.fillStyle = (((r >> 2) + (c >> 2)) & 1) ? '#e4ebfa' : '#eef3fd';
      rrOn(cx, BX + c * CELL + CELL * 0.055, BY + r * CELL + CELL * 0.055, CELL * 0.89, CELL * 0.89, CELL * 0.2); cx.fill();
    }
    for (var k = 0; k < NC; k++) {
      var v = G.board[k]; if (!v) continue;
      var p = (tm - pop[k]) / 0.26, sc = 1;
      if (p >= 0 && p < 1) sc = 1 + 0.2 * Math.sin(Math.PI * p) * (1 - p) * 1.6;
      block(BX + (k % SZ) * CELL, BY + Math.floor(k / SZ) * CELL, CELL, v - 1, 1, sc);
    }
    if (drag && drag.ok) {
      var sh = SHAPES[G.pieces[drag.slot].s], pc = G.pieces[drag.slot].c;
      var ln = linesWith(G.board, sh, drag.tr, drag.tc), pulse = 0.35 + 0.15 * Math.sin(tm * 9);
      cx.fillStyle = PAL[pc].b;
      cx.globalAlpha = pulse;
      ln.rows.forEach(function (rw) { for (var cc = 0; cc < SZ; cc++) { rrOn(cx, BX + cc * CELL + 1, BY + rw * CELL + 1, CELL - 2, CELL - 2, CELL * 0.22); cx.fill(); } });
      ln.cols.forEach(function (cl) { for (var rr = 0; rr < SZ; rr++) { rrOn(cx, BX + cl * CELL + 1, BY + rr * CELL + 1, CELL - 2, CELL - 2, CELL * 0.22); cx.fill(); } });
      cx.globalAlpha = 1;
      for (var i = 0; i < sh.cells.length; i++) block(BX + (drag.tc + sh.cells[i][1]) * CELL, BY + (drag.tr + sh.cells[i][0]) * CELL, CELL, pc, 0.5 + 0.1 * Math.sin(tm * 9));
    }
    for (var f = 0; f < fxCells.length; f++) {
      var fx = fxCells[f], q = (tm - fx.t0 - fx.d) / 0.42;
      var fxx = BX + fx.c * CELL, fyy = BY + fx.r * CELL;
      if (q < 0) { block(fxx, fyy, CELL, fx.col, 1, 1); continue; }
      if (q >= 1) continue;
      var scl = q < 0.25 ? 1 + 0.18 * (q / 0.25) : 1.18 * (1 - (q - 0.25) / 0.75);
      block(fxx, fyy, CELL, fx.col, 1 - q * 0.6, Math.max(0.02, scl));
      if (q < 0.5) {
        cx.fillStyle = 'rgba(255,255,255,' + (0.85 * (1 - q * 2)) + ')';
        rrOn(cx, fxx + CELL * 0.08, fyy + CELL * 0.08, CELL * 0.84, CELL * 0.84, CELL * 0.2); cx.fill();
      }
    }
    cx.restore();

    var dropIdx = drag ? drag.slot : -1;
    for (var i2 = 0; i2 < 3; i2++) {
      var pcs = G.pieces[i2], sl = slots[i2];
      cx.fillStyle = 'rgba(255,255,255,.55)'; rrOn(cx, sl.x + 4, sl.y + 4, sl.w - 8, sl.h - 8, 22); cx.fill();
      if (pcs.p || i2 === dropIdx) continue;
      var sc2 = SHAPES[pcs.s], cen = slotCenter(i2);
      var ip = (tm - G.setT - i2 * 0.09) / 0.4;
      if (ip < 0) continue;
      var sz = trayCell * (ip < 1 ? Math.max(0.01, easeOutBack(ip)) : 1), cxp = cen.x, cyp = cen.y;
      if (pcs.fly) {
        var fp = (tm - pcs.fly.t0) / 0.2;
        if (fp >= 1) pcs.fly = null;
        else { var e = easeOut(Math.max(0, fp)); cxp = pcs.fly.x + (cen.x - pcs.fly.x) * e; cyp = pcs.fly.y + (cen.y - pcs.fly.y) * e; sz = pcs.fly.s + (trayCell - pcs.fly.s) * e; }
      }
      drawShape(sc2, pcs.c, cxp, cyp, sz, pcs.fit ? 1 : 0.35);
    }
    if (drag) {
      var dp = G.pieces[drag.slot], dsh = SHAPES[dp.s];
      var s2 = trayCell + (CELL - trayCell) * Math.min(1, drag.sp);
      cx.save(); cx.translate(0, s2 * 0.22); cx.globalAlpha = 0.18; drawShapeFlat(dsh, drag.cx, drag.cy, s2); cx.restore();
      drawShape(dsh, dp.c, drag.cx, drag.cy, s2, drag.ok ? 1 : 0.88);
    }

    for (var a = 0; a < particles.length; a++) {
      var pt = particles[a], pa = pt.age / pt.life; if (pa >= 1) continue;
      if (pt.ring) {
        cx.strokeStyle = pt.col; cx.globalAlpha = (1 - pa) * 0.8; cx.lineWidth = 6 * (1 - pa) + 1;
        cx.beginPath(); cx.arc(pt.x, pt.y, pt.R * easeOut(pa), 0, TAU); cx.stroke(); cx.globalAlpha = 1;
      } else {
        cx.globalAlpha = 1 - pa; cx.fillStyle = pt.col;
        if (pt.sq) cx.fillRect(pt.x - pt.sz / 2, pt.y - pt.sz / 2, pt.sz, pt.sz); else { cx.beginPath(); cx.arc(pt.x, pt.y, pt.sz / 2, 0, TAU); cx.fill(); }
        cx.globalAlpha = 1;
      }
    }
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    for (var b = 0; b < floats.length; b++) {
      var fl = floats[b], fa = fl.age / fl.life; if (fa >= 1) continue;
      var pp = Math.min(1, fa * 5), scf = 0.6 + 0.4 * easeOutBack(pp), alp = fa > 0.7 ? 1 - (fa - 0.7) / 0.3 : 1;
      cx.save(); cx.translate(fl.x, Math.max(fl.size * 0.8, fl.y - fa * CELL * 1.1)); cx.scale(scf, scf); cx.globalAlpha = Math.max(0, alp);
      cx.font = '800 ' + Math.round(fl.size) + 'px "Trebuchet MS","Segoe UI",Arial,sans-serif';
      cx.lineJoin = 'round'; cx.lineWidth = fl.size * 0.2; cx.strokeStyle = '#fff'; cx.strokeText(fl.s, 0, 0);
      cx.fillStyle = fl.col; cx.fillText(fl.s, 0, 0); cx.restore();
    }
  }
  function drawShapeFlat(sh, centerX, centerY, s) {
    var x0 = centerX - sh.w * s / 2, y0 = centerY - sh.h * s / 2;
    cx.fillStyle = '#1a1f5a';
    for (var i = 0; i < sh.cells.length; i++) { rrOn(cx, x0 + sh.cells[i][1] * s + s * 0.06, y0 + sh.cells[i][0] * s + s * 0.06, s * 0.88, s * 0.88, s * 0.2); cx.fill(); }
  }

  // ---------- update ----------
  function update(dt) {
    var i;
    if (shake > 0) shake = Math.max(0, shake - dt * 40);
    if (drag) {
      dragTarget();
      var k = 1 - Math.exp(-dt * 26);
      drag.cx += (drag.tx - drag.cx) * k; drag.cy += (drag.ty - drag.cy) * k;
      drag.sp = Math.min(1, drag.sp + dt * 7);
    }
    var tm = now();
    for (i = fxCells.length - 1; i >= 0; i--) {
      var fx = fxCells[i];
      if (!fx.burst && tm >= fx.t0 + fx.d) {
        fx.burst = true; var c = boardCenter(fx.r, fx.c); sparkle(c.x, c.y, PAL[fx.col].b, 5, CELL * 5.5); if (Math.random() < 0.5) sparkle(c.x, c.y, '#fff', 2, CELL * 4);
      }
      if (tm - fx.t0 - fx.d > 0.45) fxCells.splice(i, 1);
    }
    for (i = particles.length - 1; i >= 0; i--) {
      var p = particles[i]; p.age += dt;
      if (p.age >= p.life) { particles.splice(i, 1); continue; }
      if (!p.ring) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += CELL * 14 * dt; }
    }
    for (i = floats.length - 1; i >= 0; i--) { floats[i].age += dt; if (floats[i].age >= floats[i].life) floats.splice(i, 1); }
    updHud(false, dt);
  }

  var hudCache = {};
  function setText(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).textContent = v; } }
  function updHud(force, dt) {
    if (!G) return;
    if (force) dispScore = G.score;
    else if (dispScore < G.score) dispScore = Math.min(G.score, dispScore + Math.max(1, (G.score - dispScore) * Math.min(1, (dt || 0.016) * 10)));
    setText('score', fmt(Math.round(dispScore)));
    setText('best', fmt(Math.max(S.best, G.score)));
    setText('tscore', t('score'));
    var co = $('combo'), on = G.combo >= 2;
    var txt = on ? t('combo', { n: G.combo }) : '';
    if (on) setText('combo', txt);
    co.classList.toggle('on', on); co.classList.toggle('fade', on && G.miss >= 2);
    var dd = $('dailydot'); dd.classList.toggle('on', !dailyPlayedToday());
  }
  function showHint() {
    if (S.tut || !G || G.moves > 0 || modalCur) { hintEl.classList.remove('on'); return; }
    hintEl.textContent = t('hint'); hintEl.classList.add('on');
  }
  function applyLang() {
    document.documentElement.lang = L; document.title = t('title');
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
  function slotAt(x, y) {
    for (var i = 0; i < 3; i++) {
      var s = slots[i]; if (x >= s.x - 6 && x <= s.x + s.w + 6 && y >= s.y - 10 && y <= s.y + s.h + 10) return i;
    }
    return -1;
  }
  function bindInput() {
    cv.addEventListener('pointerdown', function (e) {
      Snd.unlock(); if (modalCur || adActive || !started || !G || G.over || drag) return;
      var i = slotAt(e.clientX, e.clientY); if (i < 0) return;
      var p = G.pieces[i]; if (p.p) return;
      var c = slotCenter(i);
      drag = { slot: i, px: e.clientX, py: e.clientY, cx: c.x, cy: c.y, tx: c.x, ty: c.y, sp: 0, touch: e.pointerType !== 'mouse', id: e.pointerId, tr: 0, tc: 0, ok: false };
      dragTarget();
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      Snd.pick(); hintEl.classList.remove('on');
    });
    cv.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag.px = e.clientX; drag.py = e.clientY;
    });
    function up(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null;
      if (e.type === 'pointerup') { d.px = e.clientX; d.py = e.clientY; drag = d; dragTarget(); drag = null; }
      var p = G && G.pieces[d.slot];
      if (!p || p.p || G.over) return;
      if (e.type === 'pointerup' && d.ok) { doPlace(d.slot, d.tr, d.tc); return; }
      if (e.type === 'pointerup') Snd.deny();
      var s = trayCell + (CELL - trayCell) * Math.min(1, d.sp);
      p.fly = { x: d.cx, y: d.cy, s: s, t0: now() };
    }
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);

    $('bsnd').addEventListener('click', function () {
      Snd.unlock(); Snd.muted = !Snd.muted; S.muted = Snd.muted; Snd.apply(); setSndIcon(); Snd.click(); save(false);
    });
    $('bmenu').addEventListener('click', function () { Snd.unlock(); Snd.click(); if (modalCur) return; openMenu(); });
    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', function () { setTimeout(layout, 200); });
    window.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    ['gesturestart', 'gesturechange'].forEach(function (g) { document.addEventListener(g, function (e) { e.preventDefault(); }); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        hiddenAt = Date.now(); paused = true; drag = null; persistGame(); save(true);
        if (Snd.ctx && Snd.ctx.state === 'running') Snd.ctx.suspend();
        updGP();
      } else {
        if (!adActive) paused = false;
        lastFrame = now();
        if (Snd.ctx && !adActive) Snd.ctx.resume();
        hiddenAt = 0; updGP();
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
    layout(); bindInput(); applyLang();
    Snd.muted = !!S.muted; setSndIcon();
    var g = null;
    if (inProgress('classic')) g = restoreGame(S.sv.classic);
    if (g) useGame(g); else { G = makeGame('classic'); resetPop(); }
    started = true; lastFrame = now();
    updHud(true);
    requestAnimationFrame(frame);
    openMenu();
    setTimeout(function () {
      Platform.ready();
      updGP();
    }, 120);
    Platform.onPause(function () { paused = true; Snd.adMute = true; Snd.apply(); });
    Platform.onResume(function () { if (!adActive) { paused = false; Snd.adMute = false; Snd.apply(); lastFrame = now(); } });
    if (DBG) window.__dbg = {
      S: S, get paused() { return paused; }, get adOn() { return adActive; }, get G() { return G; }, get drag() { return drag; }, get fx() { return fxCells.length; }, doPlace: doPlace, newGame: newGame, openMenu: openMenu, openDaily: openDaily, openAch: openAch, closeM: closeM,
      slotCenter: slotCenter, boardCenter: boardCenter, layout: layout, gameOver: gameOver, canAd: canInterstitial, breakpoint: breakpoint,
      setLastAd: function (v) { lastAdAt = v; }, save: save, SHAPES: SHAPES, showOver: showOver,
      info: function () { return { BX: BX, BY: BY, CELL: CELL, GRID: GRID, slots: slots, trayCell: trayCell, land: land, W: W, H: H }; },
      setBoard: function (rows) {
        for (var r = 0; r < SZ; r++) for (var c = 0; c < SZ; c++) G.board[r * SZ + c] = rows[r][c] === '#' ? ((r + c) % PAL.length) + 1 : 0;
        refreshFit(G);
      },
      setPieces: function (list) {
        G.pieces = list.map(function (s) { return { s: s, c: s % PAL.length, p: false }; }); G.setT = now() - 5; refreshFit(G);
      },
      shapeIndex: function (pat) { for (var i = 0; i < SH_DEF.length; i++) if (SH_DEF[i][1] === pat) return i; return -1; }
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
