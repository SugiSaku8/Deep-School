import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from '../core/config.js';

/**
 * シンプルなGoogle認証マネージャー
 */
export class SimpleAuthManager {
  constructor(buttonContainerId, onAuthSuccess) {
    this.buttonContainerId = buttonContainerId;
    this.onAuthSuccess = onAuthSuccess;
    this.accessToken = null;
    this.tokenTimestamp = null;
    this.TOKEN_VALIDITY_MS = 104 * 24 * 60 * 60 * 1000; // 104日
  }

  /**
   * 認証の初期化
   */
  async initialize() {
    try {
      console.log("SimpleAuthManager: 初期化開始");
      
      // 既存のトークンを確認
      if (await this.checkExistingTokens()) {
        console.log("SimpleAuthManager: 既存のトークンでログイン済み");
        // 既存のトークンがある場合も認証成功コールバックを実行
        if (this.onAuthSuccess) {
          console.log("SimpleAuthManager: 既存トークンで認証成功コールバック実行");
          this.onAuthSuccess();
        }
        return;
      }

      // Google APIの読み込みを待機
      await this.waitForGoogleAPI();
      
      // Google認証ボタンの初期化
      await this.initializeGoogleLogin();
      
      console.log("SimpleAuthManager: 初期化完了");
    } catch (error) {
      console.error("SimpleAuthManager: 初期化エラー", error);
    }
  }

  /**
   * Google APIの読み込みを待機
   */
  async waitForGoogleAPI() {
    return new Promise((resolve) => {
      if (window.google) {
        console.log("SimpleAuthManager: Google API already loaded");
        resolve();
      } else {
        console.log("SimpleAuthManager: Waiting for Google API...");
        const checkGoogleAPI = setInterval(() => {
          if (window.google) {
            clearInterval(checkGoogleAPI);
            console.log("SimpleAuthManager: Google API loaded");
            resolve();
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkGoogleAPI);
          console.error("SimpleAuthManager: Google API loading timeout");
          resolve();
        }, 10000);
      }
    });
  }

  /**
   * 既存のトークンを確認
   */
  async checkExistingTokens() {
    const savedToken = localStorage.getItem("google_access_token");
    const savedTimestamp = localStorage.getItem("google_token_timestamp");

    if (savedToken && savedTimestamp) {
      const now = Date.now();
      const tokenAge = now - Number(savedTimestamp);
      if (tokenAge < this.TOKEN_VALIDITY_MS) {
        this.accessToken = savedToken;
        this.tokenTimestamp = Number(savedTimestamp);
        console.log("SimpleAuthManager: Valid token found");
        return true;
      } else {
        localStorage.removeItem("google_access_token");
        localStorage.removeItem("google_token_timestamp");
        console.log("SimpleAuthManager: Token expired");
      }
    }

    return false;
  }

  /**
   * Google認証ボタンの初期化
   */
  async initializeGoogleLogin() {
    if (!window.google) {
      console.error("SimpleAuthManager: Google API not loaded");
      return;
    }

    try {
      console.log("SimpleAuthManager: Google Identity Services初期化");
      
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => this.handleCredentialResponse(response),
        ux_mode: 'popup',
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
      });

      const buttonContainer = document.getElementById(this.buttonContainerId);
      if (!buttonContainer) {
        console.error("SimpleAuthManager: Button container not found:", this.buttonContainerId);
        return;
      }

      google.accounts.id.renderButton(buttonContainer, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with_google",
        shape: "rectangular",
        locale: "ja",
        width: 250,
      });

      console.log("SimpleAuthManager: Google login button rendered");
    } catch (error) {
      console.error("SimpleAuthManager: Google login initialization error", error);
    }
  }

  /**
   * Google認証レスポンスの処理
   */
  async handleCredentialResponse(response) {
    console.log("SimpleAuthManager: 認証トークンを受信");
    
    try {
      // JWTトークンをデコード
      const jwt = decodeURIComponent(
        escape(window.atob(response.credential.split(".")[1]))
      );
      const payload = JSON.parse(jwt);
      
      // ユーザー情報を保存
      window.googleUserName = payload.name;
      window.googleUserId = payload.sub;
      
      console.log("SimpleAuthManager: ユーザー情報", {
        name: window.googleUserName,
        id: window.googleUserId
      });

      // Google Drive APIの認証
      await this.initializeGoogleDriveAuth();
      
      // 認証成功コールバック
      if (this.onAuthSuccess) {
        console.log("SimpleAuthManager: 認証成功コールバック実行");
        this.onAuthSuccess();
      }
      
    } catch (error) {
      console.error("SimpleAuthManager: 認証エラー", error);
    }
  }

  /**
   * Google Drive API認証
   */
  async initializeGoogleDriveAuth() {
    try {
      console.log("SimpleAuthManager: Google Drive API認証開始");
      
      const tokenResponse = await new Promise((resolve, reject) => {
        const tokenClient = google.accounts.oauth2.initTokenClient({
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
        tokenClient.requestAccessToken();
      });

      this.accessToken = tokenResponse.access_token;
      this.tokenTimestamp = Date.now();
      
      localStorage.setItem("google_access_token", this.accessToken);
      localStorage.setItem("google_token_timestamp", this.tokenTimestamp.toString());
      
      console.log("SimpleAuthManager: Google Drive API認証完了");
    } catch (error) {
      console.error("SimpleAuthManager: Google Drive API認証エラー", error);
      throw error;
    }
  }

  /**
   * ログアウト
   */
  logout() {
    localStorage.removeItem("google_access_token");
    localStorage.removeItem("google_token_timestamp");
    this.accessToken = null;
    this.tokenTimestamp = null;
    console.log("SimpleAuthManager: ログアウト完了");
  }
}

/**
 * 学校ID認証サーバー
 */
export class SchoolAuthServer {
  constructor(schoolId) {
    const p = new URL(location.href);
    this.url = `${p.protocol}//${p.host}/api/auth?schoolId=${schoolId}`;
    this.schoolId = schoolId;
  }

  async testConnection() {
    try {
      const response = await fetch(this.url);
      const result = response.ok;
      console.log("SchoolAuthServer: 接続テスト結果", result);
      return result;
    } catch (error) {
      console.error("SchoolAuthServer: 接続テストエラー", error);
      return false;
    }
  }
}

/**
 * グローバル関数
 */
window.loadData = async function () {
  try {
    console.log("loadData: データ読み込み開始");
    // 実装は後で追加
    return null;
  } catch (error) {
    console.error("loadData: エラー", error);
    return null;
  }
};
