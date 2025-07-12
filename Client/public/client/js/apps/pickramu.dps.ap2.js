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

// --- 教材リスト自動生成用の関数を追加 ---

/**
 * 指定ディレクトリ配下の教材ファイル一覧を取得（再帰的）
 * @param {string} basePath - ルートパス
 * @param {function} callback - (教材リスト) => void
 */
function fetchAllMaterials(basePath, callback) {
  // GitHub Pages上のAPIは使えないため、教材リストは手動で定義 or 別jsonで管理するのが理想
  // ここでは手動でリストアップ（今後自動化も可）
  const materials = [
    // 数学
    { subject: '数学', field: '式の計算', unit: '1.用語', file: 'jla/math/式の計算/1節/1.用語/1.html', title: '数学: 式の計算・1節・用語 (1)' },
    { subject: '数学', field: '式の計算', unit: '1.用語', file: 'jla/math/式の計算/1節/1.用語/2.html', title: '数学: 式の計算・1節・用語 (2)' },
    { subject: '数学', field: '式の計算', unit: '2.加法・減法', file: 'jla/math/式の計算/1節/2.加法・減法/1.html', title: '数学: 式の計算・1節・加法・減法 (1)' },
    { subject: '数学', field: '式の計算', unit: '2.加法・減法', file: 'jla/math/式の計算/1節/2.加法・減法/2.html', title: '数学: 式の計算・1節・加法・減法 (2)' },
    { subject: '数学', field: '式の計算', unit: '3.分配法則・分数', file: 'jla/math/式の計算/1節/3.分配法則・分数/1.html', title: '数学: 式の計算・1節・分配法則・分数 (1)' },
    { subject: '数学', field: '式の計算', unit: '3.分配法則・分数', file: 'jla/math/式の計算/1節/3.分配法則・分数/2.html', title: '数学: 式の計算・1節・分配法則・分数 (2)' },
    { subject: '数学', field: '式の計算', unit: '3.分配法則・分数', file: 'jla/math/式の計算/1節/3.分配法則・分数/3.html', title: '数学: 式の計算・1節・分配法則・分数 (3)' },
    { subject: '数学', field: '式の計算', unit: '4.乗法・除法', file: 'jla/math/式の計算/1節/4.乗法・除法/1.html', title: '数学: 式の計算・1節・乗法・除法 (1)' },
    { subject: '数学', field: '式の計算', unit: '4.乗法・除法', file: 'jla/math/式の計算/1節/4.乗法・除法/2.html', title: '数学: 式の計算・1節・乗法・除法 (2)' },
    { subject: '数学', field: '式の計算', unit: '5.式の値', file: 'jla/math/式の計算/1節/5.式の値/1.html', title: '数学: 式の計算・1節・式の値 (1)' },
    { subject: '数学', field: '式の計算', unit: '5.式の値', file: 'jla/math/式の計算/1節/5.式の値/2.html', title: '数学: 式の計算・1節・式の値 (2)' },
    // 国語
    { subject: '国語', field: '文法', unit: 'unit1', file: 'jla/jp/grammer/unit1/1.html', title: '国語: 文法・unit1 (1)' },
    // 社会（公民）
    { subject: '社会', field: '公民', unit: 'unit1', file: 'jla/ss/civics/unit1/index.html', title: '社会: 公民・unit1' },
    { subject: '社会', field: '公民', unit: 'unit2', file: 'jla/ss/civics/unit2/index.html', title: '社会: 公民・unit2' },
    { subject: '社会', field: '公民', unit: 'unit3', file: 'jla/ss/civics/unit3/index.html', title: '社会: 公民・unit3' },
    { subject: '社会', field: '公民', unit: 'unit4', file: 'jla/ss/civics/unit4/index.html', title: '社会: 公民・unit4' },
    { subject: '社会', field: '公民', unit: 'unit5', file: 'jla/ss/civics/unit5/index.html', title: '社会: 公民・unit5' },
    { subject: '社会', field: '公民', unit: 'unit6', file: 'jla/ss/civics/unit6/index.html', title: '社会: 公民・unit6' },
    // 社会（地理）
    { subject: '社会', field: '地理', unit: 'unit1', file: 'jla/ss/geography/unit1/index.html', title: '社会: 地理・unit1' },
    { subject: '社会', field: '地理', unit: 'unit2', file: 'jla/ss/geography/unit2/index.html', title: '社会: 地理・unit2' },
    { subject: '社会', field: '地理', unit: 'unit3', file: 'jla/ss/geography/unit3/index.html', title: '社会: 地理・unit3' },
    { subject: '社会', field: '地理', unit: 'unit4', file: 'jla/ss/geography/unit4/index.html', title: '社会: 地理・unit4' },
    { subject: '社会', field: '地理', unit: 'unit5', file: 'jla/ss/geography/unit5/index.html', title: '社会: 地理・unit5' },
    { subject: '社会', field: '地理', unit: 'unit6', file: 'jla/ss/geography/unit6/index.html', title: '社会: 地理・unit6' },
    { subject: '社会', field: '地理', unit: 'unit7', file: 'jla/ss/geography/unit7/index.html', title: '社会: 地理・unit7' },
    { subject: '社会', field: '地理', unit: 'unit8', file: 'jla/ss/geography/unit8/index.html', title: '社会: 地理・unit8' },
    { subject: '社会', field: '地理', unit: 'unit9', file: 'jla/ss/geography/unit9/index.html', title: '社会: 地理・unit9' },
    { subject: '社会', field: '地理', unit: 'unit10', file: 'jla/ss/geography/unit10/index.html', title: '社会: 地理・unit10' },
    // 社会（歴史）
    { subject: '社会', field: '歴史', unit: 'unit1', file: 'jla/ss/history/unit1/index.html', title: '社会: 歴史・unit1' },
    { subject: '社会', field: '歴史', unit: 'unit2', file: 'jla/ss/history/unit2/index.html', title: '社会: 歴史・unit2' },
    { subject: '社会', field: '歴史', unit: 'unit3', file: 'jla/ss/history/unit3/index.html', title: '社会: 歴史・unit3' },
    { subject: '社会', field: '歴史', unit: 'unit4', file: 'jla/ss/history/unit4/index.html', title: '社会: 歴史・unit4' },
    { subject: '社会', field: '歴史', unit: 'unit5', file: 'jla/ss/history/unit5/index.html', title: '社会: 歴史・unit5' },
    { subject: '社会', field: '歴史', unit: 'unit6', file: 'jla/ss/history/unit6/index.html', title: '社会: 歴史・unit6' },
    { subject: '社会', field: '歴史', unit: 'unit7', file: 'jla/ss/history/unit7/index.html', title: '社会: 歴史・unit7' },
    { subject: '社会', field: '歴史', unit: 'unit8', file: 'jla/ss/history/unit8/index.html', title: '社会: 歴史・unit8' },
  ];
  callback(materials);
}

// --- UI生成部分の雛形 ---

function renderMaterialSelector(materials, onSelect) {
  // 検索バー＋教科ごとにリスト表示
  return `
    <div class="pickramu-material-search">
      <input type="text" id="material-search-bar" placeholder="教材名・教科・Unitで検索" class="search-bar">
    </div>
    <div class="pickramu-material-list">
      ${['数学','国語','社会'].map(subject => {
        const subjectMaterials = materials.filter(m => m.subject === subject);
        if (!subjectMaterials.length) return '';
        // フィールドごと
        const fields = [...new Set(subjectMaterials.map(m => m.field))];
        return `
          <div class="pickramu-material-subject">
            <h4 class="section-title">${subject}</h4>
            ${fields.map(field => {
              const fieldMaterials = subjectMaterials.filter(m => m.field === field);
              // Unitごと
              const units = [...new Set(fieldMaterials.map(m => m.unit))];
              return `
                <div class="pickramu-material-field">
                  <div class="pickramu-material-field-title">${field}</div>
                  <ul class="pickramu-material-unit-list">
                    ${units.map(unit => {
                      const unitMaterials = fieldMaterials.filter(m => m.unit === unit);
                      return `
                        <li class="pickramu-material-unit">
                          <span class="pickramu-material-unit-title">${unit}</span>
                          <ul class="pickramu-material-file-list">
                            ${unitMaterials.map(mat => `
                              <li><button class="auto-btn pickramu-material-btn" data-file="${mat.file}">${mat.title}</button></li>
                            `).join('')}
                          </ul>
                        </li>
                      `;
                    }).join('')}
                  </ul>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }).join('')}
    </div>
  `;
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

  // 教材リストを取得してUI生成
  fetchAllMaterials('', (materials) => {
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
            <div class="card pickramu-select-card">
              <h3 class="pickramu-select-title">教材選択</h3>
              <div class="pickramu-select-group" id="pickramu-material-selector-area">
                <!-- 教材リスト＋検索バーがここに入る -->
                ${renderMaterialSelector(materials)}
              </div>
            </div>
          </div>
          <iframe id="pickramu_iframe" class="pickramu-iframe"></iframe>
        </div>
        <div id="pickramu-eguide-area" class="pickramu-eguide-area" style="display:none;">
          <iframe src="eguide.html" class="pickramu-iframe"></iframe>
        </div>
      </div>
      
      <style>
        /* Pickramu専用スタイル - 他のアプリと統一 */
        .pickramu-page {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          min-height: 100vh;
          box-sizing: border-box;
        }
        
        .pickramu-tabs {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 20px;
        }
        
        .pickramu-tabs .auto-btn {
          background: white;
          color: #222;
          border: none;
          border-radius: 15px;
          padding: 15px 40px;
          font-size: 1.2em;
          margin: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .pickramu-tabs .auto-btn:hover,
        .pickramu-tabs .auto-btn.active {
          background: #007bff;
          color: #fff;
        }
        
        .pickramu-work-area {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          margin-top: 20px;
        }
        
        .pickramu-select-container {
          flex: 0 0 320px;
          max-width: 340px;
          min-width: 260px;
        }
        
        .pickramu-select-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e5e5e7;
          padding: 2rem;
          width: 100%;
          color: #1d1d1f;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .pickramu-select-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #1d1d1f;
        }
        
        .pickramu-material-search {
          margin-bottom: 1rem;
        }
        
        .pickramu-material-search .search-bar {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ccc;
          border-radius: 10px;
          font-size: 1.1em;
          background: #fff;
          box-sizing: border-box;
        }
        
        .pickramu-material-search .search-bar:focus {
          outline: none;
          border-color: #87c1ff;
          box-shadow: 0 0 0 3px rgba(135, 193, 255, 0.3);
        }
        
        .pickramu-material-list {
          max-height: 60vh;
          overflow-y: auto;
          text-align: left;
        }
        
        .pickramu-material-subject {
          margin-bottom: 1.5rem;
        }
        
        .pickramu-material-subject .section-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #007bff;
          margin-bottom: 0.8rem;
          padding-bottom: 0.3rem;
          border-bottom: 2px solid #e5e5e7;
        }
        
        .pickramu-material-field {
          margin-bottom: 1rem;
        }
        
        .pickramu-material-field-title {
          font-size: 1rem;
          font-weight: 500;
          color: #333;
          margin-bottom: 0.5rem;
          padding-left: 0.5rem;
        }
        
        .pickramu-material-unit-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .pickramu-material-unit {
          margin-bottom: 0.8rem;
          padding-left: 1rem;
        }
        
        .pickramu-material-unit-title {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
          display: block;
          margin-bottom: 0.3rem;
        }
        
        .pickramu-material-file-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .pickramu-material-file-list li {
          margin-bottom: 0.3rem;
        }
        
        .pickramu-material-btn {
          background: white;
          color: #222;
          border: none;
          border-radius: 15px;
          padding: 8px 16px;
          font-size: 0.9em;
          width: 100%;
          text-align: left;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .pickramu-material-btn:hover {
          background: #007bff;
          color: #fff;
        }
        
        .pickramu-iframe {
          flex: 1 1 0%;
          min-width: 0;
          height: 70vh;
          border: none;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(44,180,173,0.08);
          background: transparent;
          transition: box-shadow 0.2s;
        }
        
        .pickramu-eguide-area {
          width: 100%;
          height: 70vh;
        }
        
        .pickramu-eguide-area .pickramu-iframe {
          width: 100%;
          height: 100%;
        }
        
        /* スクロールバーのスタイル */
        .pickramu-material-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .pickramu-material-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .pickramu-material-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .pickramu-material-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* レスポンシブデザイン */
        @media (max-width: 768px) {
          .pickramu-work-area {
            flex-direction: column;
            gap: 16px;
          }
          
          .pickramu-select-container {
            flex: none;
            max-width: 100%;
            min-width: 0;
          }
          
          .pickramu-iframe {
            height: 50vh;
          }
          
          .pickramu-tabs {
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .pickramu-tabs .auto-btn {
            padding: 12px 24px;
            font-size: 1em;
          }
        }
      </style>
    `;

    // 戻るボタン
    document.getElementById('pickramu-back-btn').onclick = () => shell.loadApp('menu');

    // タブ切り替え
    document.getElementById('tab-pickramu').onclick = () => {
      document.getElementById('pickramu-work-area').style.display = 'flex';
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

    // 教材ボタン押下でiframeに教材をロード
    const baseHtmlPath = 'https://sugisaku8.github.io/Deep-School/client/Pickramu/data/';
    document.querySelectorAll('.pickramu-material-btn').forEach(btn => {
      btn.onclick = (e) => {
        const file = btn.getAttribute('data-file');
        document.getElementById('pickramu_iframe').src = baseHtmlPath + file;
      };
    });

    // 検索バー機能
    const searchBar = document.getElementById('material-search-bar');
    if (searchBar) {
      searchBar.addEventListener('input', (e) => {
        const keyword = searchBar.value.trim().toLowerCase();
        const filtered = materials.filter(m =>
          m.title.toLowerCase().includes(keyword) ||
          m.subject.toLowerCase().includes(keyword) ||
          m.field.toLowerCase().includes(keyword) ||
          m.unit.toLowerCase().includes(keyword)
        );
        document.getElementById('pickramu-material-selector-area').innerHTML = renderMaterialSelector(filtered);
        // 再度教材ボタンにイベントを付与
        document.querySelectorAll('.pickramu-material-btn').forEach(btn => {
          btn.onclick = (e) => {
            const file = btn.getAttribute('data-file');
            document.getElementById('pickramu_iframe').src = baseHtmlPath + file;
          };
        });
      });
    }

    // eGuideタブとエリアを常に非表示にする
    const eguideTab = document.getElementById('tab-eguide');
    const eguideArea = document.getElementById('pickramu-eguide-area');
    if (eguideTab) eguideTab.style.display = 'none';
    if (eguideArea) eguideArea.style.display = 'none';

    // Ctrl+選択でToasterMachineに送信
    const iframe = document.getElementById('pickramu_iframe');
    if (iframe) {
      iframe.onload = () => {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.addEventListener('mouseup', (e) => {
          if (e.ctrlKey) {
            const sel = doc.getSelection();
            const text = sel ? sel.toString().trim() : '';
            if (text) {
              localStorage.setItem('toastermachine_transfer', text);
              window.open('#chat', '_blank');
            }
          }
        });
      };
    }

    // Initialize parallax effects for pickramu elements
    if (window.parallaxManager) {
      const backBtn = document.getElementById('pickramu-back-btn');
      const tabButtons = document.querySelectorAll('#tab-pickramu, #tab-eguide');
      const materialBtns = document.querySelectorAll('.pickramu-material-btn');
      const selectCard = document.querySelector('.pickramu-select-card');
      
      if (backBtn) {
        window.parallaxManager.addParallaxEffects(backBtn, {
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
      
      materialBtns.forEach(btn => {
        window.parallaxManager.addParallaxEffects(btn, {
          hover: true,
          mouse: false,
          touch: true,
          ripple: true
        });
      });
      
      if (selectCard) {
        window.parallaxManager.addParallaxEffects(selectCard, {
          hover: true,
          mouse: true,
          touch: false
        });
      }
      
      shell.log({from: 'dp.app.pickramu.out', message: 'PickramuApp: Parallax effects initialized', level: 'info'});
    }
  });
} 