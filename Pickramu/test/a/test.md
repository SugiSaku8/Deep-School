@config [open]
name テスト
ver 1.0.0
@style [open]
#red{
color:red;
}
#testB{
display:none;
}
@style [close]
@config [close]
@tag testA [open] #　見出し 1
これは、段落です。
@btn id=testbtn ボタン
@tag testa [close]
@script on=testbtn [open]
dom.Tag("testA").style.display('none','auto');
dom.Tag("testB").style.display('block','auto');
@script [close]

@tag testB  [open]

# これは、見出し 2 です。

-　リスト 1 -　リスト 2
@tag testB [close]
