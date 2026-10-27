# Cherry to Galaxy: Merge Idle — карточка для Яндекс Игр

Папка игры: `game1-merge/` (index.html в корне), архив: `game1-merge.zip`.
Файлы карточки: `icon-512.png` (512x512), `cover-800x470.png` (800x470), `screenshot-1-desktop.png` (1280x720), `screenshot-2-mobile.png` (720x1280), `screenshot-3-upgrades.png` (720x1280).

## Название

- RU: От вишни до галактики: слияние
- EN: Cherry to Galaxy: Merge Idle
- TR: Kirazdan Galaksiye: Birleştirme

## Краткое описание (до ~100 символов)

- RU: Соединяй одинаковые предметы: от вишни до целой галактики. Монеты капают, пока ты не в игре!
- EN: Merge identical items from a cherry up to a whole galaxy. Coins keep flowing while you are away!
- TR: Aynı eşyaları birleştir: kirazdan koca bir galaksiye. Sen oyunda değilken de altın akmaya devam eder!

## Полное описание

### RU

Создавай предметы, перетаскивай два одинаковых друг на друга и смотри, как вишня превращается в клубнику, яблоко, арбуз, Луну, Землю, Сатурн, Солнце и, наконец, в Галактику. 12 уровней предметов, нарисованных кодом, ярко и аккуратно, без внешних картинок.

Каждый предмет на поле приносит монеты. Чем выше уровень, тем больше доход. Трать монеты на улучшения:
- Скорость появления: заряды восстанавливаются быстрее.
- Авто-слияние: игра сама соединяет пары.
- Доход монет: больше монет с каждого предмета.
- Офлайн-доход: предметы зарабатывают, пока тебя нет в игре.

Почему хочется вернуться:
- Офлайн-доход: загляни через несколько часов и забери накопленное.
- Ежедневный бонус: 7 дней подряд, награда растёт, на 7-й день ещё и полный запас зарядов.
- Открытия: каждый новый предмет даёт награду и заполняет коллекцию.
- Бонус x2 монет на 2 минуты за просмотр видео.

Играть можно одним пальцем на телефоне и мышкой на компьютере. Прогресс сохраняется автоматически, в том числе для гостей без авторизации. Звук можно выключить одной кнопкой.

### EN

Spawn items, drag two identical ones together and watch a cherry turn into a strawberry, an apple, a watermelon, the Moon, the Earth, Saturn, the Sun and finally a Galaxy. 12 item tiers, all drawn in bright, clean vector style.

Every item on the board earns coins, and higher tiers earn more. Spend coins on upgrades:
- Spawn speed: charges recover faster.
- Auto-merge: the game merges pairs for you.
- Coin boost: more coins from every item.
- Offline income: your items keep earning while you are away.

Reasons to come back:
- Offline income: return after a few hours and collect what your items earned.
- Daily bonus: a 7-day streak with growing rewards, day 7 also refills your charges.
- Discoveries: every new tier gives a reward and fills your collection.
- x2 coins for 2 minutes by watching a rewarded video.

Play with one finger on mobile or with a mouse on desktop. Progress is saved automatically, including guest mode. Sound can be muted with one tap.

### TR

Eşyalar oluştur, iki aynı eşyayı birbirine sürükle ve kirazın çileğe, elmaya, karpuza, Ay'a, Dünya'ya, Satürn'e, Güneş'e ve sonunda bir Galaksi'ye dönüşmesini izle. 12 eşya seviyesi, hepsi kodla, parlak ve temiz çizilmiş; harici resim yok.

Tahtadaki her eşya altın kazandırır; seviye yükseldikçe gelir artar. Altınlarını geliştirmelere harca:
- Çıkış hızı: haklar daha hızlı yenilenir.
- Oto birleştirme: oyun çiftleri senin yerine birleştirir.
- Altın kazancı: her eşyadan daha fazla altın.
- Çevrimdışı kazanç: sen oyunda değilken de eşyalar kazanır.

Neden geri dönmek isteyeceksin:
- Çevrimdışı kazanç: birkaç saat sonra gel ve biriken altınları al.
- Günlük bonus: 7 günlük seri, ödül her gün büyür; 7. gün ayrıca tüm haklar dolar.
- Keşifler: her yeni eşya ödül verir ve koleksiyonu doldurur.
- Ödüllü video izleyerek 2 dakika boyunca 2x altın.

Telefonda tek parmakla, bilgisayarda fareyle oynanır. İlerleme otomatik kaydedilir, giriş yapmayan misafirler için de. Ses tek dokunuşla kapatılır.

## Жанр и теги

- Жанр (категория): Казуальные / Головоломки (основная: Казуальные)
- Поджанр: Merge, Idle / Кликеры
- Теги RU: слияние, мерж, айдл, кликер, головоломка, казуальная, одним пальцем, офлайн-доход, коллекция, фрукты, планеты, космос, для детей и взрослых
- Tags EN: merge, merge game, idle, clicker, puzzle, casual, one finger, offline income, collection, fruits, planets, space, relaxing
- Etiketler TR: birleştirme, merge, idle, tıklama oyunu, bulmaca, hafif oyun, tek parmak, çevrimdışı kazanç, koleksiyon, meyveler, gezegenler, uzay, rahatlatıcı
- Устройства: смартфон, планшет, компьютер (портретная и альбомная ориентация)
- Языки: ru, en, tr
- Возраст: 0+ (нет насилия, нет покупок за реальные деньги)

## Технические сведения для модерации

- SDK v2: `/sdk.js`, `YaGames.init()`, `LoadingAPI.ready()`, `GameplayAPI.start/stop`.
- Реклама: межстраничная не чаще раза в 90 с и только в естественных паузах (закрытие улучшений, награда за новое открытие, после сбора офлайн-дохода и ежедневного бонуса), перед показом 1,2 с экран «Короткая рекламная пауза»; rewarded: x2 монет на 2 минуты, x2 к офлайн-доходу и x2 к ежедневному бонусу. На время рекламы игра на паузе, звук выключен.
- Сохранения: `player.setData/getData` (`getPlayer({scopes:false})`) + localStorage, работает для гостей.
- Язык: `ysdk.environment.i18n.lang` (ru, be, kk, uk, uz -> русский, tr -> турецкий, остальные -> английский).
- Размер: меньше 100 КБ, без внешних ресурсов и ссылок.
