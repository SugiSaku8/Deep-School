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

const aiRoles = ["neutral", "right-wing", "left-wing"];

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

  getSession() {
    const gemini = GeminiIninter();
    const session = ssession(gemini);
    this.session = session;
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
    ```
    return this.facilitate;
  }
}
