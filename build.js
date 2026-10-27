#!/usr/bin/env node
// usage: node build.js [game ...] [--platform yandex|vk|gamepush|crazygames|web ...]
// web: static build for GitHub Pages / any static host -> dist/web/<game>/ + dist/web/index.html (SDK stub, no ads)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = __dirname, DIST = process.env.DIST_DIR || path.join(ROOT, 'dist'), PL = path.join(ROOT, 'platform');
const GAMES = JSON.parse(fs.readFileSync(path.join(ROOT, 'games.json'), 'utf8'));
const PLATFORMS = ['yandex', 'vk', 'gamepush'], EXTRA = ['crazygames', 'web'];

const args = process.argv.slice(2);
const wantPl = [], wantGames = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--platform') wantPl.push(args[++i]); else wantGames.push(args[i]);
}
const games = wantGames.length ? wantGames : Object.keys(GAMES);
const platforms = wantPl.length ? wantPl : PLATFORMS;
games.forEach(g => { if (!GAMES[g]) throw new Error('unknown game ' + g); });
platforms.forEach(p => { if (!PLATFORMS.includes(p) && !EXTRA.includes(p)) throw new Error('unknown platform ' + p); });

const read = f => fs.readFileSync(f, 'utf8');
function platformJs(game, platform) {
  const cfg = { platform, game, storageId: GAMES[game].storageId };
  if (platform === 'gamepush') {
    cfg.gamepush = Object.assign({}, GAMES[game].gamepush);
    if (process.env.GP_PUBLIC_TOKEN) cfg.gamepush.publicToken = process.env.GP_PUBLIC_TOKEN;
    if (process.env.GP_PROJECT_ID) cfg.gamepush.projectId = +process.env.GP_PROJECT_ID;
  }
  return 'window.PLATFORM_CONFIG=' + JSON.stringify(cfg) + ';\n' + read(path.join(PL, 'core.js')) + '\n' + read(path.join(PL, (platform === 'web' ? 'yandex' : platform) + '.js'));
}
function sdkBlock(platform, original) {
  if (platform === 'yandex') return original;
  if (platform === 'web') return '<script src="sdk-mock.js"></script>';
  if (platform === 'vk') return '<script src="vk-bridge.min.js"></script>';
  if (platform === 'crazygames') return '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>';
  return '';
}
function localRefs(html) {
  const out = new Set();
  for (const m of html.matchAll(/<(?:script[^>]*\ssrc|link[^>]*\shref)="([^"#?]+)"/g)) {
    if (/^(https?:)?\/\//.test(m[1]) || m[1].startsWith('/')) continue;
    out.add(m[1]);
  }
  return [...out];
}

fs.mkdirSync(DIST, { recursive: true });
const warns = [];
for (const game of games) {
  const src = path.join(ROOT, game);
  const html0 = read(path.join(src, 'index.html'));
  for (const platform of platforms) {
    const web = platform === 'web';
    const name = game + '-' + platform, out = web ? path.join(DIST, 'web', game) : path.join(DIST, name);
    fs.rmSync(out, { recursive: true, force: true });
    fs.mkdirSync(out, { recursive: true });
    const m = html0.match(/<!--sdk-->([\s\S]*?)<!--\/sdk-->/);
    if (!m) throw new Error(game + ': sdk markers missing');
    let html = html0.replace(m[0], sdkBlock(platform, m[1]));
    fs.writeFileSync(path.join(out, 'index.html'), html);
    for (const ref of localRefs(html)) {
      if (ref === 'platform.js' || ref === 'vk-bridge.min.js') continue;
      if (web && ref === 'sdk-mock.js') {
        const mock = read(path.join(src, ref)), demo = mock.replace(/\n\s*if \(!isLocal\) \{ if \(cb\.onError\)[^\n]*\n/, '\n');
        if (demo === mock) throw new Error(game + ': sdk-mock rewarded patch did not apply');
        fs.writeFileSync(path.join(out, ref), demo);
      } else fs.copyFileSync(path.join(src, ref), path.join(out, ref));
    }
    const pjs = platformJs(game, platform);
    fs.writeFileSync(path.join(out, 'platform.js'), pjs);
    if (platform === 'vk') fs.copyFileSync(path.join(PL, 'vendor', 'vk-bridge.min.js'), path.join(out, 'vk-bridge.min.js'));
    if (platform === 'yandex') fs.writeFileSync(path.join(src, 'platform.js'), pjs);
    if (platform === 'gamepush') {
      const g = JSON.parse(pjs.slice(pjs.indexOf('=') + 1, pjs.indexOf(';\n'))).gamepush;
      if (!g.projectId) warns.push(name + ': PROJECT_ID not set in games.json');
      if (!g.publicToken) warns.push(name + ': publicToken not set in games.json');
    }
    if (web) { console.log('built', path.relative(ROOT, out) + '/'); continue; }
    const zip = path.join(DIST, name + '.zip');
    fs.rmSync(zip, { force: true });
    const files = fs.readdirSync(out).sort();
    cp.execFileSync('zip', ['-q', '-X', zip, ...files], { cwd: out });
    if (platform !== 'vk') fs.rmSync(out, { recursive: true, force: true });
    console.log('built', path.relative(ROOT, zip) + (platform === 'vk' ? ' + ' + path.relative(ROOT, out) + '/' : ''));
  }
}
if (platforms.includes('web')) {
  const items = games.map(g => '<li><a href="' + g + '/">' + (read(path.join(ROOT, g, 'index.html')).match(/<title>([^<]*)<\/title>/) || [0, g])[1] + '</a></li>').join('\n');
  fs.writeFileSync(path.join(DIST, 'web', 'index.html'), '<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HTML5 games</title><style>body{font:18px system-ui;max-width:560px;margin:40px auto;padding:0 16px}li{margin:10px 0}</style></head><body><h1>HTML5 games</h1><ul>\n' + items + '\n</ul></body></html>');
}
warns.forEach(w => console.warn('WARN', w));
