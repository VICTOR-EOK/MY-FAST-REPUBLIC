const fs = require('fs');
const path = 'C:/Users/Administrator/.qclaw/workspace/enterprise/tarot-miniprogram/src/data/cards.json';
const cards = JSON.parse(fs.readFileSync(path, 'utf-8'));

const npmMap = {
  'the_fool':'major-arcana/0m','the_magician':'major-arcana/1m',
  'the_high_priestess':'major-arcana/2m','the_empress':'major-arcana/3m',
  'the_emperor':'major-arcana/4m','the_hierophant':'major-arcana/5m',
  'the_lovers':'major-arcana/6m','the_chariot':'major-arcana/7m',
  'strength':'major-arcana/8m','the_hermit':'major-arcana/9m',
  'wheel_of_fortune':'major-arcana/10m','justice':'major-arcana/11m',
  'the_hanged_man':'major-arcana/12m','death':'major-arcana/13m',
  'temperance':'major-arcana/14m','the_devil':'major-arcana/15m',
  'the_tower':'major-arcana/16m','the_star':'major-arcana/17m',
  'the_moon':'major-arcana/18m','the_sun':'major-arcana/19m',
  'judgement':'major-arcana/20m','the_world':'major-arcana/21m'
};

const suitMap = {wands:'w',cups:'c',swords:'s',pentacles:'p'};
const courtMap = {page:'pc',knight:'nc',queen:'qc',king:'kc'};
const numMap = {ace:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10'};

let up = 0;
cards.forEach(card => {
  let k = npmMap[card.id];
  if (!k && card.suit) {
    const s = suitMap[card.suit];
    const parts = card.id.split('_');
    const np = parts[parts.length - 1];
    if (courtMap[np]) {
      k = 'minor-arcana/' + card.suit + '/' + courtMap[np];
    } else {
      const n = numMap[np];
      if (n) k = 'minor-arcana/' + card.suit + '/' + n + s;
    }
  }
  if (k) {
    card.image = './static/tarot-cards/' + k + '.jpg';
    up++;
  } else {
    console.log('MISS:', card.id);
  }
});

fs.writeFileSync(path, JSON.stringify(cards, null, 2), 'utf-8');
console.log('Updated:', up, '/', cards.length);

// Verify
const v = JSON.parse(fs.readFileSync(path, 'utf-8'));
v.slice(0,3).forEach(c => console.log(c.id, '->', c.image));
v.slice(22,25).forEach(c => console.log(c.id, '->', c.image));
v.slice(50,53).forEach(c => console.log(c.id, '->', c.image));
v.slice(70,73).forEach(c => console.log(c.id, '->', c.image));
