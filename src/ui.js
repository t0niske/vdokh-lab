/* ВДОХ: layout и блоки. Служба устранения запахов: светлый «отчёт об осмотре», графит и лайм,
   один шрифт Golos Text. */
const D = require('../lib/data');
const { esc } = require('../lib/engine');
const ODORS = require('./odors');
const PLACES = require('./places');

let site;
const init = s => { site = s; };

/* Предложение компании — заготовки, уточнить у владельца (как company/trialDays в data.js) */
const OFFER = {
  diag: 'Выезд и осмотр — бесплатно',
  reply: 'Ответим в WhatsApp за 15 минут в рабочее время',
  start: 'Запуск в день обращения'
};

const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  wa: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9.5 9.5c0 2.5 2.5 5 5 5l1-1.3-1.8-.9-.8.7c-1-.4-1.9-1.3-2.3-2.3l.7-.8-.9-1.8z"/>',
  phone: '<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  search: '<path d="M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 1 0 0-13zM15.5 15.5 20 20"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  wind: '<path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
  done: '<path d="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18z"/><path d="M8 12.2l2.8 2.8L16 9.5"/>',
  pipe: '<path d="M2 7h8v4H2zM10 9h5a4 4 0 0 1 4 4v7M16 20h6"/>',
  wc: '<path d="M7 3h5v6H7zM5 9h12a5 5 0 0 1-5 5H9a4 4 0 0 1-4-4zM9 14l-1 7h7l-1-7"/>',
  pan: '<path d="M3 12h13a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM16 13h5M8 4c-1 1.5 1 2.5 0 4M12 4c-1 1.5 1 2.5 0 4"/>',
  smoke: '<path d="M2 16h14v3H2zM18.5 16v3M21.5 16v3M17 5c0 2 2 2 2 4s-2 2-2 4M20.5 5c0 2 1.5 2 1.5 4"/>',
  drop: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11zM9 14a3 3 0 0 0 3 3"/>',
  gym: '<path d="M6 7v10M3 9.5v5M18 7v10M21 9.5v5M6 12h12"/>',
  bin: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/>',
  paw: '<path d="M12 12c-3 0-5 3-5 5 0 2 2 3 5 2 3 1 5 0 5-2 0-2-2-5-5-5zM5.5 9a1.5 2 0 1 0 3 0 1.5 2 0 1 0-3 0M9 5.5a1.5 2 0 1 0 3 0 1.5 2 0 1 0-3 0M12.5 5.5a1.5 2 0 1 0 3 0 1.5 2 0 1 0-3 0M16 9a1.5 2 0 1 0 3 0 1.5 2 0 1 0-3 0"/>',
  bottle: '<path d="M10 3h4v3h-4zM9 6h6l1 3v11H8V9zM8 13h8"/>',
  roller: '<path d="M4 4h13v5H4zM17 6.5h3v5h-8v3M11 14.5h2v6h-2z"/>',
  cross: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  cup: '<path d="M4 9h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10.5h1.5a2 2 0 0 1 0 4H16M3 21h15M8 3.5c-1 1.5 1 2 0 3.5M12 3.5c-1 1.5 1 2 0 3.5"/>',
  cloche: '<path d="M3 17h18M5 17a7 7 0 0 1 14 0M12 8V6M10 6h4M2 20h20"/>',
  building: '<path d="M5 21V4h10v17M15 9h4v12M3 21h18M8 8h1M11 8h1M8 12h1M11 12h1M8 16h1M11 16h1"/>',
  scissors: '<path d="M3 7a3 3 0 1 0 6 0 3 3 0 1 0-6 0M3 17a3 3 0 1 0 6 0 3 3 0 1 0-6 0M8.5 8.5 20 19M8.5 15.5 20 5"/>',
  case: '<path d="M3 8h18v12H3zM9 8V5h6v3M3 13h18"/>',
  bed: '<path d="M3 19V6M3 14h18v5M21 14v-3a3 3 0 0 0-3-3h-7v6M5 10.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0"/>'
};
const icon = (n, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

const LOGO = `<svg class="logo-m" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15"/><path d="M8 13c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0M8 19c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0"/></svg>`;

const NAV = [['Запахи', 'zapahi/'], ['Помещения', 'pomeshcheniya/'], ['Как мы работаем', 'kak-my-rabotaem/'], ['Цены', 'ceny/'], ['Статьи', 'stati/'], ['Контакты', 'kontakty/']];

function header(p) {
  return `<a class="skip" href="#main">К содержанию</a>
<header class="hdr" id="hdr">
  <div class="hdr-in">
    <a class="logo" href="/" aria-label="ВДОХ — на главную">${LOGO}<span>ВДОХ</span></a>
    <nav class="menu" id="menu" aria-label="Основное меню">${NAV.map(([n, h]) => `<a href="/${h}"${p.section === h ? ' aria-current="true"' : ''}>${n}</a>`).join('')}<a class="menu-ph" href="tel:${D.contacts.phoneRaw}">${icon('phone')}${D.contacts.phone}</a></nav>
    <a class="hdr-ph" href="tel:${D.contacts.phoneRaw}">${D.contacts.phone}</a>
    <a class="btn btn-s hdr-cta" href="#zayavka">Описать запах</a>
    <button class="burger" id="burger" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="menu">${icon('menu')}${icon('close', 'ic ic-x')}</button>
  </div>
</header>`;
}

function footer() {
  const C = D.contacts;
  return `<footer class="ftr">
  <div class="wrap ftr-in">
    <div class="ftr-a"><a class="logo" href="/">${LOGO}<span>ВДОХ</span></a><p>Служба устранения неприятных запахов в коммерческих помещениях Астаны. Находим причину, говорим, что исправить, и держим чистый воздух по подписке.</p></div>
    <nav aria-label="Запахи"><p class="ftr-k">Запахи</p>${ODORS.map(o => `<a href="/zapahi/${o.slug}/">${o.short}</a>`).join('')}</nav>
    <nav aria-label="Помещения"><p class="ftr-k">Помещения</p>${PLACES.map(o => `<a href="/pomeshcheniya/${o.slug}/">${o.name}</a>`).join('')}</nav>
    <div><p class="ftr-k">Связь</p><address><a href="tel:${C.phoneRaw}">${C.phone}</a><a href="${D.waLink()}" target="_blank" rel="noopener">WhatsApp</a><a href="${C.map2gis}" target="_blank" rel="noopener">${C.address}</a><span>${C.hours}</span></address>
    <p class="ftr-k ftr-k2">Компания</p><a href="/kak-my-rabotaem/">Как мы работаем</a><a href="/ceny/">Цены</a><a href="/voprosy/">Вопросы</a><a href="/stati/">Статьи</a></div>
  </div>
  <div class="wrap ftr-bot"><span>© 2026 ВДОХ · Астана</span><a href="/politika-konfidencialnosti/">Политика конфиденциальности</a></div>
</footer>`;
}

function layout(p, head) {
  return `<!doctype html>
<html lang="ru">
<head>
${head}
<script>document.documentElement.classList.add('js')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/assets/css/style.css">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
</head>
<body class="${p.bodyClass || ''}">
${header(p)}
<main id="main">
${p.body}
${p.noCta ? '' : cta(p.cta || {})}
</main>
${footer()}
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

/* Подбор: «где пахнет» → «чем пахнет» → вероятные причины, что проверить и что сделаем мы.
   place — заранее выбранное помещение (на страницах помещений шаг 1 скрыт). */
function picker(o = {}) {
  const pl = o.place ? PLACES.find(x => x.slug === o.place) : null;
  return `<div class="pk${o.cls ? ' ' + o.cls : ''}" data-picker${pl ? ` data-place="${pl.slug}"` : ''}>
  <a hidden data-zap href="/zapahi/"></a>
  <div class="pk-h"><span class="pk-dot"></span>${o.title || 'Подбор решения за 2 шага'}</div>
  ${pl ? '' : `<fieldset class="pk-step" data-step="1"><legend><span class="pk-n">1</span>Где пахнет?</legend>
    <div class="pk-chips">${PLACES.map(x => `<button type="button" class="pc" data-v="${x.slug}" aria-pressed="false">${icon(x.icon)}${x.name}</button>`).join('')}</div></fieldset>`}
  <fieldset class="pk-step" data-step="2"${pl ? '' : ' disabled'}><legend><span class="pk-n">${pl ? 1 : 2}</span>Чем пахнет?</legend>
    <div class="pk-chips" data-odors>${ODORS.map(x => `<button type="button" class="pc" data-v="${x.slug}" aria-pressed="false">${icon(x.icon)}${x.name}</button>`).join('')}</div></fieldset>
  <div class="pk-res" aria-live="polite" data-res><p class="pk-wait">${pl ? 'Выберите запах — покажем вероятные причины и что делать.' : 'Выберите помещение и запах — покажем вероятные причины и что делать.'}</p></div>
</div>`;
}

function odorTile(o) {
  return `<a class="ot" href="/zapahi/${o.slug}/">${icon(o.icon, 'ic ot-ic')}<span class="ot-t">${o.short}</span><span class="ot-d">${esc(o.signs[0])}</span>${icon('arrow', 'ic ot-go')}</a>`;
}

function placeTile(p) {
  return `<a class="pt" href="/pomeshcheniya/${p.slug}/">${site.img('place-' + p.slug, { cls: 'pt-img' })}<span class="pt-b"><span class="pt-k">${icon(p.icon)}${p.short}</span><span class="pt-t">${p.h1}</span><span class="pt-o">${p.odors.map(s => ODORS.find(x => x.slug === s).name).join(' · ')}</span></span></a>`;
}

function faq(list, title = 'Частые вопросы') {
  return `<section class="sec"><div class="wrap faq-g">
  <div><h2 class="h2">${title}</h2><p class="faq-n">Не нашли ответ? <a href="${D.waLink('Здравствуйте! У меня вопрос про запах в помещении.')}" target="_blank" rel="noopener">Спросите в WhatsApp</a> или посмотрите <a href="/voprosy/">все вопросы</a>.</p></div>
  <div class="faq">${list.map(([q, a]) => `<details><summary><span>${esc(q)}</span>${icon('plus')}</summary><p>${a}</p></details>`).join('')}</div>
</div></section>`;
}

function scentRow(s) {
  return `<li class="sr"><div><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p></div><span class="sr-notes">${esc(s.notes.join(' · '))}</span></li>`;
}

/* Заявка: место и запах — те же списки, что в подборе; o.place / o.odor подставляют значения */
function cta(o) {
  return `<section class="sec cta-sec" id="zayavka"><div class="wrap">
  <div class="cta">
    <div class="cta-a">
      <p class="k k-l">Заявка на осмотр</p>
      <h2 class="h2">${o.title || 'Опишите запах — скажем, откуда он и что делать'}</h2>
      <p class="lead">Часто причина понятна уже по описанию. Если нет&nbsp;— приедем, пройдём помещение и дадим список того, что исправить.</p>
      <ul class="ticks">${[OFFER.diag, OFFER.reply, OFFER.start].map(t => `<li>${icon('check')}${t}</li>`).join('')}</ul>
    </div>
    <form class="form" id="lead-form" novalidate>
      <label>Где пахнет<select id="f-place">${PLACES.map(x => `<option${o.place === x.slug ? ' selected' : ''}>${x.name}</option>`).join('')}<option>Другое помещение</option></select></label>
      <label>Чем пахнет<select id="f-odor">${ODORS.map(x => `<option${o.odor === x.slug ? ' selected' : ''}>${x.short}</option>`).join('')}<option>Не могу определить</option></select></label>
      <label>Когда сильнее<select id="f-when"><option>Утром и после выходных</option><option>Вечером, в часы пик</option><option>Всё время</option><option>Не замечал</option></select></label>
      <label>Комментарий<input id="f-note" placeholder="Например: у туалета, после дождя"></label>
      <button class="btn" type="submit">${icon('wa')}Отправить в WhatsApp</button>
      <p class="f-note">Откроется WhatsApp с готовым сообщением · или позвоните <a href="tel:${D.contacts.phoneRaw}">${D.contacts.phone}</a></p>
    </form>
  </div>
</div></section>`;
}

function related(title, links) {
  return `<section class="sec sec-t"><div class="wrap"><p class="k">${title}</p><div class="chips">${links.map(([n, h]) => `<a class="chip" href="/${h}">${esc(n)}${icon('arrow')}</a>`).join('')}</div></div></section>`;
}

const pm = d => D.fmt(Math.min(...d.plans.map(D.perMonth)));
/* Цена комплекта при подписке на 6 месяцев */
const setupPm = s => s.n300 * D.perMonth(D.devices[0].plans[2]) + s.n1000 * D.perMonth(D.devices[1].plans[2]);
const setupText = s => [s.n1000 ? `${s.n1000} × Nova 1000` : '', s.n300 ? `${s.n300} × Nova 300` : ''].filter(Boolean).join(' + ');

module.exports = { init, layout, icon, pageHead, picker, odorTile, placeTile, faq, scentRow, cta, related, pm, setupPm, setupText, OFFER };
