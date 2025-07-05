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
 
      <!-- 検索バーを一番上に配置 -->
      <div class="scr-search-bar">
        <input type="text" id="scr-search-input" placeholder="検索ワード">
        <button id="scr-search-btn" class="button-chalk submit-button">検索</button>
      </div>
      
      <div id="feed" class="scr-feed full-screen-feed">
        <h2>フィード</h2>
      </div>
      
      <!-- 投稿フォームをフィード外に移動 -->
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

  // モーダルの開閉処理を関数として定義
  function setupModalHandlers() {
    const openModalBtn = document.getElementById('scr-open-post-modal');
    const modal = document.getElementById('scr-post-modal');
    const closeModalBtn = document.getElementById('scr-post-modal-close');
    
    console.log('[SCR] Setting up modal handlers...');
    console.log('[SCR] Modal elements found:', { 
      openModalBtn: !!openModalBtn, 
      modal: !!modal, 
      closeModalBtn: !!closeModalBtn,
      openModalBtnId: openModalBtn?.id,
      modalId: modal?.id
    });
    
    if (openModalBtn && modal) {
      // 既存のイベントリスナーを削除
      openModalBtn.replaceWith(openModalBtn.cloneNode(true));
      const newOpenModalBtn = document.getElementById('scr-open-post-modal');
      
             newOpenModalBtn.addEventListener('click', (e) => {
         console.log('[SCR] Open modal button clicked');
         e.preventDefault();
         e.stopPropagation();
         
         // モーダルの現在の状態を確認
         console.log('[SCR] Modal current display:', modal.style.display);
         console.log('[SCR] Modal current classes:', modal.className);
         console.log('[SCR] Modal computed style:', window.getComputedStyle(modal).display);
         
         // 複数の方法でモーダルを表示
         modal.style.setProperty('display', 'flex', 'important');
         modal.style.setProperty('visibility', 'visible', 'important');
         modal.style.setProperty('opacity', '1', 'important');
         modal.classList.add('show', 'visible');
         
         // 強制的に再描画
         modal.offsetHeight;
         
         console.log('[SCR] Modal display set to flex and show class added');
         console.log('[SCR] Modal new display:', modal.style.display);
         console.log('[SCR] Modal new classes:', modal.className);
         console.log('[SCR] Modal computed style after:', window.getComputedStyle(modal).display);
         
         // モーダルが実際に表示されているか確認
         setTimeout(() => {
           const isVisible = window.getComputedStyle(modal).display === 'flex';
           console.log('[SCR] Modal visibility check:', isVisible);
           if (!isVisible) {
             console.error('[SCR] Modal still not visible, trying alternative method');
             modal.style.cssText = 'display: flex !important; visibility: visible !important; opacity: 1 !important; z-index: 999999 !important;';
           }
         }, 100);
       });
      
      console.log('[SCR] Modal open handler attached successfully');
    } else {
      console.error('[SCR] Modal elements not found:', { openModalBtn, modal });
    }
    
    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener('click', (e) => { 
        e.preventDefault();
        modal.style.setProperty('display', 'none', 'important'); 
        modal.classList.remove('show');
        console.log('[SCR] Modal closed');
      });
    }
    
    // モーダル外クリックで閉じる
    if (modal) {
      modal.addEventListener('click', (e) => { 
        if (e.target === modal) {
          modal.style.setProperty('display', 'none', 'important'); 
          modal.classList.remove('show');
          console.log('[SCR] Modal closed by outside click');
        }
      });
    }

    // モーダルのポストフォーム送信
    const postFormModal = document.getElementById('scr-post-form-modal');
    if (postFormModal) {
      postFormModal.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { username, userid } = await ensureUserInfo();
        const postname = document.getElementById('postname-modal').value;
        const postdata = document.getElementById('postdata-modal').value;
        await submitPost({ username, userid, postname, postdata });
        modal.style.setProperty('display', 'none', 'important');
        modal.classList.remove('show');
        document.getElementById('postname-modal').value = '';
        document.getElementById('postdata-modal').value = '';
      });
    }
  }

  // 複数回試行してモーダルハンドラーを設定
  setupModalHandlers();
  
  // 少し遅延してから再度試行
  setTimeout(setupModalHandlers, 100);
  setTimeout(setupModalHandlers, 500);
  
  // 既存の投稿フォームは非表示に
  const oldPostForm = document.getElementById('post-form');
  if (oldPostForm) oldPostForm.style.display = 'none';

  // SCRロジック初期化
  initializeSCR();
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
      align-items: center;
      max-width: 700px;
      margin: 0 auto 20px auto;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      z-index: 100;
      position: sticky;
      top: 0;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .scr-search-bar input {
      flex: 1;
      border: 1px solid #e0e4ea;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 1em;
      background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .scr-search-bar input:focus {
      outline: none;
      border-color: #007aff;
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
    }
    
    .scr-search-bar button {
      background: #007aff;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 10px 20px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .scr-search-bar button:hover {
      background: #005ecb;
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
    .scr-post-icon-btn {
      position: fixed !important;
      top: 16px !important;
      right: 16px !important;
      background: #007bff;
      border: none;
      border-radius: 50%;
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: none;
      cursor: pointer;
      transition: none;
      z-index: 10000 !important;
    }
    .scr-post-icon-btn:hover, .scr-post-icon-btn:focus, .scr-post-icon-btn:active {
      background: #3290f4;
      box-shadow: none;
      outline: none;
      transition: none;
      transform: none;
    }
    @media (max-width: 600px) {
      .scr-post-icon-btn {
        top: 8px !important;
        right: 8px !important;
        width: 44px;
        height: 44px;
      }
    }
    .scr-post-modal {
      background: rgba(0,0,0,0.4);
      z-index: 999999;
      display: none;
      align-items: center;
      justify-content: center;
      position: fixed;
      left: 0; top: 0; right: 0; bottom: 0;
      width: 100vw;
      height: 100vh;
      backdrop-filter: blur(8px);
      pointer-events: auto;
    }
    .scr-post-modal[style*='display:flex'] {
      display: flex !important;
    }
    .scr-post-modal.show {
      display: flex !important;
    }
    .scr-post-modal.visible {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    .scr-post-modal-content {
      border-radius: 18px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      background: #fff;
      padding: 32px 24px 24px 24px;
      max-width: 400px;
      width: 90vw;
      margin: 40px auto;
      z-index: 1000000;
      position: relative;
      border: 1px solid rgba(0, 0, 0, 0.1);
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
      min-height: 70vh;
      padding: 20px 0 40px 0;
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
    .page-container.full-screen.scr-bg {
      position: relative;
    }
  `;
  document.head.insertBefore(style, document.head.lastChild);

  // innerHTML描画直後に主要要素の存在を確認
  console.log('[SCR] #scr-open-post-modal:', document.getElementById('scr-open-post-modal'));
  console.log('[SCR] #scr-post-modal:', document.getElementById('scr-post-modal'));
  console.log('[SCR] .scr-search-bar:', document.querySelector('.scr-search-bar'));

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