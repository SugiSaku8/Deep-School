// Google APIのクライアントID
const CLIENT_ID =
  "54111871338-nv4bn99r48cohhverg3l9oicirthmtpp.apps.googleusercontent.com";
// Google Drive APIのスコープ
const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.appdata",
];

class GoogleAuthManager {
  constructor() {
    this.tokenClient = null;
    this.accessToken = null;
  }

  // 初期化処理
  async initialize() {
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
      use_fedcm_for_prompt: true,
    });

    // ログインボタンのレンダリング
    google.accounts.id.renderButton(
      document.getElementById("openLoginButton"),
      {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with_google",
        shape: "rectangular",
        locale: "ja",
      }
    );

    // ワンタップログイン
    google.accounts.id.prompt();
  }

  // 認証レスポンスのハンドリング
  async handleCredentialResponse(response) {
    console.log("認証トークンを受信:", response.credential);
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("openLoginButton").style.display = "none";
    // document.getElementById("kakuninForm").style.display = "none";

    try {
      // Google Drive APIの認証を実行
      await this.initializeGoogleDriveAuth();
    } catch (error) {
      console.error("Google Drive認証エラー:", error);
    }
  }

  // Google Drive API用の認証初期化
  async initializeGoogleDriveAuth() {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES.join(" "),
      callback: (tokenResponse) => {
        if (tokenResponse.error !== undefined) {
          throw tokenResponse;
        }
        this.accessToken = tokenResponse.access_token;
        console.log("Google Drive APIのアクセストークンを取得しました");
      },
    });

    this.tokenClient.requestAccessToken();
  }
}

// Google Driveの操作を管理するクラス
class GoogleDriveManager {
  constructor(authManager) {
    this.authManager = authManager;
  }

  // アプリケーションデータの保存
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

  // アプリケーションデータの読み込み
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

// UIの操作を管理するクラス
class KOREGAUIManagerDAZE {
  constructor() {
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.getElementById("menu").style.display = "none";
    //document.getElementById("kakuninForm").style.display = "flex";
    document.getElementById("loginForm").style.display = "none";
  }
}

class AuthServer {
  /**
   * AuthServerの初期化
   *@param {string} serverUrl 教師などから提供され、ユーザーによって入力された変換ずみサーバーのURL
   *@param {boolean} ctype 変換するか、複合するかのパラメーター。 trueで変換、falseで複合。
   *@param {boolean} AuthServer.ServerStatus サーバーのステータス。これは、`this.TestFetch`によって入力される。
   *@param {string} AuthServer.url 変換されたURL
   */
  constructor(serverUrl) {
    console.log(serverUrl);
    this.url = this.convert(serverUrl, false);
    console.log("SCRのURL:" + this.url);
    this.ServerStatus = null;
  }
  /**
   * 初期化時に呼び出される変換システムの呼び出しポイント
   *@param {string} serverUrl 教師などから提供され、ユーザーによって入力された変換ずみサーバーのURL
   *@param {Boolean} ctype 変換するか、複合するかのパラメーター。 trueで変換、falseで複合。
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
   *@param {string} url 元の形態に`this.convert(:string:,false)`によって変換されたURL
   *@param {boolean} sumsu 詳細な情報を要求するかの引数。trueで必要として、falseで不要とする。
   */
  async TestFetch(url, sumsu) {
    try {
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
        return true;
      }
    } catch (error) {
      console.error(error.message);
    }
  }
  /*
   *`TestFetch`を実行するための関数
   *  `await`で実行。
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
window.onload = async function () {
  //document.getElementById("kakuninForm").style.display = "none";
  const authManager = new GoogleAuthManager();
  const driveManager = new GoogleDriveManager(authManager);
  const uiManager = new KOREGAUIManagerDAZE();

  await authManager.initialize();
  /*
  window.saveData = async function(data) {
    try {
      await driveManager.saveAppData('app-data.json', data);
      alert('データを保存しました');
    } catch (error) {
      alert('データの保存に失敗しました');
    }
  };
  */

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

  document
    .getElementById("school_login_btn")
    .addEventListener("click", async () => {
      let geoauth = new AuthServer(document.getElementById("schoolId").value);
      await geoauth.callTest();
      window.scr_url = geoauth.url;
      console.log("SCRのURLを設定しました。");
    });
};
