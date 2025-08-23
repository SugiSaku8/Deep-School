export const appMeta = {
  name: "SKRIFT",
  title: "Skrift",
  icon: "re/ico/dictionary.png"
};

// Import the dictionary (will be replaced with actual import in the final build)
let DICTIONARY = window.DICTIONARY || {};

// Track navigation history
const navigationHistory = [];
let currentView = 'index';

// Cache for word definitions
const wordCache = {};

export function appInit(shell) {
  const root = document.getElementById("app-root");
  let currentLanguage = 'en'; // Default to English
  const API_BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries";
  
  // English language configuration
  const LANGUAGE = {
    name: 'English', 
    code: 'en',
    indexChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  };
  
  // Set current language to English
  currentLanguage = 'en';
  
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
    
    // Language display (English only)
    languageSelect.className = 'language-select';
    languageSelect.style.display = 'none'; // Hide the language selector
    
    // Add English as the only language
    const option = document.createElement('option');
    option.value = 'en';
    option.textContent = LANGUAGE.name;
    languageSelect.appendChild(option);
    
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
    // Set up back button event listener
    backButton.addEventListener('click', handleBack);
    
    // Set up language selector change handler
    languageSelect.addEventListener('change', (e) => {
      currentLanguage = e.target.value;
      navigationHistory.length = 0; // Clear navigation history on language change
      navigateTo('index');
    });
    
    // Initialize UI
    initUI();
    
    // Initial render
    navigateTo('index');
  }
  
  // Navigation handler
  function navigateTo(view, data = {}) {
    // Save current view to history if it's changing
    if (currentView !== view) {
      navigationHistory.push({ view: currentView, data: { ...data } });
    }
    
    currentView = view;
    
    // Update UI based on view
    switch(view) {
      case 'index':
        renderIndex();
        backButton.style.display = 'none';
        wordListContainer.style.display = 'none';
        wordDetailsContainer.style.display = 'none';
        indexContainer.style.display = 'grid';
        break;
        
      case 'wordList':
        if (!data.char) {
          console.error('No character provided for word list');
          return;
        }
        renderWordList(data.char);
        backButton.style.display = 'block';
        wordListContainer.style.display = 'block';
        wordDetailsContainer.style.display = 'none';
        indexContainer.style.display = 'none';
        break;
        
      case 'wordDetails':
        if (!data.word) {
          console.error('No word provided for details');
          return;
        }
        renderWordDetails(data.word);
        backButton.style.display = 'block';
        wordListContainer.style.display = 'none';
        wordDetailsContainer.style.display = 'block';
        indexContainer.style.display = 'none';
        break;
        
      default:
        console.error('Unknown view:', view);
    }
  }
  
  // Handle back button click
  function handleBack() {
    if (navigationHistory.length > 0) {
      const previous = navigationHistory.pop();
      if (previous) {
        currentView = ''; // Reset current view to force update
        navigateTo(previous.view, previous.data);
        return;
      }
    }
    // If no history or invalid history entry, go to index
    navigateTo('index');
  }
  
  // Render the index with only characters that have words in the dictionary
  function renderIndex() {
    indexContainer.innerHTML = '';
    const availableChars = [];
    
    // Get all characters that have words in the English dictionary
    if (DICTIONARY && DICTIONARY[currentLanguage]) {
      Object.keys(DICTIONARY[currentLanguage]).forEach(char => {
        const words = DICTIONARY[currentLanguage][char];
        if (words && words.length > 0) {
          availableChars.push(char);
        }
      });
    }
    
    // Get the available characters for English
    availableChars = LANGUAGE.indexChars || [];

    // Check if there are any characters available
    if (availableChars.length === 0) {
      const noWordsMsg = document.createElement('div');
      noWordsMsg.className = 'no-words-msg';
      noWordsMsg.textContent = 'No dictionary data available for this language';
      indexContainer.appendChild(noWordsMsg);
      return;
    }

// Now we can use availableChars here without redeclaring it
availableChars.sort().forEach(char => {
  const charButton = document.createElement('button');
  charButton.className = 'index-char';
  charButton.textContent = char;
  charButton.addEventListener('click', () => navigateTo('wordList', { char }));
  indexContainer.appendChild(charButton);
});
  }

// Render word list for a specific character
function renderWordList(char) {
  wordListContainer.innerHTML = '';
  
  const wordListTitle = document.createElement('h2');
  wordListTitle.className = 'word-list-title';
  wordListTitle.textContent = `Words starting with ${char}`;
  wordListContainer.appendChild(wordListTitle);
  
  const wordList = document.createElement('div');
  wordList.className = 'word-items';
  
  // Show words for the selected character
  if (DICTIONARY && DICTIONARY[currentLanguage] && DICTIONARY[currentLanguage][char]) {
    DICTIONARY[currentLanguage][char].forEach(word => {
      const wordElement = document.createElement('div');
      wordElement.className = 'word-item';
      wordElement.textContent = word;
      wordElement.addEventListener('click', () => navigateTo('wordDetails', { word }));
      wordList.appendChild(wordElement);
    });
  } else {
    const noWordsMsg = document.createElement('div');
    noWordsMsg.className = 'no-words-msg';
    noWordsMsg.textContent = 'No words found for this character';
    wordList.appendChild(noWordsMsg);
  }
  
  wordListContainer.appendChild(wordList);
}

// Render word details
function renderWordDetails(word) {
  wordDetailsContainer.innerHTML = `
    <h2>${word}</h2>
    <div class="word-definition">
      <p>Loading definition...</p>
    </div>
  `;
  
  // Check cache first
  if (wordCache[word]) {
    updateWordDetails(word, wordCache[word]);
    return;
  }
  
  // Fetch from API if not in cache
  fetchWordDetails(word);
}

// Fetch word details from API
async function fetchWordDetails(word) {
  try {
    const response = await fetch(`${API_BASE_URL}/${currentLanguage}/${encodeURIComponent(word)}`);
    if (!response.ok) {
      throw new Error('Word not found');
    }
    const data = await response.json();
    wordCache[word] = data; // Cache the result
    updateWordDetails(word, data);
  } catch (error) {
    console.error('Error fetching word details:', error);
    wordDetailsContainer.innerHTML = `
      <div class="error">
        <h2>${word}</h2>
        <p>Could not load definition: ${error.message}</p>
      </div>
    `;
  }
}

// Update word details in the UI
function updateWordDetails(word, data) {
  // This is a simplified version - you can expand this to show more details
  wordDetailsContainer.innerHTML = `
    <h2>${word}</h2>
    <div class="word-definition">
      <p>Definition for ${word} will be displayed here.</p>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    </div>
  `;
}

  // Start the application
  init();
}
