#!/usr/bin/env node
// txt2html.js: 独自テキスト（1.txt）→HTML（1.html）変換スクリプト
// 使い方: node txt2html.js input.txt output.html

const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
  console.error('Usage: node txt2html.js input.txt output.html');
  process.exit(1);
}

const inputPath = process.argv[2];
const outputPath = process.argv[3];

const input = fs.readFileSync(inputPath, 'utf8');

// 変換用関数
function convertTxtToHtml(txt) {
  let html = '';
  let scripts = [];
  let btnScripts = {};
  let currentTag = null;
  let tagStack = [];
  let blockBuffer = '';
  let lines = txt.split(/\r?\n/);

  // テンプレートHTMLのhead/body開始
  html += `<!DOCTYPE html>\n<html lang="ja">\n<head>\n<meta charset="UTF-8">\n<title>Converted</title>\n`;
  // KaTeX, Apple風スタイル, domユーティリティを追加
  html += `
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous" />
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossorigin="anonymous"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous"></script>
  <style>
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
    #content #n2,
#content #n3,
#content #n4,
#content #n5,
#content #n6,
#content #n7,
#content #n8,
#content #n9,
#content #n10,
#content #n11,
#content #n12,
#content #n13,
#content #n14,
#content #n15,
#content #n16,
#content #n17,
#content #n18,
#content #n19,
#content #n20,
#content #n21,
#content #n22,
#content #n23,
#content #n24,
#content #n25,
#content #n26,
#content #n27,
#content #n28,
#content #n29,
#content #n30,
#content #n31,
#content #n32,
#content #n33,
#content #n34,
#content #n35,
#content #n36,
#content #n37,
#content #n38,
#content #n39,
#content #n40,
#content #n41,
#content #n42,
#content #n43,
#content #n44,
#content #n45,
#content #n46,
#content #n47,
#content #n48,
#content #n49,
#content #n50,
#content #n51,
#content #n52,
#content #n53,
#content #n54,
#content #n55,
#content #n56,
#content #n57,
#content #n58,
#content #n59,
#content #n60,
#content #n61,
#content #n62,
#content #n63,
#content #n64,
#content #n65,
#content #n66,
#content #n67,
#content #n68,
#content #n69,
#content #n70,
#content #n71,
#content #n72,
#content #n73,
#content #n74,
#content #n75,
#content #n76,
#content #n77,
#content #n78,
#content #n79,
#content #n80,
#content #n81,
#content #n82,
#content #n83,
#content #n84,
#content #n85,
#content #n86,
#content #n87,
#content #n88,
#content #n89,
#content #n90,
#content #n91,
#content #n92,
#content #n93,
#content #n94,
#content #n95,
#content #n96,
#content #n97,
#content #n98,
#content #n99,
#content #n100 {
  display: none;
}
  </style>
  <script>
    const dom = {
  Tag: function(ID) {
    const el = document.getElementById(ID);
    return {
      style: {
        display: function(state, auto) {
          if (!el) return;
          if (state === 'block' || state === 'none') {
            el.style.display = state;
          }
          // 'auto' オプションが指定された場合の追加処理
          if (auto === 'auto' && state === 'block') {
            el.style.display = '';
          }
        }
      }
    };
  }
};
  </script>\n`;
  html += '\n</head>\n<body>\n';

  // 変換処理
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // @tag 開始
    let tagOpen = line.match(/^@tag ([^ ]+) \[open\]/);
    if (tagOpen) {
      let tagName = tagOpen[1];
      tagStack.push(tagName);
      html += `<div class="${tagName}" id="${tagName}">\n`;
      continue;
    }
    // @tag 終了
    let tagClose = line.match(/^@tag ([^ ]+) \[close\]/);
    if (tagClose) {
      html += '</div>\n';
      tagStack.pop();
      continue;
    }
    // @btn
    let btn = line.match(/^@btn id=([\w\d_\-]+) (.+)$/);
    if (btn) {
      let btnId = btn[1];
      let btnLabel = btn[2];
      html += `<button id="${btnId}">${btnLabel}</button>\n`;
      continue;
    }
    // @script on=xxx [open]
    let scriptOn = line.match(/^@script on=([\w\d_\-]+) \[open\]/);
    if (scriptOn) {
      let eventId = scriptOn[1];
      let scriptContent = '';
      i++;
      while (i < lines.length && !lines[i].startsWith('@script [close]')) {
        scriptContent += lines[i] + '\n';
        i++;
      }
      btnScripts[eventId] = scriptContent;
      continue;
    }
    // @script [open]（グローバルスクリプト）
    if (line.startsWith('@script [open]')) {
      let scriptContent = '';
      i++;
      while (i < lines.length && !lines[i].startsWith('@script [close]')) {
        scriptContent += lines[i] + '\n';
        i++;
      }
      scripts.push(scriptContent);
      continue;
    }
    // @script [close]（スキップ）
    if (line.startsWith('@script [close]')) continue;

    // /br → <br>
    line = line.replace(/\/br/g, '<br>');
    // 空行は無視
    if (line.trim() === '') continue;
    // 通常テキスト
    html += line + '\n';
  }

  // ボタンイベントスクリプト
  if (Object.keys(btnScripts).length > 0) {
    html += '<script>\n';
    for (let btnId in btnScripts) {
      html += `document.getElementById('${btnId}').addEventListener('click', function() {\n`;
      html += btnScripts[btnId];
      html += '});\n';
    }
    html += '</script>\n';
  }
  // グローバルスクリプト
  if (scripts.length > 0) {
    html += '<script>\n' + scripts.join('\n') + '</script>\n';
  }

  // テンプレートHTMLのbody終了
  html += '</body>\n</html>\n';
  return html;
}

const output = convertTxtToHtml(input);
fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Converted ${inputPath} → ${outputPath}`); 