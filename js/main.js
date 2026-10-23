(function () {
  const D = window.SITE_DATA, SC = window.SCENES;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const monthsWord = m => m === 1 ? 'месяц' : m < 5 ? 'месяца' : 'месяцев';
  const byN = n => D.scents.find(s => s.n === n);
  const CLOUD = { floral: '#FF6FA8', fresh: '#21BFD0', gourmand: '#E8962E', hotel: '#C29A62', spa: '#33B57C', perfume: '#8466FF' };

  /* isometric projection: room 10×10 units, 48px per unit, viewBox -560 -40 1120 760 */
  const S = 48, OY = 230, VB = { x: -560, y: -40, w: 1120, h: 760 };
  const iso = (x, y, z = 0) => [(x - y) * 0.866 * S, (x + y) * 0.5 * S - z * S + OY];
  const pts = arr => arr.map(p => iso(...p).map(v => v.toFixed(1)).join(',')).join(' ');
  const pct = ([X, Y]) => [(X - VB.x) / VB.w * 100, (Y - VB.y) / VB.h * 100];
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  const st = { scene: 0, spot: 0, scent: 0, intensity: 60, area: SC[0].area, term: 2 };

  /* ---------- pricing logic shared with the console ---------- */
  function best(area, ti) {
    const [s, l] = D.devices; let top = null;
    for (let big = 0; big <= Math.ceil(area / l.area); big++) {
      const small = Math.ceil(Math.max(0, area - big * l.area) / s.area);
      const cost = big * D.perMonth(l.plans[ti]) + small * D.perMonth(s.plans[ti]);
      if (!top || cost < top.cost || (cost === top.cost && big + small < top.big + top.small)) top = { big, small, cost, cap: big * l.area + small * s.area };
    }
    return top;
  }

  /* ---------- room drawing ---------- */
  function box(b, parent, cls) {
    const { x, y, w, d, h } = b, z = b.z || 0;
    const g = el('g', { class: cls || (b.glass ? 'glass' : '') }, parent);
    el('polygon', { class: (cls === 'dev' ? 'dev-f' : 'bx-f'), points: pts([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]) }, g);
    el('polygon', { class: (cls === 'dev' ? 'dev-r' : 'bx-r'), points: pts([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]) }, g);
    el('polygon', { class: (cls === 'dev' ? 'dev-top' : 'bx-top'), points: pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]) }, g);
    if (cls === 'dev') {
      const [lx, ly] = iso(x + w * 0.62, y + d, z + h * 0.72);
      el('rect', { class: 'dev-led', x: lx - 3, y: ly - 4, width: 6, height: 8 }, g);
    }
    return g;
  }

  function person(p, parent) {
    const g = el('g', { class: 'person' }, parent);
    const [fx, fy] = iso(p.x, p.y, 0), [, hy] = iso(p.x, p.y, 0.95), [, sy] = iso(p.x, p.y, 1.45), [, ty] = iso(p.x, p.y, 1.72);
    el('ellipse', { cx: fx, cy: fy, rx: 12, ry: 5 }, g);
    el('path', { d: `M${fx - 5} ${fy} L${fx} ${hy} L${fx + 5} ${fy} M${fx} ${hy} L${fx} ${sy} M${fx - 9} ${sy + 12} L${fx} ${sy} L${fx + 9} ${sy + 12}` }, g);
    el('circle', { cx: fx, cy: ty, r: 8 }, g);
  }

  function drawStatic() {
    const s = SC[st.scene];
    const floor = $('#g-floor'); floor.innerHTML = '';
    el('polygon', { class: 'wall', points: pts([[0, 0, 0], [10, 0, 0], [10, 0, 4], [0, 0, 4]]) }, floor);
    el('polygon', { class: 'wall', points: pts([[0, 0, 0], [0, 10, 0], [0, 10, 4], [0, 0, 4]]) }, floor);
    s.wall.forEach(w => {
      const P = w.side === 'y0' ? [[w.a, 0, w.z0], [w.b, 0, w.z0], [w.b, 0, w.z1], [w.a, 0, w.z1]] : [[0, w.a, w.z0], [0, w.b, w.z0], [0, w.b, w.z1], [0, w.a, w.z1]];
      el('polygon', { class: 'deco wall-solid', points: pts(P) }, floor);
    });
    el('polygon', { class: 'floor', points: pts([[0, 0], [10, 0], [10, 10], [0, 10]]) }, floor);
    for (let i = 1; i < 10; i++) {
      el('polyline', { class: 'grid', points: pts([[i, 0], [i, 10]]) }, floor);
      el('polyline', { class: 'grid', points: pts([[0, i], [10, i]]) }, floor);
    }
  }

  function drawDynamic() {
    const s = SC[st.scene], r = best(st.area, st.term), n = Math.min(3, r.big + r.small);
    /* clouds */
    const gc = $('#g-cloud'); gc.innerHTML = '';
    const cov = r.cap / st.area;
    const base = (2.2 + 5.6 * Math.min(cov, 1.4) / 1.4) * (0.55 + st.intensity / 100 * 0.6);
    const each = n > 1 ? base / Math.sqrt(n) * 1.15 : base;
    for (let i = 0; i < n; i++) {
      const d = s.dev[i], [cx, cy] = iso(d.x, d.y, 0);
      el('ellipse', { class: 'cloud c' + (i + 1), cx, cy, rx: each * S * 1.2247, ry: each * S * 0.7071 }, gc);
      if (!reduce) el('ellipse', { class: 'ring', cx, cy, rx: each * S * 1.2247, ry: each * S * 0.7071, style: `animation-delay:${-i * 0.8}s` }, gc);
    }
    /* boxes + diffusers, painter-sorted */
    const gb = $('#g-boxes'); gb.innerHTML = '';
    const items = s.boxes.map(b => ({ b, k: b.x + b.w / 2 + b.y + b.d / 2 }));
    for (let i = 0; i < n; i++) { const d = s.dev[i]; items.push({ b: { x: d.x - 0.25, y: d.y - 0.2, w: 0.5, d: 0.4, h: 0.75 }, k: d.x + d.y, dev: true }); }
    items.sort((a, b) => a.k - b.k).forEach(it => box(it.b, gb, it.dev ? 'dev' : null));
    /* console numbers */
    const parts = []; if (r.big) parts.push(r.big + ' × Nova 1000'); if (r.small) parts.push(r.small + ' × Nova 300');
    $('#c-set').textContent = parts.join(' + ');
    $('#c-cov').textContent = Math.min(100, Math.round(cov * 100)) + '%';
    $('#c-covbar').style.width = Math.min(100, cov * 100) + '%';
    $('#c-price').textContent = D.fmt(r.cost);
    const m = D.devices[0].plans[st.term].months, sc = byN(s.scents[st.scent]);
    $('#c-send').href = D.waLink(`Здравствуйте! Собрал сцену в ВДОХ: ${s.tab}, ${st.area} м², аромат «${sc.name}», ${parts.join(' + ')}, подписка ${m} ${monthsWord(m)}. Хочу попробовать 3 дня бесплатно.`);
  }

  function drawPeopleAndSpots() {
    const s = SC[st.scene];
    const gp = $('#g-people'); gp.innerHTML = '';
    s.people.forEach(p => person(p, gp));
    const gl = $('#g-lines'); gl.innerHTML = '';
    const hs = $('#hotspots'); hs.innerHTML = '';
    s.spots.forEach((sp, i) => {
      const P = iso(sp.x, sp.y, sp.z), dir = P[0] > -40 ? 1 : -1;
      const A = [P[0] + dir * 110, P[1] - 70];
      el('polyline', { class: 'lead' + (i === st.spot ? ' on' : ''), 'data-i': i, points: `${P[0]},${P[1]} ${P[0] + dir * 40},${A[1]} ${A[0]},${A[1]}` }, gl);
      const [px, py] = pct(P), [ax, ay] = pct(A);
      hs.insertAdjacentHTML('beforeend',
        `<button type="button" class="hs" data-i="${i}" style="left:${px}%;top:${py}%" aria-pressed="${i === st.spot}" aria-label="Зона: ${esc(sp.zone)}">+</button>
         <button type="button" class="lbl${dir < 0 ? ' l' : ''}" data-i="${i}" style="left:${ax}%;top:${ay}%" aria-pressed="${i === st.spot}">${esc(sp.zone)}</button>`);
    });
    const bb = $('#bubbles'); bb.innerHTML = '';
    s.people.forEach((p, i) => {
      const [x, y] = pct(iso(p.x, p.y, 2.15));
      bb.insertAdjacentHTML('beforeend', `<span class="bub" data-i="${i}" style="left:${x}%;top:${y}%">${esc(p.say)}</span>`);
    });
  }

  function renderPanel() {
    const s = SC[st.scene], sp = s.spots[st.spot], sc = byN(s.scents[st.scent]);
    $('#p-idx').textContent = `0${st.spot + 1}/0${s.spots.length}`;
    $('#p-zone').textContent = sp.zone;
    $('#p-task').textContent = sp.task;
    $('#p-sol').textContent = sp.sol;
    $('#p-scent').textContent = sc.name;
    $('#p-scent-d').textContent = sc.desc;
    $('#sim').style.setProperty('--cloud', CLOUD[sc.cat]);
    $$('#hotspots [data-i]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.i === st.spot));
    $$('#g-lines .lead').forEach(l => l.classList.toggle('on', +l.dataset.i === st.spot));
  }

  /* LED status cycles scene code / scent number / ON */
  let ledTimer;
  function led() {
    clearInterval(ledTimer);
    const s = SC[st.scene], msgs = [s.led, 'SCENT ' + s.scents[st.scent], 'AROMA ON', st.intensity + '%'];
    let i = 0; const o = { cols: 48, rows: 9, pitch: 6, r: 2.3, on: '#FF7A45', off: 'rgba(255,122,69,.08)' };
    LED.svg($('#led'), msgs[0], o);
    if (!reduce) ledTimer = setInterval(() => { i = (i + 1) % msgs.length; LED.svg($('#led'), msgs[i], o); }, 1700);
  }

  /* speech bubbles: one at a time */
  let bubI = 0;
  function bubbles() {
    const all = $$('#bubbles .bub'); if (!all.length) return;
    all.forEach((b, i) => b.classList.toggle('on', i === bubI % all.length));
    bubI++;
  }
  setInterval(bubbles, 2600);

  /* ---------- scene switching with pixel transition ---------- */
  const pix = $('#pix');
  pix.innerHTML = Array.from({ length: 140 }, () => `<i style="transition-delay:${Math.round(Math.random() * 180)}ms"></i>`).join('');
  $('#spaces').innerHTML = SC.map((s, i) => `<button type="button" role="tab" data-i="${i}" aria-selected="${i === 0}"><i>0${i + 1}</i>${s.tab}</button>`).join('');

  function applyScene() {
    const s = SC[st.scene];
    $('#scene-n').textContent = '0' + (st.scene + 1);
    $('#scene-title').textContent = s.title;
    $('#area').value = st.area; $('#area-o').textContent = st.area + ' м²';
    drawStatic(); drawDynamic(); drawPeopleAndSpots(); renderPanel(); led();
    bubI = 0; bubbles();
  }
  function goScene(i) {
    if (i === st.scene) return;
    $$('#spaces button').forEach(b => b.setAttribute('aria-selected', +b.dataset.i === i));
    const swap = () => { st.scene = i; st.spot = 0; st.scent = 0; st.area = SC[i].area; applyScene(); };
    if (reduce) return swap();
    pix.classList.add('on');
    setTimeout(() => { swap(); setTimeout(() => pix.classList.remove('on'), 60); }, 380);
  }
  $('#spaces').addEventListener('click', e => { const b = e.target.closest('button'); if (b) goScene(+b.dataset.i); });
  $('#hotspots').addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) { st.spot = +b.dataset.i; renderPanel(); } });
  $('#p-swap').addEventListener('click', () => { st.scent = (st.scent + 1) % SC[st.scene].scents.length; renderPanel(); drawDynamic(); led(); });
  $('#intensity').addEventListener('input', e => { st.intensity = +e.target.value; $('#int-o').textContent = st.intensity + '%'; drawDynamic(); });
  $('#area').addEventListener('input', e => { st.area = +e.target.value; $('#area-o').textContent = st.area + ' м²'; drawDynamic(); });
  $('#term').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    st.term = +b.dataset.i; $$('#term button').forEach(x => x.setAttribute('aria-pressed', x === b)); drawDynamic();
  });
  /* keyboard: arrows switch scenes when the tab list has focus */
  $('#spaces').addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = (st.scene + (e.key === 'ArrowRight' ? 1 : SC.length - 1)) % SC.length;
    goScene(n); $$('#spaces button')[n].focus();
  });
  applyScene();

  /* ---------- content blocks ---------- */
  const art = `<svg viewBox="0 0 330 320" aria-hidden="true"><defs><linearGradient id="hf" x1="0" x2="1"><stop offset="0" stop-color="#4A504F"/><stop offset="1" stop-color="#2B2F2E"/></linearGradient></defs><polygon points="220,80 268,54 268,259 220,285" fill="#1F2322"/><polygon points="62,80 110,54 268,54 220,80" fill="#555B59"/><rect x="62" y="80" width="158" height="205" rx="5" fill="url(#hf)"/><ellipse cx="165" cy="67" rx="58" ry="11" fill="#0C0D0E"/><rect x="156" y="94" width="46" height="178" rx="3" fill="#040506"/><g fill="#FF7A45"><rect x="166" y="108" width="5" height="16"/><rect x="174" y="108" width="5" height="16"/><rect x="182" y="108" width="5" height="16"/></g><circle cx="179" cy="160" r="5" fill="none" stroke="#E04848" stroke-width="1.6"/></svg>`;
  $('#hw').innerHTML = D.devices.map(d => `
    <article class="hw-card"><div class="hw-art">${art}</div>
      <div class="hw-body"><h3>${d.name}</h3><p>${esc(d.lead)}</p>
        <dl class="hw-specs">${d.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
        <div class="hw-price">${d.plans.map(p => `<span>${p.months} мес<b>${D.fmt(p.total)}</b></span>`).join('')}</div>
      </div></article>`).join('');

  /* scents with pixel swatches */
  let cat = 'all';
  $('#sc-filter').innerHTML = `<button type="button" data-c="all" aria-pressed="true">все · 32</button>` + Object.entries(D.categories).map(([k, v]) => `<button type="button" data-c="${k}" aria-pressed="false">${v}</button>`).join('');
  const swatch = s => {
    let seed = s.n * 9301; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    return Array.from({ length: 12 }, () => `<i style="background:${rnd() > .45 ? CLOUD[s.cat] : 'rgba(11,13,16,' + (0.08 + rnd() * 0.5).toFixed(2) + ')'}"></i>`).join('');
  };
  $('#sc-grid').innerHTML = D.scents.map(s => `<article class="sci" data-c="${s.cat}"><span class="px">${swatch(s)}</span><small>N°${String(s.n).padStart(2, '0')} · ${D.categories[s.cat]}</small><b>${esc(s.name)}</b><p>${esc(s.desc)}</p></article>`).join('');
  $('#sc-filter').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    cat = b.dataset.c; $$('#sc-filter button').forEach(x => x.setAttribute('aria-pressed', x === b));
    $$('#sc-grid .sci').forEach(x => x.classList.toggle('hide', cat !== 'all' && x.dataset.c !== cat));
  });

  $('#big-stats').innerHTML = D.facts.map(f => `<div><b>${f.v}</b><span>${esc(f.t)}</span></div>`).join('');

  $('#faq-list').innerHTML = D.faq.map(([q, a]) => `<div class="fq"><button type="button" aria-expanded="false"><span>${esc(q)}</span><span aria-hidden="true">+</span></button><p class="a">${esc(a)}</p></div>`).join('');
  $('#faq-list').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const f = b.parentElement, open = !f.classList.contains('open');
    f.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
  });
})();
