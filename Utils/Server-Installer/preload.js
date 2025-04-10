const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  executeNodeCode: (code) => ipcRenderer.invoke("execute-node-code", code),
});
