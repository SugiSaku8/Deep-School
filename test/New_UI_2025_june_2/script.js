// APPLE風の洗練されたアニメーション例
const actionBtn = document.querySelector('.action-btn');
if (actionBtn) {
  actionBtn.addEventListener('click', () => {
    actionBtn.animate([
      { transform: 'scale(1)', background: 'linear-gradient(90deg, #00b894 0%, #00cec9 100%)' },
      { transform: 'scale(1.12)', background: 'linear-gradient(90deg, #00cec9 0%, #00b894 100%)' },
      { transform: 'scale(1)', background: 'linear-gradient(90deg, #00b894 0%, #00cec9 100%)' }
    ], {
      duration: 420,
      easing: 'cubic-bezier(.23,1.01,.32,1)'
    });
  });
}
// アイコン起点の動きデモ
const navBtns = document.querySelectorAll('.icon-btn');
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.animate([
      { transform: 'scale(1)', boxShadow: '0 2px 8px #0004' },
      { transform: 'scale(1.18)', boxShadow: '0 4px 16px #00b89488' },
      { transform: 'scale(1)', boxShadow: '0 2px 8px #0004' }
    ], {
      duration: 320,
      easing: 'cubic-bezier(.23,1.01,.32,1)'
    });
  });
}); 