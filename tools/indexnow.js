/* IndexNow (30.10.2026): после выкладки сообщает Яндексу и Bing (через api.indexnow.org — и остальным участникам),
   какие страницы изменились, чтобы роботы пришли быстрее, а не ждали обхода по sitemap.
   Какие изменились — сравниваем хэш каждой страницы из dist-prod/sitemap.xml с seo/indexnow-sent.json (что уже отправляли).
   Запуск: node tools/indexnow.js (вызывает deploy.sh после выкладки), --all — отправить все страницы, --dry — только показать список.
   Ключ не секретный: по протоколу он лежит открыто в корне сайта (<ключ>.txt, пишет build.js). */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const INDEXNOW_KEY = 'fe3a0fde1e401bd1fb7528e4b3efeab4';
const HOST = 'arome-marketing.kz';
const ENDPOINTS = ['https://yandex.com/indexnow', 'https://api.indexnow.org/indexnow'];
module.exports = { INDEXNOW_KEY };

async function main() {
  const root = path.join(__dirname, '..');
  const out = path.join(root, 'dist-prod');
  const stateFile = path.join(root, 'seo', 'indexnow-sent.json');
  const all = process.argv.includes('--all'), dry = process.argv.includes('--dry');

  const urls = [...fs.readFileSync(path.join(out, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const sent = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : {};
  const hash = {};
  for (const u of urls) {
    const rel = new URL(u).pathname.replace(/^\//, '');
    hash[u] = crypto.createHash('md5').update(fs.readFileSync(path.join(out, rel, 'index.html'))).digest('hex').slice(0, 12);
  }
  const list = urls.filter(u => all || sent[u] !== hash[u]);
  if (!list.length) return console.log('IndexNow: изменённых страниц нет');
  console.log(`IndexNow: ${list.length} стр.${dry ? ' (--dry, не отправляю)' : ''}`);
  list.forEach(u => console.log('  ' + u));
  if (dry) return;

  /* ключ должен открываться на сайте, иначе поисковики ответят 403 */
  const keyUrl = `https://${HOST}/${INDEXNOW_KEY}.txt`;
  const k = await fetch(keyUrl).then(r => r.ok ? r.text() : '').catch(() => '');
  if (k.trim() !== INDEXNOW_KEY) { console.log(`  ✖ ключ не открывается: ${keyUrl} — сначала выложите сайт`); process.exitCode = 1; return; }

  let ok = 0;
  for (const ep of ENDPOINTS) {
    const r = await fetch(ep, {
      method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: keyUrl, urlList: list })
    }).catch(e => ({ status: 0, statusText: e.message }));
    console.log(`  ${ep} → ${r.status} ${r.statusText || ''}`);
    if (r.status === 200 || r.status === 202) ok++;
  }
  /* запоминаем отправленное, только если принял хотя бы один поисковик — иначе в следующий раз отправим снова */
  if (ok) fs.writeFileSync(stateFile, JSON.stringify(Object.assign(sent, Object.fromEntries(list.map(u => [u, hash[u]]))), null, 1) + '\n');
  else process.exitCode = 1;
}

if (require.main === module) main();
