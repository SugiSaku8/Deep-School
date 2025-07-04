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
        <!-- 常設投稿フォーム -->
        <form id="scr-post-form" class="scr-post-form">
          <div class="scr-post-form-row">
            <input type="text" id="username" placeholder="ユーザー名" required autocomplete="username">
            <input type="text" id="userid" placeholder="ユーザーID" required autocomplete="userid">
          </div>
          <div class="scr-post-form-row">
            <input type="text" id="postname" placeholder="ポスト名" required>
          </div>
          <div class="scr-post-form-row">
            <textarea id="postdata" placeholder="ポスト内容" required rows="2"></textarea>
          </div>
          <button type="submit" id="post-button" class="button-chalk submit-button">ポストする</button>
        </form>
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
      const username = document.getElementById('username-modal').value;
      const userid = document.getElementById('userid-modal').value;
      const postname = document.getElementById('postname-modal').value;
      const postdata = document.getElementById('postdata-modal').value;
      await submitPost({ username, userid, postname, postdata });
      modal.style.display = 'none';
      // 入力欄クリア
      document.getElementById('username-modal').value = '';
      document.getElementById('userid-modal').value = '';
      document.getElementById('postname-modal').value = '';
      document.getElementById('postdata-modal').value = '';
    };
  }

  // 既存の投稿フォームは非表示に
  const oldPostForm = document.getElementById('post-form');
  if (oldPostForm) oldPostForm.style.display = 'none';

  // SCRロジック初期化
  initializeSCR();

  // Initialize parallax effects for SCR elements
  if (window.parallaxManager) {
    const buttons = document.querySelectorAll('.button-chalk, .auto-btn');
    const backBtn = document.getElementById('scr-back-btn');
    const postIconBtn = document.getElementById('scr-open-post-modal');
    const closeBtn = document.getElementById('scr-post-modal-close');
    const inputs = document.querySelectorAll('input[type="text"], textarea');
    const modal = document.getElementById('scr-post-modal');
    
    buttons.forEach(btn => {
      window.parallaxManager.addParallaxEffects(btn, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: true
      });
    });
    
    if (backBtn) {
      window.parallaxManager.addParallaxEffects(backBtn, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: true
      });
    }
    
    if (postIconBtn) {
      window.parallaxManager.addParallaxEffects(postIconBtn, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: true
      });
    }
    
    if (closeBtn) {
      window.parallaxManager.addParallaxEffects(closeBtn, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: true
      });
    }
    
    inputs.forEach(input => {
      window.parallaxManager.addParallaxEffects(input, {
        hover: true,
        mouse: false,
        touch: false
      });
    });
    
    if (modal) {
      window.parallaxManager.addParallaxEffects(modal, {
        hover: false,
        mouse: false,
        touch: false
      });
    }
    
    shell.log({from: 'dp.app.scr.out', message: 'SCRApp: Parallax effects initialized', level: 'info'});
  }

  // --- 投稿・フィードAPIエンドポイント ---
  const API_BASE = '/posts'; // 必要に応じて修正

  // フィード取得関数
  async function fetchFeed() {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('フィード取得失敗');
      const posts = await res.json();
      renderFeed(posts);
    } catch (e) {
      document.getElementById('feed-content').innerHTML = `<div class="scr-feed-error">フィードの取得に失敗しました</div>`;
    }
  }

  // フィード描画関数
  function renderFeed(posts) {
    const feed = document.getElementById('feed-content');
    if (!Array.isArray(posts) || posts.length === 0) {
      feed.innerHTML = '<div class="scr-feed-empty">投稿はまだありません</div>';
      return;
    }
    feed.innerHTML = posts.map(post => `
      <div class="scr-feed-card" tabindex="0" aria-label="投稿">
        <div class="scr-feed-card-header">
          <span class="scr-feed-username">${escapeHTML(post.username)}</span>
          <span class="scr-feed-userid">@${escapeHTML(post.userid)}</span>
        </div>
        <div class="scr-feed-title">${escapeHTML(post.postname)}</div>
        <div class="scr-feed-content">${escapeHTML(post.postdata)}</div>
        <div class="scr-feed-date">${formatDate(post.createdAt)}</div>
      </div>
    `).join('');
  }

  // HTMLエスケープ
  function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, tag => ({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[tag]));
  }
  // 日付フォーマット
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' });
  }

  // 投稿送信関数
  async function submitPost({username, userid, postname, postdata}) {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, userid, postname, postdata })
      });
      if (!res.ok) throw new Error('投稿失敗');
      await fetchFeed(); // 投稿後にフィード再取得
    } catch (e) {
      alert('投稿に失敗しました');
    }
  }

  // 初回ロード時にフィード取得
  fetchFeed();

  // --- 検索機能（オプション） ---
  const searchBtn = document.getElementById('scr-search-btn');
  if (searchBtn) {
    searchBtn.onclick = async () => {
      const q = document.getElementById('scr-search-input').value.trim();
      if (!q) return fetchFeed();
      try {
        const res = await fetch(`${API_BASE}?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('検索失敗');
        const posts = await res.json();
        renderFeed(posts);
      } catch (e) {
        document.getElementById('feed-content').innerHTML = `<div class="scr-feed-error">検索に失敗しました</div>`;
      }
    };
  }

  // --- Apple HIG風スタイルを追加 ---
  const style = document.createElement('style');
  style.innerHTML = `
    .scr-feed-card {
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      margin: 18px 0;
      padding: 18px 20px 14px 20px;
      transition: box-shadow 0.2s;
      outline: none;
    }
    .scr-feed-card:focus {
      box-shadow: 0 0 0 3px #007aff33, 0 2px 8px rgba(0,0,0,0.08);
    }
    .scr-feed-card-header {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 4px;
    }
    .scr-feed-username {
      font-weight: 600;
      color: #222;
      font-size: 1.08em;
    }
    .scr-feed-userid {
      color: #888;
      font-size: 0.98em;
    }
    .scr-feed-title {
      font-size: 1.12em;
      font-weight: 500;
      margin-bottom: 6px;
      color: #007aff;
    }
    .scr-feed-content {
      font-size: 1.04em;
      color: #222;
      margin-bottom: 8px;
      white-space: pre-wrap;
    }
    .scr-feed-date {
      color: #aaa;
      font-size: 0.92em;
      text-align: right;
    }
    .scr-feed-empty, .scr-feed-error {
      color: #888;
      text-align: center;
      margin: 32px 0;
      font-size: 1.1em;
    }
    .scr-post-modal-content {
      border-radius: 18px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.13);
      background: #fff;
      padding: 32px 24px 24px 24px;
      max-width: 400px;
      margin: 40px auto;
    }
    .modal-form-group input, .modal-form-group textarea {
      border-radius: 10px;
      border: 1px solid #ddd;
      padding: 8px 12px;
      margin-top: 4px;
      margin-bottom: 12px;
      width: 100%;
      font-size: 1em;
      box-sizing: border-box;
    }
    .modal-form-group label {
      font-size: 0.98em;
      color: #333;
      font-weight: 500;
    }
    .modal-post-btn {
      background: #007aff;
      color: #fff;
      border-radius: 10px;
      border: none;
      padding: 10px 24px;
      font-size: 1.08em;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0,122,255,0.08);
      transition: background 0.2s;
      margin-top: 8px;
    }
    .modal-post-btn:active {
      background: #005ecb;
    }
    .scr-post-modal {
      background: rgba(0,0,0,0.18);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      left: 0; top: 0; right: 0; bottom: 0;
    }
    .scr-post-form {
      background: #f9f9fb;
      border-radius: 16px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      padding: 18px 16px 10px 16px;
      margin-bottom: 18px;
      display: flex;
      flex-direction: column;
      gap: 0.5em;
    }
    .scr-post-form-row {
      display: flex;
      gap: 10px;
      margin-bottom: 4px;
    }
    .scr-post-form-row input, .scr-post-form-row textarea {
      border-radius: 10px;
      border: 1px solid #ddd;
      padding: 8px 12px;
      font-size: 1em;
      flex: 1;
      box-sizing: border-box;
    }
    .scr-post-form textarea {
      resize: vertical;
      min-height: 36px;
      max-height: 120px;
    }
    .scr-post-form .submit-button {
      align-self: flex-end;
      margin-top: 4px;
      min-width: 120px;
    }
  `;
  document.head.appendChild(style);

  // --- 常設投稿フォームの送信処理 ---
  const postForm = document.getElementById('scr-post-form');
  if (postForm) {
    postForm.onsubmit = async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const userid = document.getElementById('userid').value;
      const postname = document.getElementById('postname').value;
      const postdata = document.getElementById('postdata').value;
      await submitPost({ username, userid, postname, postdata });
      // 入力欄クリア
      document.getElementById('username').value = '';
      document.getElementById('userid').value = '';
      document.getElementById('postname').value = '';
      document.getElementById('postdata').value = '';
    };
  }
} 