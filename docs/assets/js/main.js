/* ВДОХ — меню, калькулятор, заявка в WhatsApp, появление блоков. Симулятор — в sim.js. */
(function () {
  var D = window.SITE_DATA;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var burger = $('#burger');
  burger.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('.menu a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu-open'); }); });

  /* калькулятор: площадь × коэффициент потолка → bestSetup, + Nova 300 на каждую закрытую комнату */
  var area = $('#c-area');
  if (area) {
    var f = 1, rooms = $('#c-rooms');
    var calc = function () {
      var a = +area.value, r = +rooms.value, b = D.bestSetup(Math.round(a * f), 6);
      var n3 = b.nova300 + r, pm = b.pm + r * D.perMonth(D.devices[0].plans[2]);
      $('#c-area-o').textContent = a.toLocaleString('ru-RU') + ' м²';
      $('#c-rooms-o').textContent = r;
      $('#c-set').textContent = [b.nova1000 ? b.nova1000 + ' × Nova 1000' : '', n3 ? n3 + ' × Nova 300' : ''].filter(Boolean).join(' + ');
      $('#c-pm').textContent = D.fmt(pm);
    };
    area.addEventListener('input', calc); rooms.addEventListener('input', calc);
    $$('#c-ceil button').forEach(function (b) {
      b.addEventListener('click', function () {
        f = +b.getAttribute('data-f');
        $$('#c-ceil button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        calc();
      });
    });
    calc();
  }

  var form = $('#lead-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = $('#f-type').value, a = $('#f-area').value.trim(), o = $('#f-odor').value.trim();
    var msg = 'Здравствуйте! Хочу рассчитать ароматизацию (ВДОХ).\nПомещение: ' + t + (a ? '\nПлощадь: ' + a + ' м²' : '') + (o ? '\nЧто мешает: ' + o : '') + '\nСтраница: ' + document.title;
    window.open(D.waLink(msg), '_blank', 'noopener');
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    $$('.sec .sec-head, .grid3 > *, .laws > li, .devs > *, .zones > *, .srs > li, .odors > li').forEach(function (el, i) { el.classList.add('rv'); el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); });
  }
})();
