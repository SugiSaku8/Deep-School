#!/bin/bash
# 1節/ 以下の全ての *.txt を *.html に一括変換
# 使い方: bash compile_all.sh

TXT2HTML="$(dirname "$0")/txt2html.js"
TARGET_DIR="$(dirname "$0")/data/jla/math/式の計算/1節"

find "$TARGET_DIR" -type f -name '*.txt' | while read -r txtfile; do
  htmlfile="${txtfile%.txt}.html"
  echo "コンパイル: $txtfile → $htmlfile"
  node "$TXT2HTML" "$txtfile" "$htmlfile"
done

echo "全てのtxtファイルをhtmlに変換しました。" 