import { initializeSCR } from "../data/scr.client.mjs";
import { SCR_URL, setSCRUrl } from "../core/config.js";

export const appMeta = {
  name: "scr",
  title: "SCR",
  icon: "re/ico/icon_top.png",
};

export function appInit(shell) {
  const root = document.getElementById("app-root");
  if (!root) {
    ds.log({
      from: "dp.app.scr.out",
      message: "SCRApp: #app-rootが見つかりません",
      level: "error",
    });
    return;
  }
  root.innerHTML = `
    <div class="page-container full-screen scr-bg">
      <button class="go-back-button" id="scr-back-btn" data-lang-key="back">←</button>
      <h1 class="page-title" data-lang-key="scr_note">SCR</h1>
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:8px;">
        <button id="scr-toaster-btn" class="button-chalk" style="background:#2cb4ad;color:#fff;border-radius:8px;padding:8px 16px;box-shadow:0 2px 8px rgba(44,180,173,0.12);font-weight:600;">ToasterMachineで答えを生成</button>
        <button id="scr-toaster-to-chat" class="button-chalk" style="background:#ffd700;color:#222;border-radius:8px;padding:8px 16px;box-shadow:0 2px 8px rgba(255,215,0,0.12);font-weight:600;display:none;">生成内容をChatに送る</button>
        <span id="scr-toaster-status" style="margin-left:8px;color:#2cb4ad;font-weight:500;"></span>
      </div>
      <div id="scr-user-info" class="scr-user-info" style="display:none;">
        <span id="scr-current-user"></span>
      </div>
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

      
      <div id="feed-content" class="scr-feed-scrollable" tabindex="0" aria-label="投稿フィード"></div>
      <div id="scr-post-modal" class="scr-post-modal" style="display:none;">
        <div class="scr-post-modal-content">
          <button class="close-btn" id="scr-post-modal-close" title="閉じる" aria-label="閉じる">×</button>
          <h2 class="modal-title">新規ポスト</h2>
          <form id="scr-post-form-modal">
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

  document.getElementById("scr-back-btn").onclick = () => shell.loadApp("menu");

  // モーダルの開閉処理を関数として定義
  function resetModalState(modal) {
    if (modal) {
      modal.style.setProperty("display", "none", "important");
      modal.style.setProperty("visibility", "hidden", "important");
      modal.style.setProperty("opacity", "0", "important");
      modal.classList.remove("show", "visible");
    }
  }

  function setupModalHandlers() {
    const openModalBtn = document.getElementById("scr-open-post-modal");
    const modal = document.getElementById("scr-post-modal");
    const closeModalBtn = document.getElementById("scr-post-modal-close");

    if (openModalBtn && modal) {
      // 既存のイベントリスナーを削除して新しい要素を作成
      const newOpenModalBtn = openModalBtn.cloneNode(true);
      openModalBtn.parentNode.replaceChild(newOpenModalBtn, openModalBtn);
      newOpenModalBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetModalState(modal);
        setTimeout(() => {
          modal.style.cssText =
            "display: flex !important; visibility: visible !important; opacity: 1 !important; z-index: 999999 !important; position: fixed !important; left: 0 !important; top: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.4) !important; align-items: center !important; justify-content: center !important; backdrop-filter: blur(8px) !important;";
          modal.classList.add("show", "visible");
          modal.offsetHeight;
        }, 50);
      });
    }
    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener("click", (e) => {
        e.preventDefault();
        resetModalState(modal);
      });
    }
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          resetModalState(modal);
        }
      });
    }
    // モーダルのポストフォーム送信
    const postFormModal = document.getElementById("scr-post-form-modal");
    if (postFormModal) {
      postFormModal.onsubmit = async (e) => {
        e.preventDefault();
        const { username, userid } = await ensureUserInfo();
        const postname = document.getElementById("postname-modal").value;
        const postdata = document.getElementById("postdata-modal").value;
        await submitPost({ username, userid, postname, postdata });
        resetModalState(modal);
        document.getElementById("postname-modal").value = "";
        document.getElementById("postdata-modal").value = "";
      };
    }
  }

  // モーダルハンドラーは1回だけ呼ぶ
  setupModalHandlers();

  // 既存の投稿フォームは非表示に
  const oldPostForm = document.getElementById("post-form");
  if (oldPostForm) oldPostForm.style.display = "none";

  // SCRロジック初期化
  initializeSCR();

  // --- 投稿・フィードAPIエンドポイント ---
  function getApiBase() {
    if (window.scr_url) return window.scr_url;
    return "https://deep-school.onrender.com/posts";
  }

  // 再試行機能付きAPI呼び出し
  async function fetchWithRetry(
    url,
    options = {},
    maxRetries = 3,
    delay = 1000
  ) {
    // CORS設定を追加
    const defaultOptions = {
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...options.headers,
      },
    };

    const finalOptions = { ...defaultOptions, ...options };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[SCR] API attempt ${attempt}/${maxRetries}: ${url}`);
        const res = await fetch(url, finalOptions);

        if (res.ok) {
          console.log(`[SCR] API success on attempt ${attempt}`);
          return res;
        }

        if (res.status === 404) {
          console.warn(`[SCR] 404 error on attempt ${attempt}, retrying...`);
          if (attempt < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, delay * attempt)
            );
            continue;
          }
        }

        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      } catch (e) {
        console.error(`[SCR] API error on attempt ${attempt}:`, e);
        if (attempt === maxRetries) {
          throw e;
        }
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  // フィード取得関数
  async function fetchFeed(highlightId) {
    try {
      const res = await fetchWithRetry(`${getApiBase()}/all`);
      const posts = await res.json();
      renderFeed(posts, highlightId);
    } catch (e) {
      console.error("[SCR] Feed fetch failed after retries:", e);
      document.getElementById(
        "feed-content"
      ).innerHTML = `<div class="scr-feed-error">フィードの取得に失敗しました (${e.message})</div>`;
    }
  }

  // フィード描画関数
  function renderFeed(posts, highlightId) {
    const feed = document.getElementById("feed-content");
    if (!Array.isArray(posts) || posts.length === 0) {
      feed.innerHTML = '<div class="scr-feed-empty">投稿はまだありません</div>';
      // 現在のフィードを保存
      feed._currentFeed = [];
      return;
    }
    feed.innerHTML = posts
      .map((post) => {
        const isReply = post.Genre === "@reply";
        const replyToPostId =
          post.LinkerData &&
          post.LinkerData.length > 0 &&
          post.LinkerData[0].replyed;

        return `
        <div class="scr-feed-card${
          highlightId && post.PostId === highlightId ? " active" : ""
        }${
          isReply ? " scr-reply-card" : ""
        }" tabindex="0" aria-label="投稿" data-postid="${post.PostId || ""}">
          ${
            isReply && replyToPostId
              ? `<div class="scr-reply-indicator">↳ 返信: ${replyToPostId}</div>`
              : ""
          }
          <div class="scr-feed-card-header">
            <span class="scr-feed-username">${escapeHTML(post.UserName)}</span>
            <span class="scr-feed-userid">@${escapeHTML(post.UserId)}</span>
            ${isReply ? '<span class="scr-reply-badge">返信</span>' : ""}
          </div>
          <div class="scr-feed-title">${escapeHTML(post.PostName)}</div>
          <div class="scr-feed-content">${escapeHTML(post.PostData)}</div>
          <div class="scr-feed-date">${formatDate(post.PostTime)}</div>
          <div class="scr-feed-genre">${escapeHTML(post.LikerData || "")}</div>
          <div class="scr-feed-actions">
            <button class="scr-reply-btn" data-postid="${
              post.PostId
            }" aria-label="返信">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9,17 15,17 15,11 21,11 21,5 15,5 15,11 9,11"></polyline>
              </svg>
              返信
            </button>
          </div>
          <div class="scr-reply-form" id="reply-form-${
            post.PostId
          }" style="display:none;">
            <textarea class="scr-reply-textarea" placeholder="返信を入力してください..." rows="3"></textarea>
            <div class="scr-reply-actions">
              <button class="scr-reply-submit-btn" data-postid="${
                post.PostId
              }">返信を送信</button>
              <button class="scr-reply-cancel-btn" data-postid="${
                post.PostId
              }">キャンセル</button>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    // 現在のフィードを保存
    feed._currentFeed = posts;
    // 返信ボタンのイベントリスナーを設定
    setupReplyHandlers();

    // アニメーション解除用
    if (highlightId) {
      const el = feed.querySelector(".scr-feed-card.active");
      if (el) {
        setTimeout(() => el.classList.remove("active"), 1800);
      }
    }
  }

  // HTMLエスケープ
  function escapeHTML(str) {
    return String(str).replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        }[tag])
    );
  }
  // 日付フォーマット
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("ja-JP", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  // 返信ハンドラー設定
  function setupReplyHandlers() {
    // 返信ボタンクリック
    document.querySelectorAll(".scr-reply-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const postId = btn.getAttribute("data-postid");
        const replyForm = document.getElementById(`reply-form-${postId}`);
        if (replyForm) {
          replyForm.style.display = "block";
          replyForm.querySelector(".scr-reply-textarea").focus();
        }
      });
    });

    // 返信送信ボタンクリック
    document.querySelectorAll(".scr-reply-submit-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const postId = btn.getAttribute("data-postid");
        const replyForm = document.getElementById(`reply-form-${postId}`);
        const textarea = replyForm.querySelector(".scr-reply-textarea");
        const replyText = textarea.value.trim();

        if (!replyText) {
          alert("返信内容を入力してください");
          return;
        }

        await submitReply(postId, replyText);

        // フォームをクリアして非表示
        textarea.value = "";
        replyForm.style.display = "none";
      });
    });

    // 返信キャンセルボタンクリック
    document.querySelectorAll(".scr-reply-cancel-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const postId = btn.getAttribute("data-postid");
        const replyForm = document.getElementById(`reply-form-${postId}`);
        const textarea = replyForm.querySelector(".scr-reply-textarea");

        // フォームをクリアして非表示
        textarea.value = "";
        replyForm.style.display = "none";
      });
    });
  }

  // 返信送信関数
  async function submitReply(parentPostId, replyText) {
    try {
      const { username, userid } = await ensureUserInfo();
      const currentTime = new Date().toISOString();

      const replyData = {
        UserName: username,
        UserId: userid,
        PostName: `返信: ${parentPostId}`,
        PostTime: currentTime,
        PostData: replyText,
        Genre: "@reply",
        LinkerData: [
          {
            replyed: parentPostId,
          },
        ],
      };

      console.log("[SCR] Submitting reply:", replyData);

      const res = await fetchWithRetry(`${getApiBase()}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(replyData),
      });

      const result = await res.json();
      console.log("[SCR] Reply submitted successfully:", result);

      // フィード再取得
      await fetchFeed();
    } catch (e) {
      console.error("[SCR] Reply submission failed after retries:", e);
      alert(`返信に失敗しました: ${e.message}`);
    }
  }

  // 投稿送信関数
  async function submitPost({ username, userid, postname, postdata }) {
    try {
      const currentTime = new Date().toISOString();
      const postData = {
        UserName: username,
        UserId: userid,
        PostName: postname,
        PostTime: currentTime,
        PostData: postdata,
        Genre: "general",
        LinkerData: [],
      };

      console.log("[SCR] Submitting post:", postData);

      const res = await fetchWithRetry(`${getApiBase()}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      const result = await res.json();
      console.log("[SCR] Post submitted successfully:", result);

      if (result.post) {
        // 既存のフィードを取得
        let feed = [];
        const feedDiv = document.getElementById("feed-content");
        if (feedDiv && feedDiv._currentFeed) {
          feed = Array.isArray(feedDiv._currentFeed)
            ? feedDiv._currentFeed
            : [];
        }
        // 先頭に新しい投稿を追加
        feed.unshift(result.post);
        // フィードを再描画
        renderFeed(feed);
        // 現在のフィードを保存
        if (feedDiv) feedDiv._currentFeed = feed;
      } else {
        // フォールバック：全件再取得
        await fetchFeed();
      }
    } catch (e) {
      console.error("[SCR] Post submission failed after retries:", e);
      alert(`投稿に失敗しました: ${e.message}`);
    }
  }

  // ユーザー情報を表示
  async function displayUserInfo() {
    const { username, userid } = await ensureUserInfo();
    const userInfoDiv = document.getElementById("scr-user-info");
    const currentUserSpan = document.getElementById("scr-current-user");

    if (userInfoDiv && currentUserSpan) {
      currentUserSpan.textContent = `${username} (@${userid})`;
      userInfoDiv.style.display = "block";
    }
  }

  // サーバー状態確認
  async function checkServerStatus() {
    try {
      const res = await fetch("https://deep-school.onrender.com/", {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      if (res.ok) {
        console.log("[SCR] Server is running");
        return true;
      }
    } catch (e) {
      console.error("[SCR] Server connection failed:", e);
      document.getElementById("feed-content").innerHTML = `
        <div class="scr-feed-error">
          <h3>サーバーに接続できません</h3>
          <p>サーバーが起動しているか確認してください。</p>
          <p>エラー: ${e.message}</p>
          <p>詳細: CORS設定またはネットワーク接続の問題の可能性があります。</p>
        </div>
      `;
      return false;
    }
  }

  // 初回ロード時の処理
  async function initializeApp() {
    const serverOk = await checkServerStatus();
    if (serverOk) {
      await fetchFeed();
      await displayUserInfo();
    }
  }

  initializeApp();

  // --- 検索機能（オプション） ---
  const searchBtn = document.getElementById("scr-search-btn");
  if (searchBtn) {
    searchBtn.onclick = async () => {
      const q = document.getElementById("scr-search-input").value.trim();
      if (!q) return fetchFeed();
      try {
        const res = await fetchWithRetry(
          `${getApiBase()}/search?query=${encodeURIComponent(q)}`
        );
        const posts = await res.json();
        renderFeed(posts);
      } catch (e) {
        console.error("[SCR] Search failed after retries:", e);
        document.getElementById(
          "feed-content"
        ).innerHTML = `<div class="scr-feed-error">検索に失敗しました (${e.message})</div>`;
      }
    };
  }

  // --- Apple HIG風スタイルを追加 ---
  const style = document.createElement("style");
  style.innerHTML = `
    .scr-feed-scrollable, #feed-content.scr-feed-scrollable {
      min-height: 200px;
      height: 60vh !important;
      max-height: 60vh !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      margin-top: 8px;
      margin-bottom: 8px;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      width: 100%;
    }
    .page-container.full-screen.scr-bg {
      min-height: 100vh;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .scr-feed.full-screen-feed {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      width: 100%;
    }
    /* フィードの文字色を明示的に指定 */
    .scr-feed-card {
      color: #222 !important;
      background: #fff !important;
    }
    .scr-feed-title {
      color: #007aff !important;
    }
    .scr-feed-content {
      color: #222 !important;
    }
    .scr-feed-username {
      color: #222 !important;
    }
    .scr-feed-userid {
      color: #888 !important;
    }
    .scr-feed-date {
      color: #888 !important;
    }
    .scr-feed-genre {
      color: #007aff !important;
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
    }
    .scr-bg::before {
      content: none !important;
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
    .scr-user-info {
      text-align: center;
      margin: 8px 0;
      padding: 8px 16px;
      background: rgba(0, 122, 255, 0.1);
      border-radius: 12px;
      font-size: 0.9em;
      color: #007aff;
      font-weight: 500;
    }
    
    /* 返信機能のスタイル */
    .scr-feed-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
    }
    
    .scr-reply-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #f8f9fa;
      border: 1px solid #e0e4ea;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 0.9em;
      color: #666;
      cursor: pointer;
      transition: all 0.2s;
      outline: none;
    }
    
    .scr-reply-btn:hover {
      background: #e9ecef;
      border-color: #007aff;
      color: #007aff;
    }
    
    .scr-reply-btn:focus {
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
    }
    
    .scr-reply-btn svg {
      width: 14px;
      height: 14px;
    }
    
    .scr-reply-form {
      margin-top: 12px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #e0e4ea;
    }
    
    .scr-reply-textarea {
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 0.95em;
      font-family: inherit;
      resize: vertical;
      min-height: 60px;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;
    }
    
    .scr-reply-textarea:focus {
      border-color: #007aff;
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
    }
    
    .scr-reply-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      justify-content: flex-end;
    }
    
    .scr-reply-submit-btn {
      background: #007aff;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 0.9em;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      outline: none;
    }
    
    .scr-reply-submit-btn:hover {
      background: #005ecb;
    }
    
    .scr-reply-submit-btn:focus {
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
    }
    
    .scr-reply-cancel-btn {
      background: #f8f9fa;
      color: #666;
      border: 1px solid #e0e4ea;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 0.9em;
      cursor: pointer;
      transition: all 0.2s;
      outline: none;
    }
    
    .scr-reply-cancel-btn:hover {
      background: #e9ecef;
      border-color: #007aff;
      color: #007aff;
    }
    
    .scr-reply-cancel-btn:focus {
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
    }
    
    /* 返信投稿の視覚的区別 */
    .scr-reply-card {
      background: #f8f9fa;
      border-left: 4px solid #007aff;
      margin-left: 20px;
    }
    
    .scr-reply-indicator {
      font-size: 0.85em;
      color: #007aff;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .scr-reply-badge {
      background: #007aff;
      color: #fff;
      font-size: 0.75em;
      padding: 2px 6px;
      border-radius: 6px;
      font-weight: 600;
      margin-left: 8px;
    }

    #scr-open-post-modal,
    .button-chalk,
    .modal-post-btn,
    .submit-button {
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      background: #007aff !important;
      color: #fff !important;
      border: none !important;
      border-radius: 10px !important;
      font-weight: 600 !important;
      font-size: 1em !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
      cursor: pointer !important;
      z-index: 10001 !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
    #scr-open-post-modal {
      position: fixed !important;
      top: 16px !important;
      right: 16px !important;
      width: 52px !important;
      height: 52px !important;
      border-radius: 50% !important;
      padding: 0 !important;
      background: #007aff !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
      z-index: 10001 !important;
    }
    #scr-open-post-modal img {
      width: 32px !important;
      height: 32px !important;
      filter: none !important;
    }
  `;
  document.head.insertBefore(style, document.head.lastChild);

  // innerHTML描画直後に主要要素の存在を確認
  console.log(
    "[SCR] #scr-open-post-modal:",
    document.getElementById("scr-open-post-modal")
  );
  console.log(
    "[SCR] #scr-post-modal:",
    document.getElementById("scr-post-modal")
  );
  console.log(
    "[SCR] .scr-search-bar:",
    document.querySelector(".scr-search-bar")
  );

  // --- ユーザー情報の自動設定 ---
  function generateUserInfo() {
    // ランダムなユーザー名とIDを生成
    const adjectives = [
      "Happy",
      "Smart",
      "Creative",
      "Friendly",
      "Bright",
      "Clever",
      "Wise",
      "Kind",
      "Brave",
      "Calm",
      "Speaking",
      "InTheMorning",
      "Wanted!",
      "Whoo",
      "LoveMe",
      "LoveYou",
      "AoToNatsu",
      "Tenbyou",
      "Romanticism",
      "Soranji",
      "I'm",
      "Invincible",
      "Inferno",
      "On My MiND",
      "Lilac",
      "KUSUSHIKI",
      "breakfast",
      "Heaven",
      "Darling",
      "Bitter",
      "Vacances",
      "familie",
      "Carrying",
      "QueSeraSera",
      "Magic",
      "Heaven",
      "Lion",
      "OmochaNoHeitai",
      "ZesseiSeibutsu",
      "soFtdRink",
      "KujiraNoUta",
      "Ubu",
      "SamamaFestival!",
      "Oz",
      "JustAFriend",
      "FACTORY",
      "umbrella",
      "JOURNEY",
      "Attitude"
    ];
    const nouns = [
      "User",
      "Person",
      "Friend",
      "Student",
      "Learner",
      "Explorer",
      "Creator",
      "Thinker",
      "Dreamer",
      "Builder",
    ];

    // Secure random integer generator
    function secureRandomInt(min, max) {
      const range = max - min + 1;
      const maxUint32 = 0xffffffff;
      const rand = window.crypto.getRandomValues(new Uint32Array(1))[0];
      return min + Math.floor((rand / (maxUint32 + 1)) * range);
    }

    const numbers = secureRandomInt(1000, 10998); // 9999 + 1000 = 10999, but upper bound is exclusive
    const username = `${
      adjectives[secureRandomInt(0, adjectives.length - 1)]
    }${nouns[secureRandomInt(0, nouns.length - 1)]}`;
    const userid = `user_${numbers}`;

    return { username, userid };
  }

  function getUserInfo() {
    let username = localStorage.getItem("scr_username");
    let userid = localStorage.getItem("scr_userid");
    return { username, userid };
  }

  function setUserInfo(username, userid) {
    localStorage.setItem("scr_username", username);
    localStorage.setItem("scr_userid", userid);
  }

  async function ensureUserInfo() {
    let { username, userid } = getUserInfo();
    if (!username || !userid) {
      // 自動的にユーザー情報を生成
      const generated = generateUserInfo();
      setUserInfo(generated.username, generated.userid);
      console.log("[SCR] Auto-generated user info:", generated);
      return generated;
    }
    return { username, userid };
  }

  // ToasterMachine連携ボタンのイベント
  const toasterBtn = document.getElementById('scr-toaster-btn');
  const toasterToChatBtn = document.getElementById('scr-toaster-to-chat');
  const toasterStatus = document.getElementById('scr-toaster-status');
  let lastToasterResult = '';
  if (toasterBtn) {
    toasterBtn.onclick = async () => {
      const postdata = document.getElementById('postdata-modal')?.value || '';
      if (!postdata) {
        toasterStatus.textContent = '投稿内容を入力してください';
        return;
      }
      toasterStatus.textContent = 'AI生成中...';
      toasterBtn.disabled = true;
      try {
        // ToasterMachine API呼び出し
        const resp = await window.chatManager?.geminiProcessor?.callGemini_U?.(postdata) || 'ToasterMachine連携API未接続';
        lastToasterResult = resp;
        toasterStatus.textContent = '生成完了';
        toasterToChatBtn.style.display = '';
      } catch (e) {
        toasterStatus.textContent = 'エラー: ' + (e.message || e);
      } finally {
        toasterBtn.disabled = false;
      }
    };
  }
  if (toasterToChatBtn) {
    toasterToChatBtn.onclick = () => {
      if (lastToasterResult) {
        // chatアプリに転送
        localStorage.setItem('toastermachine_transfer', lastToasterResult);
        window.location.hash = '#chat';
        location.reload();
      }
    };
  }
}
