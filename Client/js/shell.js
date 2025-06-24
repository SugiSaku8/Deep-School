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
    // すべての主要セクションを非表示
    const sections = ['login', 'menu', 'toaster_chat', 'scr_app', 'estore', 'pickramu_app', 'setting'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    // 対象アプリのセクションを表示
    let showId = appName;
    if (appName === 'chat') showId = 'toaster_chat';
    if (appName === 'scr') showId = 'scr_app';
    if (appName === 'pickramu') showId = 'pickramu_app';
    if (appName === 'setting') showId = 'setting';
    if (appName === 'estore') showId = 'estore';
    if (appName === 'menu') showId = 'menu';
    if (appName === 'login') showId = 'login';
    const showEl = document.getElementById(showId);
    if (showEl) showEl.style.display = 'block';
    this.currentApp = appName;
  }

  loadApp(appName) {
    this.showApp(appName);
    if (!this.initializedApps.has(appName)) {
      const appModule = appModules[appName];
      if (appModule && typeof appModule.appInit === 'function') {
        appModule.appInit(this);
        this.initializedApps.add(appName);
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.shell = new DeepSchoolShell();
}

// 例: window.shell = new DeepSchoolShell(); window.shell.loadApp('menu'); 