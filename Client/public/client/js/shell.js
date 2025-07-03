import * as coreConfig from './core/config.js';
import * as coreLang from './core/lang.js';
import * as coreSecurity from './core/security.js';
import * as coreUtils from './core/utils.mjs';
import { versionManager } from './core/version.mjs';
import { parallaxManager } from './core/parallax.mjs';

window.coreConfig = coreConfig;
window.coreLang = coreLang;
window.coreSecurity = coreSecurity;
window.coreUtils = coreUtils;
window.versionManager = versionManager;
window.parallaxManager = parallaxManager;

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
import * as tutorialApp from './apps/tutorial.app.js';

const appModules = {
  chat: chatApp,
  scr: scrApp,
  setting: settingApp,
  pickramu: pickramuApp,
  login: loginApp,
  menu: menuApp,
  estore: estoreApp,
  eguide: eguideApp,
  tutorial: tutorialApp,
};

// Deep-School ログシステム
class DeepSchoolShell {
  constructor() {
    this.currentApp = null;
    this.initializedApps = new Set();
    this.logMemory = {};
    this.logDisplays = [
      'stdout','stderr','appout','appin','apperr','oappout','oappin','oapperr',
      '3rdappout','3rdappin','3rdapperr','sysout','sysin','syserr'
    ];
    this.logDisplays.forEach(d => this.logMemory[d] = []);
    this._activeDisplay = null;
    // ds.log.swで呼べるようにlogにswを生やす
    const logFunc = this.log.bind(this);
    logFunc.sw = this.log_sw.bind(this);
    this.log = logFunc;
    
    // バージョン管理機能を初期化
    this._initVersionCommands();
    
    window.ds = this; // コマンド用
    applyLangToDOM();
    this.loadApp('login');
  }

  // バージョン管理コマンドを初期化
  _initVersionCommands() {
    // バージョン情報を表示するコマンド
    this.version = {
      // 全バージョン情報を表示
      all: async () => {
        await versionManager.loadVersionConfig();
        const formatted = versionManager.formatVersion('all');
        console.log(formatted);
        this.log({from: 'dp.sys.version', message: 'Version information displayed', level: 'info'});
        return formatted;
      },
      
      // 特定コンポーネントのバージョン情報を表示
      get: async (component = 'client') => {
        await versionManager.loadVersionConfig();
        const formatted = versionManager.formatVersion(component);
        console.log(formatted);
        this.log({from: 'dp.sys.version', message: `${component} version information displayed`, level: 'info'});
        return formatted;
      },
      
      // 利用可能なコンポーネント一覧
      list: () => {
        const components = ['family', 'client', 'server', 'workmaker', 'toaster'];
        console.log('Available components:', components.join(', '));
        this.log({from: 'dp.sys.version', message: 'Available components listed', level: 'info'});
        return components;
      },
      
      // アップデートチェック
      check: async () => {
        await versionManager.loadVersionConfig();
        const updates = versionManager.checkForUpdates();
        console.log('Update check results:', updates);
        this.log({from: 'dp.sys.version', message: 'Update check completed', level: 'info'});
        return updates;
      },
      
      // バージョン比較
      compare: (version1, version2) => {
        const result = versionManager.compareVersions(version1, version2);
        const comparison = result === 1 ? 'newer' : result === -1 ? 'older' : 'same';
        console.log(`Version comparison: ${version1} is ${comparison} than ${version2}`);
        this.log({from: 'dp.sys.version', message: `Version comparison: ${version1} vs ${version2}`, level: 'info'});
        return { result, comparison };
      }
    };

    // ヘルプコマンド
    this.help = {
      version: () => {
        const help = `
=== Version Management Commands ===

ds.version.all()           - Display all version information
ds.version.get(component)  - Display specific component version
ds.version.list()          - List available components
ds.version.check()         - Check for updates
ds.version.compare(v1, v2) - Compare two versions

Available components: family, client, server, workmaker, toaster

Examples:
  ds.version.all()
  ds.version.get('client')
  ds.version.compare('1.0.1', '1.0.2')
        `;
        console.log(help);
        return help;
      }
    };
  }

  // ログ出力API
  log({from = 'dp.sys.unknown', message = '', level = 'info', timestamp = null}) {
    const ts = timestamp || new Date().toISOString();
    const logObj = { from, timestamp: ts, message, level };
    const display = this._detectDisplay(from, level);
    if (!this.logMemory[display]) this.logMemory[display] = [];
    this.logMemory[display].push(logObj);
    // DevTools表示用: アクティブディスプレイなら即時console出力
    if (this._activeDisplay === display) {
      this._printLogToConsole(logObj);
    }
  }

  // ログ取得
  getLogs(displayName) {
    return this.logMemory[displayName] || [];
  }

  // DevTools用: ディスプレイ切替
  log_sw(displayName) {
    if (!this.logDisplays.includes(displayName)) {
      console.warn('[ds.log.sw] Unknown display:', displayName);
      return;
    }
    this._activeDisplay = displayName;
    console.clear();
    const logs = this.getLogs(displayName);
    logs.forEach(log => this._printLogToConsole(log));
    // ユーザー向け案内
    console.info(`[ds.log.sw] Now watching display: ${displayName}`);
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

  // ログをconsoleに出力
  _printLogToConsole(log) {
    const prefix = `[${log.timestamp.split('T')[1].slice(0,8)}] ${log.from}`;
    if (log.level === 'error') {
      console.error(prefix, log.message);
    } else if (log.level === 'warn') {
      console.warn(prefix, log.message);
    } else if (log.level === 'info') {
      console.info(prefix, log.message);
    } else {
      console.log(prefix, log.message);
    }
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
      
      // Initialize parallax effects after app initialization
      setTimeout(() => {
        if (parallaxManager && parallaxManager.isInitialized) {
          parallaxManager.initializeElements();
          this.log({from: 'dp.sys.shell', message: `Parallax effects initialized for ${appName}`, level: 'info'});
        }
      }, 100);
    } else {
      this.log({from: `dp.app.${appName}.err`, message: `アプリ${appName}の初期化関数が見つかりません`, level: 'warn'});
    }
  }
}

if (typeof window !== 'undefined') {
  window.shell = new DeepSchoolShell();
}

// 例: window.shell = new DeepSchoolShell(); window.shell.loadApp('menu'); 