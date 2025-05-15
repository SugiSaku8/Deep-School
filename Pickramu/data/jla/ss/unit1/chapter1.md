@tag unit-title [open] Jla-1 社会 Unit 2
@tag unit-title [close]
@tag chapter-title [open] 連立方程式の計算 Chapter 23
@tag chapter-title [close]

@tag n1 [open]

@tag question [open]
約 10 万年前ごろのものと見られる人類の痕跡が日本列島から見つかりました。  
この頃の人類は、動物を狩って生活していました。

@tag question [close]

@tag answer [open]
@input n1_input [open]
この時代のことをなんというか答えなさい。
@input n1_input futter=[close]
@futter n1_asnwer_futter [open]
この時代のことは、旧石器時代と言います。
@futter n1_asnwer_futter [close]
@tag answer [close]
@btn id=btn1 次へ

@tag n1 [close]

@tag question [open]
約 1 万年前、日本列島が大陸から分離しました。
紀元前 3000 年ごろ、稲作が日本列島に伝わりました。
@tag question [close]
@btn id=btn2 次へ

@script on=btn1 [open]
dom.Tag("n1").style.display('none','auto');
dom.Tag("n2").style.display('block','auto');
@script [close]

@script on=btn2 [open]
dom.back();
@script [close]
