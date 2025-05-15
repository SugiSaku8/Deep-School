@tag unit-title [open] Jla-1 社会 Unit 2
@tag unit-title [close]
//ユニットタイトル
@tag chapter-title [open] 連立方程式の計算 Chapter 23
@tag chapter-title [close]
//チャプタータイトル
@tag n1 [open]
//n1タグ(はじめの画面)の要素
@tag question [open]
約 10 万年前ごろのものと見られる人類の痕跡が日本列島から見つかりました。  
この頃の人類は、動物を狩って生活していました。
@tag question [close]
//説明文（問題文）
@tag answer [open]
@input n1_input [open]
この時代のことをなんというか答えなさい。
@input n1_input futter=[close]
//入力欄
@futter n1_asnwer_futter [open]
この時代のことは、旧石器時代と言います。
@futter n1_asnwer_futter [close]
//回答した後に表示されるフッター
@futter_script n1_input n1_asnwer_futter
//リンクづけ。
//n1_inputがenterされたらn1_asnwer_futterに転送する。
@tag answer [close]
@btn id=btn1 次へ
//次へボタン

@tag n1 [close]

@tag question [open]
約 1 万年前、日本列島が大陸から分離しました。
紀元前 3000 年ごろ、稲作が日本列島に伝わりました。
@tag question [close]
//説明文
@btn id=btn2 次へ
//次へボタン
@script on=btn1 [open]
//btn1がonclickした時に発動するscript
dom.Tag("n1").style.display('none','auto');
dom.Tag("n2").style.display('block','auto');
@script [close]

@script on=btn2 [open]
//btn2がonclickした時に発動するscript
dom.back();
@script [close]
