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

// Ensure output base exists
await fs.mkdir(OUT_BASE, { recursive: true });

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
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji';margin:0;padding:2rem;background:#f5f5f7;color:#222;}
    #content{max-width:720px;margin:0 auto;background:#fff;padding:2rem;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
    button{cursor:pointer;}
  </style>
</head>
<body>
  <div id="content">
${bodyHtml}
  </div>
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