/**
 * Cookie操作ユーティリティ
 * HTTP-only、Secure、SameSite属性をサポート
 */

/**
 * Cookieを設定する
 * @param {string} name - Cookie名
 * @param {string} value - 値
 * @param {Object} options - オプション
 * @param {number} [options.days] - 有効期限（日数）
 * @param {string} [options.path] - パス
 * @param {string} [options.domain] - ドメイン
 * @param {boolean} [options.secure] - Secure属性
 * @param {boolean} [options.httpOnly] - HTTP-only属性（サーバーサイドでのみ設定可能）
 * @param {string} [options.sameSite] - SameSite属性（'Strict'|'Lax'|'None'）
 */
export function setCookie(name, value, options = {}) {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (options.days) {
        const date = new Date();
        date.setTime(date.getTime() + (options.days * 24 * 60 * 60 * 1000));
        cookieString += `; expires=${date.toUTCString()}`;
    }
    
    if (options.path) cookieString += `; path=${options.path}`;
    if (options.domain) cookieString += `; domain=${options.domain}`;
    if (options.secure) cookieString += '; Secure';
    if (options.httpOnly) cookieString += '; HttpOnly';
    if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;
    
    document.cookie = cookieString;
}

/**
 * Cookieを取得する
 * @param {string} name - 取得するCookie名
 * @returns {string|null} - Cookieの値（存在しない場合はnull）
 */
export function getCookie(name) {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
        }
    }
    return null;
}

/**
 * Cookieを削除する
 * @param {string} name - 削除するCookie名
 * @param {Object} options - オプション
 * @param {string} [options.path] - パス
 * @param {string} [options.domain] - ドメイン
 */
export function deleteCookie(name, options = {}) {
    document.cookie = [
        `${encodeURIComponent(name)}=`,
        'expires=Thu, 01 Jan 1970 00:00:00 GMT',
        options.path ? `path=${options.path}` : '',
        options.domain ? `domain=${options.domain}` : '',
        'Secure',
        'SameSite=Strict'
    ].join('; ');
}

/**
 * すべてのCookieを削除する
 */
export function deleteAllCookies() {
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        deleteCookie(name);
    }
}

/**
 * Cookieが有効かどうかを確認する
 * @returns {boolean} - Cookieが有効な場合はtrue
 */
export function areCookiesEnabled() {
    try {
        // テスト用のCookieを設定
        setCookie('test_cookie', 'test', { days: 1 });
        const cookieEnabled = getCookie('test_cookie') === 'test';
        // テスト用のCookieを削除
        deleteCookie('test_cookie');
        return cookieEnabled;
    } catch (e) {
        return false;
    }
}
