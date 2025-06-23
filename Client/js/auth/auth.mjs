import loadFeed from "./scr.client.mjs";
import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from './config.js';

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Google認証を管理するクラス
 */
class GoogleAuthManager {
  /**
   * コンストラクタ
   */
  constructor() {
    this.tokenClient = null;
    this.accessToken = null;
    this.tokenTimestamp = null;
    this.TOKEN_VALIDITY_MS = 104 * 24 * 60 * 60 * 1000; // 104日
    this.initialized = false;
  }

  /**
   * 認証の初期化処理を行う
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      console.log("Initializing auth manager...");

      // Google APIの読み込みを待機
      await this.waitForGoogleAPI();

      // 既存のトークンを確認
      const isLoggedIn = await this.checkExistingTokens();
      if (isLoggedIn) {
        return;
      }

      // Googleログインボタンの初期化
      await this.initializeGoogleLogin();
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
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => this.handleCredentialResponse(response),
        auto_select: false,
        cancel_on_tap_outside: false,
        context: "signin",
      });
      console.log("Google login initialized");

      const buttonContainer = document.getElementById("openLoginButton");
      if (!buttonContainer) {
        console.error("Login button container not found");
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
      await this.initializeGoogleDriveAuth();

      this.showMenu();
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
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("openLoginButton").style.display = "none";
    document.getElementById("menu").style.display = "none";
  }

  showGoogleLogin() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("openLoginButton").style.display = "block";
    document.getElementById("menu").style.display = "none";
  }

  showMenu() {
    document.getElementById("login").style.display = "none";
    document.getElementById("menu").style.display = "block";
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
    this.initializeEventListeners();
  }

  /**
   * UIイベントリスナーの初期化
   */
  initializeEventListeners() {
    document.getElementById("menu").style.display = "none";
    //document.getElementById("kakuninForm").style.display = "flex";
    document.getElementById("loginForm").style.display = "none";
  }
}

/**
 * サーバー認証・URL変換を管理するクラス
 */
class AuthServer {
  /**
   * AuthServerの初期化
   * @param {string} serverUrl 教師などから提供され、ユーザーによって入力された変換ずみサーバーのURL
   */
  constructor(serverUrl) {
    console.log(serverUrl);
    this.url = this.decodeURL(serverUrl);
    console.log("SCRのURL:" + this.url);
    window.scr_url = this.url;
    this.ServerStatus = null;
    localStorage.setItem(this.url);
    localStorage.getItem(new Date());
  }
  /**
   * 初期化時に呼び出される変換システムの呼び出しポイント
   * @param {string} serverUrl 入力されたサーバーのURL
   * @param {boolean} ctype 変換するか、複合するかのパラメーター。 trueで変換、falseで複合。
   */
  convert(serverUrl, ctype) {
    if (ctype) {
      this.encodeURL(serverUrl);
    } else if (!ctype) {
      this.decodeURL(serverUrl);
    }
  }
  /**
   * 素因数分解（指数表記）を返す
   * @param {number|string} n 分解したい整数
   * @returns {string} 指数表記の素因数分解（例: "2^4,5,101"）
   */
  primeFactorize(n) {
    let num = Number(n);
    let factors = {};
    for (let i = 2; i * i <= num; i++) {
      while (num % i === 0) {
        factors[i] = (factors[i] || 0) + 1;
        num /= i;
      }
    }
    if (num > 1) factors[num] = (factors[num] || 0) + 1;
    return Object.entries(factors)
      .map(([prime, exp]) => (exp > 1 ? `${prime}^${exp}` : prime))
      .join(",");
  }
  /**
   * 素因数分解の指数表記から元の数値に戻す
   * @param {string} factorStr 指数表記の素因数分解（例: "2^4,5,101"）
   * @returns {number} 元の数値
   */
  primeFactorsToNumber(factorStr) {
    return factorStr.split(",").reduce((acc, part) => {
      if (part.includes("^")) {
        const [base, exp] = part.split("^").map(Number);
        return acc * Math.pow(base, exp);
      } else {
        return acc * Number(part);
      }
    }, 1);
  }
  /**
   * 変換済みのテキストから元のURLに戻す
   * @param {string} text 変換済みのテキスト
   * @returns {string} 元のURLに戻したテキスト
   */
  decodeURL(text) {
    return text.replace(
      /([ps])([a-zA-Z0-9\.\-]+|L)(:([0-9\^,]+))?/g,
      (match, proto, host, _, portFactors) => {
        let protocol = proto === "s" ? "https://" : "http://";
        let hostPart = host === "L" ? "localhost" : host;
        let portPart = "";
        if (portFactors) {
          let portNum = this.primeFactorsToNumber(portFactors);
          portPart = ":" + portNum;
        }
        return protocol + hostPart + portPart;
      }
    );
  }
  /**
   * テキスト中のURLを指定ルールで変換する
   * @param {string} text 変換したいテキスト
   * @returns {string} 変換後のテキスト
   */
  encodeURL(text) {
    return text.replace(
      /https?:\/\/([a-zA-Z0-9\.\-]+)(:\d+)?/g,
      (match, host, port) => {
        let prefix = match.startsWith("https://") ? "s" : "p";
        let hostPart = host === "localhost" ? "L" : host;
        let portPart = "";
        if (port) {
          let portNum = port.slice(1);
          portPart = ":" + this.primeFactorize(portNum);
        }
        return prefix + hostPart + portPart;
      }
    );
  }

  // --- 使用例 ---
  // const original = "http://localhost:8080 と https://example.com:3000 を変換";
  // const encoded = encodeURL(original);
  // console.log(encoded); // pL:2^4,5,101 と sexample.com:2^2,3,5^3 を変換
  // const decoded = decodeURL(encoded);
  // console.log(decoded); // http://localhost:8080 と https://example.com:3000 を変換
  /*
   * 変換されたサーバーのURLが存在するかどうか試す関数。
   * @param {string} url 元の形態に`this.convert(:string:,false)`によって変換されたURL
   * @param {boolean} sumsu 詳細な情報を要求するかの引数。trueで必要として、falseで不要とする。
   * @returns {Promise<boolean>} サーバーが存在するかどうか
   */
  async TestFetch(url, sumsu) {
    try {
      console.log("TestFetch attempts to communicate with " + url);
      const response = await fetch(url);
      const statuscode = response.status;
      if (!response.ok) {
        if (statuscode === 404) {
          if (sumsu) {
            console.log(response);
          }
          return false;
        } else {
          return false;
        }
      } else {
        document.getElementById("login").style.display = "none";
        document.getElementById("scr_app").style.display = "none";

        document.getElementById("menu").style.display = "block";
        return true;
      }
    } catch (error) {
      console.error("SCRは利用できません。");
      console.log("ログ:" + statuscode);
    }
  }
  /**
   * `TestFetch`を実行するための関数
   * @returns {Promise<void>}
   */
  async callTest() {
    this.ServerStatus = await this.TestFetch(this.url, false);
    if (this.ServerStatus) {
      return;
    } else {
      console.log("ana šumšu ḫašāḳu, šumšu ša ḫāzīrū ḫašāḳu lā šumšu.");
    }
  }
}

// アプリケーションの初期化
export function initializeApp() {
  console.log("初期化中.................");
  const authManager = new GoogleAuthManager();
  authManager.initialize();
  const driveManager = new GoogleDriveManager(authManager);
  const uiManager = new KOREGAUIManagerDAZE();

  document
    .getElementById("school_login_btn")
    .addEventListener("click", async () => {
      const schoolId = document.getElementById("schoolId").value;
      const schoolId_query = new URLSearchParams(window.location.search).get(
        "schoolId"
      );

      if (!schoolId && !schoolId_query) {
        const result = window.confirm(
          "学校IDを入力していません。\n学校に接続せず利用しますか？"
        );
        if (result) {
          document.getElementById("login").style.display = "none";
          document.getElementById("scr_menu_icon").style.display = "none";
          document.getElementById("backicon").style.display = "block";
          document.getElementById("menu").style.display = "block";
        }
        return;
      }

      const serverUrl = schoolId || schoolId_query;
      const stuth = new AuthServer(serverUrl);
      await stuth.callTest();
      await loadFeed();
      window.scr_url = stuth.url;
      console.log("SCRのURLを設定しました。");
      document.getElementById("menu").style.display = "block";
      document.getElementById("menu").style.display = "flex";
    });
}

window.loadData = async function () {
  try {
    const data = await driveManager.loadAppData("deep-school-user-data.json");
    console.log("データを読み込みました");
    return data;
  } catch (error) {
    console.log("データの読み込みに失敗しました");
    return null;
  }
};
