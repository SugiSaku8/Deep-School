/* 
Pickramu
The Pickramu is a language for creating teaching materials for Deep-School.
version:1.0.31
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
        outputHtml += `  // Wait for DOM to be ready\n`;
        outputHtml += `  function initAnswerSystem() {\n`;
        outputHtml += `    console.log("Initializing answer system for ${inputId} -> ${futterId}");\n`;
        outputHtml += `    const input = document.getElementById("${inputId}_input");\n`;
        outputHtml += `    const button = document.getElementById("${buttonId}");\n`;
        outputHtml += `    const futterElement = document.getElementById("${futterId}");\n`;
        outputHtml += `    \n`;
        outputHtml += `    console.log("Elements found:", { input: !!input, button: !!button, futter: !!futterElement });\n`;
        outputHtml += `    \n`;
        outputHtml += `    if (!input || !button || !futterElement) {\n`;
        outputHtml += `      console.error("Required elements not found:", { input: !!input, button: !!button, futter: !!futterElement });\n`;
        outputHtml += `      return;\n`;
        outputHtml += `    }\n`;
        outputHtml += `    \n`;
        outputHtml += `    // Get the answer content that was stored during compilation\n`;
        outputHtml += `    const answerContent = ${JSON.stringify(answers[futterId] || "")};\n`;
        outputHtml += `    console.log("Answer content for ${futterId}:", answerContent);\n`;
        outputHtml += `    \n`;
        outputHtml += `    function checkAnswer() {\n`;
        outputHtml += `      console.log("checkAnswer function called");\n`;
        outputHtml += `      const userAnswer = input.value.trim();\n`;
        outputHtml += `      console.log("User answer:", userAnswer);\n`;
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
        outputHtml += `      console.log("Expected answer:", expectedAnswer);\n`;
        outputHtml += `      \n`;
        outputHtml += `      // Check if user provided an answer\n`;
        outputHtml += `      if (!userAnswer) {\n`;
        outputHtml += `        alert("答えを入力してください。");\n`;
        outputHtml += `        input.focus();\n`;
        outputHtml += `        return;\n`;
        outputHtml += `      }\n`;
        outputHtml += `      \n`;
        outputHtml += `      // If no expected answer found, just show the answer content\n`;
        outputHtml += `      if (!expectedAnswer) {\n`;
        outputHtml += `        console.log("No expected answer found, showing answer content");\n`;
        outputHtml += `        document.getElementById("${inputId}").style.display = "none";\n`;
        outputHtml += `        document.getElementById("${futterId}").style.display = "block";\n`;
        outputHtml += `        return;\n`;
        outputHtml += `      }\n`;
        outputHtml += `      \n`;
        outputHtml += `      // Check if answer is correct (case-insensitive, trim whitespace)\n`;
        outputHtml += `      const isCorrect = userAnswer.toLowerCase().trim() === expectedAnswer.toLowerCase().trim();\n`;
        outputHtml += `      console.log("Answer check:", { userAnswer, expectedAnswer, isCorrect });\n`;
        outputHtml += `      \n`;
        outputHtml += `      if (isCorrect) {\n`;
        outputHtml += `        console.log("Correct answer!");\n`;
        outputHtml += `        // Show correct answer\n`;
        outputHtml += `        document.getElementById("${inputId}").style.display = "none";\n`;
        outputHtml += `        document.getElementById("${futterId}").style.display = "block";\n`;
        outputHtml += `      } else {\n`;
        outputHtml += `        console.log("Incorrect answer");\n`;
        outputHtml += `        // Show error message with retry option\n`;
        outputHtml += `        const retry = confirm("不正解です。\\n\\nあなたの答え: " + userAnswer + "\\n正解: " + expectedAnswer + "\\n\\nもう一度試しますか？");\n`;
        outputHtml += `        if (retry) {\n`;
        outputHtml += `          input.value = "";\n`;
        outputHtml += `          input.focus();\n`;
        outputHtml += `        }\n`;
        outputHtml += `      }\n`;
        outputHtml += `    }\n`;
        outputHtml += `    \n`;
        outputHtml += `    // Button click handler\n`;
        outputHtml += `    console.log("Setting up button click handler for button ${buttonId}");\n`;
        outputHtml += `    button.onclick = checkAnswer;\n`;
        outputHtml += `    \n`;
        outputHtml += `    // Enter key handler\n`;
        outputHtml += `    console.log("Setting up Enter key handler for input ${inputId}_input");\n`;
        outputHtml += `    input.addEventListener("keypress", function(e) {\n`;
        outputHtml += `      if (e.key === "Enter") {\n`;
        outputHtml += `        console.log("Enter key pressed");\n`;
        outputHtml += `        checkAnswer();\n`;
        outputHtml += `      }\n`;
        outputHtml += `    });\n`;
        outputHtml += `    \n`;
        outputHtml += `    console.log("Answer system initialized for ${inputId} -> ${futterId}");\n`;
        outputHtml += `  }\n`;
        outputHtml += `  \n`;
        outputHtml += `  // Try to initialize immediately, then on DOMContentLoaded\n`;
        outputHtml += `  console.log("Calling initAnswerSystem immediately");\n`;
        outputHtml += `  initAnswerSystem();\n`;
        outputHtml += `  if (document.readyState === 'loading') {\n`;
        outputHtml += `    console.log("Document still loading, adding DOMContentLoaded listener");\n`;
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
                <option value="test-answer.md">テスト用教材（回答システム）</option>
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
        <iframe id="pickramu_iframe" style="width:100%; height:70vh; border:none; border-radius:8px; background:#ffffff; overflow-y: auto;"></iframe>
      </div>
      <div id="pickramu-eguide-area" style="display:none;">
        <iframe src="eguide.html" style="width:100%; height:70vh; border:none; border-radius:8px; background:#ffffff; overflow-y: auto;"></iframe>
      </div>
    </div>
    
    <style>
      .page-container {
        height: 100vh;
        overflow-y: auto;
        padding: 20px;
        box-sizing: border-box;
        background: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .pickramu-select-container {
        margin-bottom: 2rem;
        display: flex;
        justify-content: center;
      }
      
      .pickramu-select-card {
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #e5e5e7;
        padding: 2rem;
        max-width: 600px;
        width: 100%;
        color: #1d1d1f;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      .pickramu-select-title {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 1.5rem 0;
        color: #1d1d1f;
      }
      
      .pickramu-select-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
      }
      
      .pickramu-select-label {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 1rem;
        color: #86868b;
        margin-bottom: 0.5rem;
      }
      
      .pickramu-select-dropdown {
        background: #ffffff;
        border: 1px solid #d2d2d7;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        color: #1d1d1f;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 300px;
        text-align: center;
      }
      
      .pickramu-select-dropdown:focus {
        outline: none;
        border-color: #007aff;
        box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
      }
      
      .pickramu-select-dropdown:hover {
        border-color: #007aff;
      }
      
      .pickramu-select-dropdown option {
        background: #ffffff;
        color: #1d1d1f;
        padding: 0.5rem;
      }
      
      .pickramu-load-button {
        background: #007aff;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 1rem;
        font-weight: 500;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 160px;
        justify-content: center;
      }
      
      .pickramu-load-button:hover {
        background: #0056cc;
        transform: translateY(-1px);
      }
      
      .pickramu-load-button:active {
        background: #004499;
        transform: translateY(0);
      }
      
      .button-text {
        font-size: 1rem;
      }
      
      .button-icon {
        font-size: 1rem;
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
        
        .pickramu-select-title {
          font-size: 1.3rem;
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
    if (select) {
      const path = select.value;
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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #333;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              min-height: 100vh;
              padding: 20px;
              margin: 0;
              overflow-y: auto;
              background: #ffffff;
            }
            #red {
              color: #ff3b30;
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
              color: #ff3b30;
            }
            #content .aliceblue {
              color: #f0f8ff;
            }
            #content .antiquewhite {
              color: #faebd7;
            }
            #content .aqua {
              color: #00ffff;
            }
            #content .aquamarine {
              color: #7fffd4;
            }
            #content .azure {
              color: #f0ffff;
            }
            #content .beige {
              color: #f5f5dc;
            }
            #content .bisque {
              color: #ffe4c4;
            }
            #content .black {
              color: #000000;
            }
            #content .blanchedalmond {
              color: #ffebcd;
            }
            #content .blue {
              color: #0000ff;
            }
            #content .blueviolet {
              color: #8a2be2;
            }
            #content .brown {
              color: #a52a2a;
            }
            #content .burlywood {
              color: #deb887;
            }
            #content .cadetblue {
              color: #5f9ea0;
            }
            #content .chartreuse {
              color: #7fff00;
            }
            #content .chocolate {
              color: #d2691e;
            }
            #content .coral {
              color: #ff7f50;
            }
            #content .cornflowerblue {
              color: #6495ed;
            }
            #content .cornsilk {
              color: #fff8dc;
            }
            #content .crimson {
              color: #dc143c;
            }
            #content .cyan {
              color: #00ffff;
            }
            #content .darkblue {
              color: #00008b;
            }
            #content .darkcyan {
              color: #008b8b;
            }
            #content .darkgoldenrod {
              color: #b8860b;
            }
            #content .darkgray {
              color: #a9a9a9;
            }
            #content .darkgreen {
              color: #006400;
            }
            #content .darkkhaki {
              color: #bdb76b;
            }
            #content .darkmagenta {
              color: #8b008b;
            }
            #content .darkolivegreen {
              color: #556b2f;
            }
            #content .darkorange {
              color: #ff8c00;
            }
            #content .darkorchid {
              color: #9932cc;
            }
            #content .darkred {
              color: #8b0000;
            }
            #content .darksalmon {
              color: #e9967a;
            }
            #content .darkseagreen {
              color: #8fbc8f;
            }
            #content .darkslateblue {
              color: #483d8b;
            }
            #content .darkslategray {
              color: #2f4f4f;
            }
            #content .darkturquoise {
              color: #00ced1;
            }
            #content .darkviolet {
              color: #9400d3;
            }
            #content .deeppink {
              color: #ff1493;
            }
            #content .deepskyblue {
              color: #00bfff;
            }
            #content .dimgray {
              color: #696969;
            }
            #content .dodgerblue {
              color: #1e90ff;
            }
            #content .firebrick {
              color: #b22222;
            }
            #content .floralwhite {
              color: #fffaf0;
            }
            #content .forestgreen {
              color: #228b22;
            }
            #content .fuchsia {
              color: #ff00ff;
            }
            #content .gainsboro {
              color: #dcdcdc;
            }
            #content .ghostwhite {
              color: #f8f8ff;
            }
            #content .gold {
              color: #ffd700;
            }
            #content .goldenrod {
              color: #daa520;
            }
            #content .gray {
              color: #808080;
            }
            #content .green {
              color: #008000;
            }
            #content .greenyellow {
              color: #adff2f;
            }
            #content .honeydew {
              color: #f0fff0;
            }
            #content .hotpink {
              color: #ff69b4;
            }
            #content .indianred {
              color: #cd5c5c;
            }
            #content .indigo {
              color: #4b0082;
            }
            #content .ivory {
              color: #fffff0;
            }
            #content .khaki {
              color: #f0e68c;
            }
            #content .lavender {
              color: #e6e6fa;
            }
            #content .lavenderblush {
              color: #fff0f5;
            }
            #content .lawngreen {
              color: #7cfc00;
            }
            #content .lemonchiffon {
              color: #fffacd;
            }
            #content .lightblue {
              color: #add8e6;
            }
            #content .lightcoral {
              color: #f08080;
            }
            #content .lightcyan {
              color: #e0ffff;
            }
            #content .lightgoldenrodyellow {
              color: #fafad2;
            }
            #content .lightgray {
              color: #d3d3d3;
            }
            #content .lightgreen {
              color: #90ee90;
            }
            #content .lightpink {
              color: #ffb6c1;
            }
            #content .lightsalmon {
              color: #ffa07a;
            }
            #content .lightseagreen {
              color: #20b2aa;
            }
            #content .lightskyblue {
              color: #87cefa;
            }
            #content .lightslategray {
              color: #778899;
            }
            #content .lightsteelblue {
              color: #b0c4de;
            }
            #content .lightyellow {
              color: #ffffe0;
            }
            #content .lime {
              color: #00ff00;
            }
            #content .limegreen {
              color: #32cd32;
            }
            #content .linen {
              color: #faf0e6;
            }
            #content .magenta {
              color: #ff00ff;
            }
            #content .maroon {
              color: #800000;
            }
            #content .mediumaquamarine {
              color: #66cdaa;
            }
            #content .mediumblue {
              color: #0000cd;
            }
            #content .mediumorchid {
              color: #ba55d3;
            }
            #content .mediumpurple {
              color: #9370db;
            }
            #content .mediumseagreen {
              color: #3cb371;
            }
            #content .mediumslateblue {
              color: #7b68ee;
            }
            #content .mediumspringgreen {
              color: #00fa9a;
            }
            #content .mediumturquoise {
              color: #48d1cc;
            }
            #content .mediumvioletred {
              color: #c71585;
            }
            #content .midnightblue {
              color: #191970;
            }
            #content .mintcream {
              color: #f5fffa;
            }
            #content .mistyrose {
              color: #ffe4e1;
            }
            #content .moccasin {
              color: #ffe4b5;
            }
            #content .navajowhite {
              color: #ffdead;
            }
            #content .navy {
              color: #000080;
            }
            #content .oldlace {
              color: #fdf5e6;
            }
            #content .olive {
              color: #808000;
            }
            #content .olivedrab {
              color: #6b8e23;
            }
            #content .orange {
              color: #ffa500;
            }
            #content .orangered {
              color: #ff4500;
            }
            #content .orchid {
              color: #da70d6;
            }
            #content .palegoldenrod {
              color: #eee8aa;
            }
            #content .palegreen {
              color: #98fb98;
            }
            #content .paleturquoise {
              color: #afeeee;
            }
            #content .palevioletred {
              color: #db7093;
            }
            #content .papayawhip {
              color: #ffefd5;
            }
            #content .peachpuff {
              color: #ffdab9;
            }
            #content .peru {
              color: #cd853f;
            }
            #content .pink {
              color: #ffc0cb;
            }
            #content .plum {
              color: #dda0dd;
            }
            #content .powderblue {
              color: #b0e0e6;
            }
            #content .purple {
              color: #800080;
            }
            #content .rebeccapurple {
              color: #663399;
            }
            #content .rosybrown {
              color: #bc8f8f;
            }
            #content .royalblue {
              color: #4169e1;
            }
            #content .saddlebrown {
              color: #8b4513;
            }
            #content .salmon {
              color: #fa8072;
            }
            #content .sandybrown {
              color: #f4a460;
            }
            #content .seagreen {
              color: #2e8b57;
            }
            #content .seashell {
              color: #fff5ee;
            }
            #content .sienna {
              color: #a0522d;
            }
            #content .silver {
              color: #c0c0c0;
            }
            #content .skyblue {
              color: #87ceeb;
            }
            #content .slateblue {
              color: #6a5acd;
            }
            #content .slategray {
              color: #708090;
            }
            #content .snow {
              color: #fffafa;
            }
            #content .springgreen {
              color: #00ff7f;
            }
            #content .steelblue {
              color: #4682b4;
            }
            #content .tan {
              color: #d2b48c;
            }
            #content .teal {
              color: #008080;
            }
            #content .thistle {
              color: #d8bfd8;
            }
            #content .tomato {
              color: #ff6347;
            }
            #content .turquoise {
              color: #40e0d0;
            }
            #content .violet {
              color: #ee82ee;
            }
            #content .wheat {
              color: #f5deb3;
            }
            #content .white {
              color: #ffffff;
            }
            #content .whitesmoke {
              color: #f5f5f5;
            }
            #content .yellow {
              color: #ffff00;
            }
            #content .yellowgreen {
              color: #9acd32;
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
              padding: 1.5em;
              background: #f5f5f7;
              border-radius: 12px;
              border: 1px solid #e5e5e7;
            }
            #content .input-box {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 0.8em 1em;
              font-size: 1.6em;
              color: #1d1d1f;
              border: 1px solid #d2d2d7;
              width: 300px;
              text-align: center;
              transition: all 0.2s ease;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
              font-size: 1.2em;
              color: white;
              cursor: pointer;
              transition: all 0.2s ease;
              font-weight: 500;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            #content .button-next:hover {
              background: #0056cc;
              transform: translateY(-1px);
            }
            #content .button-next:active {
              background: #004499;
              transform: translateY(0);
            }
            #content .footer-bar {
              position: absolute;
              bottom: 0;
              width: 100%;
              height: 20px;
              background: #007aff;
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
          console.error("Error: Failed to fetch the content");
        }
      } catch (e) {
        console.error("Error: ", e);
      }
    }
  };
} 