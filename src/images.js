/* Слоты картинок ВДОХ. Стиль — «тепловизор»: тёмные кадры, облако аромата светится тёплым. */
const THERMAL = 'Photorealistic interior photograph processed like a thermal imaging camera: the whole scene in deep indigo and dark blue tones, while the air around a small aroma diffuser glows in warm gradients of orange, yellow and teal, as if the scent were visible heat. Moody, high contrast, cinematic, sharp architectural details. No text, no numbers, no logos, no visible faces.';
const MACRO = 'Dark moody macro still life photograph on a near-black background (#07090D), a single hard orange rim light from the right (#FF5A1F) and a faint teal fill from the left, fine mist in the air, high detail, cinematic. No text, no logos.';
const scene = what => ({ w: 16, h: 9, prio: 1, prompt: `${THERMAL}\nScene: ${what} in Astana, wide angle, eye level. A compact graphite-grey rectangular diffuser (about 20 cm tall, black vertical glass panel with blue LED digits) stands on a shelf; the glowing scent cloud spreads from it. Aspect ratio 16:9.` });
const odor = what => ({ w: 4, h: 3, prio: 2, prompt: `${MACRO}\nSubject: ${what}. Aspect ratio 4:3.` });

module.exports = {
  'scene-kofejnya': { title: 'Кофейня в тепловизоре', alt: 'Кофейня: аромат расходится от диффузора у бара', where: '/simulyator/kofejnya/', ...scene('a small specialty coffee shop with a bar counter and five tables') },
  'scene-butik': { title: 'Бутик в тепловизоре', alt: 'Бутик: аромат заполняет торговый зал', where: '/simulyator/butik/', ...scene('a minimal fashion boutique with clothing rails and fitting rooms with curtains') },
  'scene-ofis': { title: 'Офис в тепловизоре', alt: 'Офис: аромат в open space и переговорных', where: '/simulyator/ofis/', ...scene('an open-space office with desks, glass meeting rooms and a kitchen corner') },
  'scene-klinika': { title: 'Клиника в тепловизоре', alt: 'Клиника: аромат в зоне ожидания и коридоре', where: '/simulyator/klinika/', ...scene('a modern clinic waiting area with a reception desk and a corridor with doors') },
  'scene-otel': { title: 'Лобби отеля в тепловизоре', alt: 'Лобби отеля: аромат от ресепшн до лифтов', where: '/simulyator/otel/', ...scene('a large hotel lobby with a reception desk, lounge sofas and elevator doors') },
  'scene-fitnes': { title: 'Фитнес-клуб в тепловизоре', alt: 'Фитнес-клуб: аромат в зале и раздевалках', where: '/simulyator/fitnes/', ...scene('a big gym hall with treadmills, weights and a corridor to locker rooms') },
  'odor-v-sanuzle': { title: 'Запах в санузле', alt: 'Чистый санузел с лёгким туманом аромата', where: '/zapahi/v-sanuzle/', ...odor('a clean dark stone washbasin with a thin wisp of fresh mist rising') },
  'odor-kuhni': { title: 'Запах кухни', alt: 'Пар над сковородой на тёмном фоне', where: '/zapahi/kuhni/', ...odor('steam rising from a black frying pan with fresh herbs') },
  'odor-tabaka': { title: 'Запах табака', alt: 'Дым над пепельницей и древесные ноты', where: '/zapahi/tabaka/', ...odor('curling smoke above a dark glass ashtray next to a cedar wood block') },
  'odor-zhivotnyh': { title: 'Запах животных', alt: 'Шерсть и чистый воздух в груминге', where: '/zapahi/zhivotnyh/', ...odor('a grooming brush with pet fur on a dark surface, gentle fresh mist') },
  'odor-musora': { title: 'Запах мусора', alt: 'Закрытый контейнер и поток свежего воздуха', where: '/zapahi/musora/', ...odor('a sleek closed black waste bin with a stream of fresh teal-lit mist flowing over it') },
  'odor-pota': { title: 'Запах пота', alt: 'Полотенце и гиря в раздевалке', where: '/zapahi/pota/', ...odor('a rolled white towel and a dark kettlebell with water droplets, fresh mist') },
  'og': { title: 'Обложка для соцсетей', w: 16, h: 9, prio: 2, where: 'превью ссылок', alt: 'ВДОХ — тепловизор аромата', prompt: `${THERMAL}\nScene: a top-down view of a white architectural cafe model with glowing orange and teal heat spots spreading from two tiny diffusers, everything else dark blue, empty dark space on the left for a headline. Aspect ratio 16:9.` }
};
