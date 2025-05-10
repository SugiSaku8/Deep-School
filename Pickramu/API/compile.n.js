function convertToHtml(inputText) {
    let outputHtml = "";
    const lines = inputText.split("\n");
    let i = 0;
  
    while (i < lines.length) {
      const line = lines[i].trim();
  
      // Handle @tag blocks
      let tagMatch = line.match(/@tag\s+(\w+)\s+\[open\]/);
      if (tagMatch) {
        const tagId = tagMatch[1];
        outputHtml += `<div id="${tagId}">\n`;
        i++;
        let contentLines = [];
        while (i < lines.length && !lines[i].match(/@tag\s+\w+\s+\[close\]/)) {
          contentLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) {
          outputHtml += contentLines.join("\n") + "\n";
          outputHtml += `</div>\n`; // Corrected closing tag
        } else {
          console.error("Error: Missing closing tag");
          return null;
        }
        i++;
        continue;
      }
  
      // Handle @btn tags
      let btnMatch = line.match(/@btn\s+id=(\w+)\s+(.+)/);
      if (btnMatch) {
        const btnId = btnMatch[1];
        const btnContent = btnMatch[2];
        outputHtml += `<button id="${btnId}">${btnContent}</button>\n`;
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
  
  // Example usage:
  const inputText = `
  @tag n1 [open]
  @tag question [open]
  約10万年前ごろのものと見られる人類の痕跡が日本列島から見つかりました。
  この頃の人類は、動物を狩って生活していました。
  @tag question [close]
  @btn id=btn1 次へ
  @tag n1 [close]
  @tag question [open]
  約 1 万年前、日本列島が大陸から分離しました。
  紀元前 3000 年ごろ、稲作が日本列島に伝わりました。
  @tag question [close]
  @btn id=btn2 次へ
  @script on=btn1 [open]
  dom.Tag("n1").style.display('none','auto');
  dom.Tag("n2").style.display('block','auto');
  @script [close]
  @script on=btn2 [open]
  dom.back();
  @script [close]
  `;
  
  const htmlOutput = convertToHtml(inputText);
  console.log(htmlOutput);