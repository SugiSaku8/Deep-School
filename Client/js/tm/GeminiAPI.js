class GeminiAPI {
  static async sendMessage(message, conversationHistory) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data.response;
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