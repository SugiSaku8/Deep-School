const fs = require('fs');
const path = require('path');

// ファイルのパスを指定
const filePath = path.join(__dirname, 'moto.txt');

// ファイルを読み込む
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('ファイルの読み込みに失敗しました:', err);
        return;
    }

    // テキストを行ごとに分割し、配列に変換
    const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // 結果を表示
    console.log(JSON.stringify(lines, null, 2));
});