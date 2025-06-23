export const appMeta = {
  name: "estore",
  title: "eStore",
  icon: "re/ico/Setting.png"
};

export const appHtml = `
  <div id="estore-app">
    <button class="go-back-button" id="estore-back">←</button>
    <div class="page-container">
      <h1 class="page-title">eStore</h1>
      <div class="card product-card toaster-card">
        <span><span class="fx">f(x)</span> Math Kit</span>
      </div>
      <div class="card product-card room-card">
        Room
      </div>
    </div>
  </div>
`;

export function appInit(shell) {
  document.getElementById('estore-back').onclick = () => shell.loadApp('menu');
} 