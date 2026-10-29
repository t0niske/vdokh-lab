/* Сборка Aromé: node build.js → docs/ (GitHub Pages публикует папку docs).
   SITE=prod node build.js → dist-prod/ для своего домена (base '/'), выкладка — deploy.sh. */
const fs = require('fs');
const path = require('path');
const { createSite } = require('./lib/engine');
const D = require('./lib/data');
const UI = require('./src/ui');
const { register } = require('./src/pages');

/* Подбору решения в браузере нужны краткие данные о запахах и помещениях, номер WhatsApp сайта */
const VD = {
  wa: UI.C.whatsapp,
  odors: require('./src/odors').map(o => ({ slug: o.slug, name: o.name, short: o.short, device: o.device, where: o.where, setup: o.setup })),
  places: UI.PK.map(p => ({ slug: p.slug, name: p.label, odors: p.odors, setup: p.setup, url: p.url }))
};

const PROD = process.env.SITE === 'prod';
/* Метрика считает только настоящий сайт: в копии на github.io счётчик не выводим */
if (!PROD) require('./src/config').analytics.ym = '';
const site = createSite({
  root: __dirname,
  name: 'Aromé',
  origin: PROD ? 'https://arome-marketing.kz' : 'https://t0niske.github.io',
  base: PROD ? '/' : '/vdokh-lab/',
  out: PROD ? 'dist-prod' : 'docs',
  description: 'Ароматизация помещений для бизнеса в Астане',
  themeColor: '#F4F3EF',
  ogImage: 'og',
  logo: 'assets/apple-touch-icon.png',
  images: require('./src/images'),
  browserData: D.browserScript() + 'window.VD=' + JSON.stringify(VD) + ';\n'
});
UI.init(site);
register(site);
/* Имя страницы для метки в WhatsApp: «…страница «Салоны красоты и SPA»» */
site.pages.forEach(p => { p.pageName = p.pageName || p.h1 || p.title; });
/* Копия на github.io — только для просмотра: настоящий сайт на arome-marketing.kz, в поиск копию не пускаем */
if (!PROD) site.pages.forEach(p => { p.noindex = true; });
site.build(UI.layout);

/* Подтверждение прав в Яндекс Вебмастере и Google Search Console — только для своего домена */
if (PROD) {
  fs.writeFileSync(path.join(__dirname, 'dist-prod', 'yandex_ae242e302b81c4f3.html'),
    '<html>\n    <head>\n        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n    </head>\n    <body>Verification: ae242e302b81c4f3</body>\n</html>\n');
  fs.writeFileSync(path.join(__dirname, 'dist-prod', 'google86bd921a6c4cd76f.html'), 'google-site-verification: google86bd921a6c4cd76f.html');
}
