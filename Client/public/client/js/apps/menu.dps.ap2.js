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
    <div class="menu-container">
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
      
      <div class="blackboard-panel">
        <div class="blackboard-content">
          <div class="blackboard-header">
            <div class="chalk-icon">📅</div>
            <h2 class="chalk-text">今日の情報</h2>
          </div>
          <div class="info-section">
            <div class="info-item">
              <span class="info-label chalk-text">日付:</span>
              <span class="info-value chalk-text" id="current-date"></span>
            </div>
            <div class="info-item">
              <span class="info-label chalk-text">アカウント:</span>
              <span class="info-value chalk-text" id="user-account"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  
  <style>
  /* Main container */
  .menu-container {
    display: flex;
    min-height: 100vh;
    gap: 2rem;
    padding: 2rem;
  }
  
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
    flex-wrap: wrap;
    flex: 1;
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
  
  /* Blackboard Panel */
  .blackboard-panel {
    width: 350px;
    min-height: 400px;
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%);
    border-radius: 20px;
    border: 3px solid #1a252f;
    box-shadow: 
      0 10px 30px rgba(0, 0, 0, 0.3),
      inset 0 2px 4px rgba(255, 255, 255, 0.1),
      inset 0 -2px 4px rgba(0, 0, 0, 0.2);
    position: relative;
    overflow: hidden;
  }
  
  .blackboard-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
    pointer-events: none;
  }
  
  .blackboard-content {
    padding: 2rem;
    position: relative;
    z-index: 1;
  }
  
  .blackboard-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  }
  
  .chalk-icon {
    font-size: 2rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  
  .blackboard-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #ecf0f1;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    font-family: 'Courier New', monospace;
  }
  
  .info-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .info-label {
    font-size: 0.9rem;
    color: #bdc3c7;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: 'Courier New', monospace;
  }
  
  .info-value {
    font-size: 1.1rem;
    color: #ecf0f1;
    font-weight: 700;
    font-family: 'Courier New', monospace;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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
  @media (max-width: 1200px) {
    .menu-container {
      flex-direction: column;
      align-items: center;
    }
    
    .blackboard-panel {
      width: 100%;
      max-width: 500px;
      order: -1;
    }
  }
  
  @media (max-width: 768px) {
    .menu-container {
      padding: 1rem;
    }
    
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
    
    .blackboard-panel {
      min-height: 300px;
    }
    
    .blackboard-content {
      padding: 1.5rem;
    }
  }
  </style>
`;

  // 日付とアカウント情報を表示
  function updateInfo() {
    const dateElement = document.getElementById('current-date');
    const accountElement = document.getElementById('user-account');
    
    if (dateElement) {
      const now = new Date();
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
      };
      const dateString = now.toLocaleDateString('ja-JP', options);
      dateElement.textContent = dateString;
    }
    
    if (accountElement) {
      if (window.googleUserName) {
        accountElement.textContent = window.googleUserName;
      } else {
        accountElement.textContent = 'ゲストユーザー';
      }
    }
  }

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

  // 情報を更新
  updateInfo();
  
  // 日付を毎日更新
  setInterval(updateInfo, 60000); // 1分ごとに更新

  // ユーザー情報の表示（ログイン済みの場合）
  if (window.googleUserName) {
    shell.log({from: 'dp.app.menu.out', message: 'MenuApp: ユーザー情報 ' + JSON.stringify({name: window.googleUserName, id: window.googleUserId}), level: 'info'});
  }

  shell.log({from: 'dp.app.menu.out', message: 'MenuApp: 初期化完了', level: 'info'});
} 