import { SimpleAuthManager, SchoolAuthServer } from '../auth/auth.mjs';

export const appMeta = {
  name: "login",
  title: "ログイン",
  icon: "re/ico/login.svg"
};

export function appInit(shell) {
  shell.log({from: 'dp.app.login.out', message: 'LoginApp: 初期化開始', level: 'info'});

  // HTMLを#app-rootに描画
  const root = document.getElementById('app-root');
  if (!root) {
    shell.log({from: 'dp.app.login.err', message: 'LoginApp: #app-rootが見つかりません', level: 'error'});
    return;
  }
  // グローバル戻るボタン

  root.innerHTML = `
    <div class="container_top" id="login-app">
      <div class="login-content">
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
          <button id="demo-login-btn" class="login-button button-chalk" style="margin-top: 12px;">デモ</button>
        </div>
      </div>
      <div class="copyright-container">
        <p class="copyright chalk-text" data-lang-key="copyright">(c) 2022-2025 Carnation Studio v0.4.1 25C1250X1</p> 
      </div>
    </div>
  
  <style>
  /* Enhanced login styles with parallax effects */
  .container_top {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
  
  .container_top::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.3;
  }
  

  
  .login-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    position: relative;
    z-index: 1;
  }
  
  .title {
    font-size: 3.5rem;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
    animation: titleGlow 3s ease-in-out infinite alternate;
  }
  
  @keyframes titleGlow {
    0% { text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5); }
    100% { text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 255, 255, 0.8); }
  }
  
  .login-form {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 2rem;
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    max-width: 400px;
    width: 100%;
  }
  
  .login-form:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  .login-form-inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .login-form label {
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .login-form input {
    padding: 12px 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 1rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }
  
  .login-form input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .login-form input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
    transform: scale(1.02);
  }
  
  .submit-button {
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
  }
  
  .submit-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  .submit-button:hover::before {
    left: 100%;
  }
  
  .submit-button:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  }
  
  .submit-button:active {
    transform: translateY(-1px) scale(1.02);
  }
  
  .login-button {
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    backdrop-filter: blur(10px);
  }
  
  .login-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  .copyright-container {
    position: relative;
    z-index: 1;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .copyright {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    margin: 0;
    padding: 0;
  }
  
  /* Dark mode adjustments */
  @media (prefers-color-scheme: dark) {
    .login-form {
      background: rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.1);
    }
    
    .login-form:hover {
      background: rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    .copyright-container {
      background: rgba(0, 0, 0, 0.3);
    }
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .login-content {
      padding: 1rem;
      justify-content: flex-start;
      padding-top: 3rem;
    }
    
    .title {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
    }
    
    .login-form {
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    
    .copyright-container {
      padding: 0.75rem;
      margin-top: auto;
    }
    
    .copyright {
      font-size: 0.8rem;
    }
  }
  
  @media (max-width: 480px) {
    .title {
      font-size: 2rem;
    }
    
    .login-form {
      padding: 1rem;
    }
    
    .login-form-inner {
      gap: 0.75rem;
    }
    
    .submit-button,
    .login-button {
      padding: 14px 0;
      font-size: 1.15rem;
      width: 90%;
      min-width: 180px;
      min-height: 48px;
      max-width: 100%;
      margin: 0 auto 0.5rem auto;
      display: block;
      border-radius: 14px;
    }
  }
  </style>
`;

  // Google認証マネージャーの初期化
  const authManager = new SimpleAuthManager('openLoginButton', () => {
    shell.log({from: 'dp.app.login.out', message: 'LoginApp: Google認証成功、メニューに遷移', level: 'info'});
    shell.loadApp('menu');
  });

  // 認証マネージャーの初期化
  authManager.initialize().catch(error => {
    shell.log({from: 'dp.app.login.err', message: 'LoginApp: 認証マネージャー初期化エラー ' + error, level: 'error'});
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
      shell.log({from: 'dp.app.login.in', message: `LoginApp: 学校ID "${schoolId}" でログイン試行`, level: 'info'});
      try {
        // SCRサーバーURL入力欄を追加
        const scrUrlDefault = window.isDemoUser ? 'https://deep-school.onrender.com' : (localStorage.getItem('scr_url') || '');
        const safeScrUrlDefault = escapeHTML(scrUrlDefault);
        const scrUrlInputHtml = `<div class="form-group"><label for="scr_url_input">SCRサーバーURL</label><input type="text" id="scr_url_input" value="${safeScrUrlDefault}" placeholder="https://deep-school.onrender.com" /></div>`;
        const loginForm = document.getElementById('loginForm');
        if (loginForm && !document.getElementById('scr_url_input')) {
          loginForm.insertAdjacentHTML('beforeend', scrUrlInputHtml);
        }
        if (window.isDemoUser) {
          setTimeout(() => {
            const scrInput = document.getElementById('scr_url_input');
            if (scrInput) scrInput.value = 'https://deep-school.onrender.com';
          }, 100);
        }
        const scrInput = document.getElementById('scr_url_input');
        const scrUrl = scrInput ? scrInput.value.trim() : '';
        if (scrUrl) {
          localStorage.setItem('scr_url', scrUrl);
          window.scr_url = scrUrl;
        }
        // 学校認証サーバーのテスト
        const authServer = new SchoolAuthServer(schoolId);
        const connectionResult = await authServer.testConnection();
        if (connectionResult) {
          shell.log({from: 'dp.app.login.out', message: 'LoginApp: 学校認証サーバー接続成功', level: 'info'});
          window.scr_url = authServer.url;
          localStorage.setItem('scr_url', authServer.url);
          // loadFeed関数が定義されている場合のみ実行
          if (typeof window.loadFeed === 'function') {
            await window.loadFeed();
          }
        } else {
          shell.log({from: 'dp.app.login.err', message: 'LoginApp: 学校認証サーバー接続失敗', level: 'warn'});
        }
        // メニューに遷移
        shell.loadApp('menu');
      } catch (error) {
        shell.log({from: 'dp.app.login.err', message: 'LoginApp: 学校IDログインエラー ' + error, level: 'error'});
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

  // Initialize parallax effects for login elements
  if (window.parallaxManager) {
    const loginForm = document.getElementById('loginForm');
    const submitButton = document.getElementById('school_login_btn');
    const openLoginButton = document.getElementById('openLoginButton');
    const schoolIdInput = document.getElementById('schoolId');
    
    if (loginForm) {
      window.parallaxManager.addParallaxEffects(loginForm, {
        hover: true,
        mouse: true,
        touch: false
      });
    }
    
    if (submitButton) {
      window.parallaxManager.addParallaxEffects(submitButton, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: true
      });
    }
    
    if (openLoginButton) {
      window.parallaxManager.addParallaxEffects(openLoginButton, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: true
      });
    }
    
    if (schoolIdInput) {
      window.parallaxManager.addParallaxEffects(schoolIdInput, {
        hover: true,
        mouse: false,
        touch: false
      });
    }
    
    shell.log({from: 'dp.app.login.out', message: 'LoginApp: Parallax effects initialized', level: 'info'});
  }

  // デモユーザーログインボタンの設定
  const demoLoginBtn = document.getElementById('demo-login-btn');
  if (demoLoginBtn) {
    demoLoginBtn.onclick = () => {
      // ランダムな単語リスト（安全な英単語）
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
      "Attitude",
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
    const now = Date.now();
    const usercommon = `${adjectives[secureRandomInt(0, adjectives.length - 1)]}${
      nouns[secureRandomInt(0, nouns.length - 1)]
    }`;
      window.googleUserId = `${now}.${usercommon}.demo_user`;
      window.googleUserName = 'Demo_USER';
      window.isDemoUser = true;
      // メニューに遷移
      shell.log({from: 'dp.app.login.out', message: 'LoginApp: デモユーザーでログイン', level: 'info'});
      shell.loadApp('menu');
    };
  }

  shell.log({from: 'dp.app.login.out', message: 'LoginApp: 初期化完了', level: 'info'});
}

function escapeHTML(str) {
  return String(str).replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
} 