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
      <div id="post-form" class="scr-form-card">
        <input type="text" id="username" placeholder="ユーザー名" required>
        <input type="text" id="userid" placeholder="ユーザーID" required>
        <input type="text" id="postname" placeholder="ポスト名" required>
        <textarea id="postdata" placeholder="ポスト内容" required></textarea>
        <button id="post-button" class="button-chalk">ポストする</button>
      </div>
      <div id="feed" class="scr-feed">
        <h2>フィード</h2>
        <input type="text" id="scr-search-input" placeholder="検索ワード">
        <button id="scr-search-btn" class="button-chalk">検索</button>
        <div id="feed-content"></div>
      </div>
    </div>
  `;

  document.getElementById('scr-back-btn').onclick = () => shell.loadApp('menu');

  // SCRロジック初期化
  initializeSCR();
} 