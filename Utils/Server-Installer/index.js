const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { exec } = require('child_process')

let mainWindow;

/**
 * メインウィンドウを作成する関数
 * - ウィンドウサイズやアイコン、preloadスクリプトなどを設定
 */
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

/**
 * アプリの初期化とウィンドウ生成
 */
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // macOSでウィンドウがすべて閉じられた場合の再生成
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.enableSandbox();

/**
 * すべてのウィンドウが閉じられたときの処理
 */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**
 * レンダラープロセスからのNode.jsコード実行リクエストを受け付けるIPCハンドラ
 * @param {Electron.IpcMainInvokeEvent} event イベントオブジェクト
 * @param {string} code 実行するNode.jsコード
 * @returns {Promise<string|{error: string}>} 実行結果またはエラー
 */
ipcMain.handle('execute-node-code', async (event, code) => {
  try {
    exec(code, (err, stdout, stderr) => {
      // ここでcodeの内容による分岐が必要な場合は追記
      if (err) {
        console.log(`stderr: ${stderr}`)
        return stderr;
      }
      console.log(`stdout: ${stdout}`)
    }
  )    
  } catch (error) {
    console.error('コード実行エラー:', error);
    return { error: error.message };
  }
});