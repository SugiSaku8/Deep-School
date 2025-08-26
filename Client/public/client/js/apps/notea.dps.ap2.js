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

  // Create app container
  root.innerHTML = `
    <div class="note-app-container">
      <div class="toolbar">
        <div class="tool-group">
          <button id="pencil-tool" class="tool-button active" title="ペン">
            <i class="fas fa-pen"></i>
          </button>
          <button id="highlighter-tool" class="tool-button" title="マーカー">
            <i class="fas fa-highlighter"></i>
          </button>
          <button id="eraser-tool" class="tool-button" title="消しゴム">
            <i class="fas fa-eraser"></i>
          </button>
          <select id="pen-size" class="tool-select">
            <option value="0.3">細い</option>
            <option value="0.5" selected>標準</option>
            <option value="1.0">太い</option>
            <option value="2.0">とても太い</option>
          </select>
          <input type="color" id="color-picker" value="#000000" title="色を選択">
          <button id="clear-canvas" class="tool-button danger" title="クリア">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="tool-group">
          <button id="save-note" class="tool-button primary" title="保存">
            <i class="fas fa-save"></i> 保存
          </button>
          <button id="new-note" class="tool-button" title="新規ノート">
            <i class="fas fa-file"></i> 新規
          </button>
        </div>
      </div>
      
      <div class="canvas-container">
        <canvas id="drawing-canvas"></canvas>
      </div>
      
      <div class="status-bar">
        <span id="current-tool">ペン</span>
        <span id="page-info">1/1</span>
      </div>
    </div>
    
    <style>
      .note-app-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: #f5f5f5;
      }
      
      .toolbar {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        background-color: #fff;
        border-bottom: 1px solid #ddd;
        flex-wrap: wrap;
      }
      
      .tool-group {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
      
      .tool-button {
        padding: 8px 12px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .tool-button:hover {
        background-color: #f0f0f0;
      }
      
      .tool-button.active {
        background-color: #e0e0e0;
        border-color: #999;
      }
      
      .tool-button.primary {
        background-color: #4a90e2;
        color: white;
        border-color: #357abd;
      }
      
      .tool-button.danger {
        color: #e74c3c;
      }
      
      .tool-select {
        padding: 6px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .canvas-container {
        flex: 1;
        position: relative;
        overflow: hidden;
        background-color: white;
      }
      
      #drawing-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        touch-action: none;
      }
      
      .status-bar {
        padding: 4px 12px;
        background-color: #f0f0f0;
        border-top: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        font-size: 0.9em;
        color: #666;
      }
    </style>
  `;

  // Initialize canvas and variables
  const canvas = document.getElementById('drawing-canvas');
  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentColor = '#000000';
  let currentSize = 2; // Default pen size in pixels
  let currentTool = 'pencil';
  let currentPath = null;
  let paths = [];

  // UI Elements
  const pencilTool = document.getElementById('pencil-tool');
  const highlighterTool = document.getElementById('highlighter-tool');
  const eraserTool = document.getElementById('eraser-tool');
  const penSizeSelect = document.getElementById('pen-size');
  const colorPicker = document.getElementById('color-picker');
  const clearCanvasBtn = document.getElementById('clear-canvas');
  const saveNoteBtn = document.getElementById('save-note');
  const newNoteBtn = document.getElementById('new-note');
  const currentToolDisplay = document.getElementById('current-tool');
  const pageInfoDisplay = document.getElementById('page-info');

  // Initialize canvas size
  function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    redrawCanvas();
  }

  // Redraw all paths on the canvas
  function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);
    
    paths.forEach(path => {
      if (path.points.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
    
    ctx.restore();
  }

  // Get canvas coordinates
  function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  // Start drawing
  function startDrawing(e) {
    isDrawing = true;
    const { x, y } = getCanvasCoordinates(e);
    [lastX, lastY] = [x, y];
    
    currentPath = {
      tool: currentTool,
      color: currentColor,
      size: currentSize,
      points: [{ x, y }]
    };
    
    paths.push(currentPath);
  }

  // Stop drawing
  function stopDrawing() {
    isDrawing = false;
    currentPath = null;
    saveState();
  }

  // Draw
  function draw(e) {
    if (!isDrawing) return;
    
    const { x, y } = getCanvasCoordinates(e);
    currentPath.points.push({ x, y });
    
    // Draw only the last segment for better performance
    const prevX = currentPath.points[currentPath.points.length - 2].x;
    const prevY = currentPath.points[currentPath.points.length - 2].y;
    
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentPath.color;
    ctx.lineWidth = currentPath.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    [lastX, lastY] = [x, y];
  }

  // Save current state
  function saveState() {
    // In a real app, you would save to localStorage or a backend
    console.log('Saving note state...');
  }

  // Clear canvas
  function clearCanvas() {
    if (confirm('描画をすべて消去しますか？この操作は元に戻せません。')) {
      paths = [];
      redrawCanvas();
      saveState();
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
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup');
    canvas.dispatchEvent(mouseEvent);
  });

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
    updateActiveTool('pencil-tool');
    currentToolDisplay.textContent = 'ペン';
  }

  init();
}