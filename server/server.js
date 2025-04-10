import express from "express";
import cors from "cors"; // CORSをインポート
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import fs_0ds from "./api/fs_0ds.js";
import nimi from "./api/nimi_03d.js";
import poid from "./api/poid_02d.js";
import tyypin from "./api/tyypin.js";
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();
const _0ds = new fs_0ds();
const auto = {
  size: 16,
  view: 128,
};
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.post("/post", (req, res) => {
  try {
    let _new_post_ = new nimi(auto.size);
    _new_post_.add(1, req.body.UserName);
    _new_post_.add(2, req.body.UserId);
    _new_post_.add(3, req.body.PostName);
    _new_post_.add(5, req.body.PostTime);
    _new_post_.add(6, req.body.PostData);
    _new_post_.add(7, req.body.Genre);
    _new_post_.add(8, req.body.LinkerData);
    _new_post_.add(
      4,
      poid(_new_post_.Value(2).value, _new_post_.Value(5).value)
    );
    _new_post_.add(18, {
      PostId: _new_post_.Value(4),
      PostName: _new_post_.Value(3),
      PostTime: _new_post_.Value(5),
      UserName: _new_post_.Value(1),
      UserId: _new_post_.Value(2),
      PostData: _new_post_.Value(6),
      LikerData: _new_post_.Value(7),
      LinkerData: _new_post_.Value(8), // LinkerData を追加
    });
    _0ds.createFile(
      "./data/" + "_" + _new_post_.Value(4).value,
      JSON.stringify(_new_post_.Value(18))
    );
  } catch (e) {
    res.status(606).json({ message: "Failed to post.", error: `${e}` });
  }
  res.status(200).json({ message: "The post was successful!" });
});

class _index {
  constructor() {
    console.log("_______________________");
    console.log("__Deep-Schooler_Server_");
    console.log("___Indexing_Service____");
    console.log("_________init..________");
    this.index = new nimi(4096); // 名前空間の初期化
    console.log("NIMIspace initialization succeeded.");
    this.count_index = 0;
    console.log("Indexing_Service has started indexing.");
    this.loadFiles();
    this.watchFiles();
    this.setupServer();
    this.NameRam = [];
    process.on("SIGINT", () => {
      console.log("Ctrl+Cが検知されました。");
      this.saveIndexData();
    });
  }

  loadFiles() {
    fs.readdir("./data", (err, files) => {
      if (err) {
        console.error("データディレクトリの読み込みに失敗しました:", err);
        return;
      } else if (files === null) {
        console.log("Data File is Empty");
        return;
      }
      files.forEach((file) => {
        const filePath = path.join("./data", file);
        fs.readFile(filePath, "utf8", (err, datas) => {
          if (err) {
            console.error(`${filePath} の読み込みに失敗しました:`, err);
            return;
          }
          console.log(`ファイル ${file} を読み込みました。`);
          console.log(`ファイル${file}の内容は、\n${datas}\nです`);
          this.index.add(this.count_index, file);
          this.count_index += 1;
          this.NameRam.push(file);
        });
      });
    });
    console.log("Initialization has been completed.");
  }

  Reload() {
    fs.readdir("./data", (err, files) => {
      if (err) {
        console.error("データディレクトリの読み込みに失敗しました:", err);
        return;
      } else if (files === null) {
        console.log("Data File is Empty");
        return;
      }
      files.forEach((file) => {
        const filePath = path.join("./data", file);
        fs.readFile(filePath, "utf8", (err, datas) => {
          if (err) {
            console.error(`${filePath} の読み込みに失敗しました:`, err);
            return;
          }
          this.count_index += 1;
          this.NameRam.push(file);
        });
      });
    });
  }
  watchFiles() {
    fs.watch("./data", { persistent: true }, (eventType, filename) => {
      if (filename) {
        const filePath = path.join("./data", filename);
        if (eventType === "change") {
          fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
              console.error(`${filePath} の読み込みに失敗しました:`, err);
              return;
            }
            console.log(`ファイル ${filename} が変更されました。`);
            this.Reload();
            // 変更されたファイルのインデックスを更新
            const indexToUpdate = this.index.data.findIndex(
              (_, index) => index === this.count_index
            );
            if (indexToUpdate !== -1) {
              this.index.add(indexToUpdate, filename);
            }
          });
        } else if (eventType === "rename") {
          // ファイルが追加または削除された場合の処理
          fs.stat(filePath, (err, stats) => {
            if (err) {
              console.log(`ファイル ${filename} が削除されました。`);
              // 削除された場合の処理
              const indexToRemove = this.index.data.findIndex(
                (_, index) => index === this.count_index
              );
              if (indexToRemove !== -1) {
                this.index.data[indexToRemove] = null; // インデックスをnullに設定
              }
            } else {
              console.log(`ファイル ${filename} が追加されました。`);
              // 追加された場合の処理
              this.index.add(this.count_index, filename);
              this.count_index += 1;
            }
          });
        }
      }
    });
  }
  async GetFiles(file) {
    fs.readFile("./data/" + file, "utf8", (err, datas) => {
      if (err) {
        console.error(`${file} の読み込みに失敗しました:`, err);
        return;
      }
      console.log(datas);
      return datas;
    });
  }

  async getFileNames() {
    this.NameRam = [];
    let directoryPath = "./data";
    return new Promise((resolve, reject) => {
      fs.readdir(directoryPath, (err, files) => {
        if (err) {
          console.error("ディレクトリの読み込みに失敗しました:", err);
          reject(err);
          return;
        }

        const fileNames = files.filter((file) => {
          const filePath = path.join(directoryPath, file);
          this.NameRam.push(fs.statSync(filePath).isFile()); // ファイルのみを抽出
        });
        resolve(fileNames);
      });
    });
  }
  async setupServer() {
    app.get("/get", (req, res) => {
      const query = req.query.text;
      if (!query || query === null) {
        res.json(this.NameRam);
      } else {
        fs.readFile("./data/" + query, "utf8", (err, datas) => {
          if (err) {
            console.error(`${query} の読み込みに失敗しました:`, err);
            return;
          }
          res.json(JSON.parse(datas));
        });
      }
    });
  }

  saveIndexData() {
    const timestamp = new Date().toISOString().replace(/:/g, "-"); // タイムスタンプを整形
    const archivePath = path.join(__dirname, "archive", `${timestamp}.archive`);
    fs.writeFile(archivePath, JSON.stringify(this.index.data), (err) => {
      if (err) {
        console.error("インデックスデータの保存に失敗しました:", err);
      } else {
        console.log(`インデックスデータが ${archivePath} に保存されました。`);
        process.exit();
      }
    });
  }
}
app.listen(3776, () => {
  console.log(`Deep-Schoolerサーバーがポート3776で起動しました`);
  const indexing = new _index();
});
