//moral-model load
import { GeminiIninter, ssession } from "../chat/tm/moralmodel.js";

export const appMeta = {
  name: "moral-fruit",
  title: "Moral-Fruit",
  icon: "re/ico/MoralFruite.png",
};

const aiRoles = ["neutral", "right-wing", "left-wing"];
const aiRoles_esk = {
  neutral:
    "常に中立的であり、客観的な情報を提供します。すべての意見を尊重し、偏りのない視点を維持します。",
  "right-wing":
    "保守的な視点から情報を提供し、伝統的な価値観を重視します。対立する左翼の意見を排除します。",
  "left-wing":
    "革新的な視点から情報を提供し、社会正義と平等を重視します。対立する右翼の意見を排除します。",
};

const themes = [
  { title: "環境保護", description: "地球温暖化対策の必要性" },
  { title: "社会保障", description: "高齢者福祉制度の見直し" },
  { title: "教育改革", description: "学習内容と方法の変革" },
];
window.aiSpeakers = {
  _1: { role: "", result: "" },
  _2: { role: "", result: "" },
  _3: { role: "", result: "" },
};
export function appInit(shell) {
  let theme;
  // Hold menu configuration until user selects a theme
  let pendingCfg = null;
  let sessionStarted = false;
  shell.log({
    from: "dp.app.moralfruit.out",
    message: "MoralFruitApp: 初期化開始",
    level: "info",
  });

  // HTMLを#app-rootに描画
  const root = document.getElementById("app-root");
  

  if (!root) {
    
    shell.log({
      from: "dp.app.MoralFruit.err",
      message: "MoralFruitApp: #app-rootが見つかりません",
      level: "error",
    });
    return;
  }
  // 元のDeep-SchoolメニューHTMLを保存（最初の呼び出し時のみ）
  if (!window.__ds_original_menu__) {
    window.__ds_original_menu__ = root.innerHTML;
  }
  // グローバル戻るボタンを一度だけ追加
  if (!document.getElementById('global-back-btn')) {
    const backBtn = document.createElement('button');
    backBtn.id = 'global-back-btn';
    backBtn.textContent = '← 戻る';
    backBtn.style.position = 'fixed';
    backBtn.style.top = '12px';
    backBtn.style.left = '12px';
    backBtn.style.padding = '6px 10px';
    backBtn.style.border = 'none';
    backBtn.style.borderRadius = '6px';
    backBtn.style.background = '#444';
    backBtn.style.color = '#fff';
    backBtn.style.cursor = 'pointer';
    backBtn.style.zIndex = '1000';
    backBtn.addEventListener('click', () => {
      const menu = document.querySelector('.menu-content');
      const container = document.querySelector('.mf-container');
      // if chat/lesson screen showing -> return to moralfruit internal menu
      if (container && container.style.display !== 'none') {
        if (menu) menu.style.display = 'flex';
        container.style.display = 'none';
        return;
      }
      // else currently on moralfruit menu -> go back to deep-school main menu
      const r = document.getElementById('app-root');
      if (window.__ds_original_menu__ && r) {
        r.innerHTML = window.__ds_original_menu__;
        // optional: remove back button
        backBtn.remove();
      } else {
        // Deep-School ルートに戻す
        const r = document.getElementById('app-root');
        if (window.__ds_original_menu__ && r) {
          r.innerHTML = window.__ds_original_menu__;
        } else {
          window.location.reload();
        }
      }
    });
    document.body.appendChild(backBtn);
  }

  root.innerHTML = `
      <div class="mf-header" style="display:flex;justify-content:center;text-align:center;margin:auto;margin-top:auto; margin-bottom: auto">
        <div class="mf-logo">
          <span style="color: #e400c2">M</span>
          <span style="color: #d600ff">o</span>
          <span style="color: #6a70ff">r</span>
          <span style="color: #0090ff">a</span>
          <span style="color: #00c0ff">l</span>
          <span style="color: #ffe000">F</span>
          <span style="color: #ffc000">r</span>
          <span style="color: #ff9000">u</span>
          <span style="color: #ff5a00">i</span>
          <span style="color: #ff3a00">t</span>
        </div>
      </div>
<br><br><br><br>
      <div class="menu-content">
        <div class="menu-item">
          <img src="re/ico/moral-fruit-war-icon.png" alt="争い" class="menu-icon" />
          <div class="menu-label chalk-text" id="menu-wars" style="cursor: pointer" data-lang-key="menu_toaster">
            争い
          </div>
        </div>
        <div class="menu-item" id="scr_menu_icon">
          <img src="re/ico/moral-fruit-edu-icon.png" alt="学び" class="menu-icon" />
          <div class="menu-label chalk-text" id="menu-edu" style="cursor: pointer" data-lang-key="menu_scr">
            学び
          </div>
        </div>
        <div class="menu-item">
          <img src="re/ico/moral-fruit-die-icon.png" alt="生命" class="menu-icon" />
          <div class="menu-label chalk-text" id="menu-die" style="cursor: pointer" data-lang-key="menu_pickramu">
          生命
          </div>
        </div> 
        
           <div class="menu-item">
          <img src="re/ico/moral-fruit-earth-icon.png" alt="環境" class="menu-icon" />
          <div class="menu-label chalk-text" id="menu-earth" style="cursor: pointer" data-lang-key="menu_feedback">
          環境
          </div>
        </div>
      </div>
      </div>

     <div class="mf-container" style="display: none;">
  
      <div class="mf-chat-box">
        <div class="mf-sidebar">
          <div class="mf-theme-title">テーマ選択</div>
          <div class="mf-theme-btn" id="mf-theme1" onclick="selectTheme(this)"></div>
          <div class="mf-theme-btn" id="mf-theme2" onclick="selectTheme(this)"></div>
          <div class="mf-theme-btn" id="mf-theme3" onclick="selectTheme(this)"></div>
        </div>
        <div class="mf-chat-main" id="mf-chat-main" style="overflow-y:auto;max-height:60vh;">
        </div>
      </div>

      <div class="mf-footer" style="display:flex;gap:8px;padding:8px 16px;">
        <input id="mf-user-input" type="text" placeholder="Ctrl+Enter で送信" style="flex:1;padding:8px;border-radius:6px;border:1px solid #ccc;" />
        <button id="mf-send-btn" style="padding:8px 12px;border:none;border-radius:6px;background:#007aff;color:#fff;cursor:pointer;">送信</button>
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



      
      .mf-container {
        display: none;
      }
      
      .mf-container #mf-container {
        padding: 20px;
      }

      .mf-header {
        display: flex;
        align-items: center;
        background-color: white;
        padding: 10px 20px;
        border-radius: 20px;
        width: fit-content;
        margin-bottom: 20px;
      }

      .mf-logo {
        font-size: 32px;
        font-weight: bold;
        display: inline-block;
        white-space: nowrap;
        letter-spacing: -0.5px;
      }
      .mf-logo span {
        display: inline;
        padding: 0;
        margin: 0;
      }

      .mf-logo span:nth-child(1) {
        color: #e600b3;
      }
      .mf-logo span:nth-child(2) {
        color: #007bff;
      }
      .mf-logo span:nth-child(3) {
        color: #ffa500;
      }

      .mf-icon {
        width: 50px;
        height: 50px;
        background: url("REPLACE_WITH_ICON_IMAGE_PATH") no-repeat center/cover;
        border-radius: 10px;
      }

      .mf-chat-box {
        display: flex;
        background: white;
        border-radius: 40px;
        overflow: hidden;
      }

      .mf-sidebar {
        background: #f0f5fc;
        width: 280px;
        padding: 20px;
        border-top-left-radius: 40px;
        border-bottom-left-radius: 40px;
      }

      .mf-theme-title {
        background: #ccc;
        padding: 20px;
        border-radius: 30px;
        font-size: 24px;
        text-align: center;
        margin-bottom: 20px;
      }

      .mf-theme-btn {
        background: #d9e2f3;
        padding: 16px;
        border-radius: 30px;
        font-size: 20px;
        text-align: center;
        margin-bottom: 16px;
        cursor: pointer;
        user-select: none;
        transition: background 0.2s;
      }

      .mf-theme-btn:hover {
        background-color: #c0d4ef;
      }

      .mf-theme-btn.active {
        background-color: #a4c3e6;
        font-weight: bold;
      }

      .mf-chat-main {
        flex: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 20px;
      }

      .mf-message-bot,
      .mf-message-user {
        border-radius: 30px;
        padding: 14px 24px;
        font-size: 20px;
        max-width: 300px;
      }

      .mf-message-bot {
        align-self: flex-start;
        background: #00cc66;
        color: white;
      }

      .mf-message-user {
        align-self: flex-end;
        background: #007aff;
        color: white;
      }
</style>
<script>
  function addMenuItemListener() {
  console.log('addMenuItemListener: attaching handlers');
    Object.entries(mfmenuItems).forEach(([id, handler]) => {
      const menuItem = document.getElementById(id);
      if (menuItem) {
        menuItem.addEventListener('click', handler);
        shell.log({
          from: "dp.app.menu.out",
          message: 'MenuApp:' + id + 'のイベントリスナーを設定',
          level: "info",
        });
      } else {
        shell.log({
          from: "dp.app.menu.err",
          message: 'MenuApp:' + id + 'のメニューアイテムが見つかりません',
          level: "warn",
        });
      }
    });
  }

  

  const mfmenuItems = {
    "menu-wars": () => {
      shell.log({
        from: "dp.app.moralfruit.out",
        message: "MoralFruitApp: WARSカテゴリで開始",
        level: "info",
      });
      const container = document.querySelector('.mf-container');
      const menuContent = document.querySelector('.menu-content');
      if (container && menuContent) {
        container.style.display = 'block';
        menuContent.style.display = 'none';
      }
      document.getElementById("mf-theme1").textContent = "正しい戦争はあるのか";
      document.getElementById("mf-theme2").textContent = "戦争は人類の進化に必要か";
      document.getElementById("mf-theme3").textContent = "戦争はなくせるのか";
    },
    "menu-edu": () => {
      shell.log({
        from: "dp.app.moralfruit.out",
        message: "MoralFruitApp: EDUカテゴリで開始",
        level: "info",
      });
      const container = document.querySelector('.mf-container');
      const menuContent = document.querySelector('.menu-content');
      if (container && menuContent) {
        container.style.display = 'block';
        menuContent.style.display = 'none';
      }
      document.getElementById("mf-theme1").textContent = "学校に行く必要はあるのか";
      document.getElementById("mf-theme2").textContent = "なぜ学ばなくてはいけないのか";
      document.getElementById("mf-theme3").textContent = "何を学ばなくてはいけないのか";
    },
    "menu-die": () => {
      shell.log({
        from: "dp.app.moralfruit.out",
        message: "MoralFruitApp: DIEカテゴリで開始",
        level: "info",
      });
      const container = document.querySelector('.mf-container');
      const menuContent = document.querySelector('.menu-content');
      if (container && menuContent) {
        container.style.display = 'block';
        menuContent.style.display = 'none';
      }
      document.getElementById("mf-theme1").textContent = "人はなぜ死ぬのか";
      document.getElementById("mf-theme2").textContent = "人はなぜ明日への希望を持つのか";
      document.getElementById("mf-theme3").textContent = "生存競争は必要か";
    },
    "menu-earth": () => {
      shell.log({
        from: "dp.app.moralfruit.out",
        message: "MoralFruitApp: EARTHを開く",
        level: "info",
      });
      const container = document.querySelector('.mf-container');
      const menuContent = document.querySelector('.menu-content');
      if (container && menuContent) {
        container.style.display = 'block';
        menuContent.style.display = 'none';
      }
      document.getElementById("mf-theme1").textContent = "地球環境は守るべきか";
      document.getElementById("mf-theme2").textContent = "自然生物は人間にとって必要か";
      document.getElementById("mf-theme3").textContent = "人間は自然に干渉すべきか";
    },
  };
function addMenuItemListener() {
  Object.entries(mfmenuItems).forEach(([id, handler]) => {
    const menuItem = document.getElementById(id);
    if (menuItem) {
      menuItem.addEventListener('click', handler);
      shell.log({
        from: "dp.app.menu.out",
        message: 'MenuApp:' + id + 'のイベントリスナーを設定',
        level: "info",
      });
    } else {
      shell.log({
        from: "dp.app.menu.err",
        message: 'MenuApp:' + id + 'のメニューアイテムが見つかりません',
        level: "warn",
      });
    }
  });
}
  addMenuItemListener();
  </script>
`;

  // メニューアイテムの設定

   function selectTheme(element) {
     document.querySelectorAll(".mf-theme-btn").forEach((btn) => btn.classList.remove("active"));
     element.classList.add("active");
     theme = element;

     // If a menu has been chosen and session not yet started, start it now
     if (pendingCfg && !sessionStarted) {
       const session = new moral_desk(pendingCfg.themeObj);
       session.start(3);
       sessionStarted = true;
     }
   }
  // expose globally for inline onclick before first use
  window.selectTheme = selectTheme;

  // ----------------- Menu handler setup outside template -----------------
  (function initMenuHandlers() {
    const menuConfig = {
      'menu-wars': {
        themeObj: { title: '戦争', description: '正しい戦争はあるのか' },
        texts: [
          '正しい戦争はあるのか',
          '戦争は人類の進化に必要か',
          '戦争はなくせるのか'
        ]
      },
      'menu-edu': {
        themeObj: { title: '教育', description: '学校に行く必要はあるのか' },
        texts: [
          '学校に行く必要はあるのか',
          'なぜ学ばなくてはいけないのか',
          '何を学ばなくてはいけないのか'
        ]
      },
      'menu-die': {
        themeObj: { title: '生命', description: '人はなぜ死ぬのか' },
        texts: [
          '人はなぜ死ぬのか',
          '人はなぜ明日への希望を持つのか',
          '生存競争は必要か'
        ]
      },
      'menu-earth': {
        themeObj: { title: '環境', description: '地球環境は守るべきか' },
        texts: [
          '地球環境は守るべきか',
          '自然生物は人間にとって必要か',
          '人間は自然に干渉すべきか'
        ]
      }
    };

    function activate(cfg) {
      const container = document.querySelector('.mf-container');
      const menuContent = document.querySelector('.menu-content');
      if (container && menuContent) {
        container.style.display = 'block';
        menuContent.style.display = 'none';
      }
      // set sidebar texts
      ['mf-theme1', 'mf-theme2', 'mf-theme3'].forEach((id, idx) => {
        const el = document.getElementById(id);
        if (el) el.textContent = cfg.texts[idx] || '';
      });
       // store selected menu configuration; actual session will start after theme selection
       pendingCfg = cfg;
    }

    // attach listeners
    Object.entries(menuConfig).forEach(([id, cfg]) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => activate(cfg));
    });
  })();

  function addBotMessage(text) {
    const chat = document.getElementById("mf-chat-main");
    const div = document.createElement("div");
    div.className = "mf-message-bot";
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function addUserMessage(text) {
    const chat = document.getElementById("mf-chat-main");
    const div = document.createElement("div");
    div.className = "mf-message-user";
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }
  function clearMessages() {
    const chat = document.getElementById("mf-chat-main");
    chat.innerHTML = ""; // すべて削除
  }
  class moral_desk {
    constructor(selectedTheme) {
      // Use the selected theme if provided; otherwise fallback to random
      this.theme = selectedTheme || themes[Math.floor(Math.random() * themes.length)];
      // Initialize fresh aiSpeakers for each session
      this.aiSpeakers = {
        _1: { role: "", result: "" },
        _2: { role: "", result: "" },
        _3: { role: "", result: "" }
      };
      this.session = ssession;
      clearMessages();
    }

    async start() {
       this.getTheme();
       this.getAISpeakers();
       this.getSession();

       const inputEl = document.getElementById("mf-user-input");
       const sendBtn = document.getElementById("mf-send-btn");
       if (!inputEl || !sendBtn) {
         console.warn('Input elements not found');
         return;
       }

       const handleSend = async () => {
         const userResponse = this.getUserResponse();
         if (!userResponse) return;
         addUserMessage(userResponse);
         inputEl.value = '';
         const facilitated = this.facilitate();
         const r1 = await this.generateAIresponce(1, facilitated);
         const r2 = await this.generateAIresponce(2, facilitated);
         const r3 = await this.generateAIresponce(3, facilitated);
         this.showAllSpeakersResults(userResponse, r1, r2, r3);
         inputEl.value = '';
       };

       // click and Enter key
       sendBtn.addEventListener('click', handleSend);
       inputEl.addEventListener('keydown', (e) => {
         if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
           e.preventDefault();
           handleSend();
         }
       });
     }
    getTheme() {
      return this.theme;
    }

    getAISpeakers() {
      this.aiSpeakers._1.role = aiRoles[0]; // neutral
      this.aiSpeakers._2.role = aiRoles[1]; // right-wing
      this.aiSpeakers._3.role = aiRoles[2]; // left-wing
    }

    async generateAIresponce(id, prompt) {
      // Ensure id maps to string keys like '_1'
      const key = `_${id}`;
      const speakers = this.aiSpeakers[key];
      if (!speakers) {
        console.warn(`Invalid speaker id: ${id}`);
        return;
      }
      // Ensure session exists
      if (!speakers.session) {
        const gemini = GeminiIninter();
        speakers.session = ssession(gemini);
      }
      const role = speakers.role || 'speaker';
      const fullPrompt = `${prompt.report}\n${role}として回答してください。`;
      try {
        const reply = await speakers.session.start(fullPrompt);
        speakers.result += reply;
        return reply;
      } catch (e) {
        console.error('generateAIresponce error:', e);
      }
    }
    getUserResponse() {
      const input = document.getElementById("mf-user-input");
      if (!input) {
        console.warn('User input element not found');
        return '';
      }
      return input.value.trim();
    }
    getSession() {
      const gemini = GeminiIninter();
      const session = ssession(gemini);
      this.session = session;
    }
    showAllSpeakersResults(user, _1, _2, _3) {
      if(user){ this.user = { result: user }; }
      this.aiSpeakers._1.result += _1;
      addBotMessage(_1);
      this.aiSpeakers._2.result += _2;
      addBotMessage(_2);
      this.aiSpeakers._3.result += _3;
      addBotMessage(_3);
    }
    // Simple latest function that can't be overridden
    latest(speakers) {
      return typeof speakers === 'string' ? speakers : '';
    }
    
    facilitate() {
      // Use a local summary object; do NOT overwrite the facilitate method.
      const summary = {};
      
      // Safely get speaker results
      const getSafeResult = (speaker) => {
        try {
          return (this.aiSpeakers && this.aiSpeakers[speaker] && 
                 typeof this.aiSpeakers[speaker].result === 'string') ? 
                 this.aiSpeakers[speaker].result : '';
        } catch (e) {
          console.error('Error getting speaker result:', e);
          return '';
        }
      };
      
      // Get all speaker results safely
      const results = {
        _1: getSafeResult('_1'),
        _2: getSafeResult('_2'),
        _3: getSafeResult('_3'),
        _4: getSafeResult('_4'),
        _5: getSafeResult('_5'),
        _6: getSafeResult('_6'),
        theme: this.theme || { title: 'テーマ未設定' }
      };
      
      // Build the report string directly
      const userInput = (this.user && typeof this.user.result === 'string') ? 
                       this.user.result : '（まだ入力がありません）';
      
      const report = `
    この討論のテーマは、${results.theme.title || 'テーマ未設定'} です。
    あなたは、この討論に参加しています。
    参加者は、以下の通りです。
    1.中立者
    2.右派
    3.左派
    4.ユーザー
    それぞれの意見者は、次のような意見を述べています。
    1. ${results._1 || '（意見なし）'}
    2. ${results._2 || '（意見なし）'}
    3. ${results._3 || '（意見なし）'}
    4. ${userInput}
    さて、あなたはこの答えのない質問にどのような答えを出しますか？
    他の人と同じ意見ではだめです。
    自分だけの意見を述べてください。
    百文字以内で答えてください。
    あなたは、
    `;
    
      // Return summary (results + report)
      return { ...results, report };
    }
  }

  
  const mfmenuItems = {
    "menu-wars": () => {
      const container = document.querySelector('.mf-container');
      const menuContent = document.querySelector('.menu-content');
      if (container && menuContent) {
        container.style.display = 'block';
        menuContent.style.display = 'none';
      }
      document.getElementById("mf-theme1").textContent = "正しい戦争はあるのか";
      document.getElementById("mf-theme2").textContent = "戦争は人類の進化に必要か";
      document.getElementById("mf-theme3").textContent = "戦争はなくせるのか";
    },
    "menu-edu": () => {
      const container = document.querySelector('.mf-container');
      const menuContent = document.querySelector('.menu-content');
      if (container && menuContent) {
        container.style.display = 'block';
        menuContent.style.display = 'none';
      }
      document.getElementById("mf-theme1").textContent = "学校に行く必要はあるのか";
      document.getElementById("mf-theme2").textContent = "なぜ学ばなくてはいけないのか";
      document.getElementById("mf-theme3").textContent = "何を学ばなくてはいけないのか";
    },
    "menu-die": () => {
      const container = document.querySelector('.mf-container');
      const menuContent = document.querySelector('.menu-content');
      if (container && menuContent) {
        container.style.display = 'block';
        menuContent.style.display = 'none';
      }
      document.getElementById("mf-theme1").textContent = "人はなぜ死ぬのか";
      document.getElementById("mf-theme2").textContent = "人はなぜ明日への希望を持つのか";
      document.getElementById("mf-theme3").textContent = "生存競争は必要か";
    },
    "menu-earth": () => {
      const container = document.querySelector('.mf-container');
      const menuContent = document.querySelector('.menu-content');
      if (container && menuContent) {
        container.style.display = 'block';
        menuContent.style.display = 'none';
      }
      document.getElementById("mf-theme1").textContent = "地球環境は守るべきか";
      document.getElementById("mf-theme2").textContent = "自然生物は人間にとって必要か";
      document.getElementById("mf-theme3").textContent = "人間は自然に干渉すべきか";
    }
  };

  function addMenuItemListener() {
    Object.entries(mfmenuItems).forEach(([id, handler]) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', handler);
    });
  }

  

  shell.log({
    from: "dp.app.moralfruit.out",
    message: "Moral-FruitApp: 初期化完了",
    level: "info",
  });
}
