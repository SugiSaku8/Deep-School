export const appMeta = {
  name: "gamemaker",
  title: "GameMaker",
  icon: "re/ico/gamemaker.png"
};

export function appInit(shell) {
  const root = document.getElementById('app-root');
  if (!root) {
    console.error('GameMakerApp: #app-rootが見つかりません');
    return;
  }
  root.innerHTML = `
    
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