const tf = require("@tensorflow/tfjs-node");
const fs = require('fs');

// テキストを数値ベクトルに変換する関数（例：one-hot encoding）
function textToVector(text) {
    // ここにテキストを数値ベクトルに変換するロジックを実装
    // 例：単語のone-hot encoding、TF-IDFなど
    // 簡単な例として、テキストの長さを100次元のベクトルに変換
    let vector = new Array(100).fill(0);
    for (let i = 0; i < text.length && i < 100; i++) {
        vector[i] = text.charCodeAt(i) / 255; // 正規化
    }
    return vector;
}

async function transformDataset() {
    const datasetPath = 'output.json';
    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

    const transformedDataset = dataset.map(item => ({
        input: textToVector(item.text),
        output: [item.label]
    }));

    fs.writeFileSync('dataset.json', JSON.stringify(transformedDataset, null, 2));
    console.log("データセットを変換し、保存しました: dataset.json");
}

transformDataset();