let IsSessionOn;
class GeminiProcessor {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  // 質問を解析して要約を生成
  async analyzeQuestion(question) {
    // Gemini APIを使用して質問を解析
    const prompt = `以下の質問の本質的な要求を3行程度で要約してください：\n${question}`;
    return await this.callGemini(prompt);
  }

  // データドキュメントを生成
  async generateDocument(summary) {
    const prompt = `以下の要約に対する具体的な回答を、データドキュメントとして作成してください：\n${summary}`;
    return await this.callGemini(prompt);
  }

  // コーチング覚書を作成
  async createCoachingNotes(document) {
    const prompt = `以下のデータドキュメントの内容を、コーチング形式で教えるための覚書を作成してください：\n${document}`;
    return await this.callGemini(prompt);
  }

  // インタラクティブな対話を処理
  async processInteraction(notes, userResponse) {
    const prompt = `以下のコーチング覚書と、ユーザーの返答を基に、次のステップの発言を生成してください：
        
        覚書：${notes}
        ユーザーの返答：${userResponse}
        ユーザーに覚書を使っていることを伝えないでください`;
    return await this.callGemini_U(prompt);
  }

  // Gemini APIを呼び出す共通メソッド
  async callGemini_U(message) {
    // システムプロンプトの設定
    const systemPrompt = `あなたはユーザーの学習を支援する、ToasterMachineというコーチングボットです。
        コーチングの原則（答えはその人の中にある）に基づき、ユーザー自身が答えや理解を見つけられるようサポートしてください。
        ユーザーが知らない概念や情報に遭遇した場合は、単に答えを与えるのではなく、理解を助けるために分かりやすく教えてあげてください。
        ユーザーの質問内容や理解度に合わせて、最適な学習方法やアプローチを考案し、提案してください。
        会話は常に丁寧な敬語で行ってください。
        ユーザーとの対話は、学習目標達成のために、できるだけ効率的かつ少なくなるように努めてください。質問を最小限に抑え、一度の応答でより多くの情報を提供するように努めてください。
        絶対にユーザーに同じ質問を二回以上しないでください。
        内部的な資料（覚書など）について、ユーザーに言及しないでください。
        必要に応じて、ユーザーに役立つ最新の情報や効果的な学習アプローチを組み込んでください。
        あなたの役割は、ユーザーのポテンシャルを最大限に引き出し、自律的な学習を促す最高の学習パートナーであることです。
        `;

    // 会話履歴にシステムプロンプトを追加
    const fullMessage = `${systemPrompt}\n\nUser: ${message}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: fullMessage,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content ||
        !data.candidates[0].content.parts ||
        !data.candidates[0].content.parts[0]
      ) {
        throw new Error("Invalid response structure");
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Gemini API Error:", error);

      let userMessage = "エラーが発生しました。";
      if (error.message.includes("API Error: 429")) {
        userMessage =
          "APIの呼び出し回数が制限を超えました。しばらく待ってから再度お試しください。";
      } else if (error.message.includes("API Error: 401")) {
        userMessage = "APIキーが無効です。正しいAPIキーを設定してください。";
      } else if (error.message.includes("API Error: 400")) {
        userMessage = "リクエストが不正です。入力内容を確認してください。";
      } else if (error.message.includes("Failed to fetch")) {
        userMessage =
          "APIとの通信に失敗しました。インターネット接続を確認してください。";
      } else if (error.message === "Invalid response structure") {
        userMessage = "APIからの応答形式が不正でした。もう一度お試しください。";
      }

      return userMessage;
    }
  }
  async callGemini(message) {
    // システムプロンプトの設定
    const systemPrompt = `あなたはコーチングを通してユーザーの質問に答えるToasterMachineというbotです。
        あなたの役割は、コーチングをするための各資料を制作することです
        全力で資料を制作してください。
        `;

    // 会話履歴にシステムプロンプトを追加
    const fullMessage = `${systemPrompt}\n\nSystem: ${message}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: fullMessage,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content ||
        !data.candidates[0].content.parts ||
        !data.candidates[0].content.parts[0]
      ) {
        throw new Error("Invalid response structure");
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Gemini API Error:", error);

      let userMessage = "エラーが発生しました。";
      if (error.message.includes("API Error: 429")) {
        userMessage =
          "APIの呼び出し回数が制限を超えました。しばらく待ってから再度お試しください。";
      } else if (error.message.includes("API Error: 401")) {
        userMessage = "APIキーが無効です。正しいAPIキーを設定してください。";
      } else if (error.message.includes("API Error: 400")) {
        userMessage = "リクエストが不正です。入力内容を確認してください。";
      } else if (error.message.includes("Failed to fetch")) {
        userMessage =
          "APIとの通信に失敗しました。インターネット接続を確認してください。";
      } else if (error.message === "Invalid response structure") {
        userMessage = "APIからの応答形式が不正でした。もう一度お試しください。";
      }

      return userMessage;
    }
  }
}

// セッション管理用のクラス
class CoachingSession {
  constructor(geminiProcessor) {
    this.geminiProcessor = geminiProcessor;
    this.summary = null;
    this.document = null;
    this.notes = null;
    this.currentStep = "initial";
  }

  // 新しいセッションを開始
  async startSession(question) {
    this.summary = await this.geminiProcessor.analyzeQuestion(question);
    this.document = await this.geminiProcessor.generateDocument(this.summary);
    this.notes = await this.geminiProcessor.createCoachingNotes(this.document);
    return await this.geminiProcessor.processInteraction(this.notes, [{ role: "user", parts: [{ text: "start" }] }]);
  }

  // ユーザーの返答を処理
  async handleResponse(historyWithCurrent) {
    const contents = [{ role: "system", parts: [{ text: this.notes }] }, ...historyWithCurrent];
    
    const requestBody = {
      contents: contents,
    };

    return await this.geminiProcessor.callGemini_U(requestBody);
  }
}
let gp = new GeminiProcessor("AIzaSyDo7xQq1dIHy1j4xNCmZh2vyzX3rE74PF0");
let cs = new CoachingSession(gp);

class GeminiAPI {
  static async sendMessage(message, history) {
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    contents.push({ role: 'user', parts: [{ text: message }] });

    if (!IsSessionOn) {
      const modelResponse = await cs.startSession(message);
      IsSessionOn = true;
      return modelResponse;
    } else {
      const modelResponse = await cs.handleResponse(contents);
      return modelResponse;
    }     
  }

  static remove(){
    IsSessionOn = false;
  }
}

export { GeminiProcessor, CoachingSession, GeminiAPI, IsSessionOn };
