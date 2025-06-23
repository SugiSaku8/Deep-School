export const appMeta = {
  name: "pickramu",
  title: "Pickramu ワーク",
  icon: "re/ico/note.svg"
};

export const appHtml = `
  <div id="pickramu-app">
    <h1 class="page-title">Pickramu ワーク</h1>
    <div class="pickramu-tabs" style="margin-bottom: 20px; display: flex; gap: 12px;">
      <button class="auto-btn" id="tab-pickramu">教材ワーク</button>
      <button class="auto-btn" id="tab-eguide">eGuide</button>
    </div>
    <div id="pickramu-work-area">
      <div class="pickramu-select" style="margin-bottom: 20px;">
        <label for="pickramu-unit-select">教材選択：</label>
        <select id="pickramu-unit-select">
          <option value="jla/math/式の計算/1節/1.用語/1.md">数学: 式の計算・用語</option>
        </select>
        <button class="auto-btn" id="pickramu-load-btn">読み込み</button>
      </div>
      <div id="pickramu-content" class="pickramu-content" style="background:#173c2b; border-radius:12px; min-height:300px; padding:24px; color:#fff;"></div>
    </div>
    <div id="pickramu-eguide-area" style="display:none;">
      <iframe src="eguide.html" style="width:100%; min-height:600px; border:none; border-radius:12px; background:#173c2b;"></iframe>
    </div>
    <button class="button-chalk" id="pickramu-back">戻る</button>
  </div>
`;

export function appInit(shell) {
  document.getElementById('pickramu-back').onclick = () => shell.loadApp('menu');
  document.getElementById('tab-pickramu').onclick = () => {
    document.getElementById('pickramu-work-area').style.display = 'block';
    document.getElementById('pickramu-eguide-area').style.display = 'none';
  };
  document.getElementById('tab-eguide').onclick = () => {
    document.getElementById('pickramu-work-area').style.display = 'none';
    document.getElementById('pickramu-eguide-area').style.display = 'block';
  };
  document.getElementById('pickramu-load-btn').onclick = async () => {
    const select = document.getElementById('pickramu-unit-select');
    const value = select.value;
    const res = await fetch(`/Pickramu/data/${value}`);
    const text = await res.text();
    document.getElementById('pickramu-content').innerHTML = text;
  };
} 