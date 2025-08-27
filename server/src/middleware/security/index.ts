// セキュリティ関連のミドルウェアをエクスポート
export * from './rate-limiter';
export * from './headers';
export * from './authentication';

// セキュリティミドルウェアを初期化する関数
export const initializeSecurity = (app: any) => {
    // セキュリティヘッダーを適用
    const { securityHeaders, corsMiddleware } = require('./headers');
    app.use(securityHeaders);
    app.use(corsMiddleware);
    
    // ボディパーサーの設定
    app.use(require('body-parser').json({ limit: '10kb' }));
    app.use(require('body-parser').urlencoded({ extended: true, limit: '10kb' }));
    
    // その他のセキュリティミドルウェア
    app.use(require('hpp')()); // HTTP Parameter Pollution 対策
    app.use(require('xss-clean')()); // XSS 対策
    
    // 本番環境でのみ有効化するミドルウェア
    if (process.env.NODE_ENV === 'production') {
        // 信頼できるプロキシを設定（Heroku、AWS ELB、Nginxなど）
        app.set('trust proxy', 1);
        
        // レートリミットの適用（APIエンドポイント）
        const { rateLimiter } = require('./rate-limiter');
        app.use('/api', rateLimiter('api'));
    }
    
    console.log('🔒 セキュリティミドルウェアが初期化されました');
};
