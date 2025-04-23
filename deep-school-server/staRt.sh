#!/bin/bash

# カラー表示用の設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deep School Server Startup Script${NC}"
echo "================================"

# MongoDB の状態確認
check_mongodb() {
    if brew services list | grep mongodb-community | grep started > /dev/null; then
        return 0
    else
        return 1
    fi
}

# MongoDB の起動
start_mongodb() {
    echo -e "${YELLOW}MongoDBを起動しています...${NC}"
    if ! check_mongodb; then
        brew services start mongodb-community@7.0
        sleep 2 # MongoDB の起動を待つ
        if check_mongodb; then
            echo -e "${GREEN}MongoDB が正常に起動しました${NC}"
        else
            echo -e "${RED}MongoDB の起動に失敗しました${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}MongoDB は既に起動しています${NC}"
    fi
}

# NestJS サーバーの起動
start_nestjs() {
    echo -e "${YELLOW}NestJS サーバーを起動しています...${NC}"
    
    # package.json が存在するディレクトリに移動
    cd /Users/sugisaku/Developer/Deep-School/deep-school-server

    # node_modules の存在確認
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}依存関係をインストールしています...${NC}"
        npm install
    fi

    # NestJS サーバーの起動
    echo -e "${GREEN}NestJS サーバーを起動します${NC}"
    npm run start:dev
}

# メイン処理
main() {
    # MongoDB の起動
    start_mongodb

    # NestJS サーバーの起動
    start_nestjs
}

# スクリプトの実行
main