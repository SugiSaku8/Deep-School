// HTTPS強制リダイレクト
if (location.protocol === 'http:') {
  location.replace(location.href.replace('http:', 'https:'));
}

// XSS対策: HTMLエスケープ関数
export function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// CSRFトークンを付与してfetchする関数の雛形
export function secureFetchWithCSRF(url, options = {}) {
  const token = localStorage.getItem('api_token');
  const csrfToken = localStorage.getItem('csrf_token'); // CSRFトークンの保存場所は適宜変更
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
  };
  return fetch(url, { ...options, headers });
}

// --- RSA 1024bit暗号化によるlocalStorage保存 ---
// ※ jsencryptライブラリの読み込みが必要
// 例: <script src="https://cdn.jsdelivr.net/npm/jsencrypt@3.3.2/bin/jsencrypt.min.js"></script>

// 鍵ペア生成（初回のみ）
export function generateRSAKeyPair() {
  const crypt = new JSEncrypt({ default_key_size: 1024 });
  crypt.getKey();
  localStorage.setItem('rsa_public_key', crypt.getPublicKey());
  localStorage.setItem('rsa_private_key', crypt.getPrivateKey());
}

// 暗号化してlocalStorageに保存
export function setEncryptedItem(key, value) {
  const publicKey = localStorage.getItem('rsa_public_key');
  if (!publicKey) throw new Error('RSA公開鍵がありません');
  const crypt = new JSEncrypt();
  crypt.setPublicKey(publicKey);
  const encrypted = crypt.encrypt(value);
  if (!encrypted) throw new Error('暗号化に失敗しました');
  localStorage.setItem(key, encrypted);
}

// 復号化してlocalStorageから取得
export function getDecryptedItem(key) {
  const privateKey = localStorage.getItem('rsa_private_key');
  if (!privateKey) throw new Error('RSA秘密鍵がありません');
  const crypt = new JSEncrypt();
  crypt.setPrivateKey(privateKey);
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;
  const decrypted = crypt.decrypt(encrypted);
  if (decrypted === false) throw new Error('復号化に失敗しました');
  return decrypted;
}

// --- 入力値バリデーション ---
export function validateInput(value, { type = 'string', minLength = 0, maxLength = 255, pattern = null } = {}) {
  if (typeof value !== type) return false;
  if (value.length < minLength || value.length > maxLength) return false;
  if (pattern && !pattern.test(value)) return false;
  return true;
}

// --- セッション管理 ---
export function clearSession() {
  localStorage.clear();
  sessionStorage.clear();
}

// --- エラーメッセージ抑制（config.js連携） ---
import { SHOW_ERROR_DETAIL } from './config.js';
export function showError(error) {
  if (SHOW_ERROR_DETAIL) {
    alert(error.message || error);
  } else {
    alert('エラーが発生しました。');
  }
}

// --- console.log抑制 ---
export function safeLog(...args) {
  if (window.SHOW_LOG) {
    console.log(...args);
  }
}

// --- パスワードinput注意 ---
// パスワードは必ず<input type="password">で扱い、絶対に平文で保存しないこと！

// --- サードパーティ脆弱性チェック・サーバー協調 ---
// 依存ライブラリは定期的にnpm audit推奨
// サーバー側でも同様のセキュリティ対策を徹底すること 

import { t } from './lang.js';

// セキュリティの弱い接続を検出し、強制ログアウト・再ログイン・警告表示
export function enforceSecureConnectionAndLogout() {
  // 1. HTTPかどうか
  if (location.protocol === 'http:') {
    forceLogoutWithWarning('insecure_connection');
    return;
  }
  // 2. 公衆Wi-Fiなど（navigator.connection情報やUser-Agentで判定も可、ここでは例示のみ）
  if (navigator.connection && navigator.connection.type === 'wifi' && navigator.connection.downlink < 5) {
    // 低速Wi-Fiを公衆とみなす例
    forceLogoutWithWarning('public_wifi');
    return;
  }
  // 3. その他の判定ロジックは必要に応じて追加
}

function forceLogoutWithWarning(type) {
  // セッション・トークン削除
  localStorage.clear();
  sessionStorage.clear();
  // 警告表示
  let msg = t('security_warning_default');
  if (type === 'insecure_connection') msg = t('security_warning_insecure');
  if (type === 'public_wifi') msg = t('security_warning_public_wifi');
  alert(msg);
  // ログイン画面に遷移（例: location.reload() で再ログインを促す）
  location.reload();
} 