const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, 'skrift.dic.js');
const ENGLISH_WORDLIST_URL = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';
const MAX_WORDS_PER_LETTER = 100;

// Function to fetch English word list
async function fetchEnglishWords() {
  try {
    console.log('Fetching English word list...');
    const response = await axios.get(ENGLISH_WORDLIST_URL);
    const words = response.data.split('\r\n').filter(word => word.length > 0);
    console.log(`Fetched ${words.length} English words`);
    return words;
  } catch (error) {
    console.error('Error fetching English word list:', error.message);
    throw error;
  }
}

// Function to organize words by their first letter
function organizeWordsByLetter(words) {
  const dictionary = {};
  
  // Initialize A-Z
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
    dictionary[letter] = [];
  });
  
  // Group words by first letter
  words.forEach(word => {
    if (!word) return;
    
    const firstLetter = word[0].toUpperCase();
    if (dictionary[firstLetter] && dictionary[firstLetter].length < MAX_WORDS_PER_LETTER) {
      dictionary[firstLetter].push(word);
    }
  });
  
  return dictionary;
}

async function generateDictionary() {
  try {
    // Fetch and process English words
    const words = await fetchEnglishWords();
    const englishDict = organizeWordsByLetter(words);
    
    // Create dictionary structure
    const dictionary = {
      en: englishDict,
      ja: {},  // Empty for now
      ko: {}   // Empty for now
    };
    
    // Generate the output file
    const output = `// Auto-generated dictionary (${new Date().toISOString()})
// English words from: ${ENGLISH_WORDLIST_URL}
// Japanese and Korean dictionaries are empty
const DICTIONARY = ${JSON.stringify(dictionary, null, 2)};

try {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DICTIONARY };
  }
} catch (e) {}
`;
    
    await fs.writeFile(OUTPUT_FILE, output, 'utf8');
    
    console.log('=== English Dictionary Generated ===');
    console.log(`Output file: ${OUTPUT_FILE}`);
    
    // Print summary
    const totalWords = Object.values(englishDict).reduce((sum, words) => sum + words.length, 0);
    console.log(`\nEnglish (en):`);
    console.log(`- ${Object.keys(englishDict).filter(k => englishDict[k].length > 0).length} letters with words`);
    console.log(`- ${totalWords} total words (max ${MAX_WORDS_PER_LETTER} per letter)`);
    
  } catch (error) {
    console.error('Failed to generate dictionary:', error);
    process.exit(1);
  }
}

// Run the generator
generateDictionary();
