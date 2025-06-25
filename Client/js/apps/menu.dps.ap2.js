export const appMeta = {
  name: "menu",
  title: "メニュー",
  icon: "re/ico/menu.svg"
};

export function appInit(shell) {
  console.log("MenuApp: 初期化開始");

  // HTMLを#app-rootに描画
  const root = document.getElementById('app-root');
  if (!root) {
    console.error('MenuApp: #app-rootが見つかりません');
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
      console.log("MenuApp: ToasterMachineを開く");
      shell.loadApp('chat'); // chatアプリとして開く
    },
    'menu-scr': () => {
      console.log("MenuApp: SCRを開く");
      shell.loadApp('scr');
    },
    'menu-setting': () => {
      console.log("MenuApp: 設定を開く");
      shell.loadApp('setting');
    },
    'menu-pickramu': () => {
      console.log("MenuApp: Pickramuを開く");
      shell.loadApp('pickramu');
    }
  };

  // 各メニューアイテムにクリックイベントを設定
  Object.entries(menuItems).forEach(([id, handler]) => {
    const menuItem = document.getElementById(id);
    if (menuItem) {
      menuItem.onclick = handler;
      console.log(`MenuApp: ${id}のイベントリスナーを設定`);
    } else {
      console.warn(`MenuApp: ${id}のメニューアイテムが見つかりません`);
    }
  });

  // ユーザー情報の表示（ログイン済みの場合）
  if (window.googleUserName) {
    console.log("MenuApp: ユーザー情報", {
      name: window.googleUserName,
      id: window.googleUserId
    });
  }

  console.log("MenuApp: 初期化完了");
} 