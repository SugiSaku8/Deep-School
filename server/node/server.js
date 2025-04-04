const express = require('express');
const cors = require('cors'); // CORSをインポート
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const andel = require('./andel');

// CORSの設定
app.use(cors()); // すべてのオリジンからのリクエストを許可

// ID生成関数
function generateUniqueId(userId) {
    const timestamp = new Date().toISOString();
    return `${userId}_${timestamp}`;
}

// 投稿の追加
function AddAndel(name, andel, genre, user, reandel) {
    try {
        const folderPath = reandel ? 
            `./n/n_p/data/${genre}/${reandel}` : 
            `./n/n_p/data/${genre}`;

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
        const parentPath = `./n/n_p/data/${genre}/${parentId}`;
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

// ServerSide
function start() {
    // Andel追加処理
    app.use(bodyParser.json());
    app.use('/', andel);

    // Andel取得処理
    app.use(express.json()); // JSONデータをパースするためのミドルウェア
    app.post('/get', (req, res) => {
        let filePath = req.body.name; // ファイル名を取得
        fs.readFile(`./n/n_p/data/${filePath}`, 'utf8', (err, data) => { // ファイルを直接読み取る
            if (err) {
                res.status(500).json({ status: 'エラーが発生しました。' });
                return;
            }
            res.json({ data: data });
        });
    });

    // 最新のものを取得する処理
    function getFiles(dirPath) {
        let files = fs.readdirSync(dirPath);
        let filePaths = [];
        files.forEach((file) => {
            let filePath = path.join(dirPath, file);
            let stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                filePaths = filePaths.concat(getFiles(filePath));
            } else if (path.extname(filePath) === '.json') {
                filePaths.push(filePath);
            }
        });
        return filePaths;
    }

    let filePaths = getFiles('./n/n_p/data');
    let jsonData = filePaths.map((file) => {
        let data = JSON.parse(fs.readFileSync(file, 'utf8'));
        let stats = fs.statSync(file);
        return { data, updatedAt: stats.mtime };
    });

    jsonData.sort((a, b) => b.updatedAt - a.updatedAt);
    let latestJsonData = jsonData.slice(0, 10).map(json => json.data);

    app.get('/top', (req, res) => {
        res.json(latestJsonData);
    });

    // 勉強相談室の処理
    let files = getFiles('./n/n_p/data/勉強相談室');
    let jsons = files.map((file) => {
        let data = JSON.parse(fs.readFileSync(file, 'utf8'));
        let stats = fs.statSync(file);
        return { data, updatedAt: stats.mtime };
    });

    jsons.sort((a, b) => b.updatedAt - a.updatedAt);
    let latestJsons = jsons.slice(0, 10).map(json => json.data);

    app.get('/scr', (req, res) => {
        res.json(latestJsons);
    });
    // 勉強相談室のコード終了

    // publicを/にする
    app.use(express.static('public'));

    // Webサーバーの領域
    // 404,500の処理
    app.use((req, res, next) => {
        res.status(404).sendFile(__dirname + '/public/error/404.html');
    });

    app.use((err, req, res, next) => {
        res.status(500).sendFile(__dirname + '/public/error/500.html');
    });

    // webサイトのところ
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    });

    app.get('/en', (req, res) => {
        res.sendFile(__dirname + '/public/en.html');
    });

    app.get('/help/cookie/ja', (req, res) => {
        res.sendFile(__dirname + '/public/data/help/Cookieja.html');
    });

    app.get('/help/cookie', (req, res) => {
        res.sendFile(__dirname + '/public/data/help/Cookie.html');
    });

    // サーバを立てるところ
    const PORT = 2539;
    app.listen(PORT, () => console.log(`Server is up on port ${PORT}!`));
}

// All Start
console.log("All stating....");
start();