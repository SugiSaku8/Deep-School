export const appMeta = {
  name: "koodi_studio",
  title: "Koodi Studio",
  icon: "re/ico/Koodi-Studio-icon.png",
  description: "インタラクティブにJavaScriptを学べるコードエディタ"
};

// レッスンデータ
const lessons = [
  {
    id: 'welcome',
    title: 'ようこそ Koodi Studio へ',
    content: `
      <h2>Koodi Studio へようこそ！</h2>
      <p>このアプリでは、JavaScript をインタラクティブに学ぶことができます。</p>
      <p>右側のエディタでコードを書いて、実行ボタンを押してみましょう。</p>
    `,
    code: '// 最初のプログラムを書いてみよう！\nconsole.log("Hello, Koodi Studio!");',
    hint: '「実行」ボタンを押して、コンソールにメッセージを表示させてみましょう。'
  },
  {
    id: 'variables',
    title: '変数を使ってみよう',
    content: `
      <h2>変数とは？</h2>
      <p>変数は、データを保存するための箱のようなものです。</p>
      <p><code>let</code> キーワードを使って変数を宣言します。</p>
      <pre><code>let message = "こんにちは";
console.log(message); // 変数の値を表示</code></pre>
    `,
    code: '// 変数を使ってみよう\nlet greeting = "こんにちは";\nconsole.log(greeting);',
    hint: '変数 greeting にメッセージを代入して、コンソールに表示させてみましょう。'
  },
  {
    id: 'functions',
    title: '関数を書いてみよう',
    content: `
      <h2>関数の基本</h2>
      <p>関数は、再利用可能なコードのブロックです。</p>
      <pre><code>function greet(name) {
  return "こんにちは、" + name + "さん！";
}

console.log(greet("太郎"));</code></pre>
    `,
    code: '// 挨拶をする関数を作ろう\nfunction greet(name) {\n  // ここにコードを書く\n}\n\n// 関数を呼び出してみよう\nconsole.log(greet("太郎"));',
    hint: '関数内で「こんにちは、」と名前を組み合わせた文字列を返しましょう。'
  }
];

// アプリケーションの状態
let currentLessonIndex = 0;
let koodiEditor = null;

// コードエディタのインスタンス
let codeEditor = null;

// アプリケーションのUIをレンダリング
function renderApp() {
  const currentLesson = lessons[currentLessonIndex];
  
  // メインアプリケーションのHTML
  const appHTML = `
    <div class="koodi-app">
      <div class="lesson-sidebar">
        <h2>レッスン一覧</h2>
        <ul class="lesson-list">
          ${lessons.map((lesson, index) => `
            <li class="${index === currentLessonIndex ? 'active' : ''}" 
                data-lesson-index="${index}">
              ${lesson.title}
            </li>
          `).join('')}
        </ul>
      </div>
      
      <div class="main-content">
        <div class="lesson-content">
          <h1>${currentLesson.title}</h1>
          <div class="lesson-text">${currentLesson.content}</div>
          <div class="hint" style="display: none;">
            <strong>ヒント:</strong> ${currentLesson.hint}
          </div>
          <div class="lesson-actions">
            <button class="hint-button">ヒントを見る</button>
          </div>
        </div>
        
        <div class="editor-container">
          <div class="editor-toolbar">
            <button class="run-button">▶ 実行 (Ctrl+Enter)</button>
            <div class="lesson-navigation">
              <button class="nav-button back-to-menu">← メニューに戻る</button>
              ${currentLessonIndex > 0 ? 
                `<button class="nav-button prev-lesson">← 前のレッスン</button>` : ''}
              ${currentLessonIndex < lessons.length - 1 ? 
                `<button class="nav-button next-lesson">次のレッスン →</button>` : 
                '<button class="nav-button complete-lesson">おめでとうございます！</button>'}
            </div>
          </div>
          <div id="code-editor"></div>
          <div class="output-container">
            <h3>出力</h3>
            <div class="output-content"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return appHTML;
}

// コードエディタを初期化
function initCodeEditor() {
  const editorElement = document.getElementById('code-editor');
  if (!editorElement) return;
  
  const currentLesson = lessons[currentLessonIndex];
  
  // コードエディタの初期化
  koodiEditor = CodeMirror(editorElement, {
    value: currentLesson.code,
    mode: 'javascript',
    theme: 'dracula',
    lineNumbers: true,
    autoCloseBrackets: true,
    indentUnit: 2,
    tabSize: 2,
    lineWrapping: true,
    matchBrackets: true,
    extraKeys: {
      'Ctrl-Enter': executeCode,
      'Cmd-Enter': executeCode
    }
  });
  
  // 実行ボタンのイベントリスナー
  const runButton = document.querySelector('.run-button');
  if (runButton) {
    runButton.addEventListener('click', executeCode);
  }
  
  // ヒントボタンのイベントリスナー
  const hintButton = document.querySelector('.hint-button');
  if (hintButton) {
    hintButton.addEventListener('click', () => {
      const hintElement = document.querySelector('.hint');
      if (hintElement) {
        hintElement.style.display = hintElement.style.display === 'none' ? 'block' : 'none';
      }
    });
  }
  
  // レッスンナビゲーションのイベントリスナー
  document.querySelectorAll('.lesson-list li').forEach(item => {
    item.addEventListener('click', (e) => {
      const lessonIndex = parseInt(e.currentTarget.getAttribute('data-lesson-index'));
      if (!isNaN(lessonIndex) && lessonIndex !== currentLessonIndex) {
        loadLesson(lessonIndex);
      }
    });
  });
  
  // 前のレッスンボタン
  const prevButton = document.querySelector('.prev-lesson');
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (currentLessonIndex > 0) {
        loadLesson(currentLessonIndex - 1);
      }
    });
  }
  
  // 次のレッスンボタン
  const nextButton = document.querySelector('.next-lesson');
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentLessonIndex < lessons.length - 1) {
        loadLesson(currentLessonIndex + 1);
      }
    });
  }
  
  // 完了ボタン
  const completeButton = document.querySelector('.complete-lesson');
  if (completeButton) {
    completeButton.addEventListener('click', () => {
      alert('おめでとうございます！すべてのレッスンを完了しました！');
    });
  }
  
  // キーボードショートカット
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeCode();
    }
  });
}

// コードを実行
function executeCode() {
  const code = koodiEditor ? koodiEditor.getValue() : '';
  const outputElement = document.querySelector('.output-content');
  
  if (!outputElement) return;
  
  // 出力をクリア
  outputElement.innerHTML = '';
  
  // シェルにログを送信
  const shellLog = (type, args) => {
    const message = Array.from(args).map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    const logElement = document.createElement('div');
    logElement.className = `output-${type}`;
    logElement.textContent = `[${type.toUpperCase()}] ${message}`;
    outputElement.appendChild(logElement);
    
    // シェルにログを送信
    if (window.shell) {
      window.shell.log({ 
        from: 'dp.app.koodistudio.exec', 
        message: message,
        level: type === 'error' ? 'error' : 'log'
      });
    }
  };
  
  // コンソールメソッドをオーバーライド
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
  };
  
  console.log = (...args) => { shellLog('log', args); originalConsole.log(...args); };
  console.warn = (...args) => { shellLog('warn', args); originalConsole.warn(...args); };
  console.error = (...args) => { shellLog('error', args); originalConsole.error(...args); };
  
  try {
    // コードを取得
    const code = koodiEditor ? koodiEditor.getValue() : '';
    if (!code) {
      outputElement.innerHTML = '<div class="no-code">実行するコードがありません</div>';
      return;
    }
    
    // コンソール出力をキャプチャするための変数
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };
    
    let output = [];
    
    // コンソールメソッドをオーバーライド
    const captureConsole = (type) => (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      output.push({
        type,
        message,
        timestamp: new Date().toISOString()
      });
      
      // 元のコンソールメソッドを呼び出す
      originalConsole[type].apply(console, args);
    };
    
    // コンソールをオーバーライド
    console.log = captureConsole('log');
    console.warn = captureConsole('warn');
    console.error = captureConsole('error');
    console.info = captureConsole('info');
    
    // コードを実行
    try {
      // 安全のため、new Function を使用
      const result = new Function(code)();
      
      // 戻り値がある場合は出力に追加
      if (result !== undefined) {
        output.push({
          type: 'return',
          message: String(result),
          timestamp: new Date().toISOString()
        });
      }
      
      // 出力を表示
      if (output.length === 0) {
        outputElement.innerHTML = '<div class="no-output">出力はありません</div>';
      } else {
        outputElement.innerHTML = output.map(item => {
          const time = new Date(item.timestamp).toLocaleTimeString();
          return `<div class="output-line ${item.type}">[${time}] ${item.message}</div>`;
        }).join('');
      }
      
    } catch (error) {
      outputElement.innerHTML = `
        <div class="error">
          <div>エラー: ${error.name}</div>
          <div>${error.message}</div>
          ${error.stack ? `<pre>${error.stack}</pre>` : ''}
        </div>
      `;
    }
    
    // 元のコンソールメソッドに戻す
    Object.assign(console, originalConsole);
    
  } catch (error) {
    if (outputElement) {
      outputElement.innerHTML = `
        <div class="error">
          <div>致命的なエラーが発生しました</div>
          <div>${error.message}</div>
        </div>
      `;
    }
  }
}

// レッスンを読み込む
function loadLesson(index) {
  if (index < 0 || index >= lessons.length) return;
  
  // 現在のレッスンインデックスを更新
  currentLessonIndex = index;
  const currentLesson = lessons[currentLessonIndex];
  
  // ルート要素を取得
  const root = document.getElementById('app-root');
  if (!root) return;
  
  // UIを再レンダリング
  root.innerHTML = renderApp();
  
  // エディタを再初期化
  const script = document.createElement('script');
  script.src = 'https://sugisaku8.github.io/Deep-School/client/js/koodi_editor/index.js';
  script.onload = () => {
    // エディタを初期化
    const editorElement = document.getElementById('code-editor');
    if (!editorElement) return;
    
    koodiEditor = CodeMirror(editorElement, {
      value: currentLesson.code,
      mode: 'javascript',
      theme: 'dracula',
      lineNumbers: true,
      autoCloseBrackets: true,
      indentUnit: 2,
      tabSize: 2,
      lineWrapping: true,
      matchBrackets: true,
      extraKeys: {
        'Ctrl-Enter': executeCode,
        'Cmd-Enter': executeCode
      }
    });
    
    // エディタの参照を保持
    window.koodiEditor = koodiEditor;
    
    // エディタにフォーカスを設定
    koodiEditor.focus();
    
    // イベントリスナーを設定
    setupEventListeners();
  };
  
  document.head.appendChild(script);
  
  // ヒントを非表示に設定
  const hintElement = document.querySelector('.hint');
  if (hintElement) {
    hintElement.style.display = 'none';
  }
  
  // 出力をクリア
  const outputContent = document.querySelector('.output-content');
  if (outputContent) {
    outputContent.innerHTML = '';
  }
  
  // ヒストリに現在の状態を追加
  if (window.history && window.history.pushState) {
    const url = new URL(window.location);
    url.searchParams.set('lesson', currentLessonIndex);
    window.history.pushState({ lessonIndex: currentLessonIndex }, '', url);
  }
}

// イベントリスナーを設定
function setupEventListeners() {
  // 実行ボタン
  const runButton = document.querySelector('.run-button');
  if (runButton) {
    runButton.addEventListener('click', executeCode);
  }
  
  // ヒントボタン
  const hintButton = document.querySelector('.hint-button');
  if (hintButton) {
    hintButton.addEventListener('click', () => {
      const hintElement = document.querySelector('.hint');
      if (hintElement) {
        hintElement.style.display = hintElement.style.display === 'none' ? 'block' : 'none';
      }
    });
  }
  
  // 前のレッスンボタン
  const prevButton = document.querySelector('.prev-lesson');
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (currentLessonIndex > 0) {
        loadLesson(currentLessonIndex - 1);
      }
    });
  }
  
  // 次のレッスンボタン
  const nextButton = document.querySelector('.next-lesson');
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentLessonIndex < lessons.length - 1) {
        loadLesson(currentLessonIndex + 1);
      }
    });
  }
  
  // メニューに戻るボタンのイベントリスナー
  const backToMenuButton = document.querySelector('.back-to-menu');
  if (backToMenuButton) {
    backToMenuButton.addEventListener('click', () => {
      if (window.shell) {
        window.shell.loadApp('menu');
      }
    });
  }

  // レッスンリストのイベントリスナー
  document.querySelectorAll('.lesson-list li').forEach((item, index) => {
    item.addEventListener('click', () => {
      loadLesson(index);
    });
  });
}

// CodeMirrorの依存関係を動的にロードする関数
async function loadCodeMirrorDependencies() {
  const baseUrl = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2';
  const deps = [
    { type: 'link', url: `${baseUrl}/codemirror.min.css` },
    { type: 'link', url: `${baseUrl}/theme/dracula.min.css` },
    { type: 'script', url: `${baseUrl}/codemirror.min.js` },
    { type: 'script', url: `${baseUrl}/mode/javascript/javascript.min.js` },
    { type: 'script', url: `${baseUrl}/addon/edit/closebrackets.min.js` },
    { type: 'script', url: `${baseUrl}/addon/edit/matchbrackets.min.js` },
    { type: 'script', url: `${baseUrl}/addon/display/placeholder.min.js` }
  ];

  for (const dep of deps) {
    await new Promise((resolve) => {
      const element = document.createElement(dep.type);
      if (dep.type === 'link') {
        element.rel = 'stylesheet';
        element.href = dep.url;
      } else {
        element.src = dep.url;
      }
      element.onload = resolve;
      document.head.appendChild(element);
    });
  }
}

export function appInit(shell) {
  // シェルの参照を保持
  window.shell = shell;
  
  const root = document.getElementById('app-root');
  root.id = 'koodi-studio-root';
  root.className = 'koodi-studio-app';
  
  // ローディング表示
  root.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Koodi Studioを読み込み中...</p>
    </div>
  `;
  
  // CodeMirrorの依存関係をロード
  loadCodeMirrorDependencies(() => {
    if (window.CodeMirror) {
      // アプリケーションのUIをレンダリング
      renderApp();
      
      // コードエディタを初期化
      initCodeEditor();
      
      // URLからレッスンインデックスを取得
      const urlParams = new URLSearchParams(window.location.search);
      currentLessonIndex = parseInt(urlParams.get('lesson')) || 0;
      
      // 初期レッスンを読み込み
      loadLesson(Math.min(Math.max(0, currentLessonIndex), lessons.length - 1));
      
      // イベントリスナーを設定
      setupEventListeners();
      
      // シェルに初期化完了を通知
      shell.log({from: 'dp.app.koodistudio', message: 'Koodi Studioが初期化されました', level: 'info'});
    } else {
      // エラー表示
      shell.log({from: 'dp.app.koodistudio.err', message: 'CodeMirrorの読み込みに失敗しました', level: 'error'});
      root.innerHTML = `
        <div class="error-message">
          <h2>エラーが発生しました</h2>
          <p>コードエディタの初期化に失敗しました。ページを再読み込みしてください。</p>
          <button class="retry-button">再試行</button>
        </div>
      `;
      
      // 再試行ボタンのイベントリスナー
      const retryButton = root.querySelector('.retry-button');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          window.location.reload();
        });
      }
    }
  });
  
  root.id = 'koodi-studio-root';
  root.className = 'koodi-studio-app';
  
  // アプリケーションのUIをレンダリング
  renderApp();
  
  // URLからレッスンインデックスを取得
  const urlParams = new URLSearchParams(window.location.search);
  currentLessonIndex = parseInt(urlParams.get('lesson')) || 0;
  
  // アプリケーションのスタイルを追加
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* ローディングとエラースタイル */
    .loading-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      color: #666;
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      margin-bottom: 16px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .error-message {
      padding: 20px;
      text-align: center;
      color: #721c24;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      margin: 20px;
    }
    
    .retry-button {
      margin-top: 16px;
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .retry-button:hover {
      background-color: #0056b3;
    }

    /* メインアプリケーションのスタイル */
    .koodi-app {
      display: flex;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #f5f5f5;
    }
    
    /* サイドバーのスタイル */
    .lesson-sidebar {
      width: 250px;
      background-color: #2d2d2d;
      color: #e0e0e0;
      padding: 20px 0;
      overflow-y: auto;
      border-right: 1px solid #444;
    }
    
    .lesson-sidebar h2 {
      font-size: 1.2rem;
      padding: 0 20px 10px;
      margin: 0 0 10px;
      border-bottom: 1px solid #444;
    }
    
    .lesson-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .lesson-list li {
      padding: 10px 20px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .lesson-list li:hover {
      background-color: #3a3a3a;
    }
    
    .lesson-list li.active {
      background-color: #4a4a4a;
      border-left: 4px solid #6c63ff;
      padding-left: 16px;
    }
    
    /* メインコンテンツのスタイル */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .lesson-content {
      padding: 20px;
      background-color: white;
      border-bottom: 1px solid #e0e0e0;
      max-height: 40%;
      overflow-y: auto;
    }
    
    .lesson-content h1 {
      font-size: 1.5rem;
      margin-top: 0;
      color: #333;
    }
    
    .lesson-text {
      line-height: 1.6;
      color: #444;
    }
    
    .lesson-text pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    
    .lesson-text code {
      font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
      background-color: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 0.9em;
    }
    
    .hint {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-left: 4px solid #6c63ff;
      border-radius: 4px;
    }
    
    .hint strong {
      color: #6c63ff;
    }
    
    /* エディタコンテナのスタイル */
    .editor-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .editor-toolbar {
      padding: 10px 20px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .run-button {
      background-color: #6c63ff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    
    .run-button:hover {
      background-color: #5a51e8;
    }
    
    .lesson-navigation {
      display: flex;
      gap: 10px;
    }
    
    .nav-button {
      background-color: #f0f0f0;
      border: 1px solid #ddd;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .nav-button:hover {
      background-color: #e0e0e0;
    }
    
    .nav-button.complete-lesson {
      background-color: #4caf50;
      color: white;
      border-color: #43a047;
    }
    
    .nav-button.complete-lesson:hover {
      background-color: #3d8b40;
    }
    
    /* コードエディタのスタイル */
    #code-editor {
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    
    .CodeMirror {
      height: 100%;
      font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
      font-size: 14px;
      line-height: 1.5;
    }
    
    /* 出力コンテナのスタイル */
    .output-container {
      height: 30%;
      display: flex;
      flex-direction: column;
      border-top: 1px solid #e0e0e0;
      background-color: #1e1e1e;
      color: #e0e0e0;
    }
    
    .output-container h3 {
      margin: 0;
      padding: 10px 20px;
      font-size: 0.9rem;
      background-color: #252526;
      border-bottom: 1px solid #333;
    }
    
    .output-content {
      flex: 1;
      padding: 10px 20px;
      overflow-y: auto;
      font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      white-space: pre-wrap;
    }
    
    .output-line {
      margin: 4px 0;
      line-height: 1.4;
    }
    
    .output-line.log {
      color: #e0e0e0;
    }
    
    .output-line.warn {
      color: #ffcc00;
    }
    
    .output-line.error {
      color: #ff6b6b;
    }
    
    .output-line.info {
      color: #5da9ff;
    }
    
    .output-line.return {
      color: #6c63ff;
      font-weight: 500;
    }
    
    .executing, .no-code, .no-output {
      color: #888;
      font-style: italic;
      padding: 8px 0;
    }
    
    .error {
      color: #ff6b6b;
      background-color: rgba(255, 107, 107, 0.1);
      padding: 10px;
      border-radius: 4px;
      margin: 8px 0;
      font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
      white-space: pre-wrap;
    }
    
    .error pre {
      margin: 8px 0 0 0;
      padding: 8px;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      overflow-x: auto;
    }
    
    /* レスポンシブデザイン */
    @media (max-width: 768px) {
      .koodi-app {
        flex-direction: column;
      }
      
      .lesson-sidebar {
        width: 100%;
        height: 200px;
        border-right: none;
        border-bottom: 1px solid #444;
      }
      
      .lesson-content {
        max-height: 30%;
      }
      
      .editor-toolbar {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }
      
      .lesson-navigation {
        width: 100%;
        justify-content: space-between;
      }
    }
    
    /* アニメーション */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .koodi-app {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    .lesson-content h1 {
      margin-top: 0;
      color: #333;
    }
    
    .lesson-text {
      line-height: 1.6;
      color: #444;
    }
    
    .hint {
      margin-top: 15px;
      padding: 10px;
      background-color: #fff8e1;
      border-left: 4px solid #ffc107;
      color: #5d4037;
    }
    
    .hint-button {
      margin-top: 10px;
      padding: 5px 10px;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .hint-button:hover {
      background-color: #e0e0e0;
    }
    
    /* エディターコンテナのスタイル */
    .editor-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background-color: #1e1e1e;
    }
    
    .editor-toolbar {
      padding: 8px 15px;
      background-color: #252526;
      border-bottom: 1px solid #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .run-button {
      padding: 6px 12px;
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.2s;
    }
    
    .run-button:hover {
      background-color: #43a047;
    }
    
    .lesson-navigation {
      display: flex;
      gap: 10px;
    }
    
    .nav-button {
      padding: 6px 12px;
      background-color: #3a3a3a;
      color: white;
      border: 1px solid #555;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .nav-button:hover {
      background-color: #4a4a4a;
    }
    
    .complete-lesson {
      background-color: #6c63ff;
      border-color: #5a52d9;
    }
    
    .complete-lesson:hover {
      background-color: #5a52d9;
    }
    
    /* コードエディタのスタイル */
    #code-editor {
      flex: 1;
      overflow: hidden;
    }
    
    /* 出力コンテナのスタイル */
    .output-container {
      height: 30%;
      background-color: #1e1e1e;
      border-top: 1px solid #333;
      color: #e0e0e0;
      font-family: 'Courier New', Courier, monospace;
      overflow-y: auto;
      padding: 10px;
    }
    
    .output-container h3 {
      margin: 0 0 10px 0;
      font-size: 1rem;
      color: #9cdcfe;
    }
    
    .output-content {
      white-space: pre-wrap;
      font-family: 'Courier New', Courier, monospace;
    }
    
    .executing {
      color: #9cdcfe;
      font-style: italic;
    }
    
    .error {
      color: #f48771;
    }
    
    .no-output {
      color: #888;
      font-style: italic;
    }
    
    /* レスポンシブデザイン */
    @media (max-width: 768px) {
      .koodi-app {
        flex-direction: column;
      }
      
      .lesson-sidebar {
        width: 100%;
        height: 200px;
      }
      
      .lesson-content {
        max-height: 300px;
      }
      
      .editor-toolbar {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }
    }

.CodeMirror-ruler {
  border-left: 1px solid #ccc;
  top: 0; bottom: 0;
  position: absolute;
}

/* DEFAULT THEME */

.cm-s-default .cm-header {color: blue;}
.cm-s-default .cm-quote {color: #090;}
.cm-negative {color: #d44;}
.cm-positive {color: #292;}
.cm-header, .cm-strong {font-weight: bold;}
.cm-em {font-style: italic;}
.cm-link {text-decoration: underline;}
.cm-strikethrough {text-decoration: line-through;}

.cm-s-default .cm-keyword {color: #708;}
.cm-s-default .cm-atom {color: #219;}
.cm-s-default .cm-number {color: #164;}
.cm-s-default .cm-def {color: #00f;}
.cm-s-default .cm-variable,
.cm-s-default .cm-punctuation,
.cm-s-default .cm-property,
.cm-s-default .cm-operator {}
.cm-s-default .cm-variable-2 {color: #05a;}
.cm-s-default .cm-variable-3, .cm-s-default .cm-type {color: #085;}
.cm-s-default .cm-comment {color: #a50;}
.cm-s-default .cm-string {color: #a11;}
.cm-s-default .cm-string-2 {color: #f50;}
.cm-s-default .cm-meta {color: #555;}
.cm-s-default .cm-qualifier {color: #555;}
.cm-s-default .cm-builtin {color: #30a;}
.cm-s-default .cm-bracket {color: #997;}
.cm-s-default .cm-tag {color: #170;}
.cm-s-default .cm-attribute {color: #00c;}
.cm-s-default .cm-hr {color: #999;}
.cm-s-default .cm-link {color: #00c;}

.cm-s-default .cm-error {color: #f00;}
.cm-invalidchar {color: #f00;}

.CodeMirror-composing { border-bottom: 2px solid; }

/* Default styles for common addons */

div.CodeMirror span.CodeMirror-matchingbracket {color: #0b0;}
div.CodeMirror span.CodeMirror-nonmatchingbracket {color: #a22;}
.CodeMirror-matchingtag { background: rgba(255, 150, 0, .3); }
.CodeMirror-activeline-background {background: #e8f2ff;}

/* STOP */

/* The rest of this file contains styles related to the mechanics of
   the editor. You probably shouldn't touch them. */

.CodeMirror {
  position: relative;
  overflow: hidden;
  background: white;
}

.CodeMirror-scroll {
  overflow: scroll !important; /* Things will break if this is overridden */
  /* 50px is the magic margin used to hide the element's real scrollbars */
  /* See overflow: hidden in .CodeMirror */
  margin-bottom: -50px; margin-right: -50px;
  padding-bottom: 50px;
  height: 100%;
  outline: none; /* Prevent dragging from highlighting the element */
  position: relative;
  z-index: 0;
}

.CodeMirror-sizer {
  position: relative;
  border-right: 50px solid transparent;
}

.CodeMirror-vscrollbar, .CodeMirror-hscrollbar, .CodeMirror-scrollbar-filler, .CodeMirror-gutter-filler {
  position: absolute;
  z-index: 6;
  display: none;
  outline: none;
}

.CodeMirror-vscrollbar {
  right: 0; top: 0;
  overflow-x: hidden;
  overflow-y: scroll;
}

.CodeMirror-hscrollbar {
  bottom: 0; left: 0;
  overflow-y: hidden;
  overflow-x: scroll;
}

.CodeMirror-scrollbar-filler {
  right: 0; bottom: 0;
}

.CodeMirror-gutter-filler {
  left: 0; bottom: 0;
}

.CodeMirror-gutters {
  position: absolute; left: 0; top: 0;
  min-height: 100%;
  z-index: 3;
}

.CodeMirror-gutter {
  white-space: normal;
  height: 100%;
  display: inline-block;
  vertical-align: top;
  margin-bottom: -50px;
}

.CodeMirror-gutter-wrapper {
  position: absolute;
  z-index: 4;
  background: none !important;
  border: none !important;
}

.CodeMirror-gutter-background {
  position: absolute;
  top: 0; bottom: 0;
  z-index: 4;
}

.CodeMirror-gutter-elt {
  position: absolute;
  cursor: default;
  z-index: 4;
}

.CodeMirror-gutter-wrapper ::selection { background-color: transparent }
.CodeMirror-gutter-wrapper ::-moz-selection { background-color: transparent }

.CodeMirror-lines {
  cursor: text;
  min-height: 1px; /* prevents collapsing before first draw */
}

.CodeMirror pre.CodeMirror-line,
.CodeMirror pre.CodeMirror-line-like {
  /* Reset some styles that the rest of the page might have set */
  -moz-border-radius: 0; -webkit-border-radius: 0; border-radius: 0;
  border-width: 0;
  background: transparent;
  font-family: inherit;
  font-size: inherit;
  margin: 0;
  white-space: pre;
  word-wrap: normal;
  line-height: inherit;
  color: inherit;
  z-index: 2;
  position: relative;
  overflow: visible;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-variant-ligatures: contextual;
  font-variant-ligatures: contextual;
}

.CodeMirror-wrap pre.CodeMirror-line,
.CodeMirror-wrap pre.CodeMirror-line-like {
  word-wrap: break-word;
  white-space: pre-wrap;
  word-break: normal;
}

.CodeMirror-linebackground {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  z-index: 0;
}

.CodeMirror-linewidget {
  position: relative;
  z-index: 2;
  padding: 0.1px; /* Force widget margins to stay inside of the container */
}

.CodeMirror-widget {}

.CodeMirror-rtl pre { direction: rtl; }

.CodeMirror-code {
  outline: none;
}

.CodeMirror-measure {
  position: absolute;
  width: 100%;
  height: 0;
  overflow: hidden;
  visibility: hidden;
}

.CodeMirror-cursor {
  position: absolute;
  pointer-events: none;
}

.CodeMirror-measure pre { position: static; }

div.CodeMirror-cursors {
  visibility: hidden;
  position: relative;
  z-index: 3;
}

div.CodeMirror-dragcursors {
  visibility: visible;
}

.CodeMirror-focused div.CodeMirror-cursors {
  visibility: visible;
}

.CodeMirror-selected { background: #d9d9d9; }
.CodeMirror-focused .CodeMirror-selected { background: #d7d4f0; }
.CodeMirror-crosshair { cursor: crosshair; }
.CodeMirror-line::selection, .CodeMirror-line > span::selection, .CodeMirror-line > span > span::selection { background: #d7d4f0; }
.CodeMirror-line::-moz-selection, .CodeMirror-line > span::-moz-selection, .CodeMirror-line > span > span::-moz-selection { background: #d7d4f0; }

.cm-searching {
  background-color: #ffa;
  background-color: rgba(255, 255, 0, .4);
}

.cm-force-border { padding-right: .1px; }

@media print {
  .CodeMirror div.CodeMirror-cursors {
    visibility: hidden;
  }
}

.cm-tab-wrap-hack:after { content: ''; }

span.CodeMirror-selectedtext { background: none; }


.cm-s-dracula.CodeMirror, .cm-s-dracula .CodeMirror-gutters {
  background-color: #282a36 !important;
  color: #f8f8f2 !important;
  border: none;
}
.cm-s-dracula .CodeMirror-gutters { color: #282a36; }
.cm-s-dracula .CodeMirror-cursor { border-left: solid thin #f8f8f0; }
.cm-s-dracula .CodeMirror-linenumber { color: #6D8A88; }
.cm-s-dracula .CodeMirror-selected { background: rgba(255, 255, 255, 0.10); }
.cm-s-dracula .CodeMirror-line::selection, .cm-s-dracula .CodeMirror-line > span::selection, .cm-s-dracula .CodeMirror-line > span > span::selection { background: rgba(255, 255, 255, 0.10); }
.cm-s-dracula .CodeMirror-line::-moz-selection, .cm-s-dracula .CodeMirror-line > span::-moz-selection, .cm-s-dracula .CodeMirror-line > span > span::-moz-selection { background: rgba(255, 255, 255, 0.10); }
.cm-s-dracula span.cm-comment { color: #6272a4; }
.cm-s-dracula span.cm-string, .cm-s-dracula span.cm-string-2 { color: #f1fa8c; }
.cm-s-dracula span.cm-number { color: #bd93f9; }
.cm-s-dracula span.cm-variable { color: #50fa7b; }
.cm-s-dracula span.cm-variable-2 { color: white; }
.cm-s-dracula span.cm-def { color: #50fa7b; }
.cm-s-dracula span.cm-operator { color: #ff79c6; }
.cm-s-dracula span.cm-keyword { color: #ff79c6; }
.cm-s-dracula span.cm-atom { color: #bd93f9; }
.cm-s-dracula span.cm-meta { color: #f8f8f2; }
.cm-s-dracula span.cm-tag { color: #ff79c6; }
.cm-s-dracula span.cm-attribute { color: #50fa7b; }
.cm-s-dracula span.cm-qualifier { color: #50fa7b; }
.cm-s-dracula span.cm-property { color: #66d9ef; }
.cm-s-dracula span.cm-builtin { color: #50fa7b; }
.cm-s-dracula span.cm-variable-3, .cm-s-dracula span.cm-type { color: #ffb86c; }

.cm-s-dracula .CodeMirror-activeline-background { background: rgba(255,255,255,0.1); }
.cm-s-dracula .CodeMirror-matchingbracket { text-decoration: underline; color: white !important; }
  `;
  document.head.appendChild(styleElement);
  
  // アプリケーションを初期化
  root.innerHTML = renderApp();
  
  // コードエディターのスクリプトを動的に読み込む
  const script = document.createElement('script');
  script.src = 'https://sugisaku8.github.io/Deep-School/client/js/koodi_editor/index.js';
  script.onload = initCodeEditor;
  document.head.appendChild(script);
}