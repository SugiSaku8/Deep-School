// CodeEditor.js
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';

export default class CodeEditor {
    constructor(containerId, options = {}) {
        this.container = typeof containerId === 'string' 
            ? document.getElementById(containerId) 
            : containerId;
        
        this.options = {
            theme: 'dracula',
            mode: 'javascript',
            lineNumbers: true,
            autoCloseBrackets: true,
            ...options
        };

        this.init();
    }

    async init() {
        // Create editor container
        this.editorContainer = document.createElement('div');
        this.editorContainer.className = 'code-editor-container';
        this.container.appendChild(this.editorContainer);

        // Create toolbar
        this.createToolbar();

        // Create editor area
        this.textarea = document.createElement('textarea');
        this.editorContainer.appendChild(this.textarea);

        // Initialize CodeMirror
        this.editor = CodeMirror.fromTextArea(this.textarea, {
            mode: this.options.mode,
            theme: this.options.theme,
            lineNumbers: this.options.lineNumbers,
            autoCloseBrackets: this.options.autoCloseBrackets,
            extraKeys: {
                'Ctrl-Enter': () => this.runCode(),
                'Cmd-Enter': () => this.runCode(),
                'Ctrl-Space': 'autocomplete',
                'Ctrl-F': () => this.focusSearch(),
                'F3': () => this.findNext(),
                'Shift-F3': () => this.findPrev()
            }
        });

        // Create output container
        this.outputContainer = document.createElement('div');
        this.outputContainer.className = 'output-container';
        this.editorContainer.appendChild(this.outputContainer);

        // Load required scripts
        await this.loadScripts();
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';
        
        // Run button
        const runBtn = this.createButton('▶ 実行 (Ctrl+Enter)', 'run-button', () => this.runCode());
        
        // Search box
        const searchBox = document.createElement('div');
        searchBox.className = 'search-box';
        searchBox.innerHTML = `
            <input type="text" class="search-input" placeholder="検索...">
            <button class="search-btn">検索</button>
            <button class="replace-btn">置換</button>
            <input type="text" class="replace-input" placeholder="置換...">
        `;
        
        toolbar.appendChild(runBtn);
        toolbar.appendChild(searchBox);
        this.editorContainer.appendChild(toolbar);

        // Add event listeners
        const searchInput = searchBox.querySelector('.search-input');
        const replaceInput = searchBox.querySelector('.replace-input');
        const searchBtn = searchBox.querySelector('.search-btn');
        const replaceBtn = searchBox.querySelector('.replace-btn');

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.findNext();
            }
        });

        searchBtn.addEventListener('click', () => this.findNext());
        replaceBtn.addEventListener('click', () => this.replaceNext());
    }

    async runCode() {
        const code = this.editor.getValue();
        this.clearOutput();

        // Create output area
        const outputDiv = document.createElement('div');
        outputDiv.className = 'code-output';
        this.outputContainer.appendChild(outputDiv);

        try {
            // Create a sandboxed iframe for execution
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            // Add output function to iframe
            iframe.contentWindow.console = {
                log: (...args) => {
                    const output = args.map(arg => 
                        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                    ).join(' ');
                    
                    const line = document.createElement('div');
                    line.className = 'output-line';
                    line.textContent = output;
                    outputDiv.appendChild(line);
                }
            };

            // Add lib.import support
            iframe.contentWindow.lib = {
                import: async (libName) => {
                    return new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = `https://cdn.jsdelivr.net/npm/${libName}`;
                        script.onload = () => {
                            const lib = libName.split('/').pop().split('@')[0];
                            resolve(iframe.contentWindow[lib] || iframe.contentWindow);
                        };
                        script.onerror = () => reject(new Error(`Failed to load library: ${libName}`));
                        iframe.contentDocument.head.appendChild(script);
                    });
                }
            };

            // Execute code in iframe
            const script = iframe.contentDocument.createElement('script');
            script.text = `
                try {
                    ${code.replace(/^(\s*lib\.import\(['"][^'"]+['"]\);?$)/gm, '')}
                    console.log('Execution completed');
                } catch (e) {
                    console.error('Error:', e.message);
                }
            `;
            iframe.contentDocument.body.appendChild(script);

            // Clean up
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);

        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = `Error: ${error.message}`;
            outputDiv.appendChild(errorDiv);
        }
    }

    clearOutput() {
        this.outputContainer.innerHTML = '';
    }

    focusSearch() {
        const searchInput = this.editorContainer.querySelector('.search-input');
        searchInput?.focus();
    }

    findNext() {
        const searchInput = this.editorContainer.querySelector('.search-input');
        if (!searchInput) return;
        
        const query = searchInput.value;
        if (!query) return;

        const cursor = this.editor.getSearchCursor(query, this.editor.getCursor());
        if (cursor.findNext()) {
            this.editor.setSelection(cursor.from(), cursor.to());
            this.editor.scrollIntoView(cursor.from());
        }
    }

    findPrev() {
        const searchInput = this.editorContainer.querySelector('.search-input');
        if (!searchInput) return;
        
        const query = searchInput.value;
        if (!query) return;

        const cursor = this.editor.getSearchCursor(query, this.editor.getCursor());
        if (cursor.findPrevious()) {
            this.editor.setSelection(cursor.from(), cursor.to());
            this.editor.scrollIntoView(cursor.from());
        }
    }

    replaceNext() {
        const searchInput = this.editorContainer.querySelector('.search-input');
        const replaceInput = this.editorContainer.querySelector('.replace-input');
        if (!searchInput || !replaceInput) return;
        
        const query = searchInput.value;
        if (!query) return;

        const cursor = this.editor.getSearchCursor(query, this.editor.getCursor());
        if (cursor.findNext()) {
            cursor.replace(replaceInput.value);
        }
    }

    async loadScripts() {
        const scripts = [
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.js',
            'https://cdnjs.cloudir.net/npm/@codemirror/lang-javascript@6.0.0/+esm',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/theme/dracula.min.css'
        ];

        for (const src of scripts) {
            await new Promise((resolve) => {
                if (src.endsWith('.js')) {
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = resolve;
                    document.head.appendChild(script);
                } else {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = src;
                    link.onload = resolve;
                    document.head.appendChild(link);
                }
            });
        }
    }

    // Public methods
    getValue() {
        return this.editor.getValue();
    }

    setValue(content) {
        this.editor.setValue(content);
    }

    on(event, callback) {
        this.editor.on(event, callback);
    }

    static create(containerId, options) {
        return new CodeEditor(containerId, options);
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-code-editor]').forEach(container => {
        const options = container.dataset.options 
            ? JSON.parse(container.dataset.options)
            : {};
        new CodeEditor(container, options);
    });
});