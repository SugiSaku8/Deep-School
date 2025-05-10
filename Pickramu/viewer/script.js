// Pickramu/API/compile.n.js
function convertToHtml(inputText) {
  let outputHtml = "";
  const lines = inputText.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Handle @tag [open] blocks
    let tagOpenMatch = line.match(/@tag\s+([\w,-]+)?\s+\[open\]/);
    if (tagOpenMatch) {
      const tagIds = tagOpenMatch[1]
        ? tagOpenMatch[1]
            .split(",")
            .map((id) => id.trim())
            .join(" ")
        : ""; // Split and join IDs
      outputHtml += `<div id="${tagIds}">\n`;
      i++;
      continue;
    }

    // Handle @tag [close] blocks
    let tagCloseMatch = line.match(/@tag\s+([\w,-]+)?\s+\[close\]/);
    if (tagCloseMatch) {
      i++; // Consume the close tag line
      outputHtml += `</div>\n`;
      continue;
    }

    // Handle @btn tags
    let btnMatch = line.match(/@btn\s+id=([\w,-]+)\s+class=([\w,-]+)\s+(.+)/);
    if (btnMatch) {
      const btnIds = btnMatch[1]
        .split(",")
        .map((id) => id.trim())
        .join(" "); // Split and join IDs
      const btnClasses = btnMatch[2]
        .split(",")
        .map((cls) => cls.trim())
        .join(" "); // Split and join classes
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

    // If no match, treat the line as plain text
    outputHtml += line + "\n";
    i++;
  }

  return outputHtml;
}

const inputText = `
@tag n1 class=unit [open]
@tag question [open]
約10万年前ごろのものと見られる人類の痕跡が日本列島から見つかりました。
この頃の人類は、動物を狩って生活していました。
@tag question [close]
@btn id=btn1 class=button-next 次へ
@tag n1 class=unit [close]
@tag n2 class=unit [open]
@tag question [open]
約 1 万年前、日本列島が大陸から分離しました。
紀元前 3000 年ごろ、稲作が日本列島に伝わりました。
@tag question [close]
@btn id=btn2 class=button-next 次へ
@tag n2 class=unit [close]
@script on=btn1 [open]
dom.Tag("n1").style.display('none','auto');
dom.Tag("n2").style.display('block','auto');
@script [close]
@script on=btn2 [open]
dom.back();
@script [close]
`;

const htmlOutput = convertToHtml(inputText);

// Define the CSS styles
const styles = `

body{
font-family: "Noto Sans JP", sans-serif;
  color: black;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
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
    #content #n2 {
      display: none;
    }
  `;
const script = `
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
// Create the full HTML content with styles
const fullHtml = `
  <!DOCTYPE html>
  <html>
  <head>
  <style>
  ${styles}
  </style>
  <script>
  ${script}
  </script>
  </head>
  <body>
  <div id="content">
  ${htmlOutput}
  </div>
  </body>
  </html>
`;

console.log(fullHtml);

const iframe = document.getElementById("myIframe");
const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
iframeDocument.open();
iframeDocument.write(fullHtml);
iframeDocument.close();
