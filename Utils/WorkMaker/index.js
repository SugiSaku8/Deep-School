const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 900,
    frame: true,
    icon: path.join(__dirname, "BR/a.png"),
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: true,
      contextIsolation: true,
      webSecurity: true,
      experimentalFeatures: false,
    },
    title: "Deep-School WorkMaker v1.0",
  });
  mainWindow.loadFile(path.join(__dirname, "/r/index.html"));
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
