export const appMeta = {
  name: "setting",
  title: "設定",
  icon: "re/ico/Setting.png"
};

export const appHtml = `
  <div id="setting-app" class="popup">
    <h2 class="chalk-text">設定</h2>
    <div>
      <label class="chalk-text">ユーザー名</label>
      <input type="text" id="username-setting" readonly />
    </div>
    <div>
      <label class="chalk-text">ユーザーID</label>
      <input type="text" id="userid-setting" readonly />
    </div>
    <button class="button-chalk" id="setting-back">戻る</button>
  </div>
`;

export function appInit(shell) {
  // 戻るボタンでメニューに戻る
  document.getElementById('setting-back').onclick = () => shell.loadApp('menu');
  // ユーザー名・IDの表示例（本来は認証情報から取得）
  document.getElementById('username-setting').value = window.googleUserName || '';
  document.getElementById('userid-setting').value = window.googleUserId || '';
} 