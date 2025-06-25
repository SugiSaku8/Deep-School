import { GoogleAuthManager, AuthServer, initializeApp } from '../auth/auth.mjs';

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
  // アプリケーション全体の初期化
  initializeApp();
  
  const authManager = new GoogleAuthManager('openLoginButton', () => {
    // Google認証成功後はメニューを表示
    shell.loadApp('menu');
  });
  authManager.initialize();

  const loginButton = document.getElementById('school_login_btn');
  if (loginButton) {
    loginButton.onclick = async () => {
      const schoolId = document.getElementById('schoolId').value;
      if (!schoolId) {
        alert('学校IDを入力してください');
        return;
      }
      console.log(`学校ID "${schoolId}" でログイン試行（認証スキップ）`);
      shell.loadApp('menu');
    };
  }
  
  window.showLoginForm = () => {
      document.getElementById('loginForm').style.display = 'block';
      document.getElementById('openLoginButton').style.display = 'none';
  }
} 