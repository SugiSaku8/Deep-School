# New-UI 2025-June Update
## コンセプト
黒板に書いたチョークのような、ムラのある要素が特徴的なUI。 
POPUPコンテントは、黒板に投影したプロジェクターの画面のように、少し薄く、少し周囲がボケたようなUIにする。 
視認性を最優先にするために、ムラの程度も、いくつか設定する。
アクセティビリティに配慮するために、APPLEが定めている基準をすべて突破する。
アクセティビリティのUIも、このUIに準拠する。
背景にも、ムラを作る。

---

## 1. カラーパレット
- メイン: 黒板グリーン `#2d3a2e`、チョークホワイト `#f8f8f2`
- アクセント: チョークイエロー `#ffe066`、チョークピンク `#ffb3c6`
- サブ: 黒板ダーク `#1a221b`、チョークブルー `#aee9f5`

## 2. UI要素の特徴
- **背景**: チョークのムラ感を再現したノイズテクスチャ。CSSの`background-blend-mode`やSVGノイズ、canvas生成ノイズを利用。
- **ボーダー/枠線**: チョークで描いたような不均一な線。SVGやbox-shadowで表現。
- **ボタン**: 角丸、チョークで囲ったような枠、ホバー時に色ムラやチョーク粉のようなエフェクト。
- **ポップアップ**: 黒板に投影したプロジェクター風。背景を半透明＋ぼかし（backdrop-filter: blur）＋外側に淡いグロー。
- **テキスト**: チョークフォント推奨（例: "AnkaCoder-r.ttf"、Google Fontsの"Schoolbell"など）。

## 3. アクセシビリティ
- コントラスト比: WCAG 2.1 AA/AAA基準を満たす配色。
- フォーカスリング: 太めで視認性の高い色。
- キーボード操作: すべてのUI要素がTab/Enterで操作可能。
- スクリーンリーダー対応: 適切なaria属性。

## 4. 実装例
### 背景ノイズ（CSSのみ）
```css
body {
  background: #2d3a2e;
  background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4"/></filter><rect width="100" height="100" filter="url(%23noise)"/></svg>');
  background-size: 300px 300px;
}
```

### チョーク風ボタン
```css
.button-chalk {
  background: #2d3a2e;
  color: #f8f8f2;
  border: 2px dashed #f8f8f2;
  border-radius: 16px;
  font-family: 'AnkaCoder-r', 'Schoolbell', cursive;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: box-shadow 0.2s, filter 0.2s;
}
.button-chalk:hover {
  box-shadow: 0 4px 16px #ffe06688;
  filter: brightness(1.1) blur(0.5px);
}
```

### プロジェクター風ポップアップ
```css
.popup {
  background: rgba(248,248,242,0.92);
  border-radius: 24px;
  box-shadow: 0 0 32px 8px #fff8, 0 0 0 4px #ffe06644;
  backdrop-filter: blur(4px);
  padding: 2em;
}
```

### JSでのノイズ生成例（canvas）
```js
function createChalkNoise(canvas) {
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const gray = 220 + Math.random() * 35;
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}
```

## 5. UIサンプルイメージ
- ![黒板UIイメージ](https://user-images.githubusercontent.com/xxx/chalkboard_ui_sample.png)
- ![チョークボタン例](https://user-images.githubusercontent.com/xxx/chalk_button_sample.png)

## 6. フォント
- `/Client/re/font/AnkaCoder-r.ttf` などを利用。
- Google Fonts: [Schoolbell](https://fonts.google.com/specimen/Schoolbell)

## 7. 備考
- すべてのUI要素は、アクセシビリティ基準を満たすこと。
- ユーザーがムラの強度や配色をカスタマイズできる設定画面を用意する。
- 主要なUI部品は`/Client/js/`配下に実装例を格納。