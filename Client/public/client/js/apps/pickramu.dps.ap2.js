/* 
Pickramu
The Pickramu is a language for creating teaching materials for Deep-School.
version:1.0.23
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
  
  // Store answers for dynamic checking
  const answers = {};

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
      outputHtml += `<input type="text" class="input-box" placeholder="答えを入力" id="${inputId}_input">\n`;
      outputHtml += inputContent;
      outputHtml += `</div>\n`;
      outputHtml += `</div>\n`;

      // Add script for button click handler and Enter key support
      if (hasButton && futterId) {
        outputHtml += `<script>\n`;
        outputHtml += `(function() {\n`;
        outputHtml += `  const input = document.getElementById("${inputId}_input");\n`;
        outputHtml += `  const button = document.getElementById("${buttonId}");\n`;
        outputHtml += `  \n`;
        outputHtml += `  function checkAnswer() {\n`;
        outputHtml += `    const userAnswer = input.value.trim();\n`;
        outputHtml += `    const futterElement = document.getElementById("${futterId}");\n`;
        outputHtml += `    \n`;
        outputHtml += `    // Get the answer content that was stored during compilation\n`;
        outputHtml += `    const answerContent = ${JSON.stringify(answers[futterId] || "")};\n`;
        outputHtml += `    \n`;
        outputHtml += `    // Extract expected answer from the stored content\n`;
        outputHtml += `    let expectedAnswer = "";\n`;
        outputHtml += `    if (answerContent) {\n`;
        outputHtml += `      const answerMatch = answerContent.match(/正解は「([^」]+)」/);\n`;
        outputHtml += `      if (answerMatch) {\n`;
        outputHtml += `        expectedAnswer = answerMatch[1].trim();\n`;
        outputHtml += `      }\n`;
        outputHtml += `    }\n`;
        outputHtml += `    \n`;
        outputHtml += `    // If no expected answer found, just show the answer\n`;
        outputHtml += `    if (!expectedAnswer) {\n`;
        outputHtml += `      document.getElementById("${inputId}").style.display = "none";\n`;
        outputHtml += `      document.getElementById("${futterId}").style.display = "block";\n`;
        outputHtml += `      return;\n`;
        outputHtml += `    }\n`;
        outputHtml += `    \n`;
        outputHtml += `    // Check if answer is correct (case-insensitive, trim whitespace)\n`;
        outputHtml += `    const isCorrect = userAnswer.toLowerCase().trim() === expectedAnswer.toLowerCase().trim();\n`;
        outputHtml += `    \n`;
        outputHtml += `    if (isCorrect || userAnswer === "") {\n`;
        outputHtml += `      // Show correct answer\n`;
        outputHtml += `      document.getElementById("${inputId}").style.display = "none";\n`;
        outputHtml += `      document.getElementById("${futterId}").style.display = "block";\n`;
        outputHtml += `    } else {\n`;
        outputHtml += `      // Show error message\n`;
        outputHtml += `      alert("不正解です。もう一度試してください。\\n\\n正解: " + expectedAnswer);\n`;
        outputHtml += `    }\n`;
        outputHtml += `  }\n`;
        outputHtml += `  \n`;
        outputHtml += `  // Button click handler\n`;
        outputHtml += `  button.onclick = checkAnswer;\n`;
        outputHtml += `  \n`;
        outputHtml += `  // Enter key handler\n`;
        outputHtml += `  input.addEventListener("keypress", function(e) {\n`;
        outputHtml += `    if (e.key === "Enter") {\n`;
        outputHtml += `      checkAnswer();\n`;
        outputHtml += `    }\n`;
        outputHtml += `  });\n`;
        outputHtml += `})();\n`;
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
        // Collect answer content for this futter
        i++;
        let answerContent = "";
        while (i < lines.length && !lines[i].match(/@futter.*\[close\]/)) {
          answerContent += lines[i] + "\n";
          i++;
        }
        // Store the answer content
        answers[futterId] = answerContent.trim();
        outputHtml += answerContent;
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
  icon: "re/ico/note.svg"
};

export function appInit(shell) {
  const root = document.getElementById('app-root');
  if (!root) {
    ds.log({from: 'dp.app.pickramu.err', message: 'PickramuApp: #app-rootが見つかりません', level: 'error'});
    return;
  }
  root.innerHTML = `
    <div class="page-container">
      <button class="go-back-button" id="pickramu-back-btn" data-lang-key="back">←</button>
      <h1 class="page-title" data-lang-key="pickramu_work">Pickramu</h1>
      <div class="pickramu-tabs" style="margin-bottom: 20px; display: flex; gap: 12px;">
        <button class="auto-btn" id="tab-pickramu" data-lang-key="pickramu_tab">教材ワーク</button>
        <button class="auto-btn" id="tab-eguide" data-lang-key="eguide_tab">eGuide</button>
      </div>
      <div id="pickramu-work-area">
        <div class="pickramu-select-container">
          <div class="pickramu-select-card">
            <h3 class="pickramu-select-title">教材選択</h3>
            <div class="pickramu-select-group">
              <label for="pickramu-unit-select" class="pickramu-select-label">学習する教材を選択してください：</label>
              <select id="pickramu-unit-select" class="pickramu-select-dropdown">
                <option value="jla/math/式の計算/1節/1.用語/1.md">数学: 式の計算・1節・用語 (1)</option>
                <option value="jla/math/式の計算/1節/1.用語/2.md">数学: 式の計算・1節・用語 (2)</option>
                <option value="jla/math/式の計算/1節/2.加法・減法/1.md">数学: 式の計算・1節・加法・減法 (1)</option>
                <option value="jla/math/式の計算/1節/2.加法・減法/2.md">数学: 式の計算・1節・加法・減法 (2)</option>
                <option value="jla/ss/unit1/chapter1.md">社会: Unit1・Chapter1</option>
              </select>
              <button class="pickramu-load-button" id="pickramu-load-btn" data-lang-key="load">
                <span class="button-text">教材を読み込む</span>
                <span class="button-icon">📚</span>
              </button>
            </div>
          </div>
        </div>
        <iframe id="pickramu_iframe" style="width:100%; height:70vh; border:none; border-radius:12px; background:#173c2b; overflow-y: auto;"></iframe>
        <div id="pickramu-content"></div>
      </div>
      <div id="pickramu-eguide-area" style="display:none;">
        <iframe src="eguide.html" style="width:100%; height:70vh; border:none; border-radius:12px; background:#173c2b; overflow-y: auto;"></iframe>
      </div>
    </div>
    
    <style>
      .page-container {
        height: 100vh;
        overflow-y: auto;
        padding: 20px;
        box-sizing: border-box;
      }
      
      .pickramu-select-container {
        margin-bottom: 2rem;
        display: flex;
        justify-content: center;
      }
      
      .pickramu-select-card {
        background: rgba(255, 255, 255, 0.13);
        border-radius: 24px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.27);
        backdrop-filter: blur(12px) saturate(180%);
        -webkit-backdrop-filter: blur(12px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.18);
        padding: 2rem;
        max-width: 600px;
        width: 100%;
        color: #fff;
        text-align: center;
        animation: fadeInUp 1.2s cubic-bezier(.23,1.01,.32,1) both;
      }
      
      .pickramu-select-title {
        font-family: "anka", 'Helvetica Neue', Arial, 'Hiragino Sans', 'Meiryo', sans-serif;
        font-size: 1.8rem;
        font-weight: bold;
        margin: 0 0 1.5rem 0;
        color: #ffe066;
        text-shadow: 0 2px 8px #0008;
        letter-spacing: 0.05em;
      }
      
      .pickramu-select-group {
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
        align-items: center;
      }
      
      .pickramu-select-label {
        font-family: "anka", 'Helvetica Neue', Arial, 'Hiragino Sans', 'Meiryo', sans-serif;
        font-size: 1.1rem;
        color: #f8f8f2;
        text-shadow: 0 1px 2px #0008;
        margin-bottom: 0.5rem;
      }
      
      .pickramu-select-dropdown {
        background: rgba(45, 58, 46, 0.8);
        border: 2px dashed #f8f8f2;
        border-radius: 16px;
        padding: 0.8rem 1.2rem;
        font-size: 1rem;
        color: #f8f8f2;
        font-family: "anka", 'Helvetica Neue', Arial, 'Hiragino Sans', 'Meiryo', sans-serif;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        min-width: 300px;
        text-align: center;
      }
      
      .pickramu-select-dropdown:focus {
        outline: none;
        border-color: #ffe066;
        box-shadow: 0 4px 16px #ffe06688;
        background: rgba(45, 58, 46, 0.9);
      }
      
      .pickramu-select-dropdown:hover {
        border-color: #aee9f5;
        box-shadow: 0 4px 16px #aee9f588;
      }
      
      .pickramu-select-dropdown option {
        background: #2d3a2e;
        color: #f8f8f2;
        padding: 0.5rem;
      }
      
      .pickramu-load-button {
        background: linear-gradient(90deg, #00b894 0%, #00cec9 100%);
        color: #fff;
        font-family: "anka", 'Helvetica Neue', Arial, 'Hiragino Sans', 'Meiryo', sans-serif;
        font-size: 1rem;
        font-weight: bold;
        padding: 0.7rem 1.5rem;
        border: none;
        border-radius: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 3px 12px #00b89444;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        min-width: 160px;
        justify-content: center;
      }
      
      .pickramu-load-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px #00b89466;
        background: linear-gradient(90deg, #00cec9 0%, #00b894 100%);
      }
      
      .pickramu-load-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px #00b89444;
      }
      
      .button-text {
        font-size: 0.95rem;
      }
      
      .button-icon {
        font-size: 1.1rem;
        filter: drop-shadow(0 1px 2px #0008);
      }
      
      @keyframes fadeInUp {
        0% {
          opacity: 0;
          transform: translateY(40px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Responsive design */
      @media (max-width: 700px) {
        .pickramu-select-card {
          margin: 0 1rem;
          padding: 1.5rem;
        }
        
        .pickramu-select-dropdown {
          min-width: 250px;
          font-size: 0.9rem;
        }
        
        .pickramu-load-button {
          font-size: 0.9rem;
          padding: 0.6rem 1.2rem;
          min-width: 140px;
        }
        
        .button-text {
          font-size: 0.85rem;
        }
        
        .button-icon {
          font-size: 1rem;
        }
        
        .pickramu-select-title {
          font-size: 1.5rem;
        }
      }
    </style>
  `;

  // 戻るボタン
  document.getElementById('pickramu-back-btn').onclick = () => shell.loadApp('menu');

  // タブ切り替え
  document.getElementById('tab-pickramu').onclick = () => {
    document.getElementById('pickramu-work-area').style.display = 'block';
    document.getElementById('pickramu-eguide-area').style.display = 'none';
    document.getElementById('tab-pickramu').classList.add('active');
    document.getElementById('tab-eguide').classList.remove('active');
  };
  document.getElementById('tab-eguide').onclick = () => {
    document.getElementById('pickramu-work-area').style.display = 'none';
    document.getElementById('pickramu-eguide-area').style.display = 'block';
    document.getElementById('tab-pickramu').classList.remove('active');
    document.getElementById('tab-eguide').classList.add('active');
  };

  // 教材読み込みボタン
  document.getElementById('pickramu-load-btn').onclick = async () => {
    const select = document.getElementById('pickramu-unit-select');
    const content = document.getElementById('pickramu-content');
    if (select && content) {
      const path = select.value;
      content.textContent = '読み込み中...';
      try {
        const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        const basePath = isLocal ? '/Pickramu/data/' : 'https://sugisaku8.github.io/Deep-School/client/Pickramu/data/';
        const fetchUrl = basePath + path;
        const res = await fetch(fetchUrl);
        if (res.ok) {
          const text = await res.text();
          const html = convertToHtml(text);
          shell.log({from: 'dp.app.menu.out', message: `Pickramu-Compiler:Complied html:\n${html}`, level: 'info'});

          // Define the CSS styles
          const styles = `
            body{
              font-family: "Noto Sans JP", sans-serif;
              color: white;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              min-height: 100vh;
              padding: 20px;
              margin: 0;
              overflow-y: auto;
            }
            #red {
              color: red;
            }
            #testB {
              display: none;
            }
            #content{
              font-size:1.6em;
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px 0;
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
              flex-direction: column;
              align-items: center;
              margin-top: 2em;
              gap: 1em;
              padding: 1em;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              backdrop-filter: blur(10px);
            }
            #content .input-box {
              background-color: rgba(163, 177, 166, 0.8);
              border-radius: 25px;
              padding: 0.8em 2em;
              font-size: 1.6em;
              color: white;
              border: 2px solid rgba(255, 255, 255, 0.2);
              width: 300px;
              text-align: center;
              transition: all 0.3s ease;
            }
            #content .input-box:focus {
              outline: none;
              border-color: #33aaff;
              box-shadow: 0 0 10px rgba(51, 170, 255, 0.3);
              background-color: rgba(163, 177, 166, 0.9);
            }
            #content .input-box::placeholder {
              color: rgba(255, 255, 255, 0.7);
            }
            #content .button-next {
              background: linear-gradient(135deg, #33aaff, #2288cc);
              border: none;
              border-radius: 25px;
              padding: 0.8em 2em;
              font-size: 1.2em;
              color: white;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(51, 170, 255, 0.3);
              font-weight: bold;
            }
            #content .button-next:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(51, 170, 255, 0.4);
              background: linear-gradient(135deg, #44bbff, #3399dd);
            }
            #content .button-next:active {
              transform: translateY(0);
              box-shadow: 0 2px 10px rgba(51, 170, 255, 0.3);
            }
            #content .footer-bar {
              position: absolute;
              bottom: 0;
              width: 100%;
              height: 20px;
              background: linear-gradient(to right, #dca10d, #8c5d00);
            }
            #content #n2{
              display: none;
            }
            #content #n3{
              display: none;
            }
            #content #n4{
              display: none;
            }
            #content #n5{
              display: none;
            }
            #content #n6{
              display: none;
            }
            #content #n7{
              display: none;
            }
            #content #n8{
              display: none;
            }
            #content #n9{
              display:none;
            }
            #content #n10{
              display:none;
            }
            #content #n11{
              display:none;
            }
            #content #n12{
              display:none;
            }
            #content #n13{
              display:none;
            }
            #content #n14{
              display:none;
            }
            #content #n15{
              display:none;
            }
            #content #n16{
              display:none;
            }
            #content #n17{
              display:none;
            }
            #content #n18{
              display:none; 
            }
            #content #n19{
              display:none;
            }
            #content #n20{
              display:none;
            }
            #content #n21{
              display:none;
            }
            #content #n22{
              display:none;
            }
            #content #n23{
              display:none;
            }
            #content #n24{
              display:none;
            }
          `;
          const script = `
            // Clear any existing dom object to prevent redeclaration
            if (window.dom) {
              delete window.dom;
            }
            
            /**
             * dom - DOM操作を簡単にするためのオブジェクト
             * @namespace dom
             */
            const dom = {
              /**
               * back - 前のページに戻る
               * @returns {void}
               */
              back: function() {
                if (window.history && window.history.back) {
                  window.history.back();
                } else {
                  window.location.href = document.referrer || '/';
                }
              },
              
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
            
            // Make dom globally available
            window.dom = dom;
          `;
          // Create the full HTML content with styles
          const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">
              <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossorigin="anonymous"></script>
              <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous"></script>
              <style>
              ${styles}
              </style>
              <script>
              ${script}
              
              // KaTeX auto-render configuration
              document.addEventListener("DOMContentLoaded", function() {
                renderMathInElement(document.body, {
                  delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false},
                    {left: "\\(", right: "\\)", display: true},
                    {left: "\\[", right: "\\]", display: true}
                  ],
                  throwOnError: false,
                  errorColor: '#cc0000'
                });
              });
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
          // Use srcdoc instead of document.write for better security and to avoid warnings
          iframe.srcdoc = fullHtml;
        } else {
          content.textContent = `教材の読み込みに失敗しました (404 Not Found)\nURL: ${fetchUrl}`;
        }
      } catch (e) {
        content.textContent = '教材の読み込みでエラーが発生しました';
      }
    }
  };
} 