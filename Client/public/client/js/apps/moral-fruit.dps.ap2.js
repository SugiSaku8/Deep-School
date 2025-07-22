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
    this.discussionArea = null;
    this.aiSpeakers = aiSpeakers;
    this.currentTheme = null;
    this.userResponses = [];
  }

  async startLesson() {
    // テーマ選択画面を表示
    await this.showThemeSelectScreen();

    // 選択されたテーマに基づいて対話を開始
    const selectedTheme = themes.find(t => t.title === this.themeSelect.value);
    if (!selectedTheme) {
      console.error("Invalid theme selected");
      return;
    }
    this.currentTheme = selectedTheme;

    await this.displayAIStatement();
    await this.getUserResponse();
    await this.generateAIResponse();
    this.updateDiscussionArea();
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

    // OKボタンをクリックしたときの処理
    document.querySelector('.theme-select-container button').addEventListener('click', () => {
      document.body.removeChild(document.querySelector('.modal-overlay'));
      document.body.removeChild(document.querySelector('.theme-select-container'));
      this.startLesson();
    });
  }

  async displayAIStatement() {
    const aiIndex = Math.floor(Math.random() * this.aiSpeakers.length);
    const ai = this.aiSpeakers[aiIndex];

    let statement;
    switch (ai.role) {
      case "neutral":
        statement = `On ${this.currentTheme.title}, we should consider both sides carefully.`;
        break;
      case "right-wing":
        statement = `${this.currentTheme.title} is crucial for national security and economic growth. We must take drastic measures to ensure its implementation, even if it means sacrificing some individual freedoms.`;
        break;
      case "left-wing":
        statement = `${this.currentTheme.title} is essential for social justice and equality. We must fight against any opposition and push for radical changes to create a truly fair society.`;
        break;
    }

    console.log(`${ai.name}: ${statement}`);
    this.discussionArea.innerHTML += `<p>AI: ${statement}</p>`;
  }

  async getUserResponse() {
    const userResponse = prompt(`What's your opinion on ${this.currentTheme.description}?`);
    this.discussionArea.innerHTML += `<p>ユーザー: ${userResponse}</p>`;
    this.userResponses.push(userResponse);
  }

  async generateAIResponse() {
    const aiResponse = await this.getSmartAIResponse();
    this.discussionArea.innerHTML += `<p>AI: ${aiResponse}</p>`;
  }

  async getSmartAIResponse() {
    const conversationHistory = this.userResponses.join("\n");
    const prompt = `You are a neutral AI assistant for an ethics lesson. Your goal is to engage in a thoughtful discussion about ${this.currentTheme.description}. Consider the following points:\n\n1. Provide balanced arguments for both sides.\n2. Address potential consequences of each approach.\n3. Suggest practical steps individuals can take based on the discussion.\n4. Encourage critical thinking and open-mindedness.\n5. Use evidence-based reasoning when possible.\n\nContinue the discussion with a response that builds upon the user's previous statements and adds depth to the conversation.`;

    const response = await ssession(prompt + "\n\nConversation History:\n" + conversationHistory);
    return response.trim();
  }

  updateDiscussionArea() {
    const discussionContent = this.discussionArea.innerHTML;
    this.discussionArea.innerHTML = `<p><strong>${new Date().toLocaleString()}</strong></p>${discussionContent}`;
  }
}

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