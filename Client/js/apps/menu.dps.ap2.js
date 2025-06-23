export const appMeta = {
  name: "menu",
  title: "メニュー",
  icon: "re/ico/menu.svg"
};

export const appHtml = `
  <div id="menu-app" class="popup">
    <div class="menu-content">
      <div class="menu-item">
        <img src="re/ico/tm.png" alt="ToasterMachineアイコン" class="menu-icon toaster-icon icon-anim" />
        <div class="menu-label chalk-text icon-anim" style="cursor: pointer" id="menu-toaster">ToasterMachine</div>
      </div>
      <div class="menu-item">
        <img src="re/ico/SCR.png" alt="SCRアイコン" class="menu-icon scr-icon icon-anim" />
        <div class="menu-label chalk-text icon-anim" style="cursor: pointer" id="menu-scr">SCR</div>
      </div>
      <div class="menu-item">
        <img src="re/ico/Setting.png" alt="設定アイコン" class="menu-icon setting-icon icon-anim" />
        <div class="menu-label chalk-text icon-anim" style="cursor: pointer" id="menu-setting">設定</div>
      </div>
      <div class="menu-item">
        <img src="re/ico/note.svg" alt="Pickramuアイコン" class="menu-icon pickramu-icon icon-anim" />
        <div class="menu-label chalk-text icon-anim" style="cursor: pointer" id="menu-pickramu">Pickramu</div>
      </div>
    </div>
  </div>
`;

export function appInit(shell) {
  // 各メニュークリックでshell.loadAppを呼ぶ例
  document.getElementById('menu-toaster').onclick = () => shell.loadApp('toaster');
  document.getElementById('menu-scr').onclick = () => shell.loadApp('scr');
  document.getElementById('menu-setting').onclick = () => shell.loadApp('setting');
  document.getElementById('menu-pickramu').onclick = () => shell.loadApp('pickramu');
} 