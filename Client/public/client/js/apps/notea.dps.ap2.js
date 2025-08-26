// App metadata
export const appMeta = {
  name: "notea",
  title: "Notea",
  icon: "re/ico/notea.png",
};
// App initialization
export function appInit(shell) {
  const root = document.getElementById("app-root");
  if (!root) {
    console.error("NoteaApp: #app-rootが見つかりません");
    return;
  }
  shell.log({
    from: "dp.app.notea.out",
    message: "NoteaApp: 初期化開始",
    level: "info",
  });
  root.innerHTML = `
    <button class="scr-back-button" id="scr-back-btn" data-lang-key="back" aria-label="戻る">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
  <div style="height:100%,width:100%">
  <iframe

  width="100%;"
  height="720px;"
  src="https://sugisaku8.github.io/Deep-School/client/js/apps/notea/index.html">
</iframe>
</div>`;
const backButton = document.getElementById("scr-back-btn");
if (backButton) {
  backButton.onclick = (e) => {
    e.preventDefault();
    shell.loadApp("menu");
  };
  
  // スタイルを直接適用
  backButton.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: #87c1ff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    z-index: 1000;
  `;
  
  // ホバー時のスタイル
  backButton.addEventListener('mouseover', () => {
    backButton.style.backgroundColor = '#6ba7e5';
    backButton.style.transform = 'translateY(-2px)';
  });
  
  // 通常時のスタイルに戻す
  backButton.addEventListener('mouseout', () => {
    backButton.style.backgroundColor = '#87c1ff';
    backButton.style.transform = 'translateY(0)';
  });
  
  // クリック時のスタイル
  backButton.addEventListener('mousedown', () => {
    backButton.style.transform = 'translateY(0)';
    backButton.style.backgroundColor = '#5a9ae0';
  });
  
  backButton.addEventListener('mouseup', () => {
    backButton.style.backgroundColor = '#6ba7e5';
  });
}
 /* root.innerHTML = `
<style>

:root {
    --system-blue: #007AFF;
    --system-red: #FF3B30;
    --system-green: #34C759;
    --system-yellow: #FFCC00;
    --system-gray: #8E8E93;
    --system-background: #F2F2F7;
    --system-background-elevated: #FFFFFF;
    --system-label: #000000;
    --system-separator: #C6C6C8;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
    background-color: var(--system-background);
    color: var(--system-label);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100vh;
    overflow: hidden;
}

.app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.page-indicator {
    font-size: 14px;
    font-weight: 500;
    color: #1c1c1e;
    margin: 0 8px;
    min-width: 50px;
    text-align: center;
}

.toolbar {
    background-color: var(--system-background-elevated);
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--system-separator);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    z-index: 100;
}

.tool-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.tool-button {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--system-label);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tool-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.tool-button.active {
    background-color: rgba(0, 122, 255, 0.1);
    color: var(--system-blue);
}

.tool-button i {
    font-size: 18px;
}

.divider {
    width: 1px;
    height: 24px;
    background-color: var(--system-separator);
    margin: 0 4px;
}

.canvas-container {
    flex: 1;
    position: relative;
    overflow: hidden;
    background-color: white;
    background-image: linear-gradient(45deg, #f5f5f5 25%, transparent 25%),
                      linear-gradient(-45deg, #f5f5f5 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #f5f5f5 75%),
                      linear-gradient(-45deg, transparent 75%, #f5f5f5 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

#drawing-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    touch-action: none;
}

.color-palette {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 16px 0;
    padding: 8px;
    background: #f5f5f7;
    border-radius: 12px;
}

.color-swatch {
    position: relative;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #e0e0e0;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
}

.color-swatch:hover {
    transform: scale(1.15);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
}

.color-swatch.active {
    border-color: #007AFF;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
    transform: scale(1.1);
}

.color-tooltip {
    visibility: hidden;
    width: max-content;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 10px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 12px;
    pointer-events: none;
}

.color-swatch:hover .color-tooltip {
    visibility: visible;
    opacity: 1;
}

.color-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
}

.color-picker {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--system-separator);
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    display: inline-block;
}

.pen-size-picker select {
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px solid var(--system-separator);
    background-color: white;
    font-size: 14px;
    cursor: pointer;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1c1c1e;
}

.close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #8e8e93;
    padding: 0 8px;
    line-height: 1;
}

.modal-body {
    padding: 0;
    flex: 1;
    overflow: hidden;
}

.modal-footer {
    padding: 16px 20px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.file-list-container {
    max-height: 50vh;
    overflow-y: auto;
    padding: 0;
}

.file-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.file-list-item {
    padding: 14px 20px;
    border-bottom: 1px solid #f2f2f7;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s;
}

.file-list-item:hover {
    background-color: #f8f8fa;
}

.file-list-item .file-info {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 12px;
}

.file-list-item .file-name {
    font-weight: 500;
    color: #1c1c1e;
    margin-bottom: 2px;
}

.file-list-item .file-meta {
    font-size: 12px;
    color: #8e8e93;
    display: flex;
    gap: 12px;
}

.file-actions {
    display: flex;
    gap: 8px;
}

.file-action-btn {
    background: none;
    border: none;
    color: #8e8e93;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 16px;
    transition: all 0.2s;
}

.file-action-btn:hover {
    background-color: #f2f2f7;
    color: #007AFF;
}

.file-action-btn.delete:hover {
    color: #FF3B30;
}

.no-notes {
    padding: 40px 20px;
    text-align: center;
    color: #8e8e93;
}


.button {
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.button.primary {
    background-color: #007AFF;
    color: white;
}

.button.primary:hover {
    background-color: #0062cc;
}

.button.secondary {
    background-color: #f2f2f7;
    color: #007AFF;
}

.button.secondary:hover {
    background-color: #e5e5ea;
}

.modal h3 {
    margin-top: 0;
    margin-bottom: 16px;
    color: var(--system-label);
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.modal-actions button {
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid var(--system-separator);
    background-color: var(--system-blue);
    color: white;
    cursor: pointer;
    transition: opacity 0.2s;
}

.modal-actions button:hover {
    opacity: 0.9;
}


.notes-list {
    max-height: 50vh;
    overflow-y: auto;
    margin: 10px 0;
    border: 1px solid var(--system-separator);
    border-radius: 8px;
}

.note-item {
    padding: 12px 16px;
    border-bottom: 1px solid var(--system-separator);
    cursor: pointer;
    transition: background-color 0.2s;
    position: relative;
}

.note-item:last-child {
    border-bottom: none;
}

.note-item:hover {
    background-color: rgba(0, 0, 0, 0.03);
}

.note-title {
    font-weight: 500;
    margin-bottom: 4px;
}

.note-date {
    font-size: 12px;
    color: var(--system-gray);
}

.delete-note {
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    background-color: var(--system-red);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
}

.delete-note:hover {
    opacity: 0.9;
}


.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
}

.notification.success {
    background-color: #34C759;
}

.notification.error {
    background-color: #FF3B30;
}

.notification.info {
    background-color: #007AFF; 
}

.notification.fade-out {
    animation: fadeOut 0.3s ease-out forwards;
}

@keyframes slideIn {
    from {
        transform: translateY(100px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes fadeOut {
    from {
        transform: translateY(0);
        opacity: 1;
    }
    to {
        transform: translateY(20px);
        opacity: 0;
    }
}


.dropdown {
    position: relative;
    display: inline-block;
}

.dropdown-content {
    display: none;
    position: absolute;
    background-color: var(--system-background-elevated);
    min-width: 200px;
    border-radius: 10px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    padding: 8px 0;
    right: 0;
    top: 100%;
    margin-top: 8px;
    border: 1px solid var(--system-separator);
}

.dropdown-content .red-sheet-controls {
    position: absolute;
    top: 80px;
    right: 20px;
    background: rgba(255, 255, 255, 0.95);
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    z-index: 20;
    width: 260px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    transform: translateY(10px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.dropdown-content .red-sheet-controls h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #1c1c1e;
    display: flex;
    align-items: center;
    gap: 8px;
}

.dropdown-content .red-sheet-controls .control-group {
    margin-bottom: 16px;
}

.dropdown-content .red-sheet-controls label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: #636366;
    font-weight: 500;
}

.dropdown-content .red-sheet-controls input[type="color"] {
    width: 100%;
    height: 36px;
    border: 1px solid #d1d1d6;
    border-radius: 8px;
    padding: 4px;
    background: #fff;
    cursor: pointer;
}

.dropdown-content .red-sheet-controls input[type="range"] {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    background: #d1d1d6;
    border-radius: 2px;
    outline: none;
    margin: 12px 0;
}

.dropdown-content .red-sheet-controls input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: #007AFF;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
}

.dropdown-content .red-sheet-controls input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.dropdown-content.show {
    display: block;
}

.dropdown-content.show .red-sheet-controls {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
}

.dropdown-content button {
    width: 100%;
    padding: 8px 16px;
    text-align: left;
    background: none;
    border: none;
    color: var(--system-label);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    transition: background-color 0.2s;
}

.dropdown-content button:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.dropdown-content .divider {
    width: 100%;
    height: 1px;
    background-color: var(--system-separator);
    margin: 4px 0;
}

.file-input {
    display: none;
}

#undo-btn:disabled,
#redo-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.red-sheet {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
    mix-blend-mode: darken;
    opacity: 0.5;
    background-color: #FF3B30;
    display: block;
    transition: opacity 0.2s ease;
}

.red-sheet.hidden {
    opacity: 0;
    pointer-events: none;
}

.red-sheet-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
}

.red-sheet-controls input[type="color"] {
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--system-separator);
    border-radius: 4px;
    cursor: pointer;
}

.red-sheet-controls input[type="range"] {
    width: 100px;
}

.hidden {
    display: none !important;
}

@media (max-width: 768px) {
    .toolbar {
        flex-wrap: wrap;
        padding: 8px;
    }
    
    .tool-group {
        flex-wrap: wrap;
        gap: 4px;
    }
    
    .tool-button {
        width: 32px;
        height: 32px;
    }
    
    .pen-size-picker select {
        padding: 4px 6px;
        font-size: 12px;
    }
    
    .color-swatch {
        width: 20px;
        height: 20px;
    }
    
    .color-picker {
        width: 28px;
        height: 28px;
    }
}
</style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600&display=swap" rel="stylesheet">
    <div class="app-container">
        <header class="toolbar">
            <div class="tool-group">
                <button id="prev-page" class="tool-button" title="前のページ">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span id="page-indicator" class="page-indicator">1/1</span>
                <button id="next-page" class="tool-button" title="次のページ">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <button id="add-page" class="tool-button" title="新しいページを追加">
                    <i class="fas fa-plus"></i>
                </button>
                <div class="divider"></div>
                <button id="pencil-tool" class="tool-button active" title="シャープペンシル">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button id="highlighter-tool" class="tool-button" title="蛍光ペン">
                    <i class="fas fa-highlighter"></i>
                </button>
                <button id="eraser-tool" class="tool-button" title="消しゴム">
                    <i class="fas fa-eraser"></i>
                </button>
                <div class="divider"></div>
                <div class="pen-size-picker">
                    <select id="pen-size" class="select">
                        <option value="0.35">0.35mm</option>
                        <option value="0.5" selected>0.5mm</option>
                        <option value="0.7">0.7mm</option>
                        <option value="1.0">1.0mm</option>
                        <option value="2.5">2.5mm</option>
                        <option value="5.0">5.0mm</option>
                        <option value="10.0">10.0mm</option>
                    </select>
                </div>
                <div class="divider"></div>
                <div class="color-palette">
                    <button class="color-swatch black active" data-color="#000000" title="黒"></button>
                    <button class="color-swatch red" data-color="#FF3B30" title="赤"></button>
                    <button class="color-swatch blue" data-color="#007AFF" title="青"></button>
                    <button class="color-swatch green" data-color="#34C759" title="緑"></button>
                    <button class="color-swatch yellow" data-color="#FFCC00" title="黄"></button>
                    <button id="color-picker" class="color-picker" title="カスタムカラー">
                        <i class="fas fa-sliders-h"></i>
                    </button>
                    <input type="color" id="custom-color" class="hidden" value="#000000">
                </div>
                <div class="divider"></div>
                <button id="red-sheet-toggle" class="tool-button" title="赤シート">
                    <i class="fas fa-square"></i>
                </button>
                <div id="red-sheet-controls" class="red-sheet-controls hidden">
                    <input type="color" id="sheet-color" value="#FF3B30" title="シートの色">
                    <input type="color" id="hidden-color" value="#000000" title="隠す色">
                    <input type="range" id="sheet-opacity" min="0" max="1" step="0.1" value="0.5" title="不透明度">
                </div>
            </div>
            <div class="tool-group">
                <div class="dropdown">
                    <button id="file-menu" class="tool-button" title="ファイル">
                        <i class="fas fa-file"></i>
                    </button>
                    <div class="dropdown-content">
                        <button id="new-note"><i class="fas fa-file"></i> 新規</button>
                        <button id="save-note"><i class="fas fa-save"></i> 保存</button>
                        <button id="export-note"><i class="fas fa-file-export"></i> エクスポート</button>
                        <button id="import-note"><i class="fas fa-file-import"></i> インポート</button>
                        <div class="divider"></div>
                        <button id="clear-canvas"><i class="fas fa-trash-alt"></i> クリア</button>
                    </div>
                </div>
                <div class="divider"></div>
                <button id="undo-btn" class="tool-button" title="元に戻す (Ctrl+Z)">
                    <i class="fas fa-undo"></i>
                </button>
                <button id="redo-btn" class="tool-button" title="やり直し (Ctrl+Shift+Z)">
                    <i class="fas fa-redo"></i>
                </button>
            </div>
        </header>

        <main class="canvas-container">
            <canvas id="drawing-canvas"></canvas>
            <div id="red-sheet" class="red-sheet"></div>
        </main>
    </div>

    <!-- File Explorer Modal -->
    <div id="file-explorer" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>保存されたノート</h3>
                <button class="close-button">&times;</button>
            </div>
            <div class="modal-body">
                <div class="file-list-container">
                    <ul id="note-list" class="file-list">
                        <!-- Note items will be added here dynamically -->
                    </ul>
                </div>
            </div>
            <div class="modal-footer">
                <button id="cancel-explorer" class="button secondary">キャンセル</button>
            </div>
        </div>
    </div>

`;*/
  // Note Data Format:
  // {
  //   version: string,        // App version
  //   metadata: {            // Document metadata
  //     createdAt: string,   // ISO timestamp
  //     updatedAt: string,   // ISO timestamp
  //     title: string,       // Note title
  //     width: number,       // Canvas width
  //     height: number       // Canvas height
  //   },
  //   paths: [               // Array of drawing paths
  //     {
  //       tool: string,      // 'pencil', 'highlighter', 'eraser'
  //       color: string,     // Hex color code
  //       size: number,      // Line width in pixels
  //       points: [          // Array of points
  //         { x: number, y: number },
  //         ...
  //       ]
  //     },
  //     ...
  //   ]
  // }
/*
  // Constants
  const APP_VERSION = "1.0.0";
  const LOCAL_STORAGE_KEY = "noteAppData";
  const DEFAULT_NOTE_TITLE = "無題のノート";

  // State
  let currentNoteId = null;
  let notesList = [];

  // Global variables
  const canvas = document.getElementById("drawing-canvas");
  const ctx = canvas.getContext("2d");
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentColor = "#000000";
  let currentSize = 0.5; // Default pen size in mm
  let currentTool = "pencil";
  let notebook = {
    pages: [
      {
        id: Date.now().toString(),
        paths: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    currentPageIndex: 0,
  };
  let history = [];
  let historyIndex = -1;
  let currentPath = null;

  // UI Elements
  const pencilTool = document.getElementById("pencil-tool");
  const highlighterTool = document.getElementById("highlighter-tool");
  const eraserTool = document.getElementById("eraser-tool");
  const penSizeSelect = document.getElementById("pen-size");
  const colorSwatches = document.querySelectorAll(".color-swatch");
  const customColorInput = document.getElementById("custom-color");
  const colorPicker = document.getElementById("color-picker");
  const redSheetToggle = document.getElementById("red-sheet-toggle");
  const redSheet = document.getElementById("red-sheet");
  const redSheetControls = document.getElementById("red-sheet-controls");
  const sheetColorInput = document.getElementById("sheet-color");
  const hiddenColorInput = document.getElementById("hidden-color");
  const sheetOpacityInput = document.getElementById("sheet-opacity");
  const clearCanvasBtn = document.getElementById("clear-canvas");
  const saveCanvasBtn = document.getElementById("save-canvas");

  // Initialize canvas size
  function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    redrawCanvas();
  }

  // Get current page data
  function getCurrentPage() {
    return notebook.pages[notebook.currentPageIndex];
  }

  // Clear current page
  function clearCurrentPage() {
    if (confirm("現在のページをクリアしますか？この操作は元に戻せません。")) {
      const currentPage = getCurrentPage();
      if (currentPage) {
        currentPage.paths = [];
        currentPage.updatedAt = new Date().toISOString();
        redrawCanvas();
        saveToHistory();
      }
    }
  }

  // Add a new page
  function addNewPage() {
    const newPage = {
      id: Date.now().toString(),
      paths: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    notebook.pages.push(newPage);
    notebook.currentPageIndex = notebook.pages.length - 1;
    updatePageIndicator();
    redrawCanvas();
    saveToHistory();
    showNotification("新しいページを追加しました", "success");
  }

  // Go to specific page
  function goToPage(index) {
    if (index >= 0 && index < notebook.pages.length) {
      notebook.currentPageIndex = index;
      updatePageIndicator();
      redrawCanvas();
    }
  }

  // Update page indicator
  function updatePageIndicator() {
    const indicator = document.getElementById("page-indicator");
    if (indicator) {
      indicator.textContent = `${notebook.currentPageIndex + 1}/${
        notebook.pages.length
      }`;

      const prevBtn = document.getElementById("prev-page");
      const nextBtn = document.getElementById("next-page");

      if (prevBtn) prevBtn.disabled = notebook.currentPageIndex === 0;
      if (nextBtn)
        nextBtn.disabled =
          notebook.currentPageIndex === notebook.pages.length - 1;
    }
  }

  // Redraw all paths on the canvas
  function redrawCanvas() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentPage = getCurrentPage();
    if (!currentPage) return;

    // Create a temporary canvas for drawing
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    // Draw all paths
    currentPage.paths.forEach((path) => {
      if (path.points.length < 2) return;

      tempCtx.beginPath();
      tempCtx.moveTo(path.points[0].x, path.points[0].y);

      for (let i = 1; i < path.points.length; i++) {
        const point = path.points[i];
        tempCtx.lineTo(point.x, point.y);
      }

      if (path.tool === "eraser") {
        tempCtx.globalCompositeOperation = "destination-out";
        tempCtx.strokeStyle = "rgba(0, 0, 0, 1)";
      } else {
        tempCtx.globalCompositeOperation = "source-over";
        tempCtx.strokeStyle = path.color;
        tempCtx.globalAlpha = path.tool === "highlighter" ? 0.4 : 1.0;
      }

      tempCtx.lineWidth = path.size;
      tempCtx.lineCap = "round";
      tempCtx.lineJoin = "round";
      tempCtx.stroke();
      tempCtx.globalAlpha = 1.0;
    });

    // Draw the result to the main canvas
    ctx.drawImage(tempCanvas, 0, 0);
  }

  // Get canvas-relative coordinates
  function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  // Start drawing
  function startDrawing(e) {
    isDrawing = true;
    const { x, y } = getCanvasCoordinates(e);

    lastX = x;
    lastY = y;

    // Create a new path
    currentPath = {
      points: [{ x, y }],
      color: currentColor,
      size: currentSize * (window.devicePixelRatio || 1) * 2,
      tool: currentTool,
      timestamp: Date.now(),
    };

    // Add to current page's paths
    const currentPage = getCurrentPage();
    if (currentPage) {
      currentPage.paths.push(currentPath);
      currentPage.updatedAt = new Date().toISOString();
    }
  }

  // Stop drawing
  function stopDrawing() {
    if (isDrawing) {
      isDrawing = false;
      // Save current state to history when finishing a stroke
      saveToHistory();
    }
  }

  // Draw
  function draw(e) {
    if (!isDrawing) return;

    const { x, y } = getCanvasCoordinates(e);

    // Add point to current path
    currentPath.points.push({ x, y });

    // Save the current notebook and return the saved data
    function saveNote() {
      const savedData = saveNotebook();
      showNotification("ノートを保存しました", "success");
      return savedData;
    }

    // Save current state to history
    function saveToHistory() {
      // Don't save if nothing has changed
      if (
        historyIndex >= 0 &&
        JSON.stringify(history[historyIndex]) === JSON.stringify(notebook.pages)
      ) {
        return;
      }

      // Remove any redo history after current position
      if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
      }

      // Add current state to history
      history.push(JSON.parse(JSON.stringify(notebook.pages)));
      historyIndex++;

      // Limit history size (keep last 50 states)
      if (history.length > 50) {
        history.shift();
        historyIndex--;
      }
    }

    // Stop drawing
    function stopDrawing() {
      if (isDrawing) {
        isDrawing = false;

        // Only add the path if it has more than one point
        if (currentPath.points.length > 1) {
          // Save current state to history before making changes
          saveToHistory();
        }

        currentPath = null;
      }
    }

    // Save the current context state
    ctx.save();

    // Set line style based on tool
    if (currentTool === "eraser") {
      // Use destination-out to make pixels transparent
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0, 0, 0, 1)"; // Color doesn't matter for destination-out
      ctx.lineWidth = currentSize * (window.devicePixelRatio || 1) * 2; // Convert mm to pixels
    } else {
      // For pencil and highlighter, use normal composition
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentSize * (window.devicePixelRatio || 1) * 2; // Convert mm to pixels

      if (currentTool === "highlighter") {
        ctx.globalAlpha = 0.4;
      } else {
        ctx.globalAlpha = 1.0;
      }
    }

    // Draw the line
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Restore the context state
    ctx.restore();

    lastX = x;
    lastY = y;
  }

  // Save the current notebook state to localStorage
  function saveNotebook() {
    const notebookData = {
      pages: notebook.pages,
      currentPageIndex: notebook.currentPageIndex,
      version: "1.0",
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("notebookData", JSON.stringify(notebookData));
    return notebookData;
  }

  // Load notebook from localStorage or data object
  function loadNotebook(data = null) {
    try {
      const savedData = data || localStorage.getItem("notebookData");
      if (savedData) {
        const parsedData =
          typeof savedData === "string" ? JSON.parse(savedData) : savedData;
        if (parsedData.pages && Array.isArray(parsedData.pages)) {
          notebook.pages = parsedData.pages;
          notebook.currentPageIndex = parsedData.currentPageIndex || 0;
          updatePageIndicator();
          redrawCanvas();
          return true;
        }
      }
    } catch (e) {
      console.error("Failed to load notebook:", e);
      showNotification("ノートの読み込みに失敗しました", "error");
    }
    return false;
  }

  // Export notebook to JSON file
  function exportNotebook() {
    const data = saveNotebook();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `notebook-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification("ノートをエクスポートしました", "success");
  }

  // Import notebook from file
  function importNotebook(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (confirm("現在のノートは上書きされます。よろしいですか？")) {
          if (loadNotebook(data)) {
            showNotification("ノートをインポートしました", "success");
          }
        }
      } catch (e) {
        console.error("Failed to import notebook:", e);
        showNotification("無効なファイル形式です", "error");
      }
    };

    reader.onerror = () => {
      showNotification("ファイルの読み込みに失敗しました", "error");
    };

    reader.readAsText(file);
  }

  // Initialize the app
  function init() {
    // Set initial active states
    pencilTool.classList.add("active");
    
    // Initialize canvas and UI
    resizeCanvas();
    initColorSwatches();
    updateRedSheet();
    loadNotebook();
    
    // Add window resize event listener
    window.addEventListener('resize', () => {
      resizeCanvas();
      redrawCanvas();
    });
    
    // Force a redraw after a short delay to ensure everything is loaded
    setTimeout(() => {
      resizeCanvas();
      redrawCanvas();
    }, 100);

    // Set initial pen size
    currentSize = parseFloat(penSizeSelect.value);

    // Initialize drawing tools
    pencilTool.addEventListener("click", () => {
      currentTool = "pencil";
      pencilTool.classList.add("active");
      highlighterTool.classList.remove("active");
      eraserTool.classList.remove("active");
    });

    highlighterTool.addEventListener("click", () => {
      currentTool = "highlighter";
      highlighterTool.classList.add("active");
      pencilTool.classList.remove("active");
      eraserTool.classList.remove("active");
    });

    eraserTool.addEventListener("click", () => {
      currentTool = "eraser";
      eraserTool.classList.add("active");
      pencilTool.classList.remove("active");
      highlighterTool.classList.remove("active");
    });

    // Initialize pen size selector
    penSizeSelect.addEventListener("change", (e) => {
      currentSize = parseFloat(e.target.value);
    });

    // Initialize canvas event listeners
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    // Touch support for mobile devices
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startDrawing(e.touches[0]);
    });

    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      draw(e.touches[0]);
    });

    canvas.addEventListener("touchend", stopDrawing);

    // Initialize page navigation
    document.getElementById("prev-page").addEventListener("click", () => {
      if (notebook.currentPageIndex > 0) {
        goToPage(notebook.currentPageIndex - 1);
      }
    });

    document.getElementById("next-page").addEventListener("click", () => {
      if (notebook.currentPageIndex < notebook.pages.length - 1) {
        goToPage(notebook.currentPageIndex + 1);
      }
    });

    document.getElementById("add-page").addEventListener("click", addNewPage);

    // Check if a color is dark
    function isColorDark(color) {
      // Convert hex to RGB
      let r, g, b;
      if (color.startsWith("#")) {
        const hex = color.substring(1);
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      } else if (color.startsWith("rgb")) {
        const rgb = color.match(/\d+/g);
        r = parseInt(rgb[0]);
        g = parseInt(rgb[1]);
        b = parseInt(rgb[2]);
      } else {
        // Default to dark if color format is unknown
        return true;
      }

      // Calculate relative luminance (perceived brightness)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    }

    // Initialize color swatches
    function initColorSwatches() {
      // Set up color swatch selection
      colorSwatches.forEach((swatch) => {
        const color = swatch.dataset.color || swatch.style.backgroundColor;
        swatch.setAttribute("title", color);
        swatch.style.backgroundColor = color;

        swatch.addEventListener("click", (e) => {
          e.stopPropagation();
          // Remove active class from all swatches
          colorSwatches.forEach((s) => s.classList.remove("active"));
          // Add active class to clicked swatch
          swatch.classList.add("active");
          // Set current color
          currentColor = color;
          // Update color picker if it's a custom color
          if (color.startsWith("#")) {
            customColorInput.value = color;
          }
        });
      });

      // Set default active color (black)
      if (colorSwatches.length > 0) {
        colorSwatches[0].classList.add("active");
      }

      // Initialize custom color picker
      customColorInput.addEventListener("input", (e) => {
        e.stopPropagation();
        currentColor = e.target.value;
        // Update active state
        document
          .querySelectorAll(".color-swatch")
          .forEach((s) => s.classList.remove("active"));
      });

      // Initialize color picker button
      colorPicker.addEventListener("click", (e) => {
        e.stopPropagation();
        customColorInput.click();
      });

      // Prevent color picker from closing when clicking inside
      customColorInput.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    // Initialize red sheet
    function initRedSheet() {
      // Toggle red sheet visibility
      redSheetToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        redSheetControls.classList.toggle("hidden");
        redSheet.classList.toggle("hidden");

        // Save red sheet visibility state
        const isVisible = !redSheet.classList.contains("hidden");
        localStorage.setItem("redSheetVisible", isVisible);
      });

      // Load saved red sheet settings
      const savedSheetColor =
        localStorage.getItem("redSheetColor") || "#FF3B30";
      const savedHiddenColor = localStorage.getItem("hiddenColor") || "#000000";
      const savedOpacity = localStorage.getItem("sheetOpacity") || "0.5";
      const isRedSheetVisible =
        localStorage.getItem("redSheetVisible") !== "false";

      sheetColorInput.value = savedSheetColor;
      hiddenColorInput.value = savedHiddenColor;
      sheetOpacityInput.value = savedOpacity;

      // Set initial visibility
      if (!isRedSheetVisible) {
        redSheet.classList.add("hidden");
      } else {
        redSheet.classList.remove("hidden");
      }

      // Update on input
      sheetColorInput.addEventListener("input", updateRedSheet);
      hiddenColorInput.addEventListener("input", updateRedSheet);
      sheetOpacityInput.addEventListener("input", updateRedSheet);

      // Initial update
      updateRedSheet();
    }

    // Update red sheet when controls change
    function updateRedSheet() {
      const sheetColor = sheetColorInput.value;
      const hiddenColor = hiddenColorInput.value;
      const opacity = sheetOpacityInput.value;

      // Update red sheet style
      redSheet.style.backgroundColor = sheetColor;
      redSheet.style.opacity = opacity;

      // Update mix-blend-mode based on the sheet color
      const isDark = isColorDark(sheetColor);
      redSheet.style.mixBlendMode = isDark ? "lighten" : "darken";

      // Update hidden color preview
      hiddenColorInput.style.backgroundColor = hiddenColor;

      // Save to local storage
      localStorage.setItem("redSheetColor", sheetColor);
      localStorage.setItem("hiddenColor", hiddenColor);
      localStorage.setItem("sheetOpacity", opacity);
    }

    // Call the function to initialize color swatches
    initColorSwatches();

    // Initialize red sheet functionality
    initRedSheet();
    // Initial update of red sheet
    updateRedSheet();

    // Initialize file menu dropdown
    const fileMenu = document.getElementById("file-menu");
    const dropdownContent = document.querySelector(".dropdown-content");
    const exportBtn = document.getElementById("export-note");
    const importBtn = document.getElementById("import-note");
    const clearCanvasBtn = document.getElementById("clear-canvas");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    // Clear canvas function
    function clearCurrentPage() {
      const currentPage = getCurrentPage();
      if (currentPage) {
        if (
          confirm("現在のページをクリアしますか？この操作は元に戻せません。")
        ) {
          currentPage.paths = [];
          redrawCanvas();
          saveNotebook();
          showNotification("ページをクリアしました", "success");
        }
      }
    }

    if (fileMenu && dropdownContent) {
      fileMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownContent.classList.toggle("show");
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".dropdown")) {
          dropdownContent.classList.remove("show");
        }
      });

      // Export button
      exportBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        exportNotebook();
        dropdownContent.classList.remove("show");
      });

      // Import button
      importBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
        dropdownContent.classList.remove("show");
      });

      // Handle file selection
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          importNotebook(file);
        }
        fileInput.value = ""; // Reset input to allow selecting the same file again
      });

      // Clear canvas button
      clearCanvasBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        clearCurrentPage();
        dropdownContent.classList.remove("show");
      });
    }

    // Initialize modals
    const setupModal = (modalId, openBtnId, closeBtnClass) => {
      const modal = document.getElementById(modalId);
      const openBtn = document.getElementById(openBtnId);
      const closeBtns = document.querySelectorAll(closeBtnClass);

      if (openBtn) {
        openBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (modal) {
            modal.style.display = "block";
          }
        });
      }

      closeBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (modal) {
            modal.style.display = "none";
          }
        });
      });

      // Prevent modal from closing when clicking inside
      if (modal) {
        modal.addEventListener("click", (e) => {
          e.stopPropagation();
        });
      }
    };

    // Setup save and load modals
    setupModal("file-explorer-modal", "load-note", ".close-modal");
    setupModal("save-note-modal", "save-note", ".close-save-modal");

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
      const modals = document.querySelectorAll(".modal");
      modals.forEach((modal) => {
        if (modal.style.display === "block") {
          modal.style.display = "none";
        }
      });
    });

    // Save note button handler
    const saveNoteBtn = document.getElementById("confirm-save");
    if (saveNoteBtn) {
      saveNoteBtn.addEventListener("click", () => {
        const noteName = document.getElementById("note-name").value.trim();
        if (noteName) {
          saveNotebook(noteName);
          const modal = document.getElementById("save-note-modal");
          if (modal) {
            modal.style.display = "none";
          }
          showNotification("ノートを保存しました", "success");
        } else {
          showNotification("ノート名を入力してください", "error");
        }
      });
    }

    // Save current state to history
    function saveToHistory() {
      // Don't save if nothing has changed
      if (
        historyIndex >= 0 &&
        JSON.stringify(history[historyIndex]) === JSON.stringify(notebook.pages)
      ) {
        return;
      }

      // Remove any redo history after current position
      if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
      }

      // Add current state to history
      history.push(JSON.parse(JSON.stringify(notebook.pages)));
      historyIndex++;

      // Limit history size (keep last 50 states)
      if (history.length > 50) {
        history.shift();
        historyIndex--;
      }
    }

    // Load saved notebook or create a new one
    if (!loadNotebook()) {
      // No saved notebook found, create a default one
      notebook = {
        pages: [
          {
            id: Date.now().toString(),
            paths: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        currentPageIndex: 0,
      };
    }

    // Update UI
    updatePageIndicator();

    // Auto-save every 30 seconds
    setInterval(() => {
      saveNotebook();
    }, 30000);

    // Save before page unload
    window.addEventListener("beforeunload", () => {
      saveNotebook();
    });
  }

  // Make addNewPage globally available
  window.addNewPage = addNewPage;

  // Save current state to history
  function saveToHistory() {
    // Don't save if nothing has changed
    if (
      historyIndex >= 0 &&
      JSON.stringify(history[historyIndex]) === JSON.stringify(notebook.pages)
    ) {
      return;
    }

    // Remove any redo history after current position
    if (historyIndex < history.length - 1) {
      history = history.slice(0, historyIndex + 1);
    }

    // Add current state to history
    history.push(JSON.parse(JSON.stringify(notebook.pages)));
    historyIndex++;

    // Limit history size (keep last 50 states)
    if (history.length > 50) {
      history.shift();
      historyIndex--;
    }
  }

  // Show notification to user
  function showNotification(message, type = "info") {
    // Create notification element if it doesn't exist
    let notification = document.getElementById("notification");
    if (!notification) {
      notification = document.createElement("div");
      notification.id = "notification";
      notification.style.position = "fixed";
      notification.style.bottom = "20px";
      notification.style.left = "50%";
      notification.style.transform = "translateX(-50%)";
      notification.style.padding = "10px 20px";
      notification.style.borderRadius = "4px";
      notification.style.color = "white";
      notification.style.zIndex = "1000";
      notification.style.opacity = "0";
      notification.style.transition = "opacity 0.3s ease-in-out";
      document.body.appendChild(notification);
    }

    // Set notification content and style based on type
    notification.textContent = message;
    notification.style.backgroundColor =
      type === "success"
        ? "#4CAF50"
        : type === "error"
        ? "#F44336"
        : type === "warning"
        ? "#FF9800"
        : "#2196F3"; // default blue for info

    // Show notification
    notification.style.opacity = "1";

    // Auto-hide after 3 seconds
    clearTimeout(notification.timeout);
    notification.timeout = setTimeout(() => {
      notification.style.opacity = "0";
    }, 3000);
  }

  // Initialize the app
  init();
  */
}
