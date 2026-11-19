import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync, readdirSync } from 'fs';
import { createHash } from 'crypto';
import path from 'path';

const MOCK = process.env.MOCK === '1';
const out = MOCK ? 'test-dist' : 'docs';
const cfg = MOCK ? { firebase: { apiKey: 'x', projectId: 'x' } } : JSON.parse(readFileSync('config.json', 'utf8'));
const mockPlugin = { name: 'mock-fb', setup(b) { b.onResolve({ filter: /\/fb\.js$/ }, () => ({ path: path.resolve('mock/fb.js') })); } };

if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(out, { recursive: true });
const r = await build({
  entryPoints: ['src/app.jsx'], bundle: true, minify: true, format: 'iife', target: 'es2019', write: false,
  jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', loader: { '.jsx': 'jsx', '.json': 'json' }, charset: 'utf8',
  define: { __FB_CONFIG__: JSON.stringify(cfg.firebase), 'process.env.NODE_ENV': '"production"' },
  plugins: MOCK ? [mockPlugin] : []
});
const js = r.outputFiles[0].contents;
const hash = createHash('sha256').update(js).digest('hex').slice(0, 10);
const jsName = `app-${hash}.js`;
writeFileSync(path.join(out, jsName), js);
const css = readFileSync('src/style.css', 'utf8');
for (const f of readdirSync('public')) copyFileSync(path.join('public', f), path.join(out, f));
const html = `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Do'kon daftari</title>
<meta name="description" content="Do'kon savdosi, rasxodlari va qarzlari hisobi">
<meta name="theme-color" content="#0a7884">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Daftar">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Onest:wght@400;500;600;700&family=Unbounded:wght@500;600&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body>
<div id="root"></div>
${MOCK ? `<script src="seed.js"></script>\n` : ''}<script src="${jsName}"></script>
<script>if ('serviceWorker' in navigator && location.protocol === 'https:') { addEventListener('load', function () { navigator.serviceWorker.register('sw.js'); }); }</script>
</body>
</html>
`;
writeFileSync(path.join(out, 'index.html'), html);
const sw = readFileSync('src/sw.js', 'utf8').replace('__VERSION__', hash).replace('__APPJS__', jsName);
writeFileSync(path.join(out, 'sw.js'), sw);
writeFileSync(path.join(out, '.nojekyll'), '');
console.log(out, jsName, (js.length / 1024).toFixed(0) + ' KB');
