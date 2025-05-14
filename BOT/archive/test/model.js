// node/learn.js
const tf = require("@tensorflow/tfjs-node");
const fs = require('fs');

// テキストを数値ベクトルに変換する関数
function textToVector(text) {
    const uniqueChars = Array.from(new Set(text.split(''))); // Get unique characters
    const vector = new Array(100).fill(0); // Initialize vector with fixed length of 100

    for (let i = 0; i < text.length && i < 100; i++) {
        const charIndex = uniqueChars.indexOf(text[i]);
        if (charIndex !== -1) {
            vector[charIndex] = 1; // Set the index to 1 for presence of the character
        }
    }
    return vector;
}

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

    // Add more layers and use Batch Normalization
    model.add(tf.layers.dense({units: 256, activation: 'relu', inputShape: [100], kernelRegularizer: tf.regularizers.l2(0.01)}));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({rate: 0.5}));

    model.add(tf.layers.dense({units: 128, activation: 'relu', kernelRegularizer: tf.regularizers.l2(0.01)}));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({rate: 0.5}));

    model.add(tf.layers.dense({units: 64, activation: 'relu', kernelRegularizer: tf.regularizers.l2(0.01)}));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({rate: 0.5}));

    // Output layer for binary classification
    model.add(tf.layers.dense({units: 1, activation: 'sigmoid'}));

    return model;
}

// モデルのコンパイル
function compileModel(model) {
    model.compile({
        optimizer: tf.train.adam(0.001), // Adjusted learning rate
        loss: 'binaryCrossentropy', // 損失関数（二値分類用）
        metrics: ['accuracy'] // 評価指標
    });
}

// モデルのトレーニング
async function trainModel(model, trainingData) {
    // トレーニングデータの準備
    if (!trainingData || trainingData.length === 0) {
        console.error("トレーニングデータが無効です:", trainingData);
        return;
    }

    // Check if the first element has the expected structure
    if (!trainingData[0] || !trainingData[0].input) {
        console.error("トレーニングデータの構造が無効です:", trainingData[0]);
        return;
    }

    const xs = tf.tensor2d(trainingData.map(item => item.input), [trainingData.length, trainingData[0].input.length]);
    const ys = tf.tensor2d(trainingData.map(item => item.output), [trainingData.length, 1]);

    // モデルのトレーニング
    const history = await model.fit(xs, ys, {
        epochs: 10, // Increased epochs
        batchSize: 16, // Adjusted batch size
        validationSplit: 0.2, // Increased validation split
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
    if (!testingData || testingData.length === 0 || !testingData[0] || !testingData[0].input) {
        console.error("テストデータが無効です:", testingData);
        return;
    }
    const xs = tf.tensor2d(testingData.map(item => item.input), [testingData.length, testingData[0].input.length]);
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
    // テキストを数値ベクトルに変換
    const inputVector = textToVector(inputText);

    // モデルへの入力として適切な形状に変換
    const tensor = tf.tensor2d([inputVector], [1, 100]);

    // 予測を実行
    const prediction = model.predict(tensor);
    const probability = prediction.dataSync()[0];

    return probability;
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
    const trainingData = dataset.slice(0, Math.floor(dataset.length * 0.9));
    const testingData = dataset.slice(Math.floor(dataset.length * 0.9));

    let model;

    // モデルの読み込みまたは新規作成
    try {
        model = await loadModel(modelPath);
        if (!model) {
            console.log("モデルの読み込みに失敗しました。新しいモデルを作成します。");
            model = createModel();
            compileModel(model);
        } else {
            // モデルが読み込まれた場合もコンパイルする
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
    const inputText = "優しいね";
    const probability = predict(model, inputText);
    console.log(`テキスト: "${inputText}" のBADな確率: ${probability.toFixed(4)}`);
}

// メイン関数の実行
main();