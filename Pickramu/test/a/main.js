

class TemplateConverter {
    constructor() {
        this.htmlContent = [];
        this.currentTag = null;
    }

    convert(templateStr) {
        const configMatch = templateStr.match(/@config \[(open)\]\s*name ([^\\]+)\s*ver ([^\\]+)/);
        const styleMatch = templateStr.match(/@style \[(open)\]\s*(.+?)@style \[(close)\]/s);
        const contentMatches = [...templateStr.matchAll(/@tag (\w+) \[(open)\](.+?)@tag \[\w+ \[(close)\]/gs)];

        let htmlHeader = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
`;

        if (styleMatch) {
            htmlHeader += styleMatch[2].trim() + "\n";
        }
        htmlHeader += "</style>\n</head><body>";

        let contentHtml = '';
        for (const match of contentMatches) {
            const [_, tagId, content] = match;
            
            const btnMatch = content.match(/@btn id=(\w+) ([^\\]+)/);
            
            let tagContent = `<div id="${tagId}">\n`;
            
            if (btnMatch) {
                const [, btnId, btnText] = btnMatch;
                tagContent += `    <button id="${btnId}">${btnText}</button>\n`;
            }
            
            tagContent += '    ' + content.replace(btnMatch?.[0], '').trim() + '\n';
            tagContent += '</div>\n\n';
            
            contentHtml += tagContent;
        }

        const scriptMatch = templateStr.match(/@script on=(\w+) \[(open)\](.+?)@script \[(close)\]/s);
        let scriptHtml = '';
        if (scriptMatch) {
            scriptHtml = `<script>${scriptMatch[2]}</script>`;
        }

        this.htmlContent = [
            htmlHeader,
            contentHtml,
            scriptHtml,
            '</body></html>'
        ];

        return this.htmlContent.join('\n');
    }
}