import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// レートリミットの設定
const rateLimiters = {
    // ログイン試行の制限
    login: new RateLimiterMemory({
        points: 5, // 5回まで
        duration: 15 * 60, // 15分間でリセット
        blockDuration: 60 * 60, // 制限を超えたら1時間ブロック
        keyPrefix: 'login_fail'
    }),
    
    // APIリクエストの制限
    api: new RateLimiterMemory({
        points: 100, // 100リクエストまで
        duration: 15 * 60, // 15分間でリセット
        keyPrefix: 'api_requests'
    }),
    
    // パスワードリセットの制限
    passwordReset: new RateLimiterMemory({
        points: 3, // 3回まで
        duration: 60 * 60, // 1時間でリセット
        keyPrefix: 'password_reset'
    })
};

// レートリミットミドルウェア
export const rateLimiter = (type: keyof typeof rateLimiters) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const clientIp = req.ip || req.connection.remoteAddress || '';
        const key = `${type}:${clientIp}`;
        
        try {
            const rateLimiter = rateLimiters[type];
            await rateLimiter.consume(key);
            next();
        } catch (error) {
            // レート制限を超えた場合
            const retryAfter = Math.ceil(error.msBeforeNext / 1000) || 1;
            res.set('Retry-After', String(retryAfter));
            
            if (type === 'login') {
                return res.status(429).json({
                    error: 'Too Many Login Attempts',
                    message: `ログイン試行回数が多すぎます。${retryAfter}秒後にお試しください。`,
                    retryAfter
                });
            }
            
            return res.status(429).json({
                error: 'Too Many Requests',
                message: `リクエストが多すぎます。${retryAfter}秒後にお試しください。`,
                retryAfter
            });
        }
    };
};

// レートリミットのリセット（テスト用）
export const resetRateLimit = async (type: keyof typeof rateLimiters, key: string) => {
    try {
        await rateLimiters[type].delete(key);
        return true;
    } catch (error) {
        console.error('Failed to reset rate limit:', error);
        return false;
    }
};
