#!/usr/bin/env bash

# プログレスバー関数
progress_bar() {
    local count=$1
    local total=$2
    local percentage=$((count * 100 / total))
    printf "\r[%-${total}s] %d%% (%d/%d)" "$(printf "█%.0s" $(seq 1 $percentage))" "$percentage" "$count" "$total"
}

# Linuxディストリビューションの確認
if [[ ! "$OSTYPE" =~ "linux"* ]]; then
    echo "このスクリプトはLinuxでのみ動作します"
    exit 1
fi

# パッケージマネージャーの検出
if command -v apt-get &> /dev/null; then
    PKG_MANAGER="apt-get"
    PKG_UPDATE="apt update"
    PKG_INSTALL="apt-get install -y"
elif command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
    PKG_UPDATE="dnf update -y"
    PKG_INSTALL="dnf install -y"
else
    echo "サポートされていないパッケージマネージャーです"
    exit 1
fi

echo "セットアップを開始します..."
total_steps=8
current_step=0

# 必要なパッケージのインストール
((current_step++))
echo -ne "\rステップ $current_step/$total_steps: 必要なパッケージのインストール中..."
eval "$PKG_UPDATE" > /dev/null 2>&1
eval "$PKG_INSTALL git mongodb-org gcc make" > /dev/null 2>&1
progress_bar 100 100

# MongoDBの設定
((current_step++))
echo -ne "\rステップ $current_step/$total_steps: MongoDBの設定中..."
systemctl enable mongod > /dev/null 2>&1
systemctl start mongod > /dev/null 2>&1
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
mv server "/home/$USER/" > /dev/null 2>&1
cd "/home/$USER/server" || { echo "ディレクトリへの移動に失敗しました"; exit 1; }
progress_bar 100 100

# Node.jsのインストール
((current_step++))
echo -ne "\rステップ $current_step/$total_steps: Node.jsのインストール中..."
eval "$PKG_INSTALL nodejs npm" > /dev/null 2>&1
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