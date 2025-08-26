export const appMeta = {
  name: "notea",
  title: "Notea",
  icon: "re/ico/notea.png"
};

export function appInit(shell) {
  const root = document.getElementById('app-root');
  if (!root) {
    console.error('NoteApp: #app-rootが見つかりません');
    return;
  }

  // Constants
  const APP_VERSION = '1.0.0';
  const LOCAL_STORAGE_KEY = 'noteAppData';
  const DEFAULT_NOTE_TITLE = '無題のノート';

  // State
  let currentNoteId = null;
  let notesList = [];
  let history = [];
  let historyIndex = -1;
  let notebook = {
    pages: [{
      id: Date.now().toString(),
      paths: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: DEFAULT_NOTE_TITLE
    }],
    currentPageIndex: 0
  };
  
  // Drawing state
  let isDrawing = false;
  let currentPath = null;

  // Create app container with updated UI to match the original note app
  root.innerHTML = `
    <div class="app-container">
      <header class="toolbar">
        <div class="tool-group">
          <button id="prev-page" class="tool-button" title="前のページ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span id="page-indicator" class="page-indicator">1/1</span>
          <button id="next-page" class="tool-button" title="次のページ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <button id="add-page" class="tool-button" title="新しいページを追加">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <div class="divider"></div>
          <input type="text" id="note-title" class="note-title" value="新しいノート" maxlength="50">
          <div class="divider"></div>
          <button id="pencil-tool" class="tool-button active" title="ペン">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
              <path d="M2 2l7.586 7.586"></path>
              <circle cx="11" cy="11" r="2"></circle>
            </svg>
          </button>
          <button id="highlighter-tool" class="tool-button" title="蛍光ペン">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 3L3 13l3 3 10-10-3-3z"></path>
              <path d="M12 14l-2 2"></path>
              <path d="M4 20h16"></path>
              <path d="M14 20l2 2"></path>
              <path d="M10 20l-2 2"></path>
            </svg>
          </button>
          <button id="eraser-tool" class="tool-button" title="消しゴム">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 4H8l-7 8 6 6h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z"></path>
              <line x1="18" y1="9" x2="12" y2="15"></line>
              <line x1="12" y1="9" x2="18" y2="15"></line>
            </svg>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 8 9 8 13"></polyline>
              </svg>
            </button>
            <div class="dropdown-content">
              <button id="new-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                新規
              </button>
              <button id="save-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                保存
              </button>
              <button id="export-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                エクスポート
              </button>
              <button id="import-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                インポート
              </button>
              <div class="divider"></div>
              <button id="clear-canvas">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                クリア
              </button>
            </div>
          </div>
          <div class="divider"></div>
          <button id="undo-btn" class="tool-button" title="元に戻す (Ctrl+Z)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 14 4 9l5-5"/>
              <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
            </svg>
          </button>
          <button id="redo-btn" class="tool-button" title="やり直し (Ctrl+Shift+Z)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 14 5-5-5-5"/>
              <path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
            </svg>
          </button>
          <button id="new-note" class="tool-button" title="新規ノート">
            <i class="fas fa-file"></i> 新規
          </button>
        </div>
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
        <h3>ファイルを開く</h3>
        <div class="file-list">
          <!-- File list will be populated here -->
        </div>
        <div class="modal-actions">
          <button id="cancel-open" class="button">キャンセル</button>
        </div>
      </div>
    </div>

    <div class="status-bar">
      <span id="current-tool">ペン</span>
      <span id="page-info">1/1</span>
    </div>

    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }

      body, html, #root {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: #f2f2f7;
      }

      .app-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: #f2f2f7;
      }
      
      .toolbar {
        display: flex;
        justify-content: space-between;
        padding: 8px 16px;
        background-color: #ffffff;
        border-bottom: 1px solid #d1d1d6;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        z-index: 10;
      }
      
      .tool-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .divider {
        width: 1px;
        height: 24px;
        background-color: #d1d1d6;
        margin: 0 4px;
      }
      
      .tool-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: 1px solid #d1d1d6;
        border-radius: 8px;
        background-color: #ffffff;
        cursor: pointer;
        color: #000000;
        font-size: 17px;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      
      .tool-button:hover {
        background-color: #f2f2f7;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
      }
      
      .tool-button.active {
        background-color: #007AFF;
        color: white;
        border-color: #0056b3;
      }
      
      .tool-button:active {
        transform: translateY(1px);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      
      .page-indicator {
        font-size: 15px;
        margin: 0 4px;
        color: #636366;
        font-weight: 500;
      }

      .note-title {
        border: none;
        background: transparent;
        font-size: 15px;
        padding: 6px 12px;
        border-radius: 8px;
        min-width: 100px;
        max-width: 200px;
        text-overflow: ellipsis;
      }
      
      .note-title:focus {
        outline: none;
        background-color: rgba(0, 0, 0, 0.05);
      }

      .pen-size-picker {
        position: relative;
      }

      .select {
        padding: 6px 12px;
        border: 1px solid #d1d1d6;
        border-radius: 8px;
        background-color: #ffffff;
        font-size: 14px;
        color: #000000;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        padding-right: 30px;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 16px;
        cursor: pointer;
      }

      .color-palette {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .color-swatch {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid #e5e5ea;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        display: inline-block;
        vertical-align: middle;
      }
      
      .color-swatch.black { background-color: #000000; }
      .color-swatch.red { background-color: #FF3B30; }
      .color-swatch.blue { background-color: #007AFF; }
      .color-swatch.green { background-color: #34C759; }
      .color-swatch.yellow { background-color: #FFCC00; }

      .color-swatch:hover {
        transform: scale(1.15);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      }

      .color-swatch.active {
        border: 2px solid #007AFF;
        box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.5);
        transform: scale(1.1);
      }

      .color-picker {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #f2f2f7;
        border: none;
        cursor: pointer;
        color: #8e8e93;
      }

      .hidden {
        display: none;
      }

      .red-sheet-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .red-sheet-controls input[type="color"] {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .red-sheet-controls input[type="range"] {
        width: 100px;
      }

      .dropdown {
        position: relative;
        display: inline-block;
      }

      .dropdown-content {
        display: none;
        position: absolute;
        right: 0;
        background-color: #ffffff;
        min-width: 200px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 100;
        overflow: hidden;
      }

      .dropdown:hover .dropdown-content {
        display: block;
      }

      .dropdown-content button {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 10px 16px;
        border: none;
        background: none;
        text-align: left;
        font-size: 15px;
        color: #000000;
        cursor: pointer;
        gap: 12px;
      }
      
      .dropdown-content button svg {
        flex-shrink: 0;
      }

      .dropdown-content button:hover {
        background-color: #f2f2f7;
      }

      .dropdown-content .divider {
        width: 100%;
        height: 1px;
        margin: 4px 0;
        background-color: #f2f2f7;
      }

      .canvas-container {
        position: relative;
        flex: 1;
        overflow: hidden;
        background-color: #f2f2f7;
      }
      
      #drawing-canvas {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        touch-action: none;
      }
      
      .red-sheet {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
        mix-blend-mode: multiply;
      }
      
      .red-sheet.active {
        opacity: 0.5;
        background-color: #FF3B30;
      }

      /* Modal styles */
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
        background-color: #ffffff;
        border-radius: 14px;
        width: 90%;
        max-width: 400px;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }

      .modal h3 {
        padding: 16px;
        font-size: 17px;
        font-weight: 600;
        text-align: center;
        border-bottom: 1px solid #f2f2f7;
      }

      .file-list {
        max-height: 50vh;
        overflow-y: auto;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        padding: 16px;
        border-top: 1px solid #f2f2f7;
      }

      .button {
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        background: none;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
      }

      .button.primary {
        background-color: #007AFF;
        color: #ffffff;
      }

      .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background-color: #000000;
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(100px);
        opacity: 0;
        transition: transform 0.3s, opacity 0.3s;
        z-index: 1000;
        font-size: 15px;
      }
      
      .notification.show {
        transform: translateY(0);
        opacity: 0.9;
      }
    </style>
  `;

  // Initialize variables
  let lastX = 0;
  let lastY = 0;
  let currentColor = '#000000';
  let currentSize = 0.5; // Default pen size in mm
  let currentTool = 'pencil';

  // UI Elements with null checks
  const getElement = (id, required = true) => {
    const el = document.getElementById(id);
    if (!el && required) {
      console.error(`Element with ID '${id}' not found`);
    }
    return el;
  };

  const pencilTool = getElement('pencil-tool');
  const highlighterTool = getElement('highlighter-tool');
  const eraserTool = getElement('eraser-tool');
  const noteTitleInput = getElement('note-title');
  const importFileInput = getElement('import-file', false);
  const pageIndicator = getElement('page-indicator');
  const currentToolDisplay = getElement('current-tool');
  const undoBtn = getElement('undo-btn');
  const redoBtn = getElement('redo-btn');
  const prevPageBtn = getElement('prev-page');
  const nextPageBtn = getElement('next-page');
  const newPageBtn = getElement('new-page', false);
  const newNoteBtn = getElement('new-note', false);
  const penSizeSelect = getElement('pen-size');
  const colorPicker = getElement('color-picker');
  const customColorInput = getElement('custom-color');
  const colorSwatches = document.querySelectorAll('.color-swatch');
// Red sheet related elements
const redSheetToggle = getElement('red-sheet-toggle', false);
const redSheet = getElement('red-sheet', false);
const redSheetControls = getElement('red-sheet-controls', false);
const sheetColorInput = getElement('sheet-color', false);
const hiddenColorInput = getElement('hidden-color', false);
const sheetOpacityInput = getElement('sheet-opacity', false);
const clearCanvasBtn = getElement('clear-canvas', false);
const saveNoteBtn = getElement('save-canvas', false);

// Initialize red sheet controls if available
if (redSheetToggle && redSheet && redSheetControls) {
  redSheetToggle.addEventListener('click', () => {
    redSheet.classList.toggle('active');
    redSheetControls.classList.toggle('hidden');
  });
}

// Initialize sheet color controls if available
if (sheetColorInput && hiddenColorInput && sheetOpacityInput) {
  sheetColorInput.addEventListener('input', updateRedSheet);
  hiddenColorInput.addEventListener('input', updateRedSheet);
  sheetOpacityInput.addEventListener('input', updateRedSheet);
}

// Clear canvas button
if (clearCanvasBtn) {
  clearCanvasBtn.addEventListener('click', clearCurrentPage);
}

// Save note button
if (saveNoteBtn) {
  saveNoteBtn.addEventListener('click', saveNote);
}

function updateRedSheet() {
  if (!redSheet || !sheetColorInput || !hiddenColorInput || !sheetOpacityInput) return;
  
  const sheetColor = sheetColorInput.value;
  const hiddenColor = hiddenColorInput.value;
  const opacity = sheetOpacityInput.value;
  
  redSheet.style.backgroundColor = sheetColor;
  redSheet.style.opacity = opacity;
  
  // Apply filter to hide the hidden color
  redSheet.style.filter = `hue-rotate(0deg) saturate(100%) brightness(100%)`;
  // Additional CSS filters can be applied here if needed
}

  // Initialize canvas with error handling
  const canvas = getElement('drawing-canvas');
  if (!canvas) {
    console.error('Canvas element not found');
    return; // Exit if canvas is not available
  }
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    console.error('Could not get 2D context');
    return;
  }
  
  // Initialize canvas size and set up drawing properties
  function initCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set display size (css pixels)
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // Set actual size in memory (scaled for DPI)
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    
    // Scale the drawing context
    ctx.scale(dpr, dpr);
    
    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = currentSize;
    ctx.strokeStyle = currentColor;
    
    // Redraw canvas after resize
    redrawCanvas();
  }
  
  // Initial canvas setup
  initCanvas();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    initCanvas();
  });
  
  // Initialize color picker if available
  if (colorPicker && customColorInput) {
    try {
      colorPicker.addEventListener('click', () => customColorInput.click());
      customColorInput.addEventListener('input', (e) => {
        currentColor = e.target.value;
        updateActiveToolColor(currentColor);
      });
    } catch (error) {
      console.error('Error initializing color picker:', error);
    }
  }
  
  // Initialize color swatches
  function initColorSwatches() {
    try {
      const colorSwatches = document.querySelectorAll('.color-swatch');
      colorSwatches.forEach(swatch => {
        if (swatch) {
          // Set background color from data-color attribute if not already set
          const color = swatch.dataset.color;
          if (color && !swatch.style.backgroundColor) {
            swatch.style.backgroundColor = color;
          }
          
          swatch.addEventListener('click', () => {
            // Remove active class from all swatches
            colorSwatches.forEach(s => s.classList.remove('active'));
            // Add active class to clicked swatch
            swatch.classList.add('active');
            
            // Update current color
            if (color) {
              currentColor = color;
              updateActiveToolColor(color);
            }
          });
        }
      });
      
      // Set default active color (black)
      const defaultSwatch = document.querySelector('.color-swatch.black');
      if (defaultSwatch) {
        defaultSwatch.classList.add('active');
      }
    } catch (error) {
      console.error('Error initializing color swatches:', error);
    }
  }
  
  // Initialize color swatches
  initColorSwatches();
  
// Set initial tool states
function updateActiveToolColor(color) {
  if (currentToolDisplay) {
    currentToolDisplay.style.color = color;
  }
  // Update any other UI elements that show the current color
}

function updateActiveTool(toolId) {
    if (!toolId) return;
    
    try {
        const tools = document.querySelectorAll('.tool');
        tools.forEach(tool => tool.classList.remove('active'));
        
        const toolElement = document.getElementById(toolId);
        if (toolElement) {
            toolElement.classList.add('active');
            currentTool = toolId.replace('-tool', '');
            
            // Update tool display if available
            if (currentToolDisplay) {
                const toolNames = {
                    'pencil': 'ペン',
                    'highlighter': '蛍光ペン',
                    'eraser': '消しゴム'
                };
                currentToolDisplay.textContent = toolNames[currentTool] || currentTool;
            }
        }
    } catch (error) {
        console.error('Error updating active tool:', error);
    }
}

function updatePageIndicator() {
    if (!pageIndicator || !noteTitleInput) return;
    
    try {
        const currentPage = getCurrentPage();
        if (!currentPage) {
            console.error('No current page available');
            return;
        }
        
        pageIndicator.textContent = `${notebook.currentPageIndex + 1}/${notebook.pages.length}`;
        noteTitleInput.value = currentPage.title || DEFAULT_NOTE_TITLE;
        
        // Update button states if buttons exist
        if (prevPageBtn) prevPageBtn.disabled = notebook.currentPageIndex === 0;
        if (nextPageBtn) nextPageBtn.disabled = notebook.currentPageIndex >= notebook.pages.length - 1;
    } catch (error) {
        console.error('Error updating page indicator:', error);
    }
    
    // Update button states
    prevPageBtn.disabled = notebook.currentPageIndex === 0;
    nextPageBtn.disabled = notebook.currentPageIndex === notebook.pages.length - 1;
}

// Get current page data with validation
function getCurrentPage() {
    if (!notebook || !Array.isArray(notebook.pages) || notebook.pages.length === 0) {
        console.error('Invalid notebook state');
        return null;
    }
    
    const page = notebook.pages[notebook.currentPageIndex];
    if (!page) {
        console.error('Current page not found');
        return null;
    }
    
    return page;
}

// Initialize canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    redrawCanvas();
}


// Clear current page
function clearCurrentPage() {
    if (confirm('現在のページをクリアしますか？この操作は元に戻せません。')) {
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
        updatedAt: new Date().toISOString()
    };

    notebook.pages.push(newPage);
    notebook.currentPageIndex = notebook.pages.length - 1;
    updatePageIndicator();
    redrawCanvas();
    saveToHistory();
    showNotification('新しいページを追加しました', 'success');
}

// Go to specific page
function goToPage(index) {
    if (index >= 0 && index < notebook.pages.length) {
        notebook.currentPageIndex = index;
        updatePageIndicator();
        redrawCanvas();
    }
}


// Redraw all paths on the canvas
function redrawCanvas() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const currentPage = getCurrentPage();
    if (!currentPage) return;
    
    // Create a temporary canvas for drawing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw all paths
    currentPage.paths.forEach(path => {
        if (path.points.length < 2) return;
        
        tempCtx.beginPath();
        tempCtx.moveTo(path.points[0].x, path.points[0].y);
        
        for (let i = 1; i < path.points.length; i++) {
            const point = path.points[i];
            tempCtx.lineTo(point.x, point.y);
        }
        
        if (path.tool === 'eraser') {
            tempCtx.globalCompositeOperation = 'destination-out';
            tempCtx.strokeStyle = 'rgba(0, 0, 0, 1)';
        } else {
            tempCtx.globalCompositeOperation = 'source-over';
            tempCtx.strokeStyle = path.color;
            tempCtx.globalAlpha = path.tool === 'highlighter' ? 0.4 : 1.0;
        }
        
        tempCtx.lineWidth = path.size;
        tempCtx.lineCap = 'round';
        tempCtx.lineJoin = 'round';
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
        y: (clientY - rect.top) * scaleY
    };
}

// Start drawing
function startDrawing(e) {
    e.preventDefault();
    const { x, y } = getCanvasCoordinates(e);
    
    isDrawing = true;
    lastX = x;
    lastY = y;

    // Create a new path
    currentPath = {
        points: [{ x, y }],
        color: currentColor,
        size: currentSize * (window.devicePixelRatio || 1),
        tool: currentTool
    };

    // Add to current page's paths
    const currentPage = getCurrentPage();
    if (currentPage) {
        currentPage.paths.push(currentPath);
        currentPage.updatedAt = new Date().toISOString();
    }
    
    // Start a new path for immediate feedback
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
    } else if (currentTool === 'highlighter') {
        ctx.globalAlpha = 0.4;
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
    }
}

// Draw
function draw(e) {
    if (!isDrawing || !currentPath) return;
    e.preventDefault();
    
    const { x, y } = getCanvasCoordinates(e);
    
    // Add point to current path
    currentPath.points.push({ x, y });
    
    // Draw the line segment
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Start a new path for the next segment
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Update last coordinates
    lastX = x;
    lastY = y;
}

// Save the current notebook and return the saved data
function saveNote() {
    const savedData = saveNotebook();
    showNotification('ノートを保存しました', 'success');
    return savedData;
}

    // Save current state to history
    function saveToHistory() {
        // Don't save if nothing has changed
        if (historyIndex >= 0 && JSON.stringify(history[historyIndex]) === JSON.stringify(notebook.pages)) {
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

    // Stop drawing handler is defined above

    // Save the current context state
    ctx.save();

    // Set line style based on tool
    if (currentTool === 'eraser') {
        // Use destination-out to make pixels transparent
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0, 0, 0, 1)'; // Color doesn't matter for destination-out
        ctx.lineWidth = currentSize * (window.devicePixelRatio || 1) * 2; // Convert mm to pixels
    } else {
        // For pencil and highlighter, use normal composition
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize * (window.devicePixelRatio || 1) * 2; // Convert mm to pixels

        if (currentTool === 'highlighter') {
            ctx.globalAlpha = 0.4;
        } else {
            ctx.globalAlpha = 1.0;
        }
    }

    // Draw the line
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
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
        version: '1.0',
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('notebookData', JSON.stringify(notebookData));
    return notebookData;
}

// Load notebook from localStorage or data object
function loadNotebook(data = null) {
    try {
        const savedData = data || localStorage.getItem('notebookData');
        if (savedData) {
            const parsedData = typeof savedData === 'string' ? JSON.parse(savedData) : savedData;
            if (parsedData.pages && Array.isArray(parsedData.pages)) {
                notebook.pages = parsedData.pages;
                notebook.currentPageIndex = parsedData.currentPageIndex || 0;
                updatePageIndicator();
                redrawCanvas();
                return true;
            }
        }
    } catch (e) {
        console.error('Failed to load notebook:', e);
        showNotification('ノートの読み込みに失敗しました', 'error');
    }
    return false;
}

// Export notebook to JSON file
function exportNotebook() {
    const data = saveNotebook();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `notebook-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('ノートをエクスポートしました', 'success');
}

// Import notebook from file
function importNotebook(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (confirm('現在のノートは上書きされます。よろしいですか？')) {
                if (loadNotebook(data)) {
                    showNotification('ノートをインポートしました', 'success');
                }
            }
        } catch (e) {
            console.error('Failed to import notebook:', e);
            showNotification('無効なファイル形式です', 'error');
        }
    };
    
    reader.onerror = () => {
        showNotification('ファイルの読み込みに失敗しました', 'error');
    };
    
    reader.readAsText(file);
}

// Initialize
function init() {
    // Initialize canvas first
    const canvas = document.getElementById('drawing-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    
    // Store references globally
    window.canvas = canvas;
    window.ctx = ctx;
    
    resizeCanvas();
    initColorSwatches();
    updateRedSheet();

    // Set initial active states
    pencilTool.classList.add('active');

    // Set initial pen size
    currentSize = parseFloat(penSizeSelect.value);

    // Initialize drawing tools
    pencilTool.addEventListener('click', () => {
        currentTool = 'pencil';
        pencilTool.classList.add('active');
        highlighterTool.classList.remove('active');
        eraserTool.classList.remove('active');
    });

    highlighterTool.addEventListener('click', () => {
        currentTool = 'highlighter';
        highlighterTool.classList.add('active');
        pencilTool.classList.remove('active');
        eraserTool.classList.remove('active');
    });

    eraserTool.addEventListener('click', () => {
        currentTool = 'eraser';
        eraserTool.classList.add('active');
        pencilTool.classList.remove('active');
        highlighterTool.classList.remove('active');
    });

    // Initialize pen size selector
    penSizeSelect.addEventListener('change', (e) => {
        currentSize = parseFloat(e.target.value);
    });

    // Add event listeners for drawing
    function setupCanvasEventListeners() {
        // Remove any existing event listeners to prevent duplicates
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseout', stopDrawing);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        
        // Add new event listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Touch support
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);
    }
    
    // Touch event handlers
    function handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        startDrawing({
            preventDefault: () => {},
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }
    
    function handleTouchMove(e) {
        e.preventDefault();
        if (!isDrawing) return;
        const touch = e.touches[0];
        draw({
            preventDefault: () => {},
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }
    
    function handleTouchEnd(e) {
        e.preventDefault();
        stopDrawing();
    }
    
    // Initialize the canvas events
    initCanvasEvents();

    // Initialize page navigation
    document.getElementById('prev-page').addEventListener('click', () => {
        if (notebook.currentPageIndex > 0) {
            goToPage(notebook.currentPageIndex - 1);
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (notebook.currentPageIndex < notebook.pages.length - 1) {
            goToPage(notebook.currentPageIndex + 1);
        }
    });

    document.getElementById('add-page').addEventListener('click', addNewPage);

    // Check if a color is dark
    function isColorDark(color) {
        // Convert hex to RGB
        let r, g, b;
        if (color.startsWith('#')) {
            const hex = color.substring(1);
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else if (color.startsWith('rgb')) {
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
        colorSwatches.forEach(swatch => {
            const color = swatch.dataset.color || swatch.style.backgroundColor;
            swatch.setAttribute('title', color);
            swatch.style.backgroundColor = color;
            
            swatch.addEventListener('click', (e) => {
                e.stopPropagation();
                // Remove active class from all swatches
                colorSwatches.forEach(s => s.classList.remove('active'));
                // Add active class to clicked swatch
                swatch.classList.add('active');
                // Set current color
                currentColor = color;
                // Update color picker if it's a custom color
                if (color.startsWith('#')) {
                    customColorInput.value = color;
                }
            });
        });
        
        // Set default active color (black)
        if (colorSwatches.length > 0) {
            colorSwatches[0].classList.add('active');
        }
        
        // Initialize custom color picker
        customColorInput.addEventListener('input', (e) => {
            e.stopPropagation();
            currentColor = e.target.value;
            // Update active state
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        });

        // Initialize color picker button
        colorPicker.addEventListener('click', (e) => {
            e.stopPropagation();
            customColorInput.click();
        });

        // Prevent color picker from closing when clicking inside
        customColorInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Initialize red sheet
    function initRedSheet() {
        // Toggle red sheet visibility
        redSheetToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            redSheetControls.classList.toggle('hidden');
            redSheet.classList.toggle('hidden');
            
            // Save red sheet visibility state
            const isVisible = !redSheet.classList.contains('hidden');
            localStorage.setItem('redSheetVisible', isVisible);
        });

        // Load saved red sheet settings
        const savedSheetColor = localStorage.getItem('redSheetColor') || '#FF3B30';
        const savedHiddenColor = localStorage.getItem('hiddenColor') || '#000000';
        const savedOpacity = localStorage.getItem('sheetOpacity') || '0.5';
        const isRedSheetVisible = localStorage.getItem('redSheetVisible') !== 'false';

        sheetColorInput.value = savedSheetColor;
        hiddenColorInput.value = savedHiddenColor;
        sheetOpacityInput.value = savedOpacity;
        
        // Set initial visibility
        if (!isRedSheetVisible) {
            redSheet.classList.add('hidden');
        } else {
            redSheet.classList.remove('hidden');
        }

        // Update on input
        sheetColorInput.addEventListener('input', updateRedSheet);
        hiddenColorInput.addEventListener('input', updateRedSheet);
        sheetOpacityInput.addEventListener('input', updateRedSheet);
        
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
        redSheet.style.mixBlendMode = isDark ? 'lighten' : 'darken';
        
        // Update hidden color preview
        hiddenColorInput.style.backgroundColor = hiddenColor;
        
        // Save to local storage
        localStorage.setItem('redSheetColor', sheetColor);
        localStorage.setItem('hiddenColor', hiddenColor);
        localStorage.setItem('sheetOpacity', opacity);
    }
    
    // Call the function to initialize color swatches
    initColorSwatches();
    
    // Initialize red sheet functionality
    initRedSheet();
    // Initial update of red sheet
    updateRedSheet();
    
    // Initialize file menu dropdown
    const fileMenu = document.getElementById('file-menu');
    const dropdownContent = document.querySelector('.dropdown-content');
    const exportBtn = document.getElementById('export-note');
    const importBtn = document.getElementById('import-note');
    const clearCanvasBtn = document.getElementById('clear-canvas');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Clear canvas function
    function clearCurrentPage() {
        const currentPage = getCurrentPage();
        if (currentPage) {
            if (confirm('現在のページをクリアしますか？この操作は元に戻せません。')) {
                currentPage.paths = [];
                redrawCanvas();
                saveNotebook();
                showNotification('ページをクリアしました', 'success');
            }
        }
    }
    
    if (fileMenu && dropdownContent) {
        fileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                dropdownContent.classList.remove('show');
            }
        });
        
        // Export button
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exportNotebook();
            dropdownContent.classList.remove('show');
        });
        
        // Import button
        importBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
            dropdownContent.classList.remove('show');
        });
        
        // Handle file selection
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                importNotebook(file);
            }
            fileInput.value = ''; // Reset input to allow selecting the same file again
        });
        
        // Clear canvas button
        clearCanvasBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearCurrentPage();
            dropdownContent.classList.remove('show');
        });
    }

    // Initialize modals
    const setupModal = (modalId, openBtnId, closeBtnClass) => {
        const modal = document.getElementById(modalId);
        const openBtn = document.getElementById(openBtnId);
        const closeBtns = document.querySelectorAll(closeBtnClass);
        
        if (openBtn) {
            openBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (modal) {
                    modal.style.display = 'block';
                }
            });
        }
        
        closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // Prevent modal from closing when clicking inside
        if (modal) {
            modal.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    };
    
    // Setup save and load modals
    setupModal('file-explorer-modal', 'load-note', '.close-modal');
    setupModal('save-note-modal', 'save-note', '.close-save-modal');
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    });
    
    // Save note button handler
    const saveNoteBtn = document.getElementById('confirm-save');
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', () => {
            const noteName = document.getElementById('note-name').value.trim();
            if (noteName) {
                saveNotebook(noteName);
                const modal = document.getElementById('save-note-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
                showNotification('ノートを保存しました', 'success');
            } else {
                showNotification('ノート名を入力してください', 'error');
            }
        });
    }

    // Save current state to history
    function saveToHistory() {
        // Don't save if nothing has changed
        if (historyIndex >= 0 && JSON.stringify(history[historyIndex]) === JSON.stringify(notebook.pages)) {
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
            pages: [{
                id: Date.now().toString(),
                paths: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }],
            currentPageIndex: 0
        };
    }

    // Update UI
    updatePageIndicator();

    // Auto-save every 30 seconds
    setInterval(() => {
        saveNotebook();
    }, 30000);

    // Save before page unload
    window.addEventListener('beforeunload', () => {
        saveNotebook();
    });
}

// Make addNewPage globally available
window.addNewPage = addNewPage;

// Save current state to history
function saveToHistory() {
    // Don't save if nothing has changed
    if (historyIndex >= 0 && JSON.stringify(history[historyIndex]) === JSON.stringify(notebook.pages)) {
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
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.color = 'white';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        document.body.appendChild(notification);
    }

    // Set notification content and style based on type
    notification.textContent = message;
    notification.style.backgroundColor = 
        type === 'success' ? '#4CAF50' : 
        type === 'error' ? '#F44336' : 
        type === 'warning' ? '#FF9800' : 
        '#2196F3'; // default blue for info

    // Show notification
    notification.style.opacity = '1';
    
    // Auto-hide after 3 seconds
    clearTimeout(notification.timeout);
    notification.timeout = setTimeout(() => {
        notification.style.opacity = '0';
    }, 3000);
}

// Initialize the app
init();
  // Add a new page
  function addNewPage() {
    const newPage = {
      id: Date.now().toString(),
      paths: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: `ノート ${notebook.pages.length + 1}`
    };
    
    notebook.pages.push(newPage);
    notebook.currentPageIndex = notebook.pages.length - 1;
    saveToHistory();
    redrawCanvas();
    updatePageIndicator();
  }

  // Go to specific page
  function goToPage(index) {
    if (index >= 0 && index < notebook.pages.length) {
      notebook.currentPageIndex = index;
      redrawCanvas();
      updatePageIndicator();
      return true;
    }
    return false;
  }

  // Initialize canvas size
  function resizeCanvas() {
    if (!window.canvas) {
      console.error('Canvas not initialized');
      return;
    }
    
    const container = window.canvas.parentElement;
    if (!container) {
      console.error('Canvas container not found');
      return;
    }
    
    const rect = container.getBoundingClientRect();
    window.canvas.width = rect.width * (window.devicePixelRatio || 1);
    window.canvas.height = rect.height * (window.devicePixelRatio || 1);
    window.canvas.style.width = rect.width + 'px';
    window.canvas.style.height = rect.height + 'px';
    
    // Set up canvas context
    if (window.ctx) {
      window.ctx.lineCap = 'round';
      window.ctx.lineJoin = 'round';
      window.ctx.strokeStyle = window.currentColor || '#000000';
      window.ctx.lineWidth = window.currentSize || 2;
    }
    
    redrawCanvas();
  }

  // Redraw all paths on the canvas
  function redrawCanvas() {
    const currentPage = getCurrentPage();
    if (!currentPage) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Apply device pixel ratio scaling
    const dpr = window.devicePixelRatio || 1;
    
    // Draw all paths
    currentPage.paths.forEach(path => {
      if (!path.points || path.points.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(path.points[0].x * dpr, path.points[0].y * dpr);
      
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x * dpr, path.points[i].y * dpr);
      }
      
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
    
    ctx.restore();
  }

  // Get canvas coordinates
  function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    return {
      x: (e.clientX - rect.left) / dpr,
      y: (e.clientY - rect.top) / dpr
    };
  }

  // Start drawing
  function startDrawing(e) {
    e.preventDefault();
    
    const { x, y } = getCanvasCoordinates(e);
    isDrawing = true;
    
    currentPath = {
      tool: currentTool,
      color: currentColor,
      size: currentSize,
      points: [{ x, y }]
    };
    
    const currentPage = getCurrentPage();
    currentPage.paths.push(currentPath);
    currentPage.updatedAt = new Date().toISOString();
    
    // Start a new path for immediate feedback
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = currentColor;

// ... (rest of the code remains the same)

// Save current state to history
function saveToHistory() {
    // Remove any redo history after current position
    if (historyIndex < history.length - 1) {
      history = history.slice(0, historyIndex + 1);
    }
    
    // Add current state to history
    history.push(JSON.stringify(notebook));
    historyIndex = history.length - 1;
    
    // Limit history size
    if (history.length > 50) {
      history.shift();
      historyIndex--;
    }
    
    updateUndoRedoButtons();
}

// ... (rest of the code remains the same)

  // Load state from history
  function loadFromHistory() {
    if (historyIndex < 0 || historyIndex >= history.length) return;
    
    try {
      notebook = JSON.parse(history[historyIndex]);
      redrawCanvas();
      updatePageIndicator();
      updateUndoRedoButtons();
    } catch (e) {
      console.error('Error loading from history:', e);
    }
  }

  // Update undo/redo button states
  function updateUndoRedoButtons() {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
  }

  // Clear current page
  function clearCurrentPage() {
    if (confirm('現在のページをクリアしますか？この操作は元に戻せません。')) {
      const currentPage = getCurrentPage();
      if (currentPage) {
        currentPage.paths = [];
        currentPage.updatedAt = new Date().toISOString();
        saveToHistory();
        redrawCanvas();
      }
    }
  }

  // Button styling for better visibility
  function styleButtons() {
    const buttons = document.querySelectorAll('button, .tool-button, .color-swatch');
    buttons.forEach(btn => {
      if (!btn.style.backgroundColor) {
        // Add default background color if none exists
        if (btn.classList.contains('color-swatch')) {
          // Keep color swatch colors as is
          btn.style.border = '2px solid #333';
          btn.style.borderRadius = '4px';
          btn.style.width = '30px';
          btn.style.height = '30px';
          btn.style.margin = '2px';
          btn.style.cursor = 'pointer';
        } else {
          // Style tool buttons
          btn.style.backgroundColor = btn.classList.contains('active') ? '#4a90e2' : '#f0f0f0';
          btn.style.color = btn.classList.contains('active') ? 'white' : '#333';
          btn.style.border = '1px solid #ccc';
          btn.style.borderRadius = '4px';
          btn.style.padding = '6px 12px';
          btn.style.margin = '2px';
          btn.style.cursor = 'pointer';
          btn.style.transition = 'all 0.2s ease';
          
          // Hover effect
          btn.addEventListener('mouseover', () => {
            if (!btn.classList.contains('active')) {
              btn.style.backgroundColor = '#e0e0e0';
            }
          });
          
          btn.addEventListener('mouseout', () => {
            if (!btn.classList.contains('active')) {
              btn.style.backgroundColor = '#f0f0f0';
            }
          });
        }
      }
    });
  }
  
  // Apply button styles when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', styleButtons);
  } else {
    styleButtons();
  }
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Undo: Ctrl+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undo();
    }
    // Redo: Ctrl+Y or Ctrl+Shift+Z
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
      e.preventDefault();
      redo();
    }
  });
  
  // Page navigation
  if (prevPageBtn) {
    try {
      prevPageBtn.addEventListener('click', () => goToPage(notebook.currentPageIndex - 1));
    } catch (error) {
      console.error('Error initializing previous page button:', error);
    }
  }

  if (nextPageBtn) {
    try {
      nextPageBtn.addEventListener('click', () => goToPage(notebook.currentPageIndex + 1));
    } catch (error) {
      console.error('Error initializing next page button:', error);
    }
  }
  
  // Undo/Redo buttons
  if (undoBtn) {
    try {
      undoBtn.addEventListener('click', undo);
    } catch (error) {
      console.error('Error initializing undo button:', error);
    }
  }

  if (redoBtn) {
    try {
      redoBtn.addEventListener('click', redo);
    } catch (error) {
      console.error('Error initializing redo button:', error);
    }
  }
  
  // Red sheet mode
  if (redSheetToggle) {
    redSheetToggle.addEventListener('click', () => {
      redSheet.style.display = redSheet.style.display === 'none' ? 'block' : 'none';
      redSheetControls.style.display = redSheetControls.style.display === 'none' ? 'flex' : 'none';
    });
  }
  
  if (sheetColorInput) {
    sheetColorInput.addEventListener('input', (e) => {
      redSheet.style.backgroundColor = e.target.value;
    });
  }
  
  if (sheetOpacityInput) {
    sheetOpacityInput.addEventListener('input', (e) => {
      redSheet.style.opacity = e.target.value;
    });
  }
  
  // Note title
  if (noteTitleInput) {
    noteTitleInput.addEventListener('change', (e) => {
      const currentPage = getCurrentPage();
      if (currentPage) {
        currentPage.title = e.target.value || DEFAULT_NOTE_TITLE;
        currentPage.updatedAt = new Date().toISOString();
        saveToHistory();
      }
    });
  }
  
  // Clear canvas button
  if (clearCanvasBtn) {
    clearCanvasBtn.addEventListener('click', clearCurrentPage);
  }

  // Tool selection
  const initToolButton = (element, toolId) => {
    if (element) {
      try {
        element.addEventListener('click', () => {
          currentTool = toolId;
          switch (toolId) {
            case 'pencil':
              currentColor = colorPicker.value;
              updateActiveTool('pencil-tool');
              currentToolDisplay.textContent = 'ペン';
              break;
            case 'highlighter':
              currentColor = colorPicker.value + '80'; // Add transparency
              updateActiveTool('highlighter-tool');
              currentToolDisplay.textContent = 'マーカー';
              break;
            case 'eraser':
              currentColor = '#ffffff';
              updateActiveTool('eraser-tool');
              currentToolDisplay.textContent = '消しゴム';
              break;
          }
        });
      } catch (error) {
        console.error(`Error initializing ${toolId}:`, error);
      }
    }
  };

  if (pencilTool) {
    initToolButton(pencilTool, 'pencil');
  }

  if (highlighterTool) {
    initToolButton(highlighterTool, 'highlighter');
  }

  if (eraserTool) {
    initToolButton(eraserTool, 'eraser');
  }

  // Pen size change
  if (penSizeSelect) {
    try {
      penSizeSelect.addEventListener('change', (e) => {
        if (e && e.target) {
          currentSize = parseFloat(e.target.value) || 0.5;
        }
      });
    } catch (error) {
      console.error('Error initializing pen size selector:', error);
    }
  }

  // Color picker
  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      currentColor = e.target.value;
      if (currentTool === 'pencil') {
        updateActiveTool('pencil-tool');
      } else if (currentTool === 'highlighter') {
        updateActiveTool('highlighter-tool');
      }
    });
  }

  // Clear the current page's drawing
  if (clearCanvasBtn) {
    clearCanvasBtn.addEventListener('click', () => {
      const currentPage = getCurrentPage();
      if (currentPage && confirm('現在のページの描画を消去しますか？')) {
        currentPage.paths = [];
        currentPage.updatedAt = new Date().toISOString();
        redrawCanvas();
        saveToHistory();
        showNotification('ページをクリアしました');
      }
    });
  }

  // Save button
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', () => {
      // In a real app, you would implement save functionality
      alert('ノートを保存しました');
      saveState();
    });
  }

  // New note button
  if (newNoteBtn) {
    newNoteBtn.addEventListener('click', () => {
      if (confirm('新しいノートを作成しますか？現在のノートは保存されません。')) {
        // Create a new notebook with a single empty page
        notebook = {
          pages: [{
            id: Date.now().toString(),
            paths: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            title: DEFAULT_NOTE_TITLE
          }],
          currentPageIndex: 0
        };
        
        // Reset UI
        noteTitleInput.value = DEFAULT_NOTE_TITLE;
        updatePageIndicator();
        redrawCanvas();
        saveToHistory();
        showNotification('新しいノートを作成しました');
      }
    });
  }

  // Initialize
  function init() {
    if (canvas) {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    }
    
    // Load saved notebook if available
    loadNotebook();
    
    // Initialize with empty history
    saveToHistory();
    
    // Set up event listeners for tool buttons
    if (pencilTool) {
      pencilTool.addEventListener('click', () => setTool('pencil'));
    }

    if (highlighterTool) {
      highlighterTool.addEventListener('click', () => setTool('highlighter'));
    }

    if (eraserTool) {
      eraserTool.addEventListener('click', () => setTool('eraser'));
    }
    
    // Pen size change
    if (penSizeSelect) {
      try {
        penSizeSelect.addEventListener('change', (e) => {
          currentSize = parseFloat(e.target.value);
        });
      } catch (error) {
        console.error('Error initializing pen size selector:', error);
      }
    }
    
    // Color picker
    if (colorPicker) {
      try {
        colorPicker.addEventListener('input', (e) => {
          currentColor = e.target.value;
          if (currentTool === 'pencil') {
            updateActiveTool('pencil-tool');
          } else if (currentTool === 'highlighter') {
            updateActiveTool('highlighter-tool');
          }
        });
      } catch (error) {
        console.error('Error initializing color picker:', error);
      }
    }

    // Save button
    if (saveNoteBtn) {
      try {
        saveNoteBtn.addEventListener('click', saveNotebook);
      } catch (error) {
        console.error('Error initializing save button:', error);
      }
    }
    
    // New page button
    if (newPageBtn) {
      try {
        newPageBtn.addEventListener('click', addNewPage);
      } catch (error) {
        console.error('Error initializing new page button:', error);
      }
    }
    
    // Set initial tool
    setTool('pencil');
  }
  
  // Set the current tool
  function setTool(tool) {
    currentTool = tool;
    
    switch (tool) {
      case 'pencil':
        currentColor = colorPicker.value;
        updateActiveTool('pencil-tool');
        currentToolDisplay.textContent = 'ペン';
        break;
      case 'highlighter':
        currentColor = colorPicker.value + '80'; // Add transparency
        updateActiveTool('highlighter-tool');
        currentToolDisplay.textContent = 'マーカー';
        break;
      case 'eraser':
        currentColor = '#ffffff';
        updateActiveTool('eraser-tool');
        currentToolDisplay.textContent = '消しゴム';
        break;
    }
  }
  
  // Update active tool button
  function updateActiveTool(activeId) {
    [pencilTool, highlighterTool, eraserTool].forEach(tool => {
      tool.classList.toggle('active', tool.id === activeId);
    });
  }
  
  // Save notebook to localStorage
  function saveNotebook() {
    try {
      const notebookData = {
        version: APP_VERSION,
        notebook: notebook,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notebookData));
      showNotification('ノートを保存しました', 'success');
      return true;
    } catch (e) {
      console.error('Error saving notebook:', e);
      showNotification('保存に失敗しました', 'error');
      return false;
    }
  }
  
  // Load notebook from localStorage
  function loadNotebook() {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!savedData) return false;
      
      const { version, notebook: savedNotebook } = JSON.parse(savedData);
      
      // Basic validation
      if (!savedNotebook || !Array.isArray(savedNotebook.pages)) {
        throw new Error('Invalid notebook data');
      }
      
      notebook = savedNotebook;
      saveToHistory();
      redrawCanvas();
      updatePageIndicator();
      
      return true;
    } catch (e) {
      console.error('Error loading notebook:', e);
      return false;
    }
  }
  
  // Show notification
  function showNotification(message, type = 'info') {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    // Add some basic styles for the notification
    const style = document.createElement('style');
    style.textContent = `
      .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 4px;
        color: white;
        font-size: 14px;
        z-index: 1000;
        opacity: 0.95;
        transform: translateY(20px);
        transition: transform 0.3s, opacity 0.3s;
      }
      
      .notification.info { background-color: #4a90e2; }
      .notification.success { background-color: #4caf50; }
      .notification.error { background-color: #f44336; }
      
      .notification.fade-out {
        opacity: 0;
        transform: translateY(0);
      }
    `;
    
    if (!document.getElementById('notification-style')) {
      style.id = 'notification-style';
      document.head.appendChild(style);
    }
    
    // Trigger reflow
    void notification.offsetWidth;
    notification.style.transform = 'translateY(0)';
  }

    // Initialize the app
  init();
} // Close the appInit function