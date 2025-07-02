import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname style path inside ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directories that contain Pickramu source works
const SOURCE_DIRS = [
  path.resolve(__dirname, '..', 'Pickramu', 'data'),
  path.resolve(__dirname, '..', 'Client', 'public', 'client', 'Pickramu', 'data'),
];

// Output directory (all compiled html will be mirrored here)
const OUT_BASE = path.resolve(__dirname, '..', 'Pickramu', 'compiled_html');

// AFTER OUT_BASE declaration, insert:
const ASSETS_DIR = path.join(OUT_BASE, '_assets');

// Shared asset content
const HIDE_RULE = Array.from({length:99},(_,i)=>`#content #n${i+2}`).join(',')+` {\n  display: none;\n}`;

const STYLE_CSS = `/* Pickramu common styles */
:root {
  --bg-color: transparent;
  --text-color: #222;
  --card-bg: #fff;
  --border-radius: 12px;
  --shadow-color: rgba(0,0,0,0.08);
  --spacing-unit: 20px;
  --animation-duration: 0.3s;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-color);
  background: var(--bg-color);
  margin: 0;
  padding: 2rem;
  display: flex;
  justify-content: center;
  transition: background var(--animation-duration);
}
#content {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px var(--shadow-color);
  max-width: 720px;
  width: 100%;
  padding: 2rem;
  box-sizing: border-box;
  word-break: break-word;
}
.input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1em;
  margin-top: 2em;
  padding: 1.5em;
  background: #f5f5f7;
  border: 1px solid #e5e5e7;
  border-radius: var(--border-radius);
  box-shadow: 0 1px 4px var(--shadow-color);
}
.input-box {
  background: #fff;
  border-radius: 8px;
  padding: 0.8em 1em;
  font-size: 1.1em;
  border: 1px solid #d2d2d7;
  width: 260px;
  text-align: center;
}
.button-next {
  background: #007aff;
  border: none;
  border-radius: 8px;
  padding: 0.8em 1.5em;
  font-size: 1em;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 1px 4px var(--shadow-color);
}
body.dark-mode, .dark-mode #content {
  --bg-color: #1a1a1a;
  --text-color: #fff;
  --card-bg: #222;
  --shadow-color: rgba(0,0,0,0.3);
}
${HIDE_RULE}`;

const DOM_JS = `// Lightweight DOM helper injected by Pickramu compiler\n(function(global){\n  if(global.dom) return;\n  global.dom = {\n    back(){ if(global.history && global.history.back) global.history.back(); },\n    Tag(id){\n      const el=document.getElementById(id);\n      return { style:{ display(v,imp){ if(!el) return; el.style.display=v; if(imp==='auto'){ el.style.setProperty('display',v,'important');}}}};\n    }\n  };\n})(window);`;

// Ensure output base exists
await fs.mkdir(OUT_BASE, { recursive: true });

// Ensure assets written once
await fs.mkdir(ASSETS_DIR, { recursive: true });
await fs.writeFile(path.join(ASSETS_DIR, 'pickramu.css'), STYLE_CSS, 'utf8');
await fs.writeFile(path.join(ASSETS_DIR, 'pickramu-dom.js'), DOM_JS, 'utf8');

// Dynamic import of converter
const { convertToHtml } = await import(
  path.resolve(__dirname, '..', 'Client', 'public', 'client', 'js', 'apps', 'pickramu.dps.ap2.js')
);

// Simple shell stub to satisfy convertToHtml logging
const shellStub = {
  log: (...args) => console.log('[Pickramu-Compiler]', ...args),
  loadApp: () => {},
};

/**
 * Recursively gather all .txt and .md files under a directory.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function gatherSourceFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return gatherSourceFiles(fullPath);
      }
      if (entry.isFile() && (fullPath.endsWith('.txt') || fullPath.endsWith('.md'))) {
        return [fullPath];
      }
      return [];
    })
  );
  return files.flat();
}

// Mirror source path under OUT_BASE and change extension to .html
function destPath(src) {
  // Find which SOURCE_DIR it belongs to
  const base = SOURCE_DIRS.find((d) => src.startsWith(d));
  if (!base) throw new Error(`Source path ${src} is not in configured SOURCE_DIRS`);
  const rel = path.relative(base, src);
  const withoutExt = rel.replace(/\.(txt|md)$/i, '');
  return path.join(OUT_BASE, withoutExt + '.html');
}

/**
 * Build full HTML document wrapper around Pickramu converted fragment.
 * @param {string} bodyHtml
 */
function wrapHtml(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous" />
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossorigin="anonymous"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous"></script>
  <style>
    /* === Pickramu Common Styles (inlined for self-containment) === */
${STYLE_CSS.replace(/\n/g,'\n     ')}
  </style>
</head>
<body>
  <div id="content">
${bodyHtml}
  </div>
  <!-- Pickramu DOM helper (inlined) -->
  <script>
${DOM_JS.replace(/\n/g,'\n')}
  </script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(document.body, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\(', right: '\\)', display: true},
            {left: '\\[', right: '\\]', display: true}
          ],
          throwOnError: false
        });
      }
    });
  </script>
</body>
</html>`;
}

async function compileAll() {
  for (const dir of SOURCE_DIRS) {
    try {
      await fs.access(dir);
    } catch {
      // Skip non-existent directories
      continue;
    }
    const sources = await gatherSourceFiles(dir);
    for (const src of sources) {
      const raw = await fs.readFile(src, 'utf8');
      const fragmentHtml = convertToHtml(raw, shellStub);
      const fullHtml = wrapHtml(fragmentHtml);
      const out = destPath(src);
      await fs.mkdir(path.dirname(out), { recursive: true });
      await fs.writeFile(out, fullHtml, 'utf8');
      console.log(`Compiled: ${path.relative(__dirname, src)} -> ${path.relative(__dirname, out)}`);
    }
  }
  console.log('Pickramu compilation completed.');
}

compileAll().catch((err) => {
  console.error('Compilation failed:', err);
  process.exit(1);
}); 