/* Сборка Aromé: node build.js → docs/ (GitHub Pages публикует папку docs).
   Домен: поменяйте origin и base (для своего домена base: '/'). */
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

const site = createSite({
  root: __dirname,
  name: 'Aromé',
  origin: 'https://t0niske.github.io',
  base: '/vdokh-lab/',
  description: 'Ароматизация помещений для бизнеса в Астане',
  themeColor: '#FFFFFF',
  ogImage: 'og',
  images: require('./src/images'),
  browserData: D.browserScript() + 'window.VD=' + JSON.stringify(VD) + ';\n'
});
UI.init(site);
register(site);
/* Имя страницы для метки в WhatsApp: «…страница «Салоны красоты и SPA»» */
site.pages.forEach(p => { p.pageName = p.pageName || p.h1 || p.title; });
site.build(UI.layout);
