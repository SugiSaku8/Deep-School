import { GoogleAuthManager } from '../auth/auth.mjs';

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
  // Google認証マネージャーの初期化
  const authManager = new GoogleAuthManager();
  authManager.initialize();

  // Google認証後にメニューへ遷移するため、showMenuを上書き
  authManager.showMenu = function() {
    shell.loadApp('menu');
  };

  // SchoolIDログインボタンは無効化または非表示にしてもよい
  document.getElementById('school_login_btn').onclick = () => {
    alert('Googleログインをご利用ください。');
  };
} 