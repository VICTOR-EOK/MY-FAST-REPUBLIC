/**
 * 塔罗牌抽牌工具
 * 负责洗牌、抽牌逻辑
 */

// 从 cards.json 加载牌库（小程序端通过 import 引入）
// 这里提供工具函数在运行时使用

/**
 * 洗牌算法（Fisher-Yates）
 * @param {Array} arr - 牌数组
 * @returns {Array} - 洗牌后的数组
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 抽取指定数量的牌（含正逆位）
 * @param {Array} deck - 已洗牌的牌库
 * @param {Number} count - 抽取数量
 * @returns {Array} - 抽中的牌（含 orientation）
 */
export function drawCards(deck, count) {
  const drawn = [];
  for (let i = 0; i < count; i++) {
    if (i >= deck.length) break;
    const card = { ...deck[i] };
    // 50% 概率逆位
    card.orientation = Math.random() > 0.5 ? 'upright' : 'reversed';
    drawn.push(card);
  }
  return drawn;
}

/**
 * 完整抽牌流程（供页面调用）
 * @param {Array} allCards - 全部78张牌
 * @param {Number} count - 需要抽的牌数
 * @returns {Array} - 抽中的牌数组
 */
export function performDraw(allCards, count) {
  const shuffled = shuffle(allCards);
  return drawCards(shuffled, count);
}

/**
 * 获取牌面显示名称（含正逆位标注）
 * @param {Object} card - 牌对象
 * @returns {String}
 */
export function getCardDisplayName(card) {
  const prefix = card.orientation === 'reversed' ? '【逆】' : '';
  return prefix + card.name_cn;
}
