import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { corsConfig } from '../../../config/cors';

// セキュリティヘッダーを設定するミドルウェア
export const securityHeaders = [
    // Helmetのデフォルト設定
    helmet(),
    
    // Content Security Policy (CSP) の設定
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // 必要に応じて削除
                "'unsafe-eval'"   // 必要に応じて削除
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'"
            ],
            imgSrc: [
                "'self'",
                'data:',
                'https: data:'
            ],
            connectSrc: [
                "'self'",
                ...corsConfig.allowedOrigins
            ],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: []
        }
    }),
    
    // X-Frame-Options ヘッダー
    (req: Request, res: Response, next: NextFunction) => {
        res.setHeader('X-Frame-Options', 'DENY');
        next();
    },
    
    // X-Content-Type-Options ヘッダー
    (req: Request, res: Response, next: NextFunction) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        next();
    },
    
    // Referrer-Policy ヘッダー
    (req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        next();
    },
    
    // Permissions-Policy ヘッダー
    (req: Request, res: Response, next: NextFunction) => {
        res.setHeader(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(), payment=()'
        );
        next();
    },
    
    // X-DNS-Prefetch-Control ヘッダー
    (req: Request, res: Response, next: NextFunction) => {
        res.setHeader('X-DNS-Prefetch-Control', 'off');
        next();
    },
    
    // X-Download-Options ヘッダー (IE用)
    (req: Request, res: Response, next: NextFunction) => {
        res.setHeader('X-Download-Options', 'noopen');
        next();
    }
];

// CORSミドルウェア
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin || '';
    
    // 許可されたオリジンのみを許可
    if (corsConfig.allowedOrigins.includes(origin) || !origin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    
    // 認証情報の送信を許可
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // プリフライトリクエストの処理
    if (req.method === 'OPTIONS') {
        // 許可するメソッド
        res.setHeader('Access-Control-Allow-Methods', corsConfig.allowedMethods.join(','));
        
        // 許可するヘッダー
        res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(','));
        
        // プリフライトリクエストの結果をキャッシュする時間（秒）
        res.setHeader('Access-Control-Max-Age', String(corsConfig.maxAge));
        
        // プリフライトリクエストに対する応答
        return res.status(204).end();
    }
    
    // 公開するヘッダー
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length,Content-Type,Authorization');
    
    next();
};
