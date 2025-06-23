// =====================
// Deep-School Client 設定ファイル
// =====================

// --- エラーメッセージ詳細表示 ---
export const SHOW_ERROR_DETAIL = false; // trueで詳細表示、falseで抑制

// --- コンソールスタイル ---
export const CONSOLE_STYLE = {
  err: "color: red;font-size:20px;font-bold:1312;",
  binf: "font-size:18px;",
  small: "font-size:12px;"
};

// --- Google認証 ---
export const GOOGLE_CLIENT_ID = "54111871338-nv4bn99r48cohhverg3l9oicirthmtpp.apps.googleusercontent.com";
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.appdata",
];

// --- Gemini API設定 ---
export const GEMINI_CONFIG = {
  API_KEY: "AIzaSyDo7xQq1dIHy1j4xNCmZh2vyzX3rE74PF0",
  API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
  GENERATION_CONFIG: {
    temperature: 0.1,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 4086,
    stopSequences: []
  },
  SAFETY_SETTINGS: [
    { category: "HARASSMENT", threshold: "BLOCK_ALL" },
    { category: "HATE_SPEECH", threshold: "BLOCK_ALL" },
    { category: "SEXUALLY_EXPLICIT", threshold: "BLOCK_ALL" },
    { category: "DANGEROUS_CONTENT", threshold: "BLOCK_ALL" },
  ]
};

// --- eGuide Gemini API設定（必要なら統合可） ---
export const EGUIDE_GEMINI_CONFIG = {
  API_KEY: "AIzaSyDo7xQq1dIHy1j4xNCmZh2vyzX3rE74PF0",
  API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
  GENERATION_CONFIG: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 4096,
    stopSequences: []
  },
  SAFETY_SETTINGS: [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  ]
};

// --- SCRサーバー情報 ---
export let SCR_URL = null;
export let SCR_TYPE = null;

// 必要に応じて他の設定もここに追加 