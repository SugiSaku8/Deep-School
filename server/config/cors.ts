/**
 * CORS設定
 * 本番環境と開発環境で異なる設定を適用
 */

// 許可するオリジン（ドメイン）のリスト
const allowedOrigins = [
    'https://deep-school.onrender.com',
    'http://localhost:3000',
    'http://localhost:8080',
    // 必要に応じて追加
];

// CORS設定オブジェクト
export const corsConfig = {
    // 許可するオリジン
    allowedOrigins,
    
    // 許可するHTTPメソッド
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    
    // 許可するHTTPヘッダー
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Allow-Headers',
        'X-CSRF-Token'
    ],
    
    // 公開するHTTPヘッダー
    exposedHeaders: [
        'Content-Length',
        'Content-Type',
        'Authorization',
        'X-Total-Count',
        'X-Request-Id'
    ],
    
    // 認証情報の送信を許可
    credentials: true,
    
    // プリフライトリクエストの結果をキャッシュする時間（秒）
    maxAge: 86400, // 24時間
    
    // プリフライトのレスポンスステータスコード
    optionsSuccessStatus: 204
};

// 本番環境かどうかを判定
export const isProduction = process.env.NODE_ENV === 'production';

// 開発環境用の設定
if (!isProduction) {
    // 開発環境ではすべてのオリジンを許可
    corsConfig.allowedOrigins.push('*');
    
    // 開発環境では追加のヘッダーを許可
    corsConfig.allowedHeaders.push(
        'Access-Control-Allow-Origin',
        'X-Forwarded-For',
        'X-Forwarded-Proto',
        'X-Forwarded-Port'
    );
}

export default corsConfig;
