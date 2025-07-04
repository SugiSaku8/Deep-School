// Pickramu/API/compile.n.js
/**
 * カスタムマークアップテキストをHTMLに変換する
 * @param {string} inputText - 変換するカスタムマークアップテキスト
 * @returns {string|null} 変換されたHTML、エラーの場合はnull
 * @description
 * 以下のカスタムタグをサポート:
 * - @tag: div要素の作成
 * - @input: 入力フォームの作成
 * - @btn: ボタンの作成
 * - @script: JavaScriptの追加
 * - @futter: フッター要素の作成
 */
function convertToHtml(inputText) {
  let outputHtml = "";
  // Remove lines starting with //
  const lines = inputText
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"));
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Handle @tag [open] blocks
    let tagOpenMatch = line.match(
      /@tag\s+([\w,-]+)?(?:\s+class=([\w,-]+))?\s+\[open\]/
    );
    if (tagOpenMatch) {
      const tagIds = tagOpenMatch[1]
        ? tagOpenMatch[1]
            .split(",")
            .map((id) => id.trim())
            .join(" ")
        : "";
      const tagClasses = tagOpenMatch[2]
        ? tagOpenMatch[2]
            .split(",")
            .map((cls) => cls.trim())
            .join(" ")
        : "";
      outputHtml += `<div id="${tagIds}" class="${tagClasses}">\n`;
      i++;
      continue;
    }

    // Handle @tag [close] blocks
    let tagCloseMatch = line.match(
      /@tag\s+([\w,-]+)?(?:\s+class=([\w,-]+))?\s+\[close\]/
    );
    if (tagCloseMatch) {
      i++;
      outputHtml += `</div>\n`;
      continue;
    }

    // Handle @input blocks with button
    let inputMatch = line.match(
      /@input\s+(\w+)(?:\s+futter=(\w+))?\s+\[open\]/
    );
    if (inputMatch) {
      const inputId = inputMatch[1];
      const futterId = inputMatch[2];
      i++;
      let inputContent = "";
      let hasButton = false;
      let buttonId = "";

      // Collect input content until close tag
      while (i < lines.length && !lines[i].match(/@input.*\[close\]/)) {
        const currentLine = lines[i].trim();
        const btnMatch = currentLine.match(/@btn\s+on=\^(\w+)\^/);
        if (btnMatch) {
          hasButton = true;
          buttonId = btnMatch[1];
          inputContent += `<button id="${buttonId}" class="button-next">回答する</button>\n`;
        } else {
          // Replace /br with <br>
          inputContent += currentLine.replace(/\/br/g, "<br>") + "\n";
        }
        i++;
      }

      // Create input container with content and button
      outputHtml += `<div class="input-container">\n`;
      outputHtml += `<div id="${inputId}">\n`;
      outputHtml += `<input type="text" class="input-box" placeholder="答えを入力">\n`;
      outputHtml += inputContent;
      outputHtml += `</div>\n`;
      outputHtml += `</div>\n`;

      // Add script for button click handler
      if (hasButton && futterId) {
        outputHtml += `<script>\n`;
        outputHtml += `document.getElementById("${buttonId}").onclick = function() {\n`;
        outputHtml += `  document.getElementById("${inputId}").style.display = "none";\n`;
        outputHtml += `  document.getElementById("${futterId}").style.display = "block";\n`;
        outputHtml += `}\n`;
        outputHtml += `</script>\n`;
      }

      i++;
      continue;
    }

    // Handle @futter blocks
    let futterMatch = line.match(
      /@futter\s+(\w+)\s+futter=(\w+)\s+\[(open|close)\]/
    );
    if (futterMatch) {
      const futterId = futterMatch[1];
      if (futterMatch[3] === "open") {
        outputHtml += `<div id="${futterId}" style="display: none;">\n`;
      } else {
        outputHtml += `</div>\n`;
      }
      i++;
      continue;
    }

    // Handle regular @btn tags (without on=^set^)
    let btnMatch = line.match(
      /@btn\s+id=([\w,-]+)(?:\s+class=([\w,-]+))?\s+(.+)/
    );
    if (btnMatch) {
      const btnIds = btnMatch[1]
        .split(",")
        .map((id) => id.trim())
        .join(" ");
      const btnClasses = btnMatch[2]
        ? btnMatch[2]
            .split(",")
            .map((cls) => cls.trim())
            .join(" ")
        : "button-next";
      const btnContent = btnMatch[3];
      outputHtml += `<button id="${btnIds}" class="${btnClasses}">${btnContent}</button>\n`;
      i++;
      continue;
    }

    // Handle @script blocks
    let scriptMatch = line.match(/@script\s+on=(\w+)\s+\[open\]/);
    if (scriptMatch) {
      const scriptOn = scriptMatch[1];
      i++;
      let scriptContentLines = [];
      while (i < lines.length && !lines[i].match(/@script\s+\[close\]/)) {
        scriptContentLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        const scriptContent = scriptContentLines.join("\n");
        outputHtml += `<script>\n`;
        outputHtml += `document.getElementById("${scriptOn}").onclick = function() {\n`;
        outputHtml += scriptContent + "\n";
        outputHtml += `}\n`;
        outputHtml += `</script>\n`;
      } else {
        console.error("Error: Missing closing script tag");
        return null;
      }
      i++;
      continue;
    }

    // If no match, treat the line as plain text and replace /br with <br>
    outputHtml += line.replace(/\/br/g, "<br>") + "\n";
    i++;
  }

  return outputHtml;
}


// ファイルアップロード対応
document.getElementById('fileInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    const inputText = evt.target.result;
    const htmlOutput = convertToHtml(inputText);

    // CSSやスクリプトは既存のものを流用
    const styles = /* ...既存の styles 生成処理... */ `
body{
  font-family: "Noto Sans JP", sans-serif;
  color: black;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 横並びメニュー */
.menu-bar {
  display: flex;
  flex-direction: row;
  gap: 1.5em;
  justify-content: center;
  margin: 1.5em 0 2em 0;
}
.menu-item {
  padding: 0.7em 2em;
  background: #f5f5f5;
  border-radius: 1.5em;
  font-size: 1.2em;
  color: #333;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
}
.menu-item:hover {
  background: #33aaff;
  color: #fff;
  transform: translateY(-4px) scale(1.07);
  box-shadow: 0 4px 16px rgba(51,170,255,0.15);
}

/* それ以外のアニメーションはOFF */
.menu-item {
  animation: none !important;
}

/* ...既存のスタイル... */
#red {
  color: red;
}
#testB {
  display: none;
}
#content{
  font-size:1.6em;
}
#content .red {
  color: red;
}
#content .aliceblue {
  color: aliceblue;
}
#content .antiquewhite {
  color: antiquewhite;
}
#content .aqua {
  color: aqua;
}
#content .aquamarine {
  color: aquamarine;
}
#content .azure {
  color: azure;
}
#content .beige {
  color: beige;
}
#content .bisque {
  color: bisque;
}
#content .black {
  color: black;
}
#content .blanchedalmond {
  color: blanchedalmond;
}
#content .blue {
  color: blue;
}
#content .blueviolet {
  color: blueviolet;
}
#content .brown {
  color: brown;
}
#content .burlywood {
  color: burlywood;
}
#content .cadetblue {
  color: cadetblue;
}
#content .chartreuse {
  color: chartreuse;
}
#content .chocolate {
  color: chocolate;
}
#content .coral {
  color: coral;
}
#content .cornflowerblue {
  color: cornflowerblue;
}
#content .cornsilk {
  color: cornsilk;
}
#content .crimson {
  color: crimson;
}
#content .cyan {
  color: cyan;
}
#content .darkblue {
  color: darkblue;
}
#content .darkcyan {
  color: darkcyan;
}
#content .darkgoldenrod {
  color: darkgoldenrod;
}
#content .darkgray {
  color: darkgray;
}
#content .darkgreen {
  color: darkgreen;
}
#content .darkkhaki {
  color: darkkhaki;
}
#content .darkmagenta {
  color: darkmagenta;
}
#content .darkolivegreen {
  color: darkolivegreen;
}
#content .darkorange {
  color: darkorange;
}
#content .darkorchid {
  color: darkorchid;
}
#content .darkred {
  color: darkred;
}
#content .darksalmon {
  color: darksalmon;
}
#content .darkseagreen {
  color: darkseagreen;
}
#content .darkslateblue {
  color: darkslateblue;
}
#content .darkslategray {
  color: darkslategray;
}
#content .darkturquoise {
  color: darkturquoise;
}
#content .darkviolet {
  color: darkviolet;
}
#content .deeppink {
  color: deeppink;
}
#content .deepskyblue {
  color: deepskyblue;
}
#content .dimgray {
  color: dimgray;
}
#content .dodgerblue {
  color: dodgerblue;
}
#content .firebrick {
  color: firebrick;
}
#content .floralwhite {
  color: floralwhite;
}
#content .forestgreen {
  color: forestgreen;
}
#content .fuchsia {
  color: fuchsia;
}
#content .gainsboro {
  color: gainsboro;
}
#content .ghostwhite {
  color: ghostwhite;
}
#content .gold {
  color: gold;
}
#content .goldenrod {
  color: goldenrod;
}
#content .gray {
  color: gray;
}
#content .green {
  color: green;
}
#content .greenyellow {
  color: greenyellow;
}
#content .honeydew {
  color: honeydew;
}
#content .hotpink {
  color: hotpink;
}
#content .indianred {
  color: indianred;
}
#content .indigo {
  color: indigo;
}
#content .ivory {
  color: ivory;
}
#content .khaki {
  color: khaki;
}
#content .lavender {
  color: lavender;
}
#content .lavenderblush {
  color: lavenderblush;
}
#content .lawngreen {
  color: lawngreen;
}
#content .lemonchiffon {
  color: lemonchiffon;
}
#content .lightblue {
  color: lightblue;
}
#content .lightcoral {
  color: lightcoral;
}
#content .lightcyan {
  color: lightcyan;
}
#content .lightgoldenrodyellow {
  color: lightgoldenrodyellow;
}
#content .lightgray {
  color: lightgray;
}
#content .lightgreen {
  color: lightgreen;
}
#content .lightpink {
  color: lightpink;
}
#content .lightsalmon {
  color: lightsalmon;
}
#content .lightseagreen {
  color: lightseagreen;
}
#content .lightskyblue {
  color: lightskyblue;
}
#content .lightslategray {
  color: lightslategray;
}
#content .lightsteelblue {
  color: lightsteelblue;
}
#content .lightyellow {
  color: lightyellow;
}
#content .lime {
  color: lime;
}
#content .limegreen {
  color: limegreen;
}
#content .linen {
  color: linen;
}
#content .magenta {
  color: magenta;
}
#content .maroon {
  color: maroon;
}
#content .mediumaquamarine {
  color: mediumaquamarine;
}
#content .mediumblue {
  color: mediumblue;
}
#content .mediumorchid {
  color: mediumorchid;
}
#content .mediumpurple {
  color: mediumpurple;
}
#content .mediumseagreen {
  color: mediumseagreen;
}
#content .mediumslateblue {
  color: mediumslateblue;
}
#content .mediumspringgreen {
  color: mediumspringgreen;
}
#content .mediumturquoise {
  color: mediumturquoise;
}
#content .mediumvioletred {
  color: mediumvioletred;
}
#content .midnightblue {
  color: midnightblue;
}
#content .mintcream {
  color: mintcream;
}
#content .mistyrose {
  color: mistyrose;
}
#content .moccasin {
  color: moccasin;
}
#content .navajowhite {
  color: navajowhite;
}
#content .navy {
  color: navy;
}
#content .oldlace {
  color: oldlace;
}
#content .olive {
  color: olive;
}
#content .olivedrab {
  color: olivedrab;
}
#content .orange {
  color: orange;
}
#content .orangered {
  color: orangered;
}
#content .orchid {
  color: orchid;
}
#content .palegoldenrod {
  color: palegoldenrod;
}
#content .palegreen {
  color: palegreen;
}
#content .paleturquoise {
  color: paleturquoise;
}
#content .palevioletred {
  color: palevioletred;
}
#content .papayawhip {
  color: papayawhip;
}
#content .peachpuff {
  color: peachpuff;
}
#content .peru {
  color: peru;
}
#content .pink {
  color: pink;
}
#content .plum {
  color: plum;
}
#content .powderblue {
  color: powderblue;
}
#content .purple {
  color: purple;
}
#content .rebeccapurple {
  color: rebeccapurple;
}
#content .rosybrown {
  color: rosybrown;
}
#content .royalblue {
  color: royalblue;
}
#content .saddlebrown {
  color: saddlebrown;
}
#content .salmon {
  color: salmon;
}
#content .sandybrown {
  color: sandybrown;
}
#content .seagreen {
  color: seagreen;
}
#content .seashell {
  color: seashell;
}
#content .sienna {
  color: sienna;
}
#content .silver {
  color: silver;
}
#content .skyblue {
  color: skyblue;
}
#content .slateblue {
  color: slateblue;
}
#content .slategray {
  color: slategray;
}
#content .snow {
  color: snow;
}
#content .springgreen {
  color: springgreen;
}
#content .steelblue {
  color: steelblue;
}
#content .tan {
  color: tan;
}
#content .teal {
  color: teal;
}
#content .thistle {
  color: thistle;
}
#content .tomato {
  color: tomato;
}
#content .turquoise {
  color: turquoise;
}
#content .violet {
  color: violet;
}
#content .wheat {
  color: wheat;
}
#content .white {
  color: white;
}
#content .whitesmoke {
  color: whitesmoke;
}
#content .yellow {
  color: yellow;
}
#content .yellowgreen {
  color: yellowgreen;
}
#content h1 {
  font-size: 2em;
  margin: 0.2em 0;
}
#content .unit-title {
  font-weight: bold;
  font-size: 1.5em;
}
#content .chapter-title {
  font-size: 2em;
}
#content .question {
  font-size: 1.7em;
  margin: 0.5em 0;
}
#content .equations {
  font-size: 1.6em;
  line-height: 1.6;
}
#content .input-container {
  display: flex;
  margin-top: 2em;
  gap: 1em;
}
#content .input-box {
  background-color: #a3b1a6;
  border-radius: 25px;
  padding: 0.8em 2em;
  font-size: 1.6em;
  color: white;
  border: none;
  width: 300px;
}
#content .button-next {
  background-color: #33aaff;
  border: none;
  border-radius: 25px;
  padding: 0.5em 0.8em;
  font-size: 1.0em;
  color: white;
  cursor: pointer;
}
#content .footer-bar {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 20px;
  background: linear-gradient(to right, #dca10d, #8c5d00);
}
/* #n2 ~ #n100 をデフォルトで非表示 */
#content #n2,
#content #n3,
#content #n4,
#content #n5,
#content #n6,
#content #n7,
#content #n8,
#content #n9,
#content #n10,
#content #n11,
#content #n12,
#content #n13,
#content #n14,
#content #n15,
#content #n16,
#content #n17,
#content #n18,
#content #n19,
#content #n20,
#content #n21,
#content #n22,
#content #n23,
#content #n24,
#content #n25,
#content #n26,
#content #n27,
#content #n28,
#content #n29,
#content #n30,
#content #n31,
#content #n32,
#content #n33,
#content #n34,
#content #n35,
#content #n36,
#content #n37,
#content #n38,
#content #n39,
#content #n40,
#content #n41,
#content #n42,
#content #n43,
#content #n44,
#content #n45,
#content #n46,
#content #n47,
#content #n48,
#content #n49,
#content #n50,
#content #n51,
#content #n52,
#content #n53,
#content #n54,
#content #n55,
#content #n56,
#content #n57,
#content #n58,
#content #n59,
#content #n60,
#content #n61,
#content #n62,
#content #n63,
#content #n64,
#content #n65,
#content #n66,
#content #n67,
#content #n68,
#content #n69,
#content #n70,
#content #n71,
#content #n72,
#content #n73,
#content #n74,
#content #n75,
#content #n76,
#content #n77,
#content #n78,
#content #n79,
#content #n80,
#content #n81,
#content #n82,
#content #n83,
#content #n84,
#content #n85,
#content #n86,
#content #n87,
#content #n88,
#content #n89,
#content #n90,
#content #n91,
#content #n92,
#content #n93,
#content #n94,
#content #n95,
#content #n96,
#content #n97,
#content #n98,
#content #n99,
#content #n100 {
  display: none;
}
`;
    const script = /* ...既存の script 生成処理... */ `
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
  `;
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://accounts.google.com https://apis.google.com">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" crossorigin="anonymous">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" crossorigin="anonymous"></script>
        <style>
        ${styles}
        </style>
      </head>
      <body>
        <div id="content">
        ${htmlOutput}
        </div>
        <script>
        ${script}
        // KaTeX auto-render configuration
        document.addEventListener("DOMContentLoaded", function() {
          if (typeof renderMathInElement !== 'undefined') {
            renderMathInElement(document.body, {
              delimiters: [
                {left: "$$", right: "$$", display: false},
                {left: "$", right: "$", display: true},
                {left: "\\(", right: "\\)", display: true},
                {left: "\\[", right: "\\]", display: true}
              ],
              throwOnError: false,
              errorColor: '#cc0000'
            });
          }
        });
        </script>
      </body>
      </html>
    `;
    const iframe = document.getElementById("myIframe");
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(fullHtml);
    iframeDocument.close();
  };
  reader.readAsText(file, "UTF-8");
});

// サンプル表示ボタン
document.getElementById('loadSampleBtn').addEventListener('click', function () {
  location.reload();
});

// ...existing code...
