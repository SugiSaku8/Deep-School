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

// Deep-School ログシステム
const LOG_DISPLAYS = [
  'stdout','stderr','appout','appin','apperr','oappout','oappin','oapperr',
  '3rdappout','3rdappin','3rdapperr','sysout','sysin','syserr'
];

class DeepSchoolShell {
  constructor() {
    this.currentApp = null;
    this.initializedApps = new Set();
    this.logMemory = {};
    LOG_DISPLAYS.forEach(d => this.logMemory[d] = []);
    this.currentDisplay = 'stdout';
    this._setupLogWindow();
    window.ds = this; // コマンド用
    applyLangToDOM();
    this.loadApp('login');
  }

  // ログ出力API
  log({from = 'dp.sys.unknown', message = '', level = 'info', timestamp = null}) {
    const ts = timestamp || new Date().toISOString();
    const logObj = { from, timestamp: ts, message, level };
    const display = this._detectDisplay(from, level);
    if (!this.logMemory[display]) this.logMemory[display] = [];
    this.logMemory[display].push(logObj);
    if (display === this.currentDisplay) this._renderLogWindow();
  }

  // ディスプレイ切り替え
  log_sw(displayName) {
    if (LOG_DISPLAYS.includes(displayName)) {
      this.currentDisplay = displayName;
      this._renderLogWindow();
    } else {
      alert('Unknown display: ' + displayName);
    }
  }

  // ログ取得
  getLogs(displayName) {
    return this.logMemory[displayName] || [];
  }

  // from文字列からディスプレイ名を判定
  _detectDisplay(from, level) {
    if (from.startsWith('dp.sys.')) {
      if (from.includes('.err') || level === 'error') return 'syserr';
      if (from.includes('.out') || level === 'log' || level === 'info') return 'sysout';
      if (from.includes('.in')) return 'sysin';
      return 'stdout';
    }
    if (from.startsWith('dp.app.')) {
      if (from.includes('.oapp.')) {
        if (from.includes('.err')) return 'oapperr';
        if (from.includes('.out')) return 'oappout';
        if (from.includes('.in')) return 'oappin';
      } else if (from.includes('.3rd.')) {
        if (from.includes('.err')) return '3rdapperr';
        if (from.includes('.out')) return '3rdappout';
        if (from.includes('.in')) return '3rdappin';
      } else {
        if (from.includes('.err') || level === 'error') return 'apperr';
        if (from.includes('.out') || level === 'log' || level === 'info') return 'appout';
        if (from.includes('.in')) return 'appin';
      }
      return 'appout';
    }
    // fallback
    if (level === 'error') return 'stderr';
    if (level === 'warn') return 'stderr';
    return 'stdout';
  }

  // Apple HIG風ログウィンドウUI
  _setupLogWindow() {
    let logWin = document.getElementById('ds-log-window');
    if (!logWin) {
      logWin = document.createElement('div');
      logWin.id = 'ds-log-window';
      logWin.style.position = 'fixed';
      logWin.style.top = '16px';
      logWin.style.right = '16px';
      logWin.style.width = '420px';
      logWin.style.maxHeight = '40vh';
      logWin.style.overflowY = 'auto';
      logWin.style.background = 'rgba(255,255,255,0.92)';
      logWin.style.borderRadius = '18px';
      logWin.style.boxShadow = '0 4px 24px #0002';
      logWin.style.zIndex = 9999;
      logWin.style.fontFamily = 'system-ui, sans-serif';
      logWin.style.fontSize = '15px';
      logWin.style.padding = '18px 18px 8px 18px';
      logWin.setAttribute('aria-live', 'polite');
      logWin.setAttribute('role', 'log');
      // display切替
      const sel = document.createElement('select');
      sel.id = 'ds-log-display-select';
      sel.style.marginBottom = '8px';
      sel.style.borderRadius = '8px';
      sel.style.padding = '4px 8px';
      sel.style.fontSize = '15px';
      sel.style.boxShadow = '0 1px 4px #0001';
      LOG_DISPLAYS.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d; opt.textContent = d;
        sel.appendChild(opt);
      });
      sel.value = this.currentDisplay;
      sel.onchange = e => this.log_sw(e.target.value);
      logWin.appendChild(sel);
      // log list
      const logList = document.createElement('div');
      logList.id = 'ds-log-list';
      logList.style.maxHeight = '28vh';
      logList.style.overflowY = 'auto';
      logWin.appendChild(logList);
      document.body.appendChild(logWin);
    }
    this._renderLogWindow();
  }

  _renderLogWindow() {
    const logList = document.getElementById('ds-log-list');
    if (!logList) return;
    const logs = this.getLogs(this.currentDisplay);
    logList.innerHTML = logs.slice(-30).map(log =>
      `<div style="margin-bottom:6px;line-height:1.5;word-break:break-all;${log.level==='error'? 'color:#c00;font-weight:bold;' : log.level==='warn'? 'color:#b80;' : ''}">
        <span style='font-size:12px;color:#888;'>[${log.timestamp.split('T')[1].slice(0,8)}]</span>
        <span style='font-size:12px;color:#888;'>${log.from}</span><br/>
        <span>${log.message}</span>
      </div>`
    ).join('');
    // selectの値も同期
    const sel = document.getElementById('ds-log-display-select');
    if (sel) sel.value = this.currentDisplay;
  }

  initAllApps() {
    // この関数はもう使いません。互換性のため残置。
  }

  showApp(appName) {
    this.log({from: `dp.app.${appName}.out`, message: `${appName}アプリを表示中`, level: 'info'});
    this.currentApp = appName;
    this.log({from: `dp.app.${appName}.out`, message: `現在のアプリ: ${appName}`, level: 'info'});
  }

  loadApp(appName) {
    let appRoot = document.getElementById('app-root');
    if (!appRoot) {
      appRoot = document.createElement('div');
      appRoot.id = 'app-root';
      document.body.appendChild(appRoot);
      this.log({from: 'dp.sys.shell', message: '#app-root がなかったので自動生成しました', level: 'warn'});
    }
    this.showApp(appName);
    const appModule = appModules[appName];
    if (appModule && typeof appModule.appInit === 'function') {
      appModule.appInit(this);
    } else {
      this.log({from: `dp.app.${appName}.err`, message: `アプリ${appName}の初期化関数が見つかりません`, level: 'warn'});
    }
  }
}

if (typeof window !== 'undefined') {
  window.shell = new DeepSchoolShell();
}

// 例: window.shell = new DeepSchoolShell(); window.shell.loadApp('menu'); 