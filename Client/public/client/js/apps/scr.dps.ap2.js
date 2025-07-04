import { initializeSCR } from '../data/scr.client.mjs';
import { SCR_URL, setSCRUrl } from '../core/config.js';

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
    <div class="page-container full-screen scr-bg">
      <button class="go-back-button" id="scr-back-btn" data-lang-key="back">←</button>
      <h1 class="page-title" data-lang-key="scr_note">SCR</h1>
      <button id="scr-open-post-modal" class="scr-post-icon-btn" title="新規ポスト" aria-label="新規ポスト">
        <img src="re/ico/note.svg" alt="新規ポスト" style="width:32px;height:32px;vertical-align:middle;">
      </button>
      <div id="feed" class="scr-feed full-screen-feed">
        <h2>フィード</h2>
      </div>
      <!-- 投稿フォームと検索バーをフィード外に移動 -->
      <form id="scr-post-form" class="scr-post-form" style="display:flex;">
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
        <button type="submit" id="post-button" class="button-chalk submit-button prominent-post-btn">ポストする</button>
      </form>
      <div class="scr-search-bar">
        <input type="text" id="scr-search-input" placeholder="検索ワード">
        <button id="scr-search-btn" class="button-chalk submit-button">検索</button>
      </div>
      <div id="feed-content" class="scr-feed-scrollable" tabindex="0" aria-label="投稿フィード"></div>
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
    openModalBtn.onclick = () => {
      // 投稿フォームのトグルは不要になったので削除
      // const postForm = document.getElementById('scr-post-form');
      // if (postForm.style.display === 'none') {
      //   postForm.style.display = 'flex';
      //   postForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // } else {
      //   postForm.style.display = 'none';
      // }
      // 代わりにモーダルを開く
      modal.style.display = 'flex';
    };
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
      const { username, userid } = await ensureUserInfo();
      const postname = document.getElementById('postname-modal').value;
      const postdata = document.getElementById('postdata-modal').value;
      await submitPost({ username, userid, postname, postdata });
      modal.style.display = 'none';
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
  function getApiBase() {
    if (window.scr_url) return window.scr_url;
    return '/posts';
  }

  // フィード取得関数
  async function fetchFeed(highlightId) {
    try {
      const res = await fetch(getApiBase());
      if (!res.ok) throw new Error('フィード取得失敗');
      const posts = await res.json();
      renderFeed(posts, highlightId);
    } catch (e) {
      document.getElementById('feed-content').innerHTML = `<div class="scr-feed-error">フィードの取得に失敗しました</div>`;
    }
  }

  // フィード描画関数
  function renderFeed(posts, highlightId) {
    const feed = document.getElementById('feed-content');
    if (!Array.isArray(posts) || posts.length === 0) {
      feed.innerHTML = '<div class="scr-feed-empty">投稿はまだありません</div>';
      return;
    }
    feed.innerHTML = posts.map(post => `
      <div class="scr-feed-card${highlightId && post._id === highlightId ? ' active' : ''}" tabindex="0" aria-label="投稿" data-postid="${post._id || ''}">
        <div class="scr-feed-card-header">
          <span class="scr-feed-username">${escapeHTML(post.username)}</span>
          <span class="scr-feed-userid">@${escapeHTML(post.userid)}</span>
        </div>
        <div class="scr-feed-title">${escapeHTML(post.postname)}</div>
        <div class="scr-feed-content">${escapeHTML(post.postdata)}</div>
        <div class="scr-feed-date">${formatDate(post.createdAt)}</div>
      </div>
    `).join('');
    // アニメーション解除用
    if (highlightId) {
      const el = feed.querySelector('.scr-feed-card.active');
      if (el) {
        setTimeout(() => el.classList.remove('active'), 1800);
      }
    }
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
      const res = await fetch(getApiBase(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, userid, postname, postdata })
      });
      if (!res.ok) throw new Error('投稿失敗');
      // 新規投稿ID取得
      const newPost = await res.json();
      // フィード再取得＋新規投稿をハイライト
      await fetchFeed(newPost._id);
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
        const res = await fetch(`${getApiBase()}?q=${encodeURIComponent(q)}`);
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
    .scr-search-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      align-items: center;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }
    .prominent-post-btn {
      background: linear-gradient(90deg, #007aff 60%, #4fc3f7 100%);
      color: #fff;
      font-size: 1.12em;
      font-weight: 700;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,122,255,0.13);
      border: none;
      padding: 12px 32px;
      margin-top: 10px;
      transition: background 0.2s, box-shadow 0.2s;
      outline: none;
    }
    .prominent-post-btn:focus {
      box-shadow: 0 0 0 3px #007aff55, 0 4px 16px rgba(0,122,255,0.13);
    }
    .prominent-post-btn:active {
      background: #005ecb;
    }
    /* スクロール可能なフィード */
    .scr-feed-scrollable {
      max-height: 60vh;
      min-height: 200px;
      overflow-y: auto;
      padding-right: 4px;
      margin-top: 8px;
      margin-bottom: 8px;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    .scr-feed-scrollable::-webkit-scrollbar {
      width: 8px;
      background: transparent;
    }
    .scr-feed-scrollable::-webkit-scrollbar-thumb {
      background: #e0e4ea;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .scr-feed-scrollable:focus {
      outline: 2px solid #007aff;
      outline-offset: -2px;
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
    html, body, .page-container.full-screen {
      height: 100%;
      min-height: 100vh;
      margin: 0;
      padding: 0;
      width: 100vw;
      box-sizing: border-box;
      /* background: #f4f6fa; ← ここを削除してbody継承に */
    }
    .scr-feed.full-screen-feed {
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
      min-height: 80vh;
      padding: 0 0 40px 0;
      display: flex;
      flex-direction: column;
    }
    .scr-feed-card {
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      margin: 18px 0;
      padding: 18px 20px 14px 20px;
      transition: box-shadow 0.3s, transform 0.3s, background 0.3s;
      outline: none;
    }
    .scr-feed-card.active {
      box-shadow: 0 8px 32px rgba(0,122,255,0.18), 0 2px 8px rgba(0,0,0,0.08);
      background: #eaf3ff;
      transform: scale(1.04) translateY(-6px);
      z-index: 10;
    }
    @media (max-width: 800px) {
      .scr-feed.full-screen-feed {
        max-width: 100vw;
        padding: 0 2vw 40px 2vw;
      }
    }
    .scr-post-form-row input#username, .scr-post-form-row input#userid { display: none !important; }
    .scr-bg {
      min-height: 100vh;
      width: 100vw;
      position: relative;
      z-index: 0;
      /* background: none; ← ここを削除 */
    }
    .scr-bg::before {
      content: none !important;
      /* background: none; ← ここを削除 */
      z-index: 1;
      pointer-events: none;
    }
    .page-container.full-screen.scr-bg > * {
      position: relative;
      z-index: 2;
    }
    .scr-post-form {
      transition: opacity 0.3s, transform 0.3s;
      opacity: 1;
      transform: translateY(0);
    }
    .scr-post-form[style*='display:none'] {
      opacity: 0;
      transform: translateY(-20px);
      pointer-events: none;
      height: 0 !important;
      min-height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
    }
  `;
  document.head.appendChild(style);

  // --- ユーザー情報の自動設定 ---
  function getUserInfo() {
    let username = localStorage.getItem('scr_username');
    let userid = localStorage.getItem('scr_userid');
    return { username, userid };
  }
  function setUserInfo(username, userid) {
    localStorage.setItem('scr_username', username);
    localStorage.setItem('scr_userid', userid);
  }
  async function ensureUserInfo() {
    let { username, userid } = getUserInfo();
    if (!username || !userid) {
      // 入力モーダルを表示
      return await new Promise(resolve => {
        const modalBg = document.createElement('div');
        modalBg.className = 'scr-userinfo-modal-bg';
        modalBg.innerHTML = `
          <div class="scr-userinfo-modal">
            <h2>ユーザー情報の設定</h2>
            <form id="scr-userinfo-form">
              <div class="modal-form-group">
                <label for="scr-username-input">ユーザー名</label>
                <input type="text" id="scr-username-input" placeholder="ユーザー名" required>
              </div>
              <div class="modal-form-group">
                <label for="scr-userid-input">ユーザーID</label>
                <input type="text" id="scr-userid-input" placeholder="ユーザーID" required>
              </div>
              <button type="submit" class="button-chalk modal-post-btn submit-button">保存</button>
            </form>
          </div>
        `;
        document.body.appendChild(modalBg);
        document.getElementById('scr-username-input').focus();
        document.getElementById('scr-userinfo-form').onsubmit = (e) => {
          e.preventDefault();
          const username = document.getElementById('scr-username-input').value;
          const userid = document.getElementById('scr-userid-input').value;
          setUserInfo(username, userid);
          document.body.removeChild(modalBg);
          resolve({ username, userid });
        };
      });
    }
    return { username, userid };
  }

  // --- 常設投稿フォームの送信処理 ---
  const postForm = document.getElementById('scr-post-form');
  if (postForm) {
    postForm.onsubmit = async (e) => {
      e.preventDefault();
      const { username, userid } = await ensureUserInfo();
      const postname = document.getElementById('postname').value;
      const postdata = document.getElementById('postdata').value;
      await submitPost({ username, userid, postname, postdata });
      // 入力欄クリア
      document.getElementById('postname').value = '';
      document.getElementById('postdata').value = '';
    };
  }
} 