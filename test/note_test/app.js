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

// Constants
const APP_VERSION = '1.0.0';
const LOCAL_STORAGE_KEY = 'noteAppData';
const DEFAULT_NOTE_TITLE = '無題のノート';

// State
let currentNoteId = null;
let notesList = [];

// DOM Elements
const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = 'pencil';
let currentColor = '#000000';
let currentSize = 0.5; // Default size in mm
let paths = [];
let currentPath = [];
let redoStack = [];
let historyStack = [];
let historyIndex = -1;

    // UI Elements
    const pencilTool = document.getElementById('pencil-tool');
    const highlighterTool = document.getElementById('highlighter-tool');
    const eraserTool = document.getElementById('eraser-tool');
    const penSizeSelect = document.getElementById('pen-size');
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const customColorInput = document.getElementById('custom-color');
    const colorPicker = document.getElementById('color-picker');
    const redSheetToggle = document.getElementById('red-sheet-toggle');
    const redSheet = document.getElementById('red-sheet');
    const redSheetControls = document.getElementById('red-sheet-controls');
    const sheetColorInput = document.getElementById('sheet-color');
    const hiddenColorInput = document.getElementById('hidden-color');
    const sheetOpacityInput = document.getElementById('sheet-opacity');
    const clearCanvasBtn = document.getElementById('clear-canvas');
    const saveCanvasBtn = document.getElementById('save-canvas');

    // Initialize canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        redrawCanvas();
    }

    // Redraw all paths on the canvas
    function redrawCanvas() {
        // Clear the entire canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create a temporary canvas to handle erasing
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // First pass: Draw all non-eraser paths
        paths.forEach(path => {
            if (path.points.length < 2) return;
            
            tempCtx.beginPath();
            tempCtx.moveTo(path.points[0].x, path.points[0].y);
            
            for (let i = 1; i < path.points.length; i++) {
                const point = path.points[i];
                tempCtx.lineTo(point.x, point.y);
            }
            
            tempCtx.strokeStyle = path.color;
            tempCtx.lineWidth = path.size;
            tempCtx.lineCap = 'round';
            tempCtx.lineJoin = 'round';
            
            if (path.tool === 'highlighter') {
                tempCtx.globalAlpha = 0.4;
            } else if (path.tool === 'eraser') {
                // Skip eraser paths in first pass
                return;
            } else {
                tempCtx.globalAlpha = 1.0;
            }
            
            tempCtx.stroke();
            tempCtx.globalAlpha = 1.0;
        });
        
        // Second pass: Apply eraser paths
        paths.forEach(path => {
            if (path.tool !== 'eraser' || path.points.length < 2) return;
            
            tempCtx.globalCompositeOperation = 'destination-out';
            tempCtx.beginPath();
            tempCtx.moveTo(path.points[0].x, path.points[0].y);
            
            for (let i = 1; i < path.points.length; i++) {
                const point = path.points[i];
                tempCtx.lineTo(point.x, point.y);
            }
            
            tempCtx.strokeStyle = 'rgba(0, 0, 0, 1)';
            tempCtx.lineWidth = path.size;
            tempCtx.lineCap = 'round';
            tempCtx.lineJoin = 'round';
            tempCtx.stroke();
            
            // Reset composition for next path
            tempCtx.globalCompositeOperation = 'source-over';
        });
        
        // Draw the result to the main canvas
        ctx.drawImage(tempCanvas, 0, 0);
    }

    // Start drawing
    function startDrawing(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        
        lastX = x;
        lastY = y;
        
        // Start a new path
        currentPath = {
            tool: currentTool,
            color: currentColor,
            size: currentSize * (window.devicePixelRatio || 1) * 2, // Convert mm to pixels
            points: [{ x, y }]
        };
        
        // If we have a redo stack and we start drawing, clear it
        if (redoStack.length > 0) {
            redoStack = [];
        }
    }

    // Draw
    function draw(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        
        // Add point to current path
        currentPath.points.push({ x, y });
        
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

    // Stop drawing
    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            
            // Only add the path if it has more than one point
            if (currentPath.points.length > 1) {
                // Save current state to history before making changes
                saveToHistory();
                
                // Add the new path
                paths.push(currentPath);
                
                // Clear redo stack when making new changes
                redoStack = [];
                
                // Update UI
                updateUndoRedoButtons();
                
                // Auto-save after drawing
                autoSave();
            }
            
            currentPath = [];
        }
    }
    
    // Save current state to history
    function saveToHistory() {
        // Don't save if nothing has changed
        if (historyIndex >= 0 && JSON.stringify(historyStack[historyIndex]) === JSON.stringify(paths)) {
            return;
        }
        
        // Remove any redo history after current position
        if (historyIndex < historyStack.length - 1) {
            historyStack = historyStack.slice(0, historyIndex + 1);
        }
        
        // Add current state to history
        historyStack.push(JSON.parse(JSON.stringify(paths)));
        historyIndex++;
        
        // Limit history size (keep last 50 states)
        if (historyStack.length > 50) {
            historyStack.shift();
            historyIndex--;
        }
        
        updateUndoRedoButtons();
    }
    
    // Undo last action
    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            paths = JSON.parse(JSON.stringify(historyStack[historyIndex]));
            redrawCanvas();
            updateUndoRedoButtons();
            autoSave();
        }
    }
    
    // Redo last undone action
    function redo() {
        if (historyIndex < historyStack.length - 1) {
            historyIndex++;
            paths = JSON.parse(JSON.stringify(historyStack[historyIndex]));
            redrawCanvas();
            updateUndoRedoButtons();
            autoSave();
        }
    }
    
    // Update undo/redo button states
    function updateUndoRedoButtons() {
        document.getElementById('undo-btn').disabled = historyIndex <= 0;
        document.getElementById('redo-btn').disabled = historyIndex >= historyStack.length - 1;
    }

    // Clear the canvas
    function clearCanvas() {
        if (confirm('描画をすべて消去しますか？')) {
            saveToHistory();
            paths = [];
            redrawCanvas();
            autoSave();
        }
    }
    
    // Create a new note
    function newNote() {
        if (paths.length > 0 && !confirm('現在のノートを保存せずに新規作成しますか？')) {
            return;
        }
        
        currentNoteId = `note-${Date.now()}`;
        paths = [];
        historyStack = [];
        historyIndex = -1;
        redrawCanvas();
        updateDocumentTitle(DEFAULT_NOTE_TITLE);
        saveToHistory();
    }
    
    // Save note to localStorage
    function saveNote() {
        if (!currentNoteId) {
            currentNoteId = `note-${Date.now()}`;
        }
        
        const noteData = createNoteData();
        localStorage.setItem(currentNoteId, JSON.stringify(noteData));
        
        // Update notes list
        updateNotesList(currentNoteId, noteData.metadata.title);
        
        // Show success message
        showNotification('ノートを保存しました');
    }
    
    // Auto-save note
    function autoSave() {
        if (!currentNoteId) return;
        
        const noteData = createNoteData();
        localStorage.setItem(currentNoteId, JSON.stringify(noteData));
        
        // Update notes list without showing notification
        updateNotesList(currentNoteId, noteData.metadata.title, true);
    }
    
    // Create note data object
    function createNoteData() {
        const now = new Date().toISOString();
        const title = document.title === DEFAULT_NOTE_TITLE ? DEFAULT_NOTE_TITLE : document.title;
        
        return {
            version: APP_VERSION,
            metadata: {
                createdAt: currentNoteId ? getNoteMetadata(currentNoteId)?.createdAt || now : now,
                updatedAt: now,
                title: title,
                width: canvas.width,
                height: canvas.height
            },
            paths: paths
        };
    }
    
    // Get note metadata from localStorage
    function getNoteMetadata(noteId) {
        const data = localStorage.getItem(noteId);
        if (!data) return null;
        
        try {
            const parsed = JSON.parse(data);
            return parsed.metadata || null;
        } catch (e) {
            console.error('Failed to parse note metadata:', e);
            return null;
        }
    }
    
    // Update notes list in localStorage
    function updateNotesList(noteId, title, silent = false) {
        let notes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        
        // Update or add note to list
        const existingIndex = notes.findIndex(note => note.id === noteId);
        const noteInfo = {
            id: noteId,
            title: title,
            updatedAt: new Date().toISOString()
        };
        
        if (existingIndex >= 0) {
            notes[existingIndex] = noteInfo;
        } else {
            notes.unshift(noteInfo);
        }
        
        // Keep only the 50 most recent notes
        if (notes.length > 50) {
            notes = notes.slice(0, 50);
        }
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
        
        if (!silent) {
            showNotification('ノートを保存しました');
        }
    }
    
    // Load note from localStorage
    function loadNote(noteId) {
        const data = localStorage.getItem(noteId);
        if (!data) {
            showNotification('ノートの読み込みに失敗しました', 'error');
            return false;
        }
        
        try {
            const noteData = JSON.parse(data);
            
            // Validate note data
            if (!noteData.paths || !Array.isArray(noteData.paths)) {
                throw new Error('Invalid note format');
            }
            
            // Update current note
            currentNoteId = noteId;
            paths = noteData.paths;
            
            // Reset history
            historyStack = [JSON.parse(JSON.stringify(paths))];
            historyIndex = 0;
            
            // Update UI
            redrawCanvas();
            updateUndoRedoButtons();
            updateDocumentTitle(noteData.metadata?.title || DEFAULT_NOTE_TITLE);
            
            return true;
        } catch (e) {
            console.error('Failed to load note:', e);
            showNotification('ノートの読み込みに失敗しました', 'error');
            return false;
        }
    }
    
    // Show note load dialog
    function showLoadDialog() {
        const notes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        
        if (notes.length === 0) {
            showNotification('保存されたノートがありません', 'info');
            return;
        }
        
        const dialog = document.createElement('div');
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <h3>ノートを開く</h3>
                <div class="notes-list">
                    ${notes.map(note => `
                        <div class="note-item" data-id="${note.id}">
                            <div class="note-title">${note.title || '無題のノート'}</div>
                            <div class="note-date">${formatDate(note.updatedAt)}</div>
                            <button class="delete-note" data-id="${note.id}">削除</button>
                        </div>
                    `).join('')}
                </div>
                <div class="modal-actions">
                    <button id="cancel-load">キャンセル</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Add event listeners
        dialog.querySelectorAll('.note-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-note')) {
                    const noteId = item.getAttribute('data-id');
                    loadNote(noteId);
                    dialog.remove();
                }
            });
        });
        
        dialog.querySelectorAll('.delete-note').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteId = btn.getAttribute('data-id');
                if (confirm('このノートを削除しますか？この操作は元に戻せません。')) {
                    deleteNote(noteId);
                    btn.closest('.note-item').remove();
                    
                    // If we deleted the current note, create a new one
                    if (currentNoteId === noteId) {
                        newNote();
                    }
                }
            });
        });
        
        dialog.querySelector('#cancel-load').addEventListener('click', () => {
            dialog.remove();
        });
    }
    
    // Delete note
    function deleteNote(noteId) {
        // Remove from localStorage
        localStorage.removeItem(noteId);
        
        // Update notes list
        let notes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        notes = notes.filter(note => note.id !== noteId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
    }
    
    // Export note as file
    function exportNote() {
        const noteData = createNoteData();
        const dataStr = JSON.stringify(noteData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `note-${new Date().toISOString().slice(0, 10)}.dpsnote`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('ノートをエクスポートしました');
    }
    
    // Import note from file
    function importNote() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.dpsnote,application/json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const noteData = JSON.parse(event.target.result);
                    
                    // Validate imported data
                    if (!noteData.paths || !Array.isArray(noteData.paths)) {
                        throw new Error('Invalid note format');
                    }
                    
                    // Create a new note with the imported data
                    currentNoteId = `imported-${Date.now()}`;
                    paths = noteData.paths;
                    
                    // Reset history
                    historyStack = [JSON.parse(JSON.stringify(paths))];
                    historyIndex = 0;
                    
                    // Update UI
                    redrawCanvas();
                    updateUndoRedoButtons();
                    
                    const title = noteData.metadata?.title || 'インポートしたノート';
                    updateDocumentTitle(title);
                    
                    // Auto-save the imported note
                    saveNote();
                    
                    showNotification('ノートをインポートしました');
                } catch (e) {
                    console.error('Failed to import note:', e);
                    showNotification('ノートのインポートに失敗しました', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // Update document title
    function updateDocumentTitle(title) {
        document.title = title || DEFAULT_NOTE_TITLE;
    }
    
    // Format date for display
    function formatDate(isoString) {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    
    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Update red sheet appearance
    function updateRedSheet() {
        const sheetColor = sheetColorInput.value;
        const hiddenColor = hiddenColorInput.value;
        const opacity = sheetOpacityInput.value;
        
        // Create a gradient that makes the hidden color transparent
        redSheet.style.background = `
            linear-gradient(
                to right,
                ${sheetColor},
                ${sheetColor}
            ),
            linear-gradient(
                to right,
                ${hiddenColor},
                ${hiddenColor}
            )
        `;
        redSheet.style.backgroundBlendMode = 'normal, difference';
        redSheet.style.opacity = opacity;
        
        // Update the hidden color preview
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            if (swatch.dataset.color === hiddenColor.toLowerCase()) {
                swatch.style.border = '2px solid #ff0000';
                swatch.style.boxShadow = '0 0 0 2px rgba(255,0,0,0.3)';
            } else {
                swatch.style.border = '';
                swatch.style.boxShadow = '';
            }
        });
    }

    // Event Listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e);
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e);
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopDrawing();
    }, { passive: false });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Undo: Ctrl+Z or Cmd+Z
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                redo();
            } else {
                undo();
            }
        }
        
        // Save: Ctrl+S or Cmd+S
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveNote();
        }
        
        // New: Ctrl+N or Cmd+N
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            newNote();
        }
    });

    // Tool selection
    pencilTool.addEventListener('click', () => {
        currentTool = 'pencil';
        document.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('active'));
        pencilTool.classList.add('active');
    });

    highlighterTool.addEventListener('click', () => {
        currentTool = 'highlighter';
        document.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('active'));
        highlighterTool.classList.add('active');
    });

    eraserTool.addEventListener('click', () => {
        currentTool = 'eraser';
        document.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('active'));
        eraserTool.classList.add('active');
    });

    // Pen size
    penSizeSelect.addEventListener('change', (e) => {
        currentSize = parseFloat(e.target.value);
    });

    // Color selection
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            currentColor = e.target.dataset.color || e.target.style.backgroundColor;
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            e.target.classList.add('active');
            customColorInput.value = rgbToHex(currentColor);
        });
    });

    // Custom color picker
    colorPicker.addEventListener('click', () => {
        customColorInput.click();
    });

    customColorInput.addEventListener('input', (e) => {
        currentColor = e.target.value;
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    });

    // Red sheet controls
    redSheetToggle.addEventListener('click', () => {
        redSheet.classList.toggle('active');
        redSheetControls.classList.toggle('hidden');
    });

    sheetColorInput.addEventListener('input', (e) => {
        updateRedSheet();
    });

    sheetOpacityInput.addEventListener('input', (e) => {
        updateRedSheet();
    });
    
    // File operations
    document.getElementById('new-note').addEventListener('click', newNote);
    document.getElementById('save-note').addEventListener('click', saveNote);
    document.getElementById('load-note').addEventListener('click', showLoadDialog);
    document.getElementById('export-note').addEventListener('click', exportNote);
    document.getElementById('import-note').addEventListener('click', importNote);
    document.getElementById('clear-canvas').addEventListener('click', clearCanvas);
    
    // Undo/Redo buttons
    document.getElementById('undo-btn').addEventListener('click', undo);
    document.getElementById('redo-btn').addEventListener('click', redo);
    
    // Auto-save every 30 seconds
    setInterval(() => {
        if (paths.length > 0) {
            autoSave();
        }
    }, 30000);
    
    // Handle page unload
    window.addEventListener('beforeunload', (e) => {
        if (paths.length > 0) {
            autoSave();
            // Show a confirmation dialog
            e.preventDefault();
            e.returnValue = '変更が保存されていない可能性があります。ページを離れますか？';
            return e.returnValue;
        }
    });

    // Window resize handler
    window.addEventListener('resize', () => {
        const oldPaths = [...paths];
        resizeCanvas();
        paths = oldPaths;
        redrawCanvas();
    });

    // Helper function to convert RGB to HEX
    function rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;
        
        // Extract the r, g, b values from rgb() or rgba() string
        const rgbValues = rgb.match(/\d+/g);
        if (!rgbValues || rgbValues.length < 3) return '#000000';
        
        const r = parseInt(rgbValues[0]).toString(16).padStart(2, '0');
        const g = parseInt(rgbValues[1]).toString(16).padStart(2, '0');
        const b = parseInt(rgbValues[2]).toString(16).padStart(2, '0');
        
        return `#${r}${g}${b}`.toUpperCase();
    }

    // Initialize color swatches
    function initColorSwatches() {
        const colors = [
            '#000000', '#FF3B30', '#007AFF', '#34C759', '#FFCC00',
            '#5AC8FA', '#AF52DE', '#FF9500', '#FF2D55', '#8E8E93'
        ];
        
        const container = document.querySelector('.color-palette');
        container.innerHTML = '';
        
        colors.forEach(color => {
            const swatch = document.createElement('button');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.dataset.color = color;
            swatch.title = color;
            
            // Show the color value on hover
            const tooltip = document.createElement('span');
            tooltip.className = 'color-tooltip';
            tooltip.textContent = color;
            swatch.appendChild(tooltip);
            
            swatch.addEventListener('click', (e) => {
                currentColor = color;
                document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                customColorInput.value = color;
                
                // If red sheet is active, update the hidden color
                if (redSheet.classList.contains('active')) {
                    hiddenColorInput.value = color;
                    updateRedSheet();
                }
            });
            
            container.appendChild(swatch);
        });
        
        // Set the first color as active by default
        if (container.firstChild) {
            container.firstChild.classList.add('active');
            currentColor = colors[0];
        }
    }
    
    // Initialize
    function init() {
        resizeCanvas();
        initColorSwatches();
        updateRedSheet();
        
        // Set initial active states
        pencilTool.classList.add('active');
        
        // Set initial pen size
        currentSize = parseFloat(penSizeSelect.value);
        
        // Initialize color picker
        customColorInput.addEventListener('input', (e) => {
            currentColor = e.target.value;
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        });
        
        // Check for URL parameters (for opening specific notes)
        const urlParams = new URLSearchParams(window.location.search);
        const noteId = urlParams.get('note');
        
        if (noteId && localStorage.getItem(noteId)) {
            // Load the specified note
            loadNote(noteId);
        } else if (localStorage.getItem(LOCAL_STORAGE_KEY)) {
            // Try to load the most recent note
            const notes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
            if (notes.length > 0) {
                // Ask if user wants to continue last session
                if (confirm('前回のセッションを続けますか？')) {
                    loadNote(notes[0].id);
                    return;
                }
            }
        }
        
        // Start with a new note if nothing else to load
        newNote();
    }
    
    // Initialize the app
    init();