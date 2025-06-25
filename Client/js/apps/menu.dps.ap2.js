export const appMeta = {
  name: "menu",
  title: "メニュー",
  icon: "re/ico/menu.svg"
};

export const appHtml = `
  <div id="menu-app" class="popup">
    <div class="menu-content">
      <div class="menu-item">
        <img src="re/ico/tm.png" alt="ToasterMachineアイコン" class="menu-icon toaster-icon icon-anim" />
        <div class="menu-label chalk-text icon-anim" style="cursor: pointer" id="menu-toaster">ToasterMachine</div>
      </div>
      <div class="menu-item">
        <img src="re/ico/SCR.png" alt="SCRアイコン" class="menu-icon scr-icon icon-anim" />
        <div class="menu-label chalk-text icon-anim" style="cursor: pointer" id="menu-scr">SCR</div>
      </div>
      <div class="menu-item">
        <img src="re/ico/Setting.png" alt="設定アイコン" class="menu-icon setting-icon icon-anim" />
        <div class="menu-label chalk-text icon-anim" style="cursor: pointer" id="menu-setting">設定</div>
      </div>
      <div class="menu-item">
        <img src="re/ico/note.svg" alt="Pickramuアイコン" class="menu-icon pickramu-icon icon-anim" />
        <div class="menu-label chalk-text icon-anim" style="cursor: pointer" id="menu-pickramu">Pickramu</div>
      </div>
    </div>
  </div>
`;

export function appInit(shell) {
  console.log("MenuApp: 初期化開始");
  
  // メニューアイテムの設定
  const menuItems = {
    'toaster': () => {
      console.log("MenuApp: ToasterMachineを開く");
      shell.loadApp('chat'); // chatアプリとして開く
    },
    'scr': () => {
      console.log("MenuApp: SCRを開く");
      shell.loadApp('scr');
    },
    'setting': () => {
      console.log("MenuApp: 設定を開く");
      shell.loadApp('setting');
    },
    'pickramu': () => {
      console.log("MenuApp: Pickramuを開く");
      shell.loadApp('pickramu');
    }
  };
  
  // 各メニューアイテムにクリックイベントを設定
  Object.entries(menuItems).forEach(([appName, handler]) => {
    const menuItem = document.querySelector(`[data-menu-item="${appName}"]`);
    if (menuItem) {
      menuItem.addEventListener('click', handler);
      console.log(`MenuApp: ${appName}のイベントリスナーを設定`);
    } else {
      console.warn(`MenuApp: ${appName}のメニューアイテムが見つかりません`);
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