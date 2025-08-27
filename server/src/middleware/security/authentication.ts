import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { User } from '../../models/User';
import { rateLimiter } from './rate-limiter';
import { resetRateLimit } from './rate-limiter';

// JWT検証を非同期で行うためのユーティリティ
const verifyAsync = promisify(jwt.verify) as any;

// 環境変数からJWTシークレットを取得
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// アクセストークンの有効期間（15分）
const ACCESS_TOKEN_EXPIRES_IN = '15m';
// リフレッシュトークンの有効期間（7日）
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// トークン生成関数
export const generateTokens = (userId: string) => {
    // アクセストークンの生成
    const accessToken = jwt.sign(
        { id: userId },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
    
    // リフレッシュトークンの生成
    const refreshToken = jwt.sign(
        { id: userId, type: 'refresh' },
        JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
    
    return { accessToken, refreshToken };
};

// トークン検証ミドルウェア
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // ヘッダーからトークンを取得
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: '認証トークンが提供されていません'
            });
        }
        
        // トークンを検証
        const decoded = await verifyAsync(token, JWT_SECRET);
        
        // ユーザーが存在するか確認
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'ユーザーが見つかりません'
            });
        }
        
        // リクエストオブジェクトにユーザー情報を追加
        (req as any).user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'TokenExpired',
                message: 'トークンの有効期限が切れています',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        console.error('認証エラー:', error);
        return res.status(403).json({
            error: 'Forbidden',
            message: '無効なトークンです'
        });
    }
};

// リフレッシュトークン検証ミドルウェア
export const authenticateRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'リフレッシュトークンが提供されていません'
            });
        }
        
        // リフレッシュトークンを検証
        const decoded = await verifyAsync(refreshToken, JWT_REFRESH_SECRET);
        
        // トークンタイプを確認
        if (decoded.type !== 'refresh') {
            return res.status(403).json({
                error: 'Forbidden',
                message: '無効なトークンタイプです'
            });
        }
        
        // ユーザーが存在するか確認
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'ユーザーが見つかりません'
            });
        }
        
        // リクエストオブジェクトにユーザー情報を追加
        (req as any).user = user;
        next();
    } catch (error) {
        console.error('リフレッシュトークンエラー:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'TokenExpired',
                message: 'リフレッシュトークンの有効期限が切れています',
                code: 'REFRESH_TOKEN_EXPIRED'
            });
        }
        
        return res.status(403).json({
            error: 'Forbidden',
            message: '無効なリフレッシュトークンです'
        });
    }
};

// ロールベースのアクセス制御ミドルウェア
export const authorize = (roles: string | string[] = []) => {
    // ロールを配列に変換
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        
        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: '認証されていません'
            });
        }
        
        // 管理者は常に許可
        if (user.role === 'admin') {
            return next();
        }
        
        // ロールチェック
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'この操作を実行する権限がありません'
            });
        }
        
        next();
    };
};

// ログイン試行回数制限ミドルウェア
export const loginRateLimiter = rateLimiter('login');

// パスワードリセット試行回数制限ミドルウェア
export const passwordResetRateLimiter = rateLimiter('passwordReset');

// ログイン成功時に試行回数をリセット
export const resetLoginAttempts = async (email: string) => {
    const key = `login:${email}`;
    await resetRateLimit('login', key);
};

// トークンからユーザーIDを取得するユーティリティ関数
export const getUserIdFromToken = async (token: string): Promise<string | null> => {
    try {
        const decoded = await verifyAsync(token, JWT_SECRET);
        return decoded.id;
    } catch (error) {
        console.error('トークンからのユーザーID取得エラー:', error);
        return null;
    }
};
