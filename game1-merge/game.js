(function () {
  'use strict';

  var PARAMS = new URLSearchParams(location.search);
  var DBG = PARAMS.has('debug');
  var COLS = 5, N = 25, MAXT = 11, MAXC = 8, AD_GAP = 90000, SAVE_KEY = 'cgm_save_v1';
  var CPS = [0.15, 0.35, 0.8, 1.8, 4, 9, 20, 45, 100, 230, 520, 1200];
  var PAL = ['#e5173f', '#ff4d6d', '#ffd400', '#ff9a1f', '#e8333a', '#3fbf4a', '#cfd5e0', '#e2572b', '#2f80ed', '#e8b85a', '#ffb800', '#b45cff'];
  var SPR = window.SPRITES.SPR, SIL = window.SPRITES.SIL;

  var TXT = {
    ru: {
      names: ['Вишня', 'Клубника', 'Лимон', 'Апельсин', 'Яблоко', 'Арбуз', 'Луна', 'Марс', 'Земля', 'Сатурн', 'Солнце', 'Галактика'],
      spawn: 'Создать', shop: 'Улучшения', boost: 'x2 монет', boostSub: 'за видео', perSec: '/сек',
      hint1: 'Нажми «Создать» или на пустую клетку', hint2: 'Перетащи одинаковые предметы друг на друга',
      wait: 'Подожди, заряды восстанавливаются', full: 'Нет места! Соедини предметы',
      newItem: 'Новое открытие!', reward: 'Награда', great: 'Отлично!', nowSpawn: 'Теперь появляется: {x}',
      shopTitle: 'Улучшения', max: 'МАКС', lv: 'Ур. {n}',
      u_spawn: 'Скорость появления', u_auto: 'Авто-слияние', u_inc: 'Доход монет', u_off: 'Офлайн-доход',
      e_spawn: '{x} с / заряд', e_auto0: 'выключено', e_auto: '{x} с / пара', e_inc: '+{x}% монет', e_off: '{p}% · до {h} ч',
      welcome: 'С возвращением!', away: 'Вас не было {t}. Предметы заработали:', collect: 'Забрать', collect2: 'Ещё столько же',
      daily: 'Ежедневный бонус', dailySub: 'Заходи каждый день: награда растёт!', day: 'День {n}', claim: 'Забрать', claim2: 'Забрать x2', claimed: 'Уже получено. Приходи завтра!',
      adSoon: 'Короткая рекламная пауза…', noReward: 'Награда не получена', adFail: 'Реклама сейчас недоступна',
      boostOn: 'Бонус x2 включён!', galaxy: 'Галактики слились! Бонус {x}', h: 'ч', m: 'мин', s: 'с', ok: 'Хорошо', nextDay: 'Следующий бонус завтра',
      tapBonus: '+{x}', refill: '+ полный запас зарядов', sound: 'Звук'
    },
    en: {
      names: ['Cherry', 'Strawberry', 'Lemon', 'Orange', 'Apple', 'Watermelon', 'Moon', 'Mars', 'Earth', 'Saturn', 'Sun', 'Galaxy'],
      spawn: 'Spawn', shop: 'Upgrades', boost: 'x2 coins', boostSub: 'watch video', perSec: '/s',
      hint1: 'Tap Spawn or an empty tile', hint2: 'Drag identical items onto each other',
      wait: 'Wait, charges are recovering', full: 'Board is full! Merge items',
      newItem: 'New discovery!', reward: 'Reward', great: 'Great!', nowSpawn: 'Now spawning: {x}',
      shopTitle: 'Upgrades', max: 'MAX', lv: 'Lv {n}',
      u_spawn: 'Spawn speed', u_auto: 'Auto-merge', u_inc: 'Coin boost', u_off: 'Offline income',
      e_spawn: '{x} s / charge', e_auto0: 'off', e_auto: '{x} s / pair', e_inc: '+{x}% coins', e_off: '{p}% · up to {h} h',
      welcome: 'Welcome back!', away: 'You were away for {t}. Your items earned:', collect: 'Collect', collect2: 'Get the same again',
      daily: 'Daily bonus', dailySub: 'Come back every day: rewards grow!', day: 'Day {n}', claim: 'Claim', claim2: 'Claim x2', claimed: 'Already claimed. See you tomorrow!',
      adSoon: 'Short ad break…', noReward: 'Reward not granted', adFail: 'Ads are unavailable right now',
      boostOn: 'x2 boost is on!', galaxy: 'Galaxies merged! Bonus {x}', h: 'h', m: 'min', s: 's', ok: 'OK', nextDay: 'Next bonus tomorrow',
      tapBonus: '+{x}', refill: '+ full charges', sound: 'Sound'
    },
    tr: {
      names: ['Kiraz', 'Çilek', 'Limon', 'Portakal', 'Elma', 'Karpuz', 'Ay', 'Mars', 'Dünya', 'Satürn', 'Güneş', 'Galaksi'],
      spawn: 'Oluştur', shop: 'Geliştirmeler', boost: '2x altın', boostSub: 'video izle', perSec: '/sn',
      hint1: 'Oluştur\'a veya boş bir kareye dokun', hint2: 'Aynı eşyaları üst üste sürükle',
      wait: 'Bekle, haklar yenileniyor', full: 'Yer kalmadı! Eşyaları birleştir',
      newItem: 'Yeni keşif!', reward: 'Ödül', great: 'Harika!', nowSpawn: 'Artık çıkan: {x}',
      shopTitle: 'Geliştirmeler', max: 'MAKS', lv: 'Sv. {n}',
      u_spawn: 'Çıkış hızı', u_auto: 'Oto birleştirme', u_inc: 'Altın kazancı', u_off: 'Çevrimdışı kazanç',
      e_spawn: '{x} sn / hak', e_auto0: 'kapalı', e_auto: '{x} sn / çift', e_inc: '+%{x} altın', e_off: '%{p} · {h} saate kadar',
      welcome: 'Tekrar hoş geldin!', away: '{t} yoktun. Eşyaların kazandığı:', collect: 'Topla', collect2: 'Bir o kadar daha',
      daily: 'Günlük bonus', dailySub: 'Her gün gel: ödül büyüyor!', day: '{n}. gün', claim: 'Al', claim2: '2x al', claimed: 'Zaten alındı. Yarın görüşürüz!',
      adSoon: 'Kısa reklam arası…', noReward: 'Ödül verilmedi', adFail: 'Reklamlar şu an kullanılamıyor',
      boostOn: '2x bonus açık!', galaxy: 'Galaksiler birleşti! Bonus {x}', h: 'sa', m: 'dk', s: 'sn', ok: 'Tamam', nextDay: 'Sonraki bonus yarın',
      tapBonus: '+{x}', refill: '+ tam hak', sound: 'Ses'
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

  var SUF = { tr: ['', ' bin', ' Mn', ' Mr', ' Tr', ' Kt', ' Kn'], ru: ['', ' тыс', ' млн', ' млрд', ' трлн', ' квдрлн', ' квнтлн'], en: ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'] };
  function dec(s) { return L !== 'en' ? s.replace('.', ',') : s; }
  function fmt(n) {
    if (n < 10000) return String(Math.floor(n));
    var i = 0; while (n >= 1000 && i < 6) { n /= 1000; i++; }
    return dec(String(+n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2))) + SUF[L][i];
  }
  function fmtRate(n) {
    if (n < 10) return dec(String(+n.toFixed(1)));
    return fmt(n);
  }
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
  var hudEl = $('hud'), barEl = $('bar'), hintEl = $('hint'), toastEl = $('toast'), bannerEl = $('banner');
  var modalEl = $('modal'), cardEl = $('card'), adovEl = $('adov');

  // ---------- state ----------
  var S, cells = new Array(N), flights = [], particles = [], floats = [], coinFly = [], bubbles = [];
  var paused = false, adActive = false, hiddenAt = 0, started = false;
  var lastAdAt = Date.now(), lastInput = 0, lastSaveAt = 0, lastCloudAt = 0, dirty = false;
  var drag = null, hover = -1;
  var gpOn = false;

  function defaults() {
    return {
      v: 1, savedAt: Date.now(), coins: 0, items: [], charges: MAXC, chargeT: 0,
      up: { spawn: 0, auto: 0, inc: 0, off: 0 }, found: [], highest: -1, boost: 0,
      daily: { lastDay: -999, streak: 0 }, merges: 0, muted: false, spawns: 0
    };
  }
  function sane(d) {
    if (!d || typeof d !== 'object' || d.v !== 1 || !isFinite(d.coins)) return null;
    var b = defaults();
    for (var k in b) if (d[k] == null) d[k] = b[k];
    ['spawn', 'auto', 'inc', 'off'].forEach(function (k) { d.up[k] = Math.max(0, Math.min(UP[k].max, d.up[k] | 0)); });
    d.coins = Math.max(0, d.coins); d.charges = Math.max(0, Math.min(MAXC, d.charges)); d.boost = Math.max(0, Math.min(600, d.boost));
    if (!Array.isArray(d.items)) d.items = [];
    return d;
  }
  function serialize() {
    var items = [];
    for (var i = 0; i < N; i++) items.push(cells[i] ? cells[i].tier : -1);
    flights.forEach(function (f) { if (items[f.a] < 0) items[f.a] = f.tier; });
    S.items = items; S.savedAt = Date.now();
    return S;
  }
  function saveLocal() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(serialize())); } catch (e) {}
  }
  function save(force) {
    saveLocal(); dirty = false;
    var now = Date.now();
    if (Platform.hasCloud() && (force || now - lastCloudAt > 15000)) {
      lastCloudAt = now;
      try { var p = Platform.saveData({ save: S }); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    }
  }
  function readLocal() {
    try { var s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }

  // ---------- upgrades ----------
  var UP = {
    spawn: { max: 12, cost: function (l) { return Math.round(40 * Math.pow(2.1, l)); }, icon: 'i-bolt', nm: 'u_spawn' },
    auto: { max: 12, cost: function (l) { return Math.round(200 * Math.pow(2.3, l)); }, icon: 'i-merge', nm: 'u_auto' },
    inc: { max: 20, cost: function (l) { return Math.round(100 * Math.pow(1.85, l)); }, icon: 'i-inc', nm: 'u_inc' },
    off: { max: 10, cost: function (l) { return Math.round(100 * Math.pow(2.0, l)); }, icon: 'i-moon', nm: 'u_off' }
  };
  function spawnInterval(l) { return 3.5 * Math.pow(0.9, l); }
  function autoInterval(l) { return 14 * Math.pow(0.84, l - 1); }
  function incMult(l) { return 1 + 0.2 * l; }
  function offEff(l) { return 0.3 + 0.07 * l; }
  function offCap(l) { return 2 + l; }
  function effText(id, l) {
    if (id === 'spawn') return t('e_spawn', { x: dec(spawnInterval(l).toFixed(1)) });
    if (id === 'auto') return l === 0 ? t('e_auto0') : t('e_auto', { x: dec(autoInterval(l).toFixed(1)) });
    if (id === 'inc') return t('e_inc', { x: Math.round((incMult(l) - 1) * 100) });
    return t('e_off', { p: Math.round(offEff(l) * 100), h: offCap(l) });
  }

  function boostMult() { return S.boost > 0 ? 2 : 1; }
  function baseCps() { var s = 0; for (var i = 0; i < N; i++) if (cells[i]) s += CPS[cells[i].tier]; return s * incMult(S.up.inc); }
  function cps() { return baseCps() * boostMult(); }
  function spawnTier() { return Math.max(0, Math.floor((S.highest - 5) / 3)); }

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
    spawn: function () { this.tone(380, 0.14, 'sine', 0.25, 1.9); },
    merge: function (tier) { var b = 330 * Math.pow(2, tier / 6); this.tone(b, 0.16, 'triangle', 0.28); this.tone(b * 1.5, 0.22, 'triangle', 0.24, 1, 0.07); this.tone(b * 2, 0.28, 'sine', 0.16, 1, 0.14); },
    coin: function () { this.tone(1500, 0.07, 'square', 0.04, 1.3); },
    deny: function () { this.tone(170, 0.18, 'square', 0.12, 0.7); },
    click: function () { this.tone(700, 0.05, 'sine', 0.15, 1.2); },
    buy: function () { this.tone(520, 0.1, 'triangle', 0.25); this.tone(780, 0.16, 'triangle', 0.25, 1, 0.08); },
    fan: function () { [523, 659, 784, 1046].forEach(function (f, i) { Snd.tone(f, 0.3, 'triangle', 0.25, 1, i * 0.1); }); },
    swap: function () { this.tone(260, 0.08, 'sine', 0.15, 1.4); }
  };

  // ---------- SDK ----------
  function updGP() {
    var want = started && !document.hidden && !adActive && !modalCur;
    if (want === gpOn) return;
    gpOn = want;
    try { if (want) Platform.gameplayStart(); else Platform.gameplayStop(); } catch (e) {}
  }
  function adStart() {
    if (adActive) return; adActive = true; paused = true; drag = null; hover = -1;
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
    clearTimeout(toastTm); toastTm = setTimeout(function () { toastEl.classList.remove('on'); }, 1700);
  }
  var bannerTm = 0;
  function banner(tier, line1, line2) {
    bannerEl.innerHTML = '<img alt="" src="' + SPR[tier].toDataURL() + '"><div><b>' + line1 + '</b>' + line2 + '</div>';
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
    modalEl.classList.remove('hidden'); drag = null; hover = -1; updGP();
    if (o.onOpen) o.onOpen();
  }
  function closeM() {
    var o = modalCur; if (!o) return;
    modalCur = null; modalEl.classList.add('hidden'); cardEl.innerHTML = '';
    if (o.onClose) o.onClose();
    if (modalQ.length && !modalCur) openM(modalQ.shift()); else updGP();
  }
  var coinSvg = '<svg class="ico"><use href="#i-coin"/></svg>';

  // ---------- shop ----------
  function shopHtml() {
    var h = '<h2>' + t('shopTitle') + '</h2><div class="rows">';
    Object.keys(UP).forEach(function (id) {
      var u = UP[id], l = S.up[id], maxed = l >= u.max;
      var eff = effText(id, l) + (maxed ? '' : '  \u2192  ' + effText(id, l + 1));
      h += '<div class="row"><div class="ic"><svg><use href="#' + u.icon + '"/></svg></div><div class="tx"><div class="nm">' + t(u.nm) + ' <span class="lv">' + t('lv', { n: l }) + '</span></div><div class="ds">' + eff + '</div></div>';
      if (maxed) h += '<button class="btn gray buy" disabled>' + t('max') + '</button>';
      else h += '<button class="btn ' + (S.coins >= u.cost(l) ? 'green' : 'green off') + ' buy" data-u="' + id + '">' + coinSvg + fmt(u.cost(l)) + '</button>';
      h += '</div>';
    });
    return h + '</div>';
  }
  var shopOpen = false;
  function openShop() {
    if (modalCur) return;
    shopOpen = true;
    showModal({ x: true, html: shopHtml(), onClose: function () { shopOpen = false; setTimeout(breakpoint, 250); } });
    bindShop();
  }
  function bindShop() {
    var bs = cardEl.querySelectorAll('.buy[data-u]');
    for (var i = 0; i < bs.length; i++) bs[i].onclick = function (e) { buy(e.currentTarget.getAttribute('data-u')); };
  }
  function refreshShop() {
    if (!shopOpen || !modalCur) return;
    var x = cardEl.querySelector('.x'), sc = cardEl.scrollTop;
    cardEl.innerHTML = shopHtml();
    if (x) cardEl.appendChild(x);
    bindShop(); cardEl.scrollTop = sc;
  }
  function buy(id) {
    var u = UP[id], l = S.up[id];
    if (l >= u.max) return;
    var c = u.cost(l);
    if (S.coins < c) { Snd.deny(); return; }
    S.coins -= c; S.up[id] = l + 1; Snd.buy(); save();
    if (id === 'auto') autoT = 0;
    refreshShop();
  }

  // ---------- daily ----------
  function dayKey() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); }
  var DMULT = [1, 1.5, 2, 2.5, 3, 4, 6];
  function dailyIdx() { var k = dayKey(); return S.daily.lastDay === k - 1 ? S.daily.streak % 7 : 0; }
  function dailyAvail() { return S.daily.lastDay !== dayKey(); }
  function dailyAmount(i) { return Math.round(Math.max(150, baseCps() * 240) * DMULT[i]); }
  function openDaily() {
    if (modalCur) return;
    var avail = dailyAvail(), idx = avail ? dailyIdx() : (S.daily.streak + 6) % 7;
    var h = '<h2>' + t('daily') + '</h2><p>' + (avail ? t('dailySub') : t('claimed')) + '</p><div class="days">';
    for (var i = 0; i < 7; i++) {
      var cls = 'day' + (i === 6 ? ' d7' : '') + (avail ? (i === idx ? ' cur' : i < idx ? ' done' : '') : (i <= idx ? ' done' : ''));
      h += '<div class="' + cls + '">' + t('day', { n: i + 1 }) + '<b>' + fmt(dailyAmount(i)) + (i === 6 ? '<br><small>' + t('refill') + '</small>' : '') + '</b></div>';
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
    S.coins += amt * (x2 ? 2 : 1);
    if (idx === 6) S.charges = MAXC;
    S.daily = { lastDay: dayKey(), streak: idx + 1 };
    Snd.fan(); burstHud(); save(true); closeM(); setTimeout(breakpoint, 400);
  }

  // ---------- offline ----------
  function applyOffline(secs, silent) {
    var cap = offCap(S.up.off) * 3600, sec = Math.min(secs, cap);
    var earned = baseCps() * sec * offEff(S.up.off);
    var iv = spawnInterval(S.up.spawn);
    if (S.charges < MAXC) { var tot = S.chargeT + secs; S.charges = Math.min(MAXC, S.charges + Math.floor(tot / iv)); S.chargeT = S.charges >= MAXC ? 0 : tot % iv; }
    if (earned >= 1 && secs >= 60 && !silent) {
      S.coins += earned; save();
      var h = '<h2>' + t('welcome') + '</h2><p>' + t('away', { t: fmtDur(secs) }) + '</p><div class="big">' + coinSvg + '+' + fmt(earned) + '</div>';
      showModal({
        html: h, btns: [
          { t: t('collect'), cls: 'green', fn: function () { closeM(); setTimeout(breakpoint, 400); } },
          { t: '<svg class="ico"><use href="#i-play"/></svg>' + t('collect2') + ' +' + fmt(earned), cls: 'pink', fn: function () { rewarded(function () { S.coins += earned; Snd.fan(); burstHud(); closeM(); }); } }
        ]
      });
    } else if (earned > 0) S.coins += earned;
  }

  // ---------- board logic ----------
  function newItem(tier, from, over, dur) {
    return { tier: tier, t0: now(), from: from == null ? 0 : from, over: over == null ? 2 : over, dur: dur || 0.3, wig: -9, lock: false, tapT: -9 };
  }
  function now() { return performance.now() / 1000; }
  function emptyRandom() {
    var e = []; for (var i = 0; i < N; i++) if (!cells[i]) e.push(i);
    return e.length ? e[Math.floor(Math.random() * e.length)] : -1;
  }
  function cellRect(i) { var r = Math.floor(i / COLS), c = i % COLS; return { x: BX + PAD + c * CELL, y: BY + PAD + r * CELL }; }
  function cellCenter(i) { var r = cellRect(i); return { x: r.x + CELL / 2, y: r.y + CELL / 2 }; }
  function cellAt(x, y) {
    var lx = x - BX - PAD, ly = y - BY - PAD;
    if (lx < 0 || ly < 0 || lx >= CELL * COLS || ly >= CELL * COLS) return -1;
    return Math.floor(ly / CELL) * COLS + Math.floor(lx / CELL);
  }
  function trySpawn(at) {
    if (modalCur || adActive) return;
    if (S.charges < 1) { Snd.deny(); toast(t('wait')); shakeBtn(); return; }
    var i = (at != null && at >= 0 && !cells[at]) ? at : emptyRandom();
    if (i < 0) { Snd.deny(); toast(t('full')); shakeBtn(); return; }
    var tier = spawnTier();
    S.charges -= 1; S.spawns++;
    if (S.charges === MAXC - 1) S.chargeT = 0;
    cells[i] = newItem(tier, 0, 2.2, 0.32);
    if (tier > S.highest) {
      S.highest = tier; S.found[tier] = true;
    }
    var c = cellCenter(i); sparkle(c.x, c.y, PAL[tier], 6, 0.6);
    Snd.spawn(); dirty = true; lastInput = now();
  }
  function shakeBtn() { var b = $('bspawn'); b.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 220 }); }
  function pairFor(excludeIdx, includeMax) {
    for (var tr = 0; tr <= (includeMax ? MAXT : MAXT - 1); tr++) {
      var list = [];
      for (var i = 0; i < N; i++) if (cells[i] && cells[i].tier === tr && !cells[i].lock && i !== excludeIdx) list.push(i);
      if (list.length >= 2) {
        var best = null, bd = 1e9;
        for (var a = 0; a < list.length; a++) for (var b = a + 1; b < list.length; b++) {
          var d = Math.abs(((list[a] / COLS) | 0) - ((list[b] / COLS) | 0)) + Math.abs(list[a] % COLS - list[b] % COLS);
          if (d < bd) { bd = d; best = [list[a], list[b]]; }
        }
        return best;
      }
    }
    return null;
  }
  function mergeInto(b, srcTier) {
    var it = cells[b], tier = srcTier, c = cellCenter(b);
    if (tier >= MAXT) {
      cells[b] = null;
      var bonus = Math.round(cps() * 120 + 5000);
      S.coins += bonus; S.merges++;
      sparkle(c.x, c.y, '#ffd34d', 36, 1.6); ring(c.x, c.y, '#ffd34d', CELL * 2.2);
      floatText(c.x, c.y - CELL * 0.3, '+' + fmt(bonus), '#ffe27a', CELL * 0.4);
      toast(t('galaxy', { x: fmt(bonus) })); Snd.fan(); dirty = true; return;
    }
    var nt = tier + 1;
    cells[b] = newItem(nt, 0.55, 3.4, 0.38);
    S.merges++;
    sparkle(c.x, c.y, PAL[nt], 16, 1); ring(c.x, c.y, PAL[nt], CELL * 1.5);
    Snd.merge(nt); dirty = true; lastInput = now();
    if (nt > S.highest) {
      S.highest = nt; S.found[nt] = true;
      var rw = Math.round(30 * Math.pow(2.3, nt));
      S.coins += rw; Snd.fan();
      floatText(c.x, c.y - CELL * 0.45, '+' + fmt(rw), '#ffe27a', CELL * 0.34);
      var oldSp = Math.max(0, Math.floor((nt - 1 - 5) / 3));
      if (nt >= 5) {
        showModal({
          html: '<h2>' + t('newItem') + '</h2><img class="spr" alt="" src="' + SPR[nt].toDataURL() + '"><p style="font-size:24px;color:#2b4fb8">' + t('names')[nt] + '</p><div class="big">' + coinSvg + '+' + fmt(rw) + '</div>' + (spawnTier() > oldSp ? '<p>' + t('nowSpawn', { x: t('names')[spawnTier()] }) + '</p>' : ''),
          btns: [{ t: t('great'), cls: 'green', fn: closeM }], onClose: function () { setTimeout(breakpoint, 300); }
        });
      } else {
        banner(nt, t('newItem'), t('names')[nt] + '  +' + fmt(rw));
      }
      if (spawnTier() > oldSp && nt < 5) toast(t('nowSpawn', { x: t('names')[spawnTier()] }));
    }
    save();
  }
  function dropItem(from, to) {
    var a = cells[from], b = cells[to];
    if (!a || from === to) return;
    if (b && b.lock) return;
    if (!b) { cells[to] = a; cells[from] = null; a.t0 = now(); a.from = 0.85; a.over = 1.5; a.dur = 0.18; Snd.swap(); dirty = true; return; }
    if (a.tier === b.tier) { cells[from] = null; mergeInto(to, b.tier); return; }
    cells[to] = a; cells[from] = b; a.t0 = b.t0 = now(); a.from = b.from = 0.85; a.over = b.over = 1.5; a.dur = b.dur = 0.18; Snd.swap(); dirty = true;
  }
  function startFlight(a, b) {
    var it = cells[a]; cells[b].lock = true; cells[a] = null;
    flights.push({ tier: it.tier, a: a, b: b, t0: now(), dur: 0.22 });
  }

  // ---------- effects ----------
  function sparkle(x, y, col, n, power) {
    for (var i = 0; i < n; i++) {
      var an = Math.random() * 6.283, sp = (0.5 + Math.random()) * CELL * 2.2 * (power || 1);
      particles.push({ x: x, y: y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - CELL * 0.6, life: 0.55 + Math.random() * 0.4, age: 0, col: Math.random() < 0.3 ? '#ffffff' : col, r: CELL * (0.035 + Math.random() * 0.05), star: Math.random() < 0.4 });
    }
  }
  function ring(x, y, col, R) { particles.push({ ring: true, x: x, y: y, R: R, life: 0.45, age: 0, col: col }); }
  function floatText(x, y, s, col, size) { floats.push({ x: x, y: y, s: s, col: col || '#fff', size: size || CELL * 0.26, life: 1.1, age: 0 }); }
  function burstHud() {
    var r = $('coinpill').getBoundingClientRect();
    for (var i = 0; i < 10; i++) coinFly.push({ x: W / 2 + (Math.random() - 0.5) * 120, y: H / 2 + (Math.random() - 0.5) * 80, tx: r.left + 24, ty: r.top + 23, age: -i * 0.04, dur: 0.7, cxp: W / 2 + (Math.random() - 0.5) * 200, cyp: H / 3 });
  }
  var fxT = 0;
  function incomeFx() {
    var idx = []; for (var i = 0; i < N; i++) if (cells[i] && !cells[i].lock) idx.push(i);
    if (!idx.length) return;
    var r = $('coinpill').getBoundingClientRect(), m = incMult(S.up.inc) * boostMult();
    for (var k = 0; k < Math.min(3, idx.length); k++) {
      var j = idx.splice(Math.floor(Math.random() * idx.length), 1)[0], c = cellCenter(j);
      var v = CPS[cells[j].tier] * m * 0.9;
      floatText(c.x, c.y - CELL * 0.05, '+' + fmtRate(v), '#fff3a8', CELL * 0.2);
      coinFly.push({ x: c.x, y: c.y, tx: r.left + 24, ty: r.top + 23, age: -k * 0.12, dur: 0.75 + Math.random() * 0.2, cxp: c.x + (Math.random() - 0.5) * 80, cyp: c.y - CELL });
    }
  }

  // ---------- layout & render ----------
  var W = 0, H = 0, DPR = 1, BX = 0, BY = 0, BS = 300, PAD = 8, CELL = 58, SY = 0, STRIPH = 40, land = false;
  function layout() {
    W = window.innerWidth; H = window.innerHeight; DPR = Math.min(window.devicePixelRatio || 1, 3);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    land = W / H > 1.2;
    barEl.classList.toggle('land', land);
    var hudB = hudEl.getBoundingClientRect().bottom + 6;
    var side, left0, top0;
    STRIPH = 40;
    if (land) {
      var barW = 220, gap = 22;
      side = Math.min(H - hudB - STRIPH - 8 - 30, W - 32 - barW - gap, 720);
      var total = side + gap + barW; left0 = (W - total) / 2;
      var avail = H - hudB - 12; var blk = STRIPH + 8 + side;
      var tp = hudB + Math.max(0, (avail - blk) / 2);
      SY = tp; BY = tp + STRIPH + 8; BX = left0;
      barEl.style.left = (left0 + side + gap) + 'px'; barEl.style.top = BY + 'px';
      barEl.style.bottom = 'auto'; barEl.style.transform = 'none';
      $('hudin').style.maxWidth = total + 'px';
      barEl.style.setProperty('--u', Math.max(44, Math.min(78, (H - BY - 38) / 3.4)) + 'px');
      hintEl.style.maxWidth = barW + 'px';
    } else {
      barEl.style.left = ''; barEl.style.top = ''; barEl.style.bottom = ''; barEl.style.transform = '';
      $('hudin').style.maxWidth = ''; hintEl.style.maxWidth = '';
      var barH = barEl.getBoundingClientRect().height + 12 + 14;
      side = Math.min(W - 20, 640, H - hudB - barH - STRIPH - 30);
      var avail2 = H - barH - hudB; var blk2 = STRIPH + 10 + side + 44;
      var tp2 = hudB + Math.max(0, (avail2 - blk2) / 2);
      SY = tp2; BY = tp2 + STRIPH + 10; BX = (W - side) / 2;
    }
    BS = side; PAD = side * 0.028; CELL = (side - PAD * 2) / COLS;
    var hr = hintEl;
    if (land) { hr.style.left = (BX + BS + 22 + 110) + 'px'; hr.style.top = (BY + 318) + 'px'; }
    else { hr.style.left = (BX + BS / 2) + 'px'; hr.style.top = (BY + BS + 12) + 'px'; }
    if (!bubbles.length) for (var i = 0; i < 16; i++) bubbles.push({ x: Math.random(), y: Math.random(), r: 8 + Math.random() * 34, sp: 0.01 + Math.random() * 0.03, a: 0.06 + Math.random() * 0.1, ph: Math.random() * 6 });
  }
  function rr(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function easeBack(p, s) { p = p - 1; return 1 + (s + 1) * p * p * p + s * p * p; }
  function itemScale(it, tm) {
    var p = (tm - it.t0) / it.dur; if (p >= 1) return 1; if (p < 0) p = 0;
    return it.from + (1 - it.from) * easeBack(p, it.over);
  }
  function drawSprite(tier, x, y, size, sc, rot, alpha, lift) {
    var s = size * sc;
    cx.save();
    cx.globalAlpha = (alpha == null ? 1 : alpha) * 0.22;
    cx.fillStyle = '#001040'; cx.beginPath(); cx.ellipse(x + (lift || 0) * 0.3, y + size * 0.38 + (lift || 0), s * 0.3, s * 0.075, 0, 0, 6.283); cx.fill();
    cx.globalAlpha = alpha == null ? 1 : alpha;
    cx.translate(x, y - (lift || 0)); cx.rotate(rot || 0);
    cx.drawImage(SPR[tier], -s / 2, -s / 2, s, s);
    cx.restore();
  }

  function render(tm, dt) {
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx.clearRect(0, 0, W, H);
    // bubbles
    for (var b = 0; b < bubbles.length; b++) {
      var bu = bubbles[b];
      if (!paused) { bu.y -= bu.sp * dt; if (bu.y < -0.1) { bu.y = 1.1; bu.x = Math.random(); } }
      cx.fillStyle = 'rgba(255,255,255,' + bu.a + ')';
      cx.beginPath(); cx.arc(bu.x * W + Math.sin(tm * 0.5 + bu.ph) * 12, bu.y * H, bu.r, 0, 6.283); cx.fill();
    }
    // collection strip
    var n = 12, sw = Math.min(BS, 640), isz = Math.min(36, (sw - 8) / n - 4), gap = (sw - isz * n) / (n - 1);
    var sx0 = BX + (BS - sw) / 2, spT = spawnTier();
    cx.save();
    rr(cx, sx0 - 8, SY, sw + 16, STRIPH, 14); cx.fillStyle = 'rgba(18,38,110,.35)'; cx.fill();
    for (var i = 0; i < n; i++) {
      var ix = sx0 + i * (isz + gap) + isz / 2, iy = SY + STRIPH / 2;
      if (S.found[i]) { cx.drawImage(SPR[i], ix - isz / 2, iy - isz / 2, isz, isz); }
      else {
        cx.globalAlpha = 0.9; cx.drawImage(SIL[i], ix - isz / 2, iy - isz / 2, isz, isz); cx.globalAlpha = 1;
        if (i === S.highest + 1) { cx.fillStyle = '#fff'; cx.font = '800 ' + isz * 0.5 + 'px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('?', ix, iy + 1); }
      }
    }
    cx.restore();

    // board frame
    cx.save();
    cx.shadowColor = 'rgba(0,0,60,.35)'; cx.shadowBlur = 24; cx.shadowOffsetY = 10;
    rr(cx, BX, BY, BS, BS, CELL * 0.3);
    var fg = cx.createLinearGradient(0, BY, 0, BY + BS); fg.addColorStop(0, '#3c6fe0'); fg.addColorStop(1, '#2548b0');
    cx.fillStyle = fg; cx.fill(); cx.restore();
    rr(cx, BX + 2, BY + 2, BS - 4, BS - 4, CELL * 0.3 - 2); cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 2; cx.stroke();

    var dragTier = drag && drag.moved ? drag.item.tier : -1;
    var hintPair = null;
    if (!drag && !paused && !modalCur && tm - lastInput > 7) hintPair = pairFor(-1, true);
    var gp = 3;
    for (var k = 0; k < N; k++) {
      var cr = cellRect(k), row = (k / COLS) | 0, col = k % COLS, tile = cells[k];
      var col1 = (row + col) % 2 ? '#e4eeff' : '#d3e3ff';
      var hv = drag && drag.moved && hover === k && k !== drag.from;
      var match = drag && drag.moved && tile && tile.tier === dragTier && k !== drag.from && !tile.lock;
      if (hv) col1 = (tile && tile.tier === dragTier) ? '#aef5bd' : '#fff7c4';
      rr(cx, cr.x + gp, cr.y + gp, CELL - gp * 2, CELL - gp * 2, CELL * 0.18);
      cx.fillStyle = col1; cx.fill();
      cx.strokeStyle = 'rgba(40,80,170,.18)'; cx.lineWidth = 1.5; cx.stroke();
      if (match || (hintPair && (hintPair[0] === k || hintPair[1] === k))) {
        var pl = 0.5 + 0.5 * Math.sin(tm * 6);
        rr(cx, cr.x + gp, cr.y + gp, CELL - gp * 2, CELL - gp * 2, CELL * 0.18);
        cx.strokeStyle = match ? 'rgba(40,200,90,' + (0.6 + 0.4 * pl) + ')' : 'rgba(255,170,0,' + (0.5 + 0.5 * pl) + ')'; cx.lineWidth = 3.5; cx.stroke();
      }
    }
    for (k = 0; k < N; k++) {
      var it = cells[k]; if (!it) continue;
      if (drag && drag.moved && drag.from === k) continue;
      var c0 = cellCenter(k), sc = itemScale(it, tm), bob = Math.sin(tm * 2.2 + k * 1.7) * CELL * 0.012;
      var wp = tm - it.wig, rot = wp < 0.5 ? Math.sin(wp * 28) * 0.22 * Math.exp(-wp * 7) : 0;
      sc *= 1 + Math.sin(tm * 2.2 + k) * 0.012;
      if (it.lock) sc *= 1.0;
      drawSprite(it.tier, c0.x, c0.y + bob, CELL * 0.84, sc, rot, 1, 0);
      if (it.tier > 0) {
        var bx = c0.x - CELL * 0.34, by = c0.y - CELL * 0.34;
        cx.fillStyle = 'rgba(20,40,120,.72)'; cx.beginPath(); cx.arc(bx, by, CELL * 0.1, 0, 6.283); cx.fill();
        cx.fillStyle = '#fff'; cx.font = '800 ' + CELL * 0.13 + 'px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(String(it.tier + 1), bx, by + 1);
      }
    }
    // flights
    for (var f = 0; f < flights.length; f++) {
      var fl = flights[f], p = Math.min(1, (tm - fl.t0) / fl.dur), e = p * p * (3 - 2 * p);
      var pa = cellCenter(fl.a), pb = cellCenter(fl.b);
      drawSprite(fl.tier, pa.x + (pb.x - pa.x) * e, pa.y + (pb.y - pa.y) * e - Math.sin(p * 3.14) * CELL * 0.2, CELL * 0.84, 1 + Math.sin(p * 3.14) * 0.1, 0, 1, 0);
    }
    // dragged
    if (drag && drag.moved) {
      var dx = drag.x - drag.offx, dy = drag.y - drag.offy;
      drawSprite(drag.item.tier, dx, dy, CELL * 0.84, 1.18, Math.max(-0.3, Math.min(0.3, drag.vx * 0.0012)), 1, CELL * 0.14);
    }
    // particles
    for (var q = 0; q < particles.length; q++) {
      var pt = particles[q], a = 1 - pt.age / pt.life;
      if (a <= 0) continue;
      if (pt.ring) {
        cx.strokeStyle = pt.col; cx.globalAlpha = a * 0.8; cx.lineWidth = 5 * a + 1;
        cx.beginPath(); cx.arc(pt.x, pt.y, pt.R * (1 - a) * 0.9 + 6, 0, 6.283); cx.stroke(); cx.globalAlpha = 1;
      } else {
        cx.globalAlpha = Math.min(1, a * 1.5); cx.fillStyle = pt.col;
        if (pt.star) {
          cx.save(); cx.translate(pt.x, pt.y); cx.rotate(pt.age * 6); cx.beginPath();
          for (var s2 = 0; s2 < 8; s2++) { var rad = s2 % 2 ? pt.r * 0.45 : pt.r * 1.5, an = s2 * Math.PI / 4; cx.lineTo(Math.cos(an) * rad, Math.sin(an) * rad); }
          cx.closePath(); cx.fill(); cx.restore();
        } else { cx.beginPath(); cx.arc(pt.x, pt.y, pt.r * (0.5 + a * 0.5), 0, 6.283); cx.fill(); }
        cx.globalAlpha = 1;
      }
    }
    // floats
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    for (var z = 0; z < floats.length; z++) {
      var ft = floats[z], fa = 1 - ft.age / ft.life; if (fa <= 0) continue;
      cx.globalAlpha = Math.min(1, fa * 2); cx.font = '800 ' + ft.size + 'px "Trebuchet MS",sans-serif';
      cx.lineWidth = ft.size * 0.18; cx.strokeStyle = 'rgba(70,40,0,.7)'; cx.lineJoin = 'round';
      var fy = ft.y - ft.age * CELL * 0.4; cx.strokeText(ft.s, ft.x, fy); cx.fillStyle = ft.col; cx.fillText(ft.s, ft.x, fy); cx.globalAlpha = 1;
    }
    // coin flights
    for (var cf = 0; cf < coinFly.length; cf++) {
      var co = coinFly[cf]; if (co.age < 0) continue;
      var u = Math.min(1, co.age / co.dur), v = 1 - u;
      var px = v * v * co.x + 2 * v * u * co.cxp + u * u * co.tx, py = v * v * co.y + 2 * v * u * co.cyp + u * u * co.ty;
      var cr2 = CELL * 0.1 * (1 - u * 0.3);
      var cg = cx.createRadialGradient(px - cr2 * 0.3, py - cr2 * 0.3, cr2 * 0.1, px, py, cr2);
      cg.addColorStop(0, '#fff3b0'); cg.addColorStop(0.6, '#ffc21a'); cg.addColorStop(1, '#d98a00');
      cx.fillStyle = cg; cx.beginPath(); cx.arc(px, py, cr2, 0, 6.283); cx.fill();
      cx.strokeStyle = '#a86400'; cx.lineWidth = 1.2; cx.stroke();
    }
  }

  // ---------- update ----------
  var lastFrame = 0, autoT = 0, hudT = 0, saveT = 0, coinSnd = 0;
  var els = {};
  function update(dt) {
    var inc = cps() * dt; S.coins += inc;
    if (S.boost > 0) S.boost = Math.max(0, S.boost - dt);
    if (S.charges < MAXC) {
      S.chargeT += dt; var iv = spawnInterval(S.up.spawn);
      while (S.charges < MAXC && S.chargeT >= iv) { S.chargeT -= iv; S.charges++; }
      if (S.charges >= MAXC) S.chargeT = 0;
    }
    if (S.up.auto > 0) {
      autoT += dt;
      if (autoT >= autoInterval(S.up.auto)) {
        var pr = pairFor(drag ? drag.from : -1, false);
        if (pr) { autoT = 0; startFlight(pr[0], pr[1]); }
        else autoT = autoInterval(S.up.auto) * 0.8;
      }
    }
    var tm = now();
    for (var i = flights.length - 1; i >= 0; i--) {
      if (tm - flights[i].t0 >= flights[i].dur) {
        var fl = flights.splice(i, 1)[0];
        if (cells[fl.b]) { cells[fl.b].lock = false; mergeInto(fl.b, fl.tier); }
      }
    }
    for (i = particles.length - 1; i >= 0; i--) {
      var p = particles[i]; p.age += dt;
      if (!p.ring) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += CELL * 4 * dt; p.vx *= 0.985; }
      if (p.age >= p.life) particles.splice(i, 1);
    }
    for (i = floats.length - 1; i >= 0; i--) { floats[i].age += dt; if (floats[i].age >= floats[i].life) floats.splice(i, 1); }
    for (i = coinFly.length - 1; i >= 0; i--) {
      var c = coinFly[i]; c.age += dt;
      if (c.age >= c.dur) { coinFly.splice(i, 1); bumpCoins(); }
    }
    fxT += dt; if (fxT >= 1.0) { fxT = 0; incomeFx(); }
    saveT += dt; if (saveT >= 5) { saveT = 0; save(false); }
  }
  var bumpAt = 0;
  function bumpCoins() {
    var tm = performance.now();
    if (tm - bumpAt < 140) return; bumpAt = tm;
    $('coinpill').animate([{ transform: 'scale(1.07)' }, { transform: 'scale(1)' }], { duration: 160 });
    var q = Snd; if (tm - coinSnd > 160) { coinSnd = tm; q.coin(); }
  }
  function updateHud() {
    var cs = fmt(S.coins); if (els.coins !== cs) { els.coins = cs; $('coins').textContent = cs; }
    var rt = '+' + fmtRate(cps()) + t('perSec') + (S.boost > 0 ? '  x2' : ''); if (els.cps !== rt) { els.cps = rt; $('cps').textContent = rt; }
    var pips = $('pips');
    if (!els.pips) { for (var i = 0; i < MAXC; i++) { var pe = document.createElement('span'); pe.className = 'pip'; pe.innerHTML = '<i></i>'; pips.appendChild(pe); } els.pips = pips.children; }
    var iv = spawnInterval(S.up.spawn);
    for (var j = 0; j < MAXC; j++) {
      var e = els.pips[j]; e.classList.toggle('on', j < S.charges);
      e.firstChild.style.height = (j === S.charges && S.charges < MAXC) ? Math.round(S.chargeT / iv * 100) + '%' : '0%';
    }
    $('bspawn').classList.toggle('off', S.charges < 1);
    var aff = false; for (var id in UP) if (S.up[id] < UP[id].max && S.coins >= UP[id].cost(S.up[id])) aff = true;
    document.querySelector('#bshop .dot').classList.toggle('on', aff);
    document.querySelector('#bgift .dot').classList.toggle('on', dailyAvail());
    var bb = $('bboost');
    if (S.boost > 0) { $('tboost').textContent = 'x2  ' + fmtClock(S.boost); $('tboost2').textContent = '+2:00'; bb.classList.add('active'); }
    else { $('tboost').textContent = t('boost'); $('tboost2').textContent = t('boostSub'); bb.classList.remove('active'); }
    var cnt = 0; for (var q = 0; q < N; q++) if (cells[q]) cnt++;
    var showH = S.merges < 1 && !modalCur;
    var hx = '';
    if (showH) hx = (cnt < 2) ? t('hint1') : t('hint2');
    if (els.hint !== hx) { els.hint = hx; hintEl.textContent = hx; hintEl.classList.toggle('on', !!hx); }
    $('bspawn').classList.toggle('pulse', S.merges < 1 && cnt < 2 && S.charges > 0);
    if (shopOpen) {
      var key = S.coins >= 0 ? JSON.stringify(S.up) + Object.keys(UP).map(function (k) { return S.coins >= UP[k].cost(S.up[k]) ? 1 : 0; }).join('') : '';
      if (els.shopKey !== key) { els.shopKey = key; refreshShop(); }
    }
  }
  function applyLang() {
    document.documentElement.lang = L;
    $('tspawn').textContent = t('spawn'); $('tshop').textContent = t('shop');
    document.title = { ru: 'От вишни до галактики', tr: 'Kirazdan Galaksiye', en: 'Cherry to Galaxy' }[L];
    els.cps = null; els.hint = null; els.shopKey = null;
  }
  function setSndIcon() { document.querySelector('#bsnd use').setAttribute('href', Snd.muted ? '#i-mute' : '#i-snd'); }

  function frame() {
    requestAnimationFrame(frame);
    var tm = performance.now() / 1000, dt = Math.min(0.1, tm - lastFrame); lastFrame = tm;
    if (!started) return;
    if (!paused) update(dt);
    hudT += dt; if (hudT > 0.1) { hudT = 0; updateHud(); }
    render(tm, paused ? 0 : dt);
  }

  // ---------- input ----------
  function bindInput() {
    cv.addEventListener('pointerdown', function (e) {
      Snd.unlock(); if (modalCur || adActive || !started) return;
      lastInput = now();
      var i = cellAt(e.clientX, e.clientY); if (i < 0) return;
      var it = cells[i];
      if (it && !it.lock) {
        var c = cellCenter(i);
        drag = { from: i, item: it, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, offx: e.clientX - c.x, offy: e.clientY - c.y, moved: false, vx: 0 };
        try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      } else if (!it) trySpawn(i);
    });
    cv.addEventListener('pointermove', function (e) {
      if (!drag) return;
      drag.vx = e.clientX - drag.x; drag.x = e.clientX; drag.y = e.clientY;
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8) { drag.moved = true; Snd.click(); }
      if (drag.moved) hover = cellAt(e.clientX - drag.offx + 0, e.clientY - drag.offy + 0);
      lastInput = now();
    });
    function up(e) {
      if (!drag) return;
      var d = drag; drag = null; lastInput = now();
      if (!d.moved) {
        var it = cells[d.from]; if (!it) { hover = -1; return; }
        it.wig = now();
        if (now() - it.tapT > 0.8) {
          it.tapT = now();
          var c = cellCenter(d.from), v = Math.max(1, CPS[it.tier] * incMult(S.up.inc) * boostMult() * 3);
          S.coins += v; floatText(c.x, c.y - CELL * 0.2, '+' + fmtRate(v), '#fff3a8', CELL * 0.24);
          var r = $('coinpill').getBoundingClientRect();
          coinFly.push({ x: c.x, y: c.y, tx: r.left + 24, ty: r.top + 23, age: 0, dur: 0.6, cxp: c.x, cyp: c.y - CELL });
          Snd.coin();
        }
        hover = -1; return;
      }
      var to = cellAt(e.clientX - d.offx, e.clientY - d.offy);
      if (to < 0) to = cellAt(e.clientX, e.clientY);
      hover = -1;
      if (to >= 0 && to !== d.from && cells[d.from] === d.item) dropItem(d.from, to);
    }
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', function () { drag = null; hover = -1; });

    $('bspawn').addEventListener('pointerdown', function () { Snd.unlock(); });
    $('bspawn').addEventListener('click', function () { trySpawn(-1); });
    $('bshop').addEventListener('click', function () { Snd.unlock(); Snd.click(); openShop(); });
    $('bgift').addEventListener('click', function () { Snd.unlock(); Snd.click(); openDaily(); });
    $('bsnd').addEventListener('click', function () {
      Snd.unlock(); Snd.muted = !Snd.muted; S.muted = Snd.muted; Snd.apply(); setSndIcon(); if (!Snd.muted) Snd.click(); dirty = true; save();
    });
    $('bboost').addEventListener('click', function () {
      Snd.unlock(); Snd.click();
      if (modalCur) return;
      rewarded(function () { S.boost = Math.min(600, S.boost + 120); Snd.fan(); toast(t('boostOn')); save(); });
    });
    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', function () { setTimeout(layout, 200); });
    window.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    ['gesturestart', 'gesturechange'].forEach(function (g) { document.addEventListener(g, function (e) { e.preventDefault(); }); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        hiddenAt = Date.now(); paused = true; drag = null; hover = -1; save(true);
        if (Snd.ctx && Snd.ctx.state === 'running') Snd.ctx.suspend();
        updGP();
      } else {
        if (!adActive) paused = false;
        lastFrame = performance.now() / 1000;
        if (Snd.ctx && !adActive) Snd.ctx.resume();
        var secs = (Date.now() - hiddenAt) / 1000;
        if (hiddenAt && secs > 20 && started) applyOffline(secs, false);
        hiddenAt = 0; updGP();
      }
    });
    window.addEventListener('pagehide', function () { save(true); });
    window.addEventListener('blur', function () { save(false); });
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
    for (var i = 0; i < N; i++) cells[i] = (S.items[i] >= 0 && S.items[i] <= MAXT) ? newItem(S.items[i], 1, 0, 0.01) : null;
    for (i = 0; i <= S.highest; i++) S.found[i] = true;
    if (!S.items.length && !S.spawns && S.highest < 0) {
      cells[11] = newItem(0, 0, 2.2, 0.4); cells[13] = newItem(0, 0, 2.2, 0.4); cells[13].t0 += 0.12; S.highest = 0; S.found[0] = true;
    }
    var tmOpen = S.savedAt ? (Date.now() - S.savedAt) / 1000 : 0;
    started = true; lastFrame = performance.now() / 1000; lastInput = now();
    if (S.items.length && tmOpen > 15) applyOffline(tmOpen, false);
    if (dailyAvail() && S.merges >= 3 && !modalCur) setTimeout(openDaily, 500);
    requestAnimationFrame(frame);
    setTimeout(function () {
      Platform.ready();
      updGP();
    }, 120);
    Platform.onPause(function () { paused = true; Snd.adMute = true; Snd.apply(); });
    Platform.onResume(function () { if (!adActive) { paused = false; Snd.adMute = false; Snd.apply(); lastFrame = performance.now() / 1000; } });
    if (DBG) window.__dbg = {
      S: S, get paused() { return paused; }, get adOn() { return adActive; }, cells: cells, trySpawn: trySpawn, openShop: openShop, openDaily: openDaily, dropItem: dropItem, mergeInto: mergeInto,
      cellCenter: cellCenter, buy: buy, breakpoint: breakpoint, canAd: canInterstitial, applyOffline: applyOffline, save: save,
      setLastAd: function (v) { lastAdAt = v; }, cps: cps, pairFor: pairFor, closeM: closeM, layout: layout,
      place: function (i, tier) { cells[i] = newItem(tier, 0, 2, 0.3); if (tier > S.highest) { S.highest = tier; } for (var k = 0; k <= S.highest; k++) S.found[k] = true; },
      clear: function () { for (var k = 0; k < N; k++) cells[k] = null; }
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
