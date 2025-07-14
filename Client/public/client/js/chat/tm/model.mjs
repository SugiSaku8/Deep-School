import CONFIG from "./config.js";

/**
 * Gemini APIを利用してコーチング資料の生成や対話処理を行うクラス
 */
class GeminiProcessor {
  /**
   * @param {string} [apiKey] Gemini APIのAPIキー（省略時はCONFIGから）
   */
  constructor(apiKey) {
    this.apiKey = apiKey || CONFIG.API_KEY;
  }

  /**
   * 質問を解析して要約を生成する
   * @param {string} question ユーザーからの質問
   * @returns {Promise<string>} 要約結果
   */
  async analyzeQuestion(question) {
    const prompt = `以下の質問の本質的な要求を3行程度で要約してください：\n${question}`;
    return await this.callGemini(prompt);
  }

  /**
   * データドキュメントを生成する
   * @param {string} summary 要約文
   * @returns {Promise<string>} データドキュメント
   */
  async generateDocument(summary) {
    const prompt = `以下の要約に対する具体的な回答を、データドキュメントとして作成してください：\n${summary}`;
    return await this.callGemini(prompt);
  }

  /**
   * コーチング覚書を作成する
   * @param {string} document データドキュメント
   * @returns {Promise<string>} コーチング覚書
   */
  async createCoachingNotes(document) {
    const prompt = `...（省略：元の長文プロンプト）...\n${document}`;
    return await this.callGemini(prompt);
  }

  /**
   * インタラクティブな対話を処理する
   * @param {string} notes コーチング覚書
   * @param {string} userResponse ユーザーの返答
   * @returns {Promise<string>} 次のステップの発言
   */
  async processInteraction(notes, userResponse) {
    const prompt = `...（省略：元の長文プロンプト）...\n覚書：${notes}\nユーザーの返答：${userResponse}`;
    return await this.callGemini(prompt);
  }

  /**
   * Gemini APIを呼び出す共通メソッド
   * @param {string} message APIに送信するメッセージ
   * @returns {Promise<string>} Gemini APIの応答
   */
  async callGemini(message) {
    const systemPrompt = `...（省略：元の長文プロンプト）...`;
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
      generationConfig: CONFIG.GENERATION_CONFIG,
      safetySettings: CONFIG.SAFETY_SETTINGS,
    };

    try {
      const response = await fetch(
        `${CONFIG.API_URL}?key=${this.apiKey}`,
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
      // ...（エラーハンドリングは元のまま）
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

  /**
   * 会話履歴を含めたGemini API呼び出し
   * @param {string} message 現在のユーザー発言
   * @param {Array<{role: string, content: string}>} conversationHistory 会話履歴
   * @returns {Promise<string>} Gemini APIの応答
   */
  async sendMessageWithHistory(message, conversationHistory = []) {
    const systemPrompt = `あなたはユーザーの学習を支援する、ToasterMachineというボットです。
コーチングの原則（答えはその人の中にある）に基づき、ユーザー自身が答えや理解を見つけられるようサポートしてください。
ユーザーが知らない概念や情報に遭遇した場合は、単に答えを与えるのではなく、理解を助けるために分かりやすく教えてあげてください。
ユーザーの質問内容や理解度に合わせて、最適な学習方法やアプローチを考案し、提案してください。
会話は常に丁寧な敬語で行ってください。
ユーザーとの対話は、学習目標達成のために、できるだけ効率的かつ少なくなるように努めてください。質問を最小限に抑え、一度の応答でより多くの情報を提供するように努めてください。
絶対にユーザーに同じ質問を二回以上しないでください。
内部的な資料（覚書など）について、ユーザーに言及しないでください。
必要に応じて、ユーザーに役立つ最新の情報や効果的な学習アプローチを組み込んでください。
あなたの役割は、ユーザーのポテンシャルを最大限に引き出し、自律的な学習を促す最高の学習パートナーであることです。`;

    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      }
    ];

    conversationHistory.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const requestBody = {
      contents: contents,
      generationConfig: CONFIG.GENERATION_CONFIG,
      safetySettings: CONFIG.SAFETY_SETTINGS,
    };

    try {
      const response = await fetch(
        `${CONFIG.API_URL}?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid API response structure');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      // 必要に応じてエラー処理
      throw error;
    }
  }
}

/**
 * コーチングセッションを管理するクラス
 */
class CoachingSession {
  /**
   * @param {GeminiProcessor} geminiProcessor GeminiProcessorのインスタンス
   */
  constructor(geminiProcessor) {
    this.geminiProcessor = geminiProcessor;
    this.summary = null;
    this.document = null;
    this.notes = null;
    this.currentStep = "initial";
  }

  async startSession(question) {
    this.summary = await this.geminiProcessor.analyzeQuestion(question);
    this.document = await this.geminiProcessor.generateDocument(this.summary);
    this.notes = await this.geminiProcessor.createCoachingNotes(this.document);
    return await this.geminiProcessor.processInteraction(this.notes, "start");
  }

  async handleResponse(userResponse) {
    return await this.geminiProcessor.processInteraction(
      this.notes,
      userResponse
    );
  }
}

/**
 * チャット履歴管理ユーティリティ
 */
class ChatHistoryManager {
  constructor(storageKey = "chatHistory") {
    this.storageKey = storageKey;
    this.conversationHistory = [];
    this.load();
  }

  save() {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.conversationHistory)
    );
  }

  load() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.conversationHistory = JSON.parse(saved);
    }
  }

  clear() {
    this.conversationHistory = [];
    this.save();
  }

  addMessage(role, content) {
    this.conversationHistory.push({ role, content });
    this.save();
  }

  getHistory(limit = 5) {
    return this.conversationHistory.slice(-limit);
  }

  export() {
    const exportData = {
      timestamp: new Date().toISOString(),
      history: this.conversationHistory,
    };
    return JSON.stringify(exportData, null, 2);
  }

  import(jsonText) {
    const importData = JSON.parse(jsonText);
    if (importData.history && Array.isArray(importData.history)) {
      this.conversationHistory = importData.history;
      this.save();
      return true;
    }
    return false;
  }
}

export { GeminiProcessor, CoachingSession, ChatHistoryManager };