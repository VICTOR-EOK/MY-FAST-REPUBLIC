/**
 * AI 解读接口工具
 * ============================================
 * 当前为【模拟模式】：调用 mockInterpret() 返回模拟解读
 *
 * 【对接真实 AI 接口步骤】：
 * 1. 在下方 INTERPRET_API_URL 处填入你的后端接口地址
 * 2. 取消 mockInterpret() 的调用，改为 uni.request 调用真实接口
 * 3. 后端接口需接收 { cards, question, spread }，返回 { interpretation: "..." }
 * 4. 建议后端对接 OpenAI / DeepSeek / 文心一言等 LLM API
 *
 * 示例请求体：
 * {
 *   "cards": [
 *     { "name_cn": "愚人", "orientation": "upright" },
 *     { "name_cn": "圣杯二", "orientation": "reversed" }
 *   ],
 *   "question": "我的桃花运如何？",
 *   "spread": "three_cards"
 * }
 */

// ============================================
// 【AI 对接点 1】修改此处为你的真实接口地址
// ============================================
const INTERPRET_API_URL = 'https://your-backend.com/api/tarot/interpret';

/**
 * 模拟 AI 解读（开发阶段使用）
 * @param {Array} cards - 抽中的牌数组
 * @param {String} question - 用户问题
 * @param {String} spreadId - 牌阵 ID
 * @returns {Promise<String>} 解读文本
 */
function mockInterpret(cards, question, spreadId) {
  const cardDescs = cards.map(c => {
    const dir = c.orientation === 'reversed' ? '（逆位）' : '（正位）';
    return c.name_cn + dir + '：' + c.meanings[c.orientation];
  }).join('；');

  const mockTexts = [
    `🔮 针对你的问题"${question}"，塔罗牌给出了如下指引：\n\n${cardDescs}\n\n整体来看，当前能量较为活跃，建议你保持开放心态，勇敢迎接变化。逆位牌提示需要关注被忽略的内在声音。`,
    `🌙 你询问的是"${question}"。\n\n${cardDescs}\n\n从牌面来看，过去的经历正在影响你的现在。建议静心反思，找到内在的真实需求，而非盲目跟随外界期待。`,
    `✨ 关于"${question}"，本次牌阵揭示了重要信息：\n\n${cardDescs}\n\n综合解读：你正处于一个转折点。正位牌带来积极能量，逆位牌则提醒你需要释放旧有模式。信任直觉，迈出第一步。`
  ];

  const idx = Math.floor(Math.random() * mockTexts.length);
  return Promise.resolve(mockTexts[idx]);
}

/**
 * 调用 AI 解读接口（主入口）
 * @param {Array} cards - 抽中的牌
 * @param {String} question - 用户问题
 * @param {Object} spread - 牌阵对象
 * @returns {Promise<String>}
 */
export function interpret(cards, question, spread) {
  // ============================================
  // 【AI 对接点 2】注释掉下面这行，取消注释 uni.request 部分，即可对接真实接口
  // ============================================
  return mockInterpret(cards, question, spread ? spread.id : '');

  /*
  // 真实接口调用（取消注释以启用）
  return new Promise((resolve, reject) => {
    uni.request({
      url: INTERPRET_API_URL,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: {
        cards: cards.map(c => ({
          id: c.id,
          name_cn: c.name_cn,
          name_en: c.name_en,
          orientation: c.orientation,
          meaning: c.meanings[c.orientation]
        })),
        question: question,
        spread: spread ? spread.id : ''
      },
      success: (res) => {
        if (res.data && res.data.interpretation) {
          resolve(res.data.interpretation);
        } else {
          resolve('解读结果加载失败，请稍后再试。');
        }
      },
      fail: (err) => {
        console.error('AI解读接口调用失败', err);
        reject(err);
      }
    });
  });
  */
}

/**
 * 调用后端「抽牌」接口（可选）
 * 如果后端负责洗牌逻辑，调用此接口
 * @param {String} userId
 * @param {String} question
 * @param {String} spreadId
 * @returns {Promise<Array>} 后端返回的牌数组
 */
function drawFromServer(userId, question, spreadId) {
  // 【AI 对接点 3】取消注释以启用后端抽牌
  /*
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://your-backend.com/api/tarot/draw',
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { user_id: userId, question, spread: spreadId },
      success: (res) => resolve(res.data.cards || []),
      fail: (err) => reject(err)
    });
  });
  */
  return Promise.resolve([]);
}
