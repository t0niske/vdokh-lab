/* Страницы Aromé — ароматизация пространств для бизнеса в Астане (позиционирование с 28.10.2026:
   аромат создаёт атмосферу, а не убирает запахи). Главная, «Пространства» и 13 страниц форматов (src/spaces.js),
   коллекция ароматов, «Метод», «Цены», блог, вопросы, контакты. Старые адреса «Запахов» ведут на «Пространства». */
const D = require('../lib/data');
const { esc } = require('../lib/engine');
const UI = require('./ui');
const ODORS = require('./odors');
const SPACE_PAGES = require('./spaces');
const ARTICLES = require('./articles');
const CFG = require('./config');
const TX = require('./texts');
const COL = require('./collection');
/* Дата последней содержательной правки страниц (видна на странице и в sitemap). Аудит DrMax — 29.10.2026 */
const CONTENT_DATE = '2026-10-29';
/* Боевая сборка для arome-marketing.kz: служебных «страница переехала» там нет — у домена нет старых адресов */
const PROD = process.env.SITE === 'prod';
const { icon, OFFER, TRIAL, C } = UI;

const HOME = ['Главная', ''];
const dateRu = d => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '');
const N300 = D.devices[0], N1000 = D.devices[1];
const PM300 = D.perMonth(N300.plans[2]);

function register(site) {
  const { add, img } = site;

  /* ── Главная ── */
  /* вопросы главной — про атмосферу и подписку; ответы — из data.js, без обещаний роста продаж */
  const FQ = q => D.faq.find(f => f[0] === q);
  const homeFaq = [
    ['Как аромат влияет на продажи?', 'Подходящий аромат делает пространство комфортнее: гости дольше остаются и&nbsp;выше оценивают товары и&nbsp;сервис. Это показывают исследования, но&nbsp;эффект зависит от&nbsp;аромата, пространства и&nbsp;интенсивности — поэтому начинаем с&nbsp;бесплатного теста'],
    FQ('Нужно ли покупать оборудование?'),
    FQ('Сколько диффузоров нужно на помещение?'),
    ['Сколько это стоит?', `Подписка на&nbsp;Nova 300 — от&nbsp;${UI.pm(N300)} в&nbsp;месяц при оплате за&nbsp;6&nbsp;месяцев или ${D.fmt(N300.plans[0].total)} помесячно. Аппарат, масла и&nbsp;обслуживание включены, первые ${D.trialDays}&nbsp;дня бесплатно`],
    FQ('Как быстро запускается ароматизация?'),
    FQ('Что, если аромат не подойдёт?'),
    FQ('Безопасны ли ароматы для людей и животных?'),
    FQ('Как заключается договор?')
  ];
  add({
    path: '', section: '', priority: '1.0', bodyClass: 'home', pageName: 'Главная', ownHeader: true, leadForm: true,
    title: 'Ароматизация помещений для бизнеса в Астане | Aromé', updated: CONTENT_DATE,
    description: `Ароматизация помещений для бизнеса в Астане: подбор аромата, установка в вентиляцию и обслуживание. От ${UI.pm(N300)} в месяц, тест 3 дня бесплатно.`,
    schema: [site.schema.website(), site.schema.business({ ...C, street: '' }), site.schema.faq(homeFaq.map(([q, a]) => [q, a.replace(/&nbsp;/g, ' ')]))],
    get body() {
      return `
<section class="hx" id="hx">
  <div class="hx-sl" data-scroll-x>${img('hero-s1', { cls: 'hx-i', eager: true })}${img('hero-s2', { cls: 'hx-i' })}${img('hero-s3', { cls: 'hx-i' })}</div>
  <div class="hx-shade"></div>
  <div class="hx-lines" aria-hidden="true"><span></span></div>
  ${UI.hxHeader(this)}
  <div class="hx-txt">
    <h1><span class="hx-s1">Ароматизация помещений</span> <span class="hx-s2">для бизнеса в&nbsp;Астане</span></h1>
    <p class="hx-lead">Подберём аромат под характер вашего бизнеса, установим оборудование в&nbsp;вентиляцию и&nbsp;возьмём обслуживание на&nbsp;себя</p>
    <div class="hx-btns"><a class="hx-btn hx-btn-a" href="#zayavka" data-test>Попробовать 3 дня бесплатно</a><a class="hx-btn hx-btn-g" href="/ceny/">Посмотреть стоимость</a></div>
  </div>
  <p class="hx-word" aria-hidden="true">Aromé</p>
  <div class="hx-tb" aria-hidden="true"><span class="hx-num">01 <em>/ 03</em></span><span class="hx-name">Салоны красоты и SPA</span><span class="hx-bars"><i class="on"></i><i></i><i></i></span></div>
</section>

<section class="ab" id="o-nas">
  <div class="ab-g">
    <div class="ab-l">
      <p class="ab-k">о нас</p>
      <div class="ab-map"><img class="ab-kz" src="/assets/img/kz-map.svg" alt="Карта Казахстана с отметкой Астаны" width="2796" height="1532" loading="lazy"><span class="ab-pin" style="left:60.7%;top:29.8%"><i aria-hidden="true"></i><b>Астана</b></span></div>
    </div>
    <div class="ab-txt">
      <h2 class="ab-h">Aromé — ароматизация, <em>о которой не нужно думать</em></h2>
      <p>Мы — сервис профессиональной ароматизации коммерческих помещений в Астане. Подбираем аромат под характер бизнеса, подключаем аппарат к вентиляции и обслуживаем его по подписке: меняем масла, следим за работой, заменяем при поломке</p>
      <p class="ab-m">Наша миссия — чтобы аромат стал такой же продуманной частью пространства, как свет и музыка</p>
    </div>
  </div>
</section>

${UI.method()}

${UI.device()}

<section class="sp" id="prodazhi">
  <div class="sp-wrap">
    <p class="sp-k">аромат и&nbsp;продажи</p>
    <div class="sp-top">
      <h2 class="sp-h">Как&nbsp;аромат <em>может помочь продажам</em></h2>
      <p class="sp-lead">Подходящий аромат может повлиять на&nbsp;впечатление от&nbsp;товаров, желание купить и&nbsp;время, проведённое в&nbsp;магазине. Эти эффекты изучают в&nbsp;реальных торговых пространствах и&nbsp;экспериментах</p>
    </div>

    <div class="sp-rows">
      <div class="sp-row">
        <h3>01. Тратят больше</h3>
        <p>Эксперимент в&nbsp;магазине товаров для&nbsp;дома: 18&nbsp;дней, больше 400&nbsp;покупателей, лёгкий апельсиновый аромат</p>
        <p class="sp-res">Результат: когда в&nbsp;зале был аромат, покупатели тратили <b>в&nbsp;среднем на&nbsp;20% больше</b><a class="sp-src" href="https://doi.org/10.1016/j.jretai.2012.08.002" target="_blank" rel="noopener">Herrmann и&nbsp;др., Journal of Retailing, 2013</a></p>
      </div>
      <div class="sp-row">
        <h3>02. Охотнее покупают</h3>
        <p>Обзор 64&nbsp;экспериментов с&nbsp;приятными ароматами в&nbsp;магазинах и&nbsp;сервисе</p>
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
      <div><div class="sp-n" data-to="64">64</div><p>эксперимента с&nbsp;ароматами<br>вошли в&nbsp;обзор</p></div>
      <div><div class="sp-n" data-to="3">3</div><p>дня бесплатного теста<br>в&nbsp;вашем помещении</p></div>
    </div>

    <div class="sp-cta">
      <a class="sp-btn" href="#zayavka">Подобрать аромат для&nbsp;бизнеса</a>
      <p class="sp-cta-n">Сначала подберём аромат и&nbsp;дадим <b>3&nbsp;дня</b> бесплатно проверить его&nbsp;у вас</p>
    </div>
    <p class="sp-note">Это&nbsp;результаты исследований, а&nbsp;не обещание роста продаж: эффект зависит от&nbsp;аромата, пространства и&nbsp;интенсивности. Бесплатный тест показывает, как&nbsp;аромат и&nbsp;система работают у&nbsp;вас; чтобы измерить влияние на&nbsp;продажи, нужен отдельный период наблюдения</p>
  </div>
</section>

${UI.collection(this, COL.top())}

${UI.spaces(this)}


${UI.versus()}

${UI.pricing()}

${UI.stages()}

${UI.faqHome(homeFaq, this)}`;
    }
  });

  /* ── Коллекция ароматов (28.10.2026): каталог-плашки по идее референса, UI.catalog ── */
  add({
    path: 'aromaty/', section: 'aromaty/', pageName: 'Коллекция ароматов', leadForm: true,
    title: 'Каталог ароматов для бизнеса — 32 композиции | Aromé', updated: CONTENT_DATE,
    description: 'Каталог ароматов Aromé для бизнеса в Астане: 32 композиции — отельные, свежие, цветочные, гурманские, SPA и парфюмерные. Ноты, где выбирают, пробники.',
    h1: 'Коллекция: 32 аромата для бизнеса',
    breadcrumbs: [HOME, ['Коллекция', 'aromaty/']],
    schema: [site.schema.itemList(COL.all().map(s => [s.name, 'aromaty/']))],
    get body() {
      return UI.catalog(this);
    }
  });

  /* ── Запахи и нейтрализатор (28.10.2026): Aromé не занимается устранением запахов — старые адреса ведут на «Пространства» ── */
  const gone = (path, name) => PROD ? null : add({
    path, noindex: true, noCta: true, redirect: 'pomeshcheniya/',
    title: `${name} — страница переехала | Aromé`,
    description: `Страница «${name}» больше не используется: Aromé занимается ароматизацией пространств для бизнеса. Переходим в раздел «Пространства».`
  });
  gone('zapahi/', 'Запахи');
  ODORS.forEach(o => gone(`zapahi/${o.slug}/`, o.name));
  gone('nejtralizator-zapaha/', 'Нейтрализатор запаха');

  /* ── Помещения ── */
  /* Пространства (вариант A, согласован 28.10.2026): все форматы карточками, «Как подбираем», заявка */
  add({
    path: 'pomeshcheniya/', section: 'pomeshcheniya/', pageName: 'Пространства', leadForm: true,
    title: 'Ароматизация по типу помещения: 13 форматов | Aromé', updated: CONTENT_DATE,
    description: 'Ароматизация магазинов, салонов и SPA, отелей, ресторанов, офисов, автосалонов, тойхан, ЖК и клиник в Астане: подбор аромата, установка и сервис.',
    h1: 'Ароматизация по типу помещения',
    breadcrumbs: [HOME, ['Пространства', 'pomeshcheniya/']],
    schema: [site.schema.itemList(UI.SPACES.filter(s => s[2].startsWith('/')).map(s => [s[1].replace(/&nbsp;/g, ' '), s[2].slice(1)]))],
    get body() {
      return UI.pageTop(this, {
        h1: 'Ароматизация <em>по типу помещения</em>',
        lead: 'Аромат работает вместе с&nbsp;интерьером, светом и&nbsp;музыкой. Для&nbsp;каждого формата подбираем свою композицию, интенсивность и&nbsp;расписание'
      }) + `
${UI.spaceGrid()}

${UI.spaceHow()}`;
    }
  });

  /* ── Страницы пространств (28.10.2026): шаблон UI.spacePage, данные — src/spaces.js. Адреса старых помещений сохранены ── */
  SPACE_PAGES.forEach(sp => add({
    path: sp.path, section: 'pomeshcheniya/', pageName: sp.name, leadForm: true, updated: CONTENT_DATE,
    title: sp.title, description: sp.description, h1: sp.h1.replace(/<\/?em>/g, ''),
    breadcrumbs: [HOME, ['Пространства', 'pomeshcheniya/'], [sp.name, sp.path]],
    schema: [site.schema.faq(sp.faq), site.schema.service({ name: `Ароматизация: ${sp.name.toLowerCase()}`, description: sp.description, type: 'Ароматизация помещений', low: UI.setupPm(sp.setup), high: UI.setupMonth(sp.setup) }, sp.path)],
    get body() { return UI.spacePage(this, sp); }
  }));

  /* ── Метод (согласован 28.10.2026): как работает аппарат, блок «Аппарат» с главной, расписание по часам, этапы, кто что делает, вопросы, заявка ── */
  const howFaq = [
    ['Как быстро запускается ароматизация?', 'Обычно в&nbsp;день обращения: подбираем аромат, привозим аппарат и&nbsp;запускаем, если рядом с&nbsp;местом установки есть розетка'],
    ['Как часто вы приезжаете?', 'По&nbsp;графику заправки масла. Если аппарат сломался или аромат не&nbsp;подошёл, приедем вне графика'],
    ['Сколько аппаратов нужно на помещение?', `${N300.name} рассчитан на&nbsp;площадь до&nbsp;${N300.area}&nbsp;м², ${N1000.name} — до&nbsp;${N1000.area}&nbsp;м². Аппарат подключаем к&nbsp;вентиляции, поэтому количество зависит ещё и&nbsp;от&nbsp;того, сколько в&nbsp;здании отдельных систем вентиляции`],
    ['Безопасны ли ароматы для людей и животных?', 'Да. Используются парфюмерные составы для профессиональных диффузоров, рассчитанные на&nbsp;длительное нахождение людей и&nbsp;домашних животных в&nbsp;помещении'],
    ['Что, если аромат не подойдёт?', 'Подберём другой аромат из&nbsp;коллекции. Замена аромата входит в&nbsp;обслуживание']
  ];
  add({
    path: 'kak-my-rabotaem/', section: 'kak-my-rabotaem/', pageName: 'Метод', leadForm: true,
    title: 'Ароматизация через вентиляцию: как это работает | Aromé', updated: CONTENT_DATE,
    description: 'Аппарат Nova подключаем к приточной вентиляции: аромат расходится по воздуховодам по расписанию ваших часов. Масла и сервис — по подписке.',
    h1: 'Ароматизация через вентиляцию: метод Aromé',
    breadcrumbs: [HOME, ['Метод', 'kak-my-rabotaem/']],
    schema: [site.schema.faq(howFaq.map(([q, a]) => [q, a.replace(/&nbsp;/g, ' ')]))],
    get body() {
      return UI.pageTop(this, {
        h1: 'Ароматизация <em>через вентиляцию</em>',
        lead: 'Подбираем композицию под&nbsp;характер бизнеса, подключаем аппарат к&nbsp;вентиляции и&nbsp;ведём его по&nbsp;подписке — от&nbsp;заявки до&nbsp;замены масел'
      }) + `
${UI.method({ k: 'как работает' })}

${UI.device()}

${UI.schedule()}

${UI.stages({ self: true })}

${UI.weYou()}

${UI.faqHome(howFaq, this, { h: 'Вопросы <em>о&nbsp;методе</em>' })}`;
    }
  });

  /* ── Цены (вариант A, согласован 28.10.2026): верх страницы, карточки цен с главной, что входит, комплект по площади,
     вопросы о цене и заявка. Без точек в конце текстов ── */
  const priceFaq = [
    ['Можно ли сначала попробовать?', `Да, первые ${D.trialDays}&nbsp;дня бесплатно. Подключим аппарат с&nbsp;выбранным ароматом, а&nbsp;вы решите, оставлять&nbsp;ли его`],
    ['Нужно ли покупать аппарат?', 'Нет. Аппарат выдаётся на&nbsp;время подписки, масла, установка и&nbsp;обслуживание входят в&nbsp;цену'],
    ['Можно ли платить помесячно?', `Да. Месяц ${N300.name} стоит ${D.fmt(N300.plans[0].total)}. При оплате за&nbsp;3 или 6&nbsp;месяцев цена в&nbsp;пересчёте на&nbsp;месяц ниже`],
    ['Как оформляется работа?', 'Договор с&nbsp;ИП или ТОО и&nbsp;оплата за&nbsp;выбранный период'],
    ['Если аромат не понравится?', 'Скажите нам — при ближайшем визите поставим другую композицию без доплаты']
  ];
  add({
    path: 'ceny/', section: 'ceny/', pageName: 'Цены', leadForm: true,
    title: 'Цены на ароматизацию помещений в Астане | Aromé', updated: CONTENT_DATE,
    description: `Подписка на ароматизацию для бизнеса: ${N300.name} от ${UI.pm(N300)}, ${N1000.name} от ${UI.pm(N1000)} в месяц. Аппарат, масла, установка и обслуживание включены, ${TRIAL.toLowerCase()}.`,
    h1: 'Цены на ароматизацию для бизнеса в Астане',
    breadcrumbs: [HOME, ['Цены', 'ceny/']],
    schema: [site.schema.faq(priceFaq.map(([q, a]) => [q, a.replace(/&nbsp;/g, ' ')])), site.schema.service({ name: 'Ароматизация помещений для бизнеса', description: 'Аппарат, аромамасла, установка и обслуживание по подписке', type: 'Ароматизация помещений', low: PM300, high: N1000.plans[0].total }, 'ceny/')],
    get body() {
      return UI.pageTop(this, {
        h1: 'Цены на&nbsp;ароматизацию <em>для бизнеса в&nbsp;Астане</em>',
        lead: 'Вы&nbsp;не покупаете оборудование: аппарат, масла, установка и&nbsp;обслуживание входят в&nbsp;подписку. Чем длиннее срок, тем ниже цена в&nbsp;месяц'
      }) + `
${UI.pricing({ bare: true })}

${UI.included()}

${UI.kits()}

${UI.faqHome(priceFaq, this, { h: 'Вопросы <em>о&nbsp;цене</em>' })}`;
    }
  });

  /* ── Блог (28.10.2026): карточки статей и шаблон статьи в новой системе ── */
  const metaA = a => `<time datetime="${a.updated || a.date}">${dateRu(a.updated || a.date)}</time> · ${a.read} мин чтения · Редакция Aromé`;
  const cardsA = list => list.map(a => Object.assign({ meta: metaA(a) }, a));
  add({
    path: 'stati/', section: 'stati/', pageName: 'Блог', leadForm: true,
    title: 'Аромамаркетинг: статьи для бизнеса | Блог Aromé', updated: CONTENT_DATE,
    description: 'Статьи об аромамаркетинге простым языком: что это, как работает ароматизация через вентиляцию, сколько стоит, как выбрать аромат и проверить эффект.',
    h1: 'Блог об аромамаркетинге',
    breadcrumbs: [HOME, ['Блог', 'stati/']],
    schema: [site.schema.itemList(ARTICLES.map(a => [a.title, `stati/${a.slug}/`]))],
    get body() {
      /* статьи по разделам (topic в src/articles.js), нумерация сквозная внутри раздела */
      const topics = [...new Set(ARTICLES.map(a => a.topic))];
      return UI.pageTop(this, { h1: 'Блог <em>об&nbsp;аромамаркетинге</em>', lead: 'Простым языком для владельцев и&nbsp;управляющих: что такое аромамаркетинг, как устроена ароматизация, сколько она стоит и&nbsp;как проверить эффект у&nbsp;себя' }) +
        topics.map((t, i) => UI.blogCards(cardsA(ARTICLES.filter(a => a.topic === t)), { id: i ? `razdel-${i + 1}` : 'stati', k: t.toLowerCase() })).join('');
    }
  });

  ARTICLES.forEach(a => {
    const p = `stati/${a.slug}/`;
    add({
      path: p, section: 'stati/', pageName: a.h1, leadForm: true, title: a.title, description: a.description, h1: a.h1, ogType: 'article', updated: a.updated || a.date,
      breadcrumbs: [HOME, ['Блог', 'stati/'], [a.h1, p]],
      schema: [site.schema.article(a, p)],
      get body() {
        return UI.article(this, a, metaA(a)) + UI.blogCards(cardsA(ARTICLES.filter(x => x !== a)), { id: 'drugie', k: 'другие статьи' });
      }
    });
    /* старые адреса заменённых статей → новая статья */
    (PROD ? [] : a.moved || []).forEach(m => add({
      path: `stati/${m}/`, noindex: true, noCta: true, redirect: p,
      title: `Статья переехала — ${m}`, description: `Статья «${m}» заменена новой: «${a.h1}». Переходим на неё автоматически.`
    }));
  });

  /* ── Вопросы (28.10.2026): все ответы в новом списке с круглыми кнопками ── */
  const allFaq = [
    homeFaq[0], ...D.faq,
    ['Можно ли платить помесячно?', `Да. Месяц ${N300.name} стоит ${D.fmt(N300.plans[0].total)}. При оплате за 3 или 6 месяцев цена в пересчёте на месяц ниже`],
    ['Как часто вы приезжаете?', 'По графику заправки масла. Если аппарат сломался или аромат не подошёл, приедем вне графика'],
    ['Работаете ли вы с ОСИ и управляющими компаниями?', 'Да, по договору с актом каждый месяц. Подробнее — на странице для ОСИ и УК'],
    ['Можно ли поставить аппарат дома?', 'Да, если в квартире или доме есть приточная установка: компактный Nova 300 подключаем к ней. Если есть только вытяжка, подключить аппарат некуда']
  ].map(([q, a]) => [q, UI.nb(a)]);
  add({
    path: 'voprosy/', section: '', pageName: 'Вопросы', leadForm: true,
    title: 'Вопросы об ароматизации помещений — Aromé', updated: CONTENT_DATE,
    description: 'Ответы на частые вопросы об ароматизации: безопасность ароматов, оборудование, сроки запуска, договор, цена, обслуживание и бесплатный тест 3 дня.',
    h1: 'Вопросы и ответы',
    breadcrumbs: [HOME, ['Вопросы', 'voprosy/']],
    schema: [site.schema.faq(allFaq.map(([q, a]) => [q, a.replace(/&nbsp;/g, ' ')]))],
    get body() {
      return UI.pageTop(this, { h1: 'Вопросы <em>и ответы</em>', lead: 'Собрали вопросы, которые чаще всего задают владельцы магазинов, салонов, отелей и&nbsp;ресторанов. Если вашего нет — напишите в&nbsp;WhatsApp' }) + UI.faqHome(allFaq, this, { bare: true });
    }
  });

  /* ── Контакты и служебные ── */
  add({
    path: 'kontakty/', section: '', pageName: 'Контакты', leadForm: true,
    title: 'Контакты Aromé — ароматизация помещений в Астане', updated: CONTENT_DATE,
    description: `Контакты Aromé в Астане: ${C.phone}, WhatsApp. Напишите о своём пространстве — подберём аромат и решение, первые 3 дня бесплатно.`,
    h1: 'Контакты',
    breadcrumbs: [HOME, ['Контакты', 'kontakty/']],
    schema: [site.schema.business({ ...C, street: '' })],
    get body() {
      return UI.pageTop(this, { h1: 'Контакты <em>Aromé в&nbsp;Астане</em>', lead: 'Быстрее всего — WhatsApp: ответим и&nbsp;подскажем аромат и&nbsp;решение для вашего пространства. Работаем по&nbsp;всей Астане: подбираем аромат, устанавливаем аппарат и&nbsp;обслуживаем его по&nbsp;подписке' }) + UI.contacts(this);
    }
  });
  add({
    path: 'politika-konfidencialnosti/', noindex: true, noCta: true,
    title: 'Политика конфиденциальности — Aromé',
    description: 'Политика обработки персональных данных сайта Aromé: какие данные мы получаем через формы и мессенджеры и как их используем.',
    h1: 'Политика конфиденциальности',
    breadcrumbs: [HOME, ['Политика', 'politika-konfidencialnosti/']],
    get body() {
      return UI.pageTop(this, { h1: 'Политика <em>конфиденциальности</em>', lead: 'Какие данные мы получаем через формы и&nbsp;мессенджеры и&nbsp;как их используем' }) + `
<section class="ar"><div class="ar-wrap"><div class="ar-body"><p>Когда вы оставляете заявку, имя, телефон и тип пространства попадают в нашу рабочую систему учёта заявок. Она работает на сервере в Казахстане, доступ к ней есть только у сотрудников Aromé. Если вы пишете нам в WhatsApp, переписка хранится в мессенджере.</p><p>Эти данные нужны нам только для ответа, установки и договора. Третьим лицам мы их не передаём, если этого не требует закон Республики Казахстан. Попросить удалить ваши данные можно по телефону ${C.phone}.</p></div></div></section>`;
    }
  });
  /* Сюда ведёт форма после отправки заявки в CRM (main.js) */
  add({
    path: 'spasibo/', noindex: true, noCta: true, pageName: 'Спасибо',
    title: 'Заявка принята — Aromé', description: 'Спасибо за заявку в Aromé: мы получили ваши контакты и свяжемся, чтобы подобрать аромат для вашего пространства.',
    body: `<section class="pg"><div class="pg-wrap"><p class="pg-k">заявка принята</p><div class="pg-top"><h1 class="pg-h">Спасибо, <em>мы получили заявку</em></h1><div class="pg-side"><p>Скоро позвоним по&nbsp;номеру из&nbsp;заявки: уточним пространство и&nbsp;договоримся о&nbsp;бесплатном тесте на&nbsp;${D.trialDays}&nbsp;дня. Если удобнее переписка — напишите нам в&nbsp;WhatsApp</p><div class="sv-btns"><a class="sv-btn" href="${UI.wa('Спасибо', 'Оставил(а) заявку на сайте.')}" target="_blank" rel="noopener">Написать в WhatsApp</a><a class="sv-btn2" href="/aromaty/">Посмотреть ароматы</a></div></div></div></div></section>`
  });
  add({
    path: '404.html', noindex: true, noCta: true,
    title: 'Страница не найдена — Aromé', description: 'Такой страницы нет. Вернитесь на главную Aromé или посмотрите пространства.',
    body: `<section class="pg"><div class="pg-wrap"><p class="pg-k">ошибка 404</p><div class="pg-top"><h1 class="pg-h">Такой страницы <em>нет</em></h1><div class="pg-side"><p>Возможно, она переехала. Вернитесь на&nbsp;главную или посмотрите пространства</p><div class="sv-btns"><a class="sv-btn" href="/">На главную</a><a class="sv-btn2" href="/pomeshcheniya/">Пространства</a></div></div></div></div></section>`
  });
}

module.exports = { register };
