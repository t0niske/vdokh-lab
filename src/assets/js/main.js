/* Aromé — меню, подбор аппарата, заявка в WhatsApp, объявление для ОСИ, события аналитики, появление блоков. */
(function () {
  var D = window.SITE_DATA, V = window.VD;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var page = document.body.getAttribute('data-page') || document.title;
  /* WhatsApp сайта с меткой страницы — как на сервере в ui.js */
  var wa = function (extra) { return 'https://wa.me/' + V.wa + '?text=' + encodeURIComponent('Здравствуйте! Пишу с сайта Aromé, страница «' + page + '».' + (extra ? ' ' + extra : '')); };

  /* ── Аналитика: wa_click, call_click, form_submit, test_request, osi_template ──
     Пока номера счётчиков пустые (src/config.js), события только складываются в dataLayer. */
  var AN = window.AROME_AN || {};
  var track = function (name, params) {
    params = params || {}; params.page = page;
    (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, params));
    try { if (AN.ym && window.ym) window.ym(Number(AN.ym), 'reachGoal', name, params); } catch (e) {}
    try { if (AN.ga4 && window.gtag) window.gtag('event', name, params); } catch (e) {}
  };
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('a, button') : null;
    if (!el) return;
    var href = el.getAttribute('href') || '';
    if (href.indexOf('wa.me') > -1) track('wa_click', { where: el.className || 'link' });
    if (href.indexOf('tel:') === 0) track('call_click', { where: el.className || 'link' });
    if (el.hasAttribute('data-test')) track('test_request', { via: 'whatsapp' });
    if (el.hasAttribute('data-osi')) track('osi_template', { action: el.hasAttribute('data-copy') ? 'copy' : 'download' });
  });

  var burger = $('#burger');
  burger.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('.menu a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu-open'); }); });
  /* на главной своя шапка внутри первого экрана — общей #hdr там нет */
  var hdr = $('#hdr');
  if (hdr) { var onScroll = function () { hdr.classList.toggle('sc', window.scrollY > 8); }; window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }

  /* Первый экран главной: подпись и полоски под текущим фото (фото сменяются CSS-анимацией каждые 7 с) */
  var hx = $('#hx');
  if (hx) {
    var hxNames = ['Салоны красоты и SPA', 'Магазины и шоурумы', 'Отели'], hxI = 0;
    setInterval(function () {
      hxI = (hxI + 1) % 3;
      $('.hx-num', hx).firstChild.nodeValue = '0' + (hxI + 1) + ' ';
      $('.hx-name', hx).textContent = hxNames[hxI];
      $$('.hx-bars i', hx).forEach(function (b, k) { b.className = k < hxI ? 'done' : k === hxI ? 'on' : ''; });
    }, 7000);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { document.body.classList.toggle('past-hx', !es[0].isIntersecting); }, { threshold: .15 }).observe(hx);
    else document.body.classList.add('past-hx');
  }

  /* ── Подбор: где пахнет → чем пахнет → что делает аппарат, где поставим, комплект и цена ── */
  var find = function (list, slug) { for (var i = 0; i < list.length; i++) if (list[i].slug === slug) return list[i]; return null; };
  var pm6 = function (d) { return D.perMonth(d.plans[2]); };
  $$('[data-picker]').forEach(function (pk) {
    var place = pk.getAttribute('data-place'), odor = null;
    var zap = $('[data-zap]', pk).getAttribute('href'), root = $('[data-root]', pk).getAttribute('href');
    var s2 = $('[data-step="2"]', pk), box = $('[data-odors]', pk), res = $('[data-res]', pk);

    /* частые для помещения запахи — первыми и с отметкой */
    var all = $$('.pc', box);
    var order = function () {
      var pl = find(V.places, place);
      all.forEach(function (c) { c.classList.remove('pc-hot'); box.appendChild(c); });
      if (!pl || !pl.odors) return;
      pl.odors.slice().reverse().forEach(function (s) {
        var c = $('[data-v="' + s + '"]', box);
        if (c) { c.classList.add('pc-hot'); box.insertBefore(c, box.firstChild); }
      });
    };
    var render = function () {
      if (!odor) return;
      var o = find(V.odors, odor), pl = find(V.places, place);
      var setup = pl && pl.setup ? pl.setup : o.setup;
      var pm = setup.n300 * pm6(D.devices[0]) + setup.n1000 * pm6(D.devices[1]);
      var kit = [setup.n1000 ? setup.n1000 + ' × Nova 1000' : '', setup.n300 ? setup.n300 + ' × Nova 300' : ''].filter(Boolean).join(' + ');
      var msg = o.short + (pl ? ' — ' + pl.name.toLowerCase() : '') + '. Хочу подобрать аппарат.';
      res.innerHTML =
        '<div class="pk-out">' +
        '<p class="pk-t">' + esc(o.short) + (pl ? ' <span>· ' + esc(pl.name) + '</span>' : '') + '</p>' +
        '<div class="pk-col"><p class="pk-k pk-k-a">Что сделает аппарат</p><ul class="pk-ok"><li>' + esc(o.device[0]) + '</li><li>' + esc(o.device[1]) + '</li></ul></div>' +
        '<div class="pk-col"><p class="pk-k pk-k-a">Где поставим</p><ul class="pk-ok"><li>' + esc(o.where[0]) + '</li></ul></div>' +
        '<p class="pk-kit">Обычно хватает: <b>' + kit + '</b>' + (setup.note ? ' (' + esc(setup.note) + ')' : '') + ' — от ' + D.fmt(pm) + ' в месяц. Первые ' + D.trialDays + ' дня бесплатно.</p>' +
        '<div class="pk-btns"><a class="btn" href="' + wa(msg) + '" target="_blank" rel="noopener">Написать в WhatsApp</a><a class="btn btn-line" href="' + zap + o.slug + '/">Подробно о запахе</a>' +
        (pl && pl.url && !pk.hasAttribute('data-place') ? '<a class="btn btn-line" href="' + root + pl.url + '">Подробно: ' + esc(pl.name) + '</a>' : '') + '</div>' +
        '</div>';
    };
    $$('[data-step="1"] .pc', pk).forEach(function (c) {
      c.addEventListener('click', function () {
        place = c.getAttribute('data-v');
        $$('[data-step="1"] .pc', pk).forEach(function (x) { x.setAttribute('aria-pressed', x === c); });
        s2.disabled = false; order(); render();
      });
    });
    $$('.pc', box).forEach(function (c) {
      c.addEventListener('click', function () {
        odor = c.getAttribute('data-v');
        $$('.pc', box).forEach(function (x) { x.setAttribute('aria-pressed', x === c); });
        render();
      });
    });
    order();
  });

  /* ── Заявка: где пахнет, площадь, телефон → готовое сообщение в WhatsApp ── */
  var form = $('#lead-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var phone = $('#f-phone').value.trim(), test = $('#f-test').checked;
    var msg = 'Заявка.\nГде пахнет: ' + $('#f-place').value + '\nПлощадь: ' + $('#f-area').value + (phone ? '\nТелефон: ' + phone : '') + (test ? '\nХочу тест ' + D.trialDays + ' дня бесплатно.' : '');
    track('form_submit', { place: $('#f-place').value, area: $('#f-area').value });
    if (test) track('test_request', { via: 'form' });
    window.open(wa(msg), '_blank', 'noopener');
  });

  /* ── Объявление для собрания жильцов: скопировать текст ── */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = $(b.getAttribute('data-copy')).textContent, done = function () { b.classList.add('copied'); b.lastChild.textContent = 'Текст скопирован'; };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () {}); else done();
    });
  });

  /* Коллекция ароматов: выбор в списке меняет фото и карточку; на /aromaty/?a=<slug> сразу открывается нужный аромат */
  $$('.kl').forEach(function (kl) {
    var data = JSON.parse($('.kl-data', kl).textContent), its = $$('.kl-it', kl), phs = $$('.kl-ph', kl), card = $('.kl-card', kl);
    var all = $('.kl-all', kl), allHref = all ? all.getAttribute('href') : '';
    var k = function (n) { return $('[data-k="' + n + '"]', card); };
    var show = function (i, scroll) {
      var s = data[i], ph = null;
      its.forEach(function (x, j) { x.classList.toggle('on', j === i); x.setAttribute('aria-selected', j === i); });
      phs.forEach(function (x) { var on = x.getAttribute('data-ph') === s.p; x.classList.toggle('on', on); if (on) ph = x; });
      k('img').src = ph.src; k('img').alt = ph.alt; k('f').textContent = s.f; k('n').textContent = s.n; k('d').textContent = s.d; k('w').textContent = s.w;
      k('t').innerHTML = s.t.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
      k('m').href = /^https?:/.test(s.m) ? s.m : allHref + '?a=' + s.m; k('sm').href = s.sm;
      if (scroll && window.innerWidth < 900) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    its.forEach(function (x, i) { x.addEventListener('click', function () { show(i, true); }); });
    var want = new URLSearchParams(location.search).get('a');
    if (want) for (var i = 0; i < data.length; i++) if (data[i].s === want) { show(i); its[i].scrollIntoView({ block: 'center' }); break; }
  });

  /* Счётчики блока «Аромат и продажи»: от 0 до значения за 1,6 с, когда цифра появляется на экране */
  var cnt = $$('.sp-n[data-to]');
  if (cnt.length && 'IntersectionObserver' in window && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var runCnt = function (el) {
      var to = +el.getAttribute('data-to'), pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '', t0 = null;
      var step = function (t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1600); el.textContent = pre + Math.round(to * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { runCnt(e.target); cio.unobserve(e.target); } }); }, { threshold: .6 });
    cnt.forEach(function (el) { cio.observe(el); });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    $$('.sec-head, .ots > *, .pts > *, .steps > li, .devs > *, .zones > *, .arts > *, .kits > *, .cmp-r, .how > li').forEach(function (el, i) { el.classList.add('rv'); el.style.transitionDelay = (i % 4) * 50 + 'ms'; io.observe(el); });
  }
})();
