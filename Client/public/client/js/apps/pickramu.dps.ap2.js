/* 
Pickramu
The Pickramu is a language for creating teaching materials for Deep-School.
version:1.0.7
Development:Carnaion Studio
License:MPL-2.0
*/
export function convertToHtml(inputText) {
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
      let expectedAnswer = "";

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
        outputHtml += `  const input = document.querySelector("#${inputId} input");\n`;
        outputHtml += `  const userAnswer = input.value.trim();\n`;
        outputHtml += `  const expectedAnswer = "$$ \\\\frac{39}{10} $$";\n`;
        outputHtml += `  const isCorrect = userAnswer === expectedAnswer;\n`;
        outputHtml += `  if (isCorrect) {\n`;
        outputHtml += `    document.getElementById("${inputId}").style.display = "none";\n`;
        outputHtml += `    document.getElementById("${futterId}").style.display = "block";\n`;
        outputHtml += `  } else {\n`;
        outputHtml += `    alert("不正解です。もう一度試してください。");\n`;
        outputHtml += `  }\n`;
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

export const appMeta = {
  name: "pickramu",
  title: "Pickramu",
  icon: "re/ico/note.svg",
};

export function appInit(shell) {
  const root = document.getElementById("app-root");
  if (!root) {
    ds.log({
      from: "dp.app.pickramu.err",
      message: "PickramuApp: #app-rootが見つかりません",
      level: "error",
    });
    return;
  }
  root.innerHTML = `
    <div class="page-container">
      <button class="go-back-button" id="pickramu-back-btn" data-lang-key="back">←</button>
      <h1 class="page-title" data-lang-key="pickramu_work">Pickramu</h1>
      <button class="fullscreen-btn" id="pickramu-fullscreen-btn" title="全画面表示">⛶</button>
      <div class="pickramu-tabs" style="margin-bottom: 20px; display: flex; gap: 12px;">
        <button class="auto-btn" id="tab-pickramu" data-lang-key="pickramu_tab">教材ワーク</button>
        <button class="auto-btn" id="tab-eguide" data-lang-key="eguide_tab">eGuide</button>
      </div>
      <div id="pickramu-work-area">
        <div class="pickramu-select" style="margin-bottom: 20px;">
          <label for="pickramu-unit-select" data-lang-key="select_material">教材選択：</label>
          <select id="pickramu-unit-select">
            <option value="jla/math/式の計算/1節/1.用語/1.md">数学: 式の計算・1節・用語 (1)</option>
            <option value="jla/math/式の計算/1節/1.用語/2.md">数学: 式の計算・1節・用語 (2)</option>
            <option value="jla/math/式の計算/1節/2.加法・減法/1.md">数学: 式の計算・1節・加法・減法 (1)</option>
            <option value="jla/math/式の計算/1節/2.加法・減法/2.md">数学: 式の計算・1節・加法・減法 (2)</option>
            <option value="jla/ss/unit1/chapter1.md">社会: Unit1・Chapter1</option>
          </select>
          <button class="auto-btn" id="pickramu-load-btn" data-lang-key="load">読み込み</button>
        </div>
        <iframe id="pickramu_iframe" style="width:100%; min-height:600px; border:none; border-radius:12px; background:#173c2b;"></iframe>
      <div id="pickramu-content"></div>
        </div>
      <div id="pickramu-eguide-area" style="display:none;">
        <iframe src="eguide.html" style="width:100%; min-height:600px; border:none; border-radius:12px; background:#173c2b;"></iframe>
      </div>
    </div>
  `;

  // 戻るボタン
  document.getElementById("pickramu-back-btn").onclick = () =>
    shell.loadApp("menu");

  // タブ切り替え
  document.getElementById("tab-pickramu").onclick = () => {
    document.getElementById("pickramu-work-area").style.display = "block";
    document.getElementById("pickramu-eguide-area").style.display = "none";
    document.getElementById("tab-pickramu").classList.add("active");
    document.getElementById("tab-eguide").classList.remove("active");
  };
  document.getElementById("tab-eguide").onclick = () => {
    document.getElementById("pickramu-work-area").style.display = "none";
    document.getElementById("pickramu-eguide-area").style.display = "block";
    document.getElementById("tab-pickramu").classList.remove("active");
    document.getElementById("tab-eguide").classList.add("active");
  };

  // 教材読み込みボタン
  document.getElementById("pickramu-load-btn").onclick = async () => {
    const select = document.getElementById("pickramu-unit-select");
    const content = document.getElementById("pickramu-content");
    if (select && content) {
      const path = select.value;
      content.textContent = "読み込み中...";
      try {
        const isLocal =
          location.hostname === "localhost" ||
          location.hostname === "127.0.0.1";
        const basePath = isLocal
          ? "/Pickramu/data/"
          : "https://sugisaku8.github.io/Deep-School/client/Pickramu/data/";
        const fetchUrl = basePath + path;
        const res = await fetch(fetchUrl);
        if (res.ok) {
          const text = await res.text();
          const html = convertToHtml(text);
          shell.log({
            from: "dp.app.menu.out",
            message: `Pickramu-Compiler:Complied html:\n${html}`,
            level: "info",
          });

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
          <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
          <style>
          ${styles}
          </style>
          <script>
          ${script}
          </script>
          </head>
          <body>
          <div id="content">
          ${html}
          </div>
          </body>
          </html>
        `;

          const iframe = document.getElementById("pickramu_iframe");
          const iframeDocument =
            iframe.contentDocument || iframe.contentWindow.document;
          iframeDocument.open();
          iframeDocument.write(fullHtml);
          iframeDocument.close();
        } else {
          content.textContent = `教材の読み込みに失敗しました (404 Not Found)\nURL: ${fetchUrl}`;
        }
      } catch (e) {
        content.textContent = "教材の読み込みでエラーが発生しました";
      }
    }
  };

  // フルスクリーンボタン
  document.getElementById("pickramu-fullscreen-btn").onclick = () => {
    const content = document.getElementById("pickramu-content");
    if (!document.fullscreenElement) {
      content.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };
}
