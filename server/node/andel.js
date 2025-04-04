const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// ID生成関数
function generateUniqueId(userId) {
    const timestamp = new Date().toISOString();
    return `${userId}_${timestamp}`;
}

// 投稿の追加
function AddAndel(name, andel, genre, user, reandel) {
    try {
        const folderPath = reandel ? 
            `./n/p/data/${genre}/${reandel}` : 
            `./n/p/data/${genre}`;

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const uniqueId = generateUniqueId(user);
        const currentTime = new Date().getTime();
        const fileName = `${uniqueId}.json`; // IDをファイル名に使用
        const filePath = path.join(folderPath, fileName);

        const andeldata = {
            id: uniqueId,
            name: name,
            andel: andel,
            user: user,
            genre: genre,
            time: currentTime,
            resolved: false,
            infon: {
                createdAt: currentTime,
                createdBy: user,
                linkedPosts: [] // 投稿に紐づけられる情報
            }
        };

        fs.writeFileSync(filePath, JSON.stringify(andeldata, null, 2));
        return true;
    } catch (error) {
        console.error('AddAndel Error:', error);
        return false;
    }
}

// リプライの投稿
function AddReply(parentId, replyContent, user, genre) {
    try {
        const parentPath = `./n/p/data/${genre}/${parentId}`;
        const repliesPath = path.join(parentPath, 'replies');

        if (!fs.existsSync(repliesPath)) {
            fs.mkdirSync(repliesPath, { recursive: true });
        }

        const uniqueId = generateUniqueId(user);
        const currentTime = new Date().getTime();
        const replyFileName = `${uniqueId}.json`; // IDをファイル名に使用
        const replyFilePath = path.join(repliesPath, replyFileName);

        const replyData = {
            id: uniqueId,
            content: replyContent,
            user: user,
            time: currentTime,
            parentId: parentId,
            infon: {
                createdAt: currentTime,
                createdBy: user
            }
        };

        fs.writeFileSync(replyFilePath, JSON.stringify(replyData, null, 2));
        return true;
    } catch (error) {
        console.error('AddReply Error:', error);
        return false;
    }
}

// 投稿の追加
router.post('/send', (req, res) => {
    try {
        let title = req.body.title;
        let data = req.body.body;
        let genre = req.body.genre;
        let user = req.body.user;
        
        if (!title || !data || !genre || !user) {
            res.json({ 
                status: 'error',
                message: '失敗しました。\nすべての項目を入力してください。'
            });
            return;
        }

        const sanitizedGenre = genre.replace(/[\/\\]/g, '');
        const sanitizedUser = user.replace(/[\/\\]/g, '');
        const sanitizedTitle = title.replace(/[\/\\]/g, '');

        const success = AddAndel(sanitizedTitle, data, sanitizedGenre, sanitizedUser);
        
        if (success) {
            res.json({ 
                status: 'success',
                message: '投稿が完了しました。'
            });
        } else {
            res.json({ 
                status: 'error',
                message: '投稿の保存中にエラーが発生しました。'
            });
        }
    } catch (error) {
        console.error('Send Error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'サーバーエラーが発生しました。'
        });
    }
});

// リプライの投稿
router.post('/reply', (req, res) => {
    try {
        const { parentId, content, user, genre } = req.body;

        if (!parentId || !content || !user || !genre) {
            return res.json({
                status: 'error',
                message: '必要な情報が不足しています。'
            });
        }

        const success = AddReply(parentId, content, user, genre);

        if (success) {
            res.json({
                status: 'success',
                message: 'リプライを投稿しました。'
            });
        } else {
            res.json({
                status: 'error',
                message: 'リプライの投稿に失敗しました。'
            });
        }
    } catch (error) {
        console.error('Reply Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'サーバーエラーが発生しました。'
        });
    }
});

// リプライの取得
router.get('/replies/:genre/:parentId', (req, res) => {
    try {
        const { genre, parentId } = req.params;
        const repliesPath = path.join('./n/p/data', genre, parentId, 'replies');

        if (!fs.existsSync(repliesPath)) {
            return res.json({
                status: 'success',
                data: []
            });
        }

        const replies = fs.readdirSync(repliesPath)
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const filePath = path.join(repliesPath, file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                return {
                    ...data,
                    id: file.replace('.json', '')
                };
            });

        replies.sort((a, b) => a.time - b.time);

        res.json({
            status: 'success',
            data: replies
        });
    } catch (error) {
        console.error('Get Replies Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'リプライの取得に失敗しました。'
        });
    }
});

// 解決状態の更新
router.post('/resolve', (req, res) => {
    try {
        const { genre, fileName, resolved } = req.body;
        const filePath = path.join('./n/p/data', genre, fileName);

        if (!fs.existsSync(filePath)) {
            return res.json({
                status: 'error',
                message: '指定された投稿が見つかりません。'
            });
        }

        const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        fileData.resolved = resolved;
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));

        res.json({
            status: 'success',
            message: resolved ? '解決済みに更新しました。' : '未解決に更新しました。'
        });
    } catch (error) {
        console.error('Resolve Error:', error);
        res.status(500).json({
            status: 'error',
            message: '更新に失敗しました。'
        });
    }
});

// ジャンル一覧の取得
router.get('/genres', (req, res) => {
    try {
        const dataPath = './n/p/data';
        const genres = fs.readdirSync(dataPath)
            .filter(item => fs.statSync(path.join(dataPath, item)).isDirectory());

        res.json({
            status: 'success',
            data: genres
        });
    } catch (error) {
        console.error('Genres Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'ジャンル一覧の取得に失敗しました。'
        });
    }
});

// ジャンル別投稿の取得
router.get('/genre/:genreName', (req, res) => {
    try {
        const { genreName } = req.params;
        const genrePath = path.join('./n/p/data', genreName);

        if (!fs.existsSync(genrePath)) {
            return res.json({
                status: 'success',
                data: []
            });
        }

        const posts = fs.readdirSync(genrePath)
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const filePath = path.join(genrePath, file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                return {
                    ...data,
                    fileName: file,
                    genrePath: genreName
                };
            });

        posts.sort((a, b) => b.time - a.time);

        res.json({
            status: 'success',
            data: posts
        });
    } catch (error) {
        console.error('Genre Posts Error:', error);
        res.status(500).json({
            status: 'error',
            message: '投稿の取得に失敗しました。'
        });
    }
});

// 検索機能
router.get('/search', (req, res) => {
    try {
        const { query, genre } = req.query;
        const dataPath = './n/p/data';
        let searchResults = [];

        const searchInDirectory = (dirPath) => {
            const files = fs.readdirSync(dirPath)
                .filter(file => file.endsWith('.json'));

            files.forEach(file => {
                const filePath = path.join(dirPath, file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                const matchesQuery = query ? 
                    (data.name.toLowerCase().includes(query.toLowerCase()) ||
                     data.andel.toLowerCase().includes(query.toLowerCase()) ||
                     data.user.toLowerCase().includes(query.toLowerCase())) : true;

                const matchesGenre = genre ? 
                    data.genre === genre : true;

                if (matchesQuery && matchesGenre) {
                    searchResults.push({
                        ...data,
                        fileName: file,
                        genrePath: path.relative(dataPath, dirPath)
                    });
                }
            });
        };

        if (genre) {
            const genrePath = path.join(dataPath, genre);
            if (fs.existsSync(genrePath)) {
                searchInDirectory(genrePath);
            }
        } else {
            const genres = fs.readdirSync(dataPath)
                .filter(item => fs.statSync(path.join(dataPath, item)).isDirectory());

            genres.forEach(genre => {
                const genrePath = path.join(dataPath, genre);
                searchInDirectory(genrePath);
            });
        }

        searchResults.sort((a, b) => b.time - a.time);

        res.json({
            status: 'success',
            data: searchResults
        });
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({
            status: 'error',
            message: '検索に失敗しました。'
        });
    }
});

module.exports = router;