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
    /* шапка закреплена сверху: после прокрутки становится светлой */
    var hxSolid = function () { document.body.classList.toggle('hx-solid', window.scrollY > 40); };
    window.addEventListener('scroll', hxSolid, { passive: true }); hxSolid();
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

  /* ── Заявка (блок внизу главной и окно): имя, телефон, пространство → готовое сообщение в WhatsApp ── */
  $$('[data-lf]').forEach(function (lf) {
    var lfPhone = $('.lf-phone', lf), lfOk = $('.lf-agree', lf);
    /* телефон в виде (700) 000-00-00 */
    lfPhone.addEventListener('input', function () {
      var d = lfPhone.value.replace(/\D/g, '').replace(/^[78](?=\d{10})/, '').slice(0, 10), v = '';
      if (d.length) v = '(' + d.slice(0, 3);
      if (d.length >= 3) v += ') ' + d.slice(3, 6);
      if (d.length >= 6) v += '-' + d.slice(6, 8);
      if (d.length >= 8) v += '-' + d.slice(8, 10);
      lfPhone.value = v;
      lfPhone.parentNode.classList.remove('err');
    });
    lfOk.addEventListener('change', function () { lfOk.parentNode.classList.remove('err'); });
    lf.addEventListener('submit', function (e) {
      e.preventDefault();
      var digits = lfPhone.value.replace(/\D/g, ''), sp = $('input[type="radio"]:checked', lf), name = $('.lf-name', lf).value.trim();
      var bad = false;
      if (digits.length !== 10) { lfPhone.parentNode.classList.add('err'); bad = true; }
      if (!lfOk.checked) { lfOk.parentNode.classList.add('err'); bad = true; }
      if (bad) { (digits.length !== 10 ? lfPhone : lfOk).focus(); return; }
      var msg = 'Заявка на тест ' + D.trialDays + ' дня бесплатно.' + (name ? '\nИмя: ' + name : '') + '\nТелефон: +7 ' + lfPhone.value + (sp ? '\nПространство: ' + sp.value : '');
      track('form_submit', { space: sp ? sp.value : '', where: lf.closest('.rq') ? 'modal' : 'block' });
      track('test_request', { via: 'form' });
      window.open(wa(msg), '_blank', 'noopener');
    });
  });

  /* ── Окно заявки: кнопки «Оставить заявку», «Подобрать решение» и другие ссылки на #zayavka открывают его на месте ── */
  var rq = $('#rq');
  if (rq) {
    var rqLast = null;
    var rqOpen = function (from) {
      rqLast = from || null;
      rq.hidden = false; document.body.classList.add('rq-open');
      if (document.body.classList.contains('menu-open')) { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); }
      setTimeout(function () { var f = $('.lf-name', rq); if (f && window.innerWidth > 900) f.focus(); }, 60);
      track('form_open', { from: from ? (from.className || from.textContent).toString().slice(0, 40) : '' });
    };
    var rqClose = function () { rq.hidden = true; document.body.classList.remove('rq-open'); if (rqLast) rqLast.focus(); };
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href$="#zayavka"], [data-rq]') : null;
      if (a && !a.closest('.rq')) { e.preventDefault(); rqOpen(a); return; }
      if (e.target.closest && e.target.closest('[data-rq-close]')) rqClose();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !rq.hidden) rqClose(); });
  }

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

  /* Пространства: стрелки листают ленту на одну карточку, полоска внизу показывает, где мы в ленте */
  $$('.ps').forEach(function (ps) {
    var t = $('.ps-track', ps), bar = $('.ps-prog i', ps), nav = $$('.ps-nav button', ps);
    var upd = function () { var m = t.scrollWidth - t.clientWidth, w = t.clientWidth / t.scrollWidth; bar.style.width = w * 100 + '%'; bar.style.left = (m ? t.scrollLeft / m : 0) * (1 - w) * 100 + '%'; };
    var step = function (d) { t.scrollBy({ left: d * ($('.ps-card', t).offsetWidth + 16), behavior: 'smooth' }); };
    t.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
    if (nav.length) { nav[0].addEventListener('click', function () { step(-1); }); nav[1].addEventListener('click', function () { step(1); }); }
    /* мышью ленту можно тянуть; после перетаскивания клик по карточке не срабатывает, лента доводится до ближайшей карточки */
    var drag = null, moved = false;
    t.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, left: t.scrollLeft }; moved = false;
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!moved && Math.abs(dx) > 5) { moved = true; t.classList.add('drag'); }
      if (moved) t.scrollLeft = drag.left - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!drag) return;
      drag = null;
      if (!moved) return;
      var l = t.scrollLeft; t.classList.remove('drag'); t.scrollLeft = l;
      var c = $$('.ps-card', t), best = 0, pad = parseFloat(getComputedStyle(t).paddingLeft);
      c.forEach(function (x, i) { if (Math.abs(x.offsetLeft - pad - l) < Math.abs(c[best].offsetLeft - pad - l)) best = i; });
      t.scrollTo({ left: c[best].offsetLeft - pad, behavior: 'smooth' });
    });
    t.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    t.addEventListener('dragstart', function (e) { e.preventDefault(); });
    /* плашка-курсор: плавно идёт за мышью над лентой, над карточкой заявки прячется */
    var cur = $('.ps-cur', ps);
    if (cur && window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      var cx = 0, cy = 0, x = 0, y = 0, raf = 0;
      var loop = function () {
        x += (cx - x) * .25; y += (cy - y) * .25;
        cur.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
        raf = Math.abs(cx - x) + Math.abs(cy - y) > .3 ? requestAnimationFrame(loop) : 0;
      };
      t.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        cx = e.clientX; cy = e.clientY;
        var on = !e.target.closest('.ps-cta');
        if (on && !cur.classList.contains('on')) { x = cx; y = cy; }
        cur.classList.toggle('on', on);
        if (!raf) raf = requestAnimationFrame(loop);
      });
      t.addEventListener('pointerleave', function () { if (!drag) cur.classList.remove('on'); });
      t.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') cur.classList.add('down'); });
      window.addEventListener('pointerup', function () { cur.classList.remove('down'); });
      window.addEventListener('scroll', function () { if (!t.matches(':hover')) cur.classList.remove('on'); }, { passive: true });
    }
  });

  /* Аппарат: переключение Nova 300 / Nova 1000 и плюсы, открывающие карточки характеристик (открыта одна) */
  $$('.dv').forEach(function (dv) {
    var data = JSON.parse($('.dv-data', dv).textContent), hs = $$('.dv-hs', dv), tips = $$('.dv-tip', dv), tabs = $$('.dv-tabs button', dv);
    var k = function (n) { return $('[data-k="' + n + '"]', dv); };
    var open = function (i) {
      hs.forEach(function (b, j) { var on = j === i; b.classList.toggle('on', on); b.setAttribute('aria-expanded', on); tips[j].classList.toggle('on', on); });
    };
    hs.forEach(function (b, i) { b.addEventListener('click', function () { open(b.classList.contains('on') ? -1 : i); }); });
    tabs.forEach(function (b, i) {
      b.addEventListener('click', function () {
        var m = data[i];
        tabs.forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
        k('lead').innerHTML = m.lead; k('name').textContent = m.n; k('num').textContent = m.n.split(' ')[1];
        tips.forEach(function (el, j) { el.innerHTML = m.t[j]; });
      });
    });
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
