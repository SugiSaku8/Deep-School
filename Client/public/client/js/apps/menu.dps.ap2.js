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
  
  <style>
  /* Enhanced menu styles with parallax effects */
  .menu-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 40px 20px;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(20px);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
  }
  
  .menu-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  .menu-item:hover::before {
    left: 100%;
  }
  
  .menu-item:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15),
                0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .menu-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    transition: all 0.3s ease;
  }
  
  .menu-item:hover .menu-icon {
    transform: scale(1.1) rotate(5deg);
    filter: brightness(1.1) contrast(1.1);
  }
  
  .menu-label {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
  }
  
  .menu-item:hover .menu-label {
    transform: translateX(5px);
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  }
  
  .notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #ff3b30;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  /* Dark mode adjustments */
  @media (prefers-color-scheme: dark) {
    .menu-item {
      background: rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.1);
    }
    
    .menu-item:hover {
      background: rgba(0, 0, 0, 0.4);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
  </style>
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

  // Initialize parallax effects for menu items
  if (window.parallaxManager) {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      window.parallaxManager.addParallaxEffects(item, {
        hover: true,
        mouse: true,
        touch: true,
        ripple: true
      });
    });
    shell.log({from: 'dp.app.menu.out', message: 'MenuApp: Parallax effects initialized', level: 'info'});
  }

  // ユーザー情報の表示（ログイン済みの場合）
  if (window.googleUserName) {
    shell.log({from: 'dp.app.menu.out', message: 'MenuApp: ユーザー情報 ' + JSON.stringify({name: window.googleUserName, id: window.googleUserId}), level: 'info'});
  }

  shell.log({from: 'dp.app.menu.out', message: 'MenuApp: 初期化完了', level: 'info'});
} 