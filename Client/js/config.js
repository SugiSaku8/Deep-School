const CONFIG = {
  API_KEY: "AIzaSyDo7xQq1dIHy1j4xNCmZh2vyzX3rE74PF0",
  API_URL:
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  GENERATION_CONFIG: {
    temperature: 0.1,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 4086,
  },
  SAFETY_SETTINGS: [
    {
      category: "HARASSMENT",
      threshold: "BLOCK_ALL",
    },
    {
      category: "HATE_SPEECH",
      threshold: "BLOCK_ALL",
    },
    {
      category: "SEXUALLY_EXPLICIT",
      threshold: "BLOCK_ALL",
    },
    {
      category: "DANGEROUS_CONTENT",
      threshold: "BLOCK_ALL",
    },
  ],
};
