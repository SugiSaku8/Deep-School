export const appMeta = {
  name: "pickramu",
  title: "Pickramu ワーク",
  icon: "re/ico/note.svg"
};

export function appInit(shell) {
  const root = document.getElementById('app-root');
  if (!root) {
    ds.log({from: 'dp.app.pickramu.err', message: 'PickramuApp: #app-rootが見つかりません', level: 'error'});
    return;
  }
  root.innerHTML = `
    <div class="page-container">
      <button class="go-back-button" id="pickramu-back-btn" data-lang-key="back">←</button>
      <h1 class="page-title" data-lang-key="pickramu_work">Pickramu ワーク</h1>
    <div class="pickramu-tabs" style="margin-bottom: 20px; display: flex; gap: 12px;">
        <button class="auto-btn" id="tab-pickramu" data-lang-key="pickramu_tab">教材ワーク</button>
        <button class="auto-btn" id="tab-eguide" data-lang-key="eguide_tab">eGuide</button>
    </div>
    <div id="pickramu-work-area">
      <div class="pickramu-select" style="margin-bottom: 20px;">
          <label for="pickramu-unit-select" data-lang-key="select_material">教材選択：</label>
        <select id="pickramu-unit-select">
          <option value="jla/math/式の計算/1節/1.用語/1.md">数学: 式の計算・用語</option>
        </select>
          <button class="auto-btn" id="pickramu-load-btn" data-lang-key="load">読み込み</button>
      </div>
      <div id="pickramu-content" class="pickramu-content" style="background:#173c2b; border-radius:12px; min-height:300px; padding:24px; color:#fff;"></div>
    </div>
    <div id="pickramu-eguide-area" style="display:none;">
      <iframe src="eguide.html" style="width:100%; min-height:600px; border:none; border-radius:12px; background:#173c2b;"></iframe>
    </div>
  </div>
`;

  // 戻るボタン
  document.getElementById('pickramu-back-btn').onclick = () => shell.loadApp('menu');

  // タブ切り替え
  document.getElementById('tab-pickramu').onclick = () => {
    document.getElementById('pickramu-work-area').style.display = 'block';
    document.getElementById('pickramu-eguide-area').style.display = 'none';
    document.getElementById('tab-pickramu').classList.add('active');
    document.getElementById('tab-eguide').classList.remove('active');
  };
  document.getElementById('tab-eguide').onclick = () => {
    document.getElementById('pickramu-work-area').style.display = 'none';
    document.getElementById('pickramu-eguide-area').style.display = 'block';
    document.getElementById('tab-pickramu').classList.remove('active');
    document.getElementById('tab-eguide').classList.add('active');
  };

  // 教材読み込みボタン
  document.getElementById('pickramu-load-btn').onclick = async () => {
    const select = document.getElementById('pickramu-unit-select');
    const content = document.getElementById('pickramu-content');
    if (select && content) {
      const path = select.value;
      content.textContent = '読み込み中...';
      try {
        // ローカル or GitHub Pages でパスを切り替え
        const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        const basePath = isLocal ? '/Pickramu/data/' : 'https://sugisaku8.github.io/Deep-School/Pickramu/data/';
        const fetchUrl = basePath + path;
        const res = await fetch(fetchUrl);
        if (res.ok) {
          const text = await res.text();
          content.textContent = text;
        } else {
          content.textContent = `教材の読み込みに失敗しました (404 Not Found)\nURL: ${fetchUrl}`;
        }
      } catch (e) {
        content.textContent = '教材の読み込みでエラーが発生しました';
      }
    }
  };
} 