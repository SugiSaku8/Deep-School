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
    this.themeSelect = document.getElementById("theme-select");
    this.discussionArea = document.getElementById("discussion-area");

    this.themeSelect.addEventListener("change", async () => {
      this.currentTheme = themes.find(t => t.title === this.themeSelect.value);
      
      await this.displayAIStatement();
      await this.getUserResponse();
      await this.generateAIResponse();
      this.updateDiscussionArea();
    });

    // 初期表示
    this.themeSelect.value = themes[0].title;
    await this.displayAIStatement();
    await this.getUserResponse();
    await this.generateAIResponse();
    this.updateDiscussionArea();
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
    const userResponse = prompt(`What's your opinion on ${this.currentTheme.title}?`);
    this.discussionArea.innerHTML += `<p>ユーザー: ${userResponse}</p>`;
    this.userResponses.push(userResponse);
  }

  async generateAIResponse() {
    const aiResponse = await this.getSmartAIResponse();
    this.discussionArea.innerHTML += `<p>AI: ${aiResponse}</p>`;
  }

  async getSmartAIResponse() {
    const conversationHistory = this.userResponses.join("\n");
    const prompt = `You are a neutral AI assistant for an ethics lesson. Your goal is to engage in a thoughtful discussion about ${this.currentTheme.title}. Consider the following points:\n\n1. Provide balanced arguments for both sides.\n2. Address potential consequences of each approach.\n3. Suggest practical steps individuals can take based on the discussion.\n4. Encourage critical thinking and open-mindedness.\n5. Use evidence-based reasoning when possible.\n\nContinue the discussion with a response that builds upon the user's previous statements and adds depth to the conversation.`;

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

// ユーザーインターフェースの作成
const ethicsApp = document.createElement('div');
ethicsApp.className = 'ethics-lesson-app';
ethicsApp.innerHTML = `
  <h1>道徳の授業</h1>
  <select id="theme-select">
    ${themes.map(theme => `<option value="${theme.title}">${theme.title}</option>`).join('')}
  </select>
  <button onclick="initializeEthicsLesson()">開始</button>
  <div id="discussion-area"></div>
`;

document.body.appendChild(ethicsApp);

// スタイルを追加
const style = document.createElement('style');
style.textContent = `
  .ethics-lesson-app {
    max-width: 800px;
    margin: auto;
    padding: 20px;
    background-color: #f0f0f0;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  }
  #theme-select {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    border-radius: 5px;
    background-color: white;
  }
  button {
    background-color: #007aff;
    color: white;
    border: none;
    padding: 15px 30px;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }
  button:hover {
    background-color: #0056b3;
  }
  #discussion-area {
    margin-top: 20px;
    border: 1px solid #ccc;
    padding: 15px;
    background-color: white;
    border-radius: 10px;
    overflow-y: auto;
    max-height: 300px;
  }
`;
document.head.appendChild(style);

// appInit関数
export function appInit(shell) {
  const root = document.getElementById("app-root");
  if (!root) {
    ds.log({
      from: "dp.app.ethics.out",
      message: "EthicsLessonApp: #app-rootが見つかりません",
      level: "error",
    });
    return;
  }
  root.innerHTML = `
    <div class="page-container full-screen ethics-bg">
      <button class="go-back-button" id="ethics-back-btn" data-lang-key="back">←</button>
      <h1 class="page-title" data-lang-key="ethics_note">道徳の授業</h1>
      <div id="ethics-app" class="ethics-app"></div>
    </div>
  `;

  document.getElementById("ethics-back-btn").onclick = () => shell.loadApp("menu");

  // EthicsLessonアプリの初期化
  initializeEthicsLesson();
}