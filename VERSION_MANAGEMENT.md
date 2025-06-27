# Deep-School Version Management System

## 概要

Deep-School Version Management Systemは、Deep-Schoolファミリーソフトウェア全体のバージョンを一元管理するシステムです。指定されたバージョンフォーマットとリリースサイクルに従って、すべてのコンポーネントのバージョン情報を追跡・管理します。

## バージョンフォーマット

### Deep-School CLIENT/SERVER/PICKRAMU
```
v.CYCLE-NUMBER.RELEASE-NUMBER.REVISION(.STATUS=OPTION)
                                                                                     [NIGHTLY,BETA,PRE]
```

**例:**
- 1サイクル目の3番目のリリース、リビジョン2 → `v1.3.2`
- 3サイクル目の12番目のリリース、リビジョン6のナイトリー → `v3.12.6.nightly`

### TOASTER-MACHINE
```
v.CYCLE-NUMBER.RELEASE-NUMBER.REVISION
```

**例:**
- 1サイクル目の3番目のリリース、リビジョン2 → `v1.3.2`

### DEEP-SCHOOL-FAMILY-SOFTWARE
```
YEAR(FIRST-CODE-RELEASED-YEAR,EXAMPLE 2025 TO 25)C[BUILD-NUMBER][RELEASE-NUMBER] (.STATUS=OPTION)
                                                                                     [NIGHTLY,BETA,PRE]
```

**例:**
- 2025年の12ビルド、5リリース → `25C1205`

## リリースサイクル

### DEEP-SCHOOL CLIENT RELEASE CYCLE

Deep-Schoolは、基本的に次のようにリリースする。

- **基本的に1サイクル1年**で行う。(SERVERは同じ、PICKRAMUは3年周期)
- **サイクル更新日**: 10/13, 10/03, 4/15, 9/1のいずれか
- **リリース**: 不定期で行い、新機能が安定したらリリースする
- **リリース日**: 1, 5, 10, 25, 30のいずれかの日
- **リビジョン**: 主にセキュリティパッチを含むバグ修正やDEEP-SCHOOL-FAMILY-SOFTWAREのコード更新
- **リビジョン公開**: 修正次第NIGHTLYで公開し、1日後にメインサイクルに埋め込む
- **BETA/PRE**: サイクル更新/リリース前、昨日が発表されたらまずその機能をBETAとして公開。ユーザーフィードバックを経て、最終テスト版PREを公開する

### TOASTER-MACHINE CLIENT RELEASE CYCLE

TOASTER-MACHINEは、基本的に次のようにリリースする。

- **基本的に1サイクル1/2年**で行う
- **サイクル更新日**: 10/13, 10/03, 4/15, 9/1, 8/1, 12/26のいずれか
- **リリース**: 不定期で行い、新機能が安定したらリリースする
- **リリース日**: 1, 5, 10, 25, 30のいずれかの日
- **リビジョン**: 主にセキュリティパッチを含むバグ修正やDEEP-SCHOOL-FAMILY-SOFTWAREのコード更新
- **リビジョン公開**: 修正次第公開し、1日後にメインサイクルに埋め込む

### DEEP-SCHOOL-FAMILY-SOFTWARE UPDATE CYCLE

DEEP-SCHOOL-FAMILY-SOFTWAREのビルド番号更新は、DEEP-SCHOOLとTOASTER-MACHINEのサイクルが同時に更新される日に行われる。

- **リリース**: 新機能がいずれかのプラットフォームに実装され次第行われる
- **更新範囲**: この時、すべてのプラットフォームでコード更新が行われる
- **更新タイプ**: ほとんどの場合、リビジョンアップデートとして行われる

## 使用方法

### 1. コマンドラインインターフェース

#### 基本コマンド

```bash
# 全バージョン情報を表示
node version-cli.js all
npm run version:all

# 特定コンポーネントのバージョン情報を表示
node version-cli.js get <component>
npm run version:<component>

# 利用可能なコンポーネント一覧
node version-cli.js list
npm run version:list

# アップデートチェック
node version-cli.js check
npm run version:check

# バージョン比較
node version-cli.js compare <version1> <version2>

# ヘルプ表示
node version-cli.js help
npm run version:help
```

#### 利用可能なコンポーネント

- `family` - Deep-School Family Software
- `client` - Deep-School Client
- `server` - Deep-School Server
- `pickramu` - Pickramu
- `toaster` - Toaster-Machine

#### 使用例

```bash
# 全バージョン情報表示
node version-cli.js all

# Deep-School Clientのバージョン確認
node version-cli.js get client

# バージョン比較
node version-cli.js compare 1.0.1 1.0.2

# アップデートチェック
node version-cli.js check
```

### 2. Deep-Shell統合 (ブラウザ内)

#### 基本コマンド

```javascript
// 全バージョン情報を表示
ds.version.all()

// 特定コンポーネントのバージョン情報を表示
ds.version.get('client')
ds.version.get('server')
ds.version.get('pickramu')
ds.version.get('toaster')
ds.version.get('family')

// 利用可能なコンポーネント一覧
ds.version.list()

// アップデートチェック
ds.version.check()

// バージョン比較
ds.version.compare('1.0.1', '1.0.2')

// ヘルプ表示
ds.help.version()
```

#### 使用例

```javascript
// 全バージョン情報を取得して表示
const allVersions = await ds.version.all();
console.log(allVersions);

// Deep-School Clientのバージョンを確認
const clientVersion = await ds.version.get('client');
console.log(clientVersion);

// バージョン比較
const comparison = ds.version.compare('1.0.1', '1.0.2');
console.log(comparison); // { result: -1, comparison: 'older' }
```

### 3. 設定ファイル

バージョン情報は `version.config.json` ファイルで管理されます。

```json
{
  "deepSchoolFamily": {
    "version": "25C0101",
    "status": "stable",
    "lastUpdated": "2025-01-01",
    "description": "Deep-School Family Software - Initial release"
  },
  "deepSchoolClient": {
    "version": "1.0.1",
    "status": "stable",
    "cycle": 1,
    "release": 0,
    "revision": 1,
    "lastUpdated": "2025-01-01",
    "description": "Deep-School Client - Initial stable release"
  },
  "deepSchoolServer": {
    "version": "1.0.1",
    "status": "stable",
    "cycle": 1,
    "release": 0,
    "revision": 1,
    "lastUpdated": "2025-01-01",
    "description": "Deep-School Server - Initial stable release"
  },
  "pickramu": {
    "version": "1.0.1",
    "status": "stable",
    "cycle": 1,
    "release": 0,
    "revision": 1,
    "lastUpdated": "2025-01-01",
    "description": "Pickramu - Initial stable release"
  },
  "toasterMachine": {
    "version": "1.0.1",
    "cycle": 1,
    "release": 0,
    "revision": 1,
    "lastUpdated": "2025-01-01",
    "description": "Toaster-Machine - Initial stable release"
  },
  "releaseSchedule": {
    "deepSchoolCycles": ["10-13", "10-03", "04-15", "09-01"],
    "toasterCycles": ["10-13", "10-03", "04-15", "09-01", "08-01", "12-26"],
    "releaseDays": [1, 5, 10, 25, 30],
    "nextCycleUpdate": "2025-04-15"
  }
}
```

## 出力例

### 全バージョン情報表示

```
=== Deep-School Family Software Versions ===

🌐 Deep-School Family: 25C0101 (stable)
   Last Updated: 2025-01-01
   Description: Deep-School Family Software - Initial release

💻 Deep-School Client: v1.0.1 (stable)
   Cycle: 1, Release: 0, Revision: 1
   Last Updated: 2025-01-01
   Description: Deep-School Client - Initial stable release

🖥️  Deep-School Server: v1.0.1 (stable)
   Cycle: 1, Release: 0, Revision: 1
   Last Updated: 2025-01-01
   Description: Deep-School Server - Initial stable release

📚 Pickramu: v1.0.1 (stable)
   Cycle: 1, Release: 0, Revision: 1
   Last Updated: 2025-01-01
   Description: Pickramu - Initial stable release

🍞 Toaster-Machine: v1.0.1
   Cycle: 1, Release: 0, Revision: 1
   Last Updated: 2025-01-01
   Description: Toaster-Machine - Initial stable release

=== Release Schedule ===
Next Cycle Update: 2025-04-15
```

### 特定コンポーネント表示

```
=== CLIENT Version ===

Version: 1.0.1
Status: stable
Cycle: 1
Release: 0
Revision: 1
Last Updated: 2025-01-01
Description: Deep-School Client - Initial stable release
```

### バージョン比較

```
Version comparison: 1.0.1 is older than 1.0.2
```

## トラブルシューティング

### よくある問題

1. **バージョン設定ファイルが見つからない**
   ```
   Error: version.config.json not found
   ```
   - 解決策: プロジェクトルートに `version.config.json` ファイルが存在することを確認

2. **コンポーネントが見つからない**
   ```
   Error: Unknown component: invalid-component
   ```
   - 解決策: 利用可能なコンポーネント名を確認 (`ds.version.list()` または `node version-cli.js list`)

3. **Deep-Shellでバージョン情報が取得できない**
   - 解決策: ブラウザのコンソールで `ds.version.all()` を実行してエラーメッセージを確認

### ログ確認

Deep-Shellを使用している場合、バージョン関連のログは以下のディスプレイで確認できます：

```javascript
// システムログを確認
ds.log.sw('sysout');

// アプリケーションログを確認
ds.log.sw('appout');
```

## 開発者向け情報

### バージョン更新手順

1. `version.config.json` ファイルを編集
2. 該当コンポーネントのバージョン情報を更新
3. `lastUpdated` フィールドを現在の日付に更新
4. 必要に応じて `description` フィールドを更新

### 新しいコンポーネントの追加

1. `version.config.json` に新しいコンポーネントの設定を追加
2. `Client/js/core/version.mjs` の `componentMap` に新しいコンポーネントを追加
3. `version-cli.js` の `components` 配列に新しいコンポーネントを追加

### API リファレンス

#### VersionManager クラス

```javascript
// バージョン設定を読み込み
await versionManager.loadVersionConfig()

// バージョン情報を取得
versionManager.getVersion(component)

// バージョン情報をフォーマット
versionManager.formatVersion(component)

// バージョン比較
versionManager.compareVersions(version1, version2)

// アップデートチェック
versionManager.checkForUpdates()
```

## ライセンス

このバージョン管理システムは Deep-School プロジェクトの一部として、MPL-2.0 ライセンスの下で提供されています。

---

**注意**: このドキュメントは Deep-School Version Management System v1.0.1 に基づいています。最新の情報については、実際のシステムを参照してください。 