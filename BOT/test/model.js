// node/learn.js
const tf = require("@tensorflow/tfjs-node");

// モデルの定義
const model = tf.sequential();
model.add(
  tf.layers.dense({ units: 64, activation: "relu", inputShape: [100] })
);
model.add(tf.layers.dense({ units: 32, activation: "relu" }));
model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

model.compile({
  optimizer: tf.train.adam(),
  loss: "binaryCrossentropy",
  metrics: ["accuracy"],
});

// 悪い評価のみを使用した学習データの準備
const trainingData = [
  {
    text: "頭おかしいんじゃない？",
    label: 1,
  },
  {
    text: "望みなし",
    label: 1,
  },
  {
    text: "息臭いよ",
    label: 1,
  },
  {
    text: "うんこ野郎！",
    label: 1,
  },
  {
    text: "おっさんが！",
    label: 1,
  },
  {
    text: "ヘタレが！",
    label: 1,
  },
  {
    text: "毎回なんなの？",
    label: 1,
  },
  {
    text: "死ね",
    label: 1,
  },
  {
    text: "脳みそ足りてる？",
    label: 1,
  },
  {
    text: "わかったわかった",
    label: 1,
  },
  {
    text: "ムカつくわ",
    label: 1,
  },
  {
    text: "老化してきたな。",
    label: 1,
  },
  {
    text: "残念ですね～",
    label: 1,
  },
  {
    text: "消すぞ",
    label: 1,
  },
  {
    text: "虚しいわお前",
    label: 1,
  },
  {
    text: "けち",
    label: 1,
  },
  {
    text: "嘘つきっぽい顔してる",
    label: 1,
  },
  {
    text: "おかめに似てるよね",
    label: 1,
  },
  {
    text: "下手くそ！",
    label: 1,
  },
  {
    text: "くさっ",
    label: 1,
  },
  {
    text: "あんたは信用できない",
    label: 1,
  },
  {
    text: "毎日暇そうだけどなにしてんの？",
    label: 1,
  },
  {
    text: "最低だな",
    label: 1,
  },
  {
    text: "けつでかい",
    label: 1,
  },
  {
    text: "泣き虫が！",
    label: 1,
  },
  {
    text: "鈍臭いな",
    label: 1,
  },
  {
    text: "空気読めてない",
    label: 1,
  },
  {
    text: "釣り合ってないよ",
    label: 1,
  },
  {
    text: "〇〇だから良いや",
    label: 1,
  },
  {
    text: "ワキガだよね。",
    label: 1,
  },
  {
    text: "胸無いねえ～",
    label: 1,
  },
  {
    text: "盗人が！",
    label: 1,
  },
  {
    text: "使えねえな",
    label: 1,
  },
  {
    text: "トイレの匂いする",
    label: 1,
  },
  {
    text: "残り物がお似合いだな",
    label: 1,
  },
  {
    text: "ほっとけよそんなカス",
    label: 1,
  },
  {
    text: "そそられないな",
    label: 1,
  },
  {
    text: "楽しむなよ",
    label: 1,
  },
  {
    text: "チビ",
    label: 1,
  },
  {
    text: "そんじょそこらの奴だな",
    label: 1,
  },
  {
    text: "生きてる価値なし",
    label: 1,
  },
  {
    text: "いつも目が笑ってないよね",
    label: 1,
  },
  {
    text: "結婚できなさそう",
    label: 1,
  },
  {
    text: "汚物が！",
    label: 1,
  },
  {
    text: "痩せたら？",
    label: 1,
  },
  {
    text: "変な顔",
    label: 1,
  },
  {
    text: "女捨ててるの？",
    label: 1,
  },
  {
    text: "友だち面すんな。",
    label: 1,
  },
  {
    text: "田舎くさくなったね",
    label: 1,
  },
  {
    text: "殺すぞ！",
    label: 1,
  },
  {
    text: "カス！",
    label: 1,
  },
  {
    text: "負のオーラが出てる",
    label: 1,
  },
  {
    text: "消えろ",
    label: 1,
  },
  {
    text: "あんたと一緒だと疲れるんだよね～",
    label: 1,
  },
  {
    text: "いじめられっ子だったでしょ",
    label: 1,
  },
  {
    text: "汚い！",
    label: 1,
  },
  {
    text: "ラリってんな",
    label: 1,
  },
  {
    text: "どんくさ〜！",
    label: 1,
  },
  {
    text: "幸薄そうだよね",
    label: 1,
  },
  {
    text: "ゴミ！",
    label: 1,
  },
  {
    text: "中の下",
    label: 1,
  },
  {
    text: "もうじき終わるよ君",
    label: 1,
  },
  {
    text: "特徴的な声だよね",
    label: 1,
  },
  {
    text: "少ない頭で考えろよ",
    label: 1,
  },
  {
    text: "やだ触んないで",
    label: 1,
  },
  {
    text: "汚れてる！",
    label: 1,
  },
  {
    text: "えー、キモーい！",
    label: 1,
  },
  {
    text: "力尽きろよ",
    label: 1,
  },
  {
    text: "もう帰って",
    label: 1,
  },
  {
    text: "めんどくさいよ君",
    label: 1,
  },
  {
    text: "スレイブ（奴隷）",
    label: 1,
  },
  {
    text: "溶けてなくなれ！",
    label: 1,
  },
  {
    text: "スカスカな頭だな",
    label: 1,
  },
  {
    text: "デブが！",
    label: 1,
  },
  {
    text: "ビッチが！",
    label: 1,
  },
  {
    text: "轢いちまうぞ",
    label: 1,
  },
  {
    text: "迷惑だよ",
    label: 1,
  },
  {
    text: "木偶（デク）の坊が！",
    label: 1,
  },
  {
    text: "面倒見れないよ",
    label: 1,
  },
  {
    text: "精神おかしいよ",
    label: 1,
  },
  {
    text: "ウツボみたいだな！",
    label: 1,
  },
  {
    text: "えんどう豆みたいだな！",
    label: 1,
  },
  {
    text: "エステいけよ",
    label: 1,
  },
  {
    text: "卒業すんなよ",
    label: 1,
  },
  {
    text: "敵ばっかだよお前",
    label: 1,
  },
  {
    text: "くそまじめが",
    label: 1,
  },
  {
    text: "施工してもらうか？",
    label: 1,
  },
  {
    text: "発情野郎が",
    label: 1,
  },
  {
    text: "オタクが",
    label: 1,
  },
  {
    text: "金魚の糞",
    label: 1,
  },
  {
    text: "体でかいね",
    label: 1,
  },
  {
    text: "宝物壊すぞ？",
    label: 1,
  },
  {
    text: "轢いちまうぞ",
    label: 1,
  },
  {
    text: "人間離れした顔",
    label: 1,
  },
  {
    text: "人殺してそうなツラ",
    label: 1,
  },
  {
    text: "ムカデ野郎が",
    label: 1,
  },
  {
    text: "ハゲが！",
    label: 1,
  },
  {
    text: "引きこもりが！",
    label: 1,
  },
  {
    text: "納豆がお似合いだな！",
    label: 1,
  },
  {
    text: "ほっとけよそんなカス",
    label: 1,
  },
  {
    text: "乳首でかっ",
    label: 1,
  },
  {
    text: "え！？男友達もいないの？",
    label: 1,
  },
  {
    text: "目が汚い",
    label: 1,
  },
  {
    text: "キリストも殴るわ",
    label: 1,
  },
  {
    text: "なんでまだ子供いないの？",
    label: 1,
  },
  {
    text: "発達障害じゃない？",
    label: 1,
  },
  {
    text: "屁の匂いだ",
    label: 1,
  },
  {
    text: "横顔が栃木県に似てますよね～！",
    label: 1,
  },
  {
    text: "肉片野郎が！",
    label: 1,
  },
  {
    text: "ハロウィンで仮装して渋谷に繰り出して馬鹿騒ぎしてそう！",
    label: 1,
  },
  {
    text: "なめくじが！",
    label: 1,
  },
  {
    text: "金魚とか 日で殺しそう！",
    label: 1,
  },
  {
    text: "満員電車で遠慮なく人の足踏んでそうですよね！",
    label: 1,
  },
  {
    text: "遠くから見たら親指に似てますよね！",
    label: 1,
  },
  {
    text: "妖怪人間！",
    label: 1,
  },
  {
    text: "平面な顔だな！",
    label: 1,
  },
  {
    text: "ニート！",
    label: 1,
  },
  {
    text: "蓄えすぎだわデブ",
    label: 1,
  },
  {
    text: "盛り上げ下手だな",
    label: 1,
  },
  {
    text: "刑務所帰れよ",
    label: 1,
  },
  {
    text: "阿婆擦れが！",
    label: 1,
  },
  {
    text: "インドにいけよ",
    label: 1,
  },
  {
    text: "三日天下だな。",
    label: 1,
  },
  {
    text: "ネズミ小僧が",
    label: 1,
  },
  {
    text: "ほつれた人生だな！",
    label: 1,
  },
  {
    text: "焼き入れたろうか？",
    label: 1,
  },
  {
    text: "豆タンク",
    label: 1,
  },
  {
    text: "しいたけ野郎が",
    label: 1,
  },
  {
    text: "閑古鳥もなくわ！",
    label: 1,
  },
  {
    text: "ミートボールが！",
    label: 1,
  },
  {
    text: "ぬか漬けにしてやろうか？",
    label: 1,
  },
  {
    text: "移動式眼鏡置場",
    label: 1,
  },
  {
    text: "納豆がお似合いだな！",
    label: 1,
  },
  {
    text: "脳内幻想郷",
    label: 1,
  },
  {
    text: "凛ともできないのか？",
    label: 1,
  },
  {
    text: "ザラブ星人",
    label: 1,
  },
  {
    text: "ブタキムチ",
    label: 1,
  },
  {
    text: "拉致るぞ！",
    label: 1,
  },
  {
    text: "ギガンテスブス",
    label: 1,
  },
  {
    text: "君ってデッサンが狂ってるね",
    label: 1,
  },
  {
    text: "お前の顔は神の誤算",
    label: 1,
  },
  {
    text: "病院行った方がいいよ。",
    label: 1,
  },
  {
    text: "利口ぶるなよ",
    label: 1,
  },
  {
    text: "女ラオウ",
    label: 1,
  },
  {
    text: "ちょっと顔がペヤングみたいだよ。",
    label: 1,
  },
  {
    text: "歩く殺人現場",
    label: 1,
  },
  {
    text: "人間加湿器",
    label: 1,
  },
  {
    text: "覆水盆に返らずだな！",
    label: 1,
  },
  {
    text: "「傲慢」が服着て歩いてる",
    label: 1,
  },
  {
    text: "濡れ衣着せたろうか？",
    label: 1,
  },
  {
    text: "楊貴妃の 倍ブス",
    label: 1,
  },
  {
    text: "やがて朽ちる運命",
    label: 1,
  },
  {
    text: "削岩機で舐められたような顔",
    label: 1,
  },
  {
    text: "ゆゆしくはない",
    label: 1,
  },
  {
    text: "お前の親が気の毒だ",
    label: 1,
  },
  {
    text: "真面目野郎が",
    label: 1,
  },
  {
    text: "息を吐くように嘘を吐く",
    label: 1,
  },
  {
    text: "顔面偏差値",
    label: 1,
  },
  {
    text: "不届きものが！",
    label: 1,
  },
  {
    text: "ロンパリやろう",
    label: 1,
  },
  {
    text: "イソギンチャクみたい",
    label: 1,
  },
  {
    text: "エロガッパが！！",
    label: 1,
  },
  {
    text: "リーマン風情が。",
    label: 1,
  },
  {
    text: "絶対ご飯粒とか残しそう！",
    label: 1,
  },
  {
    text: "花王の月みたいな横顔",
    label: 1,
  },
  {
    text: "和室の置物に丁度いい顔してるよね",
    label: 1,
  },
  {
    text: "ヅラだろどうせ",
    label: 1,
  },
  {
    text: "三途の川いけよ",
    label: 1,
  },
  {
    text: "ワンパンだわ",
    label: 1,
  },
  {
    text: "寝れなくさしてやるよ",
    label: 1,
  },
  {
    text: "顔面凶器",
    label: 1,
  },
  {
    text: "ヤカンのお湯ぶっかけたろうか",
    label: 1,
  },
  {
    text: "ささくれ野郎が！",
    label: 1,
  },
  {
    text: "とうもろこし野郎が",
    label: 1,
  },
  {
    text: "ルアーで釣ってやろうか",
    label: 1,
  },
  {
    text: "絶対道徳の成績１ですよね！",
    label: 1,
  },
  {
    text: "元気の押し売り",
    label: 1,
  },
  {
    text: "かまぼこみたいな顔してますよね～！",
    label: 1,
  },
  {
    text: "来世で会おうぜ",
    label: 1,
  },
  {
    text: "願ったり叶ったりだな！",
    label: 1,
  },
  {
    text: "頭がハッピーセット",
    label: 1,
  },
  {
    text: "ロウソク野郎が！",
    label: 1,
  },
  {
    text: "ルンバで吸ってやろうか",
    label: 1,
  },
  {
    text: "音の出るゴミ",
    label: 1,
  },
  {
    text: "湯冷めしちまうわお前の話",
    label: 1,
  },
  {
    text: "晩でも電灯いらないよな",
    label: 1,
  },
  {
    text: "人みたいなゴリラ",
    label: 1,
  },
  {
    text: "冷凍しちまうぞ",
    label: 1,
  },
  {
    text: "ねんねしな僕ちゃん",
    label: 1,
  },
  {
    text: "リスト外だよ",
    label: 1,
  },
  {
    text: "歴史に残らないモブキャラが",
    label: 1,
  },
  {
    text: "前世にどんだけ悪行働いたんだよ",
    label: 1,
  },
  {
    text: "産業廃棄物",
    label: 1,
  },
  {
    text: "アタマあったけえな",
    label: 1,
  },
  {
    text: "脳筋チンパン",
    label: 1,
  },
  {
    text: "ふくよかでいらっしゃる",
    label: 1,
  },
  {
    text: "個性的な装いをなさる方で",
    label: 1,
  },
  {
    text: "地面に落ちた柿",
    label: 1,
  },
  {
    text: "贅沢なことがお嫌いなの？",
    label: 1,
  },
  {
    text: "自信がおありで",
    label: 1,
  },
  {
    text: "（ホバー）ランランルー",
    label: 1,
  },
  {
    text: "失敗すんなよ",
    label: 1,
  },
  {
    text: "お前には無理だよ",
    label: 1,
  },
  {
    text: "あ？",
    label: 1,
  },
  {
    text: "ボコボコにしてやる",
    label: 1,
  },
  {
    text: "なにやってんだよ",
    label: 1,
  },
  {
    text: "あほ",
    label: 1,
  },
  {
    text: "消すぞ",
    label: 1,
  },
  {
    text: "甘やかしすぎたな",
    label: 1,
  },
  {
    text: "ばか",
    label: 1,
  },
  {
    text: "ぶっ飛ばすぞ",
    label: 1,
  },
  {
    text: "現実見ろ",
    label: 1,
  },
  {
    text: "ぼけ",
    label: 1,
  },
  {
    text: "どつくぞ 人の心とかないの？",
    label: 1,
  },
  {
    text: "ゴミ",
    label: 1,
  },
  {
    text: "半殺しにするぞ",
    label: 1,
  },
  {
    text: "インターネットやめろ",
    label: 1,
  },
  {
    text: "カス",
    label: 1,
  },
  {
    text: "クビになりたいか",
    label: 1,
  },
  {
    text: "勝手にしろ",
    label: 1,
  },
  {
    text: "お前",
    label: 1,
  },
  {
    text: "張り倒すぞ",
    label: 1,
  },
  {
    text: "黒歴史確定",
    label: 1,
  },
  {
    text: "頭悪い",
    label: 1,
  },
  {
    text: "壊すぞ",
    label: 1,
  },
  {
    text: "空気読め",
    label: 1,
  },
  {
    text: "下手",
    label: 1,
  },
  {
    text: "銃で撃つぞ",
    label: 1,
  },
  {
    text: "迷惑かけるな",
    label: 1,
  },
  {
    text: "タコ",
    label: 1,
  },
  {
    text: "覚悟しろ",
    label: 1,
  },
  {
    text: "虫酸（むしず）が走る",
    label: 1,
  },
  {
    text: "青二才",
    label: 1,
  },
  {
    text: "ケンカしよう",
    label: 1,
  },
  {
    text: "必要ある？",
    label: 1,
  },
  {
    text: "貴様",
    label: 1,
  },
  {
    text: "切るぞ",
    label: 1,
  },
  {
    text: "そんなことも知らないの？",
    label: 1,
  },
  {
    text: "おい",
    label: 1,
  },
  {
    text: "駆逐してやる",
    label: 1,
  },
  {
    text: "そんなこともできないの？",
    label: 1,
  },
  {
    text: "黙れ",
    label: 1,
  },
  {
    text: "抹殺する",
    label: 1,
  },
  {
    text: "なんでできないの？",
    label: 1,
  },
  {
    text: "早くしろ",
    label: 1,
  },
  {
    text: "抹消する",
    label: 1,
  },
  {
    text: "ニセモノでしょ",
    label: 1,
  },
  {
    text: "イキりキッズ",
    label: 1,
  },
  {
    text: "皆殺しにしてやる",
    label: 1,
  },
  {
    text: "やめちまえ",
    label: 1,
  },
  {
    text: "帰れ",
    label: 1,
  },
  {
    text: "燃やすぞ",
    label: 1,
  },
  {
    text: "お茶汲み兼コピー取りだろ",
    label: 1,
  },
  {
    text: "この野郎",
    label: 1,
  },
  {
    text: "無理してでもやれ",
    label: 1,
  },
  {
    text: "ROMれ",
    label: 1,
  },
  {
    text: "遅い",
    label: 1,
  },
  {
    text: "なぎ倒すぞ",
    label: 1,
  },
  {
    text: "特にお前だよ",
    label: 1,
  },
  {
    text: "何なん",
    label: 1,
  },
  {
    text: "殴り合いしようぜ",
    label: 1,
  },
  {
    text: "やる気ないなら帰れよ",
    label: 1,
  },
  {
    text: "落ちろ",
    label: 1,
  },
  {
    text: "ぶん殴るぞ",
    label: 1,
  },
  {
    text: "そんなんだから～",
    label: 1,
  },
  {
    text: "許さない",
    label: 1,
  },
  {
    text: "なんだと",
    label: 1,
  },
  {
    text: "一生そうしてれば",
    label: 1,
  },
  {
    text: "知るかボケ",
    label: 1,
  },
  {
    text: "舐めやがって",
    label: 1,
  },
  {
    text: "誰のおかげだと思ってるの？",
    label: 1,
  },
  {
    text: "うるせえ",
    label: 1,
  },
  {
    text: "呪ってやる",
    label: 1,
  },
  {
    text: "ウソつけ",
    label: 1,
  },
  {
    text: "やれ",
    label: 1,
  },
  {
    text: "うざい",
    label: 1,
  },
  {
    text: "参加しろ",
    label: 1,
  },
  {
    text: "ざぁこ♡",
    label: 1,
  },
  {
    text: "刺すぞ",
    label: 1,
  },
  {
    text: "頭が高い",
    label: 1,
  },
  {
    text: "戦争しよう",
    label: 1,
  },
  {
    text: "ダサい",
    label: 1,
  },
  {
    text: "しばくぞ",
    label: 1,
  },
  {
    text: "キモい",
    label: 1,
  },
  {
    text: "叩くぞ",
    label: 1,
  },
  {
    text: "カッコ悪い",
    label: 1,
  },
  {
    text: "血祭りにあげてやる",
    label: 1,
  },
  {
    text: "ムカつく",
    label: 1,
  },
  {
    text: "次はお前だ",
    label: 1,
  },
  {
    text: "こっちに来るな",
    label: 1,
  },
  {
    text: "悪いことしろ",
    label: 1,
  },
  {
    text: "最低",
    label: 1,
  },
  {
    text: "やるか？",
    label: 1,
  },
  {
    text: "臭い",
    label: 1,
  },
  {
    text: "やってみろよ",
    label: 1,
  },
  {
    text: "ハゲ",
    label: 1,
  },
  {
    text: "よこせ",
    label: 1,
  },
  {
    text: "自分でやれ",
    label: 1,
  },
  {
    text: "人間としてやめろよ",
    label: 1,
  },
  {
    text: "雑魚broだよ",
    label: 1,
  },
  {
    text: "リスペクトが足りないよ",
    label: 1,
  },
  {
    text: "荒らすなよ",
    label: 1,
  },
  {
    text: "カス",
    label: 1,
  },
  {
    text: "だまれ便乗しかできないのかよ",
    label: 1,
  },
  {
    text: "マジかよマスオ最低だな",
    label: 1,
  },
  {
    text: "いいね欲しいからって都合の良い解釈するな",
    label: 1,
  },
];

// 学習実行
async function trainModel() {
  // 全てのサンプルに同じ重みを付けて、バランスを保つ
  const tensors = trainingData.map((item) => ({
    tensor: tf.tensor2d([item.text], [1, 100]),
    label: item.label,
    weight: 1.0, // 全てのサンプルに同じ重みを付ける
  }));

  await model.fit(
    tf.concat(tensors.map((t) => t.tensor)),
    tf.tensor2d(
      tensors.map((t) => t.label),
      [tensors.length, 1]
    ),
    {
      epochs: 10,
      batchSize: 32,
      sampleWeight: tensors.map((t) => t.weight),
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          console.log(`エポック ${epoch + 1}:`);
          console.log(`損失: ${logs.loss.toFixed(4)}`);
          console.log(`精度: ${(logs.acc * 100).toFixed(2)}%`);
        },
      },
    }
  );

  // モデルの保存
  await model.save("file://./public/model");
  console.log("モデルが保存されました");
}

trainModel();
