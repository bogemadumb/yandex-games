(function (w) {
  var T = {
    ru: {
      title: 'Flux', tag: 'Направь искру к цели', play: 'Играть', cont: 'Уровень %d', lab: 'Лаборатория', daily: 'Задача дня', skins: 'Следы',
      level: 'Уровень %d', done: 'Готово!', next: 'Дальше', replay: 'Заново', map: 'Уровни', worldGate: 'Нужно звёзд: %d', locked: 'Закрыто',
      hint: 'Подсказка', skip: 'Пропустить', sparks: 'Искры', adSoon: 'Короткая рекламная пауза', adFail: 'Реклама недоступна', noReward: 'Награда не получена',
      over: 'Перегорело', score: 'Решено: %d', best: 'Рекорд: %d', again: 'Ещё раз', revive: '+1 жизнь', menu: 'Меню', streak: 'Серия: %d', dailyDone: 'Задача решена', comeBack: 'Новая завтра',
      owned: 'Есть', equipped: 'Выбрано', notEnough: 'Не хватает искр', get: 'Получить', stars: 'Звёзды: %d', lang: 'Язык', first: 'Первое прохождение',
      w1: 'Искра', w2: 'Полюса', w3: 'Якоря', w4: 'Отскок', w5: 'Порталы', w6: 'Орбиты', w7: 'Туман', w8: 'Хаос', labN: 'Опыт %d', bonus: 'Бонус', loading: 'Загрузка', paused: 'Пауза', tapResume: 'Нажми, чтобы продолжить', clearAll: 'Сбросить заряды'
    },
    en: {
      title: 'Flux', tag: 'Steer the spark to the goal', play: 'Play', cont: 'Level %d', lab: 'Laboratory', daily: 'Daily puzzle', skins: 'Trails',
      level: 'Level %d', done: 'Solved!', next: 'Next', replay: 'Replay', map: 'Levels', worldGate: 'Stars needed: %d', locked: 'Locked',
      hint: 'Hint', skip: 'Skip', sparks: 'Sparks', adSoon: 'Short ad break', adFail: 'Ad not available', noReward: 'No reward received',
      over: 'Burned out', score: 'Solved: %d', best: 'Best: %d', again: 'Try again', revive: '+1 life', menu: 'Menu', streak: 'Streak: %d', dailyDone: 'Puzzle solved', comeBack: 'New one tomorrow',
      owned: 'Owned', equipped: 'Equipped', notEnough: 'Not enough sparks', get: 'Get', stars: 'Stars: %d', lang: 'Language', first: 'First clear',
      w1: 'Spark', w2: 'Poles', w3: 'Anchors', w4: 'Rebound', w5: 'Portals', w6: 'Orbits', w7: 'Fog', w8: 'Chaos', labN: 'Run %d', bonus: 'Bonus', loading: 'Loading', paused: 'Paused', tapResume: 'Tap to resume', clearAll: 'Reset charges'
    },
    tr: {
      title: 'Flux', tag: 'Kıvılcımı hedefe yönlendir', play: 'Oyna', cont: 'Seviye %d', lab: 'Laboratuvar', daily: 'Günün bulmacası', skins: 'İzler',
      level: 'Seviye %d', done: 'Çözüldü!', next: 'İleri', replay: 'Tekrar', map: 'Seviyeler', worldGate: 'Gereken yıldız: %d', locked: 'Kilitli',
      hint: 'İpucu', skip: 'Geç', sparks: 'Kıvılcım', adSoon: 'Kısa reklam arası', adFail: 'Reklam kullanılamıyor', noReward: 'Ödül alınamadı',
      over: 'Yandı', score: 'Çözülen: %d', best: 'En iyi: %d', again: 'Tekrar dene', revive: '+1 can', menu: 'Menü', streak: 'Seri: %d', dailyDone: 'Bulmaca çözüldü', comeBack: 'Yenisi yarın',
      owned: 'Sahipsin', equipped: 'Seçili', notEnough: 'Kıvılcım yetmiyor', get: 'Al', stars: 'Yıldız: %d', lang: 'Dil', first: 'İlk geçiş',
      w1: 'Kıvılcım', w2: 'Kutuplar', w3: 'Çapalar', w4: 'Sekme', w5: 'Portallar', w6: 'Yörüngeler', w7: 'Sis', w8: 'Kaos', labN: 'Deneme %d', bonus: 'Bonus', loading: 'Yükleniyor', paused: 'Duraklatıldı', tapResume: 'Devam için dokun', clearAll: 'Yükleri sıfırla'
    }
  };
  var lang = 'en';
  function langFrom(code) {
    code = String(code || '').toLowerCase().slice(0, 2);
    if (code === 'ru' || code === 'be' || code === 'kk' || code === 'uk' || code === 'uz') return 'ru';
    if (code === 'tr') return 'tr';
    return 'en';
  }
  w.I18N = {
    set: function (code) { lang = T[code] ? code : langFrom(code); },
    get: function () { return lang; },
    from: langFrom,
    t: function (k, a) { var s = (T[lang] && T[lang][k]) || T.en[k] || k; return a == null ? s : s.replace('%d', a); },
    order: ['ru', 'en', 'tr']
  };
})(window);
