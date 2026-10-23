/* ВДОХ — тепловизор аромата. План помещения сверху, аромат расходится от диффузоров
   по геодезическому расстоянию (обходит стены, проходит в двери), тепловая карта на canvas.
   Разметка: <div class="sim" data-scene="id" [data-tabs]> … см. src/ui.js simBlock(). */
(function () {
  var D = window.SITE_DATA, SC = window.SCENES;
  // радиус (м), на котором аромат ещё ощущается: аппарат обычно стоит у стены, поэтому
  // паспортную площадь он закрывает неполным кругом — берём R = √(1.4·A/π)
  var RADIUS = { '300': Math.sqrt(420 / Math.PI), '1000': Math.sqrt(1400 / Math.PI) };
  var K = 1.2, TH = Math.exp(-K); // порог «аромат ощущается»
  var STOPS = [[0, [9, 12, 22, 0]], [0.16, [38, 30, 120, 140]], [0.3, [28, 110, 210, 175]], [0.45, [47, 212, 193, 180]], [0.7, [255, 210, 63, 180]], [0.9, [255, 128, 48, 195]], [1, [255, 90, 31, 210]]];
  function cmap(v) {
    for (var i = 1; i < STOPS.length; i++) if (v <= STOPS[i][0]) {
      var a = STOPS[i - 1], b = STOPS[i], t = (v - a[0]) / (b[0] - a[0]);
      return [0, 1, 2, 3].map(function (k) { return a[1][k] + (b[1][k] - a[1][k]) * t; });
    }
    return STOPS[STOPS.length - 1][1];
  }
  var LUT = []; for (var i = 0; i <= 255; i++) LUT.push(cmap(i / 255));

  function Heap() { this.a = []; }
  Heap.prototype.push = function (n, d) { var a = this.a; a.push([d, n]); var i = a.length - 1; while (i) { var p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; var t = a[p]; a[p] = a[i]; a[i] = t; i = p; } };
  Heap.prototype.pop = function () { var a = this.a, top = a[0], last = a.pop(); if (a.length) { a[0] = last; var i = 0; for (;;) { var l = 2 * i + 1, r = l + 1, m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; var t = a[m]; a[m] = a[i]; a[i] = t; i = m; } } return top; };

  function Sim(el) {
    this.el = el;
    this.cv = el.querySelector('canvas');
    this.ctx = this.cv.getContext('2d');
    this.type = '300';
    this.t0 = performance.now();
    var self = this;
    el.querySelectorAll('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { self.load(b.getAttribute('data-tab')); }); });
    el.querySelectorAll('[data-type]').forEach(function (b) {
      b.addEventListener('click', function () {
        self.type = b.getAttribute('data-type');
        el.querySelectorAll('[data-type]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      });
    });
    el.querySelector('[data-act="auto"]').addEventListener('click', function () { self.reset(); });
    el.querySelector('[data-act="clear"]').addEventListener('click', function () { self.devs = []; self.update(); });
    this.cv.addEventListener('click', function (e) { self.click(e); });
    window.addEventListener('resize', function () { self.size(); });
    this.load(el.getAttribute('data-scene'));
    var loop = function (t) { self.draw(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  Sim.prototype.load = function (id) {
    var s = SC.find(function (x) { return x.id === id; }) || SC[0];
    this.s = s;
    this.el.querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-tab') === s.id); });
    var link = this.el.querySelector('[data-scene-link]');
    if (link) { link.href = link.getAttribute('data-base') + 'simulyator/' + s.id + '/'; link.querySelector('b').textContent = s.tab.toLowerCase(); }
    // сетка: не больше ~16 000 клеток
    this.res = Math.max(0.25, Math.sqrt(s.w * s.h / 16000));
    this.gw = Math.ceil(s.w / this.res); this.gh = Math.ceil(s.h / this.res);
    var g = new Uint8Array(this.gw * this.gh), self = this;
    s.walls.forEach(function (w) {
      var x1 = Math.round(w[0] / self.res), y1 = Math.round(w[1] / self.res), x2 = Math.round(w[2] / self.res), y2 = Math.round(w[3] / self.res);
      for (var x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) for (var y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        if (x >= 0 && y >= 0 && x < self.gw && y < self.gh) g[y * self.gw + x] = 1;
      }
    });
    this.wall = g;
    this.zonesEl();
    this.size();
    this.reset();
  };

  Sim.prototype.reset = function () { this.devs = this.s.dev.map(function (d) { return { x: d.x, y: d.y, t: d.t }; }); this.update(); };

  /* геодезическое расстояние (м) от точки по сетке, 8 соседей, стены непроходимы */
  Sim.prototype.dist = function (d) {
    var gw = this.gw, gh = this.gh, res = this.res, wall = this.wall;
    var out = new Float64Array(gw * gh).fill(1e9); // Float64: с Float32 округление ломало сравнение dd > out[n]
    var sx = Math.min(gw - 1, Math.max(0, Math.floor(d.x / res))), sy = Math.min(gh - 1, Math.max(0, Math.floor(d.y / res)));
    var h = new Heap(), s0 = sy * gw + sx; out[s0] = 0; h.push(s0, 0);
    var nb = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
    var maxD = RADIUS[d.t] * 2.2 / res;
    while (h.a.length) {
      var top = h.pop(), dd = top[0], n = top[1];
      if (dd > out[n] || dd > maxD) continue;
      var x = n % gw, y = (n / gw) | 0;
      for (var k = 0; k < 8; k++) {
        var nx = x + nb[k][0], ny = y + nb[k][1];
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
        var m = ny * gw + nx;
        if (wall[m]) continue;
        if (k > 3 && (wall[y * gw + nx] || wall[ny * gw + x])) continue; // не проходить по диагонали сквозь угол стены
        var nd = dd + nb[k][2];
        if (nd < out[m]) { out[m] = nd; h.push(m, nd); }
      }
    }
    for (var i = 0; i < out.length; i++) out[i] *= res;
    return out;
  };

  Sim.prototype.update = function () {
    var self = this;
    this.fields = this.devs.map(function (d) { return { d: d, dist: self.dist(d) }; });
    this.t0 = performance.now();
    this.stats(1);
  };

  /* концентрация 0…1 в клетке при росте g (0…1) */
  Sim.prototype.conc = function (i, g) {
    var c = 0;
    for (var f = 0; f < this.fields.length; f++) {
      var F = this.fields[f], R = RADIUS[F.d.t] * Math.max(0.05, g), q = F.dist[i] / R;
      c += Math.exp(-K * q * q);
    }
    return c > 1 ? 1 : c;
  };

  Sim.prototype.stats = function () {
    var free = 0, ok = 0;
    for (var i = 0; i < this.wall.length; i++) { if (this.wall[i]) continue; free++; if (this.conc(i, 1) >= TH) ok++; }
    var cov = free ? Math.round(ok / free * 100) : 0;
    var n3 = this.devs.filter(function (d) { return d.t === '300'; }).length, n10 = this.devs.length - n3;
    var pm = n3 * D.perMonth(D.devices[0].plans[2]) + n10 * D.perMonth(D.devices[1].plans[2]);
    var q = function (s) { return this.el.querySelector(s); }.bind(this);
    q('[data-o="cov"]').textContent = cov + '%';
    q('[data-o="bar"]').style.width = cov + '%';
    q('[data-o="area"]').textContent = (this.s.w * this.s.h) + ' м²';
    q('[data-o="devs"]').textContent = this.devs.length ? [n10 ? n10 + ' × Nova 1000' : '', n3 ? n3 + ' × Nova 300' : ''].filter(Boolean).join(' + ') : '—';
    q('[data-o="pm"]').textContent = this.devs.length ? D.fmt(pm) : '—';
    q('[data-o="verdict"]').textContent = !this.devs.length ? 'Нажмите на план, чтобы поставить диффузор' : cov >= 90 ? 'Отлично: аромат есть во всех зонах' : cov >= 70 ? 'Хорошо: остались слабые места' : 'Мало: добавьте аппарат или передвиньте его';
    this.el.setAttribute('data-cov', cov >= 90 ? 'hi' : cov >= 70 ? 'mid' : 'lo');
  };

  Sim.prototype.size = function () {
    var wrap = this.cv.parentNode, W = wrap.clientWidth, s = this.s;
    var H = Math.min(W * s.h / s.w, window.innerHeight * 0.72);
    W = Math.min(W, H * s.w / s.h);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cv.width = Math.round(W * dpr); this.cv.height = Math.round(H * dpr);
    this.cv.style.width = W + 'px'; this.cv.style.height = H + 'px';
    this.k = W / s.w; this.dpr = dpr;
    this.buf = document.createElement('canvas'); this.buf.width = this.gw; this.buf.height = this.gh;
    this.bctx = this.buf.getContext('2d'); this.img = this.bctx.createImageData(this.gw, this.gh);
    var zl = this.el.querySelector('.sim-zones');
    zl.style.width = W + 'px'; zl.style.height = H + 'px';
  };

  Sim.prototype.zonesEl = function () {
    var zl = this.el.querySelector('.sim-zones'), s = this.s;
    zl.innerHTML = s.zones.map(function (z, i) {
      return '<button type="button" class="zn" style="left:' + (z.x / s.w * 100) + '%;top:' + (z.y / s.h * 100) + '%"><span class="zn-n">' + String(i + 1).padStart(2, '0') + '</span><span class="zn-t"><b>' + z.name + '</b><span>' + z.task + '</span><em>' + z.sol + '</em></span></button>';
    }).join('');
    zl.querySelectorAll('.zn').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); var on = b.classList.contains('on'); zl.querySelectorAll('.zn').forEach(function (x) { x.classList.remove('on'); }); if (!on) b.classList.add('on'); });
    });
  };

  Sim.prototype.click = function (e) {
    var r = this.cv.getBoundingClientRect(), x = (e.clientX - r.left) / this.k, y = (e.clientY - r.top) / this.k;
    var hit = -1;
    this.devs.forEach(function (d, i) { if (Math.hypot(d.x - x, d.y - y) < 0.9) hit = i; });
    if (hit >= 0) this.devs.splice(hit, 1);
    else {
      var gx = Math.floor(x / this.res), gy = Math.floor(y / this.res);
      if (this.wall[gy * this.gw + gx]) return;
      if (this.devs.length >= 8) return;
      this.devs.push({ x: x, y: y, t: this.type });
    }
    this.update();
  };

  Sim.prototype.draw = function (t) {
    var ctx = this.ctx, s = this.s, k = this.k * this.dpr, W = this.cv.width, H = this.cv.height;
    var g = Math.min(1, (t - this.t0) / 2200); g = 1 - Math.pow(1 - g, 3);
    // тепловая карта
    var px = this.img.data, gw = this.gw, gh = this.gh, tt = t / 1000;
    for (var y = 0; y < gh; y++) for (var x = 0; x < gw; x++) {
      var i = y * gw + x, o = i * 4;
      if (this.wall[i]) { px[o + 3] = 0; continue; }
      var c = this.conc(i, g);
      c *= 0.94 + 0.06 * Math.sin(tt * 1.6 + x * 0.35 + y * 0.22) * Math.sin(tt * 0.9 - y * 0.3);
      var L = LUT[Math.max(0, Math.min(255, (c * 255) | 0))];
      px[o] = L[0]; px[o + 1] = L[1]; px[o + 2] = L[2]; px[o + 3] = L[3];
    }
    this.bctx.putImageData(this.img, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0B0F16'; ctx.fillRect(0, 0, W, H);
    // сетка 1 м
    ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (var gx = 1; gx < s.w; gx++) { ctx.moveTo(gx * k, 0); ctx.lineTo(gx * k, H); }
    for (var gy = 1; gy < s.h; gy++) { ctx.moveTo(0, gy * k); ctx.lineTo(W, gy * k); }
    ctx.stroke();
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this.buf, 0, 0, gw * this.res * k, gh * this.res * k);
    // мебель
    ctx.font = (11 * this.dpr) + 'px "JetBrains Mono",monospace'; ctx.textBaseline = 'middle';
    s.furn.forEach(function (f) {
      ctx.fillStyle = 'rgba(11,15,22,.55)'; ctx.fillRect(f[0] * k, f[1] * k, f[2] * k, f[3] * k);
      ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1.2 * this.dpr; ctx.strokeRect(f[0] * k, f[1] * k, f[2] * k, f[3] * k);
      if (f[4] && f[2] * k > 50 * this.dpr) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText(f[4], f[0] * k + 6 * this.dpr, (f[1] + f[3] / 2) * k); }
    }, this);
    // стены и контур
    ctx.strokeStyle = '#F2F5F8'; ctx.lineCap = 'square';
    ctx.lineWidth = 5 * this.dpr; ctx.strokeRect(0, 0, W, H);
    ctx.lineWidth = 4 * this.dpr; ctx.beginPath();
    s.walls.forEach(function (w) { ctx.moveTo(w[0] * k, w[1] * k); ctx.lineTo(w[2] * k, w[3] * k); });
    ctx.stroke();
    // вход
    if (s.door) {
      ctx.fillStyle = '#0B0F16'; ctx.fillRect((s.door[0] - 0.7) * k, H - 6 * this.dpr, 1.4 * k, 6 * this.dpr);
      ctx.fillStyle = '#FF5A1F'; ctx.font = '600 ' + (11 * this.dpr) + 'px "JetBrains Mono",monospace'; ctx.textAlign = 'center';
      ctx.fillText('ВХОД ↑', s.door[0] * k, H - 16 * this.dpr); ctx.textAlign = 'left';
    }
    // диффузоры
    var pulse = (t / 1600) % 1;
    this.devs.forEach(function (d) {
      var x = d.x * k, y = d.y * k, r = (d.t === '1000' ? 9 : 7) * this.dpr;
      ctx.strokeStyle = 'rgba(255,90,31,' + (1 - pulse) * .8 + ')'; ctx.lineWidth = 2 * this.dpr;
      ctx.beginPath(); ctx.arc(x, y, r + pulse * 26 * this.dpr, 0, 7); ctx.stroke();
      ctx.fillStyle = '#FF5A1F'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.fillStyle = '#0B0F16'; ctx.fillRect(x - r * .25, y - r * .7, r * .5, r * 1.4);
      ctx.fillStyle = '#fff'; ctx.font = '600 ' + (10 * this.dpr) + 'px "JetBrains Mono",monospace';
      ctx.fillText(d.t, x + r + 4 * this.dpr, y - r);
    }, this);
    // масштаб
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(10 * this.dpr, 12 * this.dpr, k * 2, 2 * this.dpr);
    ctx.font = (10 * this.dpr) + 'px "JetBrains Mono",monospace'; ctx.fillText('2 м', 10 * this.dpr, 24 * this.dpr);
  };

  document.querySelectorAll('.sim').forEach(function (el) { new Sim(el); });
})();
