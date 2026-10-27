(function () {
  'use strict';

  var PARAMS = new URLSearchParams(location.search);
  var DBG = PARAMS.has('debug');
  var E = window.ECO, Art = window.Art;
  var SAVE_KEY = 'swt_save_v1', AD_GAP = 90000, LW = 400, LH = 340;
  var DMULT = [1, 1.5, 2, 3, 4, 6, 10];
  var BOOST_ADD = 240, BOOST_CAP = 1200, CASH_CD = 90;

  var TXT = {
    ru: {
      names: ['Тележка с шаурмой', 'Киоск', 'Фудтрак', 'Уличное кафе', 'Лавка на ночном рынке', 'Ресторан', 'Фудкорт', 'Штаб сети'],
      sign: 'ШАУРМА', tStands: 'Точки', tUps: 'Улучшения', tFr: 'Сеть', buy: 'Купить:', max: 'Макс',
      boost: 'x2 доход', boostSub: 'за видео', boostLeft: 'осталось {t}', cash: '+{x}', cashSub: 'деньги за видео', cashWait: 'ещё {t}',
      hire: 'Нанять', hireN: 'Нанять +{n}', open: 'Открыть', cooks: 'Поваров: {n}', ms: 'x2 дохода при {n}', msMax: 'все бонусы получены',
      teaser: 'Нанимай поваров на прошлой точке', lvl: 'Ур. {n}', max: 'Макс',
      up_a: 'Свежие специи', up_b: 'Секретный соус', upd_a: 'x2 доход: {s}', upd_b: 'x3 доход: {s}', need: 'Нужно поваров: {n}',
      g_1: 'Неоновая вывеска', g_2: 'Приложение доставки', g_3: 'Вирусное видео', g_4: 'Звёздный повар', g_5: 'Мировой бренд', upd_g: 'x{m} ко всему доходу',
      tapName: 'Острый нож', tapDesc: 'Один тап: +{v}', offName: 'Ночная смена', offDesc: '{p}% дохода офлайн, до {h} ч',
      hint0: 'Тапай по шаурме, чтобы готовить!', hint1: 'Наймите первого повара!', hint2: 'Открывай новые точки и покупай улучшения',
      fire: 'ОГОНЬ! x3', crit: 'x5!', milestone: 'Бонус! {s}: доход x2', noUps: 'Улучшений пока нет. Развивай точки!',
      newStand: 'Новая точка!', newStandSub: 'Открыта: {s}. Доход растёт!', great: 'Отлично!',
      frTitle: 'Франшиза', frDesc: 'Открой сеть заново: точки, улучшения и деньги сбросятся, но ты получишь звёзды франшизы. Каждая звезда навсегда даёт +10% к доходу.',
      frStars: 'Звёзд: {n}', frNow: 'Бонус сейчас: x{m}', frGain: 'Получишь +{n} звёзд, бонус станет x{m}', frNeed: 'Заработай {x} за забег, чтобы открыть франшизу', frProg: 'За этот забег: {a} из {b}',
      frBtn: 'Открыть франшизу +{n}', frAsk: 'Открыть франшизу?', frAskSub: 'Звёзды сохранятся. Деньги, точки и улучшения сбросятся.', frDone: 'Франшиза открыта!', frDoneSub: 'Теперь доход x{m}. Начинай заново, ты будешь расти быстрее.', go: 'Поехали!', cancel: 'Отмена',
      welcome: 'С возвращением!', away: 'Вас не было {t}. Точки заработали:', collect: 'Забрать', collect2: 'Ещё столько же',
      daily: 'Ежедневный бонус', dailySub: 'Заходи каждый день: награда растёт!', day: 'День {n}', claim: 'Забрать', claim2: 'Забрать x2', claimed: 'Уже получено. Приходи завтра!', day7: '+10 мин x2 дохода',
      adSoon: 'Короткая рекламная пауза…', noReward: 'Награда не получена', adFail: 'Реклама сейчас недоступна',
      boostOn: 'x2 доход включён!', gotCash: 'Деньги получены!', h: 'ч', m: 'мин', s: 'с', ok: 'Хорошо', sound: 'Звук', perSec: '/с',
      suf: ['', ' тыс', ' млн', ' млрд', ' трлн', ' квдрлн', ' квнтлн', ' секстлн', ' септлн', ' октлн', ' нонлн', ' децлн']
    },
    en: {
      names: ['Shawarma Cart', 'Kebab Kiosk', 'Food Truck', 'Street Cafe', 'Night Market Stall', 'Restaurant', 'Food Hall', 'Franchise HQ'],
      sign: 'SHAWARMA', tStands: 'Stands', tUps: 'Upgrades', tFr: 'Franchise', buy: 'Buy:', max: 'Max',
      boost: 'x2 income', boostSub: 'watch video', boostLeft: '{t} left', cash: '+{x}', cashSub: 'cash for a video', cashWait: '{t} left',
      hire: 'Hire', hireN: 'Hire +{n}', open: 'Open', cooks: 'Cooks: {n}', ms: 'x2 income at {n}', msMax: 'all bonuses unlocked',
      teaser: 'Hire cooks at the previous stand', lvl: 'Lv {n}', max: 'MAX',
      up_a: 'Fresh spices', up_b: 'Secret sauce', upd_a: 'x2 income: {s}', upd_b: 'x3 income: {s}', need: 'Needs {n} cooks',
      g_1: 'Neon sign', g_2: 'Delivery app', g_3: 'Viral video', g_4: 'Celebrity chef', g_5: 'Global brand', upd_g: 'x{m} all income',
      tapName: 'Sharp knife', tapDesc: 'One tap: +{v}', offName: 'Night shift', offDesc: '{p}% income offline, up to {h} h',
      hint0: 'Tap the shawarma to cook!', hint1: 'Hire your first cook!', hint2: 'Open new stands and buy upgrades',
      fire: 'FIRE! x3', crit: 'x5!', milestone: 'Bonus! {s}: income x2', noUps: 'No upgrades yet. Grow your stands!',
      newStand: 'New stand!', newStandSub: 'Opened: {s}. Income is growing!', great: 'Great!',
      frTitle: 'Franchise', frDesc: 'Restart your empire: stands, upgrades and cash reset, but you earn Franchise Stars. Every star gives +10% income forever.',
      frStars: 'Stars: {n}', frNow: 'Current bonus: x{m}', frGain: 'You get +{n} stars, bonus becomes x{m}', frNeed: 'Earn {x} in one run to open a franchise', frProg: 'This run: {a} of {b}',
      frBtn: 'Open franchise +{n}', frAsk: 'Open a franchise?', frAskSub: 'Stars are kept. Cash, stands and upgrades reset.', frDone: 'Franchise opened!', frDoneSub: 'Income is now x{m}. Start over and grow faster.', go: "Let's go!", cancel: 'Cancel',
      welcome: 'Welcome back!', away: 'You were away for {t}. Your stands earned:', collect: 'Collect', collect2: 'Get the same again',
      daily: 'Daily bonus', dailySub: 'Come back every day: rewards grow!', day: 'Day {n}', claim: 'Claim', claim2: 'Claim x2', claimed: 'Already claimed. See you tomorrow!', day7: '+10 min x2 income',
      adSoon: 'Short ad break…', noReward: 'Reward not granted', adFail: 'Ads are unavailable right now',
      boostOn: 'x2 income is on!', gotCash: 'Cash received!', h: 'h', m: 'min', s: 's', ok: 'OK', sound: 'Sound', perSec: '/s',
      suf: ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']
    },
    tr: {
      names: ['Döner Arabası', 'Büfe', 'Yemek Kamyonu', 'Sokak Kafesi', 'Gece Pazarı Tezgâhı', 'Restoran', 'Yemek Sarayı', 'Franchise Merkezi'],
      sign: 'DÖNER', tStands: 'Dükkânlar', tUps: 'Geliştirme', tFr: 'Franchise', buy: 'Al:', max: 'Maks',
      boost: '2x gelir', boostSub: 'video izle', boostLeft: '{t} kaldı', cash: '+{x}', cashSub: 'video ile para', cashWait: '{t} kaldı',
      hire: 'İşe al', hireN: 'İşe al +{n}', open: 'Aç', cooks: 'Aşçı: {n}', ms: '{n} aşçıda 2x gelir', msMax: 'tüm bonuslar açıldı',
      teaser: 'Önceki dükkânda aşçı işe al', lvl: 'Sv. {n}', max: 'MAKS',
      up_a: 'Taze baharat', up_b: 'Gizli sos', upd_a: '2x gelir: {s}', upd_b: '3x gelir: {s}', need: '{n} aşçı gerekli',
      g_1: 'Neon tabela', g_2: 'Paket servis uygulaması', g_3: 'Viral video', g_4: 'Ünlü şef', g_5: 'Dünya markası', upd_g: 'Tüm gelire {m}x',
      tapName: 'Keskin bıçak', tapDesc: 'Tek dokunuş: +{v}', offName: 'Gece vardiyası', offDesc: 'Çevrimdışı gelirin %{p}\'i, {h} saate kadar',
      hint0: 'Pişirmek için dönere dokun!', hint1: 'İlk aşçını işe al!', hint2: 'Yeni dükkânlar aç, geliştirmeler al',
      fire: 'ATEŞ! 3x', crit: '5x!', milestone: 'Bonus! {s}: gelir 2x', noUps: 'Henüz geliştirme yok. Dükkânlarını büyüt!',
      newStand: 'Yeni dükkân!', newStandSub: 'Açıldı: {s}. Gelir artıyor!', great: 'Harika!',
      frTitle: 'Franchise', frDesc: 'İmparatorluğunu yeniden kur: dükkânlar, geliştirmeler ve para sıfırlanır, ama Franchise Yıldızı kazanırsın. Her yıldız kalıcı olarak %10 gelir verir.',
      frStars: 'Yıldız: {n}', frNow: 'Mevcut bonus: {m}x', frGain: '+{n} yıldız alırsın, bonus {m}x olur', frNeed: 'Franchise açmak için tek turda {x} kazan', frProg: 'Bu tur: {a} / {b}',
      frBtn: 'Franchise aç +{n}', frAsk: 'Franchise açılsın mı?', frAskSub: 'Yıldızlar kalır. Para, dükkânlar ve geliştirmeler sıfırlanır.', frDone: 'Franchise açıldı!', frDoneSub: 'Gelir artık {m}x. Baştan başla, daha hızlı büyürsün.', go: 'Hadi!', cancel: 'Vazgeç',
      welcome: 'Tekrar hoş geldin!', away: '{t} yoktun. Dükkânların kazandığı:', collect: 'Topla', collect2: 'Bir o kadar daha',
      daily: 'Günlük bonus', dailySub: 'Her gün gel: ödül büyüyor!', day: '{n}. gün', claim: 'Al', claim2: '2x al', claimed: 'Zaten alındı. Yarın görüşürüz!', day7: '+10 dk 2x gelir',
      adSoon: 'Kısa reklam arası…', noReward: 'Ödül verilmedi', adFail: 'Reklamlar şu an kullanılamıyor',
      boostOn: '2x gelir açık!', gotCash: 'Para alındı!', h: 'sa', m: 'dk', s: 'sn', ok: 'Tamam', sound: 'Ses', perSec: '/sn',
      suf: ['', ' bin', ' Mn', ' Mr', ' Tr', ' Kt', ' Kn', ' Sks', ' Spt', ' Okt', ' Nn', ' Dsl']
    }
  };
  var L = 'en';
  function t(k, v) {
    var s = TXT[L][k]; if (s == null) s = TXT.en[k]; if (s == null) s = k;
    if (v) for (var a in v) s = s.replace('{' + a + '}', v[a]);
    return s;
  }
  function langFrom(code) {
    code = String(code || 'en').toLowerCase().slice(0, 2);
    if (code === 'tr') return 'tr';
    return ['ru', 'be', 'kk', 'uk', 'uz'].indexOf(code) >= 0 ? 'ru' : 'en';
  }
  function dec(s) { return L !== 'en' ? s.replace('.', ',') : s; }
  function fmt(n) {
    if (!isFinite(n)) return '∞';
    if (n < 0) n = 0;
    if (n < 10) return dec(String(+n.toFixed(n < 1 ? 2 : 1)));
    if (n < 10000) return String(Math.floor(n));
    var i = 0; while (n >= 1000 && i < 11) { n /= 1000; i++; }
    if (n >= 1000) return dec(n.toExponential(1).replace('e+', 'e'));
    return dec(String(+n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2))) + TXT[L].suf[i];
  }
  function fmtMul(m) { return dec(String(+m.toFixed(1))); }
  function fmtDur(sec) {
    sec = Math.round(sec);
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    if (h > 0) return h + ' ' + t('h') + ' ' + m + ' ' + t('m');
    if (m > 0) return m + ' ' + t('m');
    return sec + ' ' + t('s');
  }
  function fmtClock(sec) { sec = Math.ceil(sec); return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2); }

  var $ = function (id) { return document.getElementById(id); };
  var cv = $('c'), cx = cv.getContext('2d');
  var hudEl = $('hud'), panelEl = $('panel'), floatEl = $('floaters'), listEl = $('list'), hintEl = $('hint'), toastEl = $('toast'), bannerEl = $('banner');
  var modalEl = $('modal'), cardEl = $('card'), adovEl = $('adov');

  // ---------- state ----------
  var S, W = 0, H = 0, dpr = 1, sc = 1, ox = 0, oy = 0;
  var paused = false, adActive = false, started = false, hiddenAt = 0, lastFrame = 0;
  var lastAdAt = Date.now(), lastSaveAt = 0, lastCloudAt = 0, dirty = false, gpOn = false;
  var heat = 0, fire = 0, cashCd = 0, tabCur = 'stands', qty = 1;
  var floats = [], parts = [], coinFly = [], custs = [], flash = 0, shake = 0;
  var tapAnim = 0, spitRot = 0, spitSpd = 1.2, acc = [], popT = [], pulse = [], appear = [], custT = 0, custAcc = 0;
  var els = {}, hudT = 0, sessionTaps = 0;

  function defaults() {
    var d = E.fresh(0);
    d.v = 1; d.savedAt = Date.now(); d.tc = 0; d.pc = 0; d.seen = []; d.daily = { lastDay: -999, streak: 0 }; d.muted = false; d.cashAt = 0;
    return d;
  }
  function sane(d) {
    if (!d || typeof d !== 'object' || d.v !== 1 || !isFinite(d.cash) || !Array.isArray(d.n)) return null;
    var b = defaults();
    for (var k in b) if (d[k] == null) d[k] = b[k];
    d.cash = Math.max(0, d.cash); d.run = Math.max(0, +d.run || 0); d.life = Math.max(0, +d.life || 0); d.stars = Math.max(0, d.stars | 0);
    for (var i = 0; i < E.N; i++) d.n[i] = Math.max(0, Math.min(99999, d.n[i] | 0));
    d.tap = Math.max(0, Math.min(E.TAP_MAX, d.tap | 0)); d.off = Math.max(0, Math.min(E.OFF_MAX, d.off | 0));
    d.boost = Math.max(0, Math.min(BOOST_CAP, +d.boost || 0));
    var up = {}; for (var id in d.up) if (E.UPMAP[id] && d.up[id]) up[id] = true; d.up = up;
    return d;
  }
  function saveLocal() { try { S.savedAt = Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
  function save(force) {
    saveLocal(); dirty = false;
    var now = Date.now();
    if (Platform.hasCloud() && (force || now - lastCloudAt > 15000)) {
      lastCloudAt = now;
      try { var p = Platform.saveData({ save: S }); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    }
  }
  function readLocal() { try { var s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }

  function boostMult() { return S.boost > 0 ? 2 : 1; }
  function cps() { return E.baseCps(S) * boostMult(); }
  function addCash(v) { S.cash += v; S.run += v; S.life += v; dirty = true; }
  function tapVal(mult) { return E.tapValue(S, mult) * boostMult(); }
  function cashAdAmount() { return Math.max(cps() * 900, E.tapValue(S) * 60, 25); }

  // ---------- sound ----------
  var Snd = {
    ctx: null, master: null, muted: false, adMute: false, noise: null,
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
    hiss: function (d, vol, f) {
      if (!this.ctx || this.muted || this.adMute) return;
      var c = this.ctx;
      if (!this.noise) { var b = c.createBuffer(1, c.sampleRate, c.sampleRate), a = b.getChannelData(0); for (var i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; this.noise = b; }
      var s = c.createBufferSource(); s.buffer = this.noise; s.loop = true;
      var fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = f || 3000; fl.Q.value = 0.8;
      var g = c.createGain(), t0 = c.currentTime; g.gain.setValueAtTime(vol || 0.1, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      s.connect(fl); fl.connect(g); g.connect(this.master); s.start(t0); s.stop(t0 + d + 0.02);
    },
    tap: function (k) { this.tone(420 + (k % 5) * 60, 0.09, 'triangle', 0.22, 1.6); this.hiss(0.12, 0.08, 4000); },
    crit: function () { [660, 880, 1320].forEach(function (f, i) { Snd.tone(f, 0.18, 'triangle', 0.22, 1, i * 0.05); }); },
    coin: function () { this.tone(1500, 0.06, 'square', 0.035, 1.3); },
    deny: function () { this.tone(170, 0.18, 'square', 0.12, 0.7); },
    click: function () { this.tone(700, 0.05, 'sine', 0.15, 1.2); },
    buy: function () { this.tone(520, 0.1, 'triangle', 0.25); this.tone(780, 0.16, 'triangle', 0.25, 1, 0.08); },
    fire: function () { this.hiss(0.7, 0.18, 1400); this.tone(200, 0.5, 'sawtooth', 0.12, 3); },
    ms: function () { [523, 659, 784].forEach(function (f, i) { Snd.tone(f, 0.22, 'triangle', 0.22, 1, i * 0.08); }); },
    fan: function () { [523, 659, 784, 1046].forEach(function (f, i) { Snd.tone(f, 0.3, 'triangle', 0.25, 1, i * 0.1); }); },
    big: function () { [392, 523, 659, 784, 1046, 1318].forEach(function (f, i) { Snd.tone(f, 0.4, 'triangle', 0.26, 1, i * 0.09); }); }
  };

  // ---------- SDK ----------
  function updGP() {
    var want = started && !document.hidden && !adActive && !modalCur;
    if (want === gpOn) return;
    gpOn = want;
    try { if (want) Platform.gameplayStart(); else Platform.gameplayStop(); } catch (e) {}
  }
  function adStart() {
    if (adActive) return; adActive = true; paused = true;
    Snd.adMute = true; Snd.apply(); updGP();
  }
  function adEnd() {
    if (!adActive) return; adActive = false; paused = false; lastAdAt = Date.now(); lastFrame = performance.now() / 1000;
    Snd.adMute = false; Snd.apply(); updGP(); adovEl.classList.add('hidden');
  }
  function canInterstitial() { return Platform.hasAds() && !adActive && !modalCur && Date.now() - lastAdAt >= AD_GAP; }
  function breakpoint() {
    if (!canInterstitial()) return;
    adovEl.classList.remove('hidden'); $('adtxt').textContent = t('adSoon');
    setTimeout(function () {
      if (!Platform.hasAds() || adActive || modalCur) { adovEl.classList.add('hidden'); return; }
      try {
        Platform.showInterstitial({
          onOpen: function () { adStart(); },
          onClose: function () { adEnd(); },
          onError: function () { adovEl.classList.add('hidden'); lastAdAt = Date.now(); adEnd(); }
        });
      } catch (e) { adovEl.classList.add('hidden'); lastAdAt = Date.now(); }
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
    clearTimeout(toastTm); toastTm = setTimeout(function () { toastEl.classList.remove('on'); }, 1800);
  }
  var bannerTm = 0;
  function banner(img, line1, line2) {
    bannerEl.innerHTML = (img.charAt(0) === '#' ? '<svg><use href="' + img + '"/></svg>' : '<img alt="" width="44" height="44" src="' + img + '">') + '<div><b>' + line1 + '</b>' + line2 + '</div>';
    bannerEl.classList.add('on');
    clearTimeout(bannerTm); bannerTm = setTimeout(function () { bannerEl.classList.remove('on'); }, 2800);
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
    modalEl.classList.remove('hidden'); updGP();
    if (o.onOpen) o.onOpen();
  }
  function closeM() {
    var o = modalCur; if (!o) return;
    modalCur = null; modalEl.classList.add('hidden'); cardEl.innerHTML = '';
    if (o.onClose) o.onClose();
    if (modalQ.length && !modalCur) openM(modalQ.shift()); else updGP();
  }
  var coinSvg = '<svg class="ico"><use href="#i-coin"/></svg>';
  function icoUrl(i, locked) {
    var k = i + (locked ? 'L' : '');
    if (!icoUrl.c) icoUrl.c = {};
    return icoUrl.c[k] || (icoUrl.c[k] = Art.icon(i, 48, locked));
  }

  // ---------- panel ----------
  var rowRefs = [], panelKey = '';
  function visibleStands() {
    var hi = -1; for (var i = 0; i < E.N; i++) if (S.n[i] > 0) hi = i;
    return Math.min(E.N, hi + 3);
  }
  function stBuyInfo(i) {
    var n = S.n[i], k = n === 0 ? 1 : (qty === 0 ? Math.max(1, E.maxBuy(i, n, S.cash)) : qty);
    return { k: k, cost: E.bulkCost(i, n, k) };
  }
  function mkRow(cls, icHtml, nm, ds, btnCls) {
    var r = document.createElement('div'); r.className = 'row ' + (cls || '');
    r.innerHTML = '<div class="ic">' + icHtml + '</div><div class="tx"><div class="nm"><span class="n"></span><span class="lv"></span></div><div class="ds"></div><div class="pg"><i></i></div></div>' +
      '<button class="btn buy ' + (btnCls || 'green') + '"><b>' + coinSvg + '<span class="c"></span></b><small class="s"></small></button>';
    return r;
  }
  function refs(r) {
    return { r: r, n: r.querySelector('.n'), lv: r.querySelector('.lv'), ds: r.querySelector('.ds'), pg: r.querySelector('.pg'), pgi: r.querySelector('.pg i'), btn: r.querySelector('.buy'), c: r.querySelector('.c'), s: r.querySelector('.s'), cb: r.querySelector('.buy b') };
  }
  function setTx(el, key, v) { if (el._v !== v) { el._v = v; el.textContent = v; } }
  function buildStands() {
    listEl.innerHTML = ''; rowRefs = [];
    var vis = visibleStands();
    for (var i = 0; i < vis; i++) {
      var locked = i > 0 && S.n[i - 1] === 0;
      var r = mkRow(locked ? 'lockd' : '', '<img alt="" src="' + icoUrl(i, locked) + '">', '', '', 'green');
      var f = refs(r); f.i = i; f.locked = locked;
      if (locked) { f.btn.style.display = 'none'; f.pg.style.display = 'none'; setTx(f.n, 0, '???'); setTx(f.ds, 0, t('teaser')); }
      else { setTx(f.n, 0, t('names')[i]); (function (ii) { f.btn.onclick = function () { buyStand(ii); }; })(i); }
      listEl.appendChild(r); rowRefs.push(f);
    }
    panelKey = standsKey();
  }
  function standsKey() { return 'st|' + visibleStands() + '|' + (S.n[0] > 0 ? 1 : 0) + '|' + L; }
  function updateStands() {
    for (var q = 0; q < rowRefs.length; q++) {
      var f = rowRefs[q]; if (f.locked) continue;
      var i = f.i, n = S.n[i], bi = stBuyInfo(i), ok = S.cash >= bi.cost;
      var own = n > 0;
      setTx(f.lv, 0, own ? t('lvl', { n: n }) : ''); f.lv.style.display = own ? '' : 'none';
      var nm = E.nextMs(n);
      var inc = E.standIncome(S, i) * E.globalMult(S);
      setTx(f.ds, 0, own ? '+' + fmt(inc) + t('perSec') + ' · ' + (nm ? t('ms', { n: nm }) : t('msMax')) : '+' + fmt(E.INC[i] * E.globalMult(S)) + t('perSec'));
      if (own && nm) { var prev = 0; for (var j = 0; j < E.MS.length; j++) if (E.MS[j] === nm) prev = j ? E.MS[j - 1] : 0; f.pgi.style.width = Math.min(100, (n - prev) / (nm - prev) * 100) + '%'; f.pg.style.display = ''; } else if (own) { f.pgi.style.width = '100%'; f.pg.style.display = ''; } else f.pg.style.display = 'none';
      setTx(f.c, 0, fmt(bi.cost));
      setTx(f.s, 0, own ? (bi.k > 1 ? t('hireN', { n: bi.k }) : t('hire')) : t('open'));
      f.btn.classList.toggle('off', !ok); f.btn.classList.toggle('green', ok); f.btn.classList.toggle('gray', !ok);
      f.r.classList.toggle('glow', ok && (!own || i === 0 && S.tc >= 8 && n < 2));
    }
  }
  function upsList() {
    var a = [];
    E.UPS.forEach(function (u) { if (E.upAvailable(S, u)) a.push(u); });
    a.sort(function (x, y) { return x.cost - y.cost; });
    return a;
  }
  function upsKey() {
    return 'up|' + S.tap + '|' + S.off + '|' + upsList().map(function (u) { return u.id + (E.upCanBuy(S, u) ? '!' : '?'); }).join(',') + '|' + L;
  }
  var upRefs = [];
  function buildUps() {
    listEl.innerHTML = ''; upRefs = [];
    var tp = mkRow('', '<svg><use href="#i-tap"/></svg>', '', '', 'orange'), tf = refs(tp);
    tf.kind = 'tap'; tf.btn.onclick = function () { buyTap(); }; listEl.appendChild(tp); upRefs.push(tf);
    var op = mkRow('', '<svg><use href="#i-moon"/></svg>', '', '', 'orange'), of = refs(op);
    of.kind = 'off'; of.btn.onclick = function () { buyOff(); }; listEl.appendChild(op); upRefs.push(of);
    upsList().forEach(function (u) {
      var ic = u.kind === 'stand' ? '<img alt="" src="' + icoUrl(u.i, false) + '">' : '<svg><use href="#i-mult"/></svg>';
      var r = mkRow(u.kind === 'stand' ? '' : '', ic, '', '', 'green'), f = refs(r);
      f.u = u; f.kind = 'up'; f.pg.style.display = 'none'; f.lv.style.display = 'none';
      setTx(f.n, 0, u.kind === 'stand' ? t(u.n) : t(u.n));
      setTx(f.ds, 0, u.kind === 'stand' ? t('upd_' + (u.n === 'up_a' ? 'a' : 'b'), { s: t('names')[u.i] }) : t('upd_g', { m: u.mult }));
      f.btn.onclick = function () { buyUp(u.id); };
      listEl.appendChild(r); upRefs.push(f);
    });
    panelKey = upsKey();
  }
  function updateUps() {
    upRefs.forEach(function (f) {
      var ok, cost;
      if (f.kind === 'tap') {
        var mx = S.tap >= E.TAP_MAX; cost = E.tapCost(S.tap); ok = !mx && S.cash >= cost;
        setTx(f.n, 0, t('tapName')); setTx(f.lv, 0, mx ? t('max') : t('lvl', { n: S.tap + 1 }));
        var v0 = E.tapValue(S), s2 = JSON.parse(JSON.stringify(S)); s2.tap = Math.min(E.TAP_MAX, S.tap + 1);
        setTx(f.ds, 0, mx ? t('tapDesc', { v: fmt(v0) }) : t('tapDesc', { v: fmt(v0) }) + ' → ' + fmt(E.tapValue(s2)));
        f.pg.style.display = 'none';
        f.cb.style.display = mx ? 'none' : ''; setTx(f.c, 0, fmt(cost)); setTx(f.s, 0, mx ? t('max') : '');
        f.s.style.display = mx ? '' : 'none';
      } else if (f.kind === 'off') {
        var mo = S.off >= E.OFF_MAX; cost = E.offCost(S.off); ok = !mo && S.cash >= cost;
        setTx(f.n, 0, t('offName')); setTx(f.lv, 0, mo ? t('max') : t('lvl', { n: S.off + 1 }));
        setTx(f.ds, 0, t('offDesc', { p: Math.round(E.offEff(S.off) * 100), h: E.offCap(S.off) }));
        f.pg.style.display = 'none'; f.cb.style.display = mo ? 'none' : ''; setTx(f.c, 0, fmt(cost)); f.s.style.display = mo ? '' : 'none'; setTx(f.s, 0, t('max'));
      } else {
        var u = f.u, can = E.upCanBuy(S, u); cost = u.cost; ok = can && S.cash >= cost;
        setTx(f.c, 0, fmt(cost)); f.s.style.display = can ? 'none' : ''; setTx(f.s, 0, t('need', { n: u.need }));
        f.r.classList.toggle('lockd', !can);
      }
      f.btn.classList.toggle('off', !ok); f.btn.classList.toggle('gray', !ok); f.btn.classList.toggle('green', ok && f.kind === 'up'); f.btn.classList.toggle('orange', ok && f.kind !== 'up');
    });
  }
  var frRefs = null;
  function buildFr() {
    listEl.innerHTML = '';
    var box = document.createElement('div'); box.className = 'frbox';
    box.innerHTML = '<h3>' + t('frTitle') + '</h3><div class="st"><svg class="ico"><use href="#i-star"/></svg><span class="a"></span></div><p class="b"></p><p>' + t('frDesc') + '</p><div class="pgb"><i></i></div><p class="c"></p><button class="btn green"><span class="d"></span></button>';
    listEl.appendChild(box);
    frRefs = { a: box.querySelector('.a'), b: box.querySelector('.b'), c: box.querySelector('.c'), d: box.querySelector('.d'), pg: box.querySelector('.pgb i'), btn: box.querySelector('.btn') };
    frRefs.btn.onclick = function () { openPrestige(); };
    panelKey = 'fr|' + L;
  }
  function frNeedRun() { return E.STAR_DIV * E.STAR_MIN * E.STAR_MIN; }
  function updateFr() {
    var g = E.prestigeGain(S.run), ok = g >= E.STAR_MIN, f = frRefs;
    setTx(f.a, 0, String(S.stars)); setTx(f.b, 0, t('frNow', { m: fmtMul(E.starMult(S.stars)) }));
    var need = frNeedRun();
    f.pg.style.width = Math.min(100, S.run / need * 100) + '%';
    setTx(f.c, 0, ok ? t('frGain', { n: g, m: fmtMul(E.starMult(S.stars + g)) }) : t('frProg', { a: fmt(S.run), b: fmt(need) }));
    setTx(f.d, 0, ok ? t('frBtn', { n: g }) : t('frNeed', { x: fmt(need) }));
    f.btn.classList.toggle('off', !ok); f.btn.classList.toggle('gray', !ok); f.btn.classList.toggle('green', ok);
  }
  function setTab(name) {
    tabCur = name; panelKey = '';
    document.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-t') === name); });
    $('qty').classList.toggle('off', name !== 'stands');
    listEl.scrollTop = 0;
    updatePanel(true);
  }
  function updatePanel(force) {
    var key, top = listEl.scrollTop;
    if (tabCur === 'stands') { key = standsKey(); if (force || key !== panelKey) { buildStands(); listEl.scrollTop = top; } updateStands(); }
    else if (tabCur === 'ups') { key = upsKey(); if (force || key !== panelKey) { buildUps(); listEl.scrollTop = top; } updateUps(); }
    else { key = 'fr|' + L; if (force || key !== panelKey) buildFr(); updateFr(); }
  }
  function updateDots() {
    var tabs = document.querySelectorAll('.tab .dot');
    var next = -1; for (var i = 0; i < E.N; i++) if (S.n[i] === 0 && (i === 0 || S.n[i - 1] > 0)) { next = i; break; }
    var d0 = next >= 0 && S.cash >= E.unitCost(next, 0);
    var d1 = false; E.UPS.forEach(function (u) { if (E.upAvailable(S, u) && E.upCanBuy(S, u) && S.cash >= u.cost) d1 = true; });
    var d2 = E.prestigeGain(S.run) >= E.STAR_MIN;
    tabs[0].classList.toggle('on', !!d0); tabs[1].classList.toggle('on', d1); tabs[2].classList.toggle('on', d2);
  }

  // ---------- actions ----------
  function standPos(i) {
    var P = [[200, 312], [55, 262], [345, 262], [112, 246], [288, 246], [70, 232], [330, 232], [200, 232]];
    return P[i];
  }
  function sparkle(x, y, col, n, power) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.283, sp = (40 + Math.random() * 120) * (power || 1);
      parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: 0.5 + Math.random() * 0.5, age: 0, col: col, r: 2 + Math.random() * 3 });
    }
  }
  function floatText(x, y, s, col, size, big) { floats.push({ x: x, y: y, s: s, col: col || '#fff', size: size || 20, life: big ? 1.3 : 1.0, age: 0, vx: (Math.random() - 0.5) * 24, big: big }); }
  function flyCoins(x, y, n) {
    for (var i = 0; i < n; i++) coinFly.push({ x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 20, t: -i * 0.04, sx: x, sy: y, ox: (Math.random() - 0.5) * 80, oy: -40 - Math.random() * 50 });
  }
  function bumpCash() { var p = $('coinpill'); p.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 180 }); }

  function doTap(px, py) {
    if (!started || adActive) return;
    S.tc++; sessionTaps++;
    var crit = S.tc % E.CRIT_EVERY === 0, fm = fire > 0 ? E.FIRE_MULT : 1;
    var v = tapVal((crit ? E.CRIT_MULT : 1) * fm);
    addCash(v);
    if (fire <= 0) { heat += E.HEAT_TAP; if (heat >= 100) { heat = 0; fire = E.FIRE_T; Snd.fire(); shake = 0.25; floatText(sx(200), sy(100), t('fire'), '#ff8a1f', 34 * Math.max(0.8, sc), true); } }
    tapAnim = 1; spitSpd = 7;
    var col = crit ? '#ffd34d' : (fire > 0 ? '#ff9a3d' : '#ffffff');
    floatText(px, py - 14, '+' + fmt(v), col, (crit ? 30 : 22) * Math.max(0.85, sc * 0.9), crit);
    if (crit) { floatText(px, py - 44, t('crit'), '#ff4d4d', 22 * Math.max(0.9, sc * 0.9), true); Snd.crit(); flyCoins(px, py, 6); shake = 0.15; sparkle(px, py, '#ffd34d', 14, 1.2); }
    else Snd.tap(S.tc);
    sparkle(sx(198), sy(215), '#ffb347', 3, 0.7);
    if (navigator.vibrate && crit) { try { navigator.vibrate(12); } catch (e) {} }
  }
  function buyStand(i) {
    if (!started || adActive) return;
    var n = S.n[i], bi = stBuyInfo(i);
    if (i > 0 && S.n[i - 1] === 0) return;
    if (S.cash < bi.cost) { Snd.deny(); return; }
    S.cash -= bi.cost; var before = n; S.n[i] += bi.k; dirty = true;
    Snd.buy(); pulse[i] = 1;
    var ms = null; for (var j = 0; j < E.MS.length; j++) if (before < E.MS[j] && S.n[i] >= E.MS[j]) ms = E.MS[j];
    if (before === 0) {
      appear[i] = performance.now() / 1000; var p = standPos(i); sparkle(sx(p[0]), sy(p[1] - 40), '#ffd34d', 24, 1.3);
      if (i > 0) {
        if (!S.seen[i]) {
          S.seen[i] = true; Snd.big();
          showModal({
            html: '<h2>' + t('newStand') + '</h2><img class="spr" alt="" src="' + Art.icon(i, 120, false) + '"><p>' + t('newStandSub', { s: t('names')[i] }) + '</p>',
            btns: [{ t: t('great'), cls: 'green', fn: function () { closeM(); setTimeout(breakpoint, 400); } }]
          });
        } else banner(icoUrl(i, false), t('newStand'), t('names')[i]);
      }
    }
    if (ms) { Snd.ms(); banner(icoUrl(i, false), t('names')[i], t('milestone', { s: t('names')[i] })); var pp = standPos(i); sparkle(sx(pp[0]), sy(pp[1] - 50), '#7bf59a', 20, 1.2); }
    updatePanel(); save(true);
  }
  function buyUp(id) {
    var u = E.UPMAP[id]; if (!u || S.up[id] || !E.upCanBuy(S, u)) return;
    if (S.cash < u.cost) { Snd.deny(); return; }
    S.cash -= u.cost; S.up[id] = true; Snd.ms(); dirty = true;
    if (u.kind === 'stand') pulse[u.i] = 1;
    sparkle(W / 2, H * 0.3, '#7bf59a', 16, 1.2);
    updatePanel(); save(true);
  }
  function buyTap() {
    var c = E.tapCost(S.tap);
    if (S.tap >= E.TAP_MAX) return;
    if (S.cash < c) { Snd.deny(); return; }
    S.cash -= c; S.tap++; Snd.buy(); tapAnim = 1; dirty = true; updatePanel(); save(true);
  }
  function buyOff() {
    var c = E.offCost(S.off);
    if (S.off >= E.OFF_MAX) return;
    if (S.cash < c) { Snd.deny(); return; }
    S.cash -= c; S.off++; Snd.buy(); dirty = true; updatePanel(); save(true);
  }

  // ---------- prestige ----------
  function openPrestige() {
    var g = E.prestigeGain(S.run);
    if (g < E.STAR_MIN || modalCur) { Snd.deny(); return; }
    var h = '<h2>' + t('frAsk') + '</h2><div class="big"><svg class="ico"><use href="#i-star"/></svg>+' + g + '</div><p>' + t('frAskSub') + '</p><p>' + t('frGain', { n: g, m: fmtMul(E.starMult(S.stars + g)) }) + '</p>';
    showModal({ html: h, x: true, btns: [{ t: t('frBtn', { n: g }), cls: 'green', fn: function () { doPrestige(); } }, { t: t('cancel'), cls: 'gray', fn: closeM }] });
  }
  function doPrestige() {
    var g = E.prestigeGain(S.run); if (g < E.STAR_MIN) { closeM(); return; }
    S.stars += g; S.pc++;
    S.cash = 0; S.run = 0; S.n = [0, 0, 0, 0, 0, 0, 0, 0]; S.up = {}; S.tap = 0; S.off = 0; S.boost = 0;
    heat = 0; fire = 0; custs = []; acc = []; appear = []; pulse = []; popT = [];
    flash = 1; shake = 0.5; Snd.big(); sparkle(W / 2, H * 0.35, '#ffd34d', 60, 2);
    closeM(); save(true); tabCur = 'stands'; setTab('stands');
    showModal({
      html: '<h2>' + t('frDone') + '</h2><div class="big"><svg class="ico"><use href="#i-star"/></svg>' + S.stars + '</div><p>' + t('frDoneSub', { m: fmtMul(E.starMult(S.stars)) }) + '</p>',
      btns: [{ t: t('go'), cls: 'green', fn: function () { closeM(); setTimeout(breakpoint, 400); } }]
    });
  }

  // ---------- daily / offline / rewarded ----------
  function dayKey() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); }
  function dailyIdx() { var k = dayKey(); return S.daily.lastDay === k - 1 ? S.daily.streak % 7 : 0; }
  function dailyAvail() { return S.daily.lastDay !== dayKey(); }
  function dailyAmount(i) { return Math.round(Math.max(100, E.baseCps(S) * 600) * DMULT[i]); }
  function openDaily() {
    if (modalCur) return;
    var avail = dailyAvail(), idx = avail ? dailyIdx() : (S.daily.streak + 6) % 7;
    var h = '<h2>' + t('daily') + '</h2><p>' + (avail ? t('dailySub') : t('claimed')) + '</p><div class="days">';
    for (var i = 0; i < 7; i++) {
      var cls = 'day' + (i === 6 ? ' d7' : '') + (avail ? (i === idx ? ' cur' : i < idx ? ' done' : '') : (i <= idx ? ' done' : ''));
      h += '<div class="' + cls + '">' + t('day', { n: i + 1 }) + '<b>' + fmt(dailyAmount(i)) + '</b>' + (i === 6 ? '<small>' + t('day7') + '</small>' : '') + '</div>';
    }
    h += '</div>';
    var btns = [];
    if (avail) {
      var amt = dailyAmount(idx);
      btns.push({ t: t('claim') + ' ' + coinSvg + fmt(amt), cls: 'green', fn: function () { claimDaily(idx, amt, false); } });
      btns.push({ t: '<svg class="ico"><use href="#i-play"/></svg>' + t('claim2'), cls: 'pink', fn: function () { rewarded(function () { claimDaily(idx, amt, true); }); } });
    } else btns.push({ t: t('ok'), cls: 'blue', fn: closeM });
    showModal({ html: h, btns: btns, x: avail });
  }
  function claimDaily(idx, amt, x2) {
    if (!dailyAvail()) { closeM(); return; }
    addCash(amt * (x2 ? 2 : 1));
    if (idx === 6) S.boost = Math.min(BOOST_CAP, S.boost + 600);
    S.daily = { lastDay: dayKey(), streak: idx + 1 };
    Snd.fan(); bumpCash(); flyCoins(W / 2, H * 0.4, 10); save(true); closeM(); setTimeout(breakpoint, 400);
  }
  function applyOffline(secs, silent) {
    var cap = E.offCap(S.off) * 3600, sec = Math.min(secs, cap);
    var earned = E.baseCps(S) * sec * E.offEff(S.off);
    if (earned >= 1 && secs >= 30 && !silent) {
      addCash(earned); save();
      var h = '<h2>' + t('welcome') + '</h2><p>' + t('away', { t: fmtDur(secs) }) + '</p><div class="big">' + coinSvg + '+' + fmt(earned) + '</div>';
      showModal({
        html: h, btns: [
          { t: t('collect'), cls: 'green', fn: function () { closeM(); setTimeout(breakpoint, 400); } },
          { t: '<svg class="ico"><use href="#i-play"/></svg>' + t('collect2') + ' +' + fmt(earned), cls: 'pink', fn: function () { rewarded(function () { addCash(earned); Snd.fan(); bumpCash(); closeM(); }); } }
        ]
      });
    } else if (earned > 0) addCash(earned);
  }
  function boostAd() {
    rewarded(function () { S.boost = Math.min(BOOST_CAP, S.boost + BOOST_ADD); Snd.fan(); toast(t('boostOn')); dirty = true; save(true); });
  }
  function cashAd() {
    if (cashCd > 0) { Snd.deny(); return; }
    var amt = cashAdAmount();
    rewarded(function () { addCash(amt); cashCd = CASH_CD; Snd.fan(); bumpCash(); flyCoins(W / 2, H * 0.4, 12); toast(t('gotCash')); save(true); });
  }

  // ---------- layout ----------
  function sx(x) { return ox + x * sc; }
  function sy(y) { return oy + y * sc; }
  var sceneBottom = 0;
  function layout() {
    W = window.innerWidth; H = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    var pr = panelEl.getBoundingClientRect(), fr = floatEl.getBoundingClientRect(), hr = hudEl.getBoundingClientRect();
    var land = pr.left > W * 0.3;
    var right = land ? pr.left : W;
    var top = hr.bottom - 6, bottom = (fr.height ? fr.top : pr.top) - 2;
    if (bottom - top < 120) bottom = top + 120;
    sc = Math.min(right / LW, (bottom - top) / 300);
    ox = (right - LW * sc) / 2; oy = bottom - LH * sc; sceneBottom = bottom;
  }

  // ---------- render ----------
  function easeBack(p, s) { p = p - 1; return 1 + (s + 1) * p * p * p + s * p * p; }
  var BACK = [null, 1, 1, 0, 0, 2, 2, 2];
  var DRAW_ORDER = [5, 6, 7, 3, 4, 1, 2];
  var STAND_SCALE = [1, 0.85, 0.85, 0.72, 0.72, 0.85, 0.8, 1];
  function render(tm) {
    var c = cx; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var shx = shake > 0 ? (Math.random() - 0.5) * shake * 18 : 0, shy = shake > 0 ? (Math.random() - 0.5) * shake * 18 : 0;
    c.save(); c.translate(shx, shy);
    var gy = sy(232);
    Art.sky(c, -20, -20, W + 40, gy + 20, tm);
    Art.skyline(c, -20, W + 20, gy - 2, sc * 0.9, 7, '#ffffff', 0.9);
    Art.ground(c, -20, gy - 2, W + 40, H - gy + 30, sc);
    DRAW_ORDER.forEach(function (i) {
      if (!S.n[i]) return;
      var p = standPos(i), k = 1;
      if (appear[i]) { var a = Math.min(1, (performance.now() / 1000 - appear[i]) / 0.5); k = Math.max(0.01, easeBack(a, 2)); }
      var pu = 1 + (pulse[i] || 0) * 0.05;
      Art.stand(c, i, sx(p[0]), sy(p[1]), sc * STAND_SCALE[i] * k * pu, tm, {});
    });
    // main cart
    var chefs = Math.min(2, Math.floor(S.n[0] / 8));
    Art.stand(c, 0, sx(200), sy(312), sc * 1.25 * (1 + tapAnim * 0.015), tm, { rot: spitRot, squash: tapAnim, sign: t('sign'), fire: fire > 0 });
    c.save(); c.beginPath(); c.rect(0, 0, W, sy(242)); c.clip();
    Art.person(c, sx(257), sy(275), sc * 1.3, 2, tm * 3 + tapAnim * 4, true);
    for (var q = 0; q < chefs; q++) Art.person(c, sx(138 + q * 17), sy(275), sc * 1.25, 3 + q, tm * 2.4 + q, true);
    c.restore();
    if (fire > 0) {
      Art.flame(c, sx(198), sy(243), sc * 1.8, tm, 1.2 + Math.sin(tm * 12) * 0.15);
      var g = c.createRadialGradient(sx(198), sy(200), 10, sx(198), sy(200), 170 * sc);
      g.addColorStop(0, 'rgba(255,170,40,.35)'); g.addColorStop(1, 'rgba(255,100,0,0)');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    custs.forEach(function (u) {
      Art.person(c, sx(u.x), sy(u.y), sc * 1.05, u.look, u.ph, false);
      if (u.state === 'leave') { c.fillStyle = '#fff1cf'; Art.rr(c, sx(u.x + 5), sy(u.y - 20), 7 * sc, 9 * sc, 3 * sc); c.fill(); c.fillStyle = '#d9822b'; c.fillRect(sx(u.x + 5), sy(u.y - 17), 7 * sc, 2 * sc); }
    });
    parts.forEach(function (p) {
      var a = 1 - p.age / p.life; c.globalAlpha = Math.max(0, a); c.fillStyle = p.col;
      if (p.steam) { c.fillStyle = 'rgba(255,255,255,.55)'; }
      c.beginPath(); c.arc(p.x, p.y, p.r * (p.steam ? 1 + p.age * 3 : 1) * Math.max(0.8, sc * 0.7), 0, 6.283); c.fill();
    });
    c.globalAlpha = 1;
    c.restore();
    var wpx = 0;
    coinFly.forEach(function (q2) {
      if (q2.t < 0) return;
      var e = Math.min(1, q2.t / 0.7), tgt = els.coinTarget || { x: 40, y: 30 };
      var bx = q2.sx + q2.ox * Math.sin(e * 3.14), by = q2.sy + q2.oy * Math.sin(e * 3.14);
      var px = bx + (tgt.x - q2.sx) * e * e, py = by + (tgt.y - q2.sy) * e * e;
      c.fillStyle = '#ffb300'; c.beginPath(); c.arc(px, py, 7, 0, 6.283); c.fill();
      c.fillStyle = '#ffe27a'; c.beginPath(); c.arc(px - 1, py - 1, 4.5, 0, 6.283); c.fill();
    });
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    floats.forEach(function (f) {
      var p = f.age / f.life, a = p < 0.7 ? 1 : (1 - p) / 0.3, pop = f.age < 0.18 ? 0.6 + (f.age / 0.18) * 0.55 + (f.big ? 0.2 : 0) : 1.15 - Math.min(0.15, (f.age - 0.18) * 0.5);
      c.globalAlpha = Math.max(0, a); c.font = '800 ' + Math.round(f.size * pop) + 'px "Trebuchet MS",Arial,sans-serif';
      c.lineWidth = Math.max(3, f.size * 0.2); c.strokeStyle = '#7a3406'; c.strokeText(f.s, f.x, f.y);
      c.fillStyle = f.col; c.fillText(f.s, f.x, f.y);
    });
    c.globalAlpha = 1;
    if (flash > 0) { c.fillStyle = 'rgba(255,255,255,' + Math.min(1, flash) + ')'; c.fillRect(0, 0, W, H); }
  }

  // ---------- update ----------
  function spawnCust() {
    if (custs.length > 7) return;
    custs.push({ x: -20, y: 318 + Math.random() * 10, look: Math.floor(Math.random() * 20), ph: Math.random() * 6, state: 'walk', tx: 150 + Math.random() * 100, w: 0 });
  }
  function popAt(i, amt, x, y, small) {
    floatText(sx(x), sy(y), '+' + fmt(amt), small ? '#fff3b0' : '#ffffff', (small ? 15 : 19) * Math.max(0.85, sc * 0.85));
    pulse[i] = 1; Snd.coin();
  }
  function update(dt) {
    var gm = E.globalMult(S) * boostMult();
    var inc = E.baseCps(S) * boostMult() * dt;
    if (inc > 0) { S.cash += inc; S.run += inc; S.life += inc; dirty = true; }
    for (var i = 0; i < E.N; i++) {
      var si = S.n[i] ? E.standIncome(S, i) * gm : 0;
      acc[i] = (acc[i] || 0) + si * dt; popT[i] = (popT[i] || 0) - dt;
      if (pulse[i] > 0) pulse[i] = Math.max(0, pulse[i] - dt * 4);
      if (i > 0 && acc[i] > 0 && popT[i] <= 0) {
        var p = standPos(i); popAt(i, acc[i], p[0] + (Math.random() - 0.5) * 20, p[1] - 70 * STAND_SCALE[i], true); acc[i] = 0; popT[i] = 1.3 + Math.random() * 0.9;
      }
    }
    if (S.boost > 0) S.boost = Math.max(0, S.boost - dt);
    if (cashCd > 0) cashCd = Math.max(0, cashCd - dt);
    if (fire > 0) { fire -= dt; if (fire <= 0) { fire = 0; heat = 0; } } else heat = Math.max(0, heat - E.HEAT_DECAY * dt);
    custAcc += dt; custT -= dt;
    var rate = S.n[0] > 0 ? 0.5 + Math.min(1.6, S.n[0] / 14) : 0.3;
    if (custT <= 0) { spawnCust(); custT = (0.7 + Math.random() * 0.8) / rate; }
    custs.forEach(function (u) {
      u.ph += dt * 7;
      if (u.state === 'walk') { u.x += 70 * dt; if (u.x >= u.tx) { u.state = 'wait'; u.w = 0.45 + Math.random() * 0.4; u.ph = 0; } }
      else if (u.state === 'wait') {
        u.w -= dt;
        if (u.w <= 0) {
          u.state = 'leave';
          if (acc[0] > 0) { popAt(0, acc[0], u.x, 300, false); flyCoinsMaybe(u.x, 300); acc[0] = 0; popT[0] = 1.5; }
          sparkle(sx(u.x), sy(300), '#ffd34d', 4, 0.6);
        }
      } else { u.x += 85 * dt; }
    });
    custs = custs.filter(function (u) { return u.x < 430; });
    if (acc[0] > 0 && popT[0] < -3 && S.n[0] > 0) { popAt(0, acc[0], 200, 170, false); acc[0] = 0; popT[0] = 1.5; }
    tapAnim = Math.max(0, tapAnim - dt * 5); spitSpd += (1.2 + (fire > 0 ? 3 : 0) - spitSpd) * Math.min(1, dt * 3); spitRot += spitSpd * dt;
    if (flash > 0) flash = Math.max(0, flash - dt * 2.2);
    if (shake > 0) shake = Math.max(0, shake - dt);
    if (Math.random() < dt * 9) parts.push({ x: sx(198) + (Math.random() - 0.5) * 24 * sc, y: sy(182), vx: (Math.random() - 0.5) * 8, vy: -26 * sc - Math.random() * 10, life: 1.1, age: 0, col: '#fff', r: 3, steam: true });
    parts.forEach(function (p) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (!p.steam) p.vy += 320 * dt; });
    parts = parts.filter(function (p) { return p.age < p.life; });
    floats.forEach(function (f) { f.age += dt; f.y -= (f.big ? 38 : 46) * dt; f.x += f.vx * dt; });
    floats = floats.filter(function (f) { return f.age < f.life; });
    var cc = 0;
    coinFly.forEach(function (q) { q.t += dt; if (q.t >= 0.7 && !q.done) { q.done = true; cc++; } });
    if (cc) { bumpCash(); Snd.coin(); }
    coinFly = coinFly.filter(function (q) { return q.t < 0.7; });
    if (floats.length > 60) floats.splice(0, floats.length - 60);
    if (parts.length > 240) parts.splice(0, parts.length - 240);
    if (dirty && performance.now() - lastSaveAt > 5000) { lastSaveAt = performance.now(); save(); }
  }
  var coinMaybeT = 0;
  function flyCoinsMaybe(x, y) { if (performance.now() - coinMaybeT > 700) { coinMaybeT = performance.now(); flyCoins(sx(x), sy(y), 2); } }

  function updateHud() {
    var cashEl = $('cash'), v = Math.floor(S.cash), txt = v < 10000 ? String(v) : fmt(S.cash);
    if (els.cash !== txt) { els.cash = txt; cashEl.textContent = txt; }
    var cs = '+' + fmt(cps()) + t('perSec');
    if (els.cps !== cs) { els.cps = cs; $('cps').textContent = cs; $('cps').style.color = S.boost > 0 ? '#9dffb8' : ''; }
    var sb = $('starbadge');
    if (S.stars > 0) { sb.classList.remove('hidden'); setTx($('stars'), 0, String(S.stars)); setTx($('starm'), 0, 'x' + fmtMul(E.starMult(S.stars))); } else sb.classList.add('hidden');
    var hp = $('heat'); hp.classList.toggle('fire', fire > 0); $('heati').style.width = (fire > 0 ? fire / E.FIRE_T * 100 : heat) + '%';
    var bb = $('bboost'), showAds = Platform.hasAds() && S.life >= 30;
    bb.classList.toggle('off', !showAds); $('bcash').classList.toggle('off', !showAds);
    setTx($('tboost'), 0, t('boost')); setTx($('tboost2'), 0, S.boost > 0 ? t('boostLeft', { t: fmtClock(S.boost) }) : t('boostSub'));
    bb.classList.toggle('pulse', showAds && S.boost <= 0 && S.life > 600 && !modalCur);
    setTx($('tcash'), 0, t('cash', { x: fmt(cashAdAmount()) })); setTx($('tcash2'), 0, cashCd > 0 ? t('cashWait', { t: fmtClock(cashCd) }) : t('cashSub'));
    $('bcash').classList.toggle('gray', cashCd > 0);
    $('bgift').querySelector('.dot').classList.toggle('on', dailyAvail());
    updateDots();
    var hx = '';
    if (!modalCur) { if (S.tc < 8 && S.life < 40) hx = t('hint0'); else if (S.n[0] === 0 && S.cash >= E.unitCost(0, 0) && tabCur === 'stands') hx = t('hint1'); else if (S.n[0] > 0 && S.n[0] < 4 && S.n[1] === 0 && S.cash >= E.unitCost(1, 0) && tabCur === 'stands') hx = t('hint2'); }
    if (els.hint !== hx) { els.hint = hx; hintEl.textContent = hx; hintEl.classList.toggle('on', !!hx); }
    if (hx) { var hr = hudEl.getBoundingClientRect(); hintEl.style.top = (hr.bottom + 6) + 'px'; }
    updatePanel();
  }
  function applyLang() {
    document.documentElement.lang = L;
    document.title = { ru: 'Шаурма Тайкун', tr: 'Döner Patronu', en: 'Shawarma Tycoon' }[L];
    $('tt0').textContent = t('tStands'); $('tt1').textContent = t('tUps'); $('tt2').textContent = t('tFr');
    $('qtl').textContent = t('buy'); $('qmax').textContent = t('max');
    els = { coinTarget: els.coinTarget }; panelKey = '';
  }
  function setSndIcon() { document.querySelector('#bsnd use').setAttribute('href', Snd.muted ? '#i-mute' : '#i-snd'); }
  function updateQtyBtns() { document.querySelectorAll('#qty button').forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-q') === qty); }); }
  function cashTarget() { var r = $('coinpill').getBoundingClientRect(); els.coinTarget = { x: r.left + 28, y: r.top + r.height / 2 }; }

  function frame() {
    requestAnimationFrame(frame);
    var tm = performance.now() / 1000, dt = Math.min(0.1, tm - lastFrame); lastFrame = tm;
    if (!started) return;
    if (!paused) update(dt);
    hudT += dt; if (hudT > 0.1) { hudT = 0; updateHud(); }
    render(tm);
  }

  // ---------- input ----------
  function bindInput() {
    cv.addEventListener('pointerdown', function (e) {
      Snd.unlock(); if (modalCur || adActive || !started) return;
      e.preventDefault(); doTap(e.clientX, e.clientY);
    });
    window.addEventListener('keydown', function (e) {
      if ((e.code === 'Space' || e.code === 'Enter') && !modalCur && started && !e.repeat && document.activeElement === document.body) { e.preventDefault(); Snd.unlock(); doTap(sx(200), sy(230)); }
    });
    document.querySelectorAll('.tab').forEach(function (b) { b.addEventListener('click', function () { Snd.unlock(); Snd.click(); setTab(b.getAttribute('data-t')); }); });
    document.querySelectorAll('#qty button').forEach(function (b) { b.addEventListener('click', function () { Snd.unlock(); Snd.click(); qty = +b.getAttribute('data-q'); updateQtyBtns(); updatePanel(); }); });
    $('bsnd').addEventListener('click', function () { Snd.unlock(); Snd.muted = !Snd.muted; S.muted = Snd.muted; Snd.apply(); setSndIcon(); Snd.click(); save(); });
    $('bgift').addEventListener('click', function () { Snd.unlock(); Snd.click(); openDaily(); });
    $('bboost').addEventListener('click', function () { Snd.unlock(); Snd.click(); if (!modalCur) boostAd(); });
    $('bcash').addEventListener('click', function () { Snd.unlock(); Snd.click(); if (!modalCur) cashAd(); });
    window.addEventListener('resize', function () { layout(); cashTarget(); });
    window.addEventListener('orientationchange', function () { setTimeout(function () { layout(); cashTarget(); }, 200); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { hiddenAt = Date.now(); if (started) save(true); updGP(); }
      else {
        updGP(); lastFrame = performance.now() / 1000;
        if (hiddenAt && started && !adActive) { var away = (Date.now() - hiddenAt) / 1000; if (away > 30) applyOffline(away, false); }
        hiddenAt = 0;
      }
    });
    window.addEventListener('pagehide', function () { if (started) save(true); });
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
    applyLang(); layout(); bindInput(); cashTarget();
    Snd.muted = !!S.muted; setSndIcon(); updateQtyBtns();
    var away = S.savedAt ? (Date.now() - S.savedAt) / 1000 : 0;
    started = true; lastFrame = performance.now() / 1000;
    setTab('stands');
    if (S.life > 0 && away > 30) applyOffline(away, false);
    if (dailyAvail() && S.life > 200 && !modalCur) setTimeout(openDaily, 600);
    requestAnimationFrame(frame);
    setTimeout(function () { Platform.ready(); updGP(); layout(); cashTarget(); }, 120);
    Platform.onPause(function () { paused = true; Snd.adMute = true; Snd.apply(); });
    Platform.onResume(function () { if (!adActive) { paused = false; Snd.adMute = false; Snd.apply(); lastFrame = performance.now() / 1000; } });
    if (DBG) window.__dbg = {
      S: S, E: E, get paused() { return paused; }, get adOn() { return adActive; }, get modal() { return !!modalCur; }, get heat() { return heat; }, get fire() { return fire; },
      get L() { return L; }, get sc() { return sc; }, get scene() { return { ox: ox, oy: oy, sc: sc, sb: sceneBottom }; },
      buyStand: buyStand, buyUp: buyUp, buyTap: buyTap, buyOff: buyOff, openDaily: openDaily, openPrestige: openPrestige, doPrestige: doPrestige, closeM: closeM, setTab: setTab,
      breakpoint: breakpoint, canAd: canInterstitial, applyOffline: applyOffline, save: save, cps: cps, layout: layout, doTap: doTap, update: update, sx: sx, sy: sy,
      setLastAd: function (v) { lastAdAt = v; }, setCash: function (v) { S.cash = v; S.run = Math.max(S.run, v); S.life = Math.max(S.life, v); },
      setQty: function (q) { qty = q; updateQtyBtns(); updatePanel(); },
      cashAd: cashAd, boostAd: boostAd, setCd: function (v) { cashCd = v; },
      step: function (sec) { for (var k = 0; k < sec * 10; k++) update(0.1); }
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
