/* 
Pickramu
The Pickramu is a language for creating teaching materials for Deep-School.
version:1.0.61
Development:Carnaion Studio
License:MPL-2.0
*/

/**
 * Pickramu記法テキストをHTMLに変換するメイン関数
 * @param {string} inputText - Pickramu記法のテキスト
 * @param {object} shell - ログ出力などのためのシェルオブジェクト
 * @returns {string} 変換後のHTML
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
    if (isTagOpen(line)) {
      outputHtml += handleTagOpen(line);
      i++;
      continue;
    }

    // Handle @tag [close] blocks
    if (isTagClose(line)) {
      outputHtml += handleTagClose();
      i++;
      continue;
    }

    // Handle @input blocks with button
    if (isInputOpen(line)) {
      const { html, nextIndex } = handleInputBlock(lines, i, answers);
      outputHtml += html;
      i = nextIndex;
      continue;
    }

    // Handle @futter blocks
    if (isFutter(line)) {
      const { html, nextIndex } = handleFutterBlock(lines, i, answers);
      outputHtml += html;
      i = nextIndex;
      continue;
    }

    // Handle regular @btn tags (without on=^set^)
    if (isBtn(line)) {
      outputHtml += handleBtn(line);
      i++;
      continue;
    }

    // Handle @script blocks
    if (isScriptOpen(line)) {
      const { html, nextIndex } = handleScriptBlock(lines, i, shell);
      outputHtml += html;
      i = nextIndex;
      continue;
    }

    // If no match, treat the line as plain text and replace /br with <br>
    outputHtml += handlePlainText(line);
    i++;
  }

  return outputHtml;
}

/**
 * @param {string} line
 * @returns {boolean}
 * @description @tag [open] 判定
 */
function isTagOpen(line) {
  return /@tag\s+([\w,-]+)?(?:\s+class=([\w,-]+))?\s+\[open\]/.test(line);
}
/**
 * @param {string} line
 * @returns {string}
 * @description @tag [open] のdiv生成
 */
function handleTagOpen(line) {
  const match = line.match(/@tag\s+([\w,-]+)?(?:\s+class=([\w,-]+))?\s+\[open\]/);
  const tagIds = match[1] ? match[1].split(",").map((id) => id.trim()).join(" ") : "";
  const tagClasses = match[2] ? match[2].split(",").map((cls) => cls.trim()).join(" ") : "";
  return `<div id="${tagIds}" class="${tagClasses}">\n`;
}
/**
 * @returns {string}
 * @description @tag [close] のdiv閉じ
 */
function handleTagClose() {
  return `</div>\n`;
}
/**
 * @param {string} line
 * @returns {boolean}
 * @description @tag [close] 判定
 */
function isTagClose(line) {
  return /@tag\s+([\w,-]+)?(?:\s+class=([\w,-]+))?\s+\[close\]/.test(line);
}
/**
 * @param {string} line
 * @returns {boolean}
 * @description @input [open] 判定
 */
function isInputOpen(line) {
  return /@input\s+(\w+)(?:\s+futter=(\w+))?\s+\[open\]/.test(line);
}
/**
 * @param {string[]} lines
 * @param {number} startIndex
 * @param {object} answers
 * @returns {{html: string, nextIndex: number}}
 * @description @inputブロックのHTML生成
 */
function handleInputBlock(lines, startIndex, answers) {
  let i = startIndex;
  const inputMatch = lines[i].trim().match(/@input\s+(\w+)(?:\s+futter=(\w+))?\s+\[open\]/);
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
  let html = `<div class="input-container">\n`;
  html += `<div id="${inputId}">\n`;
  html += `<input type="text" class="input-box" placeholder="答えを入力" id="${inputId}_input">\n`;
  html += inputContent;
  html += `</div>\n`;
  html += `</div>\n`;

  // Add script for button click handler and Enter key support
  if (hasButton && futterId) {
    html += generateAnswerScript(inputId, buttonId, futterId, answers);
  }

  return { html, nextIndex: i + 1 };
}
/**
 * @param {string} inputId
 * @param {string} buttonId
 * @param {string} futterId
 * @param {object} answers
 * @returns {string}
 * @description 回答ボタン用スクリプト生成
 */
function generateAnswerScript(inputId, buttonId, futterId, answers) {
  return (
    '\n<script>\n(function() {\n' +
    '  function initAnswerSystem() {\n' +
    '    const input = document.getElementById("' + inputId + '_input");\n' +
    '    const button = document.getElementById("' + buttonId + '");\n' +
    '    const futterElement = document.getElementById("' + futterId + '");\n' +
    '    const inputContainer = document.getElementById("' + inputId + '");\n' +
    '    if (!input || !button || !futterElement || !inputContainer) {\n' +
    '      console.error("Missing elements for answer system initialization.");\n' +
    '      return;\n' +
    '    }\n' +
    '    const answerContent = ' + JSON.stringify(answers[futterId] || "") + ';\n' +
    '    function checkAnswer() {\n' +
    '      const userAnswer = input.value.trim();\n' +
    '      let expectedAnswer = "";\n' +
    '      if (answerContent) {\n' +
    '        let answerMatch = answerContent.match(/正解は「([^」]+)」/);\n' +
    '        if (answerMatch) {\n' +
    '          expectedAnswer = answerMatch[1].trim();\n' +
    '        } else {\n' +
    '          answerMatch = answerContent.match(/正解:\s*([^\n]+)/);\n' +
    '          if (answerMatch) {\n' +
    '            expectedAnswer = answerMatch[1].trim();\n' +
    '          } else {\n' +
    '            answerMatch = answerContent.match(/答え:\s*([^\n]+)/);\n' +
    '            if (answerMatch) {\n' +
    '              expectedAnswer = answerMatch[1].trim();\n' +
    '            } else {\n' +
    '              answerMatch = answerContent.match(/解答:\s*([^\n]+)/);\n' +
    '              if (answerMatch) {\n' +
    '                expectedAnswer = answerMatch[1].trim();\n' +
    '              } else {\n' +
    '                answerMatch = answerContent.match(/\$([^$]+)\$/);\n' +
    '                if (answerMatch) {\n' +
    '                  expectedAnswer = answerMatch[1].trim();\n' +
    '                } else {\n' +
    '                  const firstLine = answerContent.split("\n")[0];\n' +
    '                  if (firstLine && (firstLine.includes("x") || firstLine.includes("y") || firstLine.includes("=") || firstLine.includes("+"))) {\n' +
    '                    expectedAnswer = firstLine.trim();\n' +
    '                  }\n' +
    '                }\n' +
    '              }\n' +
    '            }\n' +
    '          }\n' +
    '        }\n' +
    '      }\n' +
    '      if (!userAnswer) {\n' +
    '        input.focus();\n' +
    '        return;\n' +
    '      }\n' +
    '      if (!expectedAnswer) {\n' +
    '        inputContainer.style.display = "none";\n' +
    '        futterElement.style.display = "block";\n' +
    '        return;\n' +
    '      }\n' +
    '      const isCorrect = userAnswer.toLowerCase().trim() === expectedAnswer.toLowerCase().trim();\n' +
    '      if (isCorrect) {\n' +
    '        inputContainer.style.display = "none";\n' +
    '        futterElement.style.display = "block";\n' +
    '        setTimeout(() => {\n' +
    '          const nextBtns = futterElement.querySelectorAll("button[id^=\"next\"]");\n' +
    '          nextBtns.forEach(function(nextBtn) {\n' +
    '            console.log("Re-executing script for next button:", nextBtn.id);\n' +
    '            const scripts = document.querySelectorAll("script");\n' +
    '            scripts.forEach(function(script) {\n' +
    '              if (script.textContent.includes(`const element = document.getElementById(\"${nextBtn.id}\")`)) {\n' +
    '                try {\n' +
    '                  const newScript = document.createElement("script");\n' +
    '                  newScript.textContent = script.textContent;\n' +
    '                  document.body.appendChild(newScript);\n' +
    '                } catch (e) {\n' +
    '                  console.error("Error re-executing script for next button:", nextBtn.id, e);\n' +
    '                }\n' +
    '              }\n' +
    '            });\n' +
    '          });\n' +
    '        }, 100);\n' +
    '      } else {\n' +
    '        const retry = window.confirm("不正解です。\n\nあなたの答え: " + userAnswer + "\n正解: " + expectedAnswer + "\n\nもう一度試しますか？");\n' +
    '        if (retry) {\n' +
    '          input.value = "";\n' +
    '          input.focus();\n' +
    '        }\n' +
    '      }\n' +
    '    }\n' +
    '    button.onclick = checkAnswer;\n' +
    '    input.addEventListener("keypress", function(e) {\n' +
    '      if (e.key === "Enter") {\n' +
    '        checkAnswer();\n' +
    '      }\n' +
    '    });\n' +
    '  }\n' +
    '  initAnswerSystem();\n' +
    '  if (document.readyState === "loading") {\n' +
    '    document.addEventListener("DOMContentLoaded", initAnswerSystem);\n' +
    '  }\n' +
    '})();\n</script>\n'
  );
}
/**
 * @param {string[]} lines
 * @param {number} startIndex
 * @param {object} answers
 * @returns {{html: string, nextIndex: number}}
 * @description @futterブロックのHTML生成
 */
function handleFutterBlock(lines, startIndex, answers) {
  let i = startIndex;
  const futterMatch = lines[i].trim().match(/@futter\s+(\w+)\s+futter=(\w+)\s+\[(open|close)\]/);
  const futterId = futterMatch[1];
  let html = "";
  if (futterMatch[3] === "open") {
    html += `<div id="${futterId}" style="display: none;">\n`;
    // Collect answer content for this futter
    i++;
    let answerContent = "";
    while (i < lines.length && !lines[i].match(/@futter.*\[close\]/)) {
      answerContent += lines[i].replace(/\/br/g, "<br>") + "\n";
      i++;
    }
    // Store the answer content
    answers[futterId] = answerContent.trim();
    html += answerContent;
  } else {
    html += `</div>\n`;
  }
  return { html, nextIndex: i + 1 };
}
/**
 * @param {string} line
 * @returns {boolean}
 * @description @futter 判定
 */
function isFutter(line) {
  return /@futter\s+(\w+)\s+futter=(\w+)\s+\[(open|close)\]/.test(line);
}
/**
 * @param {string} line
 * @returns {boolean}
 * @description @btn 判定
 */
function isBtn(line) {
  return /@btn\s+id=([\w,-]+)(?:\s+class=([\w,-]+))?\s+(.+)/.test(line);
}
/**
 * @param {string} line
 * @returns {string}
 * @description @btnボタンのHTML生成
 */
function handleBtn(line) {
  const btnMatch = line.match(/@btn\s+id=([\w,-]+)(?:\s+class=([\w,-]+))?\s+(.+)/);
  const btnIds = btnMatch[1].split(",").map((id) => id.trim()).join(" ");
  const btnClasses = btnMatch[2] ? btnMatch[2].split(",").map((cls) => cls.trim()).join(" ") : "button-next";
  const btnContent = btnMatch[3];
  let html = `<button id="${btnIds}" class="${btnClasses}">${btnContent}</button>\n`;
  if (/次へ|次|Next/i.test(btnContent)) {
    html += `<script>\n(function() {\n  var btn = document.getElementById("${btnIds}");\n  if (btn) {\n    btn.setAttribute('data-priority', 'high');\n    btn.onclick = function() {\n      var doc = document;
      var allInputs = Array.from(doc.querySelectorAll('.input-container input')).filter(i => {
        var container = i.closest('.input-container');
        return container && window.getComputedStyle(container).display !== 'none';
      });
      if (!allInputs.length) return;
      var current = allInputs.findIndex(i => i === doc.activeElement);
      if (current === -1) {
        var next = allInputs.find(i => !i.value);
        if (next) {
          next.focus();
          next.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          allInputs[0].focus();
          allInputs[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (allInputs[current + 1]) {
        allInputs[current + 1].focus();
        allInputs[current + 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
  }
})();\n</script>\n`;
  }
  return html;
}
/**
 * @param {string} line
 * @returns {boolean}
 * @description @script [open] 判定
 */
function isScriptOpen(line) {
  return /@script\s+on=(\w+)\s+\[open\]/.test(line);
}
/**
 * @param {string[]} lines
 * @param {number} startIndex
 * @param {object} shell
 * @returns {{html: string, nextIndex: number}}
 * @description @scriptブロックのHTML生成
 */
function handleScriptBlock(lines, startIndex, shell) {
  let i = startIndex;
  const scriptMatch = lines[i].trim().match(/@script\s+on=(\w+)\s+\[open\]/);
  const scriptOn = scriptMatch[1];
  i++;
  let scriptContentLines = [];
  while (i < lines.length && !lines[i].match(/@script\s+\[close\]/)) {
    scriptContentLines.push(lines[i]);
    i++;
  }
  if (i < lines.length) {
    const scriptContent = scriptContentLines.join("\n");
    let html = `<script>\n(function() {\n  function initScript() {\n    const element = document.getElementById("${scriptOn}");\n    if (element) {\n      element.onclick = null;\n      element.onclick = function() {\n        ${scriptContent}\n      };\n    }\n  }\n  initScript();\n  if (document.readyState === 'loading') {\n    document.addEventListener('DOMContentLoaded', initScript);\n  }\n})();\n</script>\n`;
    return { html, nextIndex: i + 1 };
  } else {
    if (shell && shell.log) shell.log({from: 'dp.app.pickramu.err', message: 'Error: Missing closing script tag', level: 'error'});
    return { html: '', nextIndex: i + 1 };
  }
}
/**
 * @param {string} line
 * @returns {string}
 * @description 通常テキスト行のHTML生成
 */
function handlePlainText(line) {
  return line.replace(/\/br/g, "<br>") + "\n";
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
    <div class="page-container pickramu-page">
      <button class="go-back-button" id="pickramu-back-btn" data-lang-key="back">←</button>
      <h1 class="page-title" data-lang-key="pickramu_work">Pickramu</h1>
      <div class="pickramu-tabs">
        <button class="auto-btn" id="tab-pickramu" data-lang-key="pickramu_tab">教材ワーク</button>
        <button class="auto-btn" id="tab-eguide" data-lang-key="eguide_tab">eGuide</button>
      </div>
      <div id="pickramu-work-area" class="pickramu-work-area">
        <div class="pickramu-select-container">
          <div class="pickramu-select-card">
            <h3 class="pickramu-select-title">教材選択</h3>
            <div class="pickramu-select-group">
              <label for="pickramu-unit-select" class="pickramu-select-label">学習する教材を選択してください：</label>
              <select id="pickramu-unit-select" class="pickramu-select-dropdown">
                <option value="jla/math/式の計算/1節/1.用語/1.txt">数学: 式の計算・1節・用語 (1)</option>
                <option value="jla/math/式の計算/1節/1.用語/2.txt">数学: 式の計算・1節・用語 (2)</option>
                <option value="jla/math/式の計算/1節/2.加法・減法/1.txt">数学: 式の計算・1節・加法・減法 (1)</option>
                <option value="jla/math/式の計算/1節/2.加法・減法/2.txt">数学: 式の計算・1節・加法・減法 (2)</option>
                <option value="jla/math/式の計算/1節/3.分配法則・分数/1.txt">数学: 式の計算・1節・分配法則・分数 (1)</option>
                <option value="jla/math/式の計算/1節/3.分配法則・分数/2.txt">数学: 式の計算・1節・分配法則・分数 (2)</option>
                <option value="jla/math/式の計算/1節/3.分配法則・分数/3.txt">数学: 式の計算・1節・分配法則・分数 (3)</option>
                <option value="jla/math/式の計算/1節/4.乗法・除法/1.txt">数学: 式の計算・1節・乗法・除法 (1)</option>
                <option value="jla/math/式の計算/1節/4.乗法・除法/2.txt">数学: 式の計算・1節・乗法・除法 (2)</option>
                <option value="jla/math/式の計算/1節/5.式の値/1.txt">数学: 式の計算・1節・式の値 (1)</option>
                <option value="jla/math/式の計算/1節/5.式の値/2.txt">数学: 式の計算・1節・式の値 (2)</option>
              </select>
              <button class="pickramu-load-button" id="pickramu-load-btn" data-lang-key="load">
                <span class="button-text">教材を読み込む</span>
              </button>
            </div>
          </div>
        </div>
        <iframe id="pickramu_iframe" class="pickramu-iframe"></iframe>
      </div>
      <div id="pickramu-eguide-area" class="pickramu-eguide-area" style="display:none;">
        <iframe src="eguide.html" class="pickramu-iframe"></iframe>
      </div>
    </div>
  `;

  // 戻るボタン
  document.getElementById('pickramu-back-btn').onclick = () => shell.loadApp('menu');

  // タブ切り替え
  document.getElementById('tab-pickramu').onclick = () => {
    document.getElementById('pickramu-work-area').style.display = 'block';
    document.getElementById('pickramu-eguide-area').style.display = 'none';
    document.getElementById('tab-pickramu').classList.add('active');
    document.getElementById('tab-eguide').classList.remove('active');
    // eguideエリアの高さ等をリセット
    const eguideArea = document.getElementById('pickramu-eguide-area');
    eguideArea.style.height = '';
    eguideArea.style.flex = '';
    eguideArea.style.minWidth = '';
    // workエリアの高さ等もリセット
    const workArea = document.getElementById('pickramu-work-area');
    workArea.style.height = '';
    workArea.style.flex = '';
    workArea.style.minWidth = '';
    // もしiframeの高さが変になっていたらリセット
    const workIframe = document.getElementById('pickramu_iframe');
    if (workIframe) {
      workIframe.style.height = '';
      workIframe.style.minHeight = '';
      workIframe.style.flex = '';
    }
  };
  document.getElementById('tab-eguide').onclick = () => {
    document.getElementById('pickramu-work-area').style.display = 'none';
    document.getElementById('pickramu-eguide-area').style.display = 'block';
    document.getElementById('pickramu-eguide-area').style.height = '70vh';
    document.getElementById('pickramu-eguide-area').style.flex = '1 1 0%';
    document.getElementById('pickramu-eguide-area').style.minWidth = '0';
    document.getElementById('tab-pickramu').classList.remove('active');
    document.getElementById('tab-eguide').classList.add('active');
    // workエリアの高さ等もリセット
    const workArea = document.getElementById('pickramu-work-area');
    workArea.style.height = '';
    workArea.style.flex = '';
    workArea.style.minWidth = '';
    // もしiframeの高さが変になっていたらリセット
    const workIframe = document.getElementById('pickramu_iframe');
    if (workIframe) {
      workIframe.style.height = '';
      workIframe.style.minHeight = '';
      workIframe.style.flex = '';
    }
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
              --bg-color: transparent;
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
              background: transparent;
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
/* ▼▼▼ 追加: ドロップダウン幅調整 ▼▼▼ */
.pickramu-select-dropdown, select.pickramu-select-dropdown {
  max-width: 320px;
  width: 100%;
  min-width: 120px;
  box-sizing: border-box;
  font-size: 1.1em;
  padding: 0.5em 1em;
  border-radius: 8px;
  border: 1px solid #d2d2d7;
  background: #fff;
  color: #222;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
@media (max-width: 600px) {
  .pickramu-select-dropdown, select.pickramu-select-dropdown {
    max-width: 98vw;
    font-size: 1em;
  }
}
/* ▲▲▲ 追加ここまで ▲▲▲ */
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
                          
                          // After showing answer, re-initialize any "次へ" button scripts
                          setTimeout(() => {
                            const nextButtons = iframeDoc.querySelectorAll('button');
                            nextButtons.forEach(nextBtn => {
                              if (nextBtn.textContent.includes('次へ') && nextBtn.style.display !== 'none') {
                                console.log("Found next button after answer:", nextBtn.id);
                                // Re-initialize the script for this button
                                const scripts = iframeDoc.querySelectorAll('script');
                                scripts.forEach(script => {
                                  if (script.textContent.includes(nextBtn.id) && script.textContent.includes('onclick')) {
                                    console.log("Re-initializing script for next button:", nextBtn.id);
                                    try {
                                      const newScript = iframeDoc.createElement('script');
                                      newScript.textContent = script.textContent;
                                      iframeDoc.body.appendChild(newScript);
                                    } catch (e) {
                                      console.error("Error re-initializing script for next button:", e);
                                    }
                                  }
                                });
                              }
                            });
                          }, 100);
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

  // eGuideタブとエリアを常に非表示にする
  const eguideTab = document.getElementById('tab-eguide');
  const eguideArea = document.getElementById('pickramu-eguide-area');
  if (eguideTab) eguideTab.style.display = 'none';
  if (eguideArea) eguideArea.style.display = 'none';
} 