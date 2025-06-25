import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from '../core/config.js';
import { enforceSecureConnectionAndLogout } from '../core/security.js';

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Google認証を管理するクラス
 */
export class GoogleAuthManager {
  /**
   * コンストラクタ
   */
  constructor(buttonContainerId, onAuthSuccess) {
    this.tokenClient = null;
    this.accessToken = null;
    this.tokenTimestamp = null;
    this.TOKEN_VALIDITY_MS = 104 * 24 * 60 * 60 * 1000; // 104日
    this.initialized = false;
    this.buttonContainerId = buttonContainerId;
    this.onAuthSuccess = onAuthSuccess;
  }

  /**
   * 認証の初期化処理を行う
   * @returns {Promise<void>}
   */
  async initialize() {
    enforceSecureConnectionAndLogout();
    try {
      console.log("Initializing auth manager...");

      // Google APIの読み込みを待機
      await this.waitForGoogleAPI();

      // 既存のトークンを確認
      const isLoggedIn = await this.checkExistingTokens();
      if (isLoggedIn) {
        console.log("既存のトークンでログイン済み");
        return;
      }

      // Googleログインボタンの初期化
      console.log("Googleログインボタンを初期化中...");
      await this.initializeGoogleLogin();
      console.log("Google認証の初期化が完了しました");
    } catch (error) {
      console.error("認証の初期化に失敗しました:", error);
      this.showLoginForm();
    }
  }

  async waitForGoogleAPI() {
    return new Promise((resolve) => {
      if (window.google) {
        console.log("Google API already loaded");
        resolve();
      } else {
        console.log("Waiting for Google API to load...");
        const checkGoogleAPI = setInterval(() => {
          if (window.google) {
            clearInterval(checkGoogleAPI);
            console.log("Google API loaded");
            resolve();
          }
        }, 100);

        // タイムアウト処理
        setTimeout(() => {
          clearInterval(checkGoogleAPI);
          console.error("Google API loading timeout");
          resolve();
        }, 10000);
      }
    });
  }

  async checkExistingTokens() {
    // Googleトークンの確認
    const savedToken = localStorage.getItem("google_access_token");
    const savedTimestamp = localStorage.getItem("google_token_timestamp");

    if (savedToken && savedTimestamp) {
      const now = Date.now();
      const tokenAge = now - Number(savedTimestamp);
      if (tokenAge < this.TOKEN_VALIDITY_MS) {
        this.accessToken = savedToken;
        this.tokenTimestamp = Number(savedTimestamp);
        console.log("Valid Google token found");
        this.showMenu();
        return true;
      } else {
        localStorage.removeItem("google_access_token");
        localStorage.removeItem("google_token_timestamp");
        console.log("Google token expired");
      }
    }

    // SchoolIDトークンの確認
    const dsToken = localStorage.getItem("ds_id");
    const dsTimestamp = localStorage.getItem("ds_id_timestamp");

    if (dsToken && dsTimestamp) {
      const now = Date.now();
      const tokenAge = now - Number(dsTimestamp);
      if (tokenAge < this.TOKEN_VALIDITY_MS) {
        console.log("Valid school token found");
        this.showMenu();
        return true;
      } else {
        localStorage.removeItem("ds_id");
        localStorage.removeItem("ds_id_timestamp");
        console.log("School token expired");
      }
    }

    return false;
  }

  async initializeGoogleLogin() {
    if (!window.google) {
      console.error("Google API not loaded");
      return;
    }

    try {
      console.log("Google Identity Servicesを初期化中...");
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => this.handleCredentialResponse(response),
        ux_mode: 'popup',
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
      });
      console.log("Google login initialized for popup mode");

      const buttonContainer = document.getElementById(this.buttonContainerId);
      if (!buttonContainer) {
        console.error("Login button container not found:", this.buttonContainerId);
        return;
      }

      console.log("Google認証ボタンをレンダリング中...");
      google.accounts.id.renderButton(buttonContainer, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with_google",
        shape: "rectangular",
        locale: "ja",
        width: 250,
      });
      console.log("Google login button rendered");

      this.showGoogleLogin();
    } catch (error) {
      console.error("Error initializing Google login:", error);
      this.showLoginForm();
    }
  }

  /**
   * Google認証レスポンスのハンドリング
   * @param {Object} response Google認証レスポンス
   * @returns {Promise<void>}
   */
  async handleCredentialResponse(response) {
    console.log("認証トークンを受信:", response.credential);
    try {
      const jwt = decodeURIComponent(
        escape(window.atob(response.credential.split(".")[1]))
      );
      const payload = JSON.parse(jwt);
      window.googleUserName = payload.name;
      window.googleUserId = payload.sub;
      console.log("Google ユーザー名:", window.googleUserName);
      console.log("Google ユーザーID:", window.googleUserId);

      // Google Drive APIの認証を実行
      console.log("Google Drive APIの認証を開始...");
      await this.initializeGoogleDriveAuth();
      console.log("Google Drive APIの認証が完了しました");

      // 認証成功後の処理
      console.log("認証成功後の処理を実行中...");
      if(this.onAuthSuccess) {
        console.log("onAuthSuccessコールバックを実行");
        this.onAuthSuccess();
      } else {
        // フォールバック: 直接メニューを表示
        console.log("フォールバック: 直接メニューを表示");
        this.showMenu();
      }
    } catch (error) {
      console.error("Google認証エラー:", error);
      this.showLoginForm();
    }
  }

  /**
   * Google Drive API用の認証初期化
   * @returns {Promise<void>}
   */
  async initializeGoogleDriveAuth() {
    try {
      const tokenResponse = await new Promise((resolve, reject) => {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: GOOGLE_SCOPES.join(" "),
          callback: (response) => {
            if (response.error) {
              reject(response);
            } else {
              resolve(response);
            }
          },
        });
        this.tokenClient.requestAccessToken();
      });

      this.accessToken = tokenResponse.access_token;
      this.tokenTimestamp = Date.now();
      localStorage.setItem("google_access_token", this.accessToken);
      localStorage.setItem(
        "google_token_timestamp",
        this.tokenTimestamp.toString()
      );
      console.log("Google Drive APIのアクセストークンを取得しました");
    } catch (error) {
      console.error("Google Drive APIの認証に失敗しました:", error);
      throw error;
    }
  }

  showLoginForm() {
    const loginFormElement = document.getElementById("loginForm");
    const openLoginButtonElement = document.getElementById("openLoginButton");
    const menuElement = document.getElementById("menu");
    
    if (loginFormElement) {
      loginFormElement.style.display = "block";
    }
    if (openLoginButtonElement) {
      openLoginButtonElement.style.display = "none";
    }
    if (menuElement) {
      menuElement.style.display = "none";
    }
  }

  showGoogleLogin() {
    const loginFormElement = document.getElementById("loginForm");
    const openLoginButtonElement = document.getElementById("openLoginButton");
    const menuElement = document.getElementById("menu");
    
    if (loginFormElement) {
      loginFormElement.style.display = "none";
    }
    if (openLoginButtonElement) {
      openLoginButtonElement.style.display = "block";
    }
    if (menuElement) {
      menuElement.style.display = "none";
    }
  }

  showMenu() {
    const loginElement = document.getElementById("login");
    const menuElement = document.getElementById("menu");
    
    if (loginElement) {
      loginElement.style.display = "none";
    }
    if (menuElement) {
      menuElement.style.display = "block";
    }
  }
}

/**
 * Google Driveの操作を管理するクラス
 */
class GoogleDriveManager {
  /**
   * @param {GoogleAuthManager} authManager Google認証マネージャー
   */
  constructor(authManager) {
    this.authManager = authManager;
  }

  /**
   * アプリケーションデータをGoogle Driveに保存する
   * @param {string} fileName ファイル名
   * @param {Object} data 保存するデータ
   * @returns {Promise<Object>} 保存結果
   * @throws {Error} アクセストークンがない場合や保存失敗時
   */
  async saveAppData(fileName, data) {
    if (!this.authManager.accessToken) {
      throw new Error(
        "アクセストークンがありません。先にログインしてください。"
      );
    }

    const metadata = {
      name: fileName,
      parents: ["appDataFolder"],
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append(
      "file",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    try {
      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.authManager.accessToken}`,
          },
          body: form,
        }
      );

      const result = await response.json();
      console.log("ファイルを保存しました:", result);
      return result;
    } catch (error) {
      console.error("ファイルの保存に失敗しました:", error);
      throw error;
    }
  }

  /**
   * Google Driveからアプリケーションデータを読み込む
   * @param {string} fileName ファイル名
   * @returns {Promise<Object>} 読み込んだデータ
   * @throws {Error} アクセストークンがない場合や読み込み失敗時
   */
  async loadAppData(fileName) {
    if (!this.authManager.accessToken) {
      throw new Error(
        "アクセストークンがありません。先にログインしてください。"
      );
    }

    try {
      // ファイルの検索
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${fileName}'`,
        {
          headers: {
            Authorization: `Bearer ${this.authManager.accessToken}`,
          },
        }
      );

      const searchResult = await searchResponse.json();
      if (!searchResult.files || searchResult.files.length === 0) {
        throw new Error("ファイルが見つかりません");
      }

      // ファイルの内容を取得
      const fileId = searchResult.files[0].id;
      const downloadResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${this.authManager.accessToken}`,
          },
        }
      );

      const data = await downloadResponse.json();
      console.log("ファイルを読み込みました:", data);
      return data;
    } catch (error) {
      console.error("ファイルの読み込みに失敗しました:", error);
      throw error;
    }
  }
}

/**
 * UIの操作を管理するクラス
 */
class KOREGAUIManagerDAZE {
  /**
   * コンストラクタ
   */
  constructor() {
    // DOM要素の存在チェックを追加
    this.initializeEventListeners();
  }

  /**
   * UIイベントリスナーの初期化
   */
  initializeEventListeners() {
    const menuElement = document.getElementById("menu");
    const loginFormElement = document.getElementById("loginForm");
    
    if (menuElement) {
      menuElement.style.display = "none";
    }
    
    if (loginFormElement) {
      loginFormElement.style.display = "none";
    }
  }
}

export class AuthServer {
  constructor(schoolId) {
    const p = new URL(location.href);
    this.url = `${p.protocol}//${p.host}/api/auth?schoolId=${schoolId}`;
    this.schoolId = schoolId;
  }

  async TestFetch(url, isJson) {
    try {
      const res = await fetch(url);
      if (isJson) {
        return await res.json();
      }
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async callTest() {
    try {
      const result = await this.TestFetch(this.url, false);
      console.log("Auth server test result:", result);
      return result;
    } catch (error) {
      console.error("Auth server test failed:", error);
      return false;
    }
  }
}

// アプリケーションの初期化
export function initializeApp() {
  console.log("初期化中.................");
  
  // 既に初期化されている場合はスキップ
  if (window.authManagerInitialized) {
    console.log("認証マネージャーは既に初期化されています");
    return;
  }
  
  const authManager = new GoogleAuthManager('openLoginButton', () => {
    console.log("Google認証成功");
  });
  authManager.initialize();
  const driveManager = new GoogleDriveManager(authManager);
  
  // グローバルにアクセス可能にする
  window.driveManager = driveManager;
  window.authManagerInitialized = true;
  
  const uiManager = new KOREGAUIManagerDAZE();

  const schoolLoginBtn = document.getElementById("school_login_btn");
  if (schoolLoginBtn) {
    schoolLoginBtn.addEventListener("click", async () => {
      const schoolIdInput = document.getElementById("schoolId");
      const schoolId = schoolIdInput ? schoolIdInput.value : "";
      const schoolId_query = new URLSearchParams(window.location.search).get(
        "schoolId"
      );

      if (!schoolId && !schoolId_query) {
        const result = window.confirm(
          "学校IDを入力していません。\n学校に接続せず利用しますか？"
        );
        if (result) {
          const loginElement = document.getElementById("login");
          const scrMenuIconElement = document.getElementById("scr_menu_icon");
          const backiconElement = document.getElementById("backicon");
          const menuElement = document.getElementById("menu");
          
          if (loginElement) loginElement.style.display = "none";
          if (scrMenuIconElement) scrMenuIconElement.style.display = "none";
          if (backiconElement) backiconElement.style.display = "block";
          if (menuElement) menuElement.style.display = "block";
        }
        return;
      }

      const serverUrl = schoolId || schoolId_query;
      const stuth = new AuthServer(serverUrl);
      await stuth.callTest();
      
      // loadFeed関数が定義されている場合のみ実行
      if (typeof window.loadFeed === 'function') {
        await window.loadFeed();
      }
      
      window.scr_url = stuth.url;
      console.log("SCRのURLを設定しました。");
      
      const menuElement = document.getElementById("menu");
      if (menuElement) {
        menuElement.style.display = "block";
        menuElement.style.display = "flex";
      }
    });
  }
}

window.loadData = async function () {
  try {
    if (window.driveManager) {
      const data = await window.driveManager.loadAppData("deep-school-user-data.json");
      console.log("データを読み込みました");
      return data;
    } else {
      console.log("DriveManagerが初期化されていません");
      return null;
    }
  } catch (error) {
    console.log("データの読み込みに失敗しました:", error);
    return null;
  }
};
