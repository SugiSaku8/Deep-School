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
  const authManager = new GoogleAuthManager('openLoginButton', () => {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('openLoginButton').style.display = 'none';
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
      const authServer = new AuthServer(schoolId);
      const ok = await authServer.TestFetch(authServer.url, false);
      if (ok) {
        shell.loadApp('menu');
      } else {
        alert('ログインに失敗しました。学校IDまたはネットワークを確認してください。');
      }
    };
  }
  
  window.showLoginForm = () => {
      document.getElementById('loginForm').style.display = 'block';
      document.getElementById('openLoginButton').style.display = 'none';
  }
} 