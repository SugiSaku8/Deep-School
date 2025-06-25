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
  `;

  document.getElementById('estore-back-btn').onclick = () => shell.loadApp('menu');

  // 各アプリへの遷移ボタン
  document.querySelectorAll('.estore-buy-btn').forEach(btn => {
    btn.onclick = (e) => {
      const item = btn.getAttribute('data-item');
      if (item) shell.loadApp(item);
    };
  });
} 