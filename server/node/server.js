const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const speakeasy = require('speakeasy'); // 2要素認証用

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

// ユーザー認証関数
async function authenticateUser(user, pass, filename) {
    try {
        const authFile = await fs.readFile(path.join(DATA_DIR, `${filename}.ifon`), 'utf8');
        const authData = JSON.parse(authFile);
        
        // 実際の実装ではパスワードはハッシュ化して比較する必要があります
        return authData.user === user && authData.pass === pass;
    } catch (err) {
        return false;
    }
}

// 2要素認証の検証
function verify2FA(secret, token) {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token
    });
}

// GETエンドポイント
app.get('/get', async (req, res) => {
    const { query, user, pass, m } = req.query;
    
    try {
        // データファイル一覧を取得
        const files = await fs.readdir(DATA_DIR);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        
        // 認証チェック
        const results = [];
        
        for (const file of jsonFiles) {
            const filename = file.replace('.json', '');
            if (await authenticateUser(user, pass, filename)) {
                const data = JSON.parse(
                    await fs.readFile(path.join(DATA_DIR, file), 'utf8')
                );
                
                // 検索クエリに基づいてフィルタリング
                if (JSON.stringify(data).toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                        filename: filename,
                        data: m === 'detail' ? data : { metadata: data.metadata }
                    });
                }
            }
        }
        
        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// EDITエンドポイント
app.post('/edit', async (req, res) => {
    const { quser, pass, id, did, tfc, data } = req.query;
    
    try {
        // 認証チェック
        if (!await authenticateUser(quser, pass, id)) {
            return res.status(401).json({ success: false, error: '認証エラー' });
        }
        
        // 2要素認証チェック
        const authData = JSON.parse(
            await fs.readFile(path.join(DATA_DIR, `${id}.ifon`), 'utf8')
        );
        
        if (!verify2FA(authData.twoFactorSecret, tfc)) {
            return res.status(401).json({ success: false, error: '2要素認証エラー' });
        }
        
        // データ更新
        const jsonPath = path.join(DATA_DIR, `${id}.json`);
        const fileData = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
        
        if (did) {
            // 特定のデータIDを更新
            fileData.data[did] = JSON.parse(data);
        } else {
            // メタデータを更新
            Object.assign(fileData.metadata, JSON.parse(data));
        }
        
        fileData.metadata.lastModified = new Date().toISOString();
        
        await fs.writeFile(jsonPath, JSON.stringify(fileData, null, 4));
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});