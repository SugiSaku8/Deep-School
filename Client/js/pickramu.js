import { convertToHtml } from 'compile.n.js';

window.openPickramuApp = function() {
  document.getElementById('pickramu_app').style.display = 'block';
  document.getElementById('menu').style.display = 'none';
  document.getElementById('estore').style.display = 'none';
  document.getElementById('toaster_chat').style.display = 'none';
  document.getElementById('scr_app').style.display = 'none';
  document.getElementById('setting').style.display = 'none';
}

window.addEventListener('DOMContentLoaded', () => {
  const loadBtn = document.getElementById('pickramu-load-btn');
  if (loadBtn) {
    loadBtn.addEventListener('click', async () => {
      const select = document.getElementById('pickramu-unit-select');
      const value = select.value;
      // fetch教材データ
      const res = await fetch(`/Pickramu/data/${value}`);
      const text = await res.text();
      // 変換
      const html = convertToHtml(text);
      document.getElementById('pickramu-content').innerHTML = html;
    });
  }
});