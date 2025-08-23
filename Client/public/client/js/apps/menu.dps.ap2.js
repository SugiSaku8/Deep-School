export const appMeta = {
  name: "menu",
  title: "メニュー",
  icon: "re/ico/menu.svg",
};

export function appInit(shell) {
  shell.log({
    from: "dp.app.menu.out",
    message: "MenuApp: 初期化開始",
    level: "info",
  });

  // チュートリアル進行用ステップ
  const tutorialSteps = [
    {
      id: "menu-toaster",
      title: "ToasterMachineへようこそ",
      desc: "AIチャットで質問や相談ができます。まずはここから、今わからないことを教えてもらいましょう。始めましょう。",
    },
    {
      id: "menu-pickramu",
      title: "Pickramu（教材ワーク）",
      desc: "自由に教材を選んでどこでも学習・演習ができます。自分のペースで進めましょう。",
    },
    {
      id: "menu-scr",
      title: "SCR",
      desc: "わからないことがあったら、友達に聞きましょう。AIもいいけれど、人による支援の方がいいこともあるでしょう。すべてのツールを有効活用するのがおすすめです。",
    },
  ];

  // チュートリアル表示条件
  const isDemoUser = window.isDemoUser;
  const tutorialCompleted = localStorage.getItem("tutorialCompleted");
  const shouldShowTutorial = isDemoUser || !tutorialCompleted;

  // HTMLを#app-rootに描画
  const root = document.getElementById("app-root");
  if (!root) {
    shell.log({
      from: "dp.app.menu.err",
      message: "MenuApp: #app-rootが見つかりません",
      level: "error",
    });
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
          <img src="re/ico/Pickramu.png" alt="Pickramuアイコン" class="menu-icon" />
          <div class="menu-label chalk-text" id="menu-pickramu" style="cursor: pointer" data-lang-key="menu_pickramu">Pickramu</div>
        </div> 
        
           <div class="menu-item">
          <img src="re/ico/MoralFruite-new-icon-v2.png" alt="MoralFruitアイコン" class="menu-icon" />
          <div class="menu-label chalk-text" id="menu-moralfruite" style="cursor: pointer" data-lang-key="menu_feedback">MoralFruit</div>
        </div>
         
        <div class="menu-item">
          <img src="re/ico/Koodi-Studio-icon.png" alt="KoodiStudioアイコン" class="menu-icon" />
          <div class="menu-label chalk-text" id="menu-koodistudio" style="cursor: pointer" data-lang-key="menu_koodistudio">KoodiStudio</div>
        </div>

         <div class="menu-item">
          <img src="re/ico/skrift.png" alt="Skriftアイコン" class="menu-icon" />
          <div class="menu-label chalk-text" id="menu-skrift" style="cursor: pointer" data-lang-key="menu_skrift">Skrift</div>
        </div>

        <div class="menu-item">
          <img src="re/ico/Setting.png" alt="設定アイコン" class="menu-icon" />
          <div class="menu-label chalk-text" id="menu-setting" style="cursor: pointer" data-lang-key="menu_setting">設定</div>
       </div>
        
        <div class="menu-item">
          <img src="re/ico/feed.svg" alt="フィードバックアイコン" class="menu-icon" />
          <div class="menu-label chalk-text" id="menu-feedback" style="cursor: pointer" data-lang-key="menu_feedback">フィードバック</div>
        </div>

        
      </div>
    </div>
    
    <div class="copyright-container horizontal-copyright">
      <p class="copyright chalk-text left-align" data-lang-key="copyright">(c) 2022-2025 Carnation Studio v0.4.2 25C1285X1</p>
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
  
  /* Blackboard Panel - Vertical Chalk Style */
  .blackboard-panel {
    width: 280px;
    min-height: 100vh;
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%);
    border-radius: 0 20px 20px 0;
    border: 3px solid #1a252f;
    border-left: none;
    box-shadow: 
      0 10px 30px rgba(0, 0, 0, 0.3),
      inset 0 2px 4px rgba(255, 255, 255, 0.1),
      inset 0 -2px 4px rgba(0, 0, 0, 0.2);
    position: relative;
    overflow: hidden;
    writing-mode: vertical-rl;
    text-orientation: mixed;
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
    padding: 2rem 1rem;
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }
  
  .blackboard-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 3rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }
  
  .chalk-icon {
    font-size: 2.5rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    writing-mode: horizontal-tb;
  }
  
  .blackboard-header h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #ecf0f1;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    font-family: 'Courier New', monospace;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    letter-spacing: 0.2em;
  }
  
  .info-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }
  
  .info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    padding: 1.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    writing-mode: vertical-rl;
    text-orientation: mixed;
    min-height: 200px;
  }
  
  .info-label {
    font-size: 1rem;
    color: #bdc3c7;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    font-family: 'Courier New', monospace;
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }
  
  .info-value {
    font-size: 1.3rem;
    color: #ecf0f1;
    font-weight: 700;
    font-family: 'Courier New', monospace;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    writing-mode: vertical-rl;
    text-orientation: mixed;
    letter-spacing: 0.1em;
    text-align: center;
    line-height: 1.8;
  }
  
  /* Copyright Container */
  .copyright-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .copyright {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
    margin: 0;
    padding: 0;
    font-family: 'Courier New', monospace;
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
    
    .copyright-container {
      background: rgba(0, 0, 0, 0.4);
    }
  }
  
  /* Responsive design */
  @media (max-width: 1200px) {
    .menu-container {
      flex-direction: column;
      align-items: center;
      padding-bottom: 4rem; /* Space for copyright */
    }
    
    .blackboard-panel {
      width: 100%;
      max-width: 500px;
      min-height: 300px;
      order: -1;
      writing-mode: horizontal-tb;
      border-radius: 20px;
      border: 3px solid #1a252f;
    }
    
    .blackboard-content {
      writing-mode: horizontal-tb;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      padding: 2rem;
    }
    
    .blackboard-header {
      writing-mode: horizontal-tb;
      flex-direction: row;
      margin-bottom: 0;
      margin-right: 2rem;
    }
    
    .blackboard-header h2 {
      writing-mode: horizontal-tb;
    }
    
    .info-section {
      flex-direction: row;
      gap: 2rem;
    }
    
    .info-item {
      writing-mode: horizontal-tb;
      min-height: auto;
      min-width: 150px;
    }
    
    .info-label {
      writing-mode: horizontal-tb;
    }
    
    .info-value {
      writing-mode: horizontal-tb;
    }
  }
  
  @media (max-width: 768px) {
    .menu-container {
      padding: 1rem;
      padding-bottom: 3.5rem; /* Space for copyright */
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
      min-height: 250px;
    }
    
    .blackboard-content {
      padding: 1.5rem;
      flex-direction: column;
      gap: 1rem;
    }
    
    .blackboard-header {
      margin-bottom: 1rem;
      margin-right: 0;
    }
    
    .info-section {
      flex-direction: column;
      gap: 1rem;
    }
    
    .info-item {
      min-width: auto;
      padding: 1rem;
    }
    
    .copyright-container {
      padding: 0.5rem;
    }
    
    .copyright {
      font-size: 0.7rem;
    }
  }
  </style>
`;

  let disabled = ` 
         <div class="menu-item">
          <img src="re/ico/game.svg" alt="GameMakerアイコン" class="menu-icon" />
          <div class="menu-label chalk-text" id="menu-gamemaker" style="cursor: pointer" data-lang-key="menu_gamemaker">GameMaker</div>
        </div>
      
        `;

  // メニューアイテムの設定
  const menuItems = {
    "menu-toaster": () => {
      shell.log({
        from: "dp.app.menu.out",
        message: "MenuApp: ToasterMachineを開く",
        level: "info",
      });
      shell.loadApp("chat"); // chatアプリとして開く
    },
    "menu-scr": () => {
      shell.log({
        from: "dp.app.menu.out",
        message: "MenuApp: SCRを開く",
        level: "info",
      });
      shell.loadApp("scr");
    },
    "menu-setting": () => {
      shell.log({
        from: "dp.app.menu.out",
        message: "MenuApp: 設定を開く",
        level: "info",
      });
      shell.loadApp("setting");
    },
    "menu-pickramu": () => {
      shell.log({
        from: "dp.app.menu.out",
        message: "MenuApp: Pickramuを開く",
        level: "info",
      });
      shell.loadApp("pickramu");
    },
    "menu-moralfruite": () => {
      shell.log({from: 'dp.app.menu.out', message: 'MenuApp: MoralFruitを開く', level: 'info'});
      shell.loadApp('moralfruit');
    } /*
    'menu-gamemaker': () => {
      shell.log({from: 'dp.app.menu.out', message: 'MenuApp: GameMakerを開く', level: 'info'});
      shell.loadApp('gamemaker');
    },*/,
    "menu-feedback": () => {
      shell.log({
        from: "dp.app.menu.out",
        message: "MenuApp: フィードバックを開く",
        level: "info",
      });
      shell.loadApp("feedback");
    },
    'menu-koodistudio': () => {
      shell.log({from: 'dp.app.menu.out', message: 'MenuApp: KoodiStudioを開く', level: 'info'});
      shell.loadApp('koodistudio');
    },
    'menu-skrift': () => {
      shell.log({from: 'dp.app.menu.out', message: 'SkriftApp: Skriftを開く', level: 'info'});
      shell.loadApp('skrift');
    },
  };

  // 各メニューアイテムにクリックイベントを設定
  Object.entries(menuItems).forEach(([id, handler]) => {
    const menuItem = document.getElementById(id);
    if (id === "menu-scr") {
      menuItem.onclick = () => {
        handler();
      };
    } else {
      menuItem.onclick = handler;
    }
    if (menuItem) {
      shell.log({
        from: "dp.app.menu.out",
        message: `MenuApp: ${id}のイベントリスナーを設定`,
        level: "info",
      });
    } else {
      shell.log({
        from: "dp.app.menu.err",
        message: `MenuApp: ${id}のメニューアイテムが見つかりません`,
        level: "warn",
      });
    }
  });

  // parallax effects disabled

  // ユーザー情報の表示（ログイン済みの場合）
  if (window.googleUserName) {
    shell.log({
      from: "dp.app.menu.out",
      message:
        "MenuApp: ユーザー情報 " +
        JSON.stringify({
          name: window.googleUserName,
          id: window.googleUserId,
        }),
      level: "info",
    });
  }

  // チュートリアルUI挿入（menu画面上でアイコン強調）
  if (shouldShowTutorial) {
    let step = 0;
    function showTutorialStep(idx) {
      // すべての強調をリセット
      tutorialSteps.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el) {
          el.classList.remove("ds-tutorial-highlight");
          el.style.zIndex = "";
        }
      });
      // オーバーレイを消す
      const oldOverlay = document.getElementById("ds-tutorial-overlay");
      if (oldOverlay) oldOverlay.remove();
      // ダイアログを消す
      const oldModal = document.getElementById("ds-tutorial-modal");
      if (oldModal) oldModal.remove();

      if (idx >= tutorialSteps.length) {
        localStorage.setItem("tutorialCompleted", "1");
        return;
      }
      const s = tutorialSteps[idx];
      // 対象アイコンを強調
      const el = document.getElementById(s.id);
      if (el) {
        el.classList.add("ds-tutorial-highlight");
        el.style.zIndex = 2001;
        // オーバーレイ生成
        const overlay = document.createElement("div");
        overlay.id = "ds-tutorial-overlay";
        Object.assign(overlay.style, {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.7)",
          zIndex: 2000,
        });
        document.body.appendChild(overlay);
        // ダイアログ生成
        const modal = document.createElement("div");
        modal.id = "ds-tutorial-modal";
        modal.innerHTML = `
          <div class=\"ds-tutorial-content\" role=\"dialog\" aria-modal=\"true\" tabindex=\"-1\">
            <h2 class=\"ds-tutorial-title\">${s.title}</h2>
            <p class=\"ds-tutorial-desc\">${s.desc}</p>
            <button class=\"ds-tutorial-next button-chalk\" id=\"ds-tutorial-next-btn\">${
              idx < tutorialSteps.length - 1 ? "次へ" : "完了"
            }</button>
          </div>
        `;
        Object.assign(modal.style, {
          position: "fixed",
          zIndex: 2002,
          left: "50%",
          top: "70%",
          transform: "translate(-50%, 0)",
          background: "rgba(30,30,40,0.98)",
          color: "#fff",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          padding: "2.5rem 2rem",
          maxWidth: "90vw",
          minWidth: "320px",
          textAlign: "center",
          outline: "none",
        });
        document.body.appendChild(modal);
        // ボタン挙動
        const nextBtn = modal.querySelector("#ds-tutorial-next-btn");
        nextBtn.onclick = () => showTutorialStep(idx + 1);
        nextBtn.onkeydown = (e) => {
          if (e.key === "Enter" || e.key === " ") nextBtn.click();
        };
        nextBtn.focus();
        // ボタンの追加スタイル
        Object.assign(nextBtn.style, {
          fontSize: "1.1rem",
          fontWeight: "600",
          borderRadius: "16px",
          padding: "0.8em 2.2em",
          border: "none",
          background: "#ced8eb",
          color: "#222",
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          cursor: "pointer",
          marginTop: "1.5rem",
        });
        // スクロールして強調アイコンを中央付近に
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 200);
      }
    }
    // 強調用CSSを追加
    if (!document.getElementById("ds-tutorial-style")) {
      const style = document.createElement("style");
      style.id = "ds-tutorial-style";
      style.textContent = `
        .ds-tutorial-highlight {
          box-shadow: 0 0 0 6px #fff, 0 0 32px 12px #2196f3cc;
          background: #fff !important;
          color: #222 !important;
          transform: scale(1.08) !important;
          transition: box-shadow 0.3s, background 0.3s, color 0.3s, transform 0.3s;
        }
      `;
      document.head.appendChild(style);
    }
    // menu画面描画後に開始
    setTimeout(() => showTutorialStep(0), 400);
  }

  shell.log({
    from: "dp.app.menu.out",
    message: "MenuApp: 初期化完了",
    level: "info",
  });
}
