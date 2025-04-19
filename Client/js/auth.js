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
class UIManager {
  constructor() {
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("kakuninForm").style.display = "flex";
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("kakuninForm").style.display = "block";
  }
}

// アプリケーションの初期化
window.onload = async function () {
  const authManager = new GoogleAuthManager();
  const driveManager = new GoogleDriveManager(authManager);
  const uiManager = new UIManager();

  await authManager.initialize();
  /*
  // 使用例
  window.saveData = async function(data) {
    try {
      await driveManager.saveAppData('app-data.json', data);
      alert('データを保存しました');
    } catch (error) {
      alert('データの保存に失敗しました');
    }
  };

  window.loadData = async function() {
    try {
      const data = await driveManager.loadAppData('app-data.json');
      alert('データを読み込みました');
      return data;
    } catch (error) {
      alert('データの読み込みに失敗しました');
      return null;
    }
  };
  */
};
