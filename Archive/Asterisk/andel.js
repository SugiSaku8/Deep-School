//初期設定
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const andel = {
	info: function() {
		console.log("info:\nAsterisk v1.0\nbyCarnation")
	},
	ver: function() {
		console.log("Asterisk Version:v1.0\nandel.sys.js Version:v1.0")
	},
	model: function(x, xs) {
		if (x = "model") {
			console.log(`model:${xs}`)
		}
	}
};

function AddAndel(name, andel, genre, user,reandel) {

	if(reandel != undefined){
	// フォルダのパス
	const folderPath = `./n/n_p/data/${genre}/${reandel}`;

	// フォルダが存在しない場合は作成
	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, { recursive: true });
	}

	// 現在の時間を取得
	const currentTime = new Date().getTime();

	// ファイル名の形式を指定
	const fileName = `${user}_${name}.json`;

	// JSONファイルのパス
	const filePath = path.join(folderPath, fileName);

	// オブジェクトを作成
	const andeldata = {
		name: name,
		andel: andel,
		user: user,
		genre: genre,
		time: currentTime
	};

	// JSONファイルに変数の内容を書き込む
	fs.writeFileSync(filePath, JSON.stringify(andeldata, null, 2));
	}else{
		// フォルダのパス
		const folderPath = `./n/n_p/data/${genre}`;

		// フォルダが存在しない場合は作成
		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath, { recursive: true });
		}

		// 現在の時間を取得
		const currentTime = new Date().getTime();

		// ファイル名の形式を指定
		const fileName = `${user}_${name}.json`;

		// JSONファイルのパス
		const filePath = path.join(folderPath, fileName);

		// オブジェクトを作成
		const andeldata = {
			name: name,
			andel: andel,
			user: user,
			genre: genre,
			time: currentTime
		};

		// JSONファイルに変数の内容を書き込む
		fs.writeFileSync(filePath, JSON.stringify(andeldata, null, 2));
	}
}

//Andelの追加処理
router.post('/send', (req, res) => {
	if (andel != undefined) {
		let title = (req.body.title);
		let data = req.body.body;
		let genre = req.body.genre;
		let user = req.body.user;
		if(user===undefined||title===undefined||data===undefined||genre===undefined){
				res.json({ status: ':(\n失敗しました。\nデータが不正です。' });
		}else{
		AddAndel(title, data, genre, user);
		}
	}
	res.json({ status: '終了しました。' });
});
module.exports = router;