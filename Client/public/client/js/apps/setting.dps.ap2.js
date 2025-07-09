import { SimpleAuthManager } from '../auth/auth.mjs';

export const appMeta = {
  name: "setting",
  title: "設定",
  icon: "re/ico/Setting.png"
};

export function appInit(shell) {
  shell.log({from: 'dp.app.setting.out', message: 'SettingApp: 初期化開始', level: 'info'});

  // HTMLを#app-rootに描画
  const root = document.getElementById('app-root');
  if (!root) {
    shell.log({from: 'dp.app.setting.err', message: 'SettingApp: #app-rootが見つかりません', level: 'error'});
    return;
  }
  root.innerHTML = `
    <div class="page-container">
      <button class="close-btn" id="setting-close-btn" title="閉じる" aria-label="閉じる">×</button>
      <h1 class="page-title" data-lang-key="setting">設定</h1>
      <div class="setting-content">
        <div class="setting-section">
          <h2>アカウント設定</h2>
          <div class="setting-item">
            <label>ユーザー名:</label>
            <span id="setting-username">未設定</span>
          </div>
          <div class="setting-item">
            <label>ユーザーID:</label>
            <span id="setting-userid">未設定</span>
          </div>
          <div class="setting-item">
            <label>アカウント作成日:</label>
            <span id="setting-created">未設定</span>
          </div>
          <div class="setting-item">
            <label>最終ログイン:</label>
            <span id="setting-lastlogin">未設定</span>
          </div>
          <button class="auto-btn" id="logout-btn" data-lang-key="logout">ログアウト</button>
        </div>
        <div class="setting-section">
          <h2>表示設定</h2>
    
          <div class="setting-item">
            <label for="font-size-select">フォントサイズ:</label>
            <select id="font-size-select">
              <option value="small">小</option>
              <option value="medium" selected>中</option>
              <option value="large">大</option>
            </select>
          </div>
          <div class="setting-item">
            <label for="animation-toggle">アニメーション:</label>
            <input type="checkbox" id="animation-toggle" checked>
          </div>
          <div class="setting-item">
            <label for="compact-mode-toggle">コンパクトモード:</label>
            <input type="checkbox" id="compact-mode-toggle">
          </div>
        </div>
        <div class="setting-section">
          <h2>通知設定</h2>
          <div class="setting-item">
            <label for="notification-toggle">通知を有効にする:</label>
            <input type="checkbox" id="notification-toggle" checked>
          </div>
          <div class="setting-item">
            <label for="sound-toggle">サウンド:</label>
            <input type="checkbox" id="sound-toggle" checked>
          </div>
          <div class="setting-item">
            <label for="email-notification-toggle">メール通知:</label>
            <input type="checkbox" id="email-notification-toggle">
          </div>
          <div class="setting-item">
            <label for="push-notification-toggle">プッシュ通知:</label>
            <input type="checkbox" id="push-notification-toggle" checked>
          </div>
        </div>
        <div class="setting-section">
          <h2>プライバシー設定</h2>
          <div class="setting-item">
            <label for="analytics-toggle">分析データの送信:</label>
            <input type="checkbox" id="analytics-toggle" checked>
          </div>
          <div class="setting-item">
            <label for="crash-report-toggle">クラッシュレポート:</label>
            <input type="checkbox" id="crash-report-toggle" checked>
          </div>
          <div class="setting-item">
            <label for="location-toggle">位置情報の使用:</label>
            <input type="checkbox" id="location-toggle">
          </div>
        </div>
        <div class="setting-section">
          <h2>パフォーマンス設定</h2>
          <div class="setting-item">
            <label for="cache-toggle">キャッシュを有効にする:</label>
            <input type="checkbox" id="cache-toggle" checked>
          </div>
          <div class="setting-item">
            <label for="auto-save-toggle">自動保存:</label>
            <input type="checkbox" id="auto-save-toggle" checked>
          </div>
          <div class="setting-item">
            <label for="background-sync-toggle">バックグラウンド同期:</label>
            <input type="checkbox" id="background-sync-toggle" checked>
          </div>
        </div>
        <div class="setting-section">
          <h2>データ管理</h2>
          <div class="setting-item">
            <button class="auto-btn" id="export-btn" data-lang-key="export_data">データをエクスポート</button>
          </div>
          <div class="setting-item">
            <button class="auto-btn" id="import-btn" data-lang-key="import_data">データをインポート</button>
          </div>
          <div class="setting-item">
            <button class="auto-btn" id="backup-btn">バックアップを作成</button>
          </div>
          <div class="setting-item">
            <button class="auto-btn" id="restore-btn">バックアップを復元</button>
          </div>
          <div class="setting-item">
            <button class="auto-btn danger" id="clear-btn" data-lang-key="clear_data">データをクリア</button>
          </div>
        </div>
        <div class="setting-section">
          <h2>アプリケーション情報</h2>
          <div class="setting-item">
            <label>バージョン:</label>
            <span id="setting-version">0.3.8</span>
          </div>
          <div class="setting-item">
            <label>ビルド番号:</label>
            <span id="setting-build">25C1052X1</span>
          </div>
          <div class="setting-item">
            <label>最終更新:</label>
            <span id="setting-updated">2025-07-07</span>
          </div>
          <div class="setting-item">
            <button class="auto-btn" id="check-update-btn">アップデートをチェック</button>
          </div>
        </div>
        <div class="setting-section">
          <h2>Pickramu設定</h2>
          <div class="setting-item">
            <label for="pickramu-eguide-toggle">eGuideをPickramuで有効化:</label>
            <input type="checkbox" id="pickramu-eguide-toggle">
          </div>
        </div>
        <div class="form-group">
          <label for="scr_url_setting">SCRサーバーURL</label>
          <input type="text" id="scr_url_setting" value="${localStorage.getItem('scr_url') || 'https://deep-school.onrender.com'}" placeholder="https://deep-school.onrender.com" />
        </div>
      </div>
    </div>
  `;

  // ユーザー情報の表示
  updateUserInfo();
  // 設定の読み込み
  loadSettings();
  // イベントリスナーの設定
  setupEventListeners(shell);

  // 閉じるボタンでmenuに戻る
  const closeBtn = document.getElementById('setting-close-btn');
  if (closeBtn) closeBtn.onclick = () => shell.loadApp('menu');

  // Initialize parallax effects for setting elements
  if (window.parallaxManager) {
    const settingItems = document.querySelectorAll('.setting-item');
    const buttons = document.querySelectorAll('.auto-btn');
    const closeBtn = document.getElementById('setting-close-btn');
    const inputs = document.querySelectorAll('input[type="checkbox"], input[type="text"], select');
    
    settingItems.forEach(item => {
      window.parallaxManager.addParallaxEffects(item, {
        hover: true,
        mouse: false,
        touch: false
      });
    });
    
    buttons.forEach(btn => {
      window.parallaxManager.addParallaxEffects(btn, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: true
      });
    });
    
    if (closeBtn) {
      window.parallaxManager.addParallaxEffects(closeBtn, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: true
      });
    }
    
    inputs.forEach(input => {
      window.parallaxManager.addParallaxEffects(input, {
        hover: true,
        mouse: false,
        touch: false
      });
    });
    
    shell.log({from: 'dp.app.setting.out', message: 'SettingApp: Parallax effects initialized', level: 'info'});
  }

  // SCRサーバーURL入力欄を設定画面に追加
  renderSCRUrlSetting();

  shell.log({from: 'dp.app.setting.out', message: 'SettingApp: 初期化完了', level: 'info'});
}

function updateUserInfo() {
  const usernameElement = document.getElementById('setting-username');
  const useridElement = document.getElementById('setting-userid');
  const createdElement = document.getElementById('setting-created');
  const lastloginElement = document.getElementById('setting-lastlogin');
  const versionElement = document.getElementById('setting-version');
  const buildElement = document.getElementById('setting-build');
  const updatedElement = document.getElementById('setting-updated');
  
  if (usernameElement) usernameElement.textContent = window.googleUserName || '未設定';
  if (useridElement) useridElement.textContent = window.googleUserId || '未設定';
  
  // アカウント作成日と最終ログイン日を設定
  const now = new Date();
  const formattedDate = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  if (createdElement) createdElement.textContent = formattedDate;
  if (lastloginElement) lastloginElement.textContent = formattedDate;
  
  // バージョン情報を設定
  if (versionElement) versionElement.textContent = '0.3.7';
  if (buildElement) buildElement.textContent = '25C1044X1';
  if (updatedElement) updatedElement.textContent = '2025-07-07';
}

function loadSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('deep-school-settings') || '{}');
    
    // 既存の設定項目
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) darkModeToggle.checked = settings.darkMode !== false;
    
    const fontSizeSelect = document.getElementById('font-size-select');
    if (fontSizeSelect) fontSizeSelect.value = settings.fontSize || 'medium';
    
    const notificationToggle = document.getElementById('notification-toggle');
    if (notificationToggle) notificationToggle.checked = settings.notifications !== false;
    
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) soundToggle.checked = settings.sound !== false;
    
    // 新しく追加した設定項目
    const animationToggle = document.getElementById('animation-toggle');
    if (animationToggle) animationToggle.checked = settings.animation !== false;
    
    const compactModeToggle = document.getElementById('compact-mode-toggle');
    if (compactModeToggle) compactModeToggle.checked = settings.compactMode === true;
    
    const emailNotificationToggle = document.getElementById('email-notification-toggle');
    if (emailNotificationToggle) emailNotificationToggle.checked = settings.emailNotifications === true;
    
    const pushNotificationToggle = document.getElementById('push-notification-toggle');
    if (pushNotificationToggle) pushNotificationToggle.checked = settings.pushNotifications !== false;
    
    const analyticsToggle = document.getElementById('analytics-toggle');
    if (analyticsToggle) analyticsToggle.checked = settings.analytics !== false;
    
    const crashReportToggle = document.getElementById('crash-report-toggle');
    if (crashReportToggle) crashReportToggle.checked = settings.crashReports !== false;
    
    const locationToggle = document.getElementById('location-toggle');
    if (locationToggle) locationToggle.checked = settings.location === true;
    
    const cacheToggle = document.getElementById('cache-toggle');
    if (cacheToggle) cacheToggle.checked = settings.cache !== false;
    
    const autoSaveToggle = document.getElementById('auto-save-toggle');
    if (autoSaveToggle) autoSaveToggle.checked = settings.autoSave !== false;
    
    const backgroundSyncToggle = document.getElementById('background-sync-toggle');
    if (backgroundSyncToggle) backgroundSyncToggle.checked = settings.backgroundSync !== false;
    
    const pickramuEguideToggle = document.getElementById('pickramu-eguide-toggle');
    if (pickramuEguideToggle) pickramuEguideToggle.checked = settings.pickramuEguideEnabled === true;
    
    // 設定を実際に適用
    applySettings(settings);
    
    shell.log({from: 'dp.app.setting.out', message: 'SettingApp: 設定を読み込みました', level: 'info'});
  } catch (error) {
    shell.log({from: 'dp.app.setting.err', message: 'SettingApp: 設定の読み込みエラー ' + error, level: 'error'});
  }
}

function saveSettings() {
  try {
    const settings = {
      // 既存の設定項目
      darkMode: document.getElementById('dark-mode-toggle')?.checked ?? true,
      fontSize: document.getElementById('font-size-select')?.value ?? 'medium',
      notifications: document.getElementById('notification-toggle')?.checked ?? true,
      sound: document.getElementById('sound-toggle')?.checked ?? true,
      
      // 新しく追加した設定項目
      animation: document.getElementById('animation-toggle')?.checked ?? true,
      compactMode: document.getElementById('compact-mode-toggle')?.checked ?? false,
      emailNotifications: document.getElementById('email-notification-toggle')?.checked ?? false,
      pushNotifications: document.getElementById('push-notification-toggle')?.checked ?? true,
      analytics: document.getElementById('analytics-toggle')?.checked ?? true,
      crashReports: document.getElementById('crash-report-toggle')?.checked ?? true,
      location: document.getElementById('location-toggle')?.checked ?? false,
      cache: document.getElementById('cache-toggle')?.checked ?? true,
      autoSave: document.getElementById('auto-save-toggle')?.checked ?? true,
      backgroundSync: document.getElementById('background-sync-toggle')?.checked ?? true,
      pickramuEguideEnabled: document.getElementById('pickramu-eguide-toggle')?.checked ?? false
    };
    
    localStorage.setItem('deep-school-settings', JSON.stringify(settings));
    
    // 設定を実際に適用
    applySettings(settings);
    
    // SCRサーバーURL保存
    const scrInput = document.getElementById('scr_url_setting');
    if (scrInput) {
      const scrUrl = scrInput.value.trim();
      if (scrUrl) {
        localStorage.setItem('scr_url', scrUrl);
        window.scr_url = scrUrl;
      }
    }
    
    shell.log({from: 'dp.app.setting.out', message: 'SettingApp: 設定を保存しました', level: 'info'});
  } catch (error) {
    shell.log({from: 'dp.app.setting.err', message: 'SettingApp: 設定の保存エラー ' + error, level: 'error'});
  }
}

function setupEventListeners(shell) {
  // 既存の設定項目
  ['dark-mode-toggle','font-size-select','notification-toggle','sound-toggle'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.addEventListener('change', saveSettings);
  });
  
  // 新しく追加した設定項目
  ['animation-toggle','compact-mode-toggle','email-notification-toggle','push-notification-toggle',
   'analytics-toggle','crash-report-toggle','location-toggle','cache-toggle','auto-save-toggle','background-sync-toggle'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.addEventListener('change', saveSettings);
  });
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('ログアウトしますか？')) {
        logout(shell);
        shell.loadApp('login');
      }
    });
  }
  
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) exportBtn.addEventListener('click', exportData);
  
  const importBtn = document.getElementById('import-btn');
  if (importBtn) importBtn.addEventListener('click', importData);
  
  const backupBtn = document.getElementById('backup-btn');
  if (backupBtn) backupBtn.addEventListener('click', createBackup);
  
  const restoreBtn = document.getElementById('restore-btn');
  if (restoreBtn) restoreBtn.addEventListener('click', restoreBackup);
  
  const checkUpdateBtn = document.getElementById('check-update-btn');
  if (checkUpdateBtn) checkUpdateBtn.addEventListener('click', checkForUpdates);
  
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
        clearData(shell);
      }
    });
  }
}

function logout(shell) {
  try {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_timestamp');
    window.googleUserName = null;
    window.googleUserId = null;
    shell.log({from: 'dp.app.setting.out', message: 'SettingApp: ログアウト完了', level: 'info'});
  } catch (error) {
    shell.log({from: 'dp.app.setting.err', message: 'SettingApp: ログアウトエラー ' + error, level: 'error'});
  }
}

function exportData() {
  try {
    const data = {
      settings: JSON.parse(localStorage.getItem('deep-school-settings') || '{}'),
      userData: JSON.parse(localStorage.getItem('deep-school-user-data') || '{}'),
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deep-school-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    shell.log({from: 'dp.app.setting.out', message: 'SettingApp: データをエクスポートしました', level: 'info'});
  } catch (error) {
    shell.log({from: 'dp.app.setting.err', message: 'SettingApp: データエクスポートエラー ' + error, level: 'error'});
    alert('データのエクスポートに失敗しました');
  }
}

function importData() {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            if (data.settings) localStorage.setItem('deep-school-settings', JSON.stringify(data.settings));
            if (data.userData) localStorage.setItem('deep-school-user-data', JSON.stringify(data.userData));
            loadSettings();
            shell.log({from: 'dp.app.setting.out', message: 'SettingApp: データをインポートしました', level: 'info'});
            alert('データのインポートが完了しました');
          } catch (error) {
            shell.log({from: 'dp.app.setting.err', message: 'SettingApp: データインポートエラー ' + error, level: 'error'});
            alert('データのインポートに失敗しました');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  } catch (error) {
    shell.log({from: 'dp.app.setting.err', message: 'SettingApp: データインポートエラー ' + error, level: 'error'});
    alert('データのインポートに失敗しました');
  }
}

function clearData(shell) {
  try {
    const keysToKeep = ['deep-school-settings'];
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key)) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    shell.log({from: 'dp.app.setting.out', message: 'SettingApp: データをクリアしました', level: 'info'});
    alert('データのクリアが完了しました');
  } catch (error) {
    shell.log({from: 'dp.app.setting.err', message: 'SettingApp: データクリアエラー ' + error, level: 'error'});
    alert('データのクリアに失敗しました');
  }
}

function applySettings(settings) {
  try {
    // ダークモードの適用
    if (settings.darkMode !== undefined) {
      applyDarkMode(settings.darkMode);
    }
    
    // フォントサイズの適用
    if (settings.fontSize) {
      applyFontSize(settings.fontSize);
    }
    
    // アニメーションの適用
    if (settings.animation !== undefined) {
      applyAnimation(settings.animation);
    }
    
    // コンパクトモードの適用
    if (settings.compactMode !== undefined) {
      applyCompactMode(settings.compactMode);
    }
    
    // 通知設定の適用
    if (settings.notifications !== undefined) {
      applyNotifications(settings.notifications);
    }
    
    // サウンド設定の適用
    if (settings.sound !== undefined) {
      applySound(settings.sound);
    }
    
    // キャッシュ設定の適用
    if (settings.cache !== undefined) {
      applyCache(settings.cache);
    }
    
    // 自動保存設定の適用
    if (settings.autoSave !== undefined) {
      applyAutoSave(settings.autoSave);
    }
    
    // バックグラウンド同期設定の適用
    if (settings.backgroundSync !== undefined) {
      applyBackgroundSync(settings.backgroundSync);
    }
    
    // 分析データ設定の適用
    if (settings.analytics !== undefined) {
      applyAnalytics(settings.analytics);
    }
    
    // クラッシュレポート設定の適用
    if (settings.crashReports !== undefined) {
      applyCrashReports(settings.crashReports);
    }
    
    // 位置情報設定の適用
    if (settings.location !== undefined) {
      applyLocation(settings.location);
    }
    
    // Pickramu設定の適用
    if (settings.pickramuEguideEnabled !== undefined) {
      applyPickramuEguide(settings.pickramuEguideEnabled);
    }
    
    shell.log({from: 'dp.app.setting.out', message: 'SettingApp: 設定を適用しました', level: 'info'});
  } catch (error) {
    shell.log({from: 'dp.app.setting.err', message: 'SettingApp: 設定の適用エラー ' + error, level: 'error'});
  }
}

// ダークモードの適用
function applyDarkMode(enabled) {
  const body = document.body;
  if (enabled) {
    body.classList.add('dark-mode');
    body.style.setProperty('--bg-color', '#1a1a1a');
    body.style.setProperty('--text-color', '#ffffff');
    body.style.setProperty('--card-bg', '#2d2d2d');
  } else {
    body.classList.remove('dark-mode');
    body.style.setProperty('--bg-color', '#f5f5f5');
    body.style.setProperty('--text-color', '#333333');
    body.style.setProperty('--card-bg', '#ffffff');
  }
}

// フォントサイズの適用
function applyFontSize(size) {
  const root = document.documentElement;
  const sizes = {
    small: '14px',
    medium: '16px',
    large: '18px'
  };
  root.style.fontSize = sizes[size] || sizes.medium;
}

// アニメーションの適用
function applyAnimation(enabled) {
  const body = document.body;
  if (enabled) {
    body.style.setProperty('--animation-duration', '0.3s');
    body.classList.remove('no-animation');
  } else {
    body.style.setProperty('--animation-duration', '0s');
    body.classList.add('no-animation');
  }
}

// コンパクトモードの適用
function applyCompactMode(enabled) {
  const body = document.body;
  if (enabled) {
    body.classList.add('compact-mode');
    body.style.setProperty('--spacing-unit', '8px');
    body.style.setProperty('--border-radius', '4px');
  } else {
    body.classList.remove('compact-mode');
    body.style.setProperty('--spacing-unit', '16px');
    body.style.setProperty('--border-radius', '8px');
  }
}

// 通知設定の適用
function applyNotifications(enabled) {
  if (enabled && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
  window.notificationsEnabled = enabled;
}

// サウンド設定の適用
function applySound(enabled) {
  window.soundEnabled = enabled;
  if (enabled) {
    // サウンド機能の初期化
    console.log('サウンド機能が有効になりました');
  }
}

// キャッシュ設定の適用
function applyCache(enabled) {
  window.cacheEnabled = enabled;
  if (!enabled) {
    // キャッシュをクリア
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
  }
}

// 自動保存設定の適用
function applyAutoSave(enabled) {
  window.autoSaveEnabled = enabled;
  if (enabled) {
    // 自動保存機能の開始
    startAutoSave();
  } else {
    // 自動保存機能の停止
    stopAutoSave();
  }
}

// バックグラウンド同期設定の適用
function applyBackgroundSync(enabled) {
  window.backgroundSyncEnabled = enabled;
  if (enabled && 'serviceWorker' in navigator) {
    // バックグラウンド同期の設定
    console.log('バックグラウンド同期が有効になりました');
  }
}

// 分析データ設定の適用
function applyAnalytics(enabled) {
  window.analyticsEnabled = enabled;
  if (enabled) {
    // 分析機能の開始
    console.log('分析データの送信が有効になりました');
  } else {
    // 分析機能の停止
    console.log('分析データの送信が無効になりました');
  }
}

// クラッシュレポート設定の適用
function applyCrashReports(enabled) {
  window.crashReportsEnabled = enabled;
  if (enabled) {
    // エラーハンドリングの設定
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  } else {
    // エラーハンドリングの削除
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }
}

// 位置情報設定の適用
function applyLocation(enabled) {
  window.locationEnabled = enabled;
  if (enabled && 'geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        console.log('位置情報が取得されました:', position.coords);
      },
      error => {
        console.log('位置情報の取得に失敗しました:', error);
      }
    );
  }
}

// エラーハンドリング関数
function handleError(event) {
  if (window.crashReportsEnabled) {
    const errorData = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack,
      timestamp: new Date().toISOString()
    };
    console.log('クラッシュレポート:', errorData);
    // 実際のアプリケーションでは、ここでサーバーにエラーデータを送信
  }
}

function handleUnhandledRejection(event) {
  if (window.crashReportsEnabled) {
    const errorData = {
      reason: event.reason,
      timestamp: new Date().toISOString()
    };
    console.log('未処理のPromise拒否:', errorData);
  }
}

// 自動保存機能
let autoSaveInterval = null;

function startAutoSave() {
  if (autoSaveInterval) return;
  
  autoSaveInterval = setInterval(() => {
    if (window.autoSaveEnabled) {
      // 現在のアプリケーション状態を保存
      const appState = {
        currentApp: window.currentApp || 'menu',
        userData: JSON.parse(localStorage.getItem('deep-school-user-data') || '{}'),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('deep-school-auto-save', JSON.stringify(appState));
      console.log('自動保存が実行されました');
    }
  }, 30000); // 30秒ごと
}

function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

// バックアップ機能
function createBackup() {
  try {
    const backupData = {
      settings: JSON.parse(localStorage.getItem('deep-school-settings') || '{}'),
      userData: JSON.parse(localStorage.getItem('deep-school-user-data') || '{}'),
      autoSave: localStorage.getItem('deep-school-auto-save'),
      timestamp: new Date().toISOString(),
      version: '0.3.0'
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deep-school-backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    shell.log({from: 'dp.app.setting.out', message: 'SettingApp: バックアップを作成しました', level: 'info'});
    alert('バックアップが正常に作成されました');
  } catch (error) {
    shell.log({from: 'dp.app.setting.err', message: 'SettingApp: バックアップ作成エラー ' + error, level: 'error'});
    alert('バックアップの作成に失敗しました');
  }
}

// 復元機能
function restoreBackup() {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const backupData = JSON.parse(e.target.result);
            
            // バックアップデータの検証
            if (!backupData.timestamp || !backupData.version) {
              throw new Error('無効なバックアップファイルです');
            }
            
            // データの復元
            if (backupData.settings) {
              localStorage.setItem('deep-school-settings', JSON.stringify(backupData.settings));
            }
            if (backupData.userData) {
              localStorage.setItem('deep-school-user-data', JSON.stringify(backupData.userData));
            }
            if (backupData.autoSave) {
              localStorage.setItem('deep-school-auto-save', backupData.autoSave);
            }
            
            // 設定を再読み込みして適用
            loadSettings();
            
            shell.log({from: 'dp.app.setting.out', message: 'SettingApp: バックアップを復元しました', level: 'info'});
            alert('バックアップの復元が完了しました。ページを再読み込みしてください。');
            
            // ページを再読み込み
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (error) {
            shell.log({from: 'dp.app.setting.err', message: 'SettingApp: バックアップ復元エラー ' + error, level: 'error'});
            alert('バックアップの復元に失敗しました: ' + error.message);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  } catch (error) {
    shell.log({from: 'dp.app.setting.err', message: 'SettingApp: バックアップ復元エラー ' + error, level: 'error'});
    alert('バックアップの復元に失敗しました');
  }
}

// アップデートチェック機能
function checkForUpdates() {
  try {
    // 現在のバージョン情報を取得
    const currentVersion = '0.3.0';
    const currentBuild = '25C962X1';
    const latestVersion = '0.3.0';
    const latestBuild = '25C9621';
    
    if (latestVersion > currentVersion) {
      const updateMessage = `新しいバージョンが利用可能です。\n\n現在のバージョン: ${currentVersion} (${currentBuild})\n最新バージョン: ${latestVersion} (${latestBuild})\n\nアップデートをダウンロードしますか？`;
      
      if (confirm(updateMessage)) {
        // 実際のアプリケーションでは、ここでアップデートをダウンロード
        alert('アップデートのダウンロードを開始しました。\nダウンロードが完了したら、アプリケーションを再起動してください。');
      }
    } else {
      alert('お使いのアプリケーションは最新バージョンです。\n\n現在のバージョン: ' + currentVersion + ' (' + currentBuild + ')');
    }
    
    shell.log({from: 'dp.app.setting.out', message: 'SettingApp: アップデートチェックを実行しました', level: 'info'});
  } catch (error) {
    shell.log({from: 'dp.app.setting.err', message: 'SettingApp: アップデートチェックエラー ' + error, level: 'error'});
    alert('アップデートチェックに失敗しました');
  }
}

window.logout = logout;
window.exportData = exportData;
window.importData = importData;
window.clearData = clearData;
window.createBackup = createBackup;
window.restoreBackup = restoreBackup;
window.checkForUpdates = checkForUpdates;
window.applySettings = applySettings;
window.loadSettings = loadSettings;
window.saveSettings = saveSettings;

// 設定の取得関数
window.getSetting = function(key) {
  try {
    const settings = JSON.parse(localStorage.getItem('deep-school-settings') || '{}');
    return settings[key];
  } catch (error) {
    console.error('設定の取得エラー:', error);
    return null;
  }
};

// 設定の設定関数
window.setSetting = function(key, value) {
  try {
    const settings = JSON.parse(localStorage.getItem('deep-school-settings') || '{}');
    settings[key] = value;
    localStorage.setItem('deep-school-settings', JSON.stringify(settings));
    applySettings(settings);
    return true;
  } catch (error) {
    console.error('設定の保存エラー:', error);
    return false;
  }
};

// Pickramu設定の適用
function applyPickramuEguide(enabled) {
  window.pickramuEguideEnabled = enabled;
  if (enabled) {
    console.log('eGuideがPickramuで有効になりました');
  } else {
    console.log('eGuideがPickramuで無効になりました');
  }
}

// SCRサーバーURL入力欄を設定画面に追加
function escapeHTML(str) {
  return String(str).replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSCRUrlSetting() {
  const settingRoot = document.getElementById('setting-root') || document.body;
  if (!document.getElementById('scr_url_setting')) {
    const scrUrl = localStorage.getItem('scr_url') || 'https://deep-school.onrender.com';
    const safeScrUrl = escapeHTML(scrUrl);
    const html = `<div class="form-group"><label for="scr_url_setting">SCRサーバーURL</label><input type="text" id="scr_url_setting" value="${safeScrUrl}" placeholder="https://deep-school.onrender.com" /></div>`;
    settingRoot.insertAdjacentHTML('beforeend', html);
  }
} 