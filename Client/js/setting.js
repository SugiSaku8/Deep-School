// 設定画面の表示
export function openSetting() {
  document.getElementById('setting').style.display = 'block';
  document.getElementById('menu').style.display = 'none';
  document.getElementById('pickramu').style.display = 'none';
  document.getElementById('estore').style.display = 'none';
  document.getElementById('toaster_chat').style.display = 'none';
  document.getElementById('scr_app').style.display = 'none';
  // 設定値を反映
  const username = localStorage.getItem('username') || '';
  const darkmode = localStorage.getItem('darkmode') === 'true';
  document.getElementById('username-setting').value = username;
  document.getElementById('darkmode-toggle').checked = darkmode;
}

// 設定の保存
export function saveSettings() {
  const username = document.getElementById('username-setting').value;
  const darkmode = document.getElementById('darkmode-toggle').checked;
  localStorage.setItem('username', username);
  localStorage.setItem('darkmode', darkmode);
  if (darkmode) {
    document.body.classList.add('darkmode');
  } else {
    document.body.classList.remove('darkmode');
  }
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

// ページ初期化時にダークモード反映
export function initSettingDarkmode() {
  const darkmode = localStorage.getItem('darkmode') === 'true';
  if (darkmode) {
    document.body.classList.add('darkmode');
  }
} 