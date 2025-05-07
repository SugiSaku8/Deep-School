#/bin/sh
ncu -u
npm update
npm i
npm prune --production
pkg -t node18-macos-x64 . --no-bytecode --public-packages "*" --public --compress Brotli
upx ./build/deep-school-server-macos-arm64