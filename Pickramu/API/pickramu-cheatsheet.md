# Pickramu Compiler Cheatsheet

## 基本構造

### ユニットとチャプター
```markdown
@tag unit-title [open] ユニットタイトル 
@tag unit-title [close] 
 
@tag chapter-title [open] チャプタータイトル 
@tag chapter-title [close] 
```

### ブロック構造
```markdown
@tag n1 [open] 
  // コンテンツ 
@tag n1 [close] 

@tag n2 [open] 
  // コンテンツ 
@tag n2 [close] 
```

## テキスト要素

### 質問ブロック
```markdown
@tag question [open] 
質問文/br 
2行目の質問文 
@tag question [close] 
```

### 入力フィールド
```markdown 
@tag answer [open] 
@input input_id [open] 
問題文/br 
2行目の問題文 
@btn on=^set^ 回答する 
@input input_id futter=futter_id [close] 
 
@futter futter_id futter=futter_id [open] 
回答後の表示テキスト 
@futter futter_id futter=futter_id [close] 
@tag answer [close] 
```

### 通常のボタン
```markdown
@btn id=button_id ボタンテキスト 
@btn id=button_id class=custom-class ボタンテキスト 
```

## スクリプト

### ボタンクリックイベント
```markdown 
@script on=button_id [open] 
dom.Tag("n1").style.display('none','auto'); 
dom.Tag("n2").style.display('block','auto'); 
@script [close] 
```

## 特殊機能

### 改行
- テキスト内で`/br`を使用して改行を挿入 
```markdown 
最初の行/br 
2行目/br 
3行目 
```

### コメント
- 行頭に`//`を付けるとコメントとして扱われ、出力から除外 
```markdown 
// これはコメント行です 
実際のコンテンツ 
```

## スタイル

### デフォルトクラス
- `button-next`: ボタンのデフォルトスタイル
- `input-box`: 入力フィールドのデフォルトスタイル
- `input-container`: 入力フィールドのコンテナスタイル

### カスタムクラス
```markdown
@tag element_id class=custom-class [open] 
コンテンツ 
@tag element_id [close] 
```

## 表示制御

### 要素の表示/非表示
```markdown
@script on=button_id [open] 
dom.Tag("element_id").style.display('none','auto');  // 非表示 
dom.Tag("element_id").style.display('block','auto'); // 表示
@script [close] 
```

### LaTexについて
数式は、LaTex互換のMathJaxで処理されます。
詳しい使い方は、`mathjax-cheatsheet.md`をご覧ください。

## 使用例

### 基本的な問題形式
```markdown
@tag unit-title [open] 社会 Unit 1 
@tag unit-title [close] 

@tag chapter-title [open] 歴史 Chapter 1 
@tag chapter-title [close] 

@tag n1 [open] 
@tag question [open] 
問題文/br 
2行目の問題文 
@tag question [close] 
 
@tag answer [open] 
@input q1_input [open] 
答えを入力してください/br 
ヒント: 時代を考えましょう 
@btn on=^set^ 回答する 
@input q1_input futter=q1_answer [close] 
 
@futter q1_answer futter=q1_answer [open] 
正解は「旧石器時代」です。 
@futter q1_answer futter=q1_answer [close] 
@tag answer [close]  
 
@btn id=next1 次へ 
@tag n1 [close] 
 
@tag n2 [open]  
// 次の問題 
@tag n2 [close] 
 
@script on=next1 [open] 
dom.Tag("n1").style.display('none','auto'); 
dom.Tag("n2").style.display('block','auto'); 
@script [close] 
```  