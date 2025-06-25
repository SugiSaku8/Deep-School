import { SimpleAuthManager, SchoolAuthServer } from '../auth/auth.mjs';

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
  console.log("LoginApp: 初期化開始");
  
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