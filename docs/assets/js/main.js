/* Aromé — меню, подбор решения, заявка в WhatsApp, появление блоков. */
(function () {
  var D = window.SITE_DATA, V = window.VD;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };

  var burger = $('#burger');
  burger.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('.menu a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu-open'); }); });
  var hdr = $('#hdr'), onScroll = function () { hdr.classList.toggle('sc', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ── Подбор: место → запах → результат ── */
  var find = function (list, slug) { for (var i = 0; i < list.length; i++) if (list[i].slug === slug) return list[i]; return null; };
  var pm6 = function (d) { return D.perMonth(d.plans[2]); };
  $$('[data-picker]').forEach(function (pk) {
    var place = pk.getAttribute('data-place'), odor = null;
    var zap = $('[data-zap]', pk).getAttribute('href');
    var s2 = $('[data-step="2"]', pk), box = $('[data-odors]', pk), res = $('[data-res]', pk);

    /* частые для помещения запахи — первыми и с отметкой */
    var all = $$('.pc', box);
    var order = function () {
      var pl = find(V.places, place);
      all.forEach(function (c) { c.classList.remove('pc-hot'); box.appendChild(c); });
      if (!pl) return;
      pl.odors.slice().reverse().forEach(function (s) {
        var c = $('[data-v="' + s + '"]', box);
        if (c) { c.classList.add('pc-hot'); box.insertBefore(c, box.firstChild); }
      });
    };
    var render = function () {
      if (!odor) return;
      var o = find(V.odors, odor), pl = find(V.places, place);
      var setup = pl ? pl.setup : { n300: 1, n1000: 0 };
      var pm = setup.n300 * pm6(D.devices[0]) + setup.n1000 * pm6(D.devices[1]);
      var kit = [setup.n1000 ? setup.n1000 + ' × Nova 1000' : '', setup.n300 ? setup.n300 + ' × Nova 300' : ''].filter(Boolean).join(' + ');
      var msg = 'Здравствуйте! ' + o.short + (pl ? ' — ' + pl.name.toLowerCase() : '') + '. Хочу понять причину и убрать запах (Aromé).';
      var li = function (a) { return a.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join(''); };
      res.innerHTML =
        '<div class="pk-out">' +
        '<p class="pk-t">' + esc(o.short) + (pl ? ' <span>· ' + esc(pl.name) + '</span>' : '') + '</p>' +
        '<div class="pk-col"><p class="pk-k">Скорее всего, причина</p><ul>' + li(o.causes.slice(0, 3)) + '</ul></div>' +
        '<div class="pk-col"><p class="pk-k">Проверьте сегодня</p><ul class="pk-ok">' + li(o.self.slice(0, 2)) + '</ul></div>' +
        '<p class="pk-kit">Обычно хватает: <b>' + kit + '</b> — от ' + D.fmt(pm) + ' в месяц</p>' +
        '<div class="pk-btns"><a class="btn" href="' + D.waLink(msg) + '" target="_blank" rel="noopener">Обсудить в WhatsApp</a><a class="btn btn-line" href="' + zap + o.slug + '/">Подробно о запахе</a></div>' +
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

  var form = $('#lead-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = $('#f-note').value.trim();
    var msg = 'Здравствуйте! Нужна помощь с запахом (Aromé).\nГде: ' + $('#f-place').value + '\nЧем пахнет: ' + $('#f-odor').value + '\nКогда сильнее: ' + $('#f-when').value + (n ? '\nКомментарий: ' + n : '') + '\nСтраница: ' + document.title;
    window.open(D.waLink(msg), '_blank', 'noopener');
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    $$('.sec-head, .ots > *, .pts > *, .steps > li, .devs > *, .zones > *, .arts > *, .kits > *, .cmp-r').forEach(function (el, i) { el.classList.add('rv'); el.style.transitionDelay = (i % 4) * 50 + 'ms'; io.observe(el); });
  }
})();
