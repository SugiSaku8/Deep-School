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
    '            if (nextBtn.dataset.scriptBound) return;\n' +
    '            nextBtn.dataset.scriptBound = "true";\n' +
    '            console.log("Re-executing script for next button:", nextBtn.id);\n' +
    '            const scripts = document.querySelectorAll("script");\n' +
    '            for (let i = 0; i < scripts.length; i++) {\n' +
    '              const script = scripts[i];\n' +
    '              if (script.textContent.includes(`const element = document.getElementById(\"${nextBtn.id}\")`)) {\n' +
    '                try {\n' +
    '                  nextBtn.onclick = null;\n' +
    '                  const newScript = document.createElement("script");\n' +
    '                  newScript.textContent = script.textContent;\n' +
    '                  document.body.appendChild(newScript);\n' +
    '                } catch (e) {\n' +
    '                  console.error("Error re-executing script for next button:", nextBtn.id, e);\n' +
    '                }\n' +
    '                break;\n' +
    '              }\n' +
    '            }\n' +
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

function generateNextButtonScript(buttonId) {
  return (
    '\n<script>\n(function() {\n' +
    '  function initNextButton() {\n' +
    '    const button = document.getElementById("' + buttonId + '");\n' +
    '    if (!button) {\n' +
    '      console.error("Next button not found.");\n' +
    '      return;\n' +
    '    }\n' +
    '    button.onclick = function() {\n' +
    '      console.log("Next button clicked:", buttonId);\n' +
    '      // Add logic for next button click\n' +
    '    };\n' +
    '  }\n' +
    '  initNextButton();\n' +
    '  if (document.readyState === "loading") {\n' +
    '    document.addEventListener("DOMContentLoaded", initNextButton);\n' +
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
    let html = `<script>\n(function() {\n  function initScript() {\n    const element = document.getElementById("${scriptOn}");\n    if (element) {\n      element.onclick = null;\n      element.onclick = function() {\n        ${scriptContent}\n        /* 自動スクロール: 表示された次のブロックへスムーズに移動 */\n        setTimeout(function() {\n          const firstVisible = document.querySelector('#content > div[id^="n"]:not([style*="display: none"])');\n          if (firstVisible) {\n            firstVisible.scrollIntoView({ behavior: 'smooth', block: 'start' });\n          }\n        }, 20);\n      };\n    }\n  }\n  initScript();\n  if (document.readyState === 'loading') {\n    document.addEventListener('DOMContentLoaded', initScript);\n  }\n})();\n</script>\n`;
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
                <option value="jla/math/式の計算/1節/1.用語/1.html">数学: 式の計算・1節・用語 (1)</option>
                <option value="jla/math/式の計算/1節/1.用語/2.html">数学: 式の計算・1節・用語 (2)</option>
                <option value="jla/math/式の計算/1節/2.加法・減法/1.html">数学: 式の計算・1節・加法・減法 (1)</option>
                <option value="jla/math/式の計算/1節/2.加法・減法/2.html">数学: 式の計算・1節・加法・減法 (2)</option>
                <option value="jla/math/式の計算/1節/3.分配法則・分数/1.html">数学: 式の計算・1節・分配法則・分数 (1)</option>
                <option value="jla/math/式の計算/1節/3.分配法則・分数/2.html">数学: 式の計算・1節・分配法則・分数 (2)</option>
                <option value="jla/math/式の計算/1節/3.分配法則・分数/3.html">数学: 式の計算・1節・分配法則・分数 (3)</option>
                <option value="jla/math/式の計算/1節/4.乗法・除法/1.html">数学: 式の計算・1節・乗法・除法 (1)</option>
                <option value="jla/math/式の計算/1節/4.乗法・除法/2.html">数学: 式の計算・1節・乗法・除法 (2)</option>
                <option value="jla/math/式の計算/1節/5.式の値/1.html">数学: 式の計算・1節・式の値 (1)</option>
                <option value="jla/math/式の計算/1節/5.式の値/2.html">数学: 式の計算・1節・式の値 (2)</option>
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
  document.getElementById('pickramu-load-btn').onclick = () => {
    const select = document.getElementById('pickramu-unit-select');
    if (!select) return;

    const path = select.value.replace(/\.(txt|md)$/i, '.html');
    const baseHtmlPath = 'https://sugisaku8.github.io/Deep-School/Pickramu/data/';
    document.getElementById('pickramu_iframe').src = baseHtmlPath + path;
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