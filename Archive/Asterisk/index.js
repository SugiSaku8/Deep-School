//Library　Fast Setting
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./andel');

//ServerSide
function start() {
	//Andel追加処理
	app.use(bodyParser.json());
	app.use('/', routes);

	//Andel取得処理
	app.use(express.json()); // JSONデータをパースするためのミドルウェア
	app.post('/get', (req, res) => {
		let filePath = req.body.name; // ファイル名を取得
		fs.readFile(`./n/n_p/data/${filePath}`, 'utf8', (err, data) => { // ファイルを直接読み取る
			if (err) {
				res.status(500).json({ status: 'エラーが発生しました。' });
				return;
			}
			res.json({ data: data });

		});
	});

	//最新のものを取得する処理
	function getFiles(dirPath) {
		let files = fs.readdirSync(dirPath);
		let filePaths = [];
		files.forEach((file) => {
			let filePath = path.join(dirPath, file);
			let stats = fs.statSync(filePath);
			if (stats.isDirectory()) {
				filePaths = filePaths.concat(getFiles(filePath));
			} else if (path.extname(filePath) === '.json') {
				filePaths.push(filePath);
			}
		});
		return filePaths;
	}

	let filePaths = getFiles('./n/n_p/data');
	let jsonData = filePaths.map((file) => {
		let data = JSON.parse(fs.readFileSync(file, 'utf8'));
		let stats = fs.statSync(file);
		return { data, updatedAt: stats.mtime };
	});

	jsonData.sort((a, b) => b.updatedAt - a.updatedAt);
	let latestJsonData = jsonData.slice(0, 10).map(json => json.data);

	app.get('/top', (req, res) => {
		res.json(latestJsonData);
	});

	//勉強相談室の処理
	function getFiles(dirPath) {
		let files = fs.readdirSync(dirPath);
		let filePaths = [];
		files.forEach((file) => {
			let filePath = path.join(dirPath, file);
			let stats = fs.statSync(filePath);
			if (stats.isDirectory()) {
				filePaths = filePaths.concat(getFiles(filePath));
			} else if (path.extname(filePath) === '.json') {
				filePaths.push(filePath);
			}
		});
		return filePaths;
	}

	let files = getFiles('./n/n_p/data/勉強相談室');
	let jsons = files.map((file) => {
		let data = JSON.parse(fs.readFileSync(file, 'utf8'));
		let stats = fs.statSync(file);
		return { data, updatedAt: stats.mtime };
	});

	jsons.sort((a, b) => b.updatedAt - a.updatedAt);
	let latestJsons = jsons.slice(0, 10).map(json => json.data);

	app.get('/scr', (req, res) => {
		res.json(latestJsons);
	});
	//勉強相談室のコード終了

	//publicを/にする
	app.use(express.static('public'));

	//Webサーバーの領域
	//404,500の処理
	app.use((req, res, next) => {
		res.status(404).sendFile(__dirname + '/public/erorr/404.html');
	});

	app.use((err, req, res, next) => {
	 res.status(500).sendFile(__dirname + '/public/erorr/500.html');
	});

	//webサイトのところ
	app.get('/', (req, res) => {
		res.sendFile(__dirname + '/public/index.html');
	});

	app.get('/en', (req, res) => {
		res.sendFile(__dirname + '/public/en.html');
	});

	app.get('/help/cookie/ja', (req, res) => {
		res.sendFile(__dirname + '/public/data/help/Cookieja.html');
	});

	app.get('/help/cookie', (req, res) => {
		res.sendFile(__dirname + '/public/data/help/Cookie.html');
	});

	//サーバを立てるところ
	const PORT = 2539;
	app.listen(PORT, () => console.log(`Server is up on port ${PORT}!`));
}

//All Start
console.log("All stating....")
start();