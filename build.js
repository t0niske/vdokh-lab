/* Сборка ВДОХ: node build.js → docs/ (GitHub Pages публикует папку docs).
   Домен: поменяйте origin и base (для своего домена base: '/'). */
const { createSite } = require('./lib/engine');
const D = require('./lib/data');
const UI = require('./src/ui');
const { register } = require('./src/pages');

/* Подбору решения в браузере нужны краткие данные о запахах и помещениях */
const VD = {
  odors: require('./src/odors').map(o => ({ slug: o.slug, name: o.name, short: o.short, causes: o.causes, self: o.self, we: o.we, places: o.places })),
  places: require('./src/places').map(p => ({ slug: p.slug, name: p.name, odors: p.odors, setup: p.setup }))
};

const site = createSite({
  root: __dirname,
  name: 'ВДОХ',
  origin: 'https://t0niske.github.io',
  base: '/vdokh-lab/',
  description: 'Служба устранения неприятных запахов в помещениях Астаны',
  themeColor: '#F4F3EF',
  ogImage: 'og',
  images: require('./src/images'),
  browserData: D.browserScript() + 'window.VD=' + JSON.stringify(VD) + ';\n'
});
UI.init(site);
register(site);
site.build(UI.layout);
