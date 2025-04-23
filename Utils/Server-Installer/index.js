const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { exec } = require('child_process')



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

ipcMain.handle('execute-node-code', async (event, code) => {
  try {

    exec(code, (err, stdout, stderr) => {
      if(code === )
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