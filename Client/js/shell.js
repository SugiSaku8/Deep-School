import * as coreConfig from './core/config.js';
import * as coreLang from './core/lang.js';
import * as coreSecurity from './core/security.js';
import * as coreUtils from './core/utils.mjs';

window.coreConfig = coreConfig;
window.coreLang = coreLang;
window.coreSecurity = coreSecurity;
window.coreUtils = coreUtils;

function applyLangToDOM() {
  const { t } = window.coreLang;
  document.querySelectorAll('[data-lang-key]').forEach(el => {
    const key = el.getAttribute('data-lang-key');
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });
}
window.applyLangToDOM = applyLangToDOM;

// Deep-School-Shell: 全アプリの初期化・表示制御ハブ
import * as chatApp from './apps/chat.dps.ap2.js';
import * as scrApp from './apps/scr.dps.ap2.js';
import * as settingApp from './apps/setting.dps.ap2.js';
import * as pickramuApp from './apps/pickramu.dps.ap2.js';
import * as loginApp from './apps/login.dps.ap2.js';
import * as menuApp from './apps/menu.dps.ap2.js';
import * as estoreApp from './apps/estore.dps.ap2.js';
import * as eguideApp from './apps/eguide.dps.ap2.js';

const appModules = {
  chat: chatApp,
  scr: scrApp,
  setting: settingApp,
  pickramu: pickramuApp,
  login: loginApp,
  menu: menuApp,
  estore: estoreApp,
  eguide: eguideApp,
};

class DeepSchoolShell {
  constructor() {
    this.currentApp = null;
    this.initializedApps = new Set();
    applyLangToDOM();
    this.loadApp('login');
  }

  initAllApps() {
    // この関数はもう使いません。互換性のため残置。
  }

  showApp(appName) {
    console.log(`Shell: ${appName}アプリを表示中`);
    // SPA化により、#app-rootの中身は各appInitで上書きされるため、
    // ここでIDベースのDOM操作は不要。
    this.currentApp = appName;
    console.log(`Shell: 現在のアプリ: ${appName}`);
  }

  loadApp(appName) {
    // #app-rootがなければ自動生成
    let appRoot = document.getElementById('app-root');
    if (!appRoot) {
      appRoot = document.createElement('div');
      appRoot.id = 'app-root';
      document.body.appendChild(appRoot);
      console.warn('#app-root がなかったので自動生成しました');
    }
    // showAppはSPA化により、currentAppの記録とログのみ
    this.showApp(appName);
    // 各アプリのappInitを毎回呼ぶ（SPA化で状態は都度初期化される設計）
    const appModule = appModules[appName];
    if (appModule && typeof appModule.appInit === 'function') {
      appModule.appInit(this);
    } else {
      console.warn(`アプリ${appName}の初期化関数が見つかりません`);
    }
  }
}

if (typeof window !== 'undefined') {
  window.shell = new DeepSchoolShell();
}

// 例: window.shell = new DeepSchoolShell(); window.shell.loadApp('menu'); 