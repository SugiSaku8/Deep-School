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
          <input type="text" id="note-title" class="note-title" value="新しいノート" maxlength="50">
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
        border: none;
        border-radius: 8px;
        background: none;
        cursor: pointer;
        color: #000000;
        font-size: 17px;
        transition: background-color 0.2s;
      }
      
      .tool-button:hover {
        background-color: #f2f2f7;
      }
      
      .tool-button.active {
        background-color: #e5e5ea;
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
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: transform 0.1s;
      }

      .color-swatch:hover {
        transform: scale(1.1);
      }

      .color-swatch.active {
        border-color: #007AFF;
        box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
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

  // Initialize canvas and variables
  const canvas = document.getElementById('drawing-canvas');
  const ctx = canvas.getContext('2d');
  let lastX = 0;
  let lastY = 0;
  let currentColor = '#000000';
  let currentSize = 0.5; // Default pen size in mm
  let currentTool = 'pencil';

  // UI Elements
  const pencilTool = document.getElementById('pencil-tool');
  const highlighterTool = document.getElementById('highlighter-tool');
  const eraserTool = document.getElementById('eraser-tool');
  const penSizeSelect = document.getElementById('pen-size');
  const colorPicker = document.getElementById('color-picker');
  const clearCanvasBtn = document.getElementById('clear-canvas');
  const saveNoteBtn = document.getElementById('save-note');
  const newPageBtn = document.getElementById('new-page');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  const redSheetToggle = document.getElementById('red-sheet-toggle');
  const redSheet = document.getElementById('red-sheet');
  const redSheetControls = document.getElementById('red-sheet-controls');
  const sheetColorInput = document.getElementById('sheet-color');
  const sheetOpacityInput = document.getElementById('sheet-opacity');
  const noteTitleInput = document.getElementById('note-title');
  const importFileInput = document.getElementById('import-file');
  const pageIndicator = document.getElementById('page-indicator');
  const currentToolDisplay = document.getElementById('current-tool');
  
  // Set initial tool states
  updateActiveTool('pencil-tool');
  updatePageIndicator();

  // Get current page data
  function getCurrentPage() {
    return notebook.pages[notebook.currentPageIndex];
  }

  // Update page indicator
  function updatePageIndicator() {
    const currentPage = getCurrentPage();
    pageIndicator.textContent = `${notebook.currentPageIndex + 1}/${notebook.pages.length}`;
    noteTitleInput.value = currentPage.title || DEFAULT_NOTE_TITLE;
    
    // Update button states
    prevPageBtn.disabled = notebook.currentPageIndex === 0;
    nextPageBtn.disabled = notebook.currentPageIndex === notebook.pages.length - 1;
  }

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
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
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
    ctx.lineWidth = currentSize * (window.devicePixelRatio || 1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  // Stop drawing
  function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    
    // Only save to history when we actually drew something
    if (currentPath && currentPath.points.length > 1) {
      saveToHistory();
    }
    
    currentPath = null;
  }

  // Draw
  function draw(e) {
    if (!isDrawing || !currentPath) return;
    e.preventDefault();
    
    const { x, y } = getCanvasCoordinates(e);
    currentPath.points.push({ x, y });
    
    // Draw the line segment
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Start a new path for the next segment
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    [lastX, lastY] = [x, y];
  }

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

  // Undo last action
  function undo() {
    if (historyIndex <= 0) return;
    
    historyIndex--;
    loadFromHistory();
  }

  // Redo last undone action
  function redo() {
    if (historyIndex >= history.length - 1) return;
    
    historyIndex++;
    loadFromHistory();
  }

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

  // Event Listeners
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  // Touch support
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup');
    canvas.dispatchEvent(mouseEvent);
  });
  
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
  prevPageBtn.addEventListener('click', () => goToPage(notebook.currentPageIndex - 1));
  nextPageBtn.addEventListener('click', () => goToPage(notebook.currentPageIndex + 1));
  
  // Undo/Redo buttons
  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);
  
  // Red sheet mode
  redSheetToggle.addEventListener('click', () => {
    redSheet.style.display = redSheet.style.display === 'none' ? 'block' : 'none';
    redSheetControls.style.display = redSheetControls.style.display === 'none' ? 'flex' : 'none';
  });
  
  sheetColorInput.addEventListener('input', (e) => {
    redSheet.style.backgroundColor = e.target.value;
  });
  
  sheetOpacityInput.addEventListener('input', (e) => {
    redSheet.style.opacity = e.target.value;
  });
  
  // Note title
  noteTitleInput.addEventListener('change', (e) => {
    const currentPage = getCurrentPage();
    if (currentPage) {
      currentPage.title = e.target.value || DEFAULT_NOTE_TITLE;
      currentPage.updatedAt = new Date().toISOString();
      saveToHistory();
    }
  });
  
  // Clear canvas button
  clearCanvasBtn.addEventListener('click', clearCurrentPage);

  // Tool selection
  pencilTool.addEventListener('click', () => {
    currentTool = 'pencil';
    currentColor = colorPicker.value;
    currentSize = parseFloat(penSizeSelect.value);
    updateActiveTool('pencil-tool');
    currentToolDisplay.textContent = 'ペン';
  });

  highlighterTool.addEventListener('click', () => {
    currentTool = 'highlighter';
    currentColor = colorPicker.value + '80'; // Add transparency
    currentSize = parseFloat(penSizeSelect.value) * 2;
    updateActiveTool('highlighter-tool');
    currentToolDisplay.textContent = 'マーカー';
  });

  eraserTool.addEventListener('click', () => {
    currentTool = 'eraser';
    currentColor = '#ffffff';
    currentSize = parseFloat(penSizeSelect.value) * 2;
    updateActiveTool('eraser-tool');
    currentToolDisplay.textContent = '消しゴム';
  });

  function updateActiveTool(activeId) {
    [pencilTool, highlighterTool, eraserTool].forEach(tool => {
      tool.classList.toggle('active', tool.id === activeId);
    });
  }

  // Pen size change
  penSizeSelect.addEventListener('change', (e) => {
    currentSize = parseFloat(e.target.value);
  });

  // Color picker
  colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    if (currentTool === 'pencil') {
      updateActiveTool('pencil-tool');
    } else if (currentTool === 'highlighter') {
      updateActiveTool('highlighter-tool');
    }
  });

  // Clear button
  clearCanvasBtn.addEventListener('click', clearCanvas);

  // Save button
  saveNoteBtn.addEventListener('click', () => {
    // In a real app, you would implement save functionality
    alert('ノートを保存しました');
    saveState();
  });

  // New note button
  newNoteBtn.addEventListener('click', () => {
    if (confirm('新しいノートを作成しますか？現在のノートは保存されません。')) {
      paths = [];
      redrawCanvas();
      currentTool = 'pencil';
      currentColor = '#000000';
      currentSize = 2;
      updateActiveTool('pencil-tool');
      currentToolDisplay.textContent = 'ペン';
      colorPicker.value = currentColor;
    }
  });

  // Initialize
  function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Load saved notebook if available
    loadNotebook();
    
    // Initialize with empty history
    saveToHistory();
    
    // Set up event listeners for tool buttons
    pencilTool.addEventListener('click', () => setTool('pencil'));
    highlighterTool.addEventListener('click', () => setTool('highlighter'));
    eraserTool.addEventListener('click', () => setTool('eraser'));
    
    // Pen size change
    penSizeSelect.addEventListener('change', (e) => {
      currentSize = parseFloat(e.target.value);
    });
    
    // Color picker
    colorPicker.addEventListener('input', (e) => {
      currentColor = e.target.value;
      if (currentTool === 'pencil') {
        updateActiveTool('pencil-tool');
      } else if (currentTool === 'highlighter') {
        updateActiveTool('highlighter-tool');
      }
    });
    
    // Save button
    saveNoteBtn.addEventListener('click', saveNotebook);
    
    // New page button
    newPageBtn.addEventListener('click', addNewPage);
    
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
}