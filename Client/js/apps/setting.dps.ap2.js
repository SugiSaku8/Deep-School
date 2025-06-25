import { SimpleAuthManager } from '../auth/auth.mjs';

export const appMeta = {
  name: "setting",
  title: "設定",
  icon: "re/ico/Setting.png"
};

export function appInit(shell) {
  console.log("SettingApp: 初期化開始");

  // HTMLを#app-rootに描画
  const root = document.getElementById('app-root');
  if (!root) {
    console.error('SettingApp: #app-rootが見つかりません');
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
          <button class="auto-btn" id="logout-btn" data-lang-key="logout">ログアウト</button>
        </div>
        <div class="setting-section">
          <h2>表示設定</h2>
          <div class="setting-item">
            <label for="dark-mode-toggle">ダークモード:</label>
            <input type="checkbox" id="dark-mode-toggle" checked>
          </div>
          <div class="setting-item">
            <label for="font-size-select">フォントサイズ:</label>
            <select id="font-size-select">
              <option value="small">小</option>
              <option value="medium" selected>中</option>
              <option value="large">大</option>
            </select>
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
            <button class="auto-btn danger" id="clear-btn" data-lang-key="clear_data">データをクリア</button>
          </div>
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

  console.log("SettingApp: 初期化完了");
}

function updateUserInfo() {
  const usernameElement = document.getElementById('setting-username');
  const useridElement = document.getElementById('setting-userid');
  if (usernameElement) usernameElement.textContent = window.googleUserName || '未設定';
  if (useridElement) useridElement.textContent = window.googleUserId || '未設定';
}

function loadSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('deep-school-settings') || '{}');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) darkModeToggle.checked = settings.darkMode !== false;
    const fontSizeSelect = document.getElementById('font-size-select');
    if (fontSizeSelect) fontSizeSelect.value = settings.fontSize || 'medium';
    const notificationToggle = document.getElementById('notification-toggle');
    if (notificationToggle) notificationToggle.checked = settings.notifications !== false;
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) soundToggle.checked = settings.sound !== false;
    console.log("SettingApp: 設定を読み込みました");
  } catch (error) {
    console.error("SettingApp: 設定の読み込みエラー", error);
  }
}

function saveSettings() {
  try {
    const settings = {
      darkMode: document.getElementById('dark-mode-toggle')?.checked ?? true,
      fontSize: document.getElementById('font-size-select')?.value ?? 'medium',
      notifications: document.getElementById('notification-toggle')?.checked ?? true,
      sound: document.getElementById('sound-toggle')?.checked ?? true
    };
    localStorage.setItem('deep-school-settings', JSON.stringify(settings));
    console.log("SettingApp: 設定を保存しました", settings);
  } catch (error) {
    console.error("SettingApp: 設定の保存エラー", error);
  }
}

function setupEventListeners(shell) {
  ['dark-mode-toggle','font-size-select','notification-toggle','sound-toggle'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.addEventListener('change', saveSettings);
  });
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('ログアウトしますか？')) {
        logout();
        shell.loadApp('login');
      }
    });
  }
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) exportBtn.addEventListener('click', exportData);
  const importBtn = document.getElementById('import-btn');
  if (importBtn) importBtn.addEventListener('click', importData);
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
        clearData();
      }
    });
  }
}

function logout() {
  try {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_timestamp');
    window.googleUserName = null;
    window.googleUserId = null;
    console.log("SettingApp: ログアウト完了");
  } catch (error) {
    console.error("SettingApp: ログアウトエラー", error);
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
    console.log("SettingApp: データをエクスポートしました");
  } catch (error) {
    console.error("SettingApp: データエクスポートエラー", error);
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
            console.log("SettingApp: データをインポートしました");
            alert('データのインポートが完了しました');
          } catch (error) {
            console.error("SettingApp: データインポートエラー", error);
            alert('データのインポートに失敗しました');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  } catch (error) {
    console.error("SettingApp: データインポートエラー", error);
    alert('データのインポートに失敗しました');
  }
}

function clearData() {
  try {
    const keysToKeep = ['deep-school-settings'];
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key)) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log("SettingApp: データをクリアしました");
    alert('データのクリアが完了しました');
  } catch (error) {
    console.error("SettingApp: データクリアエラー", error);
    alert('データのクリアに失敗しました');
  }
}

window.logout = logout;
window.exportData = exportData;
window.importData = importData;
window.clearData = clearData; 