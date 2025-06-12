class GeminiAPI {
  static async sendMessage(message, conversationHistory) {
    try {
      const systemPrompt = `あなたはユーザーの学習を支援する、ToasterMachineというコーチングボットです。
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

      // Add conversation history
      conversationHistory.forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const requestBody = {
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.API_KEY}`,
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
      console.error('GeminiAPI error:', error);
      throw error;
    }
  }

  static remove() {
    // Clean up any resources if needed
  }
}

window.GeminiAPI = GeminiAPI; 