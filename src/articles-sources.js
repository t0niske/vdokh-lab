/* Источники статей блога: [подпись, ссылка]. DOI сверены через Crossref 29.10.2026 */
const S = {
  herr: ['Herrmann, Zidansek, Sprott. The Power of Simplicity — Journal of Retailing, 2013', 'https://doi.org/10.1016/j.jretai.2012.08.002'],
  meta: ['Roschk, Hosseinpour. Pleasant Ambient Scents: A Meta-Analysis — Journal of Marketing, 2020', 'https://doi.org/10.1177/0022242919881137'],
  gue: ['Guéguen, Petr. Odors and consumer behavior in a restaurant — International Journal of Hospitality Management, 2006', 'https://doi.org/10.1016/j.ijhm.2005.04.007'],
  xmas: ['Spangenberg, Grohmann, Sprott. It’s beginning to smell (and sound) a lot like Christmas — Journal of Business Research, 2005', 'https://doi.org/10.1016/j.jbusres.2004.09.005'],
  mitch: ['Mitchell, Kahn, Knasko. There’s Something in the Air — Journal of Consumer Research, 1995', 'https://doi.org/10.1086/209447'],
  store: ['Spangenberg, Crowley, Henderson. Improving the Store Environment — Journal of Marketing, 1996', 'https://doi.org/10.1177/002224299606000205'],
  memo: ['Morrin, Ratneshwar. Does it Make Sense to Use Scents to Enhance Brand Memory? — Journal of Marketing Research, 2003', 'https://doi.org/10.1509/jmkr.40.1.10.19128'],
  hotel: ['Denizci Guillet, Kozak, Kucukusta. It’s in the air: Aroma marketing and affective response in the hotel world — 2017', 'https://doi.org/10.1080/15256480.2017.1359727'],
  dent: ['Lehrner, Marwinski, Lehr. Ambient odors of orange and lavender reduce anxiety… in a dental office — Physiology & Behavior, 2005', 'https://doi.org/10.1016/j.physbeh.2005.06.031'],
  westin: ['Westin: пресс-релиз о запуске аромата White Tea, 2006 — Hotel Online', 'https://www.hotel-online.com/News/PR2006_3rd/Sep06_WhiteTea.html'],
  sia: ['Singapore Airlines о Floridian Waters и Batik Flora — Mothership, 2023', 'https://mothership.sg/2023/08/spore-airlines-hot-towels//amp'],
  ifra: ['IFRA: как устроены стандарты безопасного использования ароматов', 'https://ifrafragrance.org/safe-use'],
  tamu: ['Texas A&M, ветеринарный колледж: диффузоры эфирных масел и кошки', 'https://vetmed.tamu.edu/news/pet-talk/a-scent-sitive-subject-essential-oil-diffusers-and-your-cat'],
  ospca: ['Ontario SPCA: безопасны ли диффузоры рядом с животными, 2022', 'https://ontariospca.ca/blog/are-diffusers-safe-to-use-around-pets/']
};
const src = keys => `<h2>Источники</h2>\n<ol class="ar-src">${keys.map(k => `<li><a href="${S[k][1]}" target="_blank" rel="noopener">${S[k][0]}</a></li>`).join('')}</ol>`;

module.exports = { S, src };
