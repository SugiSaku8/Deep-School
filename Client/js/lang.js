// 多言語対応データ
export const LANG_DATA = {
  ja: {
    greeting: "こんにちは",
    login: "ログイン",
    logout: "ログアウト",
    // ...他の文言
  },
  en: {
    greeting: "Hello",
    login: "Login",
    logout: "Logout",
    // ...他の文言
  },
  // 他の言語も追加可能
};

import { CURRENT_LANG } from './config.js';
/**
 * 指定したキーの文言を現在の言語で取得
 * @param {string} key
 * @param {string} lang - 省略時はconfig.jsのCURRENT_LANG
 */
export function t(key, lang = CURRENT_LANG) {
  return (LANG_DATA[lang] && LANG_DATA[lang][key]) || key;
} 