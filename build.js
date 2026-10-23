/* Сборка ВДОХ: node build.js → docs/ (GitHub Pages публикует папку docs).
   Домен: поменяйте origin и base (для своего домена base: '/'). */
const { createSite } = require('./lib/engine');
const D = require('./lib/data');
const UI = require('./src/ui');
const { register } = require('./src/pages');

const site = createSite({
  root: __dirname,
  name: 'ВДОХ',
  origin: 'https://t0niske.github.io',
  base: '/vdokh-lab/',
  description: 'Лаборатория ароматизации помещений в Астане',
  themeColor: '#07090D',
  ogImage: 'og',
  images: require('./src/images'),
  // симулятору нужны планы помещений в браузере
  browserData: D.browserScript() + 'window.SCENES=' + JSON.stringify(require('./src/scenes')) + ';\n'
});
UI.init(site);
register(site);
site.build(UI.layout);
