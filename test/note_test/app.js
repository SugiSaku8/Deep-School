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

// Global variables
const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = '#000000';
let currentSize = 0.5; // Default pen size in mm
let currentTool = 'pencil';
let notebook = {
    pages: [{
        id: Date.now().toString(),
        paths: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }],
    currentPageIndex: 0
};
let history = [];
let historyIndex = -1;
let currentPath = null;

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

// Get current page data
function getCurrentPage() {
    return notebook.pages[notebook.currentPageIndex];
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

// Update page indicator
function updatePageIndicator() {
    const indicator = document.getElementById('page-indicator');
    if (indicator) {
        indicator.textContent = `${notebook.currentPageIndex + 1}/${notebook.pages.length}`;
        
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (prevBtn) prevBtn.disabled = notebook.currentPageIndex === 0;
        if (nextBtn) nextBtn.disabled = notebook.currentPageIndex === notebook.pages.length - 1;
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
        timestamp: Date.now()
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

// Load notebook from localStorage
function loadNotebook() {
    const savedData = localStorage.getItem('notebookData');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            if (parsedData.pages && Array.isArray(parsedData.pages)) {
                notebook.pages = parsedData.pages;
                notebook.currentPageIndex = parsedData.currentPageIndex || 0;
                updatePageIndicator();
                return true;
            }
        } catch (e) {
            console.error('Failed to load notebook:', e);
        }
    }
    return false;
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

    // Initialize canvas event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch support for mobile devices
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e.touches[0]);
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e.touches[0]);
    });
    
    canvas.addEventListener('touchend', stopDrawing);

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