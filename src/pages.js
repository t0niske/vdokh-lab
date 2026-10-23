/* Страницы ВДОХ */
const D = require('../lib/data');
const { esc } = require('../lib/engine');
const UI = require('./ui');
const SCENES = require('./scenes');
const ODORS = require('./odors');
const { icon } = UI;

const HOME = ['Главная', ''];
const area = s => s.w * s.h;
const setup = s => {
  const n10 = s.dev.filter(d => d.t === '1000').length, n3 = s.dev.length - n10;
  return { text: [n10 ? `${n10} × Nova 1000` : '', n3 ? `${n3} × Nova 300` : ''].filter(Boolean).join(' + '), pm: n3 * 33333 + n10 * 66667 };
};

function register(site) {
  const { add, img } = site;

  /* ── Главная ── */
  const homeFaq = [
    ['Насколько точен симулятор?', 'Это наглядная модель: аромат расходится от диффузора, обходит стены и проходит в двери. Реальная картина зависит ещё от вентиляции и потоков людей, поэтому точную расстановку мы делаем по вашему плану.'],
    D.faq[5], D.faq[1], D.faq[2]
  ];
  add({
    path: '', section: '', priority: '1.0', sim: true, bodyClass: 'home',
    title: 'ВДОХ — ароматизация помещений на плане: расчёт диффузоров онлайн',
    description: 'Интерактивный план с тепловой картой аромата: расставьте диффузоры в кофейне, бутике, офисе, клинике, отеле или фитнес-клубе и узнайте покрытие и цену.',
    schema: [site.schema.website(), site.schema.business(D.contacts), site.schema.faq(homeFaq)],
    body: `
<section class="hero">
  <div class="wrap">
    <div class="hero-top">
      <div>
        <p class="k">// лаборатория ароматизации · Астана</p>
        <h1>Ароматизация помещения на плане</h1>
      </div>
      <p class="lead">Выберите пространство, поставьте диффузоры и посмотрите на тепловой карте, куда доходит аромат. Стены его останавливают, двери пропускают — как в жизни.</p>
    </div>
    ${UI.sim('ofis', { tabs: true })}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head"><p class="k">// 6 планов</p><h2 class="h2">Разберите своё пространство</h2></div>
    <div class="grid3">${SCENES.map(s => `<a class="tile" href="/simulyator/${s.id}/">${img('scene-' + s.id, { cls: 'tile-img' })}<span class="tile-k">${area(s)} м² · ${setup(s).text}</span><span class="tile-t">${s.tab}</span><span class="tile-d">${esc(s.lead)}</span>${icon('arrow', 'ic tile-go')}</a>`).join('')}</div>
  </div>
</section>

<section class="sec sec-alt">
  <div class="wrap split">
    <div>
      <p class="k">// запахи</p>
      <h2 class="h2">Когда аромат нужен, чтобы убрать запах</h2>
      <p class="lead">Санузел, кухня, табак, животные, мусор, раздевалки. Разбираем причины и показываем, где ставить аппарат.</p>
    </div>
    <ul class="odors">${ODORS.map((o, i) => `<li><a href="/zapahi/${o.slug}/"><span>${String(i + 1).padStart(2, '0')}</span><b>${o.short}</b>${icon('arrow')}</a></li>`).join('')}</ul>
  </div>
</section>

<section class="sec">
  <div class="wrap split">
    <div>
      <p class="k">// правила</p>
      <h2 class="h2">Три закона аромата в помещении</h2>
    </div>
    <ol class="laws">
      <li><b>Аромат не проходит сквозь стены.</b> Он идёт по воздуху через двери и проёмы. Закрытым комнатам нужны свои аппараты.</li>
      <li><b>Аромат движется вместе с воздухом.</b> Диффузор в углу работает хуже, чем у прохода или у вентиляции.</li>
      <li><b>Площадь — не всё.</b> Высокий потолок, открытые двери и поток людей требуют запаса мощности.</li>
    </ol>
  </div>
</section>

<section class="sec sec-alt">
  <div class="wrap">
    <div class="sec-head"><p class="k">// аппараты и цены</p><h2 class="h2">Диффузор в аренду, масла и сервис — в подписке</h2></div>
    <div class="devs">${D.devices.map(d => `<article class="dev"><p class="k">// до ${d.area} м²</p><h3>${d.name}</h3><p>${d.lead}</p><dl>${d.specs.slice(0, 4).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl><p class="dev-pm">от <b>${UI.pm(d)}</b> / мес</p></article>`).join('')}
    <a class="dev dev-cta" href="/raschet/"><p class="k">// калькулятор</p><h3>Сколько аппаратов нужно?</h3><p>Площадь, потолки, закрытые комнаты — и готовый расчёт.</p>${icon('arrow', 'ic tile-go')}</a></div>
  </div>
</section>
${UI.faq(homeFaq)}`
  });

  /* ── Планы ── */
  add({
    path: 'simulyator/', section: 'simulyator/',
    title: 'Планы ароматизации: кофейня, бутик, офис, клиника, отель, фитнес',
    description: 'Шесть интерактивных планов помещений с тепловой картой аромата: где ставить диффузоры, сколько аппаратов нужно и сколько это стоит.',
    h1: 'Планы ароматизации',
    breadcrumbs: [HOME, ['Планы', 'simulyator/']],
    schema: [site.schema.itemList(SCENES.map(s => [s.h1, `simulyator/${s.id}/`]))],
    get body() {
      return UI.pageHead(this, { kicker: '// 6 пространств', lead: 'Каждый план — реальная планировка с зонами, стенами и дверями. Откройте свой и переставьте диффузоры.' }) + `
<section class="sec sec-t"><div class="wrap"><div class="grid3">${SCENES.map(s => `<a class="tile" href="/simulyator/${s.id}/">${img('scene-' + s.id, { cls: 'tile-img' })}<span class="tile-k">${area(s)} м² · ${setup(s).text}</span><span class="tile-t">${s.h1}</span><span class="tile-d">${esc(s.lead)}</span>${icon('arrow', 'ic tile-go')}</a>`).join('')}</div></div></section>
<section class="sec"><div class="wrap narrow prose"><h2>Как пользоваться планами</h2><p>Тепловая карта показывает, где аромат ощущается сильно (оранжевый и жёлтый), где остаётся лёгким фоном (бирюзовый) и где его нет (тёмный). Нажмите на план, чтобы добавить диффузор, и на диффузор, чтобы убрать его. Справа — процент покрытия и цена подписки.</p><p>Если вашего помещения нет среди планов, воспользуйтесь <a href="/raschet/">калькулятором</a> или пришлите план — мы рассчитаем его вручную.</p></div></section>`;
    }
  });

  SCENES.forEach((s, i) => {
    const p = `simulyator/${s.id}/`;
    const st = setup(s);
    add({
      path: p, section: 'simulyator/', sim: true, title: s.title, description: s.description, h1: s.h1,
      breadcrumbs: [HOME, ['Планы', 'simulyator/'], [s.tab, p]],
      schema: [site.schema.faq(s.faq), site.schema.service({ name: s.h1, description: s.description, type: 'Ароматизация помещений', low: 33333, high: 400000 }, p)],
      ctaTitle: `Рассчитаем ваше пространство: ${s.tab.toLowerCase()}`,
      get body() {
        return UI.pageHead(this, { kicker: `// план ${String(i + 1).padStart(2, '0')} · ${area(s)} м²`, lead: s.lead }) + `
<section class="sec sec-t"><div class="wrap">${UI.sim(s.id)}</div></section>
<section class="sec">
  <div class="wrap split">
    <div>
      <p class="k">// расстановка</p>
      <h2 class="h2">Где ставить диффузор</h2>
      <ol class="laws">${s.tips.map(t => `<li>${t}</li>`).join('')}</ol>
    </div>
    <div>
      <div class="sum"><p class="k">// наш расчёт</p><p class="sum-set">${st.text}</p><p class="sum-pm">${D.fmt(st.pm)} <span>в месяц при подписке на 6 месяцев</span></p></div>
      ${img('scene-' + s.id, { cls: 'side-img' })}
    </div>
  </div>
</section>
<section class="sec sec-alt">
  <div class="wrap">
    <div class="sec-head"><p class="k">// зоны</p><h2 class="h2">Что происходит в каждой зоне</h2></div>
    <div class="zones">${s.zones.map((z, k) => `<article class="zone"><span class="zone-n">${String(k + 1).padStart(2, '0')}</span><h3>${z.name}</h3><p><b>Задача:</b> ${z.task}</p><p><b>Решение:</b> ${z.sol}</p></article>`).join('')}</div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><p class="k">// ароматы</p><h2 class="h2">Что ставим в этом пространстве</h2></div>
    <ul class="srs">${s.scents.map(n => UI.scentRow(D.byN(n))).join('')}</ul>
  </div>
</section>
${UI.faq(s.faq)}
${UI.related('// другие планы', SCENES.filter(o => o !== s).map(o => [o.h1, `simulyator/${o.id}/`]))}`;
      }
    });
  });

  /* ── Запахи ── */
  add({
    path: 'zapahi/', section: 'zapahi/',
    title: 'Как убрать неприятный запах в помещении: 6 частых случаев',
    description: 'Неприятные запахи в коммерческих помещениях: санузел, кухня, табак, животные, мусор, пот. Причины, что делать и где ставить диффузор.',
    h1: 'Неприятные запахи в помещении',
    breadcrumbs: [HOME, ['Запахи', 'zapahi/']],
    schema: [site.schema.itemList(ODORS.map(o => [o.h1, `zapahi/${o.slug}/`]))],
    get body() {
      return UI.pageHead(this, { kicker: '// нейтрализация', lead: 'Аромат не заменяет вентиляцию и уборку, но вместе с ними делает воздух чистым и приятным. Выберите свою ситуацию.' }) + `
<section class="sec sec-t"><div class="wrap"><div class="grid3">${ODORS.map(o => `<a class="tile" href="/zapahi/${o.slug}/">${img('odor-' + o.slug, { cls: 'tile-img' })}<span class="tile-t">${o.h1}</span><span class="tile-d">${esc(o.lead)}</span>${icon('arrow', 'ic tile-go')}</a>`).join('')}</div></div></section>
<section class="sec"><div class="wrap narrow prose"><h2>Маскировать или нейтрализовать</h2><p>Обычный освежитель воздуха перекрывает запах резким облаком, которое быстро исчезает, и неприятный запах возвращается — уже вместе с химическим. Профессиональный диффузор работает иначе: держит ровный лёгкий фон всё время, пока открыто помещение.</p><p>Но главный шаг — найти и убрать источник: наладить вытяжку, чаще выносить мусор, сушить инвентарь. Аромат завершает эту работу и создаёт впечатление чистоты.</p></div></section>`;
    }
  });

  ODORS.forEach(o => {
    const p = `zapahi/${o.slug}/`;
    add({
      path: p, section: 'zapahi/', title: o.title, description: o.description, h1: o.h1,
      breadcrumbs: [HOME, ['Запахи', 'zapahi/'], [o.name, p]],
      schema: [site.schema.faq(o.faq)],
      get body() {
        return UI.pageHead(this, { kicker: '// запахи', lead: o.lead }) + `
<section class="sec sec-t">
  <div class="wrap split">
    <div>
      <h2 class="h2">Откуда берётся</h2>
      <ul class="causes">${o.causes.map(c => `<li>${c}</li>`).join('')}</ul>
    </div>
    ${img('odor-' + o.slug, { cls: 'side-img' })}
  </div>
</section>
<section class="sec sec-alt">
  <div class="wrap narrow">
    <p class="k">// что делать</p>
    <h2 class="h2">Пошагово</h2>
    <ol class="laws">${o.fix.map(t => `<li>${t}</li>`).join('')}</ol>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><p class="k">// ароматы</p><h2 class="h2">Какие композиции работают</h2></div>
    <ul class="srs">${o.scents.map(n => UI.scentRow(D.byN(n))).join('')}</ul>
  </div>
</section>
${UI.faq(o.faq)}
${UI.related('// другие запахи', ODORS.filter(x => x !== o).map(x => [x.h1, `zapahi/${x.slug}/`]))}`;
      }
    });
  });

  /* ── Расчёт ── */
  const calcFaq = [['Как учитываются высокие потолки?', 'При потолке выше 3,5 м объём воздуха больше, и мы закладываем запас мощности: в калькуляторе площадь умножается на коэффициент.'], ['Почему закрытые комнаты считаются отдельно?', 'Аромат не проходит сквозь стены и плохо проходит через закрытые двери. Санузлу, раздевалке или кабинету за дверью нужен свой аппарат.'], D.faq[3]];
  add({
    path: 'raschet/', section: 'raschet/',
    title: 'Сколько ароматизаторов нужно на помещение — калькулятор',
    description: 'Калькулятор диффузоров для ароматизации: площадь, высота потолков и закрытые комнаты. Сколько аппаратов Nova 300 и Nova 1000 нужно и сколько это стоит.',
    h1: 'Сколько ароматизаторов нужно',
    breadcrumbs: [HOME, ['Расчёт', 'raschet/']],
    schema: [site.schema.faq(calcFaq)],
    get body() {
      return UI.pageHead(this, { kicker: '// калькулятор', lead: 'Три параметра: площадь, потолки и закрытые комнаты. Калькулятор подберёт сочетание аппаратов с минимальной ценой.' }) + `
<section class="sec sec-t"><div class="wrap">
  <div class="calc" id="calc">
    <div class="calc-in">
      <label class="rl" for="c-area">Площадь <output id="c-area-o">250 м²</output></label>
      <input id="c-area" type="range" min="20" max="3000" step="10" value="250">
      <p class="rl">Высота потолков</p>
      <div class="seg" id="c-ceil"><button type="button" data-f="1" aria-pressed="true">до 3,5 м</button><button type="button" data-f="1.4" aria-pressed="false">3,5–5 м</button><button type="button" data-f="1.8" aria-pressed="false">выше 5 м</button></div>
      <label class="rl" for="c-rooms">Закрытые комнаты (санузлы, раздевалки) <output id="c-rooms-o">0</output></label>
      <input id="c-rooms" type="range" min="0" max="8" step="1" value="0">
    </div>
    <div class="calc-out" aria-live="polite">
      <p class="k">// результат</p>
      <p class="co-set" id="c-set">1 × Nova 300</p>
      <p class="co-pm"><b id="c-pm">33 333 ₸</b> в месяц при подписке на 6 месяцев</p>
      <a class="btn" href="#zayavka">Уточнить по плану ${icon('arrow')}</a>
    </div>
  </div>
</div></section>
<section class="sec"><div class="wrap narrow prose">
  <h2>Как мы считаем</h2>
  <p>Nova 300 рассчитан на открытое помещение до 300 м², Nova 1000 — до 1000 м². Калькулятор перебирает сочетания и выбирает самое дешёвое, которое закрывает площадь с учётом потолков. Каждая закрытая комната добавляет один Nova 300.</p>
  <p>Это быстрая оценка. Реальная расстановка зависит от планировки, вентиляции и входных дверей — посмотрите, как это выглядит, на <a href="/simulyator/">планах</a>.</p>
</div></section>
${UI.faq(calcFaq)}`;
    }
  });

  /* ── Как работает ── */
  add({
    path: 'kak-rabotaet/', section: 'kak-rabotaet/',
    title: 'Как работает ароматизация помещения: распространение аромата',
    description: 'Как аромат распространяется в помещении: движение воздуха, стены и двери, высота потолков, интенсивность и расписание диффузора. Правила расстановки.',
    h1: 'Как работает ароматизация',
    breadcrumbs: [HOME, ['Как работает', 'kak-rabotaet/']],
    get body() {
      return UI.pageHead(this, { kicker: '// физика аромата', lead: 'Что происходит с ароматом после того, как он вышел из диффузора, и почему расстановка важнее мощности.' }) + `
<section class="sec sec-t"><div class="wrap narrow prose">
  <h2>Диффузор выпускает аромат малыми дозами</h2>
  <p>Профессиональный диффузор переводит масло в мелкие частицы и выпускает их понемногу, циклами. Поэтому в помещении держится ровный фон, а не облако у аппарата. Nova 300 расходует около 0,5 мл масла в час, Nova 1000 — около 3 мл.</p>
  <h2>Аромат движется с воздухом</h2>
  <p>Частицы аромата переносятся потоками воздуха: от вентиляции, открытых дверей, движения людей. Поэтому диффузор у прохода или рядом с приточной вентиляцией работает лучше, чем в дальнем углу.</p>
  <h2>Стены останавливают, двери пропускают</h2>
  <p>Аромат не проходит сквозь стены. В соседнюю комнату он попадает только через проём, и чем уже проём, тем слабее аромат за ним. Это видно на <a href="/simulyator/ofis/">плане офиса</a>: переговорные за стенами получают меньше аромата, чем open space.</p>
  <h2>Интенсивность и расписание</h2>
  <p>Хороший аромат заметен на входе и почти незаметен через несколько минут. Интенсивность настраивается на аппарате, а расписание включает его к открытию и выключает после закрытия.</p>
  <h2>Что входит в подписку</h2>
  <ul>${D.included.map(t => `<li>${t}</li>`).join('')}</ul>
  <p>Цены: Nova 300 — от ${UI.pm(D.devices[0])}, Nova 1000 — от ${UI.pm(D.devices[1])} в месяц. Посчитать своё помещение — в <a href="/raschet/">калькуляторе</a>.</p>
</div></section>`;
    }
  });

  /* ── Контакты и служебные ── */
  const C = D.contacts;
  add({
    path: 'kontakty/', section: 'kontakty/',
    title: 'Контакты ВДОХ — ароматизация и нейтрализация запахов в Астане',
    description: `Контакты ВДОХ в Астане: ${C.phone}, WhatsApp, ${C.street}. Расчёт ароматизации по плану, подбор аромата и установка диффузоров.`,
    h1: 'Контакты',
    breadcrumbs: [HOME, ['Контакты', 'kontakty/']],
    schema: [site.schema.business(C)],
    ctaTitle: 'Пришлите план помещения',
    get body() {
      return UI.pageHead(this, { kicker: '// связь', lead: 'Пришлите план или площадь помещения в WhatsApp — рассчитаем расстановку и стоимость.' }) + `
<section class="sec sec-t"><div class="wrap"><div class="cts">
  <a class="ct" href="tel:${C.phoneRaw}"><span class="k">// телефон</span><b>${C.phone}</b></a>
  <a class="ct" href="${D.waLink('Здравствуйте! Хочу рассчитать ароматизацию помещения.')}" target="_blank" rel="noopener"><span class="k">// whatsapp</span><b>Написать</b></a>
  <a class="ct" href="${C.map2gis}" target="_blank" rel="noopener"><span class="k">// адрес</span><b>${C.address}</b></a>
  <div class="ct"><span class="k">// время</span><b>${C.hours}</b></div>
</div></div></section>
<section class="sec"><div class="wrap narrow prose"><p>Мы работаем по всей Астане. Чтобы расчёт был точным, пришлите план помещения или фото с размерами, расскажите, какие зоны закрыты дверями и какие запахи мешают. Менеджер предложит расстановку диффузоров, аромат и стоимость подписки, а специалист приедет на установку — обычно в день обращения.</p><p>Если помещение сложное — несколько этажей, высокие потолки, много закрытых комнат, — мы приедем посмотреть его до установки. После запуска аппараты обслуживает наш специалист: меняет масла по графику и следит за работой.</p></div></section>`;
    }
  });
  add({
    path: 'politika-konfidencialnosti/', noindex: true, noCta: true,
    title: 'Политика конфиденциальности — ВДОХ',
    description: 'Политика обработки персональных данных сайта ВДОХ: какие данные мы получаем через формы и мессенджеры и как их используем.',
    h1: 'Политика конфиденциальности',
    breadcrumbs: [HOME, ['Политика', 'politika-konfidencialnosti/']],
    get body() {
      return UI.pageHead(this, {}) + `<section class="sec sec-t"><div class="wrap narrow prose"><p>Сайт не собирает и не хранит персональные данные на сервере. Данные формы передаются в WhatsApp сообщением, которое вы отправляете сами. Мы используем их только для связи и расчёта и не передаём третьим лицам, кроме случаев, предусмотренных законодательством Республики Казахстан. Чтобы удалить данные, позвоните ${C.phone}.</p></div></section>`;
    }
  });
  add({
    path: '404.html', noindex: true, noCta: true,
    title: 'Страница не найдена — ВДОХ', description: 'Такой страницы нет. Вернитесь к симулятору ВДОХ.',
    body: `<section class="phead nf"><div class="wrap"><p class="k">// error 404</p><h1>Здесь не пахнет ничем</h1><p class="lead">Страница не найдена. Вернитесь к симулятору.</p><a class="btn" href="/">К симулятору ${icon('arrow')}</a></div></section>`
  });
}

module.exports = { register };
