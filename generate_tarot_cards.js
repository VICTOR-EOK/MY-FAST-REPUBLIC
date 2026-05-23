// 塔罗牌SVG生成器 - 生成78张Rider-Waite风格塔罗牌
const fs = require('fs');

const outputBase = 'C:/Users/Administrator/.qclaw/workspace/enterprise/tarot-miniprogram/static/tarot-cards';

// 大阿卡纳 (22张)
const majorArcana = [
    {id: 'the_fool', num: 0, name: '愚人', roman: '0', symbol: '☉', color: '#f0c674'},
    {id: 'the_magician', num: 1, name: '魔术师', roman: 'I', symbol: '☿', color: '#e94560'},
    {id: 'the_high_priestess', num: 2, name: '女祭司', roman: 'II', symbol: '☽', color: '#9b59b6'},
    {id: 'the_empress', num: 3, name: '女皇', roman: 'III', symbol: '♀', color: '#27ae60'},
    {id: 'the_emperor', num: 4, name: '皇帝', roman: 'IV', symbol: '♂', color: '#e67e22'},
    {id: 'the_hierophant', num: 5, name: '教皇', roman: 'V', symbol: '✝', color: '#8e44ad'},
    {id: 'the_lovers', num: 6, name: '恋人', roman: 'VI', symbol: '☌', color: '#3498db'},
    {id: 'the_chariot', num: 7, name: '战车', roman: 'VII', symbol: '⚜', color: '#c0392b'},
    {id: 'strength', num: 8, name: '力量', roman: 'VIII', symbol: '♌', color: '#f39c12'},
    {id: 'the_hermit', num: 9, name: '隐士', roman: 'IX', symbol: '☯', color: '#95a5a6'},
    {id: 'wheel_of_fortune', num: 10, name: '命运之轮', roman: 'X', symbol: '☸', color: '#9b59b6'},
    {id: 'justice', num: 11, name: '正义', roman: 'XI', symbol: '⚖', color: '#f1c40f'},
    {id: 'the_hanged_man', num: 12, name: '倒吊人', roman: 'XII', symbol: '⊥', color: '#3498db'},
    {id: 'death', num: 13, name: '死神', roman: 'XIII', symbol: '✳', color: '#2c3e50'},
    {id: 'temperance', num: 14, name: '节制', roman: 'XIV', symbol: '△', color: '#1abc9c'},
    {id: 'the_devil', num: 15, name: '恶魔', roman: 'XV', symbol: '⛧', color: '#e74c3c'},
    {id: 'the_tower', num: 16, name: '塔', roman: 'XVI', symbol: '⚡', color: '#e74c3c'},
    {id: 'the_star', num: 17, name: '星星', roman: 'XVII', symbol: '★', color: '#3498db'},
    {id: 'the_moon', num: 18, name: '月亮', roman: 'XVIII', symbol: '☾', color: '#9b59b6'},
    {id: 'the_sun', num: 19, name: '太阳', roman: 'XIX', symbol: '☼', color: '#f39c12'},
    {id: 'judgement', num: 20, name: '审判', roman: 'XX', symbol: '⚚', color: '#e67e22'},
    {id: 'the_world', num: 21, name: '世界', roman: 'XXI', symbol: '◯', color: '#27ae60'}
];

// 小阿卡纳 (56张)
const suits = [
    {id: 'wands', name: '权杖', symbol: '🜂', color: '#e67e22'},
    {id: 'cups', name: '圣杯', symbol: '🜄', color: '#3498db'},
    {id: 'swords', name: '宝剑', symbol: '🜁', color: '#9b59b6'},
    {id: 'pentacles', name: '星币', symbol: '🜃', color: '#27ae60'}
];

const courtCards = ['Ace', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'Page', 'Knight', 'Queen', 'King'];

function createMajorArcanaSVG(card) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 350">
  <defs>
    <linearGradient id="bg_${card.id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f0f1a;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="glow_${card.id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${card.color};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:${card.color};stop-opacity:0" />
    </radialGradient>
  </defs>
  <!-- Card Background -->
  <rect width="200" height="350" rx="15" fill="url(#bg_${card.id})"/>
  <rect width="200" height="350" rx="15" fill="url(#glow_${card.id})"/>
  <!-- Border -->
  <rect x="5" y="5" width="190" height="340" rx="12" fill="none" stroke="${card.color}" stroke-width="2"/>
  <!-- Card Number (top left) -->
  <text x="15" y="30" font-family="Georgia, serif" font-size="18" fill="${card.color}">${card.num}</text>
  <!-- Card Name (bottom) -->
  <text x="100" y="335" font-family="Georgia, serif" font-size="14" fill="white" text-anchor="middle">${card.name}</text>
  <!-- Roman Numeral (top right) -->
  <text x="185" y="30" font-family="Georgia, serif" font-size="14" fill="${card.color}" text-anchor="end">${card.roman}</text>
  <!-- Center Symbol Area -->
  <g transform="translate(100, 175)">
    <circle r="55" fill="none" stroke="${card.color}" stroke-width="1" opacity="0.5"/>
    <circle r="45" fill="none" stroke="${card.color}" stroke-width="0.5" opacity="0.3"/>
    <text x="0" y="5" font-family="Georgia, serif" font-size="40" fill="${card.color}" text-anchor="middle">${card.symbol}</text>
  </g>
  <!-- Decorative elements -->
  <circle cx="30" cy="60" r="2" fill="${card.color}" opacity="0.5"/>
  <circle cx="170" cy="80" r="1.5" fill="${card.color}" opacity="0.4"/>
  <circle cx="40" cy="280" r="1" fill="${card.color}" opacity="0.3"/>
  <circle cx="160" cy="250" r="1.5" fill="${card.color}" opacity="0.4"/>
  <!-- Card ID at bottom left -->
  <text x="15" y="320" font-family="Arial, sans-serif" font-size="8" fill="${card.color}" opacity="0.5">${card.id}</text>
</svg>`;
}

function createMinorArcanaSVG(suit, rank, courtName) {
    const rankStr = isNaN(rank) ? rank : String(rank);
    const cardName = courtName || `${rankStr}`;
    const cardId = `${suit.id}_${rankStr.toLowerCase()}`;
    
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 350">
  <defs>
    <linearGradient id="bg_${cardId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f0f1a;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="glow_${cardId}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${suit.color};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:${suit.color};stop-opacity:0" />
    </radialGradient>
  </defs>
  <!-- Card Background -->
  <rect width="200" height="350" rx="15" fill="url(#bg_${cardId})"/>
  <rect width="200" height="350" rx="15" fill="url(#glow_${cardId})"/>
  <!-- Border -->
  <rect x="5" y="5" width="190" height="340" rx="12" fill="none" stroke="${suit.color}" stroke-width="2"/>
  <!-- Card Number (top left) -->
  <text x="15" y="30" font-family="Georgia, serif" font-size="18" fill="${suit.color}">${rankStr}</text>
  <!-- Suit Symbol (top right) -->
  <text x="185" y="30" font-family="Arial, sans-serif" font-size="20" fill="${suit.color}" text-anchor="end">${suit.symbol}</text>
  <!-- Center Suit Symbol -->
  <g transform="translate(100, 175)">
    <circle r="55" fill="none" stroke="${suit.color}" stroke-width="1" opacity="0.5"/>
    <circle r="45" fill="none" stroke="${suit.color}" stroke-width="0.5" opacity="0.3"/>
    <text x="0" y="7" font-family="Arial, sans-serif" font-size="60" fill="${suit.color}" text-anchor="middle">${suit.symbol}</text>
  </g>
  <!-- Card Name (bottom) -->
  <text x="100" y="330" font-family="Georgia, serif" font-size="12" fill="white" text-anchor="middle">${suit.name}${cardName}</text>
  <!-- Decorative elements -->
  <circle cx="30" cy="60" r="2" fill="${suit.color}" opacity="0.5"/>
  <circle cx="170" cy="80" r="1.5" fill="${suit.color}" opacity="0.4"/>
  <circle cx="40" cy="280" r="1" fill="${suit.color}" opacity="0.3"/>
  <circle cx="160" cy="250" r="1.5" fill="${suit.color}" opacity="0.4"/>
  <!-- Card ID at bottom left -->
  <text x="15" y="320" font-family="Arial, sans-serif" font-size="8" fill="${suit.color}" opacity="0.5">${cardId}</text>
</svg>`;
}

// 创建目录
fs.mkdirSync(outputBase + '/major-arcana', {recursive: true});
fs.mkdirSync(outputBase + '/minor-arcana/wands', {recursive: true});
fs.mkdirSync(outputBase + '/minor-arcana/cups', {recursive: true});
fs.mkdirSync(outputBase + '/minor-arcana/swords', {recursive: true});
fs.mkdirSync(outputBase + '/minor-arcana/pentacles', {recursive: true});

console.log('开始生成78张塔罗牌SVG...\n');

// 生成大阿卡纳 (22张)
console.log('=== 大阿卡纳 (22张) ===');
majorArcana.forEach(card => {
    const svg = createMajorArcanaSVG(card);
    const filePath = `${outputBase}/major-arcana/${card.id}.svg`;
    fs.writeFileSync(filePath, svg);
    console.log(`✓ ${card.name} (${card.roman})`);
});

console.log('\n=== 小阿卡纳 (56张) ===');
// 生成小阿卡纳 (56张)
// 权杖 14张: A, 2-10, P, K, Q
const wandsRanks = ['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Page', 'Knight', 'Queen', 'King'];
const cupsRanks = ['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Page', 'Knight', 'Queen', 'King'];
const swordsRanks = ['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Page', 'Knight', 'Queen', 'King'];
const pentaclesRanks = ['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Page', 'Knight', 'Queen', 'King'];

suits.forEach((suit, idx) => {
    console.log(`\n--- ${suit.name} ---`);
    const ranks = [wandsRanks, cupsRanks, swordsRanks, pentaclesRanks][idx];
    ranks.forEach(rank => {
        const svg = createMinorArcanaSVG(suit, rank);
        const rankStr = isNaN(rank) ? rank : String(rank);
        const fileName = `/${suit.id}_${rankStr.toLowerCase()}.svg`;
        const filePath = `${outputBase}/minor-arcana/${suit.id}${fileName}`;
        fs.writeFileSync(filePath, svg);
        const displayName = isNaN(rank) ? rank : (rank === 'Ace' ? 'A' : rank);
        console.log(`✓ ${suit.name} ${displayName}`);
    });
});

console.log('\n========================================');
console.log('🎉 78张塔罗牌SVG全部生成完成！');
console.log('========================================');
console.log(`存放位置: ${outputBase}`);
console.log('\n文件结构:');
console.log('├── major-arcana/ (22张)');
console.log('└── minor-arcana/ (56张)');
console.log('    ├── wands/ (14张)');
console.log('    ├── cups/ (14张)');
console.log('    ├── swords/ (14张)');
console.log('    └── pentacles/ (14张)');