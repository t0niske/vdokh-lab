/* Страницы Aromé — устранение запахов и ароматизация помещений.
   Мы ставим свой аппарат и заправляем маслом: он нейтрализует неприятный запах и наполняет помещение
   ароматом. Ничего не ищем и не ремонтируем. Кластеры: «Запахи» (как убрать запах …), «Помещения»
   (запах в кафе / подъезде …), «Нейтрализатор запаха», «Для ОСИ и УК», «Для дома», статьи. */
const D = require('../lib/data');
const { esc } = require('../lib/engine');
const UI = require('./ui');
const ODORS = require('./odors');
const PLACES = require('./places');
const ARTICLES = require('./articles');
const CFG = require('./config');
const TX = require('./texts');
const COL = require('./collection');
const { icon, OFFER, TRIAL, C } = UI;

const HOME = ['Главная', ''];
const odor = s => ODORS.find(o => o.slug === s);
const place = s => PLACES.find(o => o.slug === s);
const dateRu = d => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '');
const N300 = D.devices[0], N1000 = D.devices[1];
const PM300 = D.perMonth(N300.plans[2]);
const GAS = 'Если пахнет газом — не включайте свет, откройте окна, выйдите и звоните 104 или 112.';
const oilLine = CFG.oilEffect ? ` ${esc(CFG.oilEffect)}` : '';

/* Сравнение способов — главная, «Как работаем», «Нейтрализатор запаха» */
const COMPARE = {
  cols: ['Аэрозоль', 'Озонирование', 'Aromé'],
  rows: [
    ['Как работает', 'Облако аромата поверх запаха', 'Газ обрабатывает пустое помещение', 'Масло нейтрализует запах по расписанию'],
    ['Разово или каждый день', 'Минуты, пока не осело облако', 'Разово, запах может вернуться', 'Каждый день, всё время работы'],
    ['При людях', 'Да, но резко', 'Нет, на время обработки все уходят', 'Да, мягкая интенсивность'],
    ['Кто обслуживает', 'Вы сами покупаете баллоны', 'Разовый выезд', 'Мы: масла и сервис в подписке'],
    ['На какую площадь', 'Маленькая комната', 'Зависит от аппарата', 'До 300 м² или до 1000 м²']
  ]
};
const compare = () => `<div class="cmp" role="table" aria-label="Сравнение способов убрать запах">
  <div class="cmp-r cmp-h" role="row"><span role="columnheader"></span>${COMPARE.cols.map((c, i) => `<span role="columnheader"${i === 2 ? ' class="cmp-us"' : ''}>${c}</span>`).join('')}</div>
  ${COMPARE.rows.map(([k, ...v]) => `<div class="cmp-r" role="row"><span class="cmp-k" role="rowheader">${k}</span>${v.map((x, i) => `<span role="cell"${i === 2 ? ' class="cmp-us"' : ''} data-l="${COMPARE.cols[i]}">${x}</span>`).join('')}</div>`).join('')}
</div>`;

/* Как начать: заявка → подбор → установка → обслуживание */
const STEPS = [
  ['wa', 'Заявка', 'Напишите в WhatsApp или оставьте заявку: где пахнет и какая площадь. Ответим за 15 минут в рабочее время.'],
  ['list', 'Подбор аппарата и масла', 'Подбираем Nova 300 или Nova 1000 и аромат под ваш запах. Цену называем сразу.'],
  ['clock', 'Установка в день обращения', 'Привозим, ставим и настраиваем расписание и интенсивность под часы работы.'],
  ['done', 'Обслуживание', `Заправляем масло по графику и меняем аппарат при поломке. ${TRIAL}.`]
];
const STEPS_FULL = [
  STEPS[0], STEPS[1],
  ['clock', 'Установка в день обращения', 'Привозим аппарат и ставим его туда, где запах копится: санузел, вход, граница кухни, лифтовой холл.'],
  ['wind', 'Настройка интенсивности', 'Настраиваем, как часто аппарат распыляет масло: сильнее в часы пик, слабее в тихие часы, ночью — отдых.'],
  ['done', 'Обслуживание по графику', 'Приезжаем заправить масло, проверяем работу и меняем аппарат при поломке. Аромат можно сменить без доплаты.']
];
const steps = (list = STEPS) => `<ol class="steps${list.length === 5 ? ' steps-5' : ''}">${list.map(([ic, t, d], i) => `<li class="st"><span class="st-n">0${i + 1}</span>${icon(ic, 'ic st-ic')}<h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>`;

/* Как работает аппарат — главное объяснение всего сайта */
const HOW = [
  ['clock', 'Распыляет масло по расписанию', 'Аппарат выпускает масло мелкими порциями каждые несколько минут — с открытия до закрытия, по часам работы помещения.'],
  ['wind', 'Нейтрализует запах и даёт аромат', `Масло нейтрализует неприятный запах, а помещение наполняется приятным ароматом.${oilLine}`],
  ['done', 'Каждый день, а не разово', 'В отличие от озонирования аппарат работает постоянно: запах, который копится за день, не успевает вернуться.'],
  ['check', 'Без смеси запахов', 'Композицию подбираем чистую, без сладости, под ваш запах, а интенсивность — под площадь. «Туалета с цветами» не будет.']
];
const how = () => `<ul class="how">${HOW.map(([ic, t, d]) => `<li>${icon(ic, 'ic st-ic')}<div><h3>${t}</h3><p>${d}</p></div></li>`).join('')}</ul>`;

const devices = () => `<div class="devs">${D.devices.map(d => `<article class="dev"><p class="k">до ${d.area} м²</p><h3>${d.name}</h3><p>${TX.lead[d.id]}</p><p class="dev-pm">от <b>${UI.pm(d)}</b> в месяц</p><ul class="dev-pl">${d.plans.map(p => `<li><span>${p.months} ${p.months === 1 ? 'месяц' : p.months < 5 ? 'месяца' : 'месяцев'}</span><b>${D.fmt(p.total)}</b></li>`).join('')}</ul></article>`).join('')}</div>`;

/* Тест: отдельная плашка с кнопкой (событие test_request) */
const trialBar = p => `<div class="trial">${icon('gift', 'ic trial-ic')}<div><b>${TRIAL}.</b> Поставим аппарат, а вы решите, оставлять ли его.${CFG.trial.terms ? ' ' + esc(CFG.trial.terms) + '.' : ''}</div><a class="btn btn-s" href="${UI.wa(p.pageName, `Хочу тест ${D.trialDays} дня бесплатно.`)}" target="_blank" rel="noopener" data-test>${icon('wa')}Хочу тест</a></div>`;

/* Шаблон объявления для собрания жильцов — показываем на /osi/ и отдаём файлом (build.js) */
const flats = CFG.osi.flatsExample;
const OSI_TEMPLATE = `ОБЪЯВЛЕНИЕ ДЛЯ ЖИЛЬЦОВ

Уважаемые соседи!

В нашем подъезде постоянно неприятный запах: [у мусоропровода / в лифтовом холле / у входа]. Совет дома предлагает поставить аппарат-ароматизатор.

Как это работает. Аппарат каждый день по расписанию распыляет масло: оно нейтрализует неприятный запах и наполняет подъезд приятным ароматом. Аппарат ставят в закрытом корпусе на высоте, вне досягаемости.

Кто обслуживает. Компания Aromé по договору с ОСИ: аппарат, заправка маслом, настройка и замена при поломке входят в оплату. Каждый месяц — акт.

Сколько стоит. От ${D.fmt(PM300)} в месяц за подъезд при оплате за 6 месяцев (${D.fmt(N300.plans[0].total)} при оплате помесячно). При ${flats} квартирах это около ${D.fmt(PM300 / flats)} в месяц с квартиры.

Проверить до решения. ${TRIAL} — можно убедиться в результате до голосования.

Голосование: [дата, время, место или ссылка на опрос в чате дома].

Председатель ОСИ: ____________________
`;

/* Меню первого экрана главной (согласовано 27.10.2026). «Коллекция» — каталог ароматов /aromaty/. */
const HX_NAV = [['Пространства', 'pomeshcheniya/'], ['Коллекция', 'aromaty/'], ['Метод', 'kak-my-rabotaem/'], ['Цены', 'ceny/'], ['Блог', 'stati/']];
const hxLink = ([n, h]) => `<a href="/${h}">${n}</a>`;

function register(site) {
  const { add, img } = site;

  /* ── Главная ── */
  const homeFaq = [
    TX.faq.mix, TX.faq.help, TX.faq.pipe, TX.faq.safe,
    ['Сколько это стоит?', `Аппарат в аренду с маслами и обслуживанием — от ${UI.pm(N300)} в месяц при оплате за 6 месяцев или ${D.fmt(N300.plans[0].total)} помесячно. ${TRIAL}.`]
  ];
  add({
    path: '', section: '', priority: '1.0', bodyClass: 'home', pageName: 'Главная', ownHeader: true,
    fonts: 'family=Inter+Tight:wght@100..900&family=Playfair+Display:ital,wght@1,400;1,500',
    title: 'Ароматизация помещений для бизнеса в Астане | Aromé',
    description: `Ароматизация помещений для бизнеса в Астане: подбор аромата, установка в вентиляцию и обслуживание. От ${UI.pm(N300)} в месяц, тест 3 дня бесплатно.`,
    schema: [site.schema.website(), site.schema.business(C), site.schema.faq(homeFaq)],
    get body() {
      return `
<section class="hx" id="hx">
  <div class="hx-sl" data-scroll-x>${img('hero-s1', { cls: 'hx-i', eager: true })}${img('hero-s2', { cls: 'hx-i' })}${img('hero-s3', { cls: 'hx-i' })}</div>
  <div class="hx-shade"></div>
  <div class="hx-lines" aria-hidden="true"><span></span></div>
  <header class="hx-top">
    <a class="hx-logo" href="/" aria-label="Aromé — на главную">Aromé</a>
    <nav class="hx-tab" aria-label="Разделы">${HX_NAV.map(hxLink).join('')}</nav>
    <div class="hx-r">
      <a class="hx-call" href="tel:${C.phoneRaw}" aria-label="Позвонить">${icon('phone')}</a>
      <a class="hx-wa" href="${UI.wa(this.pageName)}" target="_blank" rel="noopener" aria-label="Написать в WhatsApp">${icon('wa')}<span>WhatsApp</span></a>
      <a class="hx-ul" href="#zayavka">Подобрать решение</a>
      <button class="hx-burger" id="burger" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="menu"><i></i></button>
    </div>
    <nav class="menu hx-menu" id="menu" aria-label="Основное меню">${HX_NAV.map(hxLink).join('')}<a class="menu-ph" href="tel:${C.phoneRaw}">${icon('phone')}${C.phone}</a></nav>
  </header>
  <div class="hx-txt">
    <h1><span class="hx-s1">Ароматизация помещений</span><span class="hx-s2">для бизнеса в&nbsp;Астане</span></h1>
    <p class="hx-lead">Подберём аромат под характер вашего бизнеса, установим оборудование в&nbsp;вентиляцию и&nbsp;возьмём обслуживание на&nbsp;себя.</p>
    <div class="hx-btns"><a class="hx-btn hx-btn-a" href="${UI.wa(this.pageName, 'Хочу тест 3 дня.')}" target="_blank" rel="noopener" data-test>Попробовать 3 дня бесплатно</a><a class="hx-btn hx-btn-g" href="/ceny/">Посмотреть стоимость</a></div>
  </div>
  <p class="hx-word" aria-hidden="true">Aromé</p>
  <div class="hx-tb" aria-hidden="true"><span class="hx-num">01 <em>/ 03</em></span><span class="hx-name">Салоны красоты и SPA</span><span class="hx-bars"><i class="on"></i><i></i><i></i></span></div>
</section>

<section class="ab" id="o-nas">
  <div class="ab-g">
    <div class="ab-l">
      <p class="ab-k">о нас</p>
      <div class="ab-dev"><div class="ab-aura" aria-hidden="true" data-scroll-x><b></b><i></i><i></i><i></i></div>${img('nova-cut', { cls: 'ab-img' })}</div>
    </div>
    <div class="ab-txt">
      <h2 class="ab-h">Aromé — ароматизация, <em>о которой не нужно думать</em></h2>
      <p>Мы — сервис профессиональной ароматизации коммерческих помещений в Астане. Подбираем аромат под характер бизнеса, подключаем аппарат к вентиляции и обслуживаем его по подписке: меняем масла, следим за работой, заменяем при поломке.</p>
      <p class="ab-m">Наша миссия — чтобы аромат стал такой же продуманной частью пространства, как свет и музыка.</p>
    </div>
  </div>
  <div class="ab-st">
    <div><b>3 <small>дня</small></b><span>бесплатного теста в вашем помещении</span></div>
    <div><b>2–3</b><span>аромата подбираем под вашу задачу</span></div>
    <div><b>1000 <small>м²</small></b><span>закрывает один аппарат Nova 1000</span></div>
    <div><b>&lt;35 <small>дБ</small></b><span>уровень шума — тише шёпота</span></div>
  </div>
</section>

<section class="sp" id="prodazhi">
  <div class="sp-wrap">
    <p class="sp-k">аромат и&nbsp;продажи</p>
    <div class="sp-top">
      <h2 class="sp-h">Как&nbsp;аромат <em>может помочь продажам</em></h2>
      <p class="sp-lead">Подходящий аромат может повлиять на&nbsp;впечатление от&nbsp;товаров, желание купить и&nbsp;время, проведённое в&nbsp;магазине. Эти эффекты изучают в&nbsp;реальных торговых пространствах и&nbsp;экспериментах.</p>
    </div>

    <div class="sp-rows">
      <div class="sp-row">
        <h3>01. Тратят больше</h3>
        <p>Эксперимент в&nbsp;магазине товаров для&nbsp;дома: 18&nbsp;дней, больше 400&nbsp;покупателей, лёгкий апельсиновый аромат</p>
        <p class="sp-res">Результат: когда в&nbsp;зале был аромат, покупатели тратили <b>в&nbsp;среднем на&nbsp;20% больше</b><a class="sp-src" href="https://doi.org/10.1016/j.jretai.2012.08.002" target="_blank" rel="noopener">Herrmann и&nbsp;др., Journal of Retailing, 2013</a></p>
      </div>
      <div class="sp-row">
        <h3>02. Охотнее покупают</h3>
        <p>Обзор 64&nbsp;научных исследований о&nbsp;приятных ароматах в&nbsp;магазинах</p>
        <p class="sp-res">Результат: с&nbsp;приятным ароматом у&nbsp;людей <b>выше желание купить</b><a class="sp-src" href="https://doi.org/10.1177/0022242919881137" target="_blank" rel="noopener">Roschk, Hosseinpour, Journal of Marketing, 2020</a></p>
      </div>
      <div class="sp-row">
        <h3>03. Дольше выбирают</h3>
        <p>Тот же&nbsp;обзор: как&nbsp;аромат меняет поведение покупателей в&nbsp;зале</p>
        <p class="sp-res">Результат: покупатели <b>дольше остаются в&nbsp;зале</b> и&nbsp;выше оценивают товары<a class="sp-src" href="https://doi.org/10.1177/0022242919881137" target="_blank" rel="noopener">Roschk, Hosseinpour, Journal of Marketing, 2020</a></p>
      </div>
    </div>

    <div class="sp-stats">
      <div><div class="sp-n" data-to="20" data-pre="+" data-suf="%">+20%</div><p>больше тратили покупатели<br>в&nbsp;эксперименте с&nbsp;ароматом</p></div>
      <div><div class="sp-n" data-to="400" data-suf="+">400+</div><p>посетителей участвовали<br>в&nbsp;исследовании магазина</p></div>
      <div><div class="sp-n" data-to="64">64</div><p>научные публикации<br>вошли в&nbsp;обзор</p></div>
      <div><div class="sp-n" data-to="3">3</div><p>дня бесплатного теста<br>в&nbsp;вашем помещении</p></div>
    </div>

    <div class="sp-cta">
      <a class="sp-btn" href="#">Подобрать аромат для&nbsp;бизнеса</a>
      <p class="sp-cta-n">Сначала подберём аромат и&nbsp;дадим <b>3&nbsp;дня</b> бесплатно проверить его&nbsp;у вас</p>
    </div>
    <p class="sp-note">Это&nbsp;результаты исследований, а&nbsp;не обещание роста продаж: эффект зависит от&nbsp;аромата, пространства и&nbsp;интенсивности. Бесплатный тест показывает, как&nbsp;аромат и&nbsp;система работают у&nbsp;вас; чтобы измерить влияние на&nbsp;продажи, нужен отдельный период наблюдения.</p>
  </div>
</section>

${UI.collection(this, COL.top())}

<section class="sec">
  <div class="wrap split split-img">
    <div><p class="k">Как работает аппарат</p><h2 class="h2">Нейтрализует запах и&nbsp;держит аромат каждый день</h2>${how()}</div>
    ${img('device', { cls: 'side-img side-tall' })}
  </div>
</section>

<section class="sec sec-dark">
  <div class="wrap">
    <div class="sec-head"><div><p class="k k-l">А почему не освежитель или озонатор?</p><h2 class="h2">Аэрозоль, озонирование и Aromé</h2></div></div>
    <p class="lead lead-w">Аэрозоль работает минуты, озонирование — один раз и без людей. Аппарат нейтрализует запах каждый день, пока помещение открыто, а обслуживаем его мы.</p>
    ${compare()}
  </div>
</section>

<section class="sec sec-alt">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Подписка и цена</p><h2 class="h2">Аппарат, масла и&nbsp;обслуживание&nbsp;— в&nbsp;одной подписке</h2></div><a class="more" href="/ceny/">Все цены${icon('arrow')}</a></div>
    ${devices()}
    <p class="note">${TX.included.join(' · ')}. Полгода выходит дешевле, чем помесячно.</p>
    ${trialBar(this)}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Как начать</p><h2 class="h2">От заявки до свежего воздуха — один день</h2></div><a class="more" href="/kak-my-rabotaem/">Подробнее${icon('arrow')}</a></div>
    ${steps()}
  </div>
</section>
${UI.faq(homeFaq, 'Частые вопросы', this)}`;
    }
  });

  /* ── Запахи ── */
  /* ── Каталог ароматов (блок «Коллекция» на всю страницу, все 32) ── */
  add({
    path: 'aromaty/', section: 'aromaty/', pageName: 'Каталог ароматов', noCta: false,
    fonts: 'family=Inter+Tight:wght@100..900&family=Playfair+Display:ital,wght@1,400;1,500',
    title: 'Каталог ароматов для бизнеса — 32 композиции | Aromé',
    description: 'Каталог ароматов Aromé для бизнеса в Астане: 32 композиции — отельные, свежие, цветочные, гурманские, SPA и парфюмерные. Ноты, где выбирают, пробники.',
    h1: 'Каталог ароматов',
    breadcrumbs: [HOME, ['Ароматы', 'aromaty/']],
    schema: [site.schema.itemList(COL.all().map(s => [s.name, 'aromaty/']))],
    get body() {
      return UI.collection(this, COL.all(), { page: true, title: 'Каталог ароматов <em>32 композиции для бизнеса</em>', lead: 'Выберите аромат — покажем ноты и где он раскрывается лучше всего.' });
    }
  });

  add({
    path: 'zapahi/', section: 'zapahi/',
    title: `Как убрать неприятный запах в помещении: ${ODORS.length} частых случаев`,
    description: 'Туалет, канализация, кухня, табак, сырость, пот, мусор, животные, химия, ремонт, гарь, «запах больницы»: что делает с каждым запахом аппарат с маслом и сколько это стоит.',
    h1: 'Неприятные запахи в помещении',
    breadcrumbs: [HOME, ['Запахи', 'zapahi/']],
    schema: [site.schema.itemList(ODORS.map(o => [o.h1, `zapahi/${o.slug}/`]))],
    get body() {
      return UI.pageHead(this, { kicker: 'Справочник', lead: 'Выберите свой запах: расскажем, что сделает с ним аппарат, где его поставить, какие ароматы подходят и сколько это стоит.' }) + `
<section class="sec sec-t"><div class="wrap"><div class="ots ots-l">${ODORS.map(o => `<a class="ot" href="/zapahi/${o.slug}/">${icon(o.icon, 'ic ot-ic')}<span class="ot-t">${o.h1}</span><span class="ot-d">${esc(o.brief[0])}</span>${icon('arrow', 'ic ot-go')}</a>`).join('')}</div></div></section>
<section class="sec sec-alt"><div class="wrap split">
  <div class="prose">
    <h2>Почему освежитель не справляется</h2>
    <p>Освежитель перекрывает запах резким облаком, которое оседает за минуты, и неприятный запах возвращается — уже вместе с химическим. Гости чувствуют это как «здесь что-то прячут».</p>
    <p>Аппарат работает иначе: распыляет масло малыми порциями по расписанию весь день. Масло нейтрализует запах, а помещение пахнет чисто и ровно, без скачков.</p>
  </div>
  <div class="prose">
    <h2>Не знаете, что выбрать</h2>
    <p>Сравнили спрей, озонирование и аппарат в статье <a href="/stati/chem-ubrat-zapah-v-pomeshchenii/">«Чем убрать запах в помещении»</a>. Если запах возвращается каждый день, нужен аппарат.</p>
    <p>Запахи по типам помещений — в разделе <a href="/pomeshcheniya/">«Помещения»</a>, для подъездов — <a href="/osi/">страница для ОСИ и УК</a>.</p>
  </div>
</div></section>`;
    }
  });

  ODORS.forEach(o => {
    const p = `zapahi/${o.slug}/`;
    const pm = UI.setupPm(o.setup);
    add({
      path: p, section: 'zapahi/', title: o.title, description: o.description, h1: o.h1,
      breadcrumbs: [HOME, ['Запахи', 'zapahi/'], [o.name, p]],
      schema: [site.schema.faq(o.faq), site.schema.service({ name: o.h1, description: o.description, type: 'Устранение неприятных запахов', low: PM300, high: N1000.plans[0].total }, p)],
      cta: { place: o.places[0], title: `${o.short}? Напишите, где пахнет, — подберём аппарат`, wa: `Пишу про ${o.short.toLowerCase()}.` },
      get body() {
        return UI.pageHead(this, {
          kicker: 'Запахи', icon: o.icon, lead: o.lead,
          aside: `<aside class="brief"><p class="k">Цена</p><p class="brief-t">${UI.setupText(o.setup)} — от ${D.fmt(pm)} в месяц</p><p class="brief-d">${D.fmt(UI.setupMonth(o.setup))} помесячно · <b>${TRIAL.toLowerCase()}</b></p><a class="btn btn-s" href="${UI.wa(this.h1, `Пишу про ${o.short.toLowerCase()}.`)}" target="_blank" rel="noopener">${icon('wa')}Написать в WhatsApp</a></aside>`
        }) + `
<section class="sec sec-t">
  <div class="wrap split split-img">
    <div>
      <h2 class="h2">Коротко</h2>
      <ol class="causes">${o.brief.map(c => `<li>${c}</li>`).join('')}</ol>
    </div>
    ${img('odor-' + o.slug, { cls: 'side-img' })}
  </div>
</section>
<section class="sec sec-alt">
  <div class="wrap two">
    <div class="card">
      <p class="k">Что делает аппарат</p>
      <h2 class="h3">${o.short}: масло, расписание, без «смеси»</h2>
      <ul class="todo">${o.device.map(t => `<li>${icon('check')}<span>${t}</span></li>`).join('')}</ul>
    </div>
    <div class="card card-dark">
      <p class="k k-l">Где ставим</p>
      <h2 class="h3">Точка, интенсивность, расписание</h2>
      <ul class="todo">${o.where.map(t => `<li>${icon('arrow')}<span>${t}</span></li>`).join('')}</ul>
      <a class="btn" href="#zayavka">${icon('wa')}Подобрать аппарат</a>
    </div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Где встречается чаще</p><h2 class="h2">${o.short}: по типам помещений</h2></div></div>
    <div class="pts pts-s">${o.places.slice(0, 4).map(s => UI.placeTile(place(s))).join('')}</div>
  </div>
</section>
<section class="sec sec-alt">
  <div class="wrap split">
    <div><p class="k">Ароматы</p><h2 class="h2">Какие ароматы подходят</h2><p class="lead">Чистые композиции, которые не смешиваются с запахом и не утомляют за день. Аромат можно сменить при обслуживании.</p></div>
    <ul class="srs">${o.scents.map(n => UI.scentRow(D.byN(n))).join('')}</ul>
  </div>
</section>
<section class="sec">
  <div class="wrap split">
    <div>
      <p class="k">Цена</p><h2 class="h2">Сколько стоит</h2>
      <p class="lead">Обычно хватает: ${UI.setupText(o.setup)} — ${o.setup.note}. Аппарат, масло и обслуживание в подписке.</p>
      <div class="honest"><p class="honest-k">Когда нужен ещё и мастер</p><p>${o.master}</p>${o.gas ? `<p class="honest-gas">${GAS}</p>` : ''}</div>
    </div>
    ${UI.priceCard(this, o.setup, { list: false })}
  </div>
</section>
${UI.faq(o.faq, 'Частые вопросы', this)}
${UI.related('Другие запахи', ODORS.filter(x => x !== o).map(x => [x.short, `zapahi/${x.slug}/`]))}`;
      }
    });
  });

  /* ── Помещения ── */
  add({
    path: 'pomeshcheniya/', section: 'pomeshcheniya/',
    title: 'Запах в помещении по типам: кафе, подъезд, офис, раздевалка',
    description: 'Ароматизация и устранение запахов по типам помещений Астаны: кафе, тойхана, подъезд ЖК, фитнес, клиника, салон красоты, туалеты ТРЦ, офис, гостиница.',
    h1: 'Запахи и ароматизация по помещениям',
    breadcrumbs: [HOME, ['Помещения', 'pomeshcheniya/']],
    schema: [site.schema.itemList(PLACES.map(o => [o.h1, `pomeshcheniya/${o.slug}/`]))],
    get body() {
      return UI.pageHead(this, { kicker: 'Помещения', lead: 'В каждом типе помещения запах копится в своих зонах. Мы разобрали девять частых: зоны, что ставим в каждую и типовой комплект с ценой.' }) + `
<section class="sec sec-t"><div class="wrap"><div class="pts">${PLACES.map(UI.placeTile).join('')}</div></div></section>
<section class="sec sec-alt"><div class="wrap narrow prose">
  <h2>Почему важен тип помещения</h2>
  <p>Запах туалета в кафе и в подъезде похож, но аппарат ставят по-разному. В кафе он стоит в санузле и не должен спорить с едой, в подъезде — в закрытом корпусе у мусоропровода. В клинике аромат не ставят в кабинетах, а в салоне красоты — у маникюрных столов.</p>
  <p>Если вашего помещения нет в списке — склад, автомойка, школа, магазин, — напишите в заявке, где пахнет и какая площадь. Подберём аппарат и масло так же, а для квартиры есть <a href="/kvartira/">отдельная страница</a>.</p>
</div></section>`;
    }
  });

  PLACES.forEach(pl => {
    const p = `pomeshcheniya/${pl.slug}/`;
    const pm = UI.setupPm(pl.setup);
    add({
      path: p, section: 'pomeshcheniya/', title: pl.title, description: pl.description, h1: pl.h1,
      breadcrumbs: [HOME, ['Помещения', 'pomeshcheniya/'], [pl.name, p]],
      schema: [site.schema.faq(pl.faq), site.schema.service({ name: pl.h1, description: pl.description, type: 'Устранение неприятных запахов', low: pm, high: pm }, p)],
      cta: { place: pl.slug, title: `${pl.name}: напишите, где пахнет, — подберём аппарат`, wa: `Помещение: ${pl.name.toLowerCase()}.` },
      get body() {
        return UI.pageHead(this, { kicker: 'Помещения', icon: pl.icon, lead: pl.lead, aside: img('place-' + pl.slug, { cls: 'phead-img', eager: true }) }) + `
<section class="sec sec-t"><div class="wrap split">
  <div class="prose">${pl.text.map(t => `<p>${t}</p>`).join('')}${pl.slug === 'zhk-podezd' ? '<p><b>Для председателей ОСИ и УК</b> — договор, цена за подъезд и готовое объявление для собрания жильцов на <a href="/osi/">отдельной странице</a>.</p>' : ''}</div>
  ${UI.picker({ place: pl.slug, title: 'Что именно пахнет?' })}
</div></section>
<section class="sec sec-alt">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">По зонам</p><h2 class="h2">Где копится запах и что мы ставим</h2></div></div>
    <div class="zones">${pl.zones.map((z, k) => `<article class="zone"><span class="zone-n">0${k + 1}</span><h3>${z.name}</h3><p class="zone-p"><b>Что пахнет</b>${z.problem}</p><p class="zone-s"><b>Что ставим</b>${z.sol}</p></article>`).join('')}</div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Частые запахи</p><h2 class="h2">Что чаще всего пахнет: ${pl.name.toLowerCase()}</h2></div></div>
    <div class="ots ots-s">${pl.odors.map(s => UI.odorTile(odor(s))).join('')}</div>
  </div>
</section>
<section class="sec sec-alt">
  <div class="wrap split">
    <div><p class="k">Типовой комплект</p><h2 class="h2">Сколько это стоит</h2><p class="lead">Пример для типичного объекта: ${pl.setup.note}. Точный комплект считаем по описанию и планировке.</p><p class="note">Для бизнеса запах — это ещё и репутация: <a href="/stati/zapah-v-otzyvah-2gis/">как запах попадает в отзывы 2ГИС</a>.</p></div>
    ${UI.priceCard(this, pl.setup)}
  </div>
</section>
${UI.faq(pl.faq, 'Частые вопросы', this)}
${UI.related('Другие помещения', PLACES.filter(x => x !== pl).map(x => [x.name, `pomeshcheniya/${x.slug}/`]))}`;
      }
    });
  });

  /* ── Нейтрализатор запаха ── */
  const neutralFaq = [
    TX.faq.mix,
    ['Чем аппарат лучше геля или спрея?', 'Гель и спрей работают на маленькую комнату и выдыхаются за дни или минуты. Аппарат распыляет масло по расписанию на помещение до 300 или 1000 м² и работает каждый день, а заправляем его мы.'],
    ['Можно ли купить аппарат?', 'Мы работаем по подписке: аппарат в аренду, масла и обслуживание включены. Так не нужно следить за заправкой и ремонтом.'],
    TX.faq.safe
  ];
  add({
    path: 'nejtralizator-zapaha/', section: '', pageName: 'Нейтрализатор запаха',
    title: 'Нейтрализатор запаха для помещений: аппарат с маслом — Астана',
    description: `Профессиональный нейтрализатор запаха для помещений: аппарат с маслом работает каждый день по расписанию на площадь до 1000 м². Подписка от ${UI.pm(N300)} в месяц.`,
    h1: 'Нейтрализатор запаха для помещений',
    breadcrumbs: [HOME, ['Нейтрализатор запаха', 'nejtralizator-zapaha/']],
    schema: [site.schema.faq(neutralFaq), site.schema.service({ name: 'Нейтрализатор запаха для помещений', description: 'Аппарат с маслом нейтрализует запах по расписанию, по подписке', type: 'Нейтрализация запахов', low: PM300, high: N1000.plans[0].total }, 'nejtralizator-zapaha/')],
    cta: { title: 'Подберём нейтрализатор под ваш запах и площадь', wa: 'Интересует нейтрализатор запаха.' },
    get body() {
      return UI.pageHead(this, { kicker: 'Аппарат и масло', lead: 'Не баллон и не гель, а аппарат, который весь день по расписанию распыляет масло: оно нейтрализует неприятный запах и наполняет помещение ароматом. Ставим, заправляем и обслуживаем сами.', aside: img('device', { cls: 'phead-img phead-tall', eager: true }) }) + `
<section class="sec sec-t">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Чем отличается</p><h2 class="h2">Нейтрализатор, спрей, гель и озон</h2></div></div>
    <div class="arts">
      <div class="art"><span class="art-k">Спрей и автоосвежитель</span><span class="art-t">Облако на минуты</span><span class="art-d">Резко перекрывает запах и быстро оседает. Баллоны меняете сами, хватает на маленькую комнату.</span></div>
      <div class="art"><span class="art-k">Гель и саше</span><span class="art-t">Слабо и недолго</span><span class="art-d">Работает на шкаф или маленький санузел, выдыхается за несколько дней, интенсивность не настроить.</span></div>
      <div class="art"><span class="art-k">Озон и «сухой туман»</span><span class="art-t">Разово и без людей</span><span class="art-d">Глубокая обработка пустого помещения. Если запах приходит снова, через несколько дней всё повторяется.</span></div>
    </div>
  </div>
</section>
<section class="sec sec-alt">
  <div class="wrap split">
    <div><p class="k">Как работает</p><h2 class="h2">Постоянно, по расписанию, на всё помещение</h2>${how()}</div>
    <div class="prose">
      <h2>Аппарат и масло</h2>
      <p><b>Nova 300</b> — для санузла, раздевалки, кабинета или зала до 300 м². <b>Nova 1000</b> — для зала, фойе или паркинга до 1000 м², расписание настраивается со смартфона.</p>
      <p>Масло подбираем под запах: для туалета и канализации — свежие композиции, для кухни — цитрус и зелёный чай, для табака — древесные. Всего в каталоге 32 аромата.${oilLine}</p>
      <p>Если запах от поломки — протечки, сломанного сифона, — нейтрализатор поможет, но источник лучше устранить мастеру.</p>
    </div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Цена</p><h2 class="h2">Нейтрализатор по подписке</h2></div><a class="more" href="/ceny/">Все цены${icon('arrow')}</a></div>
    ${devices()}
    ${trialBar(this)}
  </div>
</section>
${UI.faq(neutralFaq, 'Частые вопросы', this)}`;
    }
  });

  /* ── Для ОСИ и УК ── */
  const osiFaq = [
    ['Как оформляется работа с ОСИ?', 'Договор с ОСИ или управляющей компанией, оплата за выбранный период и акт каждый месяц.'],
    ['Как убедить соседей?', 'Скачайте готовое объявление для собрания жильцов: в нём объяснено, как работает аппарат, сколько стоит подъезд и сколько выходит с квартиры.'],
    ['Не украдут ли аппарат?', 'Ставим его в закрытом корпусе на высоте, вне досягаемости. Если аппарат сломают, заменим.'],
    ['Можно ли сначала попробовать?', `Да: ${TRIAL.toLowerCase()}. Можно проверить результат до голосования.`]
  ];
  add({
    path: 'osi/', section: '', pageName: 'Для ОСИ и УК',
    title: 'Запах в подъезде: ароматизация дома по договору для ОСИ и УК',
    description: `Ароматизация подъездов для ОСИ и управляющих компаний Астаны: аппарат у входа, в лифтовом холле и у мусоропровода. От ${D.fmt(PM300)} в месяц за подъезд, договор и акт.`,
    h1: 'Ароматизация подъездов для ОСИ и УК',
    breadcrumbs: [HOME, ['Для ОСИ и УК', 'osi/']],
    schema: [site.schema.faq(osiFaq), site.schema.service({ name: 'Ароматизация подъездов для ОСИ и УК', description: 'Аппарат с маслом в подъезде по договору', type: 'Устранение неприятных запахов', low: PM300, high: N1000.plans[0].total }, 'osi/')],
    cta: { place: 'zhk-podezd', title: 'Посчитаем ваш дом: сколько подъездов и где пахнет', wa: 'Я из ОСИ, хочу посчитать дом.' },
    get body() {
      return UI.pageHead(this, { kicker: 'Для ОСИ и УК', icon: 'building', lead: 'Жильцы жалуются на запах мусоропровода, мочи у входа или подвала? Ставим аппарат в подъезд по договору: он каждый день нейтрализует запах, а масла и обслуживание — наши.', aside: img('place-zhk-podezd', { cls: 'phead-img', eager: true }) }) + `
<section class="sec sec-t">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Где ставим</p><h2 class="h2">Четыре точки, где в доме копится запах</h2></div></div>
    <div class="zones">${[
      ['Вход и тамбур', 'Моча, улица, первое впечатление', 'Nova 300 в закрытом корпусе'],
      ['Лифтовые холлы', 'Запах мусоропровода и подвала поднимается лифтом', 'Nova 300 у лифтов первого этажа'],
      ['У мусоропровода', 'Главный источник запаха летом', 'Nova 300 на площадке, летом интенсивнее'],
      ['Паркинг', 'Выхлоп и сырость', 'Nova 1000 у выхода к лифтам']
    ].map(([n, pr, s], k) => `<article class="zone"><span class="zone-n">0${k + 1}</span><h3>${n}</h3><p class="zone-p"><b>Что пахнет</b>${pr}</p><p class="zone-s"><b>Что ставим</b>${s}</p></article>`).join('')}</div>
  </div>
</section>
<section class="sec sec-alt">
  <div class="wrap split">
    <div>
      <p class="k">Цена за подъезд</p><h2 class="h2">Сколько стоит подъезд в месяц</h2>
      <p class="lead">Обычно на подъезд хватает одного Nova 300 у входа или лифтового холла. При ${flats} квартирах это около ${D.fmt(PM300 / flats)} в месяц с квартиры.</p>
      <div class="prose"><h3>Договор и акт</h3><p>Работаем по договору с ОСИ или управляющей компанией. Каждый месяц — акт. Аппарат, масла, настройка и замена при поломке входят в оплату, жильцам ничего делать не нужно.</p></div>
    </div>
    ${UI.priceCard(this, { n300: 1, n1000: 0, note: 'один подъезд' })}
  </div>
</section>
<section class="sec" id="obyavlenie">
  <div class="wrap split">
    <div>
      <p class="k">Для собрания жильцов</p><h2 class="h2">Готовое объявление для соседей</h2>
      <p class="lead">Председателю нужно убедить соседей. Мы подготовили объявление: как работает аппарат, кто обслуживает, сколько стоит подъезд и квартира. Замените поля в квадратных скобках и распечатайте или отправьте в чат дома.</p>
      <div class="hero-btns"><a class="btn" href="/assets/osi-obyavlenie.txt" download data-osi>${icon('download')}Скачать объявление</a><button class="btn btn-line" type="button" data-copy="#osi-text" data-osi>${icon('copy')}Скопировать текст</button></div>
    </div>
    <pre class="osi-t" id="osi-text">${esc(OSI_TEMPLATE)}</pre>
  </div>
</section>
${UI.faq(osiFaq, 'Частые вопросы', this)}`;
    }
  });

  /* ── Для дома ── */
  const homeSetup = { n300: 1, n1000: 0, note: 'гостиная или прихожая' };
  const flatFaq = [
    ['Аппарат не будет шуметь ночью?', 'Он тихий, а на ночь расписание можно выключить: аппарат работает, когда вы дома и не спите.'],
    ['Это безопасно для детей и питомцев?', 'Интенсивность ставим минимальную, композиции мягкие, а аппарат — вне досягаемости. Если кому-то мешает, меняем аромат без доплаты.'],
    TX.faq.pipe,
    ['Можно ли взять на месяц?', `Да, минимальный срок — месяц: ${D.fmt(N300.plans[0].total)} за Nova 300. При оплате за полгода — ${D.fmt(PM300)} в месяц.`]
  ];
  add({
    path: 'kvartira/', section: '', pageName: 'Для дома',
    title: 'Неприятный запах в квартире: табак, животные, сырость — Астана',
    description: `Как убрать запах табака, животных или сырости в квартире: аппарат с маслом нейтрализует его каждый день. Nova 300 от ${UI.pm(N300)} в месяц, ${TRIAL.toLowerCase()}.`,
    h1: 'Неприятный запах в квартире: табак, животные, сырость',
    breadcrumbs: [HOME, ['Для дома', 'kvartira/']],
    schema: [site.schema.faq(flatFaq), site.schema.service({ name: 'Устранение запаха в квартире', description: 'Аппарат с маслом для квартиры по подписке', type: 'Устранение неприятных запахов', low: PM300, high: N300.plans[0].total }, 'kvartira/')],
    cta: { place: 'kvartira', title: 'Напишите, чем пахнет дома, — подберём аромат', wa: 'Пишу про запах в квартире.' },
    get body() {
      return UI.pageHead(this, { kicker: 'Для дома', icon: 'home', lead: 'Табак от прежних жильцов, кошка или собака, сырость в старом доме. Компактный аппарат каждый день нейтрализует запах и наполняет квартиру ароматом, а заправляем его мы.', aside: img('kvartira', { cls: 'phead-img', eager: true }) }) + `
<section class="sec sec-t">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Чем пахнет дома</p><h2 class="h2">Три частых запаха в квартире</h2></div></div>
    <div class="arts">${[
      ['tabaka', 'Табак', 'Запах дыма въедается в шторы и мебель и пахнет даже после ремонта. Аппарат держит в квартире тёплый древесный аромат вместо прокуренного.'],
      ['zhivotnyh', 'Животные', 'Кошачий лоток, собака после прогулки. Мягкий чистый аромат с минимальной интенсивностью нейтрализует запах и не раздражает питомца.'],
      ['syrosti', 'Сырость', 'Затхлый запах в старом доме, на первом этаже или в ванной. Свежая композиция весь день держит ощущение проветренной квартиры.']
    ].map(([s, t, d]) => `<a class="art" href="/zapahi/${s}/"><span class="art-k">${icon(odor(s).icon)} ${t}</span><span class="art-t">${odor(s).short}</span><span class="art-d">${d}</span></a>`).join('')}</div>
  </div>
</section>
<section class="sec sec-alt">
  <div class="wrap split">
    <div>
      <p class="k">Аппарат для квартиры</p><h2 class="h2">Один Nova 300 на квартиру</h2>
      <div class="prose"><p>Аппарат ставим в гостиной или прихожей — оттуда аромат расходится по квартире. Он распыляет масло по расписанию: когда вы дома, чаще, ночью — по вашему выбору.</p><p>Масло подбираем под запах, заправляем и меняем аппарат при поломке. Вам не нужно покупать баллоны и следить за заправкой.</p><p>Если запах от протечки или сломанного сифона, аппарат с ним поможет, но саму поломку лучше устранить сантехнику.</p></div>
    </div>
    ${UI.priceCard(this, homeSetup)}
  </div>
</section>
${UI.faq(flatFaq, 'Частые вопросы', this)}`;
    }
  });

  /* ── Как работаем ── */
  const howFaq = [
    TX.faq.pipe,
    ['Что нужно от нас для установки?', 'Место для аппарата и розетка рядом. Остальное — подбор масла, настройка расписания и заправка — на нас.'],
    ['Как часто вы приезжаете?', 'По графику заправки масла. Если аппарат сломался или аромат не подошёл, приедем вне графика.'],
    TX.faq.change
  ];
  add({
    path: 'kak-my-rabotaem/', section: 'kak-my-rabotaem/',
    title: 'Как мы работаем: заявка, подбор аппарата, установка, обслуживание',
    description: 'Как работает Aromé: заявка, подбор аппарата и масла под запах, установка в день обращения, настройка интенсивности и обслуживание по графику. Без осмотров и ремонта.',
    h1: 'Как мы работаем',
    breadcrumbs: [HOME, ['Как работаем', 'kak-my-rabotaem/']],
    schema: [site.schema.faq(howFaq)],
    get body() {
      return UI.pageHead(this, { kicker: 'Пять шагов', lead: 'Мы не ищем причину и ничего не ремонтируем. Подбираем аппарат и масло под ваш запах, ставим в день обращения и обслуживаем, пока действует подписка.', aside: img('metod', { cls: 'phead-img', eager: true }) }) + `
<section class="sec sec-t"><div class="wrap">${steps(STEPS_FULL)}</div></section>
<section class="sec sec-alt"><div class="wrap two">
  <div class="card">
    <p class="k">Что делаем мы</p>
    <h2 class="h3">Всё, что связано с аппаратом</h2>
    <ul class="todo">${['Подбираем аппарат по площади: Nova 300 или Nova 1000', 'Подбираем масло под запах — можно понюхать перед установкой', 'Ставим аппарат туда, где запах копится', 'Настраиваем расписание и интенсивность под часы работы', 'Заправляем масло по графику и меняем аппарат при поломке'].map(t => `<li>${icon('check')}<span>${t}</span></li>`).join('')}</ul>
  </div>
  <div class="card">
    <p class="k">Чего мы не делаем</p>
    <h2 class="h3">Честная граница</h2>
    <ul class="todo">${['Не ремонтируем сантехнику и вентиляцию', 'Не делаем озонирование и обработку от плесени', 'Не обещаем «убрать навсегда»: аппарат помогает справиться с запахом каждый день', 'Если запах от поломки, советуем позвать мастера — так результат будет лучше'].map(t => `<li>${icon('arrow')}<span>${t}</span></li>`).join('')}</ul>
  </div>
</div></section>
<section class="sec sec-dark">
  <div class="wrap">
    <div class="sec-head"><div><p class="k k-l">Честно о способах</p><h2 class="h2">Аэрозоль, озонирование и аппарат</h2></div></div>
    ${compare()}
    <p class="note note-d">Подробнее — в статье <a href="/stati/chem-ubrat-zapah-v-pomeshchenii/">«Чем убрать запах в помещении»</a>.</p>
  </div>
</section>
${UI.faq(howFaq, 'Частые вопросы', this)}`;
    }
  });

  /* ── Цены ── */
  const priceFaq = [
    ['Можно ли сначала попробовать?', `Да: ${TRIAL.toLowerCase()}. Поставим аппарат, а вы решите, оставлять ли его.`],
    ['Нужно ли покупать аппарат?', 'Нет. Аппарат выдаётся в аренду, масла и обслуживание входят в подписку.'],
    TX.faq.contract,
    ['Можно ли поставить аппарат только в туалет?', 'Да, это частый случай. Одного компактного Nova 300 хватает на санузел с несколькими кабинками.']
  ];
  add({
    path: 'ceny/', section: 'ceny/',
    title: 'Цены на устранение запахов и ароматизацию в Астане — Aromé',
    description: `Цены на устранение запахов: Nova 300 от ${UI.pm(N300)}, Nova 1000 от ${UI.pm(N1000)} в месяц. Аренда аппарата, масла и обслуживание в подписке, ${TRIAL.toLowerCase()}.`,
    h1: 'Цены',
    breadcrumbs: [HOME, ['Цены', 'ceny/']],
    schema: [site.schema.faq(priceFaq), site.schema.service({ name: 'Устранение неприятных запахов в помещениях', description: 'Аппарат с маслом и обслуживание по подписке', low: PM300, high: N1000.plans[2].total }, 'ceny/')],
    get body() {
      return UI.pageHead(this, { kicker: 'Подписка', lead: 'Вы не покупаете оборудование. Платите за подписку: аппарат в аренду, масла, настройка и обслуживание. Чем длиннее срок, тем ниже цена в месяц.' }) + `
<section class="sec sec-t"><div class="wrap">${devices()}<p class="note">${TX.included.join(' · ')}.</p>${trialBar(this)}</div></section>
<section class="sec sec-alt">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Примеры</p><h2 class="h2">Типовые комплекты по помещениям</h2></div></div>
    <div class="kits">${[...PLACES.map(pl => [pl.icon, pl.name, pl.setup, `pomeshcheniya/${pl.slug}/`]), ['home', 'Квартира', homeSetup, 'kvartira/']].map(([ic, n, s, h]) => `<a class="kit" href="/${h}"><span class="kit-t">${icon(ic)}${n}</span><span class="kit-n">${s.note}</span><span class="kit-s">${UI.setupText(s)}</span><b class="kit-p">${D.fmt(UI.setupPm(s))}<small> / мес</small></b></a>`).join('')}</div>
    <p class="note">Цена в месяц при подписке на 6 месяцев. Подъезды для ОСИ — <a href="/osi/">цена за подъезд</a>.</p>
  </div>
</section>
<section class="sec"><div class="wrap narrow prose">
  <h2>Из чего складывается цена</h2>
  <p>Цена зависит только от числа и типа аппаратов и срока подписки. Nova 300 закрывает помещение до 300 м² или отдельный санузел, раздевалку, кабинет. Nova 1000 — зал до 1000 м², лобби, фойе тойханы или паркинг.</p>
  <p>Каждое закрытое помещение — туалет, раздевалка, коридор этажа — обычно получает свой аппарат: аромат плохо проходит через закрытые двери. Сколько аппаратов нужно, скажем по описанию: где пахнет и какая площадь.</p>
</div></section>
${UI.faq(priceFaq, 'Частые вопросы', this)}`;
    }
  });

  /* ── Статьи ── */
  add({
    path: 'stati/', section: 'stati/',
    title: 'Статьи о запахах в помещениях: чем убрать, отзывы, зима',
    description: 'Статьи Aromé о неприятных запахах: чем убрать запах в помещении — спрей, озон или аппарат, как отвечать на отзывы о запахе в 2ГИС и почему зимой пахнет сильнее.',
    h1: 'Статьи',
    breadcrumbs: [HOME, ['Статьи', 'stati/']],
    schema: [site.schema.itemList(ARTICLES.map(a => [a.title, `stati/${a.slug}/`]))],
    get body() {
      return UI.pageHead(this, { kicker: 'Разбираемся в запахах', lead: 'Практические статьи для владельцев и управляющих: чем убрать запах, что делать с отзывами о запахе и как пережить зиму с закрытыми окнами.' }) + `
<section class="sec sec-t"><div class="wrap"><div class="arts arts-l">${ARTICLES.map(a => `<a class="art" href="/stati/${a.slug}/"><span class="art-k">${dateRu(a.date)} · ${a.read} мин</span><span class="art-t">${a.h1}</span><span class="art-d">${esc(a.lead)}</span></a>`).join('')}</div></div></section>`;
    }
  });

  ARTICLES.forEach(a => {
    const p = `stati/${a.slug}/`;
    add({
      path: p, section: 'stati/', title: a.title, description: a.description, h1: a.h1, ogType: 'article', updated: a.date,
      breadcrumbs: [HOME, ['Статьи', 'stati/'], [a.h1, p]],
      schema: [site.schema.article(a, p)],
      get body() {
        return UI.pageHead(this, { kicker: `${dateRu(a.date)} · ${a.read} мин чтения`, lead: a.lead }) + `
<section class="sec sec-t"><div class="wrap narrow prose prose-art">${a.body}</div></section>
${UI.related('Другие статьи', ARTICLES.filter(x => x !== a).map(x => [x.h1, `stati/${x.slug}/`]))}`;
      }
    });
    /* старые адреса заменённых статей → новая статья */
    (a.moved || []).forEach(m => add({
      path: `stati/${m}/`, noindex: true, noCta: true, redirect: p,
      title: `Статья переехала — ${m}`, description: `Статья «${m}» заменена новой: «${a.h1}». Переходим на неё автоматически.`
    }));
  });

  /* ── Вопросы ── */
  const allFaq = [
    TX.faq.mix, TX.faq.help, TX.faq.pipe, TX.faq.safe, TX.faq.start, priceFaq[0], priceFaq[1], TX.faq.contract, TX.faq.change,
    ['Вы ищете причину запаха или ремонтируете?', 'Нет. Мы ставим аппарат и заправляем его маслом: он нейтрализует запах и наполняет помещение ароматом. Ремонт сантехники и вентиляции — работа мастеров.'],
    ['Работаете ли вы с ОСИ и управляющими компаниями?', 'Да, обслуживаем подъезды по договору с актом каждый месяц. Цена за подъезд и объявление для собрания жильцов — на странице для ОСИ.'],
    ['Можно ли поставить аппарат дома?', 'Да, один компактный Nova 300 на квартиру — для запаха табака, животных или сырости.']
  ];
  add({
    path: 'voprosy/', section: '',
    title: 'Вопросы об устранении запахов и ароматизации — Aromé',
    description: 'Ответы на частые вопросы: не будет ли смеси запахов, поможет ли аппарат, что входит в подписку, безопасность ароматов, тест 3 дня, договор и работа с ОСИ в Астане.',
    h1: 'Вопросы и ответы',
    breadcrumbs: [HOME, ['Вопросы', 'voprosy/']],
    schema: [site.schema.faq(allFaq)],
    get body() {
      return UI.pageHead(this, { kicker: 'Помощь', lead: 'Собрали вопросы, которые чаще всего задают владельцы кафе, салонов, клиник, председатели ОСИ и жильцы. Если вашего нет — напишите в WhatsApp.' }) + `
<section class="sec sec-t"><div class="wrap faq-w"><div class="faq">${allFaq.map(([q, a]) => `<details><summary><span>${esc(q)}</span>${icon('plus')}</summary><p>${a}</p></details>`).join('')}</div></div></section>`;
    }
  });

  /* ── Контакты и служебные ── */
  add({
    path: 'kontakty/', section: 'kontakty/',
    title: 'Контакты Aromé — устранение запахов в помещениях, Астана',
    description: `Контакты Aromé в Астане: ${C.phone}, WhatsApp, ${C.street}. Напишите, где пахнет, — подберём аппарат и установим в день обращения.`,
    h1: 'Контакты',
    breadcrumbs: [HOME, ['Контакты', 'kontakty/']],
    schema: [site.schema.business(C)],
    get body() {
      return UI.pageHead(this, { kicker: 'Связь', lead: 'Быстрее всего — WhatsApp: напишите, где пахнет и какая площадь. Ответим за 15 минут в рабочее время и подберём аппарат.' }) + `
<section class="sec sec-t"><div class="wrap"><div class="cts">
  <a class="ct" href="tel:${C.phoneRaw}"><span class="k">Телефон</span><b>${C.phone}</b></a>
  <a class="ct" href="${UI.wa(this.h1)}" target="_blank" rel="noopener"><span class="k">WhatsApp</span><b>Написать</b></a>
  <a class="ct" href="${C.map2gis}" target="_blank" rel="noopener"><span class="k">Адрес</span><b>${C.address}</b></a>
  <div class="ct"><span class="k">Время работы</span><b>${C.hours}</b></div>
</div></div></section>
<section class="sec"><div class="wrap narrow prose"><h2>Что написать, чтобы мы быстрее подобрали аппарат</h2><ul><li>Тип помещения: туалет, кафе, подъезд, раздевалка, офис, квартира.</li><li>Примерную площадь.</li><li>Где и чем пахнет сильнее всего.</li><li>Хотите ли сначала тест — ${TRIAL.toLowerCase()}.</li></ul><p>Мы работаем по всей Астане. После установки аппарат обслуживает наш специалист: заправляет масло по графику и следит за работой.</p></div></section>`;
    }
  });
  add({
    path: 'politika-konfidencialnosti/', noindex: true, noCta: true,
    title: 'Политика конфиденциальности — Aromé',
    description: 'Политика обработки персональных данных сайта Aromé: какие данные мы получаем через формы и мессенджеры и как их используем.',
    h1: 'Политика конфиденциальности',
    breadcrumbs: [HOME, ['Политика', 'politika-konfidencialnosti/']],
    get body() {
      return UI.pageHead(this, {}) + `<section class="sec sec-t"><div class="wrap narrow prose"><p>На этом сайте нет личных кабинетов и баз данных: ничего из того, что вы вводите в форму или подбор, не сохраняется на сервере. Форма лишь собирает текст, а отправляете его вы сами — через WhatsApp.</p><p>Помещение, площадь и телефон нужны нам только для ответа, установки и договора. Третьим лицам мы их не передаём, если этого не требует закон Республики Казахстан. Попросить удалить переписку можно по телефону ${C.phone}.</p></div></section>`;
    }
  });
  add({
    path: '404.html', noindex: true, noCta: true,
    title: 'Страница не найдена — Aromé', description: 'Такой страницы нет. Вернитесь на главную Aromé или выберите запах в справочнике.',
    body: `<section class="phead nf"><div class="wrap"><p class="k">Ошибка 404</p><h1>Здесь ничем не пахнет</h1><p class="lead">Такой страницы нет. Вернитесь на главную или откройте справочник запахов.</p><div class="hero-btns"><a class="btn" href="/">На главную ${icon('arrow')}</a><a class="btn btn-line" href="/zapahi/">Справочник запахов</a></div></div></section>`
  });
}

module.exports = { register, OSI_TEMPLATE };
