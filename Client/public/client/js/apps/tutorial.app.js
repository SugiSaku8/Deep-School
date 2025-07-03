export const appMeta = {
  name: "tutorial",
  title: "チュートリアル",
  icon: "re/ico/note.svg"
};

export function appInit(shell) {
  // チュートリアル進行用ステップ
  const tutorialSteps = [
    {
      app: 'chat',
      title: 'ToasterMachineへようこそ',
      desc: 'AIチャットで質問や相談ができます。まずはここから、今わからないことを教えてもらいましょう。始めましょう。',
    },
    {
      app: 'pickramu',
      title: 'Pickramu（教材ワーク）',
      desc: '自由に教材を選んでどこでも学習・演習ができます。自分のペースで進めましょう。',
    },
    {
      app: 'scr',
      title: 'SCR',
      desc: 'わからないことがあったら、友達に聞きましょう。AIもいいけれど、人による支援の方がいいこともあるでしょう。すべてのツールを有効活用するのがおすすめです。',
    },
  ];

  // HTMLを#app-rootに描画
  const root = document.getElementById('app-root');
  if (!root) {
    shell.log({from: 'dp.app.tutorial.err', message: 'TutorialApp: #app-rootが見つかりません', level: 'error'});
    return;
  }
  root.innerHTML = '';

  // チュートリアルUI挿入
  let step = 0;
  function showTutorialStep(idx) {
    const s = tutorialSteps[idx];
    // アプリを自動で開く
    shell.loadApp(s.app);
    // モーダルUI生成
    setTimeout(() => {
      const modal = document.createElement('div');
      modal.className = 'ds-tutorial-modal';
      modal.innerHTML = `
        <div class="ds-tutorial-content" role="dialog" aria-modal="true" tabindex="-1">
          <h2 class="ds-tutorial-title">${s.title}</h2>
          <p class="ds-tutorial-desc">${s.desc}</p>
          <button class="ds-tutorial-next" id="ds-tutorial-next-btn">${idx < tutorialSteps.length - 1 ? '次へ' : '完了'}</button>
        </div>
      `;
      Object.assign(modal.style, {
        position: 'fixed', zIndex: 9999, top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      });
      const content = modal.querySelector('.ds-tutorial-content');
      Object.assign(content.style, {
        background: 'rgba(30,30,40,0.98)', color: '#fff', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        padding: '2.5rem 2rem', maxWidth: '90vw', minWidth: '320px', textAlign: 'center', outline: 'none',
      });
      content.querySelector('.ds-tutorial-title').style.fontSize = '2rem';
      content.querySelector('.ds-tutorial-title').style.fontWeight = '700';
      content.querySelector('.ds-tutorial-desc').style.fontSize = '1.1rem';
      content.querySelector('.ds-tutorial-desc').style.margin = '1.5rem 0 2rem 0';
      const nextBtn = content.querySelector('#ds-tutorial-next-btn');
      Object.assign(nextBtn.style, {
        fontSize: '1.1rem', fontWeight: '600', borderRadius: '16px', padding: '0.8em 2.2em', border: 'none',
        background: '#ced8eb', color: '#222', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', cursor: 'pointer',
      });
      nextBtn.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') nextBtn.click(); };
      nextBtn.onclick = () => {
        document.body.removeChild(modal);
        if (idx < tutorialSteps.length - 1) {
          showTutorialStep(idx + 1);
        } else {
          shell.loadApp('menu');
        }
      };
      document.body.appendChild(modal);
      nextBtn.focus();
    }, 350); // アプリ切替後にモーダルを出す
  }
  showTutorialStep(0);
} 