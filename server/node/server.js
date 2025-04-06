import express from "express";
import cors from "cors"; // CORSをインポート
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import fs_0ds from "./api/fs_0ds.js";
import nimi from "./api/nimi_03d.js";
import poid from "./api/poid_02d.js";
import tyypin from "./api/tyypin.js";

const app = express();
const _0ds = new fs_0ds();
const auto = {
  size: 16,
  view: 128,
};
app.use(cors());
app.use(bodyParser.json());
app.get("/post", (req, res) => {
  const _new_post_ = new nimi(auto.size);
  _new_post_.add(1, req.body.UserName);
  _new_post_.add(2, req.body.UserId);
  _new_post_.add(3, req.body.PostName);
  _new_post_.add(5, req.body.PostTime);
  _new_post_.add(6, req.body.PostData);
  _new_post_.add(7, req.body.LinkerData);
  _new_post_.add(4, new poid(_new_post_.add(2), _new_post_(6)));
  _new_post_.add(18, {
    PostId: _new_post_.Value(4),
    PostName: _new_post_.Value(3),
    PostTime: _new_post_.Value(5),
    UserName: _new_post_.Value(1),
    UserId: _new_post_.Value(2),
    PostData: _new_post_.Value(6),
    LikerData: _new_post_.Value(7),
  });
  _0ds.createFile("./data/" + "_" + _new_post_.Value(4), _new_post_.value(18));
});
app.listen(3776, () => {
  console.log(`Deep-Schoolerサーバーがポート3776で起動しました`);
});
