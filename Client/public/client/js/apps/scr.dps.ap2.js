import { initializeSCR } from '../data/scr.client.mjs';

export const appMeta = {
  name: "scr",
  title: "SCR",
  icon: "re/ico/icon_top.png"
};

export function appInit(shell) {
  const root = document.getElementById('app-root');
  if (!root) {
    ds.log({from: 'dp.app.scr.out', message: 'SCRApp: #app-rootが見つかりません', level: 'error'});
    return;
  }
  root.innerHTML = `
    <div class="page-container">
      <button class="go-back-button" id="scr-back-btn" data-lang-key="back">←</button>
      <h1 class="page-title" data-lang-key="scr_note">SCR</h1>
      <button id="scr-open-post-modal" class="scr-post-icon-btn" title="新規ポスト" aria-label="新規ポスト">
        <img src="re/ico/note.svg" alt="新規ポスト" style="width:32px;height:32px;vertical-align:middle;">
      </button>
      <div id="feed" class="scr-feed">
        <h2>フィード</h2>
        <input type="text" id="scr-search-input" placeholder="検索ワード">
        <button id="scr-search-btn" class="button-chalk submit-button">検索</button>
        <div id="feed-content"></div>
      </div>
      <div id="scr-post-modal" class="scr-post-modal" style="display:none;">
        <div class="scr-post-modal-content">
          <button class="close-btn" id="scr-post-modal-close" title="閉じる" aria-label="閉じる">×</button>
          <h2 class="modal-title">新規ポスト</h2>
          <form id="scr-post-form-modal">
            <div class="modal-form-group">
              <label for="username-modal">ユーザー名</label>
              <input type="text" id="username-modal" placeholder="ユーザー名" required>
            </div>
            <div class="modal-form-group">
              <label for="userid-modal">ユーザーID</label>
              <input type="text" id="userid-modal" placeholder="ユーザーID" required>
            </div>
            <div class="modal-form-group">
              <label for="postname-modal">ポスト名</label>
              <input type="text" id="postname-modal" placeholder="ポスト名" required>
            </div>
            <div class="modal-form-group">
              <label for="postdata-modal">ポスト内容</label>
              <textarea id="postdata-modal" placeholder="ポスト内容" required></textarea>
            </div>
            <button type="submit" class="button-chalk modal-post-btn submit-button">ポストする</button>
          </form>
        </div>
      </div>
    </div>
  `;

  document.getElementById('scr-back-btn').onclick = () => shell.loadApp('menu');

  // モーダルの開閉
  const openModalBtn = document.getElementById('scr-open-post-modal');
  const modal = document.getElementById('scr-post-modal');
  const closeModalBtn = document.getElementById('scr-post-modal-close');
  if (openModalBtn && modal) {
    openModalBtn.onclick = () => { modal.style.display = 'flex'; };
  }
  if (closeModalBtn && modal) {
    closeModalBtn.onclick = () => { modal.style.display = 'none'; };
  }
  // モーダル外クリックで閉じる
  if (modal) {
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
  }

  // モーダルのポストフォーム送信
  const postFormModal = document.getElementById('scr-post-form-modal');
  if (postFormModal) {
    postFormModal.onsubmit = async (e) => {
      e.preventDefault();
      // 値取得
      const username = document.getElementById('username-modal').value;
      const userid = document.getElementById('userid-modal').value;
      const postname = document.getElementById('postname-modal').value;
      const postdata = document.getElementById('postdata-modal').value;
      // 既存のpost-formのinputにも値をセット
      document.getElementById('username').value = username;
      document.getElementById('userid').value = userid;
      document.getElementById('postname').value = postname;
      document.getElementById('postdata').value = postdata;
      // 既存のポストボタンをクリック
      document.getElementById('post-button').click();
      // モーダルを閉じる
      modal.style.display = 'none';
    };
  }

  // 既存の投稿フォームは非表示に
  const oldPostForm = document.getElementById('post-form');
  if (oldPostForm) oldPostForm.style.display = 'none';

  // SCRロジック初期化
  initializeSCR();
} 