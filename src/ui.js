/* Aromé: layout и блоки. Ароматизация пространств для бизнеса: аппарат подключаем к вентиляции и заправляем
   маслом — аромат расходится по воздуховодам и создаёт атмосферу. Светлый тёплый серый, графит и терракота,
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

/* Шапка (согласована 27.10.2026): логотип, меню во вкладке, звонок, WhatsApp, «Подобрать решение».
   На главной лежит внутри первого экрана и светлеет после прокрутки, на внутренних страницах сразу светлая
   (body.hx-solid). Текущий раздел подчёркнут. «Коллекция» — каталог ароматов /aromaty/ */
const HX_NAV = [['Пространства', 'pomeshcheniya/'], ['Коллекция', 'aromaty/'], ['Метод', 'kak-my-rabotaem/'], ['Цены', 'ceny/'], ['Блог', 'stati/']];
/* «Пространства»: на компьютере — выпадающая панель по наведению и фокусу, в меню телефона — раскрывающийся список */
const CHEV = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function hxHeader(p) {
  const cur = h => p.section && p.section === h ? ' aria-current="page"' : '';
  const link = ([n, h]) => `<a href="/${h}"${cur(h)}>${n}</a>`;
  const tab = x => x[1] !== 'pomeshcheniya/' ? link(x) : `<div class="hx-dd"><a href="/${x[1]}"${cur(x[1])} aria-haspopup="true">${x[0]}${CHEV}</a>
      <div class="hx-ddp"><div class="hx-ddh"><span>все форматы</span><a href="/${x[1]}">Все пространства<i>→</i></a></div><div class="hx-ddl">${spaceLinks()}</div></div></div>`;
  const mob = x => x[1] !== 'pomeshcheniya/' ? link(x) : `<details class="hx-msub"><summary>${x[0]}</summary><div><a href="/${x[1]}">Все пространства</a>${spaceLinks()}</div></details>`;
  return `<header class="hx-top">
    <a class="hx-logo" href="/" aria-label="Aromé — на главную">Aromé</a>
    <nav class="hx-tab" aria-label="Разделы">${HX_NAV.map(tab).join('')}</nav>
    <div class="hx-r">
      <a class="hx-call" href="tel:${C.phoneRaw}" aria-label="Позвонить">${icon('phone')}</a>
      <a class="hx-wa" href="${wa(p.pageName)}" target="_blank" rel="noopener" aria-label="Написать в WhatsApp">${icon('wa')}<span>WhatsApp</span></a>
      <a class="hx-ul" href="#zayavka">Подобрать решение</a>
      <button class="hx-burger" id="burger" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="menu"><i></i></button>
    </div>
    <nav class="menu hx-menu" id="menu" aria-label="Основное меню">${HX_NAV.map(mob).join('')}<a class="menu-ph" href="tel:${C.phoneRaw}">${icon('phone')}${C.phone}</a></nav>
  </header>`;
}

/* На телефоне — закреплённая нижняя панель «WhatsApp · Позвонить», без всплывающих окон */
function mbar(p) {
  return `<div class="mbar" aria-label="Связаться">
  <a class="mbar-wa" href="${p.noCta ? '/#zayavka' : '#zayavka'}">Оставить заявку</a>
  <a class="mbar-ph" href="tel:${C.phoneRaw}">${icon('phone')}Позвонить</a>
</div>`;
}

/* Подвал (28.10.2026, по референсу): коричневая плашка, слева «Остались вопросы?», колонки связи и пространств,
   внизу название крупными буквами, обрезанное краем плашки. разделы — те же, что в шапке; «Запахов» и адреса нет — только город */
function footer() {
  return `<footer class="ft">
  <div class="ft-card">
    <div class="ft-g">
      <div class="ft-a">
        <p class="ft-h">Остались <em>вопросы?</em></p>
        <p class="ft-t">Напишите нам — подскажем аромат и&nbsp;решение для вашего пространства</p>
        <a class="ft-btn" href="${waLink()}" target="_blank" rel="noopener">${icon('wa')}Написать</a>
      </div>
      <nav class="ft-col" aria-label="Меню">
        <p class="ft-k">Меню</p>
        <a href="/pomeshcheniya/">Пространства</a><a href="/aromaty/">Коллекция</a><a href="/kak-my-rabotaem/">Метод</a><a href="/ceny/">Цены</a><a href="/stati/">Блог</a>
      </nav>
      <div class="ft-col">
        <p class="ft-k">Связь</p>
        <a href="tel:${C.phoneRaw}">${C.phone}</a>
        <a href="${waLink()}" target="_blank" rel="noopener">WhatsApp</a>
        <span>Астана</span>
        ${C.hours ? `<span>${C.hours}</span>` : ''}
      </div>
      <nav class="ft-col ft-pl" aria-label="Пространства">
        <p class="ft-k">Пространства</p>
        <div>${spaceLinks()}</div>
      </nav>
    </div>
    <p class="ft-word" aria-hidden="true">Aromé</p>
  </div>
  <div class="ft-bot"><span>© 2026 Aromé · Астана</span><a href="/politika-konfidencialnosti/">Политика конфиденциальности</a></div>
</footer>`;
}

/* Счётчики подключаются, только когда номер заполнен в config.js */
function analytics() {
  const A = CFG.analytics;
  let s = `<script>window.dataLayer=window.dataLayer||[];window.AROME_AN=${JSON.stringify({ ym: A.ym || '', ga4: A.ga4 || '' })};</script>`;
  /* код Метрики — как выдаёт Яндекс (загрузчик tag.js?id=…, вебвизор, карта кликов) */
  /* грузим через 5 с после load в простое браузера или при первом действии посетителя: вебвизор не тормозит первый экран (Lighthouse 30.10.2026: TBT 4,9 с → 0) */
  if (A.ym) s += `\n<script>(function(){var go=function(){if(window.__ymGo)return;window.__ymGo=1;(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${Number(A.ym)}','ym');ym(${Number(A.ym)},'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:'dataLayer',referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true})};['scroll','pointerdown','keydown','touchstart'].forEach(function(ev){addEventListener(ev,go,{once:true,passive:true})});addEventListener('load',function(){setTimeout(function(){(window.requestIdleCallback||setTimeout)(go)},5000)})})();</script>`; // без <noscript>-пикселя: проверка сборки требует alt у картинок, а посетителей без JS почти нет
  if (A.ga4) s += `\n<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(A.ga4)}"></script><script>function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(A.ga4)}');</script>`;
  return s;
}

/* Версия в адресах стилей и скриптов (?v=…) — хэш их содержимого: GitHub Pages кэширует файлы до 10 минут,
   и без версии браузер после публикации показывает новую страницу со старыми стилями */
/* Шрифты лежат у нас (assets/fonts), @font-face встраиваем в <head>: без похода на Google Fonts первый экран рисуется быстрее */
const FONTS = require('fs').readFileSync(require('path').join(__dirname, 'assets', 'css', 'fonts.css'), 'utf8')
  .replace(/^\/\*.*\*\/\n/m, '').replace(/url\(\.\.\/fonts\//g, 'url(/assets/fonts/');

const VER = require('crypto').createHash('md5')
  .update(['css/style.css', 'js/main.js', 'favicon.svg'].map(f => require('fs').readFileSync(require('path').join(__dirname, 'assets', f))).join(''))
  .digest('hex').slice(0, 8);

function layout(p, head) {
  /* Переадресация со старых адресов (статьи, заменённые новой); адрес в meta относительный — base его не переписывает */
  if (p.redirect) return `<!doctype html>
<html lang="ru">
<head>
${head}
<meta http-equiv="refresh" content="0; url=${'../'.repeat(p.path.split('/').filter(Boolean).length)}${p.redirect}">
<link rel="stylesheet" href="/assets/css/style.css?v=${VER}">
<link rel="icon" href="/assets/favicon.svg?v=${VER}" type="image/svg+xml">
<link rel="icon" href="/assets/favicon-32.png?v=${VER}" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png?v=${VER}">
</head>
<body><main class="wrap nf"><h1>Страница переехала</h1><p class="lead"><a href="/${p.redirect}">Перейти на новую страницу</a></p></main></body>
</html>`;
  return `<!doctype html>
<html lang="ru">
<head>
${head}
<script>document.documentElement.classList.add('js')</script>
${analytics()}
<link rel="preload" href="/assets/fonts/inter-tight-normal-100-900-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/golos-text-normal-400-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<style>${FONTS}</style>
<link rel="stylesheet" href="/assets/css/style.css?v=${VER}">
<link rel="icon" href="/assets/favicon.svg?v=${VER}" type="image/svg+xml">
<link rel="icon" href="/assets/favicon-32.png?v=${VER}" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png?v=${VER}">
</head>
<body class="${p.ownHeader ? p.bodyClass || '' : `hx-solid pg-body${p.bodyClass ? ' ' + p.bodyClass : ''}`}" data-page="${esc(p.pageName)}">
<a class="skip" href="#main">К содержанию</a>
${p.ownHeader ? '' : hxHeader(p)}
<main id="main">
${p.body}
${p.noCta ? '' : p.leadForm ? leadForm(p) : cta(p, p.cta || {})}
</main>
${footer()}
${reqModal(p)}
${mbar(p)}
<script src="/assets/js/data.js?v=${VER}"></script>
<script src="/assets/js/main.js?v=${VER}"></script>
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

/* Этапы (28.10.2026, по референсу — лесенка из карточек): подпись слева, заголовок над двумя карточками,
   второй ряд сдвинут влево. Последний этап — коричневый, как акцентные карточки в других блоках */
const STAGES = [
  ['Заявка', 'Расскажите о&nbsp;своём пространстве: формат, площадь, часы работы и&nbsp;какое впечатление хотите создать'],
  ['Подбор аромата', 'Предлагаем композиции под характер бизнеса и&nbsp;даём пробники. Под площадь подбираем Nova 300 или Nova 1000'],
  ['Установка и&nbsp;настройка', 'Подключаем аппарат к&nbsp;вентиляции, настраиваем расписание и&nbsp;интенсивность под часы работы'],
  ['Тест и&nbsp;обслуживание', `Первые ${D.trialDays}&nbsp;дня бесплатно. Дальше меняем масла, следим за&nbsp;работой и&nbsp;заменяем аппарат при поломке`]
];
/* o.self — блок стоит на самой странице «Метод»: ссылку «Подробнее о методе» не показываем */
function stages(o = {}) {
  return `<section class="et" id="etapy">
  <div class="et-wrap">
    <p class="et-k">этапы</p>
    <h2 class="et-h">Как мы запускаем <em>аромат в&nbsp;вашем пространстве</em></h2>
    <div class="et-side"><p>Обычно всё занимает один день — от&nbsp;заявки до&nbsp;аромата в&nbsp;зале</p>${o.self ? '' : '<a href="/kak-my-rabotaem/">Подробнее о&nbsp;методе</a>'}</div>
    ${STAGES.map(([t, d], i) => `<article class="et-c et-c${i + 1}"><span class="et-n">0${i + 1}</span><h3>${t}</h3><p>${d}</p></article>`).join('\n    ')}
  </div>
</section>`;
}

/* Вопросы на главной (по референсу 28.10.2026): список во всю ширину, справа круглая кнопка «+», у открытого — «×».
   Первый вопрос открыт. Точки в конце ответов убираем, как во всех новых блоках главной */
function faqHome(list, p, o = {}) {
  const noDot = s => s.replace(/\.$/, '');
  /* o.bare — только список: на странице «Вопросы» заголовок даёт верх страницы, поэтому вопросы там h2 (сразу под h1) */
  const hn = o.bare ? 'h2' : 'h3';
  return `<section class="fq" id="voprosy">
  <div class="fq-wrap">${o.bare ? '' : `
    <p class="fq-k">вопросы</p>
    <div class="fq-top">
      <h2 class="fq-h">${o.h || 'Частые <em>вопросы</em>'}</h2>
      <p class="fq-lead">Не нашли ответ? <a href="${wa(p.pageName, 'У меня вопрос.')}" target="_blank" rel="noopener">Спросите в&nbsp;WhatsApp</a> — ответим и&nbsp;подскажем по&nbsp;вашему пространству</p>
    </div>`}
    <div class="fq-list">${list.map(([q, a], i) => `<details class="fq-it"${i ? '' : ' open'}><summary><${hn} class="fq-q">${esc(noDot(q))}</${hn}><i aria-hidden="true"></i></summary><p>${noDot(a)}</p></details>`).join('')}</div>
  </div>
</section>`;
}

/* Цены (согласованы 28.10.2026, макет design/arome-home/price.html): фото небольшого помещения → Nova 300,
   фото большого → Nova 1000 коричневой карточкой. Суммы — из data.js (прайс PDF) */
const PR_CARD = {
  nova300: { photo: 'pr-small', alt: 'Небольшая кофейня с травертиновыми столиками', tag: 'Небольшое помещение', for: 'Бутик, кофейня, салон, офис' },
  nova1000: { photo: 'pr-large', alt: 'Просторное лобби отеля с колоннами из травертина', tag: 'Большое пространство', for: 'Лобби отеля, торговый зал, ресторан', dark: true }
};
const months = n => n + ' ' + (n === 1 ? 'месяц' : n < 5 ? 'месяца' : 'месяцев');
/* o.bare — без подписи и заголовка: на странице «Цены» их заменяет верх страницы.
   Тогда названия аппаратов — h2 (сразу под h1), иначе h3 под «Стоимость подписки» */
function pricing(o = {}) {
  const hn = o.bare ? 'h2' : 'h3';
  return `<section class="pr" id="${o.bare ? 'podpiska' : 'ceny'}">
  <div class="pr-wrap">${o.bare ? '' : `
    <p class="pr-k">цены</p>
    <div class="pr-top">
      <h2 class="pr-h">Стоимость <em>подписки</em></h2>
      <p class="pr-lead">Аппарат в&nbsp;аренду, масла, настройка и&nbsp;обслуживание — в&nbsp;одной цене. Первые ${D.trialDays}&nbsp;дня бесплатно</p>
    </div>`}
    <div class="pr-grid">
      ${D.devices.map(d => { const c = PR_CARD[d.id]; return `<div class="pr-ph"><img src="${site.url(`assets/img/${c.photo}.webp`)}" alt="${c.alt}" loading="lazy"><span>${c.tag} · <b>до ${d.area} м²</b></span></div>
      <article class="pr-card${c.dark ? ' pr-dk' : ''}">
        <p class="pr-fit">до ${d.area} м²</p>
        <${hn} class="pr-nm">${d.name}</${hn}>
        <p class="pr-for">${c.for}</p>
        <p class="pr-sub">Подписка</p>
        <ul class="pr-rows">${d.plans.map(pl => `<li>${pl.months > 1 && pl === d.plans[d.plans.length - 1] ? `<span>${months(pl.months)}<small>${D.fmt(D.perMonth(pl))} в&nbsp;месяц</small></span>` : months(pl.months)}<b>${D.fmt(pl.total)}</b></li>`).join('')}</ul>
        <a class="pr-btn" href="#zayavka">Оставить заявку</a>
      </article>`; }).join('\n      ')}
    </div>
  </div>
</section>`;
}

/* Верх внутренней страницы (вариант A, согласован 28.10.2026, макет design/arome-home/inner-gen.js):
   крошки в квадратных скобках строчными, H1 с курсивной второй строкой, справа текст. Плашки с фактами пользователь убрал */
/* крошки строчными, но сокращения (SPA, ТРЦ, ЖК, ОСИ) остаются заглавными */
const low = n => n.split(' ').map(w => /^[A-ZА-ЯЁ]{2,}$/.test(w) ? w : w.toLowerCase()).join(' ');
const pgCrumbs = p => `<nav class="pg-k" aria-label="Хлебные крошки">${p.breadcrumbs.map(([n, h], i, a) => i < a.length - 1 ? `<a href="/${h}">${low(n)}</a>` : `<span aria-current="page">${low(n)}</span>`).join(' / ')}</nav>`;
/* Неразрывный пробел после коротких слов и чисел («в&nbsp;зале», «до&nbsp;300&nbsp;м²») — для текстов из данных */
const nb = s => [1, 2].reduce(t => t.replace(/(^|[\s«(—])([а-яёА-ЯЁA-Za-z0-9]{1,3}) (?=\S)/g, '$1$2&nbsp;'), s);
/* Дата по-русски для статей блога. На коммерческих страницах строку «Обновлено … · Редакция» не выводим (решение владельца 30.10.2026):
   дата правки остаётся только в sitemap (lastmod) */
const dateRu = d => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '');

function pageTop(p, o) {
  return `<section class="pg">
  <div class="pg-wrap">
    ${pgCrumbs(p)}
    <div class="pg-top">
      <h1 class="pg-h">${o.h1}</h1>
      <div class="pg-side">
        <p>${o.lead}</p>
      </div>
    </div>
  </div>
</section>`;
}

/* Что входит в подписку (страница «Цены»): слева заголовок, справа 6 пунктов в две колонки с курсивными номерами */
const INCL = [
  ['Аппарат Nova', 'Металлический диффузор на&nbsp;время подписки — оборудование покупать не&nbsp;нужно'],
  ['Подбор аромата', 'Пробники композиций из&nbsp;коллекции под&nbsp;характер вашего бизнеса'],
  ['Установка', 'Подключаем аппарат к&nbsp;вентиляции и&nbsp;настраиваем расписание под&nbsp;часы работы'],
  ['Масла', 'Заправляем аромамасло по&nbsp;графику — следить за&nbsp;уровнем не&nbsp;нужно'],
  ['Сервис', 'Проверяем работу и&nbsp;заменяем аппарат при поломке'],
  ['Смена аромата', 'Захотите другой аромат — поменяем при ближайшем визите без доплаты']
];
function included() {
  return `<section class="inc" id="chto-vhodit">
  <div class="inc-wrap">
    <div>
      <p class="inc-k">что входит</p>
      <h2 class="inc-h">Всё для аромата <em>в&nbsp;одной подписке</em></h2>
      <p class="inc-lead">Вам не&nbsp;нужно ничего покупать и&nbsp;заправлять — за&nbsp;аппаратом и&nbsp;ароматом следим мы</p>
    </div>
    <ol class="inc-list">${INCL.map(([t, d], i) => `<li><i>0${i + 1}</i><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
  </div>
</section>`;
}

/* Какой комплект нужен (страница «Цены»): строки по площади, цена в месяц при подписке на 6 месяцев — из прайса */
function kits() {
  const [n300, n1000] = D.devices, m6 = d => D.perMonth(d.plans[2]);
  const rows = [
    ['Бутик, кофейня, салон, офис', `до ${n300.area} м²`, `1 × ${n300.name}`, D.fmt(m6(n300))],
    ['Ресторан, лобби отеля, торговый зал', `до ${n1000.area} м²`, `1 × ${n1000.name}`, D.fmt(m6(n1000))],
    ['Несколько залов или этажей', `больше ${n1000.area} м²`, `${n1000.name} + ${n300.name}`, 'от ' + D.fmt(m6(n1000) + m6(n300))]
  ];
  return `<section class="kn" id="komplekt">
  <div class="kn-wrap">
    <p class="kn-k">сколько аппаратов</p>
    <div class="kn-top">
      <h2 class="kn-h">Какой комплект <em>нужен вашему пространству</em></h2>
      <p class="kn-lead">Считаем по&nbsp;площади. Точный комплект подскажем после заявки — по&nbsp;планировке и&nbsp;вентиляции</p>
    </div>
    <div class="kn-tb" role="table" aria-label="Комплект аппаратов по площади">
      <div class="kn-row kn-th" role="row"><span role="columnheader">Пространство</span><span role="columnheader">Площадь</span><span role="columnheader">Комплект</span><span class="kn-pr" role="columnheader">В&nbsp;месяц</span></div>
      ${rows.map(([s, a, k, pr]) => `<div class="kn-row" role="row"><span class="kn-sp" role="cell">${s}</span><span class="kn-ar" role="cell">${a}</span><span class="kn-set" role="cell">${k}</span><span class="kn-pr" role="cell">${pr}<small>в&nbsp;месяц</small></span></div>`).join('\n      ')}
    </div>
    <div class="kn-foot"><p class="kn-note">Цена в&nbsp;месяц при подписке на&nbsp;6&nbsp;месяцев</p><a class="kn-btn" href="#zayavka">Рассчитать для моего пространства</a></div>
  </div>
</section>`;
}

/* Сравнение «Свечи, спреи или аромамаркетинг» (согласовано 28.10.2026, макет design/arome-home/compare.html):
   на компьютере таблица с коричневой колонкой Aromé, на телефоне — карточка на каждый критерий */
const VS_COLS = ['Свечи и&nbsp;спреи', 'Диффузор с&nbsp;палочками'];
const VS_SHORT = ['Свечи и спреи', 'Палочки'];
const VS_ROWS = [
  ['Где чувствуется', 'Рядом со&nbsp;свечой или там, где распылили', 'Около флакона', 'Ровно во&nbsp;всех залах — через вентиляцию'],
  ['Сколько держится', 'Пока горит свеча, после спрея — минуты', 'Постоянно, но&nbsp;слабо', 'Весь день — по&nbsp;часам работы'],
  ['Площадь', 'Одна зона', 'Небольшая комната', 'До&nbsp;300 м² или до&nbsp;1000 м² одним аппаратом'],
  ['Кто следит', 'Персонал: зажечь, распылить, докупить', 'Персонал меняет флаконы', 'Мы: масла, настройка и&nbsp;сервис в&nbsp;подписке'],
  ['Безопасность', 'Открытый огонь, капли на&nbsp;поверхностях', 'Флакон легко опрокинуть', 'Закрытый металлический корпус']
];
function versus() {
  return `<section class="cm" id="sravnenie">
  <div class="cm-wrap">
    <p class="cm-k">сравнение</p>
    <div class="cm-top">
      <h2 class="cm-h">Свечи, спреи <em>или аромамаркетинг</em></h2>
      <p class="cm-lead">Свечи и&nbsp;спреи дают аромат рядом и&nbsp;ненадолго. Аппарат держит его ровно по&nbsp;всему пространству весь день — и&nbsp;за&nbsp;ним следим мы</p>
    </div>
    <div class="cm-tb" role="table" aria-label="Свечи и спреи, диффузор с палочками и Aromé">
      <div class="cm-bg" aria-hidden="true"></div>
      <div class="cm-row cm-hd" role="row"><span class="cm-c cm-th" role="columnheader"></span>${VS_COLS.map(c => `<span class="cm-c cm-th" role="columnheader">обычно<b>${c}</b></span>`).join('')}<span class="cm-c cm-th cm-us" role="columnheader">аромамаркетинг<b>Aromé</b></span></div>
      ${VS_ROWS.map(([k, a, b, us]) => `<div class="cm-row" role="row"><span class="cm-c cm-rk" role="rowheader">${k}</span><span class="cm-c" role="cell" data-l="${VS_SHORT[0]}">${a}</span><span class="cm-c" role="cell" data-l="${VS_SHORT[1]}">${b}</span><span class="cm-c cm-us" role="cell" data-l="Aromé"><i aria-hidden="true">✓</i>${us}</span></div>`).join('\n      ')}
    </div>
  </div>
</section>`;
}

/* Аппарат (28.10.2026, макет design/arome-home/device-b.html): коричневая плашка, за аппаратом крупное название модели,
   плюсы с пульсирующим кольцом открывают карточки характеристик. Характеристики — из паспортов Nova 300 и Nova 1000.
   Порядок пунктов совпадает с плюсами: крышка, панель, кнопка сбоку, корпус, низ корпуса, ножки */
const DV_SPOTS = [[57, 6, 'r', -2], [46, 62, 'l', 52], [9, 42, 'l', 34], [80, 40, 'r', 30], [18, 76, 'l', 68], [86, 92, 'r', 80]];
const DV_MODELS = [
  { n: 'Nova 300', lead: 'Компактный металлический диффузор для бутика, кофейни, офиса, клиники и&nbsp;ресепшн', t: [
    ['Объём флакона', '200', 'мл', 'Расход масла — 0,5&nbsp;мл/ч ±&nbsp;0,2&nbsp;мл'],
    ['Область покрытия', 'до 300', 'м²', 'Одним аппаратом'],
    ['Питание', '8', 'W', 'DC 12V 0,5A'],
    ['Материал', 'металл', '', 'Размер 160 × 86,5 × 205&nbsp;мм'],
    ['Масса', '1,55', 'кг', ''],
    ['Уровень шума', '&lt;35', 'дБ', 'Гости замечают аромат, а&nbsp;не&nbsp;технику']] },
  { n: 'Nova 1000', lead: 'Мощный диффузор с&nbsp;управлением со&nbsp;смартфона для отеля, торгового зала, фитнес-клуба и&nbsp;лобби', t: [
    ['Объём флакона', '800', 'мл', 'Расход масла — 3&nbsp;мл/ч ±&nbsp;0,2&nbsp;мл'],
    ['Область покрытия', 'до 1000', 'м²', 'Управление со&nbsp;смартфона'],
    ['Питание', '12', 'W', 'DC 12V 1A'],
    ['Материал', 'металл', '', 'Размер 160 × 86,5 × 205&nbsp;мм'],
    ['Масса', '3', 'кг', ''],
    ['Уровень шума', '&lt;35', 'дБ', 'Гости замечают аромат, а&nbsp;не&nbsp;технику']] }
];
const dvTip = x => `<small>${x[0]}</small><b>${x[1]}${x[2] ? `<span>${x[2]}</span>` : ''}</b>${x[3] ? `<p>${x[3]}</p>` : ''}`;
/* o.model — какая модель открыта сразу (0 — Nova 300, 1 — Nova 1000): на страницах пространств — та, что в типовом комплекте */
function device(o = {}) {
  const sel = o.model || 0, m = DV_MODELS[sel];
  return `<section class="dv" id="apparat">
  <div class="dv-card">
    <div class="dv-top">
      <div><p class="dv-k">аппарат</p><p class="dv-lead" data-k="lead">${m.lead}</p></div>
      <div class="dv-tabs" role="tablist" aria-label="Модель">${DV_MODELS.map((x, i) => `<button type="button" role="tab" aria-selected="${i === sel}"${i === sel ? ' class="on"' : ''}>${x.n}</button>`).join('')}</div>
    </div>
    <p class="dv-word" aria-hidden="true" data-scroll-x>Nova <em data-k="num">${m.n.split(' ')[1]}</em></p>
    <div class="dv-stage">
      <img class="dv-img" src="${site.url('assets/img/nova-cut.webp')}" alt="Аромамашина Nova" loading="lazy">
      ${DV_SPOTS.map(([x, y], i) => `<button type="button" class="dv-hs" style="left:${x}%;top:${y}%" aria-label="${m.t[i][0]}" aria-expanded="false"><i></i></button>`).join('')}
      ${DV_SPOTS.map(([, , side, top], i) => `<div class="dv-tip dv-${side}" style="top:${top}%">${dvTip(m.t[i])}</div>`).join('')}
    </div>
    <div class="dv-foot"><h2 class="dv-name" data-k="name">${m.n}</h2><p>Нажмите на&nbsp;+, чтобы узнать характеристики</p></div>
  </div>
  <script type="application/json" class="dv-data">${JSON.stringify(DV_MODELS.map(x => ({ n: x.n, lead: x.lead, t: x.t.map(dvTip) }))).replace(/</g, '\\u003c')}</script>
</section>`;
}

/* «Как работает аппарат» (согласован 28.10.2026, макет design/arome-home/how.html): тонкая сетка с разрывами линий,
   в углах — коричневые скруглённые уголки, внизу шага номер и плашка с фактом из характеристик аппаратов */
const METHOD = [
  ['Подключаем к&nbsp;вентиляции', 'Подключаем аппарат к&nbsp;вентиляции — аромат расходится по&nbsp;воздуховодам и&nbsp;ровно заполняет все залы, без «облака» у&nbsp;входа', 'до 1000 м² одним аппаратом'],
  ['Работает по&nbsp;расписанию', 'Выпускает масло мелкими порциями по&nbsp;часам работы — с&nbsp;открытия до&nbsp;закрытия. Интенсивность настраиваем под площадь', 'Nova 1000 — со&nbsp;смартфона'],
  ['Тихо и&nbsp;незаметно', 'Компактный металлический корпус и&nbsp;почти неслышная работа: гости замечают аромат, а&nbsp;не&nbsp;технику', 'шум менее 35 дБ'],
  ['Масла и&nbsp;сервис — на&nbsp;нас', 'Подбираем аромат, меняем масла, следим за&nbsp;работой и&nbsp;заменяем аппарат при поломке', 'входит в&nbsp;подписку']
];
/* o.k — своя подпись: на странице «Метод» «как работает», чтобы не повторять крошки */
function method(o = {}) {
  return `<section class="hw" id="kak-rabotaet">
  <div class="hw-wrap">
    <p class="hw-k">${o.k || 'метод'}</p>
    <div class="hw-top">
      <h2 class="hw-h">Как работает <em>аппарат</em></h2>
      <p class="hw-lead">Аромат появляется в&nbsp;пространстве сам и&nbsp;держится весь день — без свечей, спреев и&nbsp;участия персонала</p>
    </div>
    <div class="hw-grid">
      ${METHOD.map(([t, d, tag], i) => `<div class="hw-cell"><i class="hw-tl"></i><i class="hw-tr"></i><i class="hw-bl"></i><i class="hw-br"></i>
        <h3>${t}</h3>
        <p>${d}</p>
        <div class="hw-foot"><span class="hw-n">0${i + 1}</span><span class="hw-tag">${tag}</span></div></div>`).join('\n      ')}
    </div>
  </div>
</section>`;
}

/* Заявка в стиле главной (согласована 28.10.2026, макет design/arome-home/cta.html): фон — стена с тенями от окна,
   по центру карточка с фото нот и формой. Форма отправляет заявку в CRM (/api/lead) и ведёт на /spasibo/ (action). */
const LF_SPACES = ['Магазин', 'Салон и SPA', 'Отель', 'Ресторан', 'Офис', 'Автосалон', 'Другое'];
/* Форма заявки — одна и та же в блоке внизу главной и во всплывающем окне (кнопки «Оставить заявку» и т. п.).
   key разводит имена полей, чтобы две формы на одной странице не конфликтовали */
function lfForm(p, key) {
  return `<form class="lf-fm" data-lf action="/spasibo/" novalidate>
      <p class="lf-k">заявка</p>
      <h2 class="lf-h" id="${key}-h">Попробуйте аромат <em>${D.trialDays}&nbsp;дня бесплатно</em></h2>
      <p class="lf-lead">Расскажите о&nbsp;своём пространстве — подберём аромат и&nbsp;дадим ${D.trialDays}&nbsp;дня бесплатно проверить его у&nbsp;вас</p>
      <div class="lf-fields">
        <label class="lf-in"><span class="lf-sr">Ваше имя</span><input class="lf-name" type="text" autocomplete="name" placeholder="Ваше имя"></label>
        <label class="lf-in lf-tel"><span class="lf-flag" aria-hidden="true"><i></i></span><b>+7</b><span class="lf-sr">Телефон</span><input class="lf-phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="(700) 000-00-00" maxlength="15"></label>
      </div>
      <fieldset class="lf-pl"><legend>Ваше пространство</legend>
        <div class="lf-chips">${LF_SPACES.map(s => `<label><input type="radio" name="${key}-space" value="${s}"><span>${s.replace(' и ', ' и&nbsp;')}</span></label>`).join('')}</div>
      </fieldset>
      <label class="lf-ok"><input class="lf-agree" type="checkbox"><i aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2l2.3 2.3 4.7-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></i><span>Я&nbsp;соглашаюсь на&nbsp;обработку персональных данных в&nbsp;соответствии с&nbsp;<a href="/politika-konfidencialnosti/">политикой конфиденциальности</a></span></label>
      <button class="lf-btn" type="submit">Оставить заявку</button>
      <a class="lf-wa" href="${wa(p.pageName, 'Хочу подобрать аромат.')}" target="_blank" rel="noopener">или написать в&nbsp;WhatsApp</a>
    </form>`;
}
const LF_IMG = p => `<div class="lf-ph"><img src="${site.url('assets/img/lead-notes.webp')}" alt="Белый чай, инжир, бергамот, кедр и флакон аромамасла на травертине" loading="lazy"></div>`;
function leadForm(p) {
  return `<section class="lf" id="zayavka">
  <div class="lf-box">
    ${LF_IMG(p)}
    ${lfForm(p, 'lf')}
  </div>
</section>`;
}
/* Окно заявки: открывается вместо перехода к якорю #zayavka (main.js), есть на всех страницах */
function reqModal(p) {
  return `<div class="rq" id="rq" role="dialog" aria-modal="true" aria-labelledby="rq-h" hidden>
  <div class="rq-bg" data-rq-close></div>
  <div class="rq-box lf-box">
    <button class="rq-x" type="button" data-rq-close aria-label="Закрыть"><i></i></button>
    ${LF_IMG(p)}
    ${lfForm(p, 'rq')}
  </div>
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
    <p class="kl-lead">${o.lead || 'Выберите аромат — покажем, какой он и&nbsp;где раскрывается лучше всего'}</p>
    <div class="kl-list" role="tablist" aria-label="Ароматы">${list.map((s, i) => `<button type="button" class="kl-it${i ? '' : ' on'}" role="tab" aria-selected="${!i}" data-i="${i}"><em>${s.no}</em>${esc(s.name)}</button>`).join('')}</div>
    ${o.page ? '' : '<a class="kl-all" href="/aromaty/">Смотреть все 32 аромата →</a>'}
    <p class="kl-mot">Названия — по&nbsp;мотивам известных ароматов</p>
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

/* Пространства: лента карточек-фото со стеклянной плашкой, последняя — коричневая карточка с заявкой.
   У магазинов и автосалонов своих страниц нет — ведут к заявке. */
/* Все пространства (28.10.2026): первые 6 — лента на главной, все — страница /pomeshcheniya/, выпадающее меню шапки и подвал.
   [фото, название, ссылка, alt, что даёт аромат, зоны аромата]. Страница каждого — src/spaces.js */
const SPACES = [
  ['sp-shop', 'Магазины и&nbsp;шоурумы', '/pomeshcheniya/magaziny/', 'Бутик с вешалками и травертиновым подиумом', 'Аромат делает зал узнаваемым и&nbsp;располагает задержаться у&nbsp;витрин и&nbsp;в&nbsp;примерочных', ['вход', 'торговый зал', 'примерочные']],
  ['sp-spa', 'Салоны красоты и&nbsp;SPA', '/pomeshcheniya/salon-krasoty/', 'Ресепшен салона красоты и SPA', 'Спокойный аромат на&nbsp;ресепшене и&nbsp;в&nbsp;зоне ожидания настраивает на&nbsp;отдых ещё до&nbsp;процедуры', ['ресепшен', 'зона ожидания', 'SPA-зона']],
  ['sp-hotel', 'Отели', '/pomeshcheniya/gostinica/', 'Лобби бутик-отеля', 'Фирменный аромат лобби гости запоминают вместе с&nbsp;отелем и&nbsp;узнают при следующем визите', ['лобби', 'коридоры', 'ресторан и&nbsp;лаунж']],
  ['sp-rest', 'Рестораны и&nbsp;кафе', '/pomeshcheniya/restoran-kafe/', 'Зал ресторана вечером', 'Аромат встречает у&nbsp;входа, создаёт настроение вечера и&nbsp;не&nbsp;спорит с&nbsp;кухней', ['вход и&nbsp;гардероб', 'лаунж', 'санузлы']],
  ['sp-office', 'Офисы и&nbsp;бизнес-центры', '/pomeshcheniya/ofis/', 'Лобби бизнес-центра', 'Чистый деловой аромат в&nbsp;лобби и&nbsp;на&nbsp;ресепшене — первое впечатление для гостей и&nbsp;кандидатов', ['лобби', 'ресепшен', 'переговорные']],
  ['sp-auto', 'Автосалоны', '/pomeshcheniya/avtosalony/', 'Шоурум автосалона', 'Аромат шоурума поддерживает ощущение премиального сервиса, пока клиент выбирает автомобиль', ['шоурум', 'клиентская зона', 'зона выдачи']],
  ['sx-toj', 'Тойханы и&nbsp;банкетные залы', '/pomeshcheniya/tojhana/', 'Банкетный зал, накрытый к празднику', 'Праздничный, но&nbsp;не&nbsp;сладкий аромат встречает гостей в&nbsp;фойе и&nbsp;держится весь вечер', ['фойе', 'банкетный зал', 'санузлы']],
  ['sx-zhk', 'ЖК и&nbsp;подъезды', '/pomeshcheniya/zhk-podezd/', 'Лобби жилого комплекса с консьержем', 'Чистый аромат во&nbsp;входной группе и&nbsp;лифтовых холлах — дом встречает жильцов и&nbsp;гостей', ['вход', 'лифтовой холл', 'паркинг']],
  ['sx-fit', 'Фитнес-клубы', '/pomeshcheniya/fitnes/', 'Ресепшен фитнес-клуба', 'Свежий бодрый аромат на&nbsp;ресепшене, в&nbsp;зале и&nbsp;раздевалках', ['ресепшен', 'зал', 'раздевалки']],
  ['sx-clinic', 'Клиники и&nbsp;ветклиники', '/pomeshcheniya/klinika/', 'Зона ожидания частной клиники', 'Мягкий спокойный аромат делает обстановку теплее и&nbsp;снимает ощущение «больницы»', ['ресепшен', 'зона ожидания', 'коридоры']],
  ['sx-wc', 'Туалеты ТРЦ и&nbsp;АЗС', '/pomeshcheniya/obshchestvennyj-tualet/', 'Санузел торгового центра с травертиновой столешницей', 'Аромат держится весь день при&nbsp;большом потоке — санузел не&nbsp;портит впечатление о&nbsp;месте', ['мужской', 'женский', 'тамбур']],
  ['sx-osi', 'Для ОСИ и&nbsp;УК', '/osi/', 'Входная группа многоквартирного дома', 'Ароматизация подъездов по&nbsp;договору с&nbsp;актом каждый месяц — обслуживание берём на&nbsp;себя', ['подъезды', 'лифтовые холлы', 'договор и&nbsp;акт']],
  ['sx-home', 'Для дома', '/kvartira/', 'Гостиная городской квартиры вечером', 'Компактный Nova 300 для квартиры или дома — аромат в&nbsp;гостиной и&nbsp;прихожей', ['гостиная', 'прихожая']]
];
const spaceLinks = () => SPACES.map(([, n, h]) => `<a href="${h}">${n}</a>`).join('');
function spaces(p) {
  return `<section class="ps" id="prostranstva">
  <div class="ps-wrap">
    <p class="ps-k">пространства</p>
    <div class="ps-top">
      <h2 class="ps-h">Подберём решение <em>для вашего пространства</em></h2>
      <div class="ps-tr"><p class="ps-lead">Аромат дополняет интерьер, свет и&nbsp;музыку. Выберите своё пространство — покажем, как это работает у&nbsp;вас</p>
        <div class="ps-nav"><button type="button" aria-label="Назад"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button type="button" aria-label="Вперёд"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></div>
    </div>
  </div>
  <div class="ps-track" data-scroll-x>
    ${SPACES.slice(0, 6).map(([img, n, h, alt]) => `<a class="ps-card" href="${h}"><img src="${site.url(`assets/img/${img}.webp`)}" alt="${alt}" loading="lazy">
      <div class="ps-gl"><h3>${n}</h3><span class="ps-go">Посмотреть<i>→</i></span></div></a>`).join('\n    ')}
    <div class="ps-card ps-cta">
      <div>
        <p class="ps-k">другое пространство</p>
        <h3>Не нашли <em>своё пространство?</em></h3>
        <p>Расскажите о&nbsp;своём объекте — оценим возможность подключения к&nbsp;вентиляции и&nbsp;предложим решение</p>
        <div class="ps-list"><span>клиника</span><span>фитнес</span><span>ЖК и&nbsp;лобби</span><span>банк</span><span>шоурум мебели</span></div>
      </div>
      <div class="ps-act"><a class="ps-btn" href="#zayavka">Оставить заявку</a><a class="ps-wa" href="${wa(p.pageName, 'Хочу подобрать аромат для своего пространства.')}" target="_blank" rel="noopener">или написать в&nbsp;WhatsApp</a></div>
    </div>
  </div>
  <div class="ps-prog" aria-hidden="true"><i></i></div>
  <div class="ps-cur" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M3.5 12h17M7.5 8l-4 4 4 4M16.5 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
</section>`;
}

/* Страница «Пространства» (вариант A, согласован 28.10.2026, макет design/arome-home/spaces-page-gen.js): карточки в 2 колонки —
   фото с номером на стеклянной плашке, название, что даёт аромат, зоны аромата. Последняя ячейка — коричневая «другое пространство» */
const num = i => String(i + 1).padStart(2, '0');
function spaceGrid() {
  return `<section class="sx" id="spisok">
  <div class="sx-wrap">
    <div class="sx-grid">
    ${SPACES.map(([img, n, h, alt, d, z], i) => `<a class="sx-card" href="${h}">
      <div class="sx-ph"><img src="${site.url(`assets/img/${img}.webp`)}" alt="${alt}" loading="${i < 2 ? 'eager' : 'lazy'}"><span class="sx-num">${num(i)}</span></div>
      <div class="sx-body"><h2>${n}</h2><p>${d}</p><div class="sx-z">${z.map(t => `<span>${t}</span>`).join('')}</div><span class="sx-go">Посмотреть<i>→</i></span></div>
    </a>`).join('\n    ')}
    <div class="sx-more">
      <div>
        <p class="sx-k">другое пространство</p>
        <h2>Не нашли <em>своё пространство?</em></h2>
        <p>Расскажите о&nbsp;своём объекте — оценим возможность подключения к&nbsp;вентиляции и&nbsp;предложим решение</p>
        <div class="sx-z"><span>банки</span><span>коворкинги</span><span>ювелирные салоны</span><span>шоурумы мебели</span><span>детские центры</span></div>
      </div>
      <a class="sx-btn" href="#zayavka">Оставить заявку</a>
    </div>
    </div>
  </div>
</section>`;
}
const SH = [
  ['Характер бизнеса', 'Предлагаем композиции под&nbsp;стиль пространства и&nbsp;даём пробники — выбираете&nbsp;вы'],
  ['Площадь и&nbsp;вентиляция', `Под&nbsp;площадь подбираем ${D.devices[0].name} до&nbsp;${D.devices[0].area}&nbsp;м² или ${D.devices[1].name} до&nbsp;${D.devices[1].area}&nbsp;м² и&nbsp;подключаем к&nbsp;вентиляции`],
  ['Часы работы', 'Настраиваем расписание и&nbsp;интенсивность: аромат есть, пока открыто, и&nbsp;не&nbsp;утомляет к&nbsp;вечеру']
];
/* Три пункта с курсивными номерами (sh-*): «Как подбираем» на странице пространств, «Что даёт аромат» на страницах пространства */
function points(o) {
  return `<section class="sh" id="${o.id}">
  <div class="sh-wrap">
    <p class="sh-k">${o.k}</p>
    <div class="sh-top">
      <h2 class="sh-h">${o.h}</h2>
      ${o.lead ? `<p class="sh-lead">${o.lead}</p>` : ''}
    </div>
    <ol class="sh-list">${o.list.map(([t, d], i) => `<li><i>${num(i)}</i><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
  </div>
</section>`;
}
const spaceHow = () => points({ id: 'podbor', k: 'подбор', h: 'Как подбираем <em>аромат под&nbsp;пространство</em>', lead: `Три вещи, от&nbsp;которых зависит решение. Первые ${D.trialDays}&nbsp;дня — бесплатно, чтобы вы проверили аромат у&nbsp;себя`, list: SH });

/* Цифры для бизнеса (согласовано 28.10.2026, макет design/arome-home/numbers-gen.js): только опубликованные исследования,
   DOI проверены через Crossref. [цифра, что это, где измерено, источник, ссылка]. Первая карточка — коричневая */
const SRC = {
  herr: ['Herrmann и&nbsp;др., Journal of&nbsp;Retailing, 2013', 'https://doi.org/10.1016/j.jretai.2012.08.002'],
  meta: ['Roschk, Hosseinpour, Journal of&nbsp;Marketing, 2020', 'https://doi.org/10.1177/0022242919881137'],
  gue: ['Guéguen, Petr, Int. Journal of&nbsp;Hospitality Management, 2006', 'https://doi.org/10.1016/j.ijhm.2005.04.007'],
  hotel: ['Denizci Guillet и&nbsp;др., Int. Journal of&nbsp;Hospitality &amp; Tourism Administration', 'https://doi.org/10.1080/15256480.2017.1359727'],
  dent: ['Lehrner и&nbsp;др., Physiology &amp; Behavior, 2005', 'https://doi.org/10.1016/j.physbeh.2005.06.031']
};
const NUMS = {
  herr: ['+20%', 'тратили покупатели', 'Эксперимент в&nbsp;магазине: 18&nbsp;дней, больше 400&nbsp;покупателей, простой апельсиновый аромат', SRC.herr],
  up23: ['до +23%', 'рост трат', 'Оценка по&nbsp;64&nbsp;экспериментам — в&nbsp;лучших условиях: удачный аромат, подходящий месту', SRC.meta],
  meta: ['3–15%', 'выше отклик гостей', 'Обзор 64&nbsp;экспериментов: настроение, оценки товаров и&nbsp;сервиса, намерение купить', SRC.meta],
  gue20: ['+20%', 'трат на&nbsp;гостя', 'Ресторан во&nbsp;Франции, аромат лаванды: с&nbsp;17,5 до&nbsp;21,1&nbsp;€ на&nbsp;человека', SRC.gue],
  gue15: ['+15%', 'дольше гости за&nbsp;столом', 'Там&nbsp;же: с&nbsp;91 до&nbsp;106&nbsp;минут при аромате лаванды', SRC.gue],
  hotel: ['90%+', 'гостей заметили аромат', 'Отель сети класса люкс: фирменный аромат подаётся через кондиционирование в&nbsp;лобби, опрос 326&nbsp;гостей', SRC.hotel],
  dent: ['200', 'пациентов в&nbsp;исследовании', 'Стоматология: ароматы апельсина и&nbsp;лаванды в&nbsp;зоне ожидания снизили тревожность и&nbsp;улучшили настроение', SRC.dent]
};
function numbers(s) {
  const list = s.nums.map(k => NUMS[k]);
  return `<section class="bz" id="dlya-biznesa">
  <div class="bz-wrap">
    <p class="bz-k">для бизнеса</p>
    <div class="bz-top">
      <h2 class="bz-h">Что получит <em>${s.who}</em></h2>
      <p class="bz-lead">Цифры из&nbsp;опубликованных исследований — у&nbsp;каждой ссылка на&nbsp;источник</p>
    </div>
    <div class="bz-g bz-g${list.length}">${list.map(([n, l, d, [src, u]]) => `<article class="bz-c"><p class="bz-n">${n}</p><h3>${l}</h3><p class="bz-d">${d}</p><a class="bz-src" href="${u}" target="_blank" rel="noopener">${src}</a></article>`).join('')}</div>
    <p class="bz-note">Цифры — из&nbsp;опубликованных исследований, а&nbsp;не&nbsp;обещание: результат зависит от&nbsp;аромата, пространства и&nbsp;интенсивности. Проверьте у&nbsp;себя — первые ${D.trialDays}&nbsp;дня бесплатно</p>
  </div>
</section>`;
}

/* Порядок (пользователь, 28.10.2026): верх, аромат через вентиляцию, аппарат, что почувствуют гости, что получит бизнес, затем ароматы, комплект, вопросы.
   Страница одного пространства (28.10.2026, по системе «Цен» и «Пространств»): верх с фото справа, что даёт аромат,
   зоны аромата через вентиляцию, типовой комплект с ценой из прайса, вопросы, другие пространства. Данные — src/spaces.js */
/* «Читать по теме» на страницах пространств: 3 статьи блога по следующему вопросу владельца (перелинковка кокона, seo/cocoon-map.md) */
const READS = {
  'pomeshcheniya/magaziny/': ['aromatizaciya-magazina-odezhdy', 'kak-proverit-effekt-aromamarketinga', 'aromat-i-prodazhi-issledovaniya'],
  'pomeshcheniya/salon-krasoty/': ['bezopasna-li-aromatizaciya', 'kak-vybrat-aromat-dlya-biznesa', 'oshibki-aromamarketinga'],
  'pomeshcheniya/gostinica/': ['firmennyj-aromat-brenda', 'aromamarketing-primery', 'aromatizaciya-cherez-ventilyaciyu'],
  'pomeshcheniya/restoran-kafe/': ['aromamarketing-v-restorane-i-kofejne', 'oshibki-aromamarketinga', 'kak-proverit-effekt-aromamarketinga'],
  'pomeshcheniya/ofis/': ['aromatizaciya-cherez-ventilyaciyu', 'bezopasna-li-aromatizaciya', 'kak-rasschitat-aromatizaciyu'],
  'pomeshcheniya/avtosalony/': ['kak-rasschitat-aromatizaciyu', 'firmennyj-aromat-brenda', 'chto-takoe-aromamarketing'],
  'pomeshcheniya/tojhana/': ['kak-rasschitat-aromatizaciyu', 'kak-vybrat-aromat-dlya-biznesa', 'oshibki-aromamarketinga'],
  'pomeshcheniya/zhk-podezd/': ['aromatizaciya-cherez-ventilyaciyu', 'bezopasna-li-aromatizaciya', 'skolko-stoit-aromatizaciya'],
  'pomeshcheniya/fitnes/': ['kak-rasschitat-aromatizaciyu', 'bezopasna-li-aromatizaciya', 'oshibki-aromamarketinga'],
  'pomeshcheniya/klinika/': ['bezopasna-li-aromatizaciya', 'aromamarketing-primery', 'aromatizaciya-cherez-ventilyaciyu'],
  'pomeshcheniya/obshchestvennyj-tualet/': ['kak-rasschitat-aromatizaciyu', 'oshibki-aromamarketinga', 'aromamaslo-dlya-diffuzora'],
  'osi/': ['skolko-stoit-aromatizaciya', 'bezopasna-li-aromatizaciya', 'aromatizaciya-cherez-ventilyaciyu'],
  'kvartira/': ['bezopasna-li-aromatizaciya', 'vidy-diffuzorov-dlya-pomeshchenij', 'aromamaslo-dlya-diffuzora']
};
function readMore(path) {
  const list = (READS[path] || []).map(slug => require('./articles').find(a => a.slug === slug)).filter(Boolean);
  return list.length ? blogCards(list.map(a => Object.assign({ meta: `${a.read} мин чтения` }, a)), { id: 'chitat', k: 'читать по теме' }) : '';
}

function spacePage(p, s) {
  const pm = setupPm(s.setup), month = setupMonth(s.setup);
  return `<section class="sv">
  <div class="sv-wrap">
    <div class="sv-txt">
      ${pgCrumbs(p)}
      <h1 class="pg-h">${s.h1}</h1>
      <p class="sv-lead">${nb(s.lead)}</p>
      <div class="sv-btns"><a class="sv-btn" href="#zayavka">Подобрать аромат</a><a class="sv-btn2" href="/ceny/">Цены</a></div>
    </div>
    <div class="sv-ph"><img src="${site.url(`assets/img/${s.img}.webp`)}" alt="${esc(s.name)}" loading="eager"><span>${setupText(s.setup)} · <b>от ${D.fmt(pm)} в&nbsp;месяц</b></span></div>
  </div>
</section>

<section class="sz" id="zony">
  <div class="sz-wrap">
    <p class="sz-k">зоны аромата</p>
    <div class="sz-top">
      <h2 class="sz-h">Аромат через вентиляцию <em>во&nbsp;всех зонах</em></h2>
      <p class="sz-lead">Аппарат подключаем к&nbsp;вентиляции — аромат расходится по&nbsp;воздуховодам и&nbsp;ровно заполняет пространство. Для&nbsp;каждой зоны продумываем настроение</p>
    </div>
    <div class="sz-g">${s.zones.map(([t, d, f], i) => `<article class="sz-c"><i>${num(i)}</i><h3>${nb(t)}</h3><p>${nb(d)}</p><span class="sz-f">${f === 'SPA' ? 'SPA-' : f + ' '}ароматы</span></article>`).join('')}</div>
  </div>
</section>

${device({ model: s.setup.n1000 && !s.setup.n300 ? 1 : 0 })}

${points({ id: 'zachem', k: s.feel ? 'для гостей' : 'зачем аромат', h: s.feel ? `Что почувствуют <em>${s.feel}</em>` : 'Что даёт <em>аромат</em>', list: s.why.map(([t, d]) => [nb(t), nb(d)]) })}
${s.nums ? numbers(s) : ''}

${collection(p, s.aromas.map(require('./collection').item), { title: `Ароматы <em>для&nbsp;${s.for}</em>`, lead: 'Подборка из&nbsp;нашей коллекции. Выберите аромат — покажем ноты, а&nbsp;пробник пришлём, чтобы выбрать у&nbsp;себя' })}

<section class="sk" id="komplekt">
  <div class="sk-wrap">
    <div class="sk-card">
      <div class="sk-l">
        <p class="sk-k">типовой комплект</p>
        <h2 class="sk-h">Обычно <em>хватает</em></h2>
        <p class="sk-set">${setupText(s.setup).replace(/(\d) × (\S+) (\d+)/g, '$1&nbsp;×&nbsp;$2&nbsp;$3')}</p>
        <p class="sk-note">${nb(s.setup.note)}. Сколько аппаратов нужно, зависит от&nbsp;площади и&nbsp;устройства вентиляции — подскажем после заявки</p>
      </div>
      <div class="sk-r">
        <p class="sk-pm">${D.fmt(pm)}<span>в&nbsp;месяц при подписке на&nbsp;6&nbsp;месяцев</span></p>
        <p class="sk-m">${D.fmt(month)} при оплате помесячно · первые ${D.trialDays}&nbsp;дня бесплатно</p>
        <a class="sk-btn" href="#zayavka">Оставить заявку</a>
        <a class="sk-all" href="/ceny/">Все цены<i>→</i></a>
      </div>
    </div>
  </div>
</section>

${s.limits ? `<section class="sz sz-nf" id="ogranicheniya">
  <div class="sz-wrap">
    <p class="sz-k">до заявки</p>
    <div class="sz-top">
      <h2 class="sz-h">Когда ароматизация <em>не&nbsp;подойдёт</em></h2>
      <p class="sz-lead">Говорим об&nbsp;этом заранее, чтобы вы не&nbsp;платили за&nbsp;то, что не&nbsp;сработает. Всё остальное проверим на&nbsp;бесплатном тесте</p>
    </div>
    <div class="sz-g sz-g3">${s.limits.map(([t, d], i) => `<article class="sz-c"><i>${num(i)}</i><h3>${nb(t)}</h3><p>${nb(d)}</p></article>`).join('')}</div>
  </div>
</section>` : ''}

${faqHome(s.faq.map(([q, a]) => [q, nb(a)]), p)}

${readMore(s.path)}

<section class="so" id="drugie">
  <div class="so-wrap">
    <p class="so-k">другие пространства</p>
    <div class="so-l">${SPACES.filter(x => x[2] !== '/' + s.path).map(([, n, h]) => `<a href="${h}">${n}</a>`).join('')}</div>
  </div>
</section>`;
}

/* Страница «Метод» (согласована 28.10.2026, макет design/arome-home/method-page-gen.js) */
/* Аромат по часам: слева три пункта, справа коричневая карточка с примером дня магазина (уровни: 0 пауза … 3 пик) */
const RS_DAY = [[8, 0], [9, 1], [10, 1], [11, 2], [12, 3], [13, 3], [14, 2], [15, 2], [16, 2], [17, 3], [18, 3], [19, 3], [20, 2], [21, 1], [22, 0], [23, 0]];
const RS_LV = ['пауза', 'мягко', 'средне', 'пик'];
const RS_PTS = [
  ['Включается к&nbsp;открытию', 'Первые гости заходят в&nbsp;пространство, где аромат уже есть'],
  ['Сильнее в&nbsp;часы пик', 'Когда людей больше, интенсивность выше, в&nbsp;тихие часы — мягче'],
  ['Ночью — пауза', 'После закрытия аппарат отдыхает, масло не&nbsp;тратится']
];
function schedule() {
  return `<section class="rs" id="raspisanie">
  <div class="rs-wrap">
    <div>
      <p class="rs-k">расписание</p>
      <h2 class="rs-h">Аромат по&nbsp;часам <em>вашего бизнеса</em></h2>
      <p class="rs-lead">Аппарат работает по&nbsp;расписанию, которое мы настраиваем под&nbsp;ваши часы и&nbsp;поток гостей</p>
      <ul class="rs-pts">${RS_PTS.map(([t, d], i) => `<li><i>${num(i)}</i><b>${t}</b><span>${d}</span></li>`).join('')}</ul>
    </div>
    <div class="rs-card">
      <div class="rs-ct"><p>пример</p><b>Магазин, 10:00–22:00</b></div>
      <div class="rs-ch" aria-hidden="true">${RS_DAY.map(([h, l]) => `<div class="rs-col"><i class="rs-b rs-l${l}"></i><span>${h % 2 ? '' : String(h).padStart(2, '0')}</span></div>`).join('')}</div>
      <div class="rs-lg">${RS_LV.map((t, i) => `<span><i class="rs-l${i}"></i>${t}</span>`).join('')}</div>
      <p class="rs-note">Расписание и&nbsp;интенсивность подбираем под&nbsp;каждое пространство</p>
    </div>
  </div>
</section>`;
}
/* Кто что делает: «Делаем мы» — светлая карточка, «Нужно от вас» — пунктирная */
const MV_WE = ['Подбираем аромат и&nbsp;даём пробники', 'Привозим и&nbsp;подключаем аппарат к&nbsp;вентиляции', 'Настраиваем расписание и&nbsp;интенсивность', 'Заправляем масла по&nbsp;графику', 'Следим за&nbsp;работой и&nbsp;меняем аппарат при поломке', 'Меняем аромат без доплаты'];
const MV_YOU = ['Место для аппарата у&nbsp;вентиляции и&nbsp;розетка рядом', 'Часы работы и&nbsp;пожелания к&nbsp;аромату', `Обратная связь в&nbsp;первые ${D.trialDays}&nbsp;дня — подстроим интенсивность`];
const MV_CK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function weYou() {
  const ul = l => `<ul>${l.map(t => `<li>${MV_CK}<span>${t}</span></li>`).join('')}</ul>`;
  return `<section class="mv" id="kto-chto">
  <div class="mv-wrap">
    <p class="mv-k">кто что делает</p>
    <div class="mv-top">
      <h2 class="mv-h">Почти всё <em>берём на&nbsp;себя</em></h2>
      <p class="mv-lead">От&nbsp;вас — место для аппарата и&nbsp;пара ответов. Остальное делаем мы, пока действует подписка</p>
    </div>
    <div class="mv-g">
      <div class="mv-c mv-we"><h3>Делаем <em>мы</em></h3>${ul(MV_WE)}</div>
      <div class="mv-c mv-you"><h3>Нужно <em>от&nbsp;вас</em></h3>${ul(MV_YOU)}</div>
    </div>
  </div>
</section>`;
}

/* Блог (28.10.2026): карточки статей в 3 колонки — номер, дата и время чтения, заголовок, лид, «Читать» */
function blogCards(list, o = {}) {
  return `<section class="bl" id="${o.id || 'stati'}">
  <div class="bl-wrap">${o.k ? `
    <p class="bl-k">${o.k}</p>` : ''}
    <div class="bl-g">${list.map((a, i) => `<a class="bl-c" href="/stati/${a.slug}/"><span class="bl-n">${num(i)}</span><span class="bl-m">${a.meta}</span><h2>${a.h1}</h2><p>${nb(a.lead)}</p><span class="sx-go">Читать<i>→</i></span></a>`).join('')}</div>
  </div>
</section>`;
}
/* Статья: крошки, дата, заголовок и лид в узкой колонке, ниже — текст */
function article(p, a, meta) {
  return `<section class="pg ar-top">
  <div class="pg-wrap">
    ${pgCrumbs(p)}
    <div class="ar-head"><p class="ar-m">${meta}</p><h1 class="ar-h">${a.h1}</h1><p class="ar-lead">${nb(a.lead)}</p></div>
  </div>
</section>
<section class="ar"><div class="ar-wrap"><div class="ar-body">${a.body.replace(/<table>/g, "<table data-scroll-x>")}</div></div></section>`;
}
/* Контакты: карточки связи (без адреса — только город) и что написать в заявке */
function contacts(p) {
  const cards = [
    ['телефон', C.phone, `tel:${C.phoneRaw}`],
    ['whatsapp', 'Написать', wa(p.pageName)],
    ['город', 'Астана'],
    C.hours ? ['время работы', C.hours] : null
  ].filter(Boolean);
  const ASK = [['Формат и площадь', 'Магазин, салон, отель, ресторан или офис — и примерная площадь'], ['Часы работы', 'Чтобы настроить расписание аромата под ваш день'], ['Впечатление', 'Какое настроение хотите создать: спокойное, свежее, праздничное']];
  return `<section class="kc" id="svyaz">
  <div class="kc-wrap">
    <div class="kc-g">${cards.map(([k, v, h]) => h ? `<a class="kc-c" href="${h}"${h.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}><span>${k}</span><b>${v}</b><i>→</i></a>` : `<div class="kc-c"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
  </div>
</section>
${points({ id: 'chto-napisat', k: 'заявка', h: 'Что написать, <em>чтобы быстрее подобрать аромат</em>', lead: 'Достаточно пары строк в&nbsp;WhatsApp или в&nbsp;форме ниже — остальное уточним сами', list: ASK.map(([t, d]) => [t, nb(d)]) })}`;
}

/* Каталог ароматов /aromaty/ (согласован 28.10.2026 по идее референса, макет design/arome-home/catalog-gen.js):
   фильтр по семействам (активный — в квадратных скобках), сетка плашек — флакон Aromé на фоне настроения аромата
   (assets/img/sc-NN.webp, пока нет — фото семейства), название капсом, описание, семейство, «Заказать пробник» */
function catalog(p) {
  const COL = require('./collection'), all = COL.all();
  const cat = s => D.scents.find(x => x.n === s.n).cat;
  const pic = s => { const k = `sc-${String(s.n).padStart(2, '0')}`; return require('fs').existsSync(require('path').join(__dirname, 'assets', 'img', `${k}.webp`)) ? k : s.photo; };
  return `<section class="ct" id="katalog">
  <div class="ct-wrap">
    ${pgCrumbs(p)}
    <div class="ct-top">
      <h1 class="ct-h">Коллекция <em>${all.length} аромата для&nbsp;бизнеса</em></h1>
      <p class="ct-lead">Отельные, свежие, цветочные, гурманские, SPA и&nbsp;парфюмерные композиции. Выберите аромат — пришлём пробник, чтобы вы проверили его у&nbsp;себя</p>
    </div>
    <div class="ct-f" role="toolbar" aria-label="Семейства ароматов">
      <button type="button" class="on" data-f="all" aria-pressed="true">все <sup>${all.length}</sup></button>
      ${D.categories.map(c => `<button type="button" data-f="${c.id}" aria-pressed="false">${c.name.toLowerCase()} <sup>${all.filter(s => cat(s) === c.id).length}</sup></button>`).join('\n      ')}
    </div>
    <div class="ct-g">
    ${all.map((s, i) => `<article class="ct-c" data-c="${cat(s)}" id="${s.slug}">
      <div class="ct-ph"><img src="${site.url(`assets/img/${pic(s)}.webp`)}" alt="${esc(s.name)} — флакон Aromé" loading="${i < 3 ? 'eager' : 'lazy'}"><span class="ct-no">${s.no}</span></div>
      <div class="ct-b">
        <h2>${esc(s.name)}</h2>
        <p class="ct-d">${esc(s.desc)}</p>
        <p class="ct-m">${s.fam} · ${s.pow}</p>
        <a class="ct-btn" href="${wa(p.pageName, `Хочу пробник аромата ${s.name} (${s.no}).`)}" target="_blank" rel="noopener">Заказать пробник</a>
      </div>
    </article>`).join('\n    ')}
    </div>
    <p class="ct-mot">Названия — по&nbsp;мотивам известных ароматов</p>
  </div>
</section>`;
}

module.exports = { catalog, blogCards, article, contacts, nb, spacePage, schedule, weYou, SPACES, spaceGrid, spaceHow, hxHeader, pageTop, included, kits, device, stages, faqHome, pricing, versus, method, leadForm, spaces, collection, init, layout, icon, pageHead, picker, odorTile, placeTile, faq, scentRow, cta, related, priceCard, pm, setupPm, setupMonth, setupText, wa, waLink, waText, C, PK, OFFER, TRIAL };
