import CONFIG from "./config.js";

/**
 * Minimal Gemini model utilities for Moral-Fruit.
 * シンプルな"質問→回答"の API ラッパー。コーチング用ロジックは含めない。
 */
class GeminiProcessor {
  constructor(apiKey) {
    this.apiKey = apiKey || CONFIG.API_KEY;
  }

  /**
   * 質問をそのまま Gemini に投げる
   * @param {string} message
   * @param {Array<{role:string, content:string}>} [conversationHistory]
   * @returns {Promise<string>} 回答
   */
  async ask(message, conversationHistory = []) {
    return await this.sendMessageWithHistory(message, conversationHistory);
  }

  async callGemini(message) {
    const systemPrompt = `あなたは人間です。質問を質問に答えず、自分の意見だけを出してください`;
    const fullMessage = `${systemPrompt}\n\nUser: ${message}`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: fullMessage }],
        },
      ],
      generationConfig: CONFIG.GENERATION_CONFIG,
      safetySettings: CONFIG.SAFETY_SETTINGS,
    };

    const response = await fetch(`${CONFIG.API_URL}?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  async sendMessageWithHistory(message, conversationHistory = []) {
    const contents = conversationHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    contents.push({ role: "user", parts: [{ text: message }] });

    const requestBody = {
      contents,
      generationConfig: CONFIG.GENERATION_CONFIG,
      safetySettings: CONFIG.SAFETY_SETTINGS,
    };

    const response = await fetch(`${CONFIG.API_URL}?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
}

export { GeminiProcessor };
