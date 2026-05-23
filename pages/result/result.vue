<template>
  <view class="container">
    <!-- 牌面展示 -->
    <view class="cards-section">
      <text class="section-title">🃏 抽牌结果</text>
      <scroll-view scroll-x class="cards-scroll">
        <view v-for="(card, i) in cards" :key="i" class="result-card">
          <!-- 真实 Rider-Waite 牌面图 -->
          <view class="card-img-wrap" :class="card.orientation">
            <image
              v-if="!card.imgError"
              class="card-img"
              :src="card.image"
              mode="aspectFit"
              @error="onResultImgError(i)"
            />
            <view v-else class="card-img-fallback">
              <text class="fallback-text">{{ card.name_cn }}</text>
            </view>
            <view class="card-img-label">
              <text class="card-dir-label">{{ card.orientation === 'reversed' ? '逆位' : '正位' }}</text>
            </view>
          </view>
          <text class="card-name-label">{{ card.name_cn }}</text>
          <text class="card-pos" v-if="positions.length">{{ positions[i] }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 问题 -->
    <view class="question-section" v-if="question">
      <text class="q-label">你的问题是：</text>
      <text class="q-text">{{ question }}</text>
    </view>

    <!-- AI 解读 -->
    <view class="interpret-section">
      <text class="section-title">🔮 AI 解读</text>
      <view v-if="loading" class="loading-wrap">
        <view class="loading-spinner"></view>
        <text>解读中...</text>
      </view>
      <view v-else class="interpret-content">
        <text class="interpret-text">{{ interpretation }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <button class="btn-share" @tap="shareResult">分享给好友</button>
      <button class="btn-again" @tap="drawAgain">再抽一次</button>
      <button class="btn-vip" v-if="!isVip" @tap="goVip">升级VIP 无限次</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { interpret } from '@/utils/ai.js';
import spreadsData from '@/data/spreads.json';

const cards = ref([]);
const question = ref('');
const positions = ref([]);
const interpretation = ref('');
const loading = ref(true);
const isVip = ref(false);

onMounted(async () => {
  const pages = getCurrentPages();
  const cur = pages[pages.length - 1];
  const opts = cur.$page ? cur.$page.query : cur.options || {};

  // 解析抽牌结果
  try {
    if (opts.cards) {
      cards.value = JSON.parse(decodeURIComponent(opts.cards)).map(c => ({ ...c, imgError: false }));
    }
  } catch (e) {
    console.error('解析牌数据失败', e);
  }
  question.value = decodeURIComponent(opts.question || '');

  // 获取牌阵位置名
  const spreadId = opts.spreadId || 'three_cards';
  const spread = spreadsData.find(s => s.id === spreadId);
  if (spread) {
    positions.value = spread.positions.map(p => p.name);
  }

  // 调用 AI 解读
  loading.value = true;
  try {
    const result = await interpret(cards.value, question.value, spread);
    interpretation.value = result;
  } catch (e) {
    interpretation.value = '解读生成失败，请稍后重试。';
  }
  loading.value = false;
});

function shareResult() {
  // 【分享对接】uni-app 分享 API
  uni.showToast({ title: '分享功能对接中', icon: 'none' });
}

function drawAgain() {
  uni.navigateBack();
}

function goVip() {
  // 【VIP 对接】跳转 VIP 购买页
  uni.showToast({ title: 'VIP功能对接中', icon: 'none' });
}

// 图片加载失败处理
function onResultImgError(idx) {
  cards.value[idx].imgError = true;
  cards.value = [...cards.value];
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1A1036 0%, #2D1B69 100%);
  padding: 40rpx 32rpx 80rpx;
  color: #F5F5F5;
}
.section-title {
  font-size: 32rpx;
  color: #D4AF37;
  font-weight: bold;
  display: block;
  margin-bottom: 24rpx;
}
.cards-scroll { white-space: nowrap; padding-bottom: 16rpx; }
.result-card {
  display: inline-block;
  width: 220rpx;
  margin-right: 24rpx;
  text-align: center;
  vertical-align: top;
}
.card-img-wrap {
  width: 200rpx;
  height: 350rpx;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  margin: 0 auto 12rpx;
  border: 2rpx solid #D4AF37;
  &.reversed {
    opacity: 0.75;
  }
}
.card-img {
  width: 100%;
  height: 100%;
  border-radius: 14rpx;
}
.card-img-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  padding: 6rpx 0;
  text-align: center;
}
.card-dir-label {
  font-size: 20rpx;
  color: #D4AF37;
}
.card-name-label {
  font-size: 24rpx;
  color: #F5F5F5;
  display: block;
  margin-bottom: 4rpx;
}
.card-pos { font-size: 22rpx; color: #B8A9E8; margin-top: 12rpx; display: block; }

.question-section {
  background: rgba(255,255,255,0.06);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 36rpx;
}
.q-label { font-size: 24rpx; color: #B8A9E8; display: block; }
.q-text { font-size: 28rpx; color: #F5F5F5; margin-top: 8rpx; display: block; }

.interpret-section {
  background: rgba(255,255,255,0.06);
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 48rpx;
}
.loading-wrap { text-align: center; padding: 40rpx 0; color: #B8A9E8; }
.loading-spinner {
  width: 60rpx; height: 60rpx;
  border: 4rpx solid rgba(212,175,55,0.3);
  border-top-color: #D4AF37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20rpx;
}
@keyframes spin { to { transform: rotate(360deg); } }
.interpret-text {
  font-size: 28rpx;
  line-height: 1.8;
  color: #F5F5F5;
  white-space: pre-wrap;
}

.actions { display: flex; flex-direction: column; gap: 20rpx; }
.btn-share {
  background: rgba(212,175,55,0.15);
  color: #D4AF37;
  border: 2rpx solid #D4AF37;
  border-radius: 48rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
}
.btn-again {
  background: linear-gradient(135deg, #D4AF37, #F5D76E);
  color: #1A1036;
  font-weight: bold;
  border-radius: 48rpx;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 32rpx;
}
.btn-vip {
  background: transparent;
  color: #B8A9E8;
  border: 2rpx solid #B8A9E8;
  border-radius: 48rpx;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 26rpx;
}

.card-img-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #D4AF37, #F5D76E);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
}
.fallback-text {
  font-size: 26rpx;
  font-weight: bold;
  color: #1A1036;
}

</style>
