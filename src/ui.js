/* ВДОХ: layout и блоки. Тёмная «лаборатория», тепловизор аромата, сигнальный оранжевый. */
const D = require('../lib/data');
const { esc } = require('../lib/engine');
const SCENES = require('./scenes');
const ODORS = require('./odors');

let site;
const init = s => { site = s; };

const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  wa: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/>'
};
const icon = (n, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

const NAV = [['Симулятор', ''], ['Планы', 'simulyator/'], ['Запахи', 'zapahi/'], ['Расчёт', 'raschet/'], ['Как работает', 'kak-rabotaet/'], ['Контакты', 'kontakty/']];

function header(p) {
  return `<a class="skip" href="#main">К содержанию</a>
<header class="hdr" id="hdr">
  <a class="logo" href="/" aria-label="ВДОХ — на главную">ВДОХ<sup>lab</sup></a>
  <nav class="menu" id="menu" aria-label="Основное меню">${NAV.map(([n, h]) => `<a href="/${h}"${p.section === h ? ' aria-current="true"' : ''}>${n}</a>`).join('')}<a class="menu-ph" href="tel:${D.contacts.phoneRaw}">${D.contacts.phone}</a></nav>
  <a class="hdr-cta" href="#zayavka">Получить расчёт</a>
  <button class="burger" id="burger" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="menu">${icon('menu')}${icon('close', 'ic ic-x')}</button>
</header>`;
}

function footer() {
  const C = D.contacts;
  return `<footer class="ftr">
  <div class="wrap ftr-in">
    <div><a class="logo" href="/">ВДОХ<sup>lab</sup></a><p>Лаборатория ароматизации помещений в Астане: планы, расчёт аппаратов, нейтрализация запахов и сервис по подписке.</p></div>
    <nav aria-label="Планы"><p class="k">// планы</p>${SCENES.map(s => `<a href="/simulyator/${s.id}/">${s.tab}</a>`).join('')}</nav>
    <nav aria-label="Запахи"><p class="k">// запахи</p>${ODORS.map(o => `<a href="/zapahi/${o.slug}/">${o.short}</a>`).join('')}</nav>
    <address><p class="k">// связь</p><a href="tel:${C.phoneRaw}">${C.phone}</a><a href="${D.waLink()}" target="_blank" rel="noopener">WhatsApp</a><a href="${C.map2gis}" target="_blank" rel="noopener">${C.address}</a><span>${C.hours}</span></address>
  </div>
  <div class="wrap ftr-bot"><span>© 2026 ВДОХ lab · Астана</span><a href="/politika-konfidencialnosti/">Политика конфиденциальности</a></div>
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tektur:wght@500;600;700&family=Golos+Text:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap">
<link rel="stylesheet" href="/assets/css/style.css">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
</head>
<body class="${p.bodyClass || ''}">
${header(p)}
<main id="main">
${p.body}
${p.noCta ? '' : cta(p.ctaTitle)}
</main>
${footer()}
<script src="/assets/js/data.js"></script>
${p.sim ? '<script src="/assets/js/sim.js"></script>' : ''}
<script src="/assets/js/main.js"></script>
</body>
</html>`;
}

/* Симулятор. tabs — показать переключатель шести планов (главная). */
function sim(id, o = {}) {
  const s = SCENES.find(x => x.id === id);
  return `<div class="sim" data-scene="${id}">
  ${o.tabs ? `<div class="sim-tabs" role="tablist" aria-label="Пространство">${SCENES.map(x => `<button type="button" role="tab" data-tab="${x.id}" aria-selected="${x.id === id}">${x.tab}<small>${x.w * x.h} м²</small></button>`).join('')}</div>` : ''}
  <div class="sim-body">
    <div class="sim-stage">
      <canvas role="img" aria-label="Тепловая карта аромата на плане помещения"></canvas>
      <div class="sim-zones"></div>
      <noscript><p class="ns">Включите JavaScript, чтобы увидеть тепловую карту аромата.</p></noscript>
    </div>
    <aside class="sim-hud" aria-live="polite">
      <div class="hud-row"><span class="k">// покрытие</span><b class="cov" data-o="cov">—</b></div>
      <i class="bar"><i data-o="bar"></i></i>
      <p class="verdict" data-o="verdict">Загрузка плана…</p>
      <dl class="hud-dl">
        <div><dt>Площадь</dt><dd data-o="area">${s.w * s.h} м²</dd></div>
        <div><dt>Аппараты</dt><dd data-o="devs">—</dd></div>
        <div><dt>Цена в месяц</dt><dd data-o="pm">—</dd></div>
      </dl>
      <div class="hud-k">// ставить на план</div>
      <div class="seg"><button type="button" data-type="300" aria-pressed="true">Nova 300</button><button type="button" data-type="1000" aria-pressed="false">Nova 1000</button></div>
      <div class="hud-btns"><button type="button" class="hb" data-act="auto">Наша расстановка</button><button type="button" class="hb" data-act="clear">Очистить</button></div>
      <p class="hint">Нажмите на план — появится диффузор. Нажмите на диффузор — он исчезнет. Цифры — зоны, нажмите на них.</p>
      ${o.tabs ? `<a class="hud-link" data-scene-link data-base="/" href="/simulyator/${id}/">Подробно про план: <b>${s.tab.toLowerCase()}</b> ${icon('arrow')}</a>` : ''}
    </aside>
  </div>
  <ul class="legend"><li><i class="lg lg-hot"></i>аромат ощущается сильно</li><li><i class="lg lg-mid"></i>лёгкий фон</li><li><i class="lg lg-cold"></i>аромата нет</li><li><i class="lg lg-dev"></i>диффузор</li></ul>
</div>`;
}

function pageHead(p, o = {}) {
  return `<section class="phead">
  <div class="wrap">
    ${site.crumbs(p.breadcrumbs)}
    ${o.kicker ? `<p class="k">${o.kicker}</p>` : ''}
    <h1>${p.h1}</h1>
    ${o.lead ? `<p class="lead">${o.lead}</p>` : ''}
  </div>
</section>`;
}

function faq(list, title = 'Вопросы') {
  return `<section class="sec"><div class="wrap narrow">
  <h2 class="h2">${title}</h2>
  <div class="faq">${list.map(([q, a]) => `<details><summary><span>${esc(q)}</span>${icon('plus')}</summary><p>${a}</p></details>`).join('')}</div>
</div></section>`;
}

function scentRow(s) {
  return `<li class="sr"><span class="sr-n">#${String(s.n).padStart(2, '0')}</span><div><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p></div><span class="sr-notes">${esc(s.notes.join(' · '))}</span></li>`;
}

function cta(title) {
  return `<section class="sec cta-sec" id="zayavka"><div class="wrap">
  <div class="cta">
    <div>
      <p class="k">// заявка</p>
      <h2 class="h2">${title || 'Рассчитаем ваше помещение по плану'}</h2>
      <p class="lead">Пришлите площадь или план помещения — расставим диффузоры, подберём аромат и запустим в день обращения.</p>
    </div>
    <form class="form" id="lead-form" novalidate>
      <label>Тип помещения<select id="f-type">${SCENES.map(s => `<option>${s.tab}</option>`).join('')}<option>Другое</option></select></label>
      <label>Площадь, м²<input id="f-area" inputmode="numeric" placeholder="Например, 150"></label>
      <label>Что мешает<input id="f-odor" placeholder="Запах кухни, санузла… или ничего"></label>
      <button class="btn" type="submit">${icon('wa')}Отправить в WhatsApp</button>
      <p class="f-note">Откроется WhatsApp с готовым сообщением · <a href="tel:${D.contacts.phoneRaw}">${D.contacts.phone}</a></p>
    </form>
  </div>
</div></section>`;
}

function related(title, links) {
  return `<section class="sec sec-t"><div class="wrap"><p class="k">${title}</p><div class="chips">${links.map(([n, h]) => `<a class="chip" href="/${h}">${esc(n)}${icon('arrow')}</a>`).join('')}</div></div></section>`;
}

const pm = d => D.fmt(Math.min(...d.plans.map(D.perMonth)));

module.exports = { init, layout, icon, sim, pageHead, faq, scentRow, cta, related, pm };
