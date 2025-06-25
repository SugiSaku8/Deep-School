import { SimpleAuthManager, SchoolAuthServer } from '../auth/auth.mjs';

export const appMeta = {
  name: "login",
  title: "ログイン",
  icon: "re/ico/login.svg"
};

export function appInit(shell) {
  console.log("LoginApp: 初期化開始");

  // HTMLを#app-rootに描画
  const root = document.getElementById('app-root');
  if (!root) {
    console.error('LoginApp: #app-rootが見つかりません');
    return;
  }
  root.innerHTML = `
    <div class="container_top" id="login-app">
      <h1 class="title chalk-text" id="itisttitle">Deep-School</h1>
      <div class="login-form popup" id="loginForm">
        <div class="login-form-inner">
          <label for="schoolId" class="chalk-text" data-lang-key="school_id">学校ID</label>
          <input type="text" id="schoolId" placeholder="学校ID" data-lang-key="school_id_placeholder" />
          <button type="button" class="submit-button button-chalk" id="school_login_btn" data-lang-key="login_button">ログイン</button>
          <p data-lang-key="login_id_hint">学校IDは、pL:2^4,5,101 のような形式の文字列です。</p>
        </div>
      </div>
      <div id="google-signin-container">
        <div id="openLoginButton" class="login-button button-chalk"></div>
      </div>
      <p class="copyright chalk-text" data-lang-key="copyright">(c) 2022-2025 Carnation Studio v0.1.1</p>
    </div>
  `;

  // Google認証マネージャーの初期化
  const authManager = new SimpleAuthManager('openLoginButton', () => {
    console.log("LoginApp: Google認証成功、メニューに遷移");
    shell.loadApp('menu');
  });

  // 認証マネージャーの初期化
  authManager.initialize().catch(error => {
    console.error("LoginApp: 認証マネージャー初期化エラー", error);
  });

  // 学校IDログインボタンの設定
  const loginButton = document.getElementById('school_login_btn');
  if (loginButton) {
    loginButton.onclick = async () => {
      const schoolIdInput = document.getElementById('schoolId');
      const schoolId = schoolIdInput ? schoolIdInput.value : "";
      if (!schoolId) {
        alert('学校IDを入力してください');
        return;
      }
      console.log(`LoginApp: 学校ID "${schoolId}" でログイン試行`);
      try {
        // 学校認証サーバーのテスト
        const authServer = new SchoolAuthServer(schoolId);
        const connectionResult = await authServer.testConnection();
        if (connectionResult) {
          console.log("LoginApp: 学校認証サーバー接続成功");
          window.scr_url = authServer.url;
          // loadFeed関数が定義されている場合のみ実行
          if (typeof window.loadFeed === 'function') {
            await window.loadFeed();
          }
        } else {
          console.log("LoginApp: 学校認証サーバー接続失敗");
        }
        // メニューに遷移
        shell.loadApp('menu');
      } catch (error) {
        console.error("LoginApp: 学校IDログインエラー", error);
        alert('ログインに失敗しました');
      }
    };
  }

  // グローバル関数の設定
  window.showLoginForm = () => {
    const loginFormElement = document.getElementById('loginForm');
    const openLoginButtonElement = document.getElementById('openLoginButton');
    if (loginFormElement) {
      loginFormElement.style.display = 'block';
    }
    if (openLoginButtonElement) {
      openLoginButtonElement.style.display = 'none';
    }
  };

  console.log("LoginApp: 初期化完了");
} 