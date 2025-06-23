export const appMeta = {
  name: "scr",
  title: "SCR",
  icon: "re/ico/SCR.png"
};

export const appHtml = `
  <div id="scr-app" class="popup">
    <button class="go-back-button button-chalk" id="scr-back">←</button>
    <button class="auto-btn button-chalk" id="scr-new">New</button>
    <button class="auto-btn button-chalk" id="scr-search-open">Search</button>
    <div id="scr-search-window" class="popup" style="display:none; max-width: 500px; margin: 30px auto 0 auto; background: #173c2b; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.12); padding: 24px 20px 16px 20px;">
      <span class="batsu" id="scr-search-close"></span>
      <div class="scr-form-group">
        <label for="scr-search-input" class="chalk-text">キーワード検索</label>
        <input type="text" id="scr-search-input" placeholder="キーワードを入力" style="width: 80%; max-width: 300px;" />
      </div>
      <button class="auto-btn button-chalk" id="scr-search-btn">検索</button>
      <div id="scr-search-result" style="margin-top: 18px;"></div>
    </div>
    <div id="post-form" class="popup" style="display: none; max-width: 400px; margin: 0 auto;">
      <span class="batsu" id="scr-post-close"></span>
      <div class="scr-form-card">
        <div class="scr-form-group">
          <label for="postname" class="chalk-text">タイトル</label>
          <input type="text" id="postname" placeholder="タイトル" required />
        </div>
        <div class="scr-form-group">
          <label for="postdata" class="chalk-text">内容</label>
          <textarea id="postdata" placeholder="内容を入力" required></textarea>
        </div>
        <button id="post-button" class="auto-btn">ポストする</button>
      </div>
    </div>
    <div id="feed">
      <div id="feed-content"></div>
    </div>
  </div>
`;

export function appInit(shell) {
  document.getElementById('scr-back').onclick = () => shell.loadApp('menu');
  document.getElementById('scr-search-open').onclick = () => {
    document.getElementById('scr-search-window').style.display = 'block';
  };
  document.getElementById('scr-search-close').onclick = () => {
    document.getElementById('scr-search-window').style.display = 'none';
  };
  document.getElementById('scr-new').onclick = () => {
    document.getElementById('post-form').style.display = 'block';
  };
  document.getElementById('scr-post-close').onclick = () => {
    document.getElementById('post-form').style.display = 'none';
  };
  document.getElementById('post-button').onclick = () => {
    // 投稿処理のダミー
    alert('投稿しました（ダミー）');
    document.getElementById('post-form').style.display = 'none';
  };
} 