/* Список OG-карточек (30.10.2026) для tools/og.py: имя файла, заголовок, рубрика, фото справа и стиль.
   Заголовки — H1 страниц (<em> рисуется курсивом Playfair), у пространств и статей берутся из src/spaces.js и src/articles.js.
   Имя карточки — og-<последняя часть адреса>; engine находит её сам по адресу страницы, главная — og.jpg (общая по умолчанию).
   photo — файл из src/assets/img, fx — какую часть кадра оставить по горизонтали (0 левый край, 1 правый). */
const SPACES = require('../src/spaces');
const ARTICLES = require('../src/articles');

const slug = p => p.replace(/\/$/, '').split('/').pop();
const main = [
  { file: 'og', h1: 'Ароматизация помещений <em>для бизнеса в Астане</em>', kicker: 'Аромамаркетинг через вентиляцию', photo: 'hero-s1', fx: 0.62 },
  { file: 'og-pomeshcheniya', h1: 'Ароматизация <em>по типу помещения</em>', kicker: 'Пространства', photo: 'hero-s3', fx: 0.4 },
  { file: 'og-kak-my-rabotaem', h1: 'Ароматизация <em>через вентиляцию</em>', kicker: 'Метод Aromé', photo: 'place-gostinica', fx: 0.5 },
  { file: 'og-ceny', h1: 'Цены на ароматизацию <em>для бизнеса в Астане</em>', kicker: 'Цены', photo: 'hero-s2', fx: 0.3 },
  { file: 'og-aromaty', h1: 'Коллекция: <em>32 аромата для бизнеса</em>', kicker: 'Ароматы', photo: 'lead-notes', fx: 0.5 },
  { file: 'og-stati', h1: 'Блог <em>об аромамаркетинге</em>', kicker: 'Блог Aromé', photo: 'sc-kedr', fx: 0.5, style: 'blog' },
  { file: 'og-voprosy', h1: 'Вопросы <em>и ответы</em>', kicker: 'Об ароматизации помещений', photo: 'sc-white-tea', fx: 0.5 },
  { file: 'og-kontakty', h1: 'Контакты <em>Aromé в Астане</em>', kicker: 'Связь', photo: 'lead-bg', fx: 0.3 }
];
/* В окнах sx-home и sx-toj виден Байтерек — берём часть кадра без окна */
const FX = { 'sx-home': 0, 'sx-toj': 0.75 };
const spaces = SPACES.map(sp => ({ file: 'og-' + slug(sp.path), h1: sp.h1, kicker: 'Пространства', photo: sp.img, fx: FX[sp.img] ?? 0.5 }));

/* Фото к статьям: по смыслу статьи и не те, что у страниц пространств, — в ленте карточки не должны путаться */
const ART_PHOTO = {
  'chto-takoe-aromamarketing': 'pr-small', 'aromamarketing-primery': 'sc-25', 'aromat-i-prodazhi-issledovaniya': 'sc-ritz',
  'kak-vybrat-aromat-dlya-biznesa': 'sc-lime-basil', 'firmennyj-aromat-brenda': 'sc-01', 'aromatizaciya-cherez-ventilyaciyu': ['place-zhk-podezd', 0.85],
  'vidy-diffuzorov-dlya-pomeshchenij': 'nova-cut', 'aromamaslo-dlya-diffuzora': 'sc-17', 'kak-rasschitat-aromatizaciyu': 'metod',
  'bezopasna-li-aromatizaciya': 'sc-spa', 'skolko-stoit-aromatizaciya': 'pr-large', 'kak-proverit-effekt-aromamarketinga': 'sc-intercontinental',
  'test-aromata-3-dnya': 'sc-floral', 'oshibki-aromamarketinga': 'sc-16', 'aromamarketing-v-restorane-i-kofejne': 'sc-coffee',
  'aromatizaciya-magazina-odezhdy': ['sc-jo-malone', 0.9]
};
const articles = ARTICLES.map(a => {
  if (!ART_PHOTO[a.slug]) throw new Error('нет фото для статьи ' + a.slug);
  const [photo, fx = 0.5] = [].concat(ART_PHOTO[a.slug]);
  return { file: 'og-' + a.slug, h1: a.h1, kicker: `Блог · ${a.topic}`, foot: `${a.read} мин чтения`, photo, fx, style: 'blog', ...(photo === 'nova-cut' ? { fit: 'contain' } : {}) };
});

const all = [...main, ...spaces, ...articles];
const seen = {};
all.forEach(c => { if (seen[c.photo]) throw new Error(`фото ${c.photo} уже у ${seen[c.photo]}, нужно другое для ${c.file}`); seen[c.photo] = c.file; });
process.stdout.write(JSON.stringify(all, null, 1));
