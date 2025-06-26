export const appMeta = {
  name: "menu",
  title: "メニュー",
  icon: "re/ico/menu.svg"
};

export function appInit(shell) {
  shell.log({from: 'dp.app.menu.out', message: 'MenuApp: 初期化開始', level: 'info'});

  // HTMLを#app-rootに描画
  const root = document.getElementById('app-root');
  if (!root) {
    shell.log({from: 'dp.app.menu.err', message: 'MenuApp: #app-rootが見つかりません', level: 'error'});
    return;
  }
  root.innerHTML = `
    <div class="menu-content">
      <div class="menu-item">
        <img src="re/ico/tm.png" alt="ToasterMachineアイコン" class="menu-icon toaster-icon icon-anim" />
        <span class="notification-badge">25</span>
        <div class="menu-label chalk-text icon-anim" id="menu-toaster" style="cursor: pointer" data-lang-key="menu_toaster">
          ToasterMachine
        </div>
      </div>
      <div class="menu-item" id="scr_menu_icon">
        <img src="re/ico/SCR.png" alt="SCRアイコン" class="menu-icon scr-icon icon-anim" />
        <span class="notification-badge">25</span>
        <div class="menu-label chalk-text icon-anim" id="menu-scr" style="cursor: pointer" data-lang-key="menu_scr">
          SCR
        </div>
      </div>
      <div class="menu-item">
        <img src="re/ico/Setting.png" alt="設定アイコン" class="menu-icon setting-icon icon-anim" />
        <div class="menu-label chalk-text icon-anim" id="menu-setting" style="cursor: pointer" data-lang-key="menu_setting">設定</div>
      </div>
      <div class="menu-item">
        <img src="re/ico/note.svg" alt="Pickramuアイコン" class="menu-icon pickramu-icon icon-anim" />
        <div class="menu-label chalk-text icon-anim" id="menu-pickramu" style="cursor: pointer" data-lang-key="menu_pickramu">Pickramu</div>
    </div>
  </div>
`;

  // メニューアイテムの設定
  const menuItems = {
    'menu-toaster': () => {
      shell.log({from: 'dp.app.menu.out', message: 'MenuApp: ToasterMachineを開く', level: 'info'});
      shell.loadApp('chat'); // chatアプリとして開く
    },
    'menu-scr': () => {
      shell.log({from: 'dp.app.menu.out', message: 'MenuApp: SCRを開く', level: 'info'});
      shell.loadApp('scr');
    },
    'menu-setting': () => {
      shell.log({from: 'dp.app.menu.out', message: 'MenuApp: 設定を開く', level: 'info'});
      shell.loadApp('setting');
    },
    'menu-pickramu': () => {
      shell.log({from: 'dp.app.menu.out', message: 'MenuApp: Pickramuを開く', level: 'info'});
      shell.loadApp('pickramu');
    }
  };

  // 各メニューアイテムにクリックイベントを設定
  Object.entries(menuItems).forEach(([id, handler]) => {
    const menuItem = document.getElementById(id);
    if (menuItem) {
      menuItem.onclick = handler;
      shell.log({from: 'dp.app.menu.out', message: `MenuApp: ${id}のイベントリスナーを設定`, level: 'info'});
    } else {
      shell.log({from: 'dp.app.menu.err', message: `MenuApp: ${id}のメニューアイテムが見つかりません`, level: 'warn'});
    }
  });

  // ユーザー情報の表示（ログイン済みの場合）
  if (window.googleUserName) {
    shell.log({from: 'dp.app.menu.out', message: 'MenuApp: ユーザー情報 ' + JSON.stringify({name: window.googleUserName, id: window.googleUserId}), level: 'info'});
  }

  shell.log({from: 'dp.app.menu.out', message: 'MenuApp: 初期化完了', level: 'info'});
} 