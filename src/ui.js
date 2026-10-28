/* Aromé: layout и блоки. Ароматизация помещений, где пахнет неприятно: ставим свой аппарат и заправляем
   маслом — он нейтрализует запах и наполняет помещение ароматом. Светлый тёплый серый, графит и терракота,
   текст — Golos Text, вордмарк логотипа и первого экрана — Tenor Sans. */
const D = require('../lib/data');
const { esc } = require('../lib/engine');
const ODORS = require('./odors');
const PLACES = require('./places');
const CFG = require('./config');
const ICONS = require('./icons');

let site;
const init = s => { site = s; };

/* Контакты: свои поля из config.js, пустые — из общих lib/data.js */
const C = Object.assign({}, D.contacts, ...Object.entries(CFG.contacts).filter(([, v]) => v).map(([k, v]) => ({ [k]: v })));
const waLink = text => 'https://wa.me/' + C.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');
/* Сообщение в WhatsApp с меткой сайта и страницы — менеджер видит контекст, аналитика — источник */
const waText = (page, extra) => `Здравствуйте! Пишу с сайта Aromé, страница «${page}».${extra ? ' ' + extra : ''}`;
const wa = (page, extra) => waLink(waText(page, extra));

/* Предложение компании: тест — из trialDays в data.js, условия теста — в config.js */
const TRIAL = `Первые ${D.trialDays} дня бесплатно`;
const OFFER = {
  start: 'Установка в день обращения',
  reply: 'Ответим в WhatsApp за 15 минут в рабочее время',
  trial: TRIAL
};

const icon = (n, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

/* Логотип — слово AROMÉ шрифтом Tenor Sans, как вордмарк в референсе; весь остальной текст — Golos Text.
   Штатное É на мелком кегле читается как È, поэтому ударение над E рисуется отдельной чертой. */
const WORD = '<span class="logo-w" aria-hidden="true">Arom<span class="logo-e">e</span></span>';

/* Меню по стратегии: Запахи · Помещения · Цены · Как работаем и кнопка «Написать в WhatsApp» */
const NAV_L = [['запахи', 'zapahi/'], ['помещения', 'pomeshcheniya/']];
const NAV_R = [['цены', 'ceny/'], ['как работаем', 'kak-my-rabotaem/']];
const NAV_M = [...NAV_L, ...NAV_R, ['для ОСИ и УК', 'osi/'], ['для дома', 'kvartira/'], ['статьи', 'stati/'], ['контакты', 'kontakty/']];

/* Подбор «Где пахнет?»: первыми — частые случаи из стратегии. Ссылка — на страницу помещения;
   у «Дома» своя страница и свой комплект. */
const PK = [
  { slug: 'obshchestvennyj-tualet', label: 'Туалет', icon: 'wc' },
  { slug: 'restoran-kafe', label: 'Кафе и кухня', icon: 'cup' },
  { slug: 'zhk-podezd', label: 'Подъезд', icon: 'building' },
  { slug: 'fitnes', label: 'Раздевалка', icon: 'gym' },
  { slug: 'ofis', label: 'Офис', icon: 'case' },
  { slug: 'kvartira', label: 'Дом', icon: 'home', url: 'kvartira/', odors: ['tabaka', 'zhivotnyh', 'syrosti', 'gari'], setup: { n300: 1, n1000: 0, note: 'гостиная или прихожая' } },
  { slug: 'tojhana', label: 'Тойхана', icon: 'cloche' },
  { slug: 'klinika', label: 'Клиника', icon: 'cross' },
  { slug: 'salon-krasoty', label: 'Салон красоты', icon: 'scissors' },
  { slug: 'gostinica', label: 'Гостиница', icon: 'bed' }
].map(x => {
  const pl = PLACES.find(p => p.slug === x.slug);
  return Object.assign({ url: `pomeshcheniya/${x.slug}/`, odors: pl && pl.odors, setup: pl && pl.setup }, x);
});

function header(p) {
  const link = ([n, h]) => `<a href="/${h}"${p.section === h ? ' aria-current="true"' : ''}>${n}</a>`;
  return `<a class="skip" href="#main">К содержанию</a>
<p class="ann"><span class="ann-x">${OFFER.start} <span class="ann-d">·</span> ответим</span><span class="ann-m">Ответим</span> за 15 минут</p>
<header class="hdr" id="hdr">
  <div class="hdr-in">
    <div class="hdr-l">
      <button class="burger" id="burger" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="menu">${icon('menu')}${icon('close', 'ic ic-x')}<span>меню</span></button>
      <nav class="hdr-nav" aria-label="Разделы">${NAV_L.map(link).join('')}</nav>
    </div>
    <a class="logo" href="/" aria-label="Aromé — на главную">${WORD}</a>
    <div class="hdr-r">
      <nav class="hdr-nav" aria-label="Сервис">${NAV_R.map(link).join('')}</nav>
      <a class="hdr-cta" href="${wa(p.pageName)}" target="_blank" rel="noopener">${icon('wa')}<span>Написать в WhatsApp</span></a>
    </div>
  </div>
  <nav class="menu" id="menu" aria-label="Основное меню">${NAV_M.map(link).join('')}<a class="menu-ph" href="tel:${C.phoneRaw}">${icon('phone')}${C.phone}</a></nav>
</header>`;
}

/* На телефоне — закреплённая нижняя панель «WhatsApp · Позвонить», без всплывающих окон */
function mbar(p) {
  return `<div class="mbar" aria-label="Связаться">
  <a class="mbar-wa" href="${wa(p.pageName)}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a>
  <a class="mbar-ph" href="tel:${C.phoneRaw}">${icon('phone')}Позвонить</a>
</div>`;
}

function footer() {
  return `<footer class="ftr">
  <div class="wrap ftr-in">
    <div class="ftr-a"><a class="logo" href="/" aria-label="Aromé — на главную">${WORD}</a><p>Устранение запахов и ароматизация помещений в Астане. Ставим аппарат и заправляем маслом: он нейтрализует неприятный запах и наполняет помещение ароматом.</p></div>
    <nav aria-label="Запахи"><p class="ftr-k">Запахи</p>${ODORS.map(o => `<a href="/zapahi/${o.slug}/">${o.short}</a>`).join('')}</nav>
    <nav aria-label="Помещения"><p class="ftr-k">Помещения</p>${PLACES.map(o => `<a href="/pomeshcheniya/${o.slug}/">${o.name}</a>`).join('')}<a href="/osi/">Для ОСИ и УК</a><a href="/kvartira/">Для дома</a></nav>
    <div><p class="ftr-k">Связь</p><address><a href="tel:${C.phoneRaw}">${C.phone}</a><a href="${waLink()}" target="_blank" rel="noopener">WhatsApp</a><a href="${C.map2gis}" target="_blank" rel="noopener">${C.address}</a><span>${C.hours}</span></address>
    <p class="ftr-k ftr-k2">Компания</p><a href="/nejtralizator-zapaha/">Нейтрализатор запаха</a><a href="/kak-my-rabotaem/">Как работаем</a><a href="/ceny/">Цены</a><a href="/voprosy/">Вопросы</a><a href="/stati/">Статьи</a></div>
  </div>
  <div class="wrap ftr-bot"><span>© 2026 Aromé · Астана</span><a href="/politika-konfidencialnosti/">Политика конфиденциальности</a></div>
</footer>`;
}

/* Счётчики подключаются, только когда номер заполнен в config.js */
function analytics() {
  const A = CFG.analytics;
  let s = `<script>window.dataLayer=window.dataLayer||[];window.AROME_AN=${JSON.stringify({ ym: A.ym || '', ga4: A.ga4 || '' })};</script>`;
  if (A.ym) s += `\n<script>(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${Number(A.ym)},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});</script>`;
  if (A.ga4) s += `\n<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(A.ga4)}"></script><script>function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(A.ga4)}');</script>`;
  return s;
}

function layout(p, head) {
  /* Переадресация со старых адресов (статьи, заменённые новой); адрес в meta относительный — base его не переписывает */
  if (p.redirect) return `<!doctype html>
<html lang="ru">
<head>
${head}
<meta http-equiv="refresh" content="0; url=${'../'.repeat(p.path.split('/').filter(Boolean).length)}${p.redirect}">
<link rel="stylesheet" href="/assets/css/style.css">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
</head>
<body><main class="wrap nf"><h1>Страница переехала</h1><p class="lead"><a href="/${p.redirect}">Перейти на новую страницу</a></p></main></body>
</html>`;
  return `<!doctype html>
<html lang="ru">
<head>
${head}
<script>document.documentElement.classList.add('js')</script>
${analytics()}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&family=Tenor+Sans&display=swap">
${p.fonts ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${p.fonts}&display=swap">` : ''}
<link rel="stylesheet" href="/assets/css/style.css">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
</head>
<body class="${p.bodyClass || ''}" data-page="${esc(p.pageName)}">
${p.ownHeader ? '<a class="skip" href="#main">К содержанию</a>' : header(p)}
<main id="main">
${p.body}
${p.noCta ? '' : cta(p, p.cta || {})}
</main>
${footer()}
${mbar(p)}
<script src="/assets/js/data.js"></script>
<script src="/assets/js/main.js"></script>
</body>
</html>`;
}

function pageHead(p, o = {}) {
  return `<section class="phead${o.aside ? ' phead-2' : ''}">
  <div class="wrap">
    ${site.crumbs(p.breadcrumbs)}
    <div class="phead-g">
      <div>
        ${o.kicker ? `<p class="k">${o.icon ? icon(o.icon, 'ic k-ic') : ''}${o.kicker}</p>` : ''}
        <h1>${p.h1}</h1>
        ${o.lead ? `<p class="lead">${o.lead}</p>` : ''}
        ${o.extra || ''}
      </div>
      ${o.aside || ''}
    </div>
  </div>
</section>`;
}

/* Подбор: «где пахнет» → «чем пахнет» → что делает аппарат, где поставим, комплект и цена.
   place — заранее выбранное помещение (на страницах помещений шаг 1 скрыт). */
function picker(o = {}) {
  const pl = o.place ? PK.find(x => x.slug === o.place) : null;
  return `<div class="pk${o.cls ? ' ' + o.cls : ''}" data-picker${pl ? ` data-place="${pl.slug}"` : ''}>
  <a hidden data-zap href="/zapahi/"></a><a hidden data-root href="/"></a>
  <div class="pk-h"><span class="pk-dot"></span>${o.title || 'Подбор аппарата за 2 шага'}</div>
  ${pl ? '' : `<fieldset class="pk-step" data-step="1"><legend><span class="pk-n">1</span>Где пахнет?</legend>
    <div class="pk-chips">${PK.map(x => `<button type="button" class="pc" data-v="${x.slug}" aria-pressed="false">${icon(x.icon)}${x.label}</button>`).join('')}</div></fieldset>`}
  <fieldset class="pk-step" data-step="2"${pl ? '' : ' disabled'}><legend><span class="pk-n">${pl ? 1 : 2}</span>Чем пахнет?</legend>
    <div class="pk-chips" data-odors>${ODORS.map(x => `<button type="button" class="pc" data-v="${x.slug}" aria-pressed="false">${icon(x.icon)}${x.name}</button>`).join('')}</div></fieldset>
  <div class="pk-res" aria-live="polite" data-res><p class="pk-wait">${pl ? 'Выберите запах — покажем, что сделает аппарат, и сколько это стоит.' : 'Выберите помещение и запах — покажем, что сделает аппарат, и сколько это стоит.'}</p></div>
</div>`;
}

function odorTile(o) {
  return `<a class="ot" href="/zapahi/${o.slug}/">${icon(o.icon, 'ic ot-ic')}<span class="ot-t">${o.short}</span><span class="ot-d">${esc(o.brief[0])}</span>${icon('arrow', 'ic ot-go')}</a>`;
}

function placeTile(p) {
  return `<a class="pt" href="/pomeshcheniya/${p.slug}/">${site.img('place-' + p.slug, { cls: 'pt-img' })}<span class="pt-b"><span class="pt-k">${icon(p.icon)}${p.short}</span><span class="pt-t">${p.h1}</span><span class="pt-o">${p.odors.map(s => ODORS.find(x => x.slug === s).name).join(' · ')}</span></span></a>`;
}

function faq(list, title = 'Частые вопросы', p) {
  return `<section class="sec"><div class="wrap faq-g">
  <div><h2 class="h2">${title}</h2><p class="faq-n">Не нашли ответ? <a href="${p ? wa(p.pageName, 'У меня вопрос.') : waLink()}" target="_blank" rel="noopener">Спросите в WhatsApp</a> или посмотрите <a href="/voprosy/">все вопросы</a>.</p></div>
  <div class="faq">${list.map(([q, a]) => `<details><summary><span>${esc(q)}</span>${icon('plus')}</summary><p>${a}</p></details>`).join('')}</div>
</div></section>`;
}

function scentRow(s) {
  return `<li class="sr"><div><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p></div><span class="sr-notes">${esc(s.notes.join(' · '))}</span></li>`;
}

/* Цена комплекта при подписке на 6 месяцев и помесячно */
const pm = d => D.fmt(Math.min(...d.plans.map(D.perMonth)));
const setupPm = s => s.n300 * D.perMonth(D.devices[0].plans[2]) + s.n1000 * D.perMonth(D.devices[1].plans[2]);
const setupMonth = s => s.n300 * D.devices[0].plans[0].total + s.n1000 * D.devices[1].plans[0].total;
const setupText = s => [s.n1000 ? `${s.n1000} × Nova 1000` : '', s.n300 ? `${s.n300} × Nova 300` : ''].filter(Boolean).join(' + ');

/* Карточка цены: комплект, цена при 6 месяцах и помесячно, тест и кнопка теста */
function priceCard(p, setup, o = {}) {
  return `<div class="sum">
  <p class="sum-set">${setupText(setup)}${setup.note ? ` <span>· ${setup.note}</span>` : ''}</p>
  <p class="sum-pm">${D.fmt(setupPm(setup))}<span>в месяц при оплате за 6 месяцев · ${D.fmt(setupMonth(setup))} помесячно</span></p>
  <p class="sum-tr">${icon('gift')}${TRIAL}${CFG.trial.terms ? ` — ${esc(CFG.trial.terms)}` : ''}</p>
  ${o.list === false ? '' : `<ul class="sum-l">${require('./texts').included.map(t => `<li>${icon('check')}${t}</li>`).join('')}</ul>`}
  <a class="btn" href="${wa(p.pageName, `Хочу тест ${D.trialDays} дня бесплатно.`)}" target="_blank" rel="noopener" data-test>${icon('wa')}Попробовать ${D.trialDays} дня бесплатно</a>
</div>`;
}

/* Заявка: WhatsApp и форма из трёх полей — где пахнет, площадь, телефон. o.place подставляет помещение. */
function cta(p, o) {
  const AREAS = ['до 50 м²', '50–150 м²', '150–300 м²', '300–1000 м²', 'больше 1000 м²'];
  const sel = o.place && PK.find(x => x.slug === o.place);
  return `<section class="sec cta-sec" id="zayavka"><div class="wrap">
  <div class="cta">
    <div class="cta-a">
      <p class="k k-l">Заявка</p>
      <h2 class="h2">${o.title || 'Напишите, где пахнет, — подберём аппарат'}</h2>
      <p class="lead">Подберём аппарат и масло под ваш запах и площадь, привезём и включим в тот же день. Масла и обслуживание — наши.</p>
      <ul class="ticks">${[OFFER.start, OFFER.reply, OFFER.trial].map(t => `<li>${icon('check')}${t}</li>`).join('')}</ul>
      <a class="btn btn-wa" href="${wa(p.pageName, o.wa || '')}" target="_blank" rel="noopener">${icon('wa')}Написать в WhatsApp</a>
    </div>
    <form class="form" id="lead-form" novalidate>
      <label>Где пахнет<select id="f-place">${PK.map(x => `<option${sel === x ? ' selected' : ''}>${x.label}</option>`).join('')}<option>Другое помещение</option></select></label>
      <label>Площадь<select id="f-area">${AREAS.map((a, i) => `<option${i === 1 ? ' selected' : ''}>${a}</option>`).join('')}</select></label>
      <label class="f-wide">Телефон<input id="f-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 7__ ___-__-__"></label>
      <label class="f-chk f-wide"><input id="f-test" type="checkbox" checked>Хочу тест: ${TRIAL.toLowerCase()}</label>
      <button class="btn" type="submit">${icon('wa')}Отправить заявку</button>
      <p class="f-note">Заявка откроется в WhatsApp с готовым сообщением · или позвоните <a href="tel:${C.phoneRaw}">${C.phone}</a></p>
    </form>
  </div>
</div></section>`;
}

function related(title, links) {
  return `<section class="sec sec-t"><div class="wrap"><p class="k">${title}</p><div class="chips">${links.map(([n, h]) => `<a class="chip" href="/${h}">${esc(n)}${icon('arrow')}</a>`).join('')}</div></div></section>`;
}

/* Коллекция ароматов: слева коричневая панель со списком, справа фото и карточка выбранного аромата.
   o.page — режим страницы каталога (H1, все ароматы, фото прилипает к экрану, вместо «Подробнее» — подбор). */
function collection(p, list, o = {}) {
  const ALT = require('./collection').ALT;
  const H = o.page ? 'h1' : 'h2';
  const first = list[0];
  const waPick = s => wa(p.pageName, `Хочу подобрать аромат: ${s.name}.`);
  const waSample = s => wa(p.pageName, `Хочу пробник аромата ${s.name} (${s.no}).`);
  const more = s => o.page ? waPick(s) : `/aromaty/?a=${s.slug}`;
  const data = list.map(s => ({ s: s.slug, n: s.name, no: s.no, f: `${s.fam} · ${s.pow}`, d: s.desc, t: s.notes, w: s.where, p: s.photo, m: o.page ? waPick(s) : s.slug, sm: waSample(s) }));
  const photos = [...new Set(list.map(s => s.photo))];
  return `<section class="kl${o.page ? ' kl-page' : ''}" id="kollekciya">
  <div class="kl-l">
    <p class="kl-k">коллекция</p>
    <${H} class="kl-h">${o.title || 'Ароматы <em>для вашего пространства</em>'}</${H}>
    <p class="kl-lead">${o.lead || 'Выберите аромат — покажем, какой он и&nbsp;где раскрывается лучше всего.'}</p>
    <div class="kl-list" role="tablist" aria-label="Ароматы">${list.map((s, i) => `<button type="button" class="kl-it${i ? '' : ' on'}" role="tab" aria-selected="${!i}" data-i="${i}"><em>${s.no}</em>${esc(s.name)}<small>${s.famLow}</small></button>`).join('')}</div>
    ${o.page ? '' : '<a class="kl-all" href="/aromaty/">Смотреть все 32 аромата →</a>'}
    <p class="kl-mot">Названия — по&nbsp;мотивам известных ароматов.</p>
  </div>
  <div class="kl-r" data-scroll-x>
    ${photos.map((ph, i) => `<img class="kl-ph${ph === first.photo ? ' on' : ''}" data-ph="${ph}" src="${site.url(`assets/img/${ph}.webp`)}" alt="${ALT[ph]}"${i ? ' loading="lazy"' : ''}>`).join('')}
    <article class="kl-card" aria-live="polite">
      <div class="kl-circ"><img data-k="img" src="${site.url(`assets/img/${first.photo}.webp`)}" alt="${ALT[first.photo]}" loading="lazy"></div>
      <div class="kl-cb">
        <p class="kl-fam" data-k="f">${first.fam} · ${first.pow}</p>
        <h3 class="kl-nm" data-k="n">${esc(first.name)}</h3>
        <p class="kl-ds" data-k="d">${esc(first.desc)}</p>
        <div class="kl-nt" data-k="t">${first.notes.map(x => `<span>${esc(x)}</span>`).join('')}</div>
        <p class="kl-wh">Где выбирают: <b data-k="w">${esc(first.where)}</b></p>
      </div>
      <div class="kl-rows">
        <a class="kl-row" data-k="m" href="${more(first)}"${o.page ? ' target="_blank" rel="noopener"' : ''}>${o.page ? 'Подобрать для моего помещения' : 'Подробнее об&nbsp;аромате'}<b>→</b></a>
        <a class="kl-row" data-k="sm" href="${waSample(first)}" target="_blank" rel="noopener">Заказать пробник<b>→</b></a>
      </div>
    </article>
  </div>
  <script type="application/json" class="kl-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</section>`;
}

module.exports = { collection, init, layout, icon, pageHead, picker, odorTile, placeTile, faq, scentRow, cta, related, priceCard, pm, setupPm, setupMonth, setupText, wa, waLink, waText, C, PK, OFFER, TRIAL };
