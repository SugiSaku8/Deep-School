// node/learn.js
const tf = require("@tensorflow/tfjs-node");
const fs = require('fs');

// データセットの読み込み
async function loadDataset(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("データセットの読み込みエラー:", error);
        return null;
    }
}

// モデルの定義
function createModel() {
const model = tf.sequential();

    // レイヤー1: 入力層 - 100次元の入力を受け取る全結合層
    model.add(tf.layers.dense({units: 128, activation: 'relu', inputShape: [100]}));

    // レイヤー2: 中間層 - 活性化関数にReLUを使用
    model.add(tf.layers.dense({units: 64, activation: 'relu'}));

    // レイヤー3: 出力層 - 1つのニューロンを持つ全結合層（二値分類）
    model.add(tf.layers.dense({units: 1, activation: 'sigmoid'}));

    return model;
}

// モデルのコンパイル
function compileModel(model) {
model.compile({
        optimizer: 'adam', // 最適化アルゴリズム
        loss: 'binaryCrossentropy', // 損失関数（二値分類用）
        metrics: ['accuracy'] // 評価指標
    });
}

// モデルのトレーニング
async function trainModel(model, trainingData) {
    // トレーニングデータの準備
    const xs = tf.tensor2d(trainingData.map(item => item.input), [trainingData.length, trainingData[0].input.length]);
    const ys = tf.tensor2d(trainingData.map(item => item.output), [trainingData.length, 1]);


    // モデルのトレーニング
    const history = await model.fit(xs, ys, {
        epochs: 10, // エポック数
        batchSize: 32, // バッチサイズ
        validationSplit: 0.1, // 検証データの割合
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
                console.log(`エポック ${epoch + 1}: 損失 = ${logs.loss.toFixed(4)}, 精度 = ${logs.acc.toFixed(4)}, 検証損失 = ${logs.val_loss.toFixed(4)}, 検証精度 = ${logs.val_acc.toFixed(4)}`);
            }
        }
    });

    return history;
}

// モデルの評価
function evaluateModel(model, testingData) {
    const xs = tf.tensor2d(testingData.map(item => item.input), [testingData.length, 100]);
    const ys = tf.tensor2d(testingData.map(item => item.output), [testingData.length, 1]);

    const results = model.evaluate(xs, ys);

    console.log("評価損失:", results[0].dataSync()[0].toFixed(4));
    console.log("評価精度:", results[1].dataSync()[0].toFixed(4));
}

// モデルの保存
async function saveModel(model, filePath) {
    await model.save(`file://${filePath}`);
    console.log("モデルを保存しました:", filePath);
}

// モデルの読み込み
async function loadModel(filePath) {
    try {
        const model = await tf.loadLayersModel(`file://${filePath}/model.json`);
        console.log("モデルを読み込みました:", filePath);
        return model;
    } catch (error) {
        console.error("モデルの読み込みエラー:", error);
        return null;
    }
}

// 新しいテキストに対する予測
function predict(model, inputText) {
    // テキストを数値ベクトルに変換（例：one-hot encoding）
    const inputVector = textToVector(inputText);

    // モデルへの入力として適切な形状に変換
    const tensor = tf.tensor2d([inputVector], [1, 100]);

    // 予測を実行
    const prediction = model.predict(tensor);
    const probability = prediction.dataSync()[0];

    return probability;
}

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

// メイン関数
async function main() {
    // データセットのパス
    const datasetPath = 'dataset.json';
    const modelPath = 'my-model';

    // データセットの読み込み
    const dataset = await loadDataset(datasetPath);
    if (!dataset) {
        console.log("データセットの読み込みに失敗しました。");
        return;
    }

    // データの分割（トレーニングデータとテストデータ）
    const trainingData = dataset.slice(0, Math.floor(dataset.length * 0.8));
    const testingData = dataset.slice(Math.floor(dataset.length * 0.8));

    let model;

    // モデルの読み込みまたは新規作成
    try {
        model = await loadModel(modelPath);
        if (!model) {
            console.log("モデルの読み込みに失敗しました。新しいモデルを作成します。");
            model = createModel();
            compileModel(model);
        }
    } catch (error) {
        console.error("モデルの読み込みエラー:", error);
        console.log("新しいモデルを作成します。");
        model = createModel();
        compileModel(model);
    }

    // モデルのトレーニング
    console.log("モデルのトレーニングを開始します。");
    await trainModel(model, trainingData);

    // モデルの評価
    console.log("モデルの評価を開始します。");
    evaluateModel(model, testingData);

  // モデルの保存
    console.log("モデルを保存します。");
    await saveModel(model, modelPath);

    // 新しいテキストに対する予測
    const inputText = "This is a positive example.";
    const probability = predict(model, inputText);
    console.log(`テキスト: "${inputText}" のポジティブな確率: ${probability.toFixed(4)}`);
}

// データセットの準備
async function prepareDataset() {
    // データセットの読み込み
    const positiveExamples = await loadDataset('positive_examples.json');
    const negativeExamples = await loadDataset('negative_examples.json');

    // データの整形
    let dataset = [];

    positiveExamples.forEach(item => {
        dataset.push({
            input: textToVector(item.text),
            output: [1] // ポジティブな例
        });
    });

    negativeExamples.forEach(item => {
        dataset.push({
            input: textToVector(item.text),
            output: [0] // ネガティブな例
        });
    });

    // データセットをシャッフル
    dataset = tf.util.shuffle(dataset);

    // データセットをJSONファイルに保存
    fs.writeFileSync('dataset.json', JSON.stringify(dataset, null, 2));
    console.log("データセットを保存しました: dataset.json");
}

// prepareDataset().then(() => {
//     console.log("データセットの準備が完了しました。");
// });

// メイン関数の実行
main();
