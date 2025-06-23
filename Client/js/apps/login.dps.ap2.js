import { GoogleAuthManager, AuthServer } from '../auth/auth.mjs';

export const appMeta = {
  name: "login",
  title: "ログイン",
  icon: "re/ico/login.svg"
};

export const appHtml = `
  <div id="login-app" class="container_top">
    <h1 class="title chalk-text" id="itisttitle">Deep-School</h1>
    <div class="login-form popup" id="loginForm">
      <form>
        <label for="schoolId" class="chalk-text">学校ID</label>
        <input type="text" id="schoolId" placeholder="学校ID" />
        <button type="button" class="submit-button button-chalk" id="school_login_btn">ログイン</button>
        <p>学校IDは、pL:2^4,5,101 のような形式の文字列です。</p>
      </form>
    </div>
    <div id="openLoginButton" class="login-button button-chalk"></div>
    <p class="copyright chalk-text">(c) 2022-2025 Carnation Studio v0.0.2</p>
  </div>
`;

export function appInit(shell) {
  // 1. Google認証マネージャーの初期化
  const authManager = new GoogleAuthManager();
  authManager.initialize();

  // 2. Google認証後にSchoolIDフォームを表示する
  authManager.showMenu = function() {
    // Google認証が終わったらSchoolIDフォームを表示
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('openLoginButton').style.display = 'none';
    // Google認証済みの印をwindowなどにセットしてもよい
  };

  // 3. SchoolIDログインボタンのクリックイベント
  document.getElementById('school_login_btn').onclick = async () => {
    const schoolId = document.getElementById('schoolId').value;
    if (!schoolId) {
      alert('学校IDを入力してください');
      return;
    }
    const authServer = new AuthServer(schoolId);
    // サーバー接続テスト
    const ok = await authServer.TestFetch(authServer.url, false);
    if (ok) {
      shell.loadApp('menu');
    } else {
      alert('ログインに失敗しました。学校IDまたはネットワークを確認してください。');
    }
  };
} 