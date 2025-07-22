// moral-fruit.dps.ap2.js
import { ssession } from "./toastermachine.dps.bap.js";

export const appMeta = {
  name: "moral-fruit",
  title: "Moral-Fruit",
  icon: "re/ico/MoralFruite.png",
};

const aiRoles = ["neutral", "right-wing", "left-wing"];
const aiSpeakers = [
  { role: aiRoles[Math.floor(Math.random() * aiRoles.length)], name: "AI1" },
  { role: aiRoles[Math.floor(Math.random() * aiRoles.length)], name: "AI2" },
  { role: aiRoles[Math.floor(Math.random() * aiRoles.length)], name: "AI3" },
];

const themes = [
  { title: "環境保護", description: "地球温暖化対策の必要性" },
  { title: "社会保障", description: "高齢者福祉制度の見直し" },
  { title: "教育改革", description: "学習内容と方法の変革" },
];

class EthicsLesson {
  constructor() {
    this.themeSelect = null;
  }

  async showThemeSelectScreen() {
    const themeSelectContainer = document.createElement('div');
    themeSelectContainer.className = 'theme-select-container';

    const title = document.createElement('h2');
    title.textContent = '道徳の授業';
    themeSelectContainer.appendChild(title);

    const themeList = document.createElement('ul');
    themes.forEach(theme => {
      const li = document.createElement('li');
      li.textContent = theme.title;
      li.addEventListener('click', () => {
        this.themeSelect.value = theme.title;
        this.startLesson(); // Call startLesson when a theme is selected
      });
      themeList.appendChild(li);
    });

    themeSelectContainer.appendChild(themeList);

    document.body.innerHTML += `
      <div class="modal-overlay"></div>
      ${themeSelectContainer.outerHTML}
    `;

    // モーダルオーバーレイとコンテンツをクリックで閉じる
    document.querySelector('.modal-overlay').addEventListener('click', () => {
      document.body.removeChild(document.querySelector('.modal-overlay'));
      document.body.removeChild(document.querySelector('.theme-select-container'));
    });
  }

  async startLesson() {
    // Lesson logic goes here
  }
}

// Initialize EthicsLesson
const ethicsLesson = new EthicsLesson();

// Call showThemeSelectScreen when document is ready
document.addEventListener('DOMContentLoaded', () => {
  ethicsLesson.showThemeSelectScreen();
});

async function initializeEthicsLesson() {
  const ethicsLesson = new EthicsLesson();
  await ethicsLesson.startLesson();
}

document.addEventListener('DOMContentLoaded', initializeEthicsLesson);

// appInit関数
export async function appInit(shell) {
  const root = document.getElementById("app-root");
  if (!root) {
    ds.log({
      from: "dp.app.ethics.out",
      message: "EthicsLessonApp: #app-rootが見つかりません",
      level: "error",
    });
    return;
  }

  // テーマ選択画面を表示
  const ethicsLesson = new EthicsLesson();
  await ethicsLesson.showThemeSelectScreen();

  // appInit関数内で対話を開始
  document.getElementById("theme-select").addEventListener('change', async (event) => {
    const selectedTheme = themes.find(t => t.title === event.target.value);
    if (selectedTheme) {
      ethicsLesson.currentTheme = selectedTheme;
      await ethicsLesson.displayAIStatement();
      await ethicsLesson.getUserResponse();
      await ethicsLesson.generateAIResponse();
      ethicsLesson.updateDiscussionArea();
    }
  });
}