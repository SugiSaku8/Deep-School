/**
 * @type {Array<string>} scriptsToEval - 実行するスクリプトを格納する配列
 */
let scriptsToEval = []; // 実行するスクリプトを格納する配列

/**
 * evalrun - 与えられたコードをevalで実行し、エラーがあればconsole.errorに出力する。
 *
 * @param {string} code - 実行するJavaScriptコード
 * @returns {void}
 */
function evalrun(code) {
  try {
    eval(code);
  } catch (error) {
    console.error("Error executing script:", error);
  }
}

/**
 * loadMarkdown - Markdownファイルを読み込み、HTMLに変換して指定された要素に表示する。
 *
 * @param {string} file - Markdownファイルのパス
 * @returns {void}
 */
function loadMarkdown(file) {
  fetch(file)
    .then((response) => response.text())
    .then((markdown) => {
      const html = parseMarkdown(markdown);
      document.getElementById("content").innerHTML = html;
      document.getElementById("content").style.display = "block"; // コンテンツを表示

      // すべてのスクリプトを実行
      scriptsToEval.forEach((script) => {
        evalrun(script);
      });
      scriptsToEval = []; // 配列をクリア
    })
    .catch((error) => console.error("Error loading markdown:", error));
}

/**
 * parseMarkdown - Markdownテキストを解析し、カスタムタグを処理してHTMLに変換する。
 *
 * @param {string} markdown - Markdown形式のテキスト
 * @returns {string} - 変換されたHTML
 */
function parseMarkdown(markdown) {
  markdown = markdown.replace(
    /@config \[open\]([\s\S]*?)@config \[close\]/g,
    ""
  );

  // tag, btn, scriptタグを処理
  markdown = markdown.replace(
    /@tag ([\w-]+) \[(open|close)\s?(\^hide\^)?\]([\s\S]*?)@tag (?:[\w-]+)? \[close\]/g,
    (match, tagName, openClose, hide, tagContent) => {
      if (tagName === "question" && openClose === "open") {
        const questionContent = tagContent.trim();
        const parsedQuestionContent = marked.parse(questionContent);
        return `<div id="${tagName}" style="">${parsedQuestionContent}</div>`;
      }
      let style = "";
      if (hide === "^hide^") {
        style = "display: none !important;";
      } else {
        style = ""; // スタイルが適用されない場合でも空の文字列を設定
      }

      // @btn を抽出
      const btnRegex = /@btn id=(\w+) ([\s\S]*)/g;
      let btnMatch;
      let processedTagContent = tagContent;
      while ((btnMatch = btnRegex.exec(tagContent)) !== null) {
        const btnId = btnMatch[1];
        const btnContent = btnMatch[2].trim();
        const btnHtml = `<button id="${btnId}">${btnContent}</button>`;

        // tagContentから@btnを削除
        processedTagContent = processedTagContent.replace(btnMatch[0], "");

        // @btnを挿入する場所を特定 (ここではtagContentの最後に挿入)
        processedTagContent += btnHtml;
      }

      const parsedTagContent = marked.parse(processedTagContent);
      return `<div id="${tagName}" style="${style}">${parsedTagContent}</div>`;
    }
  );
  markdown = markdown.replace(
    /@btn id=(\w+) ([\s\S]*)/g,
    (match, btnId, btnContent) => {
      const content = btnContent.replace(/^id=/, "").trim();
      return `<button id="${btnId}">${content}</button>`;
      return "";
    }
  );
  markdown = markdown.replace(
    /@script on=(\w+) \[open\]([\s\S]*?)@script \[close\]/g,
    (match, onId, scriptContent) => {
      // HTMLエンティティをデコード
      const decodedScript = scriptContent
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");

      // スクリプトを配列に格納
      scriptsToEval.push(`
              (function() {
                const btn = document.getElementById("${onId}");
                if (btn) {
                  btn.addEventListener('click', function() {
                    evalrun(\`${decodedScript}\`);
                  });
                } else {
                  console.error("Button with id '${onId}' not found");
                }
              })();
            `);
      return "";
    }
  );

  // marked.jsを使用してMarkdownをHTMLに変換
  markdown = marked.parse(markdown);

  return markdown;
}

/**
 * dom - DOM操作を簡単にするためのオブジェクト
 * @namespace dom
 */
const dom = {
  /**
   * Tag - 指定されたIDを持つ要素を取得し、その要素のスタイルを操作するための関数を提供する。
   * @param {string} tagName - 取得する要素のID
   * @returns {{style: {display: Function}}} - スタイル操作関数を持つオブジェクト
   */
  Tag: function (tagName) {
    const element = document.getElementById(tagName);
    return {
      style: {
        /**
         * display - 要素のdisplayスタイルを変更する。
         * @param {string} displayValue - 設定するdisplayの値
         * @param {string} important - 'auto'の場合、!importantを設定する
         * @returns {void}
         */
        display: function (displayValue, important) {
          element.style.display = displayValue;
          if (important === "auto") {
            element.style.setProperty("display", displayValue, "important");
          }
        },
      },
    };
  },
};
//How to use
//window.onload = function () {
//  loadMarkdown(filepath); // Markdownファイルのパス
//};
