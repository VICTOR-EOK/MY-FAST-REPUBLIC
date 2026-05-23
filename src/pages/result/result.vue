<template>
  <view class="container">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-wrap">
      <text class="loading-icon">🔮</text>
      <text class="loading-text">塔罗牌正在解读中...</text>
    </view>

    <!-- 解读结果 -->
    <view v-else class="result-wrap">
      <!-- 问题 -->
      <view class="question-box" v-if="question">
        <text class="question-label">你的问题是：</text>
        <text class="question-text">{{ question }}</text>
      </view>

      <!-- 牌阵展示 -->
      <view class="cards-section">
        <text class="section-title">🃏 抽牌结果</text>
        <view class="cards-row">
          <view v-for="(card, idx) in cards" :key="idx" class="card-item">
            <view class="card-position" v-if="positions.length">{{ positions[idx] || '牌' + (idx + 1) }}</view>
            <img
              v-if="!card.imgError"
              :src="card.image"
              class="card-img"
              @error="onImgError(idx)"
            />
            <view v-else class="card-backup">{{ card.name_cn }}</view>
            <text class="card-name">{{ card.name_cn }}{{ card.orientation === 'reversed' ? '（逆位）' : '（正位）' }}</text>
          </view>
        </view>
      </view>

      <!-- 解读内容 -->
      <view class="interpretation-box">
        <text class="section-title">✨ AI 解读</text>
        <text class="interpretation-text">{{ interpretation }}</text>
      </view>

      <!-- 操作按钮 -->
      <view class="actions">
        <button class="btn-share" @tap="share">分享给好友</button>
        <button class="btn-back" @tap="goBack">再测一次</button>
        <button class="btn-history" @tap="goHistory">查看记录</button>
      </view>

      <!-- 付费提示 -->
      <view class="vip-box" v-if="showPayHint">
        <text class="vip-text">¥1 = 3次解读机会，立即解锁</text>
        <button class="btn-vip" @tap="goVip">立即解锁</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import spreadsData from '@/data/spreads.json';
import cardsData from '@/data/cards.json';
import { getPaidQuota, unlockPaidQuota, getRemainingQuota } from '@/utils/dailyQuota.js';

const cards = ref([]);
const question = ref('');
const positions = ref([]);
const spreadId = ref('three_cards'); // 新增：记录当前牌阵ID
const interpretation = ref('');
const loading = ref(true);
const showPayHint = ref(false);
const paidQuota = ref(0);

onLoad((options) => {
  console.log('[result] onLoad options:', options);
  parseParams(options);
});

onMounted(() => {
  paidQuota.value = getPaidQuota();
  // 如果付费次数为0且免费次数已用完，显示付费提示
  if (getRemainingQuota() <= 0 && paidQuota.value <= 0) {
    showPayHint.value = true;
  }
});

// H5 模式兜底（uni-app H5 使用 hash 路由）
onMounted(() => {
  if (cards.value.length === 0 && typeof window !== 'undefined') {
    // 从 hash 中提取参数（如 #/pages/result/result?cards=...&question=...）
    const hash = window.location.hash;
    const qIdx = hash.indexOf('?');
    if (qIdx >= 0) {
      const queryString = hash.substring(qIdx + 1);
      const params = new URLSearchParams(queryString);
      const options = {};
      params.forEach((value, key) => { options[key] = value; });
      console.log('[result] H5 hash fallback options:', options);
      parseParams(options);
    }
  }
});

function parseParams(opts) {
  try {
    if (opts.cards) {
      const decoded = decodeURIComponent(opts.cards);
      console.log('[result] 解析cards:', decoded.substring(0, 100) + '...');
      const parsed = JSON.parse(decoded);
      cards.value = parsed.map(c => {
        const cardInfo = cardsData.find(d => d.id === c.id);
        let imagePath = c.image || (cardInfo ? cardInfo.image : '');
        if (imagePath && imagePath.startsWith('/static/')) {
          imagePath = '.' + imagePath;
        }
        return {
          ...c,
          name_cn: c.name_cn || (cardInfo ? cardInfo.name_cn : c.name),
          image: imagePath,
          meanings: c.meanings || (cardInfo ? cardInfo.meanings : {}),
          imgError: false
        };
      });
      console.log('[result] 解析到', cards.value.length, '张牌');
    }
  } catch (e) {
    console.error('[result] 解析牌数据失败', e);
  }

  question.value = decodeURIComponent((opts.question || ''));

  // 获取牌阵位置名
  spreadId.value = opts.spreadId || 'three_cards';
  const spread = spreadsData.find(s => s.id === spreadId.value);
  if (spread) {
    positions.value = spread.positions.map(p => p.name);
  }

  generateInterpretation();
}

async function generateInterpretation() {
  loading.value = true;
  try {
    const result = await mockInterpret(cards.value, question.value, positions.value, spreadId.value);
    interpretation.value = result;
    console.log('[result] 解读完成，牌阵:', spreadId.value, '牌数:', cards.value.length, '长度:', result.length);
  } catch (e) {
    interpretation.value = '解读生成失败，请稍后重试。';
    console.error('[result] 解读失败:', e);
  }
  loading.value = false;
}

// 专业塔罗牌解读函数（按塔罗牌逻辑输出）
function mockInterpret(cardsList, questionText, positionsList, spreadIdVal) {
  return new Promise((resolve) => {
    // 牌阵名称
    const spreadNames = {
      'three_cards': '三张牌阵',
      'celtic_cross': '凯尔特十字牌阵',
      'five_cards': '五张牌阵',
      'relationship': '感情牌阵',
      'time_flow': '时间流牌阵',
      'sacred_triangle': '神圣三角牌阵',
      'love_spread': '爱情牌阵'
    };
    const spreadName = spreadNames[spreadIdVal] || '塔罗牌阵';
    const cardCount = cardsList.length;

    // 元素对应表 & 大阿卡纳元素归属
    const elementMap = {
      '权杖': '🔥 火元素（行动、创造力、意志力）',
      '圣杯': '💧 水元素（情感、直觉、人际关系）',
      '宝剑': '🌬️ 风元素（思维、沟通、决断）',
      '星币': '🌍 土元素（物质、财富、身体健康）'
    };

    // 大阿卡纳传统元素归属（RWS体系）
    function getCardElement(card) {
      const nameCn = card.name_cn || '';
      const nameEn = (card.name || '').toLowerCase();
      // 先检查是否为小阿卡纳（含花色名）
      for (const suit of ['权杖', '圣杯', '宝剑', '星币']) {
        if (nameCn.includes(suit)) return elementMap[suit];
      }
      // 大阿卡纳按RWS传统元素关联
      const fireCards = ['皇帝', '力量', '太阳', '审判'];
      const waterCards = ['女祭司', '战车', '隐士', '星星', '月亮'];
      const airCards = ['愚者', '魔术师', '恋人', '命运之轮'];
      const earthCards = ['女皇', '教皇', '恶魔', '死神', '节制'];
      for (const k of fireCards)   { if (nameCn.includes(k)) return elementMap['权杖']; }
      for (const k of waterCards)  { if (nameCn.includes(k)) return elementMap['圣杯']; }
      for (const k of airCards)    { if (nameCn.includes(k)) return elementMap['宝剑']; }
      for (const k of earthCards)   { if (nameCn.includes(k)) return elementMap['星币']; }
      return '✨ 灵性课题（大阿卡纳）';
    }

    // 正逆位关键词（用于综合解读）
    function getOrientationKeyword(card) {
      const dir = card.orientation === 'reversed' ? 'reversed' : 'upright';
      const meaning = card.meanings && card.meanings[dir];
      return meaning || (dir === 'reversed' ? '内在反思' : '外在展现');
    }

    // 逐牌解读（专业塔罗师口吻）
    let cardDetails = '';
    cardsList.forEach((c, idx) => {
      const dir = c.orientation === 'reversed' ? '逆位' : '正位';
      const positionName = positionsList.length > idx ? positionsList[idx] : '第' + (idx + 1) + '张';
      const meaning = c.orientation === 'reversed'
        ? (c.meanings && c.meanings.reversed ? c.meanings.reversed : '内在课题浮现，需要沉静反思')
        : (c.meanings && c.meanings.upright ? c.meanings.upright : '能量正在展开，把握当下时机');
      const element = getCardElement(c);

      cardDetails += `\n🃏 【${positionName}】${c.name_cn}（${dir}）\n`;
      cardDetails += `   ${meaning}\n`;
      cardDetails += `   ${element}\n`;
    });

    // 整体综合分析（塔罗师口吻）
    const reversedCount = cardsList.filter(c => c.orientation === 'reversed').length;
    const uprightCount = cardsList.length - reversedCount;

    let synthesis = `\n━━━━━━━━━━━━━━━━━━━\n💫 综合解读\n\n`;

    // 根据牌阵类型给出专业解读
    if (spreadIdVal === 'three_cards') {
      synthesis += `过去「${cardsList[0].name_cn}」${cardsList[0].orientation === 'reversed' ? '逆位' : '正位'}——这段经历塑造了你现在的状态。\n`;
      synthesis += `当下「${cardsList[1].name_cn}」${cardsList[1].orientation === 'reversed' ? '逆位' : '正位'}——这是你目前最需要关注的核心能量。\n`;
      synthesis += `未来「${cardsList[2].name_cn}」${cardsList[2].orientation === 'reversed' ? '逆位' : '正位'}——前方有待展开的潜能，请带着觉知去迎接。\n\n`;
    } else if (spreadIdVal === 'five_cards') {
      synthesis += `五张牌阵揭示了你处境的五个维度。\n`;
      if (cardsList.length >= 5) {
        synthesis += `中心牌「${cardsList[0].name_cn}」是整件事的核心——请特别留意它的讯息。\n`;
        synthesis += `过去的影响来自「${cardsList[1].name_cn}」，现在的挑战在「${cardsList[2].name_cn}」，\n你的内心声音是「${cardsList[3].name_cn}」，而未来的可能性藏在「${cardsList[4].name_cn}」之中。\n\n`;
      }
    } else if (spreadIdVal === 'celtic_cross') {
      synthesis += `凯尔特十字牌阵给出了更深层的全景视角。十张牌共同描绘出你生命此阶段的完整图景。\n请特别关注「你当前的处境」和「你内心的恐惧」这两张牌，它们揭示了表象之下的真相。\n\n`;
    } else if (spreadIdVal === 'relationship' || spreadIdVal === 'love_spread') {
      synthesis += `这张牌阵温柔地展开了你们之间的能量场。\n请用心感受每一张牌所传递的讯息，它们正在帮你看见关系中那些未被言说的部分。\n\n`;
    } else if (spreadIdVal === 'time_flow') {
      synthesis += `时间流牌阵为你展开了过去、现在与未来的时间轴线。\n每一张都承载着特定的时间能量——过去的因，现在的果，未来的可能性。\n\n`;
    } else if (spreadIdVal === 'sacred_triangle') {
      synthesis += `神圣三角牌阵从身、心、灵三个层面给出指引。\n请感受这三张牌如何共同编织出你此阶段的成长课题。\n\n`;
    }

    // 正逆位比例分析（塔罗师口吻）
    synthesis += `📊 牌面能量分布：正位 ${uprightCount} 张，逆位 ${reversedCount} 张\n`;
    if (reversedCount === 0 && uprightCount > 0) {
      synthesis += `所有牌均为正位——此刻宇宙正在为你敞开大门，这是一股非常纯净且支持你的能量。请勇敢前行。\n`;
    } else if (reversedCount > uprightCount) {
      synthesis += `逆位牌较多——这说明你内在有一些需要面对和疗愈的课题。逆位不是「坏牌」，它是塔罗在温柔地提醒你：向内看，答案就在那里。\n`;
    } else if (uprightCount > reversedCount) {
      synthesis += `正位牌占多数——外在环境对你的计划是有利的，请信任自己的直觉，把握当下的动能。\n`;
    } else {
      synthesis += `正逆位数量平衡——你正处于一个充满选择和转变的节点，阴阳能量交织，这正是创造力的源泉。\n`;
    }

    // 针对问题的具体建议（个性化）
    synthesis += `\n🔮 关于你的问题「${questionText}」，这张牌阵想告诉你：\n`;
    // 取第一张牌的核心讯息作为建议切入点
    if (cardsList.length > 0) {
      const firstCard = cardsList[0];
      const firstMeaning = firstCard.orientation === 'reversed'
        ? (firstCard.meanings && firstCard.meanings.reversed ? firstCard.meanings.reversed.substring(0, 40) : '内在力量')
        : (firstCard.meanings && firstCard.meanings.upright ? firstCard.meanings.upright.substring(0, 40) : '当下力量');
      synthesis += `从「${firstCard.name_cn}」的能量出发——${firstMeaning}。请带着这份觉知去行动。\n`;
    }
    synthesis += `\n✨ 塔罗是一面映照内心的镜子，而非宿命的判决书。真正的选择权，始终在你手中。\n`;
    synthesis += `愿你在探索的路上，始终与自己的内心同在。🕯️`;

    const fullText = `🔮 本次【${spreadName}】解读（共${cardCount}张牌）\n\n针对你的问题：「${questionText}」\n${cardDetails}\n${synthesis}`;

    // 模拟 1.2 秒延迟（更贴近真实AI解读节奏）
    setTimeout(() => resolve(fullText), 1200);
  });
}

function onImgError(idx) {
  cards.value[idx].imgError = true;
}

// 分享功能（调用uni-app分享API）
function share() {
  const shareText = encodeURIComponent(`🔮 刚在「塔罗秘境」做了占卜，针对"${question.value}"的解读超准！你也来试试吧～`);
  
  uni.showActionSheet({
    itemList: ['分享给微信好友', '分享到微信朋友圈', '分享到小红书', '分享到微博', '复制链接'],
    success: (res) => {
      const idx = res.tapIndex;
      if (idx === 0) {
        // 微信好友 - 尝试唤起微信
        window.location.href = `weixin://dl/business/?t=${Date.now()}`;
        setTimeout(() => {
          uni.showModal({
            title: '分享指引',
            content: '请点击右上角菜单 → "发送给朋友" 进行分享',
            showCancel: false
          });
        }, 1500);
      } else if (idx === 1) {
        // 微信朋友圈 - 复制链接并引导用户粘贴
        uni.setClipboardData({
          data: `🔮 刚在「塔罗秘境」做了占卜，针对"${question.value}"的解读超准！你也来试试吧～\nhttp://127.0.0.1:5173`,
          success: () => {
            uni.showModal({
              title: '分享到朋友圈',
              content: '链接已复制！请打开微信 → 发现 → 朋友圈 → 粘贴发送',
              showCancel: false
            });
          }
        });
      } else if (idx === 2) {
        // 小红书 - 打开小红书发布页
        window.open('https://creator.xiaohongshu.com/publish/publish', '_blank');
        uni.showToast({ title: '已打开小红书发布页', icon: 'none' });
      } else if (idx === 3) {
        // 微博 - 打开微博分享页面
        window.open('https://service.weibo.com/share/share.php?title=' + shareText + '&url=http://127.0.0.1:5173', '_blank');
      } else if (idx === 4) {
        // 复制链接
        uni.setClipboardData({
          data: `🔮 刚在「塔罗秘境」做了占卜，针对"${question.value}"的解读超准！你也来试试吧～`,
          success: () => uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
        });
      }
    }
  });
}

// 小程序分享（用户点击右上角菜单分享时触发）
onShareAppMessage(() => {
  return {
    title: `🔮 塔罗秘境：${question.value || '神秘指引等你揭晓'}`,
    path: '/pages/index/index',
    imageUrl: cards.value.length > 0 ? cards.value[0].image : ''
  };
});

onShareTimeline(() => {
  return {
    title: `🔮 我在塔罗秘境做了占卜，超准！你也来试试`,
    imageUrl: cards.value.length > 0 ? cards.value[0].image : ''
  };
});

function goBack() {
  uni.navigateBack();
}

function goHistory() {
  uni.switchTab({ url: '/pages/history/history' });
}

function goVip() {
  uni.navigateTo({
    url: '/pages/pay/pay?from=result&amount=1&count=3'
  });
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1A1036 0%, #2D1B69 100%);
  color: #F5F5F5;
  padding: 40rpx 30rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 40rpx);
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.loading-icon { font-size: 120rpx; margin-bottom: 40rpx; animation: pulse 1.5s infinite; }
.loading-text { font-size: 32rpx; color: #D4AF37; }

.result-wrap { width: 100%; }

.question-box {
  background: rgba(212, 175, 55, 0.1);
  border: 1rpx solid rgba(212, 175, 55, 0.3);
  border-radius: 16rpx;
  padding: 24rpx 30rpx;
  margin-bottom: 40rpx;
}
.question-label { font-size: 26rpx; color: #B8A9D4; }
.question-text { font-size: 30rpx; color: #D4AF37; margin-top: 12rpx; display: block; }

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #D4AF37;
  margin-bottom: 24rpx;
  display: block;
}

.cards-section { margin-bottom: 40rpx; }
.cards-row {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  flex-wrap: wrap;
}
.card-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 220rpx;
}
.card-position {
  font-size: 22rpx;
  color: #D4AF37;
  background: rgba(212, 175, 55, 0.15);
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
  text-align: center;
}
.card-img {
  width: 120px;
  height: 192px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  object-fit: contain;
}
.card-backup {
  width: 200rpx;
  height: 320rpx;
  background: linear-gradient(135deg, #2D1B69, #1A1036);
  border: 2rpx solid #D4AF37;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #D4AF37;
  text-align: center;
  padding: 16rpx;
}
.card-name {
  font-size: 22rpx;
  color: #B8A9D4;
  margin-top: 12rpx;
  text-align: center;
}

.interpretation-box {
  background: rgba(255, 255, 255, 0.06);
  border: 1rpx solid rgba(212, 175, 55, 0.2);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
}
.interpretation-text {
  font-size: 28rpx;
  color: #E8E8E8;
  line-height: 1.8;
  white-space: pre-wrap;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 40rpx;
}
.btn-share {
  flex: 1;
  min-width: 40%;
  background: linear-gradient(135deg, #D4AF37 0%, #F5D76E 100%);
  color: #1A1036;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 48rpx;
  height: 80rpx;
  line-height: 80rpx;
  border: none;
}
.btn-back {
  flex: 1;
  min-width: 40%;
  background: rgba(255, 255, 255, 0.1);
  color: #F5F5F5;
  font-size: 28rpx;
  border-radius: 48rpx;
  height: 80rpx;
  line-height: 80rpx;
  border: 1rpx solid rgba(212, 175, 55, 0.3);
}
.btn-history {
  width: 100%;
  background: transparent;
  color: #B8A9D4;
  font-size: 26rpx;
  border-radius: 48rpx;
  height: 72rpx;
  line-height: 72rpx;
  border: 1rpx solid rgba(184, 169, 212, 0.3);
}

.vip-box {
  background: rgba(212, 175, 55, 0.1);
  border: 2rpx solid rgba(212, 175, 55, 0.4);
  border-radius: 16rpx;
  padding: 24rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.vip-text {
  font-size: 26rpx;
  color: #D4AF37;
  flex: 1;
}
.btn-vip {
  background: linear-gradient(135deg, #D4AF37 0%, #F5D76E 100%);
  color: #1A1036;
  font-size: 26rpx;
  font-weight: bold;
  border-radius: 48rpx;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 32rpx;
  border: none;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
}
</style>
