export default class nimi {
  constructor(size) {
    this.size = size;
    this.data = new Array(size * size).fill(0);
    this.history = new Array(size * size).fill(null).map(() => ({})); // 履歴データの初期化
  }

  get(index) {
    if (index < 0 || index >= this.data.length) {
      throw new Error("インデックスが範囲外です");
    }
    return {
      value: this.data[index],
      sub: this.history[index],
    };
  }

  add(index, value) {
    if (index < 0 || index >= this.data.length) {
      throw new Error("インデックスが範囲外です");
    }
    this.data[index] += value; // データを追加
    // 履歴データを更新
    const timestamp = new Date().toISOString();
    this.history[index].adedime = this.history[index].adedime || [];
    this.history[index].adedime.push({ add: value, time: timestamp });
  }

  Value(index) {
    return this.get(index);
  }
}
/*
const nimi_0 = new nimi(32); // 32x32の名前空間の作成
nimi_0.add(1, 256); // 1という領域に256を追加する
console.log(nimi_0(1).value); // 256が出力される
console.log(nimi_0(1).sub); // {"adedime":[{"add":256,"time":"..."}]}が出力される
*/
