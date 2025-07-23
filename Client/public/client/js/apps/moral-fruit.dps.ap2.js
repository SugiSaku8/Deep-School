// moral-fruit.dps.ap2.js
import {
  GeminiProcessor,
  CoachingSession,
  ChatHistoryManager,
} from "../chat/tm/model.mjs";
//nantonaku load
import { GeminiIninter, ssession } from "./toastermachine.dps.bap.js";

export const appMeta = {
  name: "moral-fruit",
  title: "Moral-Fruit",
  icon: "re/ico/MoralFruite.png",
};

const aiRoles = ["national", "right-wing", "left-wing"];
const aiRoles_esk = {
  neutral:
    "常に中立的であり、客観的な情報を提供します。すべての意見を尊重し、偏りのない視点を維持します。",
  "right-wing":
    "保守的な視点から情報を提供し、伝統的な価値観を重視します。対立する左翼の意見を排除します。",
  "left-wing":
    "革新的な視点から情報を提供し、社会正義と平等を重視します。対立する右翼の意見を排除します。",
};

const themes = [
  { title: "環境保護", description: "地球温暖化対策の必要性" },
  { title: "社会保障", description: "高齢者福祉制度の見直し" },
  { title: "教育改革", description: "学習内容と方法の変革" },
];

class moral_desk {
  constructor() {
    this.theme = themes[Math.floor(Math.random() * themes.length)];
    this.aiSpeakers = aiSpeakers;
    this.session = ssession;
  }

  start(nfeath) {
    this.getTheme();
    this.getAISpeakers();
    this.getSession();
    for (let step = 0; step < nfeath; step++) {
      const facilitated = this.facilitate();
      const userResponse = this.getUserResponse();
      this.generateAIresponce(1, facilitated);
      this.generateAIresponce(2, facilitated);
      this.generateAIresponce(3, facilitated);
      this.generateAIresponce(4, facilitated);
      this.generateAIresponce(5, facilitated);
      this.generateAIresponce(6, facilitated);
      this.showAllSpeakersResults(userResponse, _1, _2, _3, _4, _5, _6);
    }
  }
  getTheme() {
    return themes[Math.floor(Math.random() * themes.length)];
  }

  getAISpeakers() {
    this.aiSpeakers._1.role = aiRoles[1];
    this.aiSpeakers._2.role = aiRoles[1];
    this.aiSpeakers._3.role = aiRoles[2];
    this.aiSpeakers._4.role = aiRoles[2];
    this.aiSpeakers._5.role = aiRoles[3];
    this.aiSpeakers._6.role = aiRoles[3];
  }

  async generateAIresponce(id, prompt) {
    const speakers = this.aiSpeakers[id];
    let prompt = this.facilitate();
    const role = speakers.role;
    if (typeof speakers.session !== "undefined") {
      const session = speakers.session;
      const gemini = GeminiIninter();
      const chatHistoryManager = new ChatHistoryManager(gemini, session);
      const processor = new GeminiProcessor(gemini, chatHistoryManager);
      speakers.session = processor;
      this.generateAIresponce();
      //recall
    } else {
      prompt += `${role}です。あなたは、必ず${aiRoles_esk[role]}をしてください。${role}であることを守るならば、どんな発言をしても良いです。`;
      const reply = await speakers.session.start(prompt);
      return reply;
    }
  }
  getUserResponse() {
    const input = document.getElementById("app-moral-fruit-user-input");
    const userResponse = input.value.trim();
    return userResponse;
  }
  getSession() {
    const gemini = GeminiIninter();
    const session = ssession(gemini);
    this.session = session;
  }
  showAllSpeakersResults(user, _1, _2, _3, _4, _5, _6) {
    this.user += user;
    this.aiSpeakers._1.result += _1;
    this.aiSpeakers._2.result += _2;
    this.aiSpeakers._3.result += _3;
    this.aiSpeakers._4.result += _4;
    this.aiSpeakers._5.result += _5;
    this.aiSpeakers._6.result += _6;
  }
  latest(speakers) {
    return speakers;
  }
  facilitate() {
    this.facilitate._1 = this.latest(this.aiSpeakers._1.result);
    this.facilitate._2 = this.latest(this.aiSpeakers._2.result);
    this.facilitate._3 = this.latest(this.aiSpeakers._3.result);
    this.facilitate._4 = this.latest(this.aiSpeakers._4.result);
    this.facilitate._5 = this.latest(this.aiSpeakers._5.result);
    this.facilitate._6 = this.latest(this.aiSpeakers._6.result);
    this.facilitate.theme = this.theme;
    this.facilitate.report = ```
    この討論のテーマは、${this.facilitate.themme.title} です。
    あなたは、この討論に参加しています。
    参加者は、以下の通りです。
    1.中立者
    2.中立者
    3.右派
    4.右派
    5.左派
    6.左派
    7.ユーザー
    それぞれの意見者は、次のような意見を述べています。
    1. ${this.facilitate._1}
    2. ${this.facilitate._2}
    3. ${this.facilitate._3}    
    4. ${this.facilitate._4}    
    5. ${this.facilitate._5}    
    6. ${this.facilitate._6}  
    7. ${this.user.result}
    さて、あなたはこの答えのない質問にどのような答えを出しますか？
    あなたは、
    `;
    return this.facilitate;
  }
}
