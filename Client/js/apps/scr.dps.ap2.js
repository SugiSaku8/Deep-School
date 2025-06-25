import { initializeSCR } from '../data/scr.client.mjs';

export const appMeta = {
  name: "scr",
  title: "SCRノート",
  icon: "re/ico/SCR.png"
};

export function appInit(shell) {
  const root = document.getElementById('app-root');
  if (!root) {
    console.error('SCRApp: #app-rootが見つかりません');
    return;
  }
  root.innerHTML = `
    <div class="page-container">
      <button class="go-back-button" id="scr-back-btn" data-lang-key="back">←</button>
      <h1 class="page-title" data-lang-key="scr_note">SCRノート</h1>
      <div class="scr-editor-container">
        <textarea id="scr-editor" placeholder="ノートをここに書いてください" style="width:100%;height:200px;"></textarea>
        <button id="scr-save-btn" class="button-chalk" data-lang-key="save">保存</button>
      </div>
      <div class="scr-preview-container">
        <h2 data-lang-key="preview">プレビュー</h2>
        <div id="scr-preview" class="scr-preview" style="background:#173c2b; border-radius:12px; min-height:100px; padding:16px; color:#fff;"></div>
      </div>
    </div>
  `;

  document.getElementById('scr-back-btn').onclick = () => shell.loadApp('menu');

  const editor = document.getElementById('scr-editor');
  const preview = document.getElementById('scr-preview');
  if (editor && preview) {
    editor.addEventListener('input', () => {
      preview.innerHTML = marked.parse(editor.value);
    });
  }
  document.getElementById('scr-save-btn').onclick = () => {
    alert('ノートを保存しました（ダミー）');
  };
} 