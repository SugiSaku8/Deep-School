# ログ出力システムを一新してください。
## ログの種類(ディスプレイ)

- stdout
  (Standart Output)
  ただのログをすべて表示。
- stderr
  (Standart Error)
  エラー出力をすべて表示。
- appout
  (Application Output)
  アプリケーションの出力をすべて表示。
- appin
  (Application Input)
  アプリケーションの入力をすべて表示。
- apperr
  (Application Error)
  アプリケーションのエラーをすべて表示。
- oappout
  (Offical-Application Output)
  公式アプリケーションの出力をすべて表示。
- oappin
  (Offical-Application Input)
  公式アプリケーションの入力をすべて表示。
- oapperr
  (Offical-Application Error)
  公式アプリケーションのエラーをすべて表示。
- 3rdappout
  (3rd-party-Application Output)
  3rd アプリケーションの出力をすべて表示。
- 3rdappin
  (3rd-party-Application Input)
  3rd アプリケーションの入力をすべて表示。
- 3rdapperr
  (3rd-party-Application Error)
  3rd アプリケーションのエラーをすべて表示。
- sysout
  (System Output)  
  システムの出力をすべて表示。
- sysin
  (System Input)  
  システムの入力をすべて表示。
- syserr
  (System Error)  
  システムのエラーをすべて表示。
- アプリ名in
(アプリ名-Input)
アプリ名の入力をすべて表示。
- アプリ名out
(アプリ名-Output)
アプリ名の出力をすべて表示。
- アプリ名err
(アプリ名-Error)
アプリ名のエラーをすべて表示。

↑これは、すべてのアプリに存在する。

## ログの仕組み
console.logだったものを、すべて次のようなフォーマットで保存する。 
ログの出力は、次のようなフォーマットで行う。 
```json
{
    "from": "dp.sys.logtest",
    "timestamp": "2021-01-01T00:00:00.000Z",
    "message": "Hello, world!"
}
```
fromの種類を検出し、どのディスプレイに保存するか決める。 
ディスプレイは、すべてメモリに保存されていて、コマンドによって呼び出されるまで保存される。 
これのコマンドは、 
```
ds.log.sw(ディスプレイ名);
// ds→ Deep-Shellメインコマンド
// log→ ログ関連コマンド
// sw→ ディスプレイの切り替え
```
ディスプレイの切り替えは、ディスプレイ名を引数に取り、ディスプレイを切り替える。 
これまでshell.jsの中にあった関数を、すべてdsクラスに統一して、window化する。 

## ログのfromの種類
```
dp.sys.*　→システムのログ
dp.sys.***.err→システムのエラー
dp.sys.***.out→システムの出力
dp.sys.***.in→システムの入力
dp.app.*　→アプリケーションのログ
dp.app.***.err→アプリケーションのエラー
dp.app.***.out→アプリケーションの出力
dp.app.***.in→アプリケーションの入力
dp.app.***.oapp.***.out→公式アプリケーションの出力
dp.app.***.oapp.***.in→公式アプリケーションの入力
dp.app.***.oapp.***.err→公式アプリケーションのエラー
dp.app.***.3rd.***.out→3rdアプリケーションの出力
dp.app.***.3rd.***.in→3rdアプリケーションの入力
dp.app.***.3rd.***.err→3rdアプリケーションのエラー
dp.app.アプリ名.***.err→アプリ名のエラー
dp.app.アプリ名.***.out→アプリ名の出力
dp.app.アプリ名.***.in→アプリ名の入力
```