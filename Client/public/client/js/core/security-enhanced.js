import { getCookie, setCookie, deleteCookie } from './cookies.js';

export class SecurityManager {
    constructor() {
        this.RSA_KEY_SIZE = 4096; // 4096-bit RSA
        this.MAX_LOGIN_ATTEMPTS = 5;
        this.LOGIN_ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes
        this.REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
        this.ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
    }

    // Initialize security features
    async init() {
        await this.generateRSAKeyPair();
        this.setupAutoLogout();
        this.setupInactivityTimer();
    }

    // Generate 4096-bit RSA key pair
    async generateRSAKeyPair() {
        try {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: "RSA-OAEP",
                    modulusLength: this.RSA_KEY_SIZE,
                    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                    hash: { name: "SHA-512" },
                },
                true,
                ["encrypt", "decrypt"]
            );

            // Export and store keys
            const [publicKey, privateKey] = await Promise.all([
                window.crypto.subtle.exportKey('jwk', keyPair.publicKey),
                window.crypto.subtle.exportKey('jwk', keyPair.privateKey)
            ]);

            // Store keys in secure HTTP-only cookies
            setCookie('rsa_public_key', JSON.stringify(publicKey), { secure: true, httpOnly: true });
            setCookie('rsa_private_key', JSON.stringify(privateKey), { secure: true, httpOnly: true });

            return { publicKey, privateKey };
        } catch (error) {
            console.error('Error generating RSA key pair:', error);
            throw new Error('暗号鍵の生成に失敗しました');
        }
    }

    // Encrypt data with RSA
    async encryptData(data) {
        try {
            const publicKey = await this.getPublicKey();
            const encoded = new TextEncoder().encode(JSON.stringify(data));
            const encrypted = await window.crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                publicKey,
                encoded
            );
            return this.arrayBufferToBase64(encrypted);
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('データの暗号化に失敗しました');
        }
    }

    // Decrypt data with RSA
    async decryptData(encryptedData) {
        try {
            const privateKey = await this.getPrivateKey();
            const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
            const decrypted = await window.crypto.subtle.decrypt(
                { name: "RSA-OAEP" },
                privateKey,
                encryptedBuffer
            );
            return JSON.parse(new TextDecoder().decode(decrypted));
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('データの復号に失敗しました');
        }
    }

    // Get public key from cookie
    async getPublicKey() {
        const keyData = JSON.parse(getCookie('rsa_public_key') || 'null');
        if (!keyData) throw new Error('公開鍵が見つかりません');
        
        return window.crypto.subtle.importKey(
            'jwk',
            keyData,
            { name: 'RSA-OAEP', hash: 'SHA-512' },
            false,
            ['encrypt']
        );
    }

    // Get private key from cookie
    async getPrivateKey() {
        const keyData = JSON.parse(getCookie('rsa_private_key') || 'null');
        if (!keyData) throw new Error('秘密鍵が見つかりません');
        
        return window.crypto.subtle.importKey(
            'jwk',
            keyData,
            { name: 'RSA-OAEP', hash: 'SHA-512' },
            false,
            ['decrypt']
        );
    }

    // Track login attempts
    trackLoginAttempt() {
        const attempts = JSON.parse(localStorage.getItem('login_attempts') || '[]');
        const now = Date.now();
        
        // Remove old attempts outside the time window
        const recentAttempts = attempts.filter(time => 
            now - time < this.LOGIN_ATTEMPT_WINDOW
        );

        // Add current attempt
        recentAttempts.push(now);
        localStorage.setItem('login_attempts', JSON.stringify(recentAttempts));

        // Check if rate limit exceeded
        if (recentAttempts.length > this.MAX_LOGIN_ATTEMPTS) {
            const timeLeft = Math.ceil((recentAttempts[0] + this.LOGIN_ATTEMPT_WINDOW - now) / 1000 / 60);
            throw new Error(`ログイン試行回数が上限に達しました。${timeLeft}分後にお試しください。`);
        }
    }

    // Reset login attempts on successful login
    resetLoginAttempts() {
        localStorage.removeItem('login_attempts');
    }

    // Setup auto logout after token expiry
    setupAutoLogout() {
        const checkToken = () => {
            const token = getCookie('access_token');
            if (!token) return;
            
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiresIn = payload.exp * 1000 - Date.now();
            
            if (expiresIn <= 0) {
                this.logout();
            } else {
                setTimeout(this.logout, expiresIn);
            }
        };

        // Check token on load
        checkToken();
        
        // And every minute
        setInterval(checkToken, 60000);
    }

    // Setup inactivity timer
    setupInactivityTimer(timeout = 30 * 60 * 1000) { // 30 minutes default
        let timeoutId;
        
        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                this.logout();
                alert('セキュリティのため、一定時間操作がなかったためログアウトされました。');
            }, timeout);
        };

        // Reset timer on user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            window.addEventListener(event, resetTimer, false);
        });

        resetTimer();
    }

    // Logout user
    logout() {
        // Clear tokens
        deleteCookie('access_token');
        deleteCookie('refresh_token');
        
        // Clear sensitive data
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to login
        window.location.href = '/login';
    }

    // Helper methods
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
}

// CORS configuration
export const corsConfig = {
    origin: [
        'https://deep-school.onrender.com',
        'http://localhost:3000',
        // Add other allowed origins
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

// Rate limiting configuration
export const rateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'リクエストの回数が多すぎます。しばらく時間をおいてお試しください。'
};

// Initialize security manager
const securityManager = new SecurityManager();
securityManager.init().catch(console.error);

export default securityManager;
