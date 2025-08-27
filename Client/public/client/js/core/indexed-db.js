/**
 * IndexedDBを使用した大容量データストレージ
 * 暗号化機能付き
 */

export class SecureStorage {
    constructor(dbName = 'deep-school-db', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
        this.encryptionKey = null;
    }

    // データベースを開く
    async open() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject(new Error('データベースを開けませんでした'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            // 初回作成時またはバージョン変更時の処理
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // ストアの作成
                if (!db.objectStoreNames.contains('secureData')) {
                    const store = db.createObjectStore('secureData', { keyPath: 'id' });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                    store.createIndex('updatedAt', 'updatedAt', { unique: false });
                }
                
                // 暗号化キーのストア
                if (!db.objectStoreNames.contains('encryptionKeys')) {
                    db.createObjectStore('encryptionKeys', { keyPath: 'id' });
                }
            };
        });
    }

    // 暗号化キーを生成または取得
    async getEncryptionKey() {
        if (this.encryptionKey) return this.encryptionKey;

        const db = await this.open();
        const transaction = db.transaction('encryptionKeys', 'readonly');
        const store = transaction.objectStore('encryptionKeys');
        
        return new Promise((resolve, reject) => {
            const request = store.get('main');
            
            request.onsuccess = (event) => {
                if (event.target.result) {
                    this.encryptionKey = event.target.result.key;
                    resolve(this.encryptionKey);
                } else {
                    // 新しい暗号化キーを生成
                    this.generateEncryptionKey()
                        .then(key => resolve(key))
                        .catch(reject);
                }
            };
            
            request.onerror = (event) => {
                reject(new Error('暗号化キーの取得に失敗しました'));
            };
        });
    }

    // 新しい暗号化キーを生成
    async generateEncryptionKey() {
        const db = await this.open();
        
        // ランダムなキーを生成 (32バイト = 256ビット)
        const key = await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );

        // キーをエクスポート
        const exportedKey = await window.crypto.subtle.exportKey('raw', key);
        this.encryptionKey = this.arrayBufferToBase64(exportedKey);

        // データベースに保存
        const transaction = db.transaction('encryptionKeys', 'readwrite');
        const store = transaction.objectStore('encryptionKeys');
        
        return new Promise((resolve, reject) => {
            const request = store.put({
                id: 'main',
                key: this.encryptionKey,
                createdAt: new Date().toISOString()
            });
            
            request.onsuccess = () => resolve(this.encryptionKey);
            request.onerror = (event) => {
                console.error('暗号化キーの保存に失敗しました:', event.target.error);
                reject(new Error('暗号化キーの保存に失敗しました'));
            };
        });
    }

    // データを暗号化
    async encryptData(data) {
        const key = await this.getEncryptionKey();
        const text = typeof data === 'string' ? data : JSON.stringify(data);
        const encoded = new TextEncoder().encode(text);
        
        // 初期化ベクトルを生成 (12バイト推奨)
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        // キーをインポート
        const importedKey = await window.crypto.subtle.importKey(
            'raw',
            this.base64ToArrayBuffer(key),
            { name: 'AES-GCM' },
            false,
            ['encrypt']
        );
        
        // データを暗号化
        const encrypted = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            importedKey,
            encoded
        );
        
        // 暗号化データとIVを結合して返す
        const encryptedArray = new Uint8Array(encrypted);
        const result = new Uint8Array(iv.length + encryptedArray.length);
        result.set(iv);
        result.set(encryptedArray, iv.length);
        
        return this.arrayBufferToBase64(result.buffer);
    }

    // データを復号化
    async decryptData(encryptedData) {
        try {
            const key = await this.getEncryptionKey();
            const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
            
            // IVを抽出 (最初の12バイト)
            const iv = encryptedBuffer.slice(0, 12);
            const data = encryptedBuffer.slice(12);
            
            // キーをインポート
            const importedKey = await window.crypto.subtle.importKey(
                'raw',
                this.base64ToArrayBuffer(key),
                { name: 'AES-GCM' },
                false,
                ['decrypt']
            );
            
            // データを復号化
            const decrypted = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                importedKey,
                data
            );
            
            // 結果を文字列に変換
            const text = new TextDecoder().decode(decrypted);
            
            // JSONとしてパースできるか試みる
            try {
                return JSON.parse(text);
            } catch (e) {
                return text;
            }
        } catch (error) {
            console.error('復号化エラー:', error);
            throw new Error('データの復号化に失敗しました');
        }
    }

    // データを保存
    async setItem(id, data, options = {}) {
        const db = await this.open();
        const transaction = db.transaction('secureData', 'readwrite');
        const store = transaction.objectStore('secureData');
        
        // データを暗号化
        const encryptedData = await this.encryptData(data);
        
        const now = new Date().toISOString();
        const item = {
            id,
            data: encryptedData,
            encrypted: true,
            createdAt: options.createdAt || now,
            updatedAt: now,
            ...options.metadata
        };
        
        return new Promise((resolve, reject) => {
            const request = store.put(item);
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => {
                console.error('データの保存に失敗しました:', event.target.error);
                reject(new Error('データの保存に失敗しました'));
            };
        });
    }

    // データを取得
    async getItem(id) {
        const db = await this.open();
        const transaction = db.transaction('secureData', 'readonly');
        const store = transaction.objectStore('secureData');
        
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            
            request.onsuccess = async (event) => {
                const item = event.target.result;
                if (!item) {
                    resolve(null);
                    return;
                }
                
                try {
                    // データを復号化
                    const data = item.encrypted 
                        ? await this.decryptData(item.data)
                        : item.data;
                    
                    resolve({
                        ...item,
                        data,
                        decrypted: true
                    });
                } catch (error) {
                    console.error('データの復号化に失敗しました:', error);
                    reject(new Error('データの復号化に失敗しました'));
                }
            };
            
            request.onerror = (event) => {
                console.error('データの取得に失敗しました:', event.target.error);
                reject(new Error('データの取得に失敗しました'));
            };
        });
    }

    // データを削除
    async removeItem(id) {
        const db = await this.open();
        const transaction = db.transaction('secureData', 'readwrite');
        const store = transaction.objectStore('secureData');
        
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => {
                console.error('データの削除に失敗しました:', event.target.error);
                reject(new Error('データの削除に失敗しました'));
            };
        });
    }

    // すべてのデータを取得
    async getAllItems() {
        const db = await this.open();
        const transaction = db.transaction('secureData', 'readonly');
        const store = transaction.objectStore('secureData');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            
            request.onsuccess = async (event) => {
                const items = event.target.result;
                const decryptedItems = [];
                
                for (const item of items) {
                    try {
                        const data = item.encrypted 
                            ? await this.decryptData(item.data)
                            : item.data;
                        
                        decryptedItems.push({
                            ...item,
                            data,
                            decrypted: item.encrypted
                        });
                    } catch (error) {
                        console.error(`項目 ${item.id} の復号化に失敗しました:`, error);
                        // 復号化に失敗した項目はスキップ
                    }
                }
                
                resolve(decryptedItems);
            };
            
            request.onerror = (event) => {
                console.error('データの取得に失敗しました:', event.target.error);
                reject(new Error('データの取得に失敗しました'));
            };
        });
    }

    // データベースをクリア
    async clear() {
        const db = await this.open();
        const transaction = db.transaction('secureData', 'readwrite');
        const store = transaction.objectStore('secureData');
        
        return new Promise((resolve, reject) => {
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => {
                console.error('データベースのクリアに失敗しました:', event.target.error);
                reject(new Error('データベースのクリアに失敗しました'));
            };
        });
    }

    // データベースを削除
    async deleteDatabase() {
        await this.close();
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(this.dbName);
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => {
                console.error('データベースの削除に失敗しました:', event.target.error);
                reject(new Error('データベースの削除に失敗しました'));
            };
        });
    }

    // データベースを閉じる
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }

    // ユーティリティメソッド
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

// シングルトンインスタンスをエクスポート
const secureStorage = new SecureStorage();
export default secureStorage;
