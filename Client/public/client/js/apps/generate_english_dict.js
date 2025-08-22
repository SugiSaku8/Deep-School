const fs = require('fs').promises;
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, 'skrift.dic.js');

// Korean dictionary with words grouped by initial consonant (choseong)
const KOREAN_DICT = {
  'ㄱ': ['가다', '가방', '가족', '가수', '가격', '가게', '가구', '가깝다', '가르치다', '가로수'],
  'ㄴ': ['나무', '나비', '나라', '나이', '나중', '나쁘다', '나오다', '나이프', '나흘', '나들이'],
  'ㄷ': ['다리', '다음', '다양하다', '다이어리', '다리미', '다니다', '다르다', '다섯', '다짐', '다행'],
  'ㄹ': ['라디오', '라면', '라이터', '라켓', '라인', '라일락', '라즈베리', '라틴', '라운드', '라운지'],
  'ㅁ': ['마음', '마시다', '마을', '마치다', '마지막', '마트', '마루', '마리', '마스크', '마우스'],
  'ㅂ': ['바다', '바람', '바나나', '바지', '바보', '바쁘다', '바로', '바구니', '바늘', '바닥'],
  'ㅅ': ['사과', '사람', '사랑', '사진', '사다', '사랑하다', '사다리', '사막', '사실', '사자'],
  'ㅇ': ['아기', '아빠', '아이', '아침', '아니오', '아니요', '아니', '아파트', '아주', '아름답다'],
  'ㅈ': ['자다', '자동차', '자리', '자주', '자르다', '자전거', '자연', '자기', '자유', '자기소개'],
  'ㅊ': ['차다', '차갑다', '차례', '차이', '차분하다', '차표', '차장', '차선', '차도', '차량'],
  'ㅋ': ['카드', '카메라', '카페', '카운터', '카레', '카세트', '카탈로그', '카트', '카레라이스', '카레가루'],
  'ㅌ': ['타다', '타자', '타이어', '타이머', '타이틀', '타악기', '타임', '타이프', '타이틀곡', '타이틀롤'],
  'ㅍ': ['파도', '파란색', '파티', '파일', '파스타', '파출소', '파이팅', '파란불', '파일럿', '파이어폭스'],
  'ㅎ': ['하다', '하늘', '하루', '하마', '하얗다', '하나', '하나님', '하나되다', '하나뿐이다', '하나같이']
};

// Dictionary with only Korean words (English and Japanese are empty)
const DICTIONARY = {
  en: {},
  ja: {},
  ko: KOREAN_DICT
};

async function generateDictionary() {
  try {
    const output = `// Auto-generated dictionary (${new Date().toISOString()})
// Note: Currently only Korean words are implemented
const DICTIONARY = ${JSON.stringify(DICTIONARY, null, 2)};

try {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DICTIONARY };
  }
} catch (e) {}
`;
    
    await fs.writeFile(OUTPUT_FILE, output, 'utf8');
    
    console.log('=== Korean Dictionary Generated ===');
    console.log(`Output file: ${OUTPUT_FILE}`);
    
    // Print summary
    const totalWords = Object.values(KOREAN_DICT).reduce((sum, words) => sum + words.length, 0);
    console.log(`\n한국어 (ko):`);
    console.log(`- ${Object.keys(KOREAN_DICT).length} characters with words`);
    console.log(`- ${totalWords} total words`);
    console.log('\nNote: English and Japanese dictionaries are not implemented yet.');
    
  } catch (error) {
    console.error('Failed to generate dictionary:', error);
    process.exit(1);
  }
}

// Run the generator
generateDictionary();
