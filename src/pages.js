/* Страницы ВДОХ — служба устранения запахов.
   Кластеры: «Запахи» (как убрать запах …), «Помещения» (запах в ресторане / подъезде …), статьи. */
const D = require('../lib/data');
const { esc } = require('../lib/engine');
const UI = require('./ui');
const ODORS = require('./odors');
const PLACES = require('./places');
const ARTICLES = require('./articles');
const { icon, OFFER } = UI;
const TX = require('./texts');

const HOME = ['Главная', ''];
const odor = s => ODORS.find(o => o.slug === s);
const place = s => PLACES.find(o => o.slug === s);
const dateRu = d => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '');

/* Сравнение способов — главная и «Как мы работаем» */
const COMPARE = {
  cols: ['Освежитель', 'Озонатор', 'ВДОХ'],
  rows: [
    ['Что делает', 'Перекрывает запах облаком', 'Разрушает молекулы запаха газом', 'Находит причину и держит чистый фон'],
    ['При людях', 'Да, но раздражает', 'Нельзя — озон вреден', 'Да, мягкая интенсивность'],
    ['Сколько держится', 'Минуты', 'До нового источника', 'Всё время работы помещения'],
    ['Причина запаха', 'Остаётся', 'Остаётся', 'Находим и говорим, как убрать'],
    ['Обслуживание', 'Сами покупаете баллоны', 'Разовая услуга', 'Масла и сервис в подписке']
  ]
};
const compare = () => `<div class="cmp" role="table" aria-label="Сравнение способов убрать запах">
  <div class="cmp-r cmp-h" role="row"><span role="columnheader"></span>${COMPARE.cols.map((c, i) => `<span role="columnheader"${i === 2 ? ' class="cmp-us"' : ''}>${c}</span>`).join('')}</div>
  ${COMPARE.rows.map(([k, ...v]) => `<div class="cmp-r" role="row"><span class="cmp-k" role="rowheader">${k}</span>${v.map((x, i) => `<span role="cell"${i === 2 ? ' class="cmp-us"' : ''} data-l="${COMPARE.cols[i]}">${x}</span>`).join('')}</div>`).join('')}
</div>`;

const STEPS = [
  ['search', 'Описание или осмотр', 'Вы пишете, где и когда пахнет. Если по описанию непонятно — приезжаем и проходим помещение: трапы, сифоны, вентиляция, текстиль, мусорная зона.'],
  ['list', 'Причина и список', 'Говорим, откуда запах, и даём короткий список, что исправить: самим, сантехнику или вентиляционщику. Без навязывания услуг, которых у нас нет.'],
  ['wind', 'Чистый воздух', 'Ставим диффузор там, где он работает: у входа, в санузле, на границе кухни. Подбираем композицию, которая не смешивается с остаточным запахом.'],
  ['done', 'Контроль', 'Через неделю спрашиваем, как результат, и при необходимости меняем точку, аромат или интенсивность. Масла меняем по графику.']
];
const steps = () => `<ol class="steps">${STEPS.map(([ic, t, d], i) => `<li class="st"><span class="st-n">0${i + 1}</span>${icon(ic, 'ic st-ic')}<h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>`;

const devices = () => `<div class="devs">${D.devices.map(d => `<article class="dev"><p class="k">до ${d.area} м²</p><h3>${d.name}</h3><p>${TX.lead[d.id]}</p><p class="dev-pm">от <b>${UI.pm(d)}</b> в месяц</p><ul class="dev-pl">${d.plans.map(p => `<li><span>${p.months} ${p.months === 1 ? 'месяц' : p.months < 5 ? 'месяца' : 'месяцев'}</span><b>${D.fmt(p.total)}</b></li>`).join('')}</ul></article>`).join('')}</div>`;

function register(site) {
  const { add, img } = site;

  /* ── Главная ── */
  const homeFaq = [
    ['Вы просто перебиваете запах ароматом?', 'Нет. Сначала находим причину — сухой трап, вытяжку, текстиль, мусорную зону — и говорим, как её убрать. Аромат держит чистый фон после этого и там, где запах неизбежно накапливается.'],
    ['Вы делаете сантехнику и вентиляцию?', 'Нет, мы находим причину и даём понятный список работ для ваших специалистов. Сами отвечаем за ароматизацию: аппарат, масла, настройку и обслуживание.'],
    ['Сколько это стоит?', `Диффузор в аренду с маслами и обслуживанием — от ${UI.pm(D.devices[0])} в месяц. Сколько аппаратов нужно, зависит от помещения: часто хватает одного-двух.`],
    TX.faq.start
  ];
  add({
    path: '', section: '', priority: '1.0', bodyClass: 'home',
    title: 'Устранение запахов и ароматизация помещений в Астане — ВДОХ',
    description: 'Ароматизация помещений в Астане через устранение причины запаха: канализация, кухня, табак, сырость, туалеты. Кафе, офисы, ЖК, фитнес. Подбор решения онлайн.',
    schema: [site.schema.website(), site.schema.business(D.contacts), site.schema.faq(homeFaq)],
    body: `
<section class="hero">
  <div class="wrap hero-g">
    <div class="hero-a">
      <p class="k">Астана · устранение запахов в помещениях</p>
      <h1>Уберём запах в&nbsp;помещении. Найдём причину, а&nbsp;не&nbsp;замаскируем</h1>
      <p class="lead">Канализация, кухня, туалеты, табак, сырость, раздевалки. Разбираемся, откуда запах, говорим, что исправить, и держим чистый воздух по подписке.</p>
      <ul class="ticks">${[OFFER.diag, OFFER.reply, OFFER.start].map(t => `<li>${icon('check')}${t}</li>`).join('')}</ul>
      <div class="hero-btns"><a class="btn" href="#zayavka">${icon('wa')}Описать запах</a><a class="btn btn-line" href="/kak-my-rabotaem/">Как мы работаем</a></div>
    </div>
    ${UI.picker({ cls: 'pk-hero' })}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Чем пахнет</p><h2 class="h2">11 запахов, с которыми к нам приходят</h2></div><a class="more" href="/zapahi/">Все запахи${icon('arrow')}</a></div>
    <div class="ots ots-home">${ODORS.map(UI.odorTile).join('')}<a class="ot ot-q" href="/stati/kak-najti-istochnik-zapaha/">${icon('search', 'ic ot-ic')}<span class="ot-t">Не понимаете, чем пахнет?</span><span class="ot-d">Чек-лист из шести шагов — найдёте источник за 20 минут</span>${icon('arrow', 'ic ot-go')}</a></div>
  </div>
</section>

<section class="sec sec-alt">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Где пахнет</p><h2 class="h2">Разборы по типам помещений</h2></div><a class="more" href="/pomeshcheniya/">Все помещения${icon('arrow')}</a></div>
    <div class="pts">${PLACES.map(UI.placeTile).join('')}</div>
  </div>
</section>

<section class="sec sec-dark">
  <div class="wrap">
    <div class="sec-head"><div><p class="k k-l">Почему освежитель не помогает</p><h2 class="h2">Запах нельзя победить, если оставить причину</h2></div></div>
    <p class="lead lead-w">Освежитель перекрывает запах на минуты, озонатор нельзя включать при людях. Мы работаем с причиной и держим ровный чистый фон, пока помещение открыто.</p>
    ${compare()}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Как мы работаем</p><h2 class="h2">Четыре шага от жалобы до чистого воздуха</h2></div><a class="more" href="/kak-my-rabotaem/">Подробнее${icon('arrow')}</a></div>
    <div class="split split-img">${steps()}${img('hero', { cls: 'side-img', eager: false })}</div>
  </div>
</section>

<section class="sec sec-alt">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Цены</p><h2 class="h2">Аппарат, масла и&nbsp;обслуживание&nbsp;— в&nbsp;одной подписке</h2></div><a class="more" href="/ceny/">Все цены${icon('arrow')}</a></div>
    ${devices()}
    <p class="note">${TX.included.join(' · ')}. Полгода выходит дешевле, чем помесячно.</p>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Статьи</p><h2 class="h2">Разбираемся в запахах</h2></div><a class="more" href="/stati/">Все статьи${icon('arrow')}</a></div>
    <div class="arts">${ARTICLES.slice(0, 3).map(a => `<a class="art" href="/stati/${a.slug}/"><span class="art-k">${a.read} мин чтения</span><span class="art-t">${a.h1}</span><span class="art-d">${esc(a.lead)}</span></a>`).join('')}</div>
  </div>
</section>
${UI.faq(homeFaq)}`
  });

  /* ── Запахи ── */
  add({
    path: 'zapahi/', section: 'zapahi/',
    title: 'Как убрать неприятный запах в помещении: 11 частых случаев',
    description: 'Канализация, туалет, кухня, табак, сырость, пот, мусор, животные, химия, ремонт, «запах больницы». Причины каждого запаха, что сделать самим и как убрать его надолго.',
    h1: 'Неприятные запахи в помещении',
    breadcrumbs: [HOME, ['Запахи', 'zapahi/']],
    schema: [site.schema.itemList(ODORS.map(o => [o.h1, `zapahi/${o.slug}/`]))],
    get body() {
      return UI.pageHead(this, { kicker: 'Справочник', lead: 'У каждого запаха есть источник, и чаще всего его можно найти за один обход. Выберите свой случай: расскажем, откуда он берётся и что делать.' }) + `
<section class="sec sec-t"><div class="wrap"><div class="ots ots-l">${ODORS.map(o => `<a class="ot" href="/zapahi/${o.slug}/">${icon(o.icon, 'ic ot-ic')}<span class="ot-t">${o.h1}</span><span class="ot-d">${esc(o.lead)}</span>${icon('arrow', 'ic ot-go')}</a>`).join('')}</div></div></section>
<section class="sec sec-alt"><div class="wrap split">
  <div class="prose">
    <h2>Маскировать или устранять</h2>
    <p>Освежитель перекрывает запах резким облаком, которое быстро исчезает, и неприятный запах возвращается — уже вместе с химическим. Гости чувствуют это как «здесь что-то прячут».</p>
    <p>Правильный порядок другой: найти источник, убрать причину — вода в трапах, вытяжка, уборка, чистка текстиля — и только потом поддерживать чистый фон ароматом там, где запах неизбежно накапливается.</p>
  </div>
  <div class="prose">
    <h2>Если не понимаете, чем пахнет</h2>
    <p>Пройдите наш <a href="/stati/kak-najti-istochnik-zapaha/">чек-лист из шести шагов</a> — он занимает 20 минут. Или опишите ситуацию в заявке ниже: где, когда и насколько сильно. По описанию мы часто сразу понимаем причину.</p>
    <p>Запахи по типам помещений — в разделе <a href="/pomeshcheniya/">«Помещения»</a>.</p>
  </div>
</div></section>`;
    }
  });

  ODORS.forEach(o => {
    const p = `zapahi/${o.slug}/`;
    add({
      path: p, section: 'zapahi/', title: o.title, description: o.description, h1: o.h1,
      breadcrumbs: [HOME, ['Запахи', 'zapahi/'], [o.name, p]],
      schema: [site.schema.faq(o.faq), site.schema.service({ name: o.h1, description: o.description, type: 'Устранение неприятных запахов', low: D.perMonth(D.devices[0].plans[2]), high: D.devices[1].plans[0].total }, p)],
      cta: { odor: o.slug, place: o.places[0], title: `${o.short}? Опишите ситуацию — скажем, откуда он` },
      get body() {
        const short = s => s[0].toLowerCase() + s.slice(1);
        return UI.pageHead(this, {
          kicker: 'Запахи', icon: o.icon, lead: o.lead,
          aside: `<aside class="brief"><p class="k">Коротко</p><p class="brief-t">Чаще всего причина — ${short(o.causes[0])}.</p><p class="brief-d"><b>Начните с этого:</b> ${short(o.self[0])}.</p><a class="btn btn-s" href="${D.waLink(`Здравствуйте! ${o.short} в помещении, хочу понять причину.`)}" target="_blank" rel="noopener">${icon('wa')}Спросить в WhatsApp</a></aside>`,
          extra: `<div class="signs"><p class="signs-k">Как понять, что это он</p><ul>${o.signs.map(s => `<li>${s}</li>`).join('')}</ul></div>`
        }) + `
<section class="sec sec-t">
  <div class="wrap split split-img">
    <div>
      <h2 class="h2">Откуда берётся</h2>
      <ol class="causes">${o.causes.map(c => `<li>${c}</li>`).join('')}</ol>
    </div>
    ${img('odor-' + o.slug, { cls: 'side-img' })}
  </div>
</section>
<section class="sec sec-alt">
  <div class="wrap two">
    <div class="card">
      <p class="k">Сделайте сами сегодня</p>
      <h2 class="h3">Что проверить без специалистов</h2>
      <ul class="todo">${o.self.map(t => `<li>${icon('check')}<span>${t}</span></li>`).join('')}</ul>
    </div>
    <div class="card card-dark">
      <p class="k k-l">Что делаем мы</p>
      <h2 class="h3">Если запах остаётся</h2>
      <ul class="todo">${o.we.map(t => `<li>${icon('arrow')}<span>${t}</span></li>`).join('')}</ul>
      <a class="btn" href="#zayavka">${icon('wa')}Описать ситуацию</a>
    </div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Где встречается чаще</p><h2 class="h2">${o.short}: разборы по помещениям</h2></div></div>
    <div class="pts pts-s">${o.places.map(s => UI.placeTile(place(s))).join('')}</div>
  </div>
</section>
<section class="sec sec-alt">
  <div class="wrap split">
    <div><p class="k">После устранения причины</p><h2 class="h2">Какие ароматы подходят</h2><p class="lead">Чистые композиции, которые не смешиваются с остаточным запахом и не утомляют за день.</p></div>
    <ul class="srs">${o.scents.map(n => UI.scentRow(D.byN(n))).join('')}</ul>
  </div>
</section>
${UI.faq(o.faq)}
${UI.related('Другие запахи', ODORS.filter(x => x !== o).map(x => [x.short, `zapahi/${x.slug}/`]))}`;
      }
    });
  });

  /* ── Помещения ── */
  add({
    path: 'pomeshcheniya/', section: 'pomeshcheniya/',
    title: 'Ароматизация и запахи по типам помещений: ресторан, ЖК, офис',
    description: 'Разборы запахов по типам помещений Астаны: ресторан и кафе, тойхана, ЖК и подъезд, фитнес-клуб, клиника, салон красоты, туалеты ТРЦ, офис, гостиница.',
    h1: 'Ароматизация и запахи по помещениям',
    breadcrumbs: [HOME, ['Помещения', 'pomeshcheniya/']],
    schema: [site.schema.itemList(PLACES.map(o => [o.h1, `pomeshcheniya/${o.slug}/`]))],
    get body() {
      return UI.pageHead(this, { kicker: 'Помещения', lead: 'В каждом типе помещения запах приходит из своих мест. Мы разобрали девять самых частых: зоны, причины, решения и типовой комплект с ценой.' }) + `
<section class="sec sec-t"><div class="wrap"><div class="pts">${PLACES.map(UI.placeTile).join('')}</div></div></section>
<section class="sec sec-alt"><div class="wrap narrow prose">
  <h2>Почему важен тип помещения</h2>
  <p>Запах канализации в ресторане и в подъезде ЖК может иметь одну причину — сухой гидрозатвор, — но решать его будут разные люди: управляющий заведением или управляющая компания дома. Отличаются и зоны, где ставить аппарат, и требования: в клинике аромат не ставят в кабинетах, а в салоне красоты — у маникюрных столов.</p>
  <p>Если вашего типа помещения нет в списке — склад, автомойка, школа, магазин, — опишите его в заявке. Принцип тот же: найти источник, убрать причину и поддерживать чистый фон там, где запах накапливается.</p>
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
      cta: { place: pl.slug, odor: pl.odors[0], title: `${pl.name}: опишите, где пахнет` },
      get body() {
        return UI.pageHead(this, { kicker: 'Помещения', icon: pl.icon, lead: pl.lead, aside: img('place-' + pl.slug, { cls: 'phead-img', eager: true }) }) + `
<section class="sec sec-t"><div class="wrap split">
  <div class="prose">${pl.text.map(t => `<p>${t}</p>`).join('')}</div>
  ${UI.picker({ place: pl.slug, title: 'Что именно пахнет?' })}
</div></section>
<section class="sec sec-alt">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">По зонам</p><h2 class="h2">Где появляется запах и что с этим делать</h2></div></div>
    <div class="zones">${pl.zones.map((z, k) => `<article class="zone"><span class="zone-n">0${k + 1}</span><h3>${z.name}</h3><p class="zone-p"><b>Проблема</b>${z.problem}</p><p class="zone-s"><b>Решение</b>${z.sol}</p></article>`).join('')}</div>
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
    <div><p class="k">Типовой комплект</p><h2 class="h2">Сколько это стоит</h2><p class="lead">Пример для типичного объекта: ${pl.setup.note}. Точный комплект считаем после описания или осмотра.</p></div>
    <div class="sum"><p class="sum-set">${UI.setupText(pl.setup)}</p><p class="sum-pm">${D.fmt(pm)}<span>в месяц при подписке на 6 месяцев</span></p><ul class="sum-l">${TX.included.map(t => `<li>${icon('check')}${t}</li>`).join('')}</ul></div>
  </div>
</section>
${UI.faq(pl.faq)}
${UI.related('Другие помещения', PLACES.filter(x => x !== pl).map(x => [x.name, `pomeshcheniya/${x.slug}/`]))}`;
      }
    });
  });

  /* ── Как мы работаем ── */
  const howFaq = [
    ['Что вы не делаете?', 'Не ремонтируем сантехнику и вентиляцию, не делаем озонацию и обработку от плесени. Если нужна такая работа, честно скажем и объясним, что именно попросить у специалистов.'],
    ['Сколько длится осмотр?', 'Обычно 30–60 минут для кафе, салона или офиса. Для большого объекта — ЖК, ТРЦ, отеля — дольше.'],
    ['Что если причину не удалось найти?', 'Такое бывает редко. Тогда ставим аппарат на пробу в зоне, где запах сильнее, и через неделю смотрим результат вместе с вами.']
  ];
  add({
    path: 'kak-my-rabotaem/', section: 'kak-my-rabotaem/',
    title: 'Как мы убираем запах в помещении: осмотр, причина, решение',
    description: 'Как работает ВДОХ: описание или осмотр помещения, поиск источника запаха, список того, что исправить, ароматизация в правильной точке и контроль через неделю.',
    h1: 'Как мы работаем',
    breadcrumbs: [HOME, ['Как мы работаем', 'kak-my-rabotaem/']],
    schema: [site.schema.faq(howFaq)],
    get body() {
      return UI.pageHead(this, { kicker: 'Метод', lead: 'Мы не продаём «запах против запаха». Сначала разбираемся, откуда он, и только потом ставим аромат — туда, где он действительно нужен.', aside: img('metod', { cls: 'phead-img', eager: true }) }) + `
<section class="sec sec-t"><div class="wrap">${steps()}</div></section>
<section class="sec sec-alt"><div class="wrap two">
  <div class="card">
    <p class="k">Что проверяем на осмотре</p>
    <h2 class="h3">Обход помещения</h2>
    <ul class="todo">${['Трапы, сифоны и редко используемые сливы', 'Куда идёт воздух: баланс вытяжки и притока', 'Санузлы: швы, писсуары, корзины, вытяжка', 'Кухня: зонт, фильтры, двери, раздача', 'Текстиль, ковры, мягкая мебель', 'Мусорная зона и чёрный вход', 'Влажность у наружных стен и в цоколе'].map(t => `<li>${icon('check')}<span>${t}</span></li>`).join('')}</ul>
  </div>
  <div class="card">
    <p class="k">Что вы получаете</p>
    <h2 class="h3">Результат осмотра</h2>
    <ul class="todo">${['Причину запаха простыми словами', 'Список: что сделать самим, что поручить сантехнику или вентиляционщику', 'Схему, где поставить аппараты, и стоимость', 'Подобранный аромат — можно понюхать на месте', 'Запуск в день обращения, если помещение готово'].map(t => `<li>${icon('arrow')}<span>${t}</span></li>`).join('')}</ul>
  </div>
</div></section>
<section class="sec sec-dark">
  <div class="wrap">
    <div class="sec-head"><div><p class="k k-l">Честно о методах</p><h2 class="h2">Чем мы отличаемся от освежителя и озонатора</h2></div></div>
    ${compare()}
    <p class="note note-d">Подробнее — в статье <a href="/stati/ozonator-osvezhitel-ili-diffuzor/">«Озонатор, освежитель или диффузор»</a>.</p>
  </div>
</section>
${UI.faq(howFaq)}`;
    }
  });

  /* ── Цены ── */
  const priceFaq = [
    ['Платный ли осмотр?', `${OFFER.diag}. Вы ничего не должны, если решите не ставить аппарат.`],
    ['Нужно ли покупать аппарат?', 'Нет. Диффузор выдаётся в аренду, масла и обслуживание входят в подписку.'],
    TX.faq.contract,
    ['Можно ли поставить аппарат только в туалет?', 'Да, это частый случай. Одного компактного Nova 300 хватает на санузел с несколькими кабинками.']
  ];
  add({
    path: 'ceny/', section: 'ceny/',
    title: 'Цены на ароматизацию и устранение запахов в Астане — ВДОХ',
    description: `Цены на устранение запахов и ароматизацию: Nova 300 от ${UI.pm(D.devices[0])}, Nova 1000 от ${UI.pm(D.devices[1])} в месяц. Аренда аппарата, масла и обслуживание в подписке.`,
    h1: 'Цены',
    breadcrumbs: [HOME, ['Цены', 'ceny/']],
    schema: [site.schema.faq(priceFaq), site.schema.service({ name: 'Устранение неприятных запахов в помещениях', description: 'Осмотр, поиск причины и ароматизация по подписке', low: D.perMonth(D.devices[0].plans[2]), high: D.devices[1].plans[2].total }, 'ceny/')],
    get body() {
      return UI.pageHead(this, { kicker: 'Подписка', lead: 'Вы не покупаете оборудование. Платите за подписку: аппарат в аренду, масла, настройка и обслуживание. Чем длиннее срок, тем ниже цена в месяц.' }) + `
<section class="sec sec-t"><div class="wrap">${devices()}<p class="note">${TX.included.join(' · ')}.</p></div></section>
<section class="sec sec-alt">
  <div class="wrap">
    <div class="sec-head"><div><p class="k">Примеры</p><h2 class="h2">Типовые комплекты по помещениям</h2></div></div>
    <div class="kits">${PLACES.map(pl => `<a class="kit" href="/pomeshcheniya/${pl.slug}/"><span class="kit-t">${icon(pl.icon)}${pl.name}</span><span class="kit-n">${pl.setup.note}</span><span class="kit-s">${UI.setupText(pl.setup)}</span><b class="kit-p">${D.fmt(UI.setupPm(pl.setup))}<small> / мес</small></b></a>`).join('')}</div>
    <p class="note">Цена в месяц при подписке на 6 месяцев. Точный комплект зависит от планировки, вентиляции и числа закрытых помещений.</p>
  </div>
</section>
<section class="sec"><div class="wrap narrow prose">
  <h2>Из чего складывается цена</h2>
  <p>Цена зависит только от числа и типа аппаратов и срока подписки. Nova 300 закрывает открытое помещение до 300 м² или отдельный санузел, раздевалку, кабинет. Nova 1000 — зал до 1000 м², лобби или фойе тойханы.</p>
  <p>Каждое закрытое помещение — туалет, раздевалка, коридор этажа — обычно получает свой аппарат: аромат не проходит сквозь стены и плохо проходит через закрытые двери. Поэтому важен осмотр: иногда вместо двух аппаратов достаточно одного в правильной точке.</p>
</div></section>
${UI.faq(priceFaq)}`;
    }
  });

  /* ── Статьи ── */
  add({
    path: 'stati/', section: 'stati/',
    title: 'Статьи о запахах в помещениях: причины, вентиляция, советы',
    description: 'Статьи ВДОХ о неприятных запахах в коммерческих помещениях: как найти источник, чем опасен озонатор, как отвечать на отзывы о запахе и почему зимой пахнет сильнее.',
    h1: 'Статьи',
    breadcrumbs: [HOME, ['Статьи', 'stati/']],
    schema: [site.schema.itemList(ARTICLES.map(a => [a.title, `stati/${a.slug}/`]))],
    get body() {
      return UI.pageHead(this, { kicker: 'Разбираемся в запахах', lead: 'Практические статьи для владельцев и управляющих: как найти источник запаха, как работает вентиляция и что делать, если про запах уже написали в отзывах.' }) + `
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
  });

  /* ── Вопросы ── */
  const allFaq = [
    homeFaq[0], homeFaq[1], howFaq[0], priceFaq[0], priceFaq[1], TX.faq.safe, TX.faq.start, TX.faq.contract, TX.faq.change,
    ['Работаете ли вы с управляющими компаниями и ОСИ?', 'Да, для ЖК и бизнес-центров заключаем договор с юрлицом и обслуживаем общие зоны по графику.'],
    ['Можно ли сначала попробовать?', 'Да. Ставим аппарат в зоне, где запах сильнее, и через неделю вместе смотрим результат.']
  ];
  add({
    path: 'voprosy/', section: '',
    title: 'Вопросы об устранении запахов и ароматизации — ВДОХ',
    description: 'Ответы на частые вопросы: как мы ищем причину запаха, что входит в подписку, безопасность ароматов, договор, сроки запуска и работа с УК и ОСИ в Астане.',
    h1: 'Вопросы и ответы',
    breadcrumbs: [HOME, ['Вопросы', 'voprosy/']],
    schema: [site.schema.faq(allFaq)],
    get body() {
      return UI.pageHead(this, { kicker: 'Помощь', lead: 'Собрали вопросы, которые чаще всего задают владельцы кафе, салонов, клиник и управляющие компании. Если вашего нет — напишите в WhatsApp.' }) + `
<section class="sec sec-t"><div class="wrap faq-w"><div class="faq">${allFaq.map(([q, a]) => `<details><summary><span>${esc(q)}</span>${icon('plus')}</summary><p>${a}</p></details>`).join('')}</div></div></section>`;
    }
  });

  /* ── Контакты и служебные ── */
  const C = D.contacts;
  add({
    path: 'kontakty/', section: 'kontakty/',
    title: 'Контакты ВДОХ — устранение запахов в помещениях, Астана',
    description: `Контакты ВДОХ в Астане: ${C.phone}, WhatsApp, ${C.street}. Опишите запах — скажем, откуда он, и приедем на осмотр.`,
    h1: 'Контакты',
    breadcrumbs: [HOME, ['Контакты', 'kontakty/']],
    schema: [site.schema.business(C)],
    get body() {
      return UI.pageHead(this, { kicker: 'Связь', lead: 'Быстрее всего — WhatsApp: напишите, где и когда пахнет, приложите фото помещения. Ответим и при необходимости договоримся об осмотре.' }) + `
<section class="sec sec-t"><div class="wrap"><div class="cts">
  <a class="ct" href="tel:${C.phoneRaw}"><span class="k">Телефон</span><b>${C.phone}</b></a>
  <a class="ct" href="${D.waLink('Здравствуйте! Хочу убрать запах в помещении.')}" target="_blank" rel="noopener"><span class="k">WhatsApp</span><b>Написать</b></a>
  <a class="ct" href="${C.map2gis}" target="_blank" rel="noopener"><span class="k">Адрес</span><b>${C.address}</b></a>
  <div class="ct"><span class="k">Время работы</span><b>${C.hours}</b></div>
</div></div></section>
<section class="sec"><div class="wrap narrow prose"><h2>Что написать, чтобы мы быстрее помогли</h2><ul><li>Тип помещения и примерную площадь.</li><li>Где пахнет сильнее всего: у туалета, на входе, в зале, в коридоре.</li><li>Когда сильнее: утром, вечером, после выходных, после дождя.</li><li>Что уже пробовали: освежитель, уборка, сантехник.</li></ul><p>Мы работаем по всей Астане. После осмотра аппараты обслуживает наш специалист: меняет масла по графику и следит за работой.</p></div></section>`;
    }
  });
  add({
    path: 'politika-konfidencialnosti/', noindex: true, noCta: true,
    title: 'Политика конфиденциальности — ВДОХ',
    description: 'Политика обработки персональных данных сайта ВДОХ: какие данные мы получаем через формы и мессенджеры и как их используем.',
    h1: 'Политика конфиденциальности',
    breadcrumbs: [HOME, ['Политика', 'politika-konfidencialnosti/']],
    get body() {
      return UI.pageHead(this, {}) + `<section class="sec sec-t"><div class="wrap narrow prose"><p>На этом сайте нет личных кабинетов и баз данных: ничего из того, что вы вводите в форму или подбор, не сохраняется на сервере. Форма лишь собирает текст, а отправляете его вы сами — через WhatsApp.</p><p>Описание запаха, помещения и контакт нужны нам только для ответа, осмотра и договора. Третьим лицам мы их не передаём, если этого не требует закон Республики Казахстан. Попросить удалить переписку можно по телефону ${C.phone}.</p></div></section>`;
    }
  });
  add({
    path: '404.html', noindex: true, noCta: true,
    title: 'Страница не найдена — ВДОХ', description: 'Такой страницы нет. Вернитесь на главную ВДОХ или выберите запах в справочнике.',
    body: `<section class="phead nf"><div class="wrap"><p class="k">Ошибка 404</p><h1>Здесь ничем не пахнет</h1><p class="lead">Такой страницы нет. Вернитесь на главную или откройте справочник запахов.</p><div class="hero-btns"><a class="btn" href="/">На главную ${icon('arrow')}</a><a class="btn btn-line" href="/zapahi/">Справочник запахов</a></div></div></section>`
  });
}

module.exports = { register };
