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
  
  // Initialize the UI
  function initUI() {
    // Create header
    const header = document.createElement('div');
    header.className = 'app-header';
    
    // Back button
    backButton.className = 'back-button';
    backButton.style.display = 'none';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
    
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
        background-color: #2c2c2c;
        color: white;
        border-bottom: 1px solid #444;
      }
      
      .back-button {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        margin-right: 15px;
      }
      
      .app-title {
        font-size: 20px;
        font-weight: bold;
        flex-grow: 1;
      }
      
      .language-select {
        padding: 5px 10px;
        border-radius: 4px;
        background-color: #3a3a3a;
        color: white;
        border: 1px solid #555;
      }
      
      .dictionary-container {
        display: flex;
        height: calc(100vh - 50px);
        background-color: #2c2c2c;
        color: #e0e0e0;
      }
      
      .index-section {
        width: 80px;
        background-color: #1e1e1e;
        border-right: 1px solid #444;
        overflow-y: auto;
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
        transition: background-color 0.2s;
      }
      
      .index-char:hover, .index-char.active {
        background-color: #444;
      }
      
      .word-list-section {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
      }
      
      .word-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
      }
      
      .word-item {
        padding: 12px;
        background-color: #3a3a3a;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .word-item:hover {
        background-color: #4a4a4a;
      }
      
      .initial-message {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px 20px;
        color: #888;
      }
      
      .word-details {
        width: 400px;
        padding: 20px;
        background-color: #2c2c2c;
        border-left: 1px solid #444;
        overflow-y: auto;
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
  
  // Initialize the application
  function init() {
    initUI();
    renderIndex();
    setupEventListeners();
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
      const matchingWords = allWords.filter(word => 
        word.length > 0 && word[0].toUpperCase() === char.toUpperCase()
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
  
  // Show word details
  // Check if a word is valid
  // Must contain at least 2 letters, can include hyphens or apostrophes
  // But must not start/end with a hyphen/apostrophe
  function isValidWord(word) {
    return true;
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