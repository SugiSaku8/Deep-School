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
        <img src="re/ico/tm.png" alt="ToasterMachineアイコン" class="menu-icon" />
        <div class="menu-label chalk-text" id="menu-toaster" style="cursor: pointer" data-lang-key="menu_toaster">
          ToasterMachine
        </div>
      </div>
      <div class="menu-item" id="scr_menu_icon">
        <img src="re/ico/SCR.png" alt="SCRアイコン" class="menu-icon" />
        <div class="menu-label chalk-text" id="menu-scr" style="cursor: pointer" data-lang-key="menu_scr">
          SCR
        </div>
      </div>
      <div class="menu-item">
        <img src="re/ico/Setting.png" alt="設定アイコン" class="menu-icon" />
        <div class="menu-label chalk-text" id="menu-setting" style="cursor: pointer" data-lang-key="menu_setting">設定</div>
      </div>
      <div class="menu-item">
        <img src="re/ico/note.svg" alt="Pickramuアイコン" class="menu-icon" />
        <div class="menu-label chalk-text" id="menu-pickramu" style="cursor: pointer" data-lang-key="menu_pickramu">Pickramu</div>
    </div>
  </div>
  
  <style>
  /* Enhanced menu styles with horizontal layout and hover-only animations */
  .menu-content {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
    min-height: 100vh;
    flex-wrap: wrap;
  }
  
  .menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(20px);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    min-width: 200px;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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
    opacity: 0;
  }
  
  .menu-item:hover::before {
    left: 100%;
    opacity: 1;
  }
  
  .menu-item:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15),
                0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .menu-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    transition: all 0.3s ease;
  }
  
  .menu-item:hover .menu-icon {
    transform: scale(1.1) rotate(5deg);
    filter: brightness(1.1) contrast(1.1);
  }
  
  .menu-label {
    font-size: 1.2rem;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    text-align: center;
  }
  
  .menu-item:hover .menu-label {
    transform: translateY(-2px);
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
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
  
  /* Responsive design */
  @media (max-width: 768px) {
    .menu-content {
      flex-direction: column;
      gap: 1.5rem;
      padding: 2rem 1rem;
    }
    
    .menu-item {
      min-width: 180px;
      padding: 1.5rem;
    }
    
    .menu-icon {
      width: 48px;
      height: 48px;
    }
    
    .menu-label {
      font-size: 1rem;
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

  // Initialize parallax effects for menu items (hover only)
  if (window.parallaxManager) {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      window.parallaxManager.addParallaxEffects(item, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: false
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