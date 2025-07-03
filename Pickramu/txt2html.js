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
  html += `<!DOCTYPE html>\n<html lang="ja">\n<head>\n<meta charset="UTF-8">\n<title>Converted</title>\n<style>body{font-family:sans-serif;line-height:1.7;}button{margin:8px;}</style>\n</head>\n<body>\n`;

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