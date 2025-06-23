// Deep-School-Shellシステム雛形
export class DeepSchoolShell {
  constructor(rootId = 'app-root') {
    this.root = document.getElementById(rootId) || this._createRoot(rootId);
    this.currentApp = null;
  }

  async loadApp(appName) {
    try {
      // アプリファイルを動的import
      const appModule = await import(`./${appName}.dps.ap2.js`);
      // HTMLを挿入
      this.root.innerHTML = appModule.appHtml;
      // 初期化関数を呼び出し
      if (typeof appModule.appInit === 'function') {
        appModule.appInit(this);
      }
      this.currentApp = appName;
    } catch (e) {
      this.root.innerHTML = `<div style='color:red'>アプリ「${appName}」の読み込みに失敗しました。</div>`;
      console.error(e);
    }
  }

  _createRoot(rootId) {
    const div = document.createElement('div');
    div.id = rootId;
    document.body.appendChild(div);
    return div;
  }
}

// 例: window.shell = new DeepSchoolShell(); window.shell.loadApp('menu'); 