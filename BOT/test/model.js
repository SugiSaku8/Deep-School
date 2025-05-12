// node/learn.js
const tf = require('@tensorflow/tfjs-node');

// モデルの定義
const model = tf.sequential();
model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [100] }));
model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

model.compile({
    optimizer: tf.train.adam(),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
});

// 悪い評価のみを使用した学習データの準備
const trainingData = [
    { text: "最悪です", label: 1 },
    { text: "非常に不適切です", label: 1 },
    { text: "絶対にダメです", label: 1 },
    { text: "全く役に立たない", label: 1 },
    { text: "最低です", label: 1 },
    { text: "許せない", label: 1 },
    { text: "不快です", label: 1 },
    { text: "失礼です", label: 1 },
    { text: "無礼です", label: 1 },
    { text: "不適切です", label: 1 }
];

// 学習実行
async function trainModel() {
    // 全てのサンプルに同じ重みを付けて、バランスを保つ
    const tensors = trainingData.map(item => ({
        tensor: tf.tensor2d([item.text], [1, 100]),
        label: item.label,
        weight: 1.0 // 全てのサンプルに同じ重みを付ける
    }));

    await model.fit(
        tf.concat(tensors.map(t => t.tensor)),
        tf.tensor2d(tensors.map(t => t.label), [tensors.length, 1]),
        {
            epochs: 10,
            batchSize: 32,
            sampleWeight: tensors.map(t => t.weight),
            validationSplit: 0.2,
            callbacks: {
                onEpochEnd: async (epoch, logs) => {
                    console.log(`エポック ${epoch + 1}:`);
                    console.log(`損失: ${logs.loss.toFixed(4)}`);
                    console.log(`精度: ${(logs.acc * 100).toFixed(2)}%`);
                }
            }
        }
    );

    // モデルの保存
    await model.save('file://./public/model');
    console.log('モデルが保存されました');
}

trainModel();