#!/bin/bash

# プログレスバー関数
progress_bar() {
    local count=$1
    local total=$2
    local percentage=$((count * 100 / total))
    printf "\r[%-${total}s] %d%% (%d/%d)" "$(printf "█%.0s" $(seq 1 $percentage))" "$percentage" "$count" "$total"
}

# macOSかどうかの確認
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "このスクリプトはmacOSでのみ動作します"
    exit 1
fi

echo "セットアップを開始します..."
total_steps=8
current_step=0

# Xcodeコマンドラインツールのインストール
((current_step++))
echo -ne "\rステップ $current_step/$total_steps: Xcodeコマンドラインツールのインストール中..."
xcode-select --install > /dev/null 2>&1
progress_bar 100 100

# Homebrewのインストールチェックと実行
((current_step++))
echo -ne "\rステップ $current_step/$total_steps: Homebrewのインストール中..."
if ! command -v brew &> /dev/null; then
    echo -ne "\r"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" > /dev/null 2>&1
fi
progress_bar 100 100

# MongoDBのインストール
((current_step++))
echo -ne "\rステップ $current_step/$total_steps: MongoDBのインストール中..."
brew tap mongodb/brew > /dev/null 2>&1
brew update > /dev/null 2>&1
brew install mongodb-community@8.0 > /dev/null 2>&1
brew services start mongodb-community@8.0 > /dev/null 2>&1
progress_bar 100 100

# プロジェクトのクローンとセットアップ
((current_step++))
echo -ne "\rステップ $current_step/$total_steps: プロジェクトのクローン中..."
git clone https://github.com/SugiSaku8/Deep-School.git > /dev/null 2>&1
cd Deep-School || { echo "ディレクトリへの移動に失敗しました"; exit 1; }
rm -rf !(server) > /dev/null 2>&1
progress_bar 100 100

# サーバーフォルダの移動
((current_step++))
echo -ne "\rステップ $current_step/$total_steps: サーバーフォルダの移動中..."
mv server "/Users/$USER/" > /dev/null 2>&1
cd "/Users/$USER/server" || { echo "ディレクトリへの移動に失敗しました"; exit 1; }
progress_bar 100 100

# Node.jsとnpmのインストールチェック
((current_step++))
echo -ne "\rステップ $current_step/$total_steps: Node.jsとnpmのインストール中..."
if ! command -v npm &> /dev/null; then
    brew install node npm > /dev/null 2>&1
fi
progress_bar 100 100

# npmパッケージのインストール
((current_step++))
echo -ne "\rステップ $current_step/$total_steps: パッケージのインストール中..."
rm package-lock.json > /dev/null 2>&1
npm i > /dev/null 2>&1
progress_bar 100 100

# ビルドスクリプトの実行
((current_step++))
echo -ne "\rステップ $current_step/$total_steps: ビルドの実行中..."
./build.server.sh > /dev/null 2>&1
progress_bar 100 100

echo -e "\n\nセットアップが完了しました！"