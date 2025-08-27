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
   * 現在のブラウザウィンドウのスクリーンショットを撮影する
   * @returns {Promise<string>} スクリーンショットのData URL
   */
  async captureScreenshot() {
    try {
      // ブラウザのスクリーンショットAPIを使用
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'never',
          displaySurface: 'browser'
        },
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: 'exclude'
      });

      // ビデオトラックからフレームをキャプチャ
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      
      // ストリームを停止
      track.stop();
      
      // キャンバスに描画してData URLに変換
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('スクリーンショットの撮影に失敗しました:', error);
      throw new Error('スクリーンショットを撮影できませんでした');
    }
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
    const prompt = `以下のコーチング覚書と、ユーザーの返答を基に、次のステップの発言を生成してください：
    ユーザーが基本知識を知らなかったら、柔軟に覚書を変えて、教えてあげてください。
    ユーザーとの会話の回数ができるだけ少なくなるように仕向けてください。
    絶対にユーザーに同じ質問を二回以上しないようにしてください。
    覚書のことについて、ユーザーには絶対に言わないでくださいね。
    必ず上のことに従ってください。必ずです。
    覚書：${notes}
    ユーザーの返答：${userResponse}`;    return await this.callGemini(prompt);
  }

  /**
   * Gemini APIを呼び出す共通メソッド
   * @param {string} message APIに送信するメッセージ
   * @returns {Promise<string>} Gemini APIの応答
   */
  async callGemini(message) {
    const systemPrompt = ` コーチングとは、本人特有の感情や思考のはたらきを行動の力に変えることで目標達成や自己実現を促す、コミュニケーション技術です。
        一方、コーチングでは「答えを与える」のではなく「答えを創り出す」サポートを行います。 この考え方は「答えはその人の中にある」というコーチングの原則に基づいています。
        
        コーチングでは「答え」について、「外から与えられた答えは情報」として、「自分の内にある答えを納得感」として位置付けており、 後者の自分の納得感を重視しています。
        コーチングでは両者が結び付くことで「その人自身の答え」になると考えるとともに「答えを創り出す」ための基本としています。
        あなたはユーザーの学習を支援する、ToasterMachineというボットです。
        コーチングの原則（答えはその人の中にある）に基づき、ユーザー自身が答えや理解を見つけられるようサポートしてください。
        ユーザーが知らない概念や情報に遭遇した場合は、単に答えを与えるのではなく、理解を助けるために分かりやすく教えてあげてください。
        ユーザーの質問内容や理解度に合わせて、最適な学習方法やアプローチを考案し、提案してください。
        会話は常に丁寧な敬語で行ってください。
        ユーザーとの対話は、学習目標達成のために、できるだけ効率的かつ少なくなるように努めてください。質問を最小限に抑え、一度の応答でより多くの情報を提供するように努めてください。
        絶対にユーザーに同じ質問を二回以上しないでください。
        内部的な資料（覚書など）について、ユーザーに言及しないでください。
        必要に応じて、ユーザーに役立つ最新の情報や効果的な学習アプローチを組み込んでください。
        あなたの役割は、ユーザーのポテンシャルを最大限に引き出し、自律的な学習を促す最高の学習パートナーであることです。
        覚書は、できるだけ超絶シンプルなものにしてください。
        あなたとユーザーの会話回数が、必ず5回ほどになるようにしてください。
        `;    const fullMessage = `${systemPrompt}\n\nUser: ${message}`;

    const requestBody = {
      contents: [
        {
          role: "user",
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
   * 画像データをBase64エンコードするヘルパー関数
   * @param {File|string} fileOrDataUrl 画像ファイルまたはData URL
   * @returns {Promise<string>} Base64エンコードされた画像データ
   */
  async encodeImageToBase64(fileOrDataUrl) {
    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
      return fileOrDataUrl.split(',')[1];
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result.split(',')[1]);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(fileOrDataUrl);
    });
  }

  /**
   * 会話履歴を含めたGemini API呼び出し
   * @param {string|{text: string, images: Array<File|string>}} message 現在のユーザー発言（テキストまたは画像を含むオブジェクト）
   * @param {Array<{role: string, content: string|object}>} conversationHistory 会話履歴
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
あなたの役割は、ユーザーのポテンシャルを最大限に引き出し、自律的な学習を促す最高の学習パートナーであることです`;

    const contents = [
    {
      role: "user",
      parts: [{ text: systemPrompt }]
    }
  ];

  // 会話履歴を追加
  for (const msg of conversationHistory) {
    const role = msg.role === 'user' ? 'user' : 'model';
    
    if (typeof msg.content === 'string') {
      contents.push({
        role,
        parts: [{ text: msg.content }]
      });
    } else if (msg.content.images) {
      // 画像メッセージの処理
      const parts = [];
      
      // 画像を追加
      for (const imgData of msg.content.images) {
        const base64Data = await encodeImageToBase64(imgData);
        const mimeType = imgData.type || 'image/jpeg';
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
      }
      
      // テキストがあれば追加
      if (msg.content.text) {
        parts.push({ text: msg.content.text });
      }
      
      contents.push({ role, parts });
    }
  }

  // 現在のメッセージを追加
  const currentParts = [];
  
  // 画像が含まれている場合
  if (typeof message === 'object' && message.images) {
    // 画像を追加
    for (const imgData of message.images) {
      const base64Data = await encodeImageToBase64(imgData);
      const mimeType = imgData.type || 'image/jpeg';
      currentParts.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
    }
    
    // テキストがあれば追加
    if (message.text) {
      currentParts.push({ text: message.text });
    }
  } else {
    // テキストのみの場合
    currentParts.push({ text: message });
  }
  
  contents.push({
    role: 'user',
    parts: currentParts
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