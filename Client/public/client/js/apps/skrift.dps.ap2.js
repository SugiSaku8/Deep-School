
export const appMeta = {
      name: "SKRIFT",
  title: "Skrift",
  icon: "re/ico/dictionary.png",
};

export function appInit(shell) {
  const root = document.getElementById("app-root");
  let currentLanguage = 'en'; // Default to English
  const API_BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries";
  
  // Language configuration
  const LANGUAGES = {
    en: { name: 'English', code: 'en', placeholder: 'Enter a word...' },
    ja: { name: '日本語', code: 'ja', placeholder: '単語を入力...' },
    ko: { name: '한국어', code: 'ko', placeholder: '단어를 입력하세요...' }
  };
  
  if (!root) {
    console.error("SkriftApp: #app-rootが見つかりません");
    return;
  }

  // 初期表示
  root.innerHTML = `
    <div class="splash-container" id="splash">
      <div class="card">
        <div class="title_t chalk-text" data-lang-key="menu_skrift">Skrift</div>
        <div class="version">v1.0.0</div>
        <div class="input-group">
          <select id="languageSelect" class="language-select">
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
          </select>
          <input type="text" id="searchInput" placeholder="Enter a word..." data-lang-key="search_placeholder" />
          <button id="searchBtn" class="button-chalk" data-lang-key="search">→</button>
        </div>
      </div>
    </div>
    <div id="dictionary-container" class="dictionary-container" style="display:none;">
      <div class="content-container">
        <div class="word-list">
          <h2 class="chalk-text">検索履歴</h2>
          <ul id="searchHistory"></ul>
        </div>
        <div class="word-details">
          <div id="loading" style="display: none;" class="chalk-text">読み込み中...</div>
          <h2 id="selectedWord" class="chalk-text">単語を検索してください</h2>
          <div id="wordDefinition" class="definition">
            <p class="chalk-text">単語を検索すると、ここに意味が表示されます。</p>
          </div>
        </div>
      </div>
    </div>
    <style>
      /* Base styles */
      body {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #1a1a1a;
        color: #e0e0e0;
        min-height: 100vh;
      }

      /* Splash screen */
      .splash-container {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #1a1a1a;
        padding: 20px;
      }

      .card {
        background: #2d2d2d;
        padding: 2rem;
        border-radius: 10px;
        text-align: center;
        max-width: 600px;
        width: 100%;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }

      .title_t {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
        color: #fff;
      }

      .version {
        color: #888;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
      }

      .input-group {
        display: flex;
        gap: 10px;
        margin-top: 1.5rem;
      }

      /* Dictionary container */
      .dictionary-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: #1a1a1a;
        color: #e0e0e0;
      }

      .content-container {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      /* Language select */
      .language-select {
        padding: 0.8rem 1rem;
        border: 1px solid #444;
        border-radius: 20px;
        font-size: 1rem;
        background-color: #2d2d2d;
        color: #e0e0e0;
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23e0e0e0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
        background-repeat: no-repeat;
        background-position: right 0.7rem top 50%;
        background-size: 0.65rem auto;
        padding-right: 2.5rem;
        min-width: 120px;
      }

      /* Search input */
      #searchInput {
        flex: 1;
        padding: 0.8rem 1rem;
        border: 1px solid #444;
        border-radius: 20px;
        font-size: 1rem;
        background-color: #2d2d2d;
        color: #e0e0e0;
        outline: none;
        transition: border-color 0.3s;
      }

      #searchInput:focus {
        border-color: #4d90fe;
      }

      /* Buttons */
      .button-chalk {
        background-color: #2d2d2d;
        color: #e0e0e0;
        border: 1px solid #444;
        border-radius: 20px;
        padding: 0.8rem 1.5rem;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s;
        min-width: 60px;
        text-align: center;
      }

      .button-chalk:hover {
        background-color: #3d3d3d;
        border-color: #666;
      }
      
      .content-container {
        display: flex;
        flex: 1;
        overflow: hidden;
      }
      
      /* Word list */
      .word-list {
        width: 300px;
        border-right: 1px solid #333;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        background-color: #222;
      }
      
      .word-list h2 {
        padding: 1rem;
        margin: 0;
        background-color: #2a2a2a;
        border-bottom: 1px solid #333;
        font-size: 1.1rem;
        position: sticky;
        top: 0;
        z-index: 1;
        color: #fff;
      }
      
      .word-details {
        flex: 1;
        padding: 1.5rem;
        overflow-y: auto;
        background-color: #1a1a1a;
      }
      
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      li {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #333;
        cursor: pointer;
        transition: background-color 0.2s;
        color: #e0e0e0;
      }
      
      li:hover {
        background-color: #2d2d2d;
      }
      
      .definition {
        padding: 1rem;
        line-height: 1.6;
        color: #e0e0e0;
      }

      .word-header {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #333;
      }

      .word-header h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.8rem;
        color: #fff;
      }

      .phonetic {
        color: #888;
        font-style: italic;
        margin: 0.5rem 0;
        font-size: 1.1rem;
      }

      .meaning {
        margin-bottom: 2rem;
      }

      .meaning h4 {
        color: #4d90fe;
        margin: 1.5rem 0 1rem 0;
        font-size: 1.2rem;
        text-transform: capitalize;
      }

      .meaning ol {
        padding-left: 1.5rem;
      }

      .meaning li {
        margin-bottom: 1rem;
        padding: 0;
        border: none;
      }

      .example {
        color: #888;
        font-style: italic;
        margin: 0.5rem 0 0 1rem;
        padding-left: 1rem;
        border-left: 2px solid #444;
      }

      .error {
        color: #ff6b6b;
        font-weight: 500;
        margin-bottom: 1rem;
      }
      
      /* Responsive styles */
      @media (max-width: 768px) {
        .content-container {
          flex-direction: column;
        }
        
        .word-list, .word-details {
          width: 100%;
        }
        
        .word-list {
          height: 200px;
          border-right: none;
          border-bottom: 1px solid #333;
        }

        .card {
          padding: 1.5rem;
        }

        .input-group {
          flex-direction: column;
          gap: 10px;
        }

        .language-select, #searchInput, .button-chalk {
          width: 100%;
          margin: 0;
        }
      }
    </style>
  `;

  // DOM要素の取得
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const languageSelect = document.getElementById('languageSelect');
  const searchHistory = document.getElementById('searchHistory');
  const selectedWordElement = document.getElementById('selectedWord');
  const wordDefinitionElement = document.getElementById('wordDefinition');
  const loadingElement = document.getElementById('loading');

  // 検索履歴をローカルストレージから読み込む
  let searchHistoryList = JSON.parse(localStorage.getItem('dictionaryHistory')) || [];
  
  // 言語変更イベント
  languageSelect.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    searchInput.placeholder = LANGUAGES[currentLanguage].placeholder;
    updateUIForLanguage();
  });
  
  // 言語に基づいてUIを更新
  function updateUIForLanguage() {
    const lang = LANGUAGES[currentLanguage];
    searchInput.placeholder = lang.placeholder;
    searchBtn.textContent = currentLanguage === 'ja' ? '検索' : 
                          currentLanguage === 'ko' ? '검색' : 'Search';
    
    // Update UI text based on language
    const uiTexts = {
      searchHistory: {
        en: 'Search History',
        ja: '検索履歴',
        ko: '검색 기록'
      },
      searchPlaceholder: {
        en: 'Search for a word...',
        ja: '単語を検索...',
        ko: '단어 검색...'
      },
      noWordSelected: {
        en: 'Search for a word to see its definition',
        ja: '単語を検索すると、ここに意味が表示されます',
        ko: '단어를 검색하면 여기에 의미가 표시됩니다'
      }
    };
    
    document.querySelector('.word-list h2').textContent = uiTexts.searchHistory[currentLanguage];
    document.querySelector('#selectedWord').textContent = uiTexts.searchPlaceholder[currentLanguage];
  }

  // 検索履歴を表示する関数
  function displaySearchHistory() {
    searchHistory.innerHTML = '';
    searchHistoryList.forEach(word => {
      const li = document.createElement('li');
      li.textContent = word;
      li.addEventListener('click', () => searchWord(word));
      searchHistory.appendChild(li);
    });
  }

  // 単語を検索する関数
  async function searchWord(word) {
    if (!word) return;

    loadingElement.style.display = 'block';
    wordDefinitionElement.innerHTML = '';
    
    // Update loading message based on language
    const loadingMessages = {
      en: `Searching: ${word}`,
      ja: `検索中: ${word}`,
      ko: `검색 중: ${word}`
    };
    selectedWordElement.textContent = loadingMessages[currentLanguage] || `Searching: ${word}`;

    try {
      const response = await fetch(`${API_BASE_URL}/${currentLanguage}/${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        const errorMessages = {
          en: 'Word not found',
          ja: '単語が見つかりませんでした',
          ko: '단어를 찾을 수 없습니다'
        };
        throw new Error(errorMessages[currentLanguage] || 'Word not found');
      }
      
      const data = await response.json();
      displayWordDetails(word, data[0]);
      
      // 検索履歴に追加
      if (!searchHistoryList.includes(word.toLowerCase())) {
        searchHistoryList.unshift(word.toLowerCase());
        // 最新10件だけ保持
        searchHistoryList = searchHistoryList.slice(0, 10);
        localStorage.setItem('dictionaryHistory', JSON.stringify(searchHistoryList));
        displaySearchHistory();
      }
      
    } catch (error) {
      const errorMessages = {
        en: 'Please enter a valid word',
        ja: '正しい単語を入力してください',
        ko: '올바른 단어를 입력하세요'
      };
      
      wordDefinitionElement.innerHTML = `
        <p class="error">${error.message}</p>
        <p>${errorMessages[currentLanguage] || 'Please try a different word'}</p>
      `;
    } finally {
      loadingElement.style.display = 'none';
    }
  }

  // 単語の詳細を表示する関数
  function displayWordDetails(word, data) {
    selectedWordElement.textContent = word;
    
    let html = `
      <div class="word-header">
        <h3>${word}</h3>
        ${data.phonetic ? `<p class="phonetic">${data.phonetic}</p>` : ''}
      </div>
    `;

    data.meanings.forEach(meaning => {
      html += `
        <div class="meaning">
          <h4>${meaning.partOfSpeech}</h4>
          <ol>
      `;
      
      meaning.definitions.slice(0, 3).forEach(def => {
        html += `
          <li>
            <p>${def.definition}</p>
            ${def.example ? `<p class="example">例: ${def.example}</p>` : ''}
          </li>
        `;
      });
      
      html += `
          </ol>
        </div>
      `;
    });

    wordDefinitionElement.innerHTML = html;
  }

  // イベントリスナーの設定
  searchBtn.addEventListener('click', () => searchWord(searchInput.value.trim()));
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchWord(searchInput.value.trim());
    }
  });

  // 初期化
  updateUIForLanguage();
  displaySearchHistory();

  // スプラッシュ画面を非表示にし、メインコンテンツを表示
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('splash').style.display = 'none';
      document.getElementById('dictionary-container').style.display = 'block';
      searchWord(searchInput.value.trim());
    }
  });

  document.getElementById('searchBtn').addEventListener('click', () => {
    document.getElementById('splash').style.display = 'none';
    document.getElementById('dictionary-container').style.display = 'block';
    searchWord(searchInput.value.trim());
  });
}
