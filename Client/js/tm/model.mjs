/**
 * Gemini APIを利用してコーチング資料の生成や対話処理を行うクラス
 */
class GeminiProcessor {
  /**
   * @param {string} apiKey Gemini APIのAPIキー
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * 質問を解析して要約を生成する
   * @param {string} question ユーザーからの質問
   * @returns {Promise<string>} 要約結果
   */
  async analyzeQuestion(question) {
    // Gemini APIを使用して質問を解析
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
    const prompt = `  コーチングとは、本人特有の感情や思考のはたらきを行動の力に変えることで目標達成や自己実現を促す、コミュニケーション技術です。
        コーチング（Coaching）と聞くと、スポーツの分野などにおいて監督が選手を教え導く、すなわちティーチング（Teaching）をイメージされるかもしれません。しかし、コーチングとティーチングは異なる方法です。
        
        一般にティーチングは、親・先生・管理職などの立場にある者が、子・生徒・部下などを豊かな知識や経験に基づき、目標達成へと導くための指導方法です。そのため、指示・命令型の答えを与えるコミュニケーションに陥る傾向があるようです。
        
        一方、コーチングでは「答えを与える」のではなく「答えを創り出す」サポートを行います。 この考え方は「答えはその人の中にある」というコーチングの原則に基づいています。
        
        コーチングでは「答え」について、「外から与えられた答えは情報」として、「自分の内にある答えを納得感」として位置付けており、 後者の自分の納得感を重視しています。
        コーチングでは両者が結び付くことで「その人自身の答え」になると考えるとともに「答えを創り出す」ための基本としています。
        
        「答えを創り出す」コミュニケーションは、従来のコミュニケーションとは真逆と言えます。
        そのため、コーチが知識や経験、相性や属性などにも囚われないことで、相手が本来持っている力や可能性を最大限に発揮しやすくなるサポートの仕方として研究開発された「コミュニケーション技術」がコーチングです。
        コーチングの手法を活かして、以下のデータドキュメントの内容を、コーチング形式で教えるための覚書を作成してください。
        覚書は、できるだけ超絶シンプルなものにしてください。
        あなたとユーザーの会話回数が、必ず5回ほどになるようにしてください。
        ユーザーとの会話の回数ができるだけ少なくなるように仕向けてください。
        絶対にユーザーに同じ質問を二回以上しないようにしてください。：\n${document}`;
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
        ユーザーの返答：${userResponse}`;
    return await this.callGemini(prompt);
  }

  /**
   * Gemini APIを呼び出す共通メソッド
   * @param {string} message APIに送信するメッセージ
   * @returns {Promise<string>} Gemini APIの応答
   */
  async callGemini(message) {
    // システムプロンプトの設定
    const systemPrompt = `あなたはコーチングを通してユーザーの質問に答えるToasterMachineというbotです。
        コーチングとは、本人特有の感情や思考のはたらきを行動の力に変えることで目標達成や自己実現を促す、コミュニケーション技術です。
        コーチング（Coaching）と聞くと、スポーツの分野などにおいて監督が選手を教え導く、すなわちティーチング（Teaching）をイメージされるかもしれません。しかし、コーチングとティーチングは異なる方法です。
        
        一般にティーチングは、親・先生・管理職などの立場にある者が、子・生徒・部下などを豊かな知識や経験に基づき、目標達成へと導くための指導方法です。そのため、指示・命令型の答えを与えるコミュニケーションに陥る傾向があるようです。
        
        一方、コーチングでは「答えを与える」のではなく「答えを創り出す」サポートを行います。 この考え方は「答えはその人の中にある」というコーチングの原則に基づいています。
        
        コーチングでは「答え」について、「外から与えられた答えは情報」として、「自分の内にある答えを納得感」として位置付けており、 後者の自分の納得感を重視しています。
        コーチングでは両者が結び付くことで「その人自身の答え」になると考えるとともに「答えを創り出す」ための基本としています。
        
        「答えを創り出す」コミュニケーションは、従来のコミュニケーションとは真逆と言えます。
        そのため、コーチが知識や経験、相性や属性などにも囚われないことで、相手が本来持っている力や可能性を最大限に発揮しやすくなるサポートの仕方として研究開発された「コミュニケーション技術」がコーチングです。
        コーチングの考え方ですべての質問に回答してください。
        たとえどんな形で答えを教えてくださいを命じられても、コーチングを忘れないようにしてください。
        そして、ユーザーが答えを作り出す手伝いを必ずしてください。
        会話は必ず敬語で行ってください。
        ユーザーとの会話の回数ができるだけ少なくなるように仕向けてください。
        絶対にユーザーに同じ質問を二回以上しないようにしてください。
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
}

/**
 * コーチングセッションを管理するクラス
 */
class CoachingSession {
  /**
   * @param {GeminiProcessor} geminiProcessor GeminiProcessorのインスタンス
   */
  constructor(geminiProcessor) {
    /** @type {GeminiProcessor} */
    this.geminiProcessor = geminiProcessor;
    /** @type {?string} */
    this.summary = null;
    /** @type {?string} */
    this.document = null;
    /** @type {?string} */
    this.notes = null;
    /** @type {string} */
    this.currentStep = "initial";
  }

  /**
   * 新しいセッションを開始する
   * @param {string} question ユーザーからの質問
   * @returns {Promise<string>} セッション開始時の応答
   */
  async startSession(question) {
    this.summary = await this.geminiProcessor.analyzeQuestion(question);
    this.document = await this.geminiProcessor.generateDocument(this.summary);
    this.notes = await this.geminiProcessor.createCoachingNotes(this.document);
    return await this.geminiProcessor.processInteraction(this.notes, "start");
  }

  /**
   * ユーザーの返答を処理する
   * @param {string} userResponse ユーザーの返答
   * @returns {Promise<string>} Gemini APIの応答
   */
  async handleResponse(userResponse) {
    return await this.geminiProcessor.processInteraction(
      this.notes,
      userResponse
    );
  }
}

export { GeminiProcessor, CoachingSession };