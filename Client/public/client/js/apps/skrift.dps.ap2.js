export const appMeta = {
  name: "SKRIFT",
  title: "Skrift",
  icon: "re/ico/skrift.png"
};

export function appInit(shell) {
  const root = document.getElementById("app-root");
  let currentLanguage = 'en'; // Default to English
  const API_BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries";
  
  // Language configuration
  const LANGUAGES = {
    en: { 
      name: 'English', 
      code: 'en',
      indexChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    }
  };
  
  // Cache for word lists and definitions
  const wordCache = {};
  
  if (!root) {
    console.error("SkriftApp: #app-root not found");
    return;
  }

  // DOM Elements
  const indexContainer = document.createElement('div');
  const wordListContainer = document.createElement('div');
  const wordDetailsContainer = document.createElement('div');
  const backButton = document.createElement('button');
  const languageSelect = document.createElement('select');
  
  // Back to menu button
  function createBackToMenuButton() {
    const backToMenuBtn = document.createElement('button');
    backToMenuBtn.className = 'back-to-menu';
    backToMenuBtn.innerHTML = '<i class="fas fa-home"></i>';
    backToMenuBtn.style.marginLeft = '10px';
    backToMenuBtn.style.padding = '8px';
    backToMenuBtn.style.borderRadius = '50%';
    backToMenuBtn.style.border = 'none';
    backToMenuBtn.style.backgroundColor = '#87c1ff';
    backToMenuBtn.style.color = 'white';
    backToMenuBtn.style.cursor = 'pointer';
    backToMenuBtn.style.display = 'flex';
    backToMenuBtn.style.alignItems = 'center';
    backToMenuBtn.style.justifyContent = 'center';
    backToMenuBtn.style.width = '36px';
    backToMenuBtn.style.height = '36px';
    backToMenuBtn.addEventListener('click', () => {
      shell.loadApp('menu');
    });
    
    // Add hover effects
    backToMenuBtn.addEventListener('mouseover', () => {
      backToMenuBtn.style.backgroundColor = '#6ba7e5';
    });
    
    backToMenuBtn.addEventListener('mouseout', () => {
      backToMenuBtn.style.backgroundColor = '#87c1ff';
    });
    
    backToMenuBtn.addEventListener('mousedown', () => {
      backToMenuBtn.style.transform = 'scale(0.95)';
    });
    
    backToMenuBtn.addEventListener('mouseup', () => {
      backToMenuBtn.style.transform = 'scale(1)';
    });
    
    return backToMenuBtn;
  }

  // Initialize the UI
  function initUI() {
    // Create header
    const header = document.createElement('div');
    header.className = 'app-header';
    
    // Back button
    backButton.className = 'back-button';
    backButton.style.display = 'none';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
    
    // Add back to menu button
    header.appendChild(createBackToMenuButton());
    
    // Title
    const title = document.createElement('div');
    title.className = 'app-title';
    title.textContent = 'Skrift';
    
    // Language selector
    languageSelect.className = 'language-select';
    ['en'].forEach(lang => {
      const option = document.createElement('option');
      option.value = lang;
      option.textContent = LANGUAGES[lang].name;
      languageSelect.appendChild(option);
    });
    
    // Assemble header
    header.appendChild(backButton);
    header.appendChild(title);
    header.appendChild(languageSelect);
    
    // Create dictionary container
    const dictContainer = document.createElement('div');
    dictContainer.className = 'dictionary-container';
    
    // Create index section
    const indexSection = document.createElement('div');
    indexSection.className = 'index-section';
    
    const indexTitle = document.createElement('div');
    indexTitle.className = 'index-title';
    indexTitle.textContent = 'Index';
    
    indexContainer.className = 'index-characters';
    
    indexSection.appendChild(indexTitle);
    indexSection.appendChild(indexContainer);
    
    // Create word list section
    const wordListSection = document.createElement('div');
    wordListSection.className = 'word-list-section';
    
    wordListContainer.className = 'word-list';
    const initialMessage = document.createElement('div');
    initialMessage.className = 'initial-message';
    initialMessage.innerHTML = '<p>Select a character from the index to view words</p>';
    
    wordListContainer.appendChild(initialMessage);
    wordListSection.appendChild(wordListContainer);
    
    // Create word details section
    wordDetailsContainer.className = 'word-details';
    wordDetailsContainer.style.display = 'none';
    
    const wordHeader = document.createElement('div');
    wordHeader.id = 'wordHeader';
    wordHeader.className = 'word-header';
    
    const wordDefinition = document.createElement('div');
    wordDefinition.id = 'wordDefinition';
    wordDefinition.className = 'word-definition';
    
    wordDetailsContainer.appendChild(wordHeader);
    wordDetailsContainer.appendChild(wordDefinition);
    
    // Assemble dictionary container
    dictContainer.appendChild(indexSection);
    dictContainer.appendChild(wordListSection);
    dictContainer.appendChild(wordDetailsContainer);
    
    // Add everything to root
    root.innerHTML = '';
    root.appendChild(header);
    root.appendChild(dictContainer);
    
    // Add styles
    addStyles();
  }
  
  // Add styles to the document
  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .app-header {
        display: flex;
        align-items: center;
        padding: 10px 20px;
        background-color: transparent;
        color: #333;
        border-bottom: 1px solid #ddd;
      }
      
      .back-button {
        background: #2196F3;
        border: none;
        color: white;
        font-size: 14px;
        cursor: pointer;
        margin-right: 15px;
        padding: 5px 10px;
        border-radius: 4px;
      }
      
      .app-title {
        font-size: 20px;
        font-weight: bold;
        flex-grow: 1;
      }
      
      .language-select {
        padding: 5px 10px;
        border-radius: 4px;
        background-color: #e6f0ff;
        color: #333;
        border: 1px solid #b3d1ff;
      }
      
      .dictionary-container {
        display: flex;
        height: calc(100vh - 50px);
        background-color: #f5f5f5;
        color: #333;
      }
      
      .index-section {
        width: 80px;
        background-color: #f5f5f5;
        border-right: 1px solid #e0e0e0;
        overflow-y: auto;
        padding: 10px 0;
      }
      
      .index-title {
        padding: 10px;
        font-weight: bold;
        text-align: center;
        border-bottom: 1px solid #444;
      }
      
      .index-characters {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px 0;
        gap: 8px;
      }
      
      .index-char {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s;
        background-color: #f5f5f5;
        border: 1px solid #e0e0e0;
        color: #333;
      }
      
      .index-char:hover {
        background-color: #e0e0e0;
      }
      
      .index-char.active {
        background-color: #87c1ff;
        color: white;
        border-color: #6ba7e5;
      }
      
      .index-char:hover, .index-char.active {
        background-color: #444;
      }
      
      .word-list-section {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        background-color: white;
        border-radius: 8px;
        margin: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      
      .word-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 12px;
      }
      
      .word-item {
        padding: 14px 18px;
        background-color: #ffffff;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid #e0e0e0;
        margin: 0;
        font-size: 15px;
        color: #333;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
        position: relative;
        overflow: hidden;
      }
      
      .word-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(135, 193, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .word-item:hover {
        background-color: #f8faff;
        border-color: #6ba7e5;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      
      .word-item:hover::before {
        opacity: 1;
      }
      
      .word-item:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
      
      .initial-message {
        grid-column: 1 / -1;
        text-align: center;
        padding: 50px 20px;
        color: #888;
        font-size: 15px;
        line-height: 1.6;
        background-color: #fafafa;
        border-radius: 8px;
        margin: 10px 0;
        border: 1px dashed #e0e0e0;
      }
      
      .initial-message p {
        margin: 0 0 15px 0;
        font-size: 16px;
        color: #666;
      }
      
      .initial-message .hint {
        font-size: 13px;
        color: #999;
        margin-top: 15px;
        display: block;
      }
      
      .word-details {
        width: 400px;
        padding: 20px;
        background-color: white;
        border-left: 1px solid #e0e0e0;
        overflow-y: auto;
        border-radius: 0 8px 8px 0;
        box-shadow: -2px 0 4px rgba(0,0,0,0.05);
      }
      
      .word-header {
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #444;
      }
      
      .word-header h2 {
        margin: 0 0 5px 0;
        font-size: 24px;
      }
      
      .phonetic {
        color: #888;
        font-style: italic;
        margin: 0;
      }
      
      .meaning {
        margin-bottom: 20px;
      }
      
      .meaning h3 {
        margin: 0 0 10px 0;
        font-size: 18px;
        color: #4caf50;
      }
      
      .definition {
        margin: 5px 0;
        line-height: 1.5;
      }
      
      .example {
        color: #888;
        font-style: italic;
        margin: 5px 0 5px 15px;
        padding-left: 10px;
        border-left: 2px solid #4caf50;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Back to menu button
  function createBackToMenuButton() {
    const backToMenuBtn = document.createElement('button');
    backToMenuBtn.className = 'back-to-menu';
    backToMenuBtn.innerHTML = '<i class="fas fa-home"></i> Menu';
    backToMenuBtn.style.marginLeft = '10px';
    backToMenuBtn.style.padding = '5px 10px';
    backToMenuBtn.style.borderRadius = '4px';
    backToMenuBtn.style.border = 'none';
    backToMenuBtn.style.backgroundColor = '#2196F3';
    backToMenuBtn.style.color = 'white';
    backToMenuBtn.style.cursor = 'pointer';
    backToMenuBtn.addEventListener('click', () => {
      window.location.href = '/';
    });
    return backToMenuBtn;
  }

  // Initialize the application
  function init() {
    initUI();
    renderIndex();
    setupEventListeners();
    
    // Add initial active state to first character
    const firstChar = document.querySelector('.index-char');
    if (firstChar) {
      firstChar.classList.add('active');
      showWordsForChar(firstChar.textContent);
    }
    
    // Add back to menu button to header
    const header = document.querySelector('.app-header');
    if (header) {
      header.appendChild(createBackToMenuButton());
    }
  }
  
  // Render the index characters
  function renderIndex() {
    indexContainer.innerHTML = '';
    const chars = LANGUAGES[currentLanguage].indexChars;
    
    chars.forEach(char => {
      const charElement = document.createElement('div');
      charElement.className = 'index-char';
      charElement.textContent = char;
      charElement.addEventListener('click', () => showWordsForChar(char));
      indexContainer.appendChild(charElement);
    });
  }
  
  // Show words for the selected character
  async function showWordsForChar(char) {
    // In a real app, fetch words from an API
    const words = await getSampleWords(char);
    
    // Update active character
    document.querySelectorAll('.index-char').forEach(el => {
      el.classList.toggle('active', el.textContent === char);
    });
    
    // Display words
    wordListContainer.innerHTML = '';
    
    if (words.length === 0) {
      const message = document.createElement('div');
      message.className = 'initial-message';
      message.textContent = `No words found starting with "${char}"`;
      wordListContainer.appendChild(message);
      return;
    }
    
    words.forEach(word => {
      const wordElement = document.createElement('div');
      wordElement.className = 'word-item';
      wordElement.textContent = word;
      wordElement.addEventListener('click', () => showWordDetails(word));
      wordListContainer.appendChild(wordElement);
    });
  }
  
  // Get sample words (replace with API call in production)
  async function getSampleWords(char) {
    try {
      // Fetch the word list from GitHub
      const response = await fetch('https://raw.githubusercontent.com/SugiSaku8/freeDictionaryAPI/refs/heads/master/meta/wordList/english.txt');
      if (!response.ok) throw new Error('Failed to fetch word list');
      
      const text = await response.text();
      const allWords = text.split('\n').filter(word => word.trim() !== '');
      
      // Filter words starting with the given character (case-insensitive)
      // and exclude words containing spaces, apostrophes, numbers, or hyphens
      const matchingWords = allWords.filter(word => 
        word.length > 0 && 
        word[0].toUpperCase() === char.toUpperCase() &&
        !word.includes(' ') && 
        !word.includes("'") &&
        !/[0-9]/.test(word) &&
        !word.includes('-')
      );
      
      // Return all matching words in lowercase
      return matchingWords.map(word => word.toLowerCase());
    } catch (error) {
      console.error('Error fetching sample words:', error);
      // Fallback to default samples if there's an error
      const defaultSamples = {
        'A': ['apple', 'animal', 'ant', 'art', 'ask'],
        'B': ['ball', 'book', 'bird', 'big', 'blue'],
        'C': ['cat', 'car', 'call', 'come', 'can']
      };
      return defaultSamples[char.toUpperCase()] || [];
    }
  }

  async function showWordDetails(word) {
    // Show loading state
    wordDetailsContainer.style.display = 'block';
    wordHeader.innerHTML = `<h2>${word}</h2><p>Loading...</p>`;
    wordDefinition.textContent = '';
    
    // Show back button
    backButton.style.display = 'block';
    
    // Check if the word is valid before making the API cal
    
    try {
      // Check cache first
      const cacheKey = `${currentLanguage}:${word}`;
      
      if (wordCache[cacheKey]) {
        displayWordDetails(word, wordCache[cacheKey]);
        return;
      }
      
      // Fetch from API
      const response = await fetch(`${API_BASE_URL}/${currentLanguage}/${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`The word "${word}" was not found in the dictionary.`);
        } else {
          throw new Error(`Error: ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      // Cache the result
      wordCache[cacheKey] = data[0];
      
      // Display the word details
      displayWordDetails(word, data[0]);
    } catch (error) {
      wordDefinition.innerHTML = `
        <div class="error-message">
          <p>${error.message || 'An error occurred while fetching the word details.'}</p>
          <p>Please try another word or check your internet connection.</p>
        </div>
      `;
      console.error('Error fetching word details:', error);
    }
  }
  
  // Display word details
  function displayWordDetails(word, data) {
    wordHeader.innerHTML = `
      <h2>${word}</h2>
      ${data.phonetic ? `<p class="phonetic">${data.phonetic}</p>` : ''}
    `;
    
    let html = '';
    
    data.meanings.forEach(meaning => {
      html += `
        <div class="meaning">
          <h3>${meaning.partOfSpeech}</h3>
          <ol>
      `;
      
      meaning.definitions.slice(0, 3).forEach(def => {
        html += `
          <li class="definition">
            <p>${def.definition}</p>
            ${def.example ? `<p class="example">${def.example}</p>` : ''}
          </li>
        `;
      });
      
      html += `
          </ol>
        </div>
      `;
    });
    
    wordDefinition.innerHTML = html;
  }
  
  // Set up event listeners
  function setupEventListeners() {
    // Language change
    languageSelect.addEventListener('change', (e) => {
      currentLanguage = e.target.value;
      renderIndex();
      wordListContainer.innerHTML = '';
      wordDetailsContainer.style.display = 'none';
      backButton.style.display = 'none';
    });
    
    // Back button
    backButton.addEventListener('click', () => {
      wordDetailsContainer.style.display = 'none';
      backButton.style.display = 'none';
    });
  }
  
  // Start the application
  init();
}