// Pickramu/viewer/script.js から流用
function convertToHtml(inputText) {
  let outputHtml = "";
  const lines = inputText
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"));
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    let tagOpenMatch = line.match(/@tag\s+([\w,-]+)?(?:\s+class=([\w,-]+))?\s+\[open\]/);
    if (tagOpenMatch) {
      const tagIds = tagOpenMatch[1] ? tagOpenMatch[1].split(",").map((id) => id.trim()).join(" ") : "";
      const tagClasses = tagOpenMatch[2] ? tagOpenMatch[2].split(",").map((cls) => cls.trim()).join(" ") : "";
      outputHtml += `<div id="${tagIds}" class="${tagClasses}">\n`;
      i++;
      continue;
    }
    let tagCloseMatch = line.match(/@tag\s+([\w,-]+)?(?:\s+class=([\w,-]+))?\s+\[close\]/);
    if (tagCloseMatch) {
      i++;
      outputHtml += `</div>\n`;
      continue;
    }
    let inputMatch = line.match(/@input\s+(\w+)(?:\s+futter=(\w+))?\s+\[open\]/);
    if (inputMatch) {
      const inputId = inputMatch[1];
      const futterId = inputMatch[2];
      i++;
      let inputContent = "";
      let hasButton = false;
      let buttonId = "";
      while (i < lines.length && !lines[i].match(/@input.*\[close\]/)) {
        const currentLine = lines[i].trim();
        const btnMatch = currentLine.match(/@btn\s+on=\^(\w+)\^/);
        if (btnMatch) {
          hasButton = true;
          buttonId = btnMatch[1];
          inputContent += `<button id="${buttonId}" class="button-next">回答する</button>\n`;
        } else {
          inputContent += currentLine.replace(/\/br/g, "<br>") + "\n";
        }
        i++;
      }
      outputHtml += `<div class="input-container">\n`;
      outputHtml += `<div id="${inputId}">\n`;
      outputHtml += `<input type="text" class="input-box" placeholder="答えを入力">\n`;
      outputHtml += inputContent;
      outputHtml += `</div>\n`;
      outputHtml += `</div>\n`;
      if (hasButton && futterId) {
        outputHtml += `<script>\n`;
        outputHtml += `document.getElementById(\"${buttonId}\").onclick = function() {\n`;
        outputHtml += `  document.getElementById(\"${inputId}\").style.display = \"none\";\n`;
        outputHtml += `  document.getElementById(\"${futterId}\").style.display = \"block\";\n`;
        outputHtml += `}\n`;
        outputHtml += `</script>\n`;
      }
      i++;
      continue;
    }
    let futterMatch = line.match(/@futter\s+(\w+)\s+futter=(\w+)\s+\[(open|close)\]/);
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
    let btnMatch = line.match(/@btn\s+id=([\w,-]+)(?:\s+class=([\w,-]+))?\s+(.+)/);
    if (btnMatch) {
      const btnIds = btnMatch[1].split(",").map((id) => id.trim()).join(" ");
      const btnClasses = btnMatch[2] ? btnMatch[2].split(",").map((cls) => cls.trim()).join(" ") : "button-next";
      const btnContent = btnMatch[3];
      outputHtml += `<button id="${btnIds}" class="${btnClasses}">${btnContent}</button>\n`;
      i++;
      continue;
    }
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
        outputHtml += `document.getElementById(\"${scriptOn}\").onclick = function() {\n`;
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
    outputHtml += line.replace(/\/br/g, "<br>") + "\n";
    i++;
  }
  return outputHtml;
}

fetch("../client/test.md")
  .then((response) => {
    if (!response.ok) throw new Error("Failed to load test.md");
    return response.text();
  })
  .then((inputText) => {
    const htmlOutput = convertToHtml(inputText);
    const styles = `
body{
font-family: \"Noto Sans JP\", sans-serif;
  color: black;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
#content{font-size:1.6em;}
.input-container {display: flex;margin-top: 2em;gap: 1em;}
.input-box {background-color: #a3b1a6;border-radius: 25px;padding: 0.8em 2em;font-size: 1.6em;color: white;border: none;width: 300px;}
.button-next {background-color: #33aaff;border: none;border-radius: 25px;padding: 0.5em 0.8em;font-size: 1.0em;color: white;cursor: pointer;}
`;
    const script = `
const dom = {
  Tag: function (tagName) {
    const element = document.getElementById(tagName);
    return {
      style: {
        display: function (displayValue, important) {
          element.style.display = displayValue;
          if (important === \"auto\") {
            element.style.setProperty(\"display\", displayValue, \"important\");
          }
        },
      },
    };
  },
  back: function() { window.history.back(); }
};
`;
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = `<style>${styles}</style>\n${htmlOutput}<script>${script}</script>`;
  })
  .catch((err) => {
    console.error("Error loading or compiling test.md:", err);
  }); 