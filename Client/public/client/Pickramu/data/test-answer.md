@tag unit-title [open] テスト用教材
@tag unit-title [close]

@tag question [open]
簡単なテスト問題です。/br
1 + 1 = ?
@tag question [close]

@input test_input [open]
答えを入力してください：
@btn on=^test_btn^ 回答する
@input test_input futter=test_answer [close]

@futter test_answer futter=test_answer [open]
正解は「2」です！/br
1 + 1 = 2 ですね。
@futter test_answer futter=test_answer [close]

@btn id=back_btn 戻る

@script on=back_btn [open]
dom.back();
@script [close] 