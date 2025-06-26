// 設定画面の表示
export function openSetting() {
  document.getElementById('setting').style.display = 'block';
  document.getElementById('menu').style.display = 'none';
  document.getElementById('pickramu').style.display = 'none';
  document.getElementById('estore').style.display = 'none';
  document.getElementById('toaster_chat').style.display = 'none';
  document.getElementById('scr_app').style.display = 'none';
  // Googleユーザー名・IDを反映
  const username = (window.deepsys && window.deepsys.username) || window.googleUserName || '';
  const userid = (window.deepsys && window.deepsys.userid) || window.googleUserId || '';
  document.getElementById('username-setting').value = username;
  document.getElementById('username-setting').readOnly = true;
  document.getElementById('userid-setting').value = userid;
  document.getElementById('userid-setting').readOnly = true;
}

// 設定の保存
export function saveSettings() {
  // ユーザー名はGoogleアカウント名を利用
  // 保存処理は現状不要
  backtomenu();
}

// メニューに戻る（設定画面用）
export function backtomenu() {
  document.getElementById('toaster_chat').style.display = 'none';
  document.getElementById('splash').style.display = 'none';
  document.getElementById('scr_app').style.display = 'none';
  document.getElementById('login').style.display = 'none';
  document.getElementById('menu').style.display = 'block';
  document.getElementById('pickramu').style.display = 'none';
  document.getElementById('estore').style.display = 'none';
  document.getElementById('setting').style.display = 'none';
}

// ページ初期化時にGoogleユーザー名をwindow.deepsys.usernameにセット
export function initSettingDarkmode() {
  if (!window.deepsys) window.deepsys = {};
  window.deepsys.username = window.googleUserName || '';
  window.deepsys.userid = window.googleUserId || '';
} 