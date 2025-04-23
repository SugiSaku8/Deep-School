import fs from 'fs';
import path from 'path';

export default class fs_0ds {
    // フォルダーを作成する
    createFolder(folderPath) {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
            console.log(`フォルダーを作成しました: ${folderPath}`);
        } else {
            console.log(`フォルダーはすでに存在します: ${folderPath}`);
        }
    }

    // ファイルをパスを指定して作成する
    createFile(filePath, content = '') {
        fs.writeFileSync(filePath, content);
        console.log(`ファイルを作成しました: ${filePath}`);
    }

    // ファイルをパスを指定して取得する
    getFile(filePath) {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf-8');
        } else {
            console.log(`ファイルが見つかりません: ${filePath}`);
            return null;
        }
    }

    // ファイル一覧をパスを指定して取得できる
    getFileList(directoryPath) {
        if (fs.existsSync(directoryPath)) {
            return fs.readdirSync(directoryPath);
        } else {
            console.log(`ディレクトリが見つかりません: ${directoryPath}`);
            return [];
        }
    }

    // 二次元配列を作成する
    create2DArray(rows, cols) {
        return Array.from({ length: rows }, () => Array(cols).fill(null));
    }

    // JSONファイルを処理する
    processJsonFile(filePath) {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        } else {
            console.log(`JSONファイルが見つかりません: ${filePath}`);
            return null;
        }
    }

    // JSONファイルの一部分を書き換える
    updateJsonFile(filePath, updates) {
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            Object.assign(data, updates);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`JSONファイルを更新しました: ${filePath}`);
        } else {
            console.log(`JSONファイルが見つかりません: ${filePath}`);
        }
    }
}

//例
/*
const api = new FileSystemAPI();
api.createFolder('./testFolder');
api.createFile('./testFolder/testFile.json', JSON.stringify({ name: "John", age: 30 }));
console.log(api.processJsonFile('./testFolder/testFile.json'));
api.updateJsonFile('./testFolder/testFile.json', { age: 31 });
console.log(api.processJsonFile('./testFolder/testFile.json'));
*/