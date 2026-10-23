/* Static multi-page site engine: pages → docs/<path>/index.html, sitemap, robots,
   JSON-LD helpers, image slots with placeholders, and SEO checks.
   No dependencies — plain Node. Shared by all four sites (copied into lib/). */
const fs = require('fs');
const path = require('path');

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/* Width/height from PNG, JPEG or WebP header — so <img> never shifts layout */
function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const fmt = b.toString('ascii', 12, 16);
    if (fmt === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (fmt === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (fmt === 'VP8L') { const n = b.readUInt32LE(21); return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 }; }
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1], len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + len;
    }
  }
  return null;
}

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function createSite(cfg) {
  const root = cfg.root;
  const out = path.join(root, 'docs');
  const base = cfg.base.endsWith('/') ? cfg.base : cfg.base + '/';
  const origin = cfg.origin.replace(/\/$/, '');
  const pages = [];
  const images = cfg.images || {};
  const imgDir = path.join(root, 'src', 'assets', 'img');

  /* Pages and content use root-relative links ("/ceny/"); build() prefixes them with base,
     so the same sources work on github.io/<repo>/ and on a custom domain (base "/"). */
  const url = (p = '') => '/' + String(p).replace(/^\//, '');
  const abs = (p = '') => origin + base + String(p).replace(/^\//, '');
  const rebase = html => base === '/' ? html : html.replace(/((?:href|src|action|data-src)=")\/(?!\/)/g, `$1${base}`);

  /* Image slot: real file if it exists in src/assets/img/<slot>.(webp|jpg|png), otherwise
     a labelled placeholder with the same aspect ratio. Slots are described in images.js. */
  function img(slot, o = {}) {
    const meta = images[slot] || {};
    const alt = o.alt ?? meta.alt ?? '';
    const cls = o.cls ? ` class="${o.cls}"` : '';
    for (const ext of ['webp', 'jpg', 'jpeg', 'png']) {
      const f = path.join(imgDir, `${slot}.${ext}`);
      if (fs.existsSync(f)) {
        const s = imageSize(f) || { w: meta.w, h: meta.h };
        const load = o.eager ? ' fetchpriority="high"' : ' loading="lazy"';
        return `<img${cls} src="${url(`assets/img/${slot}.${ext}`)}" width="${s.w}" height="${s.h}" alt="${esc(alt)}"${load} decoding="async">`;
      }
    }
    const w = meta.w || 4, h = meta.h || 3;
    return `<div class="ph${o.cls ? ' ' + o.cls : ''}" style="aspect-ratio:${w}/${h}" role="img" aria-label="${esc(alt)}"><span class="ph-k">${esc(slot)}</span><span class="ph-t">${esc(meta.title || alt)}</span></div>`;
  }
  const imgFile = slot => { for (const ext of ['webp', 'jpg', 'jpeg', 'png']) if (fs.existsSync(path.join(imgDir, `${slot}.${ext}`))) return `assets/img/${slot}.${ext}`; return null; };
  const hasImg = slot => !!imgFile(slot);

  const schema = {
    breadcrumbs: list => ({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: list.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) }))
    }),
    faq: qa => ({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: qa.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } }))
    }),
    article: (a, p) => ({
      '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.description,
      datePublished: a.date, dateModified: a.updated || a.date, inLanguage: 'ru',
      author: { '@type': 'Organization', name: cfg.name }, publisher: { '@type': 'Organization', name: cfg.name },
      mainEntityOfPage: abs(p)
    }),
    product: (pr, p) => ({
      '@context': 'https://schema.org', '@type': 'Product', name: pr.name, description: pr.description,
      brand: { '@type': 'Brand', name: cfg.name }, url: abs(p), ...(pr.image ? { image: pr.image } : {}),
      offers: {
        '@type': 'AggregateOffer', priceCurrency: 'KZT', lowPrice: pr.low, highPrice: pr.high, offerCount: pr.count,
        availability: 'https://schema.org/InStock'
      }
    }),
    service: (sv, p) => ({
      '@context': 'https://schema.org', '@type': 'Service', name: sv.name, description: sv.description,
      serviceType: sv.type || sv.name, url: abs(p),
      areaServed: { '@type': 'City', name: 'Астана' },
      provider: { '@type': 'LocalBusiness', name: cfg.name, url: abs('') },
      ...(sv.low ? { offers: { '@type': 'AggregateOffer', priceCurrency: 'KZT', lowPrice: sv.low, highPrice: sv.high } } : {})
    }),
    itemList: (items) => ({
      '@context': 'https://schema.org', '@type': 'ItemList',
      itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, url: abs(p) }))
    }),
    business: (c) => ({
      '@context': 'https://schema.org', '@type': 'LocalBusiness', name: cfg.name, url: abs(''),
      telephone: c.phoneRaw, description: cfg.description,
      address: { '@type': 'PostalAddress', streetAddress: c.street, addressLocality: 'Астана', addressCountry: 'KZ' },
      openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '19:00' }],
      areaServed: { '@type': 'City', name: 'Астана' }, priceRange: '₸₸'
    }),
    website: () => ({ '@context': 'https://schema.org', '@type': 'WebSite', name: cfg.name, url: abs(''), inLanguage: 'ru' })
  };

  /* Visible breadcrumbs; the same list feeds BreadcrumbList JSON-LD */
  function crumbs(list) {
    return `<nav class="crumbs" aria-label="Хлебные крошки"><ol>${list.map(([n, p], i) =>
      i === list.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${url(p)}">${esc(n)}</a></li>`).join('')}</ol></nav>`;
  }

  function add(p) {
    p.path = String(p.path || '').replace(/^\//, '');
    if (p.path && !p.path.endsWith('/') && !p.path.endsWith('.html')) p.path += '/';
    p.schema = p.schema || [];
    if (p.breadcrumbs) p.schema.push(schema.breadcrumbs(p.breadcrumbs));
    pages.push(p);
    return p;
  }

  function head(p) {
    const canon = abs(p.path);
    const og = p.ogImage || cfg.ogImage;
    return [
      `<meta charset="utf-8">`,
      `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`,
      `<title>${esc(p.title)}</title>`,
      `<meta name="description" content="${esc(p.description)}">`,
      p.noindex ? `<meta name="robots" content="noindex, follow">` : `<link rel="canonical" href="${canon}">`,
      `<meta property="og:type" content="${p.ogType || 'website'}">`,
      `<meta property="og:site_name" content="${esc(cfg.name)}">`,
      `<meta property="og:locale" content="ru_KZ">`,
      `<meta property="og:title" content="${esc(p.ogTitle || p.title)}">`,
      `<meta property="og:description" content="${esc(p.description)}">`,
      `<meta property="og:url" content="${canon}">`,
      og && imgFile(og) ? `<meta property="og:image" content="${abs(imgFile(og))}">` : '',
      `<meta name="twitter:card" content="summary_large_image">`,
      cfg.themeColor ? `<meta name="theme-color" content="${cfg.themeColor}">` : '',
      cfg.yandexVerification ? `<meta name="yandex-verification" content="${cfg.yandexVerification}">` : '',
      cfg.googleVerification ? `<meta name="google-site-verification" content="${cfg.googleVerification}">` : '',
      ...p.schema.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    ].filter(Boolean).join('\n');
  }

  /* SEO checks: lengths, duplicates, one h1, alt texts, broken internal links */
  function check(rendered) {
    const warn = [], err = [];
    const files = new Set(rendered.map(r => r.path));
    const titles = {}, descs = {};
    for (const r of rendered) {
      const p = r.page, where = '/' + p.path;
      if (p.path === '404.html') continue;
      if (p.title.length > 70) warn.push(`${where}: title ${p.title.length} симв. (> 70)`);
      if (p.title.length < 15) warn.push(`${where}: title короткий`);
      if (p.description.length > 170) warn.push(`${where}: description ${p.description.length} симв. (> 170)`);
      if (p.description.length < 70) warn.push(`${where}: description ${p.description.length} симв. (< 70)`);
      (titles[p.title] ||= []).push(where); (descs[p.description] ||= []).push(where);
      const h1 = (r.html.match(/<h1[\s>]/g) || []).length;
      if (h1 !== 1) err.push(`${where}: h1 × ${h1}`);
      for (const m of r.html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="[^"]+"/.test(m[0])) err.push(`${where}: img без alt`);
      for (const m of r.html.matchAll(/href="([^"#?]*)[^"]*"/g)) {
        const h = m[1];
        if (!h.startsWith(base)) continue;
        let rel = h.slice(base.length);
        if (rel === '' || rel.endsWith('/')) { if (!files.has(rel)) err.push(`${where}: битая ссылка ${h}`); }
        else if (!fs.existsSync(path.join(out, rel))) err.push(`${where}: нет файла ${h}`);
      }
      const words = strip(r.html.replace(/<(script|style|header|footer|nav)[\s\S]*?<\/\1>/g, '')).split(' ').length;
      if (!p.noindex && words < 150) warn.push(`${where}: мало текста (${words} слов)`);
    }
    for (const [t, w] of Object.entries(titles)) if (w.length > 1) err.push(`дубль title «${t}»: ${w.join(', ')}`);
    for (const [t, w] of Object.entries(descs)) if (w.length > 1) err.push(`дубль description: ${w.join(', ')}`);
    return { warn, err };
  }

  function build(layout) {
    fs.rmSync(out, { recursive: true, force: true });
    copyDir(path.join(root, 'src', 'assets'), path.join(out, 'assets'));
    fs.writeFileSync(path.join(out, '.nojekyll'), '');
    if (cfg.browserData) fs.writeFileSync(path.join(out, 'assets', 'js', 'data.js'), cfg.browserData);

    const rendered = pages.map(p => {
      const html = rebase(layout(p, head(p)));
      const file = p.path.endsWith('.html') ? path.join(out, p.path) : path.join(out, p.path, 'index.html');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, html);
      return { page: p, path: p.path, html };
    });

    const today = cfg.date || new Date().toISOString().slice(0, 10);
    const idx = pages.filter(p => !p.noindex && p.path !== '404.html');
    fs.writeFileSync(path.join(out, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      idx.map(p => `  <url><loc>${abs(p.path)}</loc><lastmod>${p.updated || today}</lastmod><priority>${p.priority || (p.path === '' ? '1.0' : p.path.split('/').length > 2 ? '0.6' : '0.8')}</priority></url>`).join('\n') +
      `\n</urlset>\n`);
    fs.writeFileSync(path.join(out, 'robots.txt'),
      /* noindex-страницы не закрываем в robots: иначе робот не увидит сам noindex */
      `User-agent: *\nAllow: /\n\nSitemap: ${abs('sitemap.xml')}\n`);

    if (cfg.images) writeImagesDoc();

    const { warn, err } = check(rendered);
    console.log(`${cfg.name}: ${rendered.length} страниц, в sitemap ${idx.length}`);
    warn.forEach(w => console.log('  ⚠ ' + w));
    err.forEach(e => console.log('  ✖ ' + e));
    if (err.length) process.exitCode = 1;
    return { pages: rendered.length, warn, err };
  }

  /* IMAGES.md — prompts for ChatGPT, generated from images.js so the list never drifts */
  function writeImagesDoc() {
    const rows = Object.entries(images);
    const done = rows.filter(([k]) => hasImg(k)).length;
    let md = `# Картинки для ${cfg.name}\n\nСгенерируйте в ChatGPT, сохраните в \`src/assets/img/\` под указанным именем (png, jpg или webp) и пересоберите: \`node build.js\`.\nПока файла нет, на сайте стоит подписанная заглушка того же размера.\n\nГотово: ${done} из ${rows.length}.\n\n`;
    if (cfg.imagesIntro) md += cfg.imagesIntro + '\n\n';
    for (const [k, m] of rows) {
      md += `## ${hasImg(k) ? '✅' : '⬜'} \`${k}\` — ${m.title}\n\n`;
      md += `- Формат: ${m.w}:${m.h}${m.size ? ` (${m.size})` : ''}\n- Где на сайте: ${m.where}\n- Alt: ${m.alt}\n\n`;
      md += '```text\n' + m.prompt.trim() + '\n```\n\n';
    }
    fs.writeFileSync(path.join(root, 'IMAGES.md'), md);
  }

  return { cfg, url, abs, img, hasImg, add, build, crumbs, schema, esc, strip, pages };
}

module.exports = { createSite, esc, strip };
