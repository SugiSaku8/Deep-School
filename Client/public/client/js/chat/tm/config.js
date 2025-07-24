import { GEMINI_CONFIG } from '../../core/config.js';
export default GEMINI_CONFIG;

/**
 * Gemini API設定オブジェクト。
 * @typedef {Object} CONFIG
 * @property {string} API_KEY - Gemini APIのキー。
 * @property {string} API_URL - Gemini APIのエンドポイントURL。
 * @property {Object} GENERATION_CONFIG - 生成時のパラメータ設定。
 * @property {number} GENERATION_CONFIG.temperature - 出力の多様性。
 * @property {number} GENERATION_CONFIG.topK - サンプリング時の上位K件。
 * @property {number} GENERATION_CONFIG.topP - サンプリング時の確率しきい値。
 * @property {number} GENERATION_CONFIG.maxOutputTokens - 最大出力トークン数。
 * @property {Array<string>} [GENERATION_CONFIG.stopSequences] - 出力停止シーケンス。
 * @property {Array<Object>} SAFETY_SETTINGS - セーフティ設定。
 * @property {string} SAFETY_SETTINGS[].category - 有害カテゴリ。
 * @property {string} SAFETY_SETTINGS[].threshold - ブロック閾値。
 */
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
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_SEXUAL",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS",
      threshold: "BLOCK_NONE",
    },
  ],
};