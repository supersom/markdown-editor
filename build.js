const fs = require('fs');
const path = require('path');

const root = __dirname;
const srcDir = path.join(root, 'src');
const distDir = path.join(root, 'dist');

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

// Find marked browser bundle — path varies by version
const markedCandidates = [
  path.join(root, 'node_modules', 'marked', 'marked.min.js'),
  path.join(root, 'node_modules', 'marked', 'lib', 'marked.umd.js'),
];
const markedPath = markedCandidates.find(fs.existsSync);
if (!markedPath) {
  console.error('Cannot find marked browser bundle. Run: ls node_modules/marked/ to find the UMD/IIFE file and update build.js.');
  process.exit(1);
}

const template = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(srcDir, 'css', 'style.css'), 'utf8');
const markedJs = fs.readFileSync(markedPath, 'utf8');
const scripts = ['state', 'markdown', 'storage', 'toolbar', 'file-ops', 'ui', 'main']
  .map(n => fs.readFileSync(path.join(srcDir, 'js', `${n}.js`), 'utf8'))
  .join('\n\n');

const html = template
  .replace('<!-- BUILD:css -->', `<style>\n${css}\n</style>`)
  .replace('<!-- BUILD:vendor -->', `<script>\n${markedJs}\n</script>`)
  .replace('<!-- BUILD:js -->', `<script>\n${scripts}\n</script>`);

const outPath = path.join(distDir, 'markdown-editor.html');
fs.writeFileSync(outPath, html);
console.log(`Built ${outPath} (${Math.round(html.length / 1024)}KB)`);
