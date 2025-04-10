// ... existing code ...
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 900,
    frame: true,
    icon: path.join(__dirname, "buildResources/a.png"),
    webPreferences: {
      nodeIntegration: false, // セキュリティのためfalse
      nodeIntegrationInWorker: true,
      contextIsolation: true,
      webSecurity: true,
      experimentalFeatures: false,
      preload: path.join(__dirname, 'preload.js') // preloadスクリプトの追加
    },
    title: "Deep-Schooler 公式サーバー　インストーラー",
  });
  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

// app.whenReady()を使用して、appオブジェクトが初期化されてからBrowserWindowを作成
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.enableSandbox();

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// ipcMainを使用して、HTML側からのメッセージを受け取り、コードを実行
ipcMain.handle('execute-node-code', async (event, code) => {
  try {
    // eval()の使用はセキュリティリスクがあるため、可能であれば別の方法を検討してください。
    // Functionコンストラクタを使用する方法も検討できます。
    const result = new Function(code)();
    return result;
  } catch (error) {
    console.error('コード実行エラー:', error);
    return { error: error.message };
  }
});