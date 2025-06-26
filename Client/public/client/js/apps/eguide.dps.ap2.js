export const appMeta = {
  name: "eguide",
  title: "eGuide",
  icon: "re/ico/note.svg"
};

export const appHtml = `
  <div id="eguide-app">
    <h1 class="page-title">eGuide</h1>
    <iframe src="eguide.html" style="width:100%; min-height:600px; border:none; border-radius:12px; background:#173c2b;"></iframe>
    <button class="button-chalk" id="eguide-back">戻る</button>
  </div>
`;

export function appInit(shell) {
  document.getElementById('eguide-back').onclick = () => shell.loadApp('menu');
  ds.log({from: 'dp.app.eguide.out', message: 'EGuideApp: 初期化開始', level: 'info'});
} 