/* 
Pickramu
The Pickramu is a language for creating teaching materials for Deep-School.
version:0.0.4
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
