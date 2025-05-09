@config [open]
name テスト
ver 1.0.0
@style [open]
 #red{
    color:red;
 }
@style [close]
@config [close]
@tag testA [open]
#　見出し1
これは、段落です。
@btn id=testbtn ボタン
@tag testa [close]
@script on=testbtn [open]
function main(){
  dom.Tag("testA").style.display('none','auto');
  dom.Tag("testB").style.display('block','auto');
}
@script [close]

@tag testB [open] ^hide^
# これは、見出し2です。
-　リスト1
-　リスト2
@tag testB [close]