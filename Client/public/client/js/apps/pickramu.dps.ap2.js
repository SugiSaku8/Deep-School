/* 
Pickramu
The Pickramu is a language for creating teaching materials for Deep-School.
version:1.0.33
Development:Carnaion Studio
License:MPL-2.0
*/
export function convertToHtml(inputText, shell) {
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
        outputHtml += `  // Wait for DOM to be ready\n`;
        outputHtml += `  function initAnswerSystem() {\n`;
        outputHtml += `    if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "Initializing answer system for ${inputId} -> ${futterId}", level: 'info'});\n`;
        outputHtml += `    const input = document.getElementById("${inputId}_input");\n`;
        outputHtml += `    const button = document.getElementById("${buttonId}");\n`;
        outputHtml += `    const futterElement = document.getElementById("${futterId}");\n`;
        outputHtml += `    \n`;
        outputHtml += `    if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "Elements found: " + JSON.stringify({ input: !!input, button: !!button, futter: !!futterElement }), level: 'info'});\n`;
        outputHtml += `    \n`;
        outputHtml += `    if (!input || !button || !futterElement) {\n`;
        outputHtml += `      if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.err', message: "Required elements not found: " + JSON.stringify({ input: !!input, button: !!button, futter: !!futterElement }), level: 'error'});\n`;
        outputHtml += `      return;\n`;
        outputHtml += `    }\n`;
        outputHtml += `    \n`;
        outputHtml += `    // Get the answer content that was stored during compilation\n`;
        outputHtml += `    const answerContent = ${JSON.stringify(answers[futterId] || "")};\n`;
        outputHtml += `    if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "Answer content for ${futterId}: " + answerContent, level: 'info'});\n`;
        outputHtml += `    \n`;
        outputHtml += `    function checkAnswer() {\n`;
        outputHtml += `      if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "checkAnswer function called", level: 'info'});\n`;
        outputHtml += `      const userAnswer = input.value.trim();\n`;
        outputHtml += `      if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "User answer: " + userAnswer, level: 'info'});\n`;
        outputHtml += `      \n`;
        outputHtml += `      // Extract expected answer from the stored content - multiple patterns\n`;
        outputHtml += `      let expectedAnswer = "";\n`;
        outputHtml += `      if (answerContent) {\n`;
        outputHtml += `        // Pattern 1: 正解は「...」\n`;
        outputHtml += `        let answerMatch = answerContent.match(/正解は「([^」]+)」/);\n`;
        outputHtml += `        if (answerMatch) {\n`;
        outputHtml += `          expectedAnswer = answerMatch[1].trim();\n`;
        outputHtml += `        } else {\n`;
        outputHtml += `          // Pattern 2: 正解: ...\n`;
        outputHtml += `          answerMatch = answerContent.match(/正解:\\s*([^\\n]+)/);\n`;
        outputHtml += `          if (answerMatch) {\n`;
        outputHtml += `            expectedAnswer = answerMatch[1].trim();\n`;
        outputHtml += `          } else {\n`;
        outputHtml += `            // Pattern 3: 答え: ...\n`;
        outputHtml += `            answerMatch = answerContent.match(/答え:\\s*([^\\n]+)/);\n`;
        outputHtml += `            if (answerMatch) {\n`;
        outputHtml += `              expectedAnswer = answerMatch[1].trim();\n`;
        outputHtml += `            } else {\n`;
        outputHtml += `              // Pattern 4: 解答: ...\n`;
        outputHtml += `              answerMatch = answerContent.match(/解答:\\s*([^\\n]+)/);\n`;
        outputHtml += `              if (answerMatch) {\n`;
        outputHtml += `                expectedAnswer = answerMatch[1].trim();\n`;
        outputHtml += `              } else {\n`;
        outputHtml += `                // Pattern 5: 最初の数式を探す（$...$形式）\n`;
        outputHtml += `                answerMatch = answerContent.match(/\\$([^$]+)\\$/);\n`;
        outputHtml += `                if (answerMatch) {\n`;
        outputHtml += `                  expectedAnswer = answerMatch[1].trim();\n`;
        outputHtml += `                } else {\n`;
        outputHtml += `                  // Pattern 6: 最初の行から数式っぽいものを探す\n`;
        outputHtml += `                  const firstLine = answerContent.split('\\n')[0];\n`;
        outputHtml += `                  if (firstLine && (firstLine.includes('x') || firstLine.includes('y') || firstLine.includes('=') || firstLine.includes('+'))) {\n`;
        outputHtml += `                    expectedAnswer = firstLine.trim();\n`;
        outputHtml += `                  }\n`;
        outputHtml += `                }\n`;
        outputHtml += `              }\n`;
        outputHtml += `            }\n`;
        outputHtml += `          }\n`;
        outputHtml += `        }\n`;
        outputHtml += `      }\n`;
        outputHtml += `      if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "Expected answer: " + expectedAnswer, level: 'info'});\n`;
        outputHtml += `      \n`;
        outputHtml += `      // Check if user provided an answer\n`;
        outputHtml += `      if (!userAnswer) {\n`;
        outputHtml += `        if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.warn', message: "答えを入力してください。", level: 'warn'});\n`;
        outputHtml += `        input.focus();\n`;
        outputHtml += `        return;\n`;
        outputHtml += `      }\n`;
        outputHtml += `      \n`;
        outputHtml += `      // If no expected answer found, just show the answer content\n`;
        outputHtml += `      if (!expectedAnswer) {\n`;
        outputHtml += `        if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "No expected answer found, showing answer content", level: 'info'});\n`;
        outputHtml += `        document.getElementById("${inputId}").style.display = "none";\n`;
        outputHtml += `        document.getElementById("${futterId}").style.display = "block";\n`;
        outputHtml += `        return;\n`;
        outputHtml += `      }\n`;
        outputHtml += `      \n`;
        outputHtml += `      // Check if answer is correct (case-insensitive, trim whitespace)\n`;
        outputHtml += `      const isCorrect = userAnswer.toLowerCase().trim() === expectedAnswer.toLowerCase().trim();\n`;
        outputHtml += `      if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "Answer check: " + JSON.stringify({ userAnswer, expectedAnswer, isCorrect }), level: 'info'});\n`;
        outputHtml += `      \n`;
        outputHtml += `      if (isCorrect) {\n`;
        outputHtml += `        if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "Correct answer!", level: 'info'});\n`;
        outputHtml += `        // Show correct answer\n`;
        outputHtml += `        document.getElementById("${inputId}").style.display = "none";\n`;
        outputHtml += `        document.getElementById("${futterId}").style.display = "block";\n`;
        outputHtml += `      } else {\n`;
        outputHtml += `        if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.warn', message: "Incorrect answer: あなたの答え: " + userAnswer + " 正解: " + expectedAnswer, level: 'warn'});\n`;
        outputHtml += `        // Show error message with retry option\n`;
        outputHtml += `        const retry = window.confirm("不正解です。\\n\\nあなたの答え: " + userAnswer + "\\n正解: " + expectedAnswer + "\\n\\nもう一度試しますか？");\n`;
        outputHtml += `        if (retry) {\n`;
        outputHtml += `          input.value = "";\n`;
        outputHtml += `          input.focus();\n`;
        outputHtml += `        }\n`;
        outputHtml += `      }\n`;
        outputHtml += `    }\n`;
        outputHtml += `    \n`;
        outputHtml += `    // Button click handler\n`;
        outputHtml += `    if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "Setting up button click handler for button ${buttonId}", level: 'info'});\n`;
        outputHtml += `    button.onclick = checkAnswer;\n`;
        outputHtml += `    \n`;
        outputHtml += `    // Enter key handler\n`;
        outputHtml += `    if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "Setting up Enter key handler for input ${inputId}_input", level: 'info'});\n`;
        outputHtml += `    input.addEventListener("keypress", function(e) {\n`;
        outputHtml += `      if (e.key === "Enter") {\n`;
        outputHtml += `        if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "Enter key pressed", level: 'info'});\n`;
        outputHtml += `        checkAnswer();\n`;
        outputHtml += `      }\n`;
        outputHtml += `    });\n`;
        outputHtml += `    \n`;
        outputHtml += `    if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "Answer system initialized for ${inputId} -> ${futterId}", level: 'info'});\n`;
        outputHtml += `  }\n`;
        outputHtml += `  \n`;
        outputHtml += `  // Try to initialize immediately, then on DOMContentLoaded\n`;
        outputHtml += `  if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "Calling initAnswerSystem immediately", level: 'info'});\n`;
        outputHtml += `  initAnswerSystem();\n`;
        outputHtml += `  if (document.readyState === 'loading') {\n`;
        outputHtml += `    if (window.ds && ds.log) ds.log({from: 'dp.app.pickramu.out', message: "Document still loading, adding DOMContentLoaded listener", level: 'info'});\n`;
        outputHtml += `    document.addEventListener('DOMContentLoaded', initAnswerSystem);\n`;
        outputHtml += `  }\n`;
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
        outputHtml += `(function() {\n`;
        outputHtml += `  function initScript() {\n`;
        outputHtml += `    const element = document.getElementById("${scriptOn}");\n`;
        outputHtml += `    if (element) {\n`;
        outputHtml += `      element.onclick = function() {\n`;
        outputHtml += scriptContent + "\n";
        outputHtml += `      };\n`;
        outputHtml += `    }\n`;
        outputHtml += `  }\n`;
        outputHtml += `  initScript();\n`;
        outputHtml += `  if (document.readyState === 'loading') {\n`;
        outputHtml += `    document.addEventListener('DOMContentLoaded', initScript);\n`;
        outputHtml += `  }\n`;
        outputHtml += `})();\n`;
        outputHtml += `</script>\n`;
      } else {
        if (shell && shell.log) shell.log({from: 'dp.app.pickramu.err', message: 'Error: Missing closing script tag', level: 'error'});
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
              </select>
              <button class="pickramu-load-button" id="pickramu-load-btn" data-lang-key="load">
                <span class="button-text">教材を読み込む</span>
                <span class="button-icon">📚</span>
              </button>
            </div>
          </div>
        </div>
        <iframe id="pickramu_iframe" style="width:100%; height:70vh; border:none; border-radius:8px; background:#ffffff; overflow-y: auto;"></iframe>
      </div>
      <div id="pickramu-eguide-area" style="display:none;">
        <iframe src="eguide.html" style="width:100%; height:70vh; border:none; border-radius:8px; background:#ffffff; overflow-y: auto;"></iframe>
      </div>
    </div>
    
    <style>
    :root {
      --bg-color: #f5f5f5;
      --text-color: #222;
      --card-bg: #fff;
      --border-radius: 12px;
      --shadow-color: rgba(0,0,0,0.08);
      --spacing-unit: 20px;
      --animation-duration: 0.3s;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--text-color);
      background: var(--bg-color);
      margin: 0;
      padding: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      transition: background var(--animation-duration);
    }
    #content {
      background: var(--card-bg);
      border-radius: var(--border-radius);
      box-shadow: 0 2px 8px var(--shadow-color);
      margin: 32px auto;
      padding: 32px 5vw;
      max-width: 700px;
      width: 100%;
      box-sizing: border-box;
      word-break: break-word;
      transition: background var(--animation-duration);
    }
    #content h1, #content .unit-title {
      font-size: 2em;
      font-weight: bold;
      margin: 0.2em 0 0.7em 0;
      color: var(--text-color);
    }
    #content .chapter-title {
      font-size: 1.5em;
      margin-bottom: 0.5em;
      color: var(--text-color);
    }
    #content .question {
      font-size: 1.2em;
      margin: 1em 0 0.5em 0;
      color: var(--text-color);
    }
    #content .input-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 2em;
      gap: 1em;
      padding: 1.5em;
      background: #f5f5f7;
      border-radius: var(--border-radius);
      border: 1px solid #e5e5e7;
      box-shadow: 0 1px 4px var(--shadow-color);
      transition: background var(--animation-duration);
    }
    #content .input-box {
      background-color: #fff;
      border-radius: 8px;
      padding: 0.8em 1em;
      font-size: 1.1em;
      color: var(--text-color);
      border: 1px solid #d2d2d7;
      width: 260px;
      text-align: center;
      transition: all var(--animation-duration);
      font-family: inherit;
    }
    #content .input-box:focus {
      outline: none;
      border-color: #007aff;
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
    }
    #content .input-box::placeholder {
      color: #86868b;
    }
    #content .button-next {
      background: #007aff;
      border: none;
      border-radius: 8px;
      padding: 0.8em 1.5em;
      font-size: 1em;
      color: #fff;
      cursor: pointer;
      transition: all var(--animation-duration);
      font-weight: 500;
      font-family: inherit;
      box-shadow: 0 1px 4px var(--shadow-color);
    }
    #content .button-next:hover {
      background: #0056cc;
      transform: translateY(-1px);
    }
    #content .button-next:active {
      background: #004499;
      transform: translateY(0);
    }
    /* ダークモード */
    body.dark-mode, .dark-mode #content {
      --bg-color: #1a1a1a;
      --text-color: #fff;
      --card-bg: #222;
      --shadow-color: rgba(0,0,0,0.3);
    }
    body.dark-mode #content {
      background: var(--card-bg);
      color: var(--text-color);
    }
    body.dark-mode .input-container {
      background: #23272e;
      border: 1px solid #333;
    }
    body.dark-mode .input-box {
      background: #181c20;
      color: #fff;
      border: 1px solid #444;
    }
    body.dark-mode .input-box::placeholder {
      color: #aaa;
    }
    body.dark-mode .button-next {
      background: #3290f4;
      color: #fff;
    }
    /* コンパクトモード */
    body.compact-mode #content {
      padding: 12px 2vw;
      border-radius: 6px;
    }
    body.compact-mode .input-container {
      padding: 0.7em;
      border-radius: 6px;
    }
    /* アニメーション制御 */
    body.no-animation * {
      animation-duration: 0s !important;
      transition-duration: 0s !important;
    }
    /* スクロールバー */
    #content::-webkit-scrollbar {
      width: 8px;
    }
    #content::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 4px;
    }
    #content::-webkit-scrollbar-track {
      background: #f5f5f7;
    }
    /* その他色クラスや数式・footer等は既存のまま */
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
    if (select) {
      const path = select.value;
      try {
        const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        const basePath = isLocal ? '/Pickramu/data/' : 'https://sugisaku8.github.io/Deep-School/client/Pickramu/data/';
        const fetchUrl = basePath + path;
        const res = await fetch(fetchUrl);
        if (res.ok) {
          const text = await res.text();
          const html = convertToHtml(text, shell);
          shell.log({from: 'dp.app.menu.out', message: `Pickramu-Compiler:Complied html:\n${html}`, level: 'info'});

          // Define the CSS styles
          const styles = `
            :root {
              --bg-color: #f5f5f5;
              --text-color: #222;
              --card-bg: #fff;
              --border-radius: 12px;
              --shadow-color: rgba(0,0,0,0.08);
              --spacing-unit: 20px;
              --animation-duration: 0.3s;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: var(--text-color);
              background: var(--bg-color);
              margin: 0;
              padding: 0;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              transition: background var(--animation-duration);
            }
            #content {
              background: var(--card-bg);
              border-radius: var(--border-radius);
              box-shadow: 0 2px 8px var(--shadow-color);
              margin: 32px auto;
              padding: 32px 5vw;
              max-width: 700px;
              width: 100%;
              box-sizing: border-box;
              word-break: break-word;
              transition: background var(--animation-duration);
            }
            #content h1, #content .unit-title {
              font-size: 2em;
              font-weight: bold;
              margin: 0.2em 0 0.7em 0;
              color: var(--text-color);
            }
            #content .chapter-title {
              font-size: 1.5em;
              margin-bottom: 0.5em;
              color: var(--text-color);
            }
            #content .question {
              font-size: 1.2em;
              margin: 1em 0 0.5em 0;
              color: var(--text-color);
            }
            #content .input-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin-top: 2em;
              gap: 1em;
              padding: 1.5em;
              background: #f5f5f7;
              border-radius: var(--border-radius);
              border: 1px solid #e5e5e7;
              box-shadow: 0 1px 4px var(--shadow-color);
              transition: background var(--animation-duration);
            }
            #content .input-box {
              background-color: #fff;
              border-radius: 8px;
              padding: 0.8em 1em;
              font-size: 1.1em;
              color: var(--text-color);
              border: 1px solid #d2d2d7;
              width: 260px;
              text-align: center;
              transition: all var(--animation-duration);
              font-family: inherit;
            }
            #content .input-box:focus {
              outline: none;
              border-color: #007aff;
              box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
            }
            #content .input-box::placeholder {
              color: #86868b;
            }
            #content .button-next {
              background: #007aff;
              border: none;
              border-radius: 8px;
              padding: 0.8em 1.5em;
              font-size: 1em;
              color: #fff;
              cursor: pointer;
              transition: all var(--animation-duration);
              font-weight: 500;
              font-family: inherit;
              box-shadow: 0 1px 4px var(--shadow-color);
            }
            #content .button-next:hover {
              background: #0056cc;
              transform: translateY(-1px);
            }
            #content .button-next:active {
              background: #004499;
              transform: translateY(0);
            }
            /* ダークモード */
            body.dark-mode, .dark-mode #content {
              --bg-color: #1a1a1a;
              --text-color: #fff;
              --card-bg: #222;
              --shadow-color: rgba(0,0,0,0.3);
            }
            body.dark-mode #content {
              background: var(--card-bg);
              color: var(--text-color);
            }
            body.dark-mode .input-container {
              background: #23272e;
              border: 1px solid #333;
            }
            body.dark-mode .input-box {
              background: #181c20;
              color: #fff;
              border: 1px solid #444;
            }
            body.dark-mode .input-box::placeholder {
              color: #aaa;
            }
            body.dark-mode .button-next {
              background: #3290f4;
              color: #fff;
            }
            /* コンパクトモード */
            body.compact-mode #content {
              padding: 12px 2vw;
              border-radius: 6px;
            }
            body.compact-mode .input-container {
              padding: 0.7em;
              border-radius: 6px;
            }
            /* アニメーション制御 */
            body.no-animation * {
              animation-duration: 0s !important;
              transition-duration: 0s !important;
            }
            /* スクロールバー */
            #content::-webkit-scrollbar {
              width: 8px;
            }
            #content::-webkit-scrollbar-thumb {
              background: #ccc;
              border-radius: 4px;
            }
            #content::-webkit-scrollbar-track {
              background: #f5f5f7;
            }
            /* その他色クラスや数式・footer等は既存のまま */
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
            if (!window.dom) {
              window.dom = {
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
            }
          `;
          // Create the full HTML content with styles
          const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://accounts.google.com https://apis.google.com">
              <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">
              <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossorigin="anonymous"></script>
              <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous"></script>
              <style>
              ${styles}
              </style>
            </head>
            <body>
              <div id="content">
              ${html}
              </div>
              
              <script>
              ${script}
              
              // Debug logging
              console.log("Pickramu content loaded");
              
              // KaTeX auto-render configuration
              document.addEventListener("DOMContentLoaded", function() {
                console.log("DOMContentLoaded fired");
                if (typeof renderMathInElement !== 'undefined') {
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
                } else {
                  console.warn("KaTeX renderMathInElement not available");
                }
              });
              
              // Additional initialization for scripts
              window.addEventListener('load', function() {
                console.log("Window load event fired");
                // Re-initialize any scripts that might not have been set up yet
                const scripts = document.querySelectorAll('script');
                scripts.forEach((script, index) => {
                  if (script.textContent.includes('initAnswerSystem') || script.textContent.includes('initScript')) {
                    console.log(\`Re-executing script \${index}\`);
                    try {
                      // Instead of eval, create a new script element
                      const newScript = document.createElement('script');
                      newScript.textContent = script.textContent;
                      document.body.appendChild(newScript);
                    } catch (e) {
                      console.error(\`Error re-executing script \${index}:\`, e);
                    }
                  }
                });
              });
              </script>
            </body>
            </html>
          `;
      
          const iframe = document.getElementById("pickramu_iframe");
          // Use srcdoc instead of document.write for better security and to avoid warnings
          iframe.srcdoc = fullHtml;
          
          // Wait for iframe to load and then ensure scripts are executed
          iframe.onload = function() {
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
              console.log("Iframe loaded, checking for scripts");
              
              // Force re-execution of any answer system scripts
              const scripts = iframeDoc.querySelectorAll('script');
              scripts.forEach((script, index) => {
                if (script.textContent.includes('initAnswerSystem') || script.textContent.includes('initScript')) {
                  console.log(`Re-executing script ${index} in iframe`);
                  try {
                    // Create a new script element with modified content to avoid dom redeclaration
                    const newScript = iframeDoc.createElement('script');
                    let scriptContent = script.textContent;
                    
                    // Remove dom object redeclaration if it exists
                    if (scriptContent.includes('const dom =') || scriptContent.includes('let dom =') || scriptContent.includes('var dom =')) {
                      scriptContent = scriptContent.replace(/(const|let|var)\s+dom\s*=\s*\{/g, 'if (!window.dom) { window.dom = {');
                      scriptContent = scriptContent.replace(/window\.dom\s*=\s*dom;?\s*$/, '}');
                    }
                    
                    newScript.textContent = scriptContent;
                    iframeDoc.body.appendChild(newScript);
                  } catch (e) {
                    console.error(`Error re-executing script ${index} in iframe:`, e);
                  }
                }
              });
              
              // Additional check for answer system elements
              setTimeout(() => {
                const inputs = iframeDoc.querySelectorAll('input[type="text"]');
                const buttons = iframeDoc.querySelectorAll('button');
                console.log("Found inputs:", inputs.length);
                console.log("Found buttons:", buttons.length);
                
                inputs.forEach((input, i) => {
                  console.log(`Input ${i}:`, input.id, input.placeholder);
                });
                
                buttons.forEach((button, i) => {
                  console.log(`Button ${i}:`, button.id, button.textContent);
                  if (button.textContent.includes('回答する')) {
                    console.log("Found answer button:", button.id);
                    // Force add click handler if not already set
                    if (!button.onclick) {
                      console.log("Adding click handler to answer button");
                      button.onclick = function() {
                        console.log("Answer button clicked manually");
                        const inputId = this.closest('.input-container').querySelector('input').id;
                        const futterId = inputId.replace('_input', '').replace('input', 'answer');
                        console.log("Looking for futter:", futterId);
                        const futter = iframeDoc.getElementById(futterId);
                        if (futter) {
                          console.log("Showing answer");
                          this.closest('.input-container').style.display = 'none';
                          futter.style.display = 'block';
                        }
                      };
                    }
                  }
                });
              }, 1000);
            } catch (e) {
              console.error("Error accessing iframe content:", e);
            }
          };
        } else {
          shell.log({from: 'dp.app.pickramu.err', message: 'Error: Failed to fetch the content', level: 'error'});
        }
      } catch (e) {
        shell.log({from: 'dp.app.pickramu.err', message: 'Error: ' + e, level: 'error'});
      }
    }
  };

  // Initialize parallax effects for pickramu elements
  if (window.parallaxManager) {
    const backBtn = document.getElementById('pickramu-back-btn');
    const loadBtn = document.getElementById('pickramu-load-btn');
    const tabButtons = document.querySelectorAll('#tab-pickramu, #tab-eguide');
    const selectDropdown = document.getElementById('pickramu-unit-select');
    const selectCard = document.querySelector('.pickramu-select-card');
    
    if (backBtn) {
      window.parallaxManager.addParallaxEffects(backBtn, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: true
      });
    }
    
    if (loadBtn) {
      window.parallaxManager.addParallaxEffects(loadBtn, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: true
      });
    }
    
    tabButtons.forEach(btn => {
      window.parallaxManager.addParallaxEffects(btn, {
        hover: true,
        mouse: false,
        touch: true,
        ripple: true
      });
    });
    
    if (selectDropdown) {
      window.parallaxManager.addParallaxEffects(selectDropdown, {
        hover: true,
        mouse: false,
        touch: false
      });
    }
    
    if (selectCard) {
      window.parallaxManager.addParallaxEffects(selectCard, {
        hover: true,
        mouse: true,
        touch: false
      });
    }
    
    shell.log({from: 'dp.app.pickramu.out', message: 'PickramuApp: Parallax effects initialized', level: 'info'});
  }
} 