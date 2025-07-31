// convert.js
const fs = require('fs');

/**
 * テキストファイルをJSON形式に変換する
 * @param {string} inputFile - 入力テキストファイルのパス
 * @returns {Promise<void>}
 * @description
 * テキストファイルの各行を読み込み、以下の形式のJSONに変換します:
 * [
 *   {
 *     "text": "テキスト行の内容",
 *     "label": 1
 *   },
 *   ...
 * ]
 * 変換結果はoutput.jsonに保存されます。
 */
async function convertFile(inputFile) {
    try {
        // ファイルを読み込む
        const text = await fs.promises.readFile(inputFile, 'utf-8');
        
        // 各行を配列に分割
        const lines = text.split('\n').filter(line => line.trim());
        
        // JSON形式のデータに変換
        const jsonData = lines.map((text, index) => ({
            text: text.trim(),
            label: 1
        }));
        
        // JSON文字列に変換
        const jsonString = JSON.stringify(jsonData, null, 2);
        
        // 結果を出力
        console.log(jsonString);
        
        // ファイルに保存
        await fs.promises.writeFile('output.json', jsonString, 'utf-8');
        console.log('変換が完了しました。output.jsonに保存されました。');
        
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
}

// コマンドライン引数からファイル名を取得
const inputFile = process.argv[2];

if (!inputFile) {
    console.log('使用方法: node convert.js <入力ファイル名>');
    process.exit(1);
}

// 変換を実行
convertFile(inputFile);