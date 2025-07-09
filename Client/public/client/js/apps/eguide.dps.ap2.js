export const appMeta = {
  name: "eguide",
  title: "eGuide",
  icon: "re/ico/note.svg"
};

export const appHtml = `
  <div id="eguide-app">
    <h1 class="page-title">eGuide</h1>
    <iframe src="eguide.html" style="width:100%; min-height:600px; border:none; border-radius:12px;" id="eguide-iframe"></iframe>
    <div style="margin:16px 0;display:flex;gap:12px;align-items:center;">
      <button class="button-chalk" id="eguide-toaster-btn" style="background:#2cb4ad;color:#fff;border-radius:8px;padding:8px 16px;box-shadow:0 2px 8px rgba(44,180,173,0.12);font-weight:600;">ToasterMachineに質問</button>
      <span id="eguide-toaster-status" style="color:#2cb4ad;font-weight:500;"></span>
    </div>
    <button class="button-chalk" id="eguide-back">戻る</button>
  </div>
`;

export function appInit(shell) {
  document.getElementById('eguide-back').onclick = () => shell.loadApp('menu');
  ds.log({from: 'dp.app.eguide.out', message: 'EGuideApp: 初期化開始', level: 'info'});

  // ToasterMachine連携ボタンのイベント
  const toasterBtn = document.getElementById('eguide-toaster-btn');
  const toasterStatus = document.getElementById('eguide-toaster-status');
  const iframe = document.getElementById('eguide-iframe');
  if (toasterBtn && iframe) {
    toasterBtn.onclick = () => {
      let text = '';
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        text = doc.getSelection ? doc.getSelection().toString().trim() : '';
      } catch {}
      if (!text) text = prompt('ToasterMachineに質問したい内容を入力してください');
      if (!text) return;
      toasterStatus.textContent = 'AI生成中...';
      toasterBtn.disabled = true;
      window.chatManager?.geminiProcessor?.callGemini_U?.(text).then(resp => {
        toasterStatus.textContent = '回答: ' + resp.slice(0, 60) + (resp.length > 60 ? '...' : '');
      }).catch(e => {
        toasterStatus.textContent = 'エラー: ' + (e.message || e);
      }).finally(() => {
        toasterBtn.disabled = false;
      });
    };
  }

  // DOMバグ解消: iframe高さ自動調整
  if (iframe) {
    iframe.onload = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const resize = () => {
          iframe.style.height = Math.max(600, doc.body.scrollHeight) + 'px';
        };
        resize();
        doc.body.onresize = resize;
      } catch {}
    };
  }

  // Initialize parallax effects for eguide elements
  if (window.parallaxManager) {
    const backBtn = document.getElementById('eguide-back');
    if (backBtn) {
      window.parallaxManager.addParallaxEffects(backBtn, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: true
      });
    }
    shell.log({from: 'dp.app.eguide.out', message: 'EGuideApp: Parallax effects initialized', level: 'info'});
  }
} 