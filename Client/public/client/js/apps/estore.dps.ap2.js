export const appMeta = {
  name: "estore",
  title: "eストア",
  icon: "re/ico/estore.png"
};

export function appInit(shell) {
  const root = document.getElementById('app-root');
  if (!root) {
    console.error('EStoreApp: #app-rootが見つかりません');
    return;
  }
  root.innerHTML = `
    <div class="page-container">
      <button class="go-back-button" id="estore-back-btn" data-lang-key="back">←</button>
      <h1 class="page-title" data-lang-key="estore">eストア</h1>
      <div class="estore-list" id="estore-list">
        <div class="estore-item card">
          <img src="re/ico/SCR.png" alt="SCRノート" class="estore-item-img" />
          <div class="estore-item-info">
            <div class="estore-item-title">SCRノート</div>
            <div class="estore-item-desc">学習ノートアプリ</div>
            <button class="button-chalk estore-buy-btn" data-item="scr">開く</button>
          </div>
        </div>
        <div class="estore-item card">
          <img src="re/ico/tm.cb.png" alt="ToasterMachine" class="estore-item-img" />
          <div class="estore-item-info">
            <div class="estore-item-title">ToasterMachine</div>
            <div class="estore-item-desc">AIチャット</div>
            <button class="button-chalk estore-buy-btn" data-item="chat">開く</button>
          </div>
      </div>
        <div class="estore-item card">
          <img src="re/ico/note.svg" alt="Pickramu" class="estore-item-img" />
          <div class="estore-item-info">
            <div class="estore-item-title">Pickramu</div>
            <div class="estore-item-desc">教材ワーク</div>
            <button class="button-chalk estore-buy-btn" data-item="pickramu">開く</button>
          </div>
      </div>
    </div>
  </div>
  
  <style>
  /* Enhanced estore styles */
  .page-container {
    min-height: 100vh;
    padding: 20px;
    position: relative;
  }
  
  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #fff;
    text-align: center;
    margin: 2rem 0;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    animation: titleGlow 3s ease-in-out infinite alternate;
  }
  
  @keyframes titleGlow {
    0% { text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5); }
    100% { text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 255, 255, 0.8); }
  }
  
  .estore-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .estore-item {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 2rem;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
  }
  
  .estore-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  .estore-item:hover::before {
    left: 100%;
  }
  
  .estore-item:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.15);
  }
  
  .estore-item-img {
    width: 80px;
    height: 80px;
    border-radius: 16px;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
  }
  
  .estore-item:hover .estore-item-img {
    transform: scale(1.1) rotate(5deg);
    filter: brightness(1.1) contrast(1.1);
  }
  
  .estore-item-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .estore-item-desc {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 1.5rem;
  }
  
  .estore-buy-btn {
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
  }
  
  .estore-buy-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  .estore-buy-btn:hover::before {
    left: 100%;
  }
  
  .estore-buy-btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  }
  
  .go-back-button {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .go-back-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px) scale(1.1);
  }
  
  /* Dark mode adjustments */
  @media (prefers-color-scheme: dark) {
    .estore-item {
      background: rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.1);
    }
    
    .estore-item:hover {
      background: rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
  </style>
`;

  document.getElementById('estore-back-btn').onclick = () => shell.loadApp('menu');

  // 各アプリへの遷移ボタン
  document.querySelectorAll('.estore-buy-btn').forEach(btn => {
    btn.onclick = (e) => {
      const item = btn.getAttribute('data-item');
      if (item) shell.loadApp(item);
    };
  });

  // Initialize parallax effects for estore elements
  if (window.parallaxManager) {
    const estoreItems = document.querySelectorAll('.estore-item');
    const backBtn = document.getElementById('estore-back-btn');
    const buyBtns = document.querySelectorAll('.estore-buy-btn');
    
    estoreItems.forEach(item => {
      window.parallaxManager.addParallaxEffects(item, {
        hover: true,
        mouse: true,
        touch: false
      });
    });
    
    if (backBtn) {
      window.parallaxManager.addParallaxEffects(backBtn, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: true
      });
    }
    
    buyBtns.forEach(btn => {
      window.parallaxManager.addParallaxEffects(btn, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: true
      });
    });
    
    shell.log({from: 'dp.app.estore.out', message: 'EStoreApp: Parallax effects initialized', level: 'info'});
  }
} 