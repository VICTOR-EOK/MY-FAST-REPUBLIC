<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">🌙 塔罗秘境</text>
      <text class="subtitle">倾听内心的声音</text>
    </view>

    <!-- 牌阵选择 -->
    <view class="section">
      <text class="section-title">选择牌阵</text>
      <view class="spread-scroll">
        <view
          v-for="spread in spreads"
          :key="spread.id"
          :class="['spread-card', selectedSpreadId === spread.id ? 'active' : '']"
          @tap="selectSpread(spread)"
        >
          <text class="spread-name">{{ spread.name }}</text>
          <text class="spread-desc">{{ spread.description }}</text>
          <text class="spread-count">{{ spread.cardCount }}张牌</text>
        </view>
      </view>
    </view>

    <!-- 问题输入 -->
    <view class="section">
      <text class="section-title">输入你的问题</text>
      <view class="input-wrap">
        <textarea
          v-model="question"
          class="question-input"
          placeholder="例如：我的桃花运如何？"
          maxlength="200"
        />
      </view>
      <view class="hot-topics">
        <text class="hot-label">热门话题：</text>
        <text v-for="t in hotTopics" :key="t" class="hot-tag" @tap="useTopic(t)">#{{ t }}</text>
      </view>
    </view>

    <!-- 剩余次数 -->
    <view class="quota-bar">
      <text>今日免费剩余：{{ freeQuota }}/{{ maxQuota }}次</text>
      <text v-if="paidQuota > 0" class="paid-hint"> | 付费剩余：{{ paidQuota }}次</text>
    </view>

    <!-- 开始按钮 -->
    <view class="btn-wrap">
      <button class="btn-start" @tap="startDivination" :disabled="!canStart">
        {{ canStart ? '🔮 开始占卜' : (hasQuota ? '请先输入你的问题' : '今日次数已用完') }}
      </button>
      <text v-if="!hasQuota" class="pay-hint" @tap="goPay">
        免费次数已用完，¥1解锁3次
      </text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { getRemainingQuota, consumeQuota, hasFreeQuota, getPaidQuota, getTotalRemaining, consumePaidQuota } from '@/utils/dailyQuota.js';
import spreadsData from '@/data/spreads.json';

const spreads = ref(spreadsData);
const selectedSpreadId = ref('three_cards');
const selectedSpread = computed(() => spreads.value.find(s => s.id === selectedSpreadId.value));
const question = ref('');
const remainingQuota = ref(2);
const maxQuota = ref(2);
const freeQuota = ref(2);
const paidQuota = ref(0);
const hasQuota = computed(() => freeQuota.value > 0 || paidQuota.value > 0);
const canStart = computed(() => question.value.trim().length > 0 && hasQuota.value);

function selectSpread(spread) {
  selectedSpreadId.value = spread.id;
}

function useTopic(t) {
  question.value = '我的' + t + '如何？';
}

function goPay() {
  uni.navigateTo({
    url: '/pages/pay/pay?from=index&amount=1&count=3'
  });
}

function startDivination() {
  if (!canStart.value) return;
  if (freeQuota.value > 0) {
    consumeQuota();
  } else if (paidQuota.value > 0) {
    consumePaidQuota();
  }
  // 跳转到抽牌页
  uni.navigateTo({
    url: '/pages/draw/draw?spreadId=' + selectedSpreadId.value + '&question=' + encodeURIComponent(question.value)
  });
}

onMounted(() => {
  refreshQuota();
});

onShow(() => {
  console.log('[index] onShow触发');
  refreshQuota();
});

function refreshQuota() {
  freeQuota.value = getRemainingQuota();
  paidQuota.value = getPaidQuota();
  console.log('[index] 刷新次数: 免费', freeQuota.value, '付费', paidQuota.value);
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1A1036 0%, #2D1B69 100%);
  padding: 40rpx 32rpx;
  color: #F5F5F5;
}
.header {
  text-align: center;
  margin-bottom: 48rpx;
}
.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #D4AF37;
  display: block;
}
.subtitle {
  font-size: 26rpx;
  color: #B8A9E8;
  margin-top: 12rpx;
  display: block;
}
.section {
  margin-bottom: 40rpx;
}
.section-title {
  font-size: 30rpx;
  color: #D4AF37;
  margin-bottom: 20rpx;
  display: block;
}
.spread-scroll {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 20rpx;
}
.spread-card {
  display: flex;
  flex-direction: column;
  width: calc(50% - 8rpx);
  background: rgba(255,255,255,0.08);
  border: 2rpx solid rgba(212,175,55,0.3);
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 0;
  &.active {
    border-color: #D4AF37;
    background: rgba(212,175,55,0.15);
  }
}
.spread-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #F5F5F5;
  display: block;
}
.spread-desc {
  font-size: 22rpx;
  color: #B8A9E8;
  margin-top: 8rpx;
  display: block;
  white-space: normal;
  lines: 2;
}
.spread-count {
  font-size: 20rpx;
  color: #D4AF37;
  margin-top: 12rpx;
  display: block;
}
.input-wrap {
  background: rgba(255,255,255,0.06);
  border: 2rpx solid rgba(212,175,55,0.2);
  border-radius: 16rpx;
  padding: 20rpx;
}
.question-input {
  width: 100%;
  height: 120rpx;
  color: #F5F5F5;
  font-size: 28rpx;
}
.hot-topics {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.hot-label {
  font-size: 24rpx;
  color: #B8A9E8;
}
.hot-tag {
  font-size: 24rpx;
  color: #D4AF37;
  background: rgba(212,175,55,0.12);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}
.quota-bar {
  text-align: center;
  font-size: 24rpx;
  color: #B8A9E8;
  margin-bottom: 32rpx;
}
.btn-wrap {
  text-align: center;
}
.btn-start {
  background: linear-gradient(135deg, #D4AF37 0%, #F5D76E 100%);
  color: #1A1036;
  font-size: 34rpx;
  font-weight: bold;
  border-radius: 48rpx;
  height: 96rpx;
  line-height: 96rpx;
  border: none;
  &[disabled] {
    background: rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.4);
  }
}
.paid-hint {
  font-size: 22rpx;
  color: #D4AF37;
  margin-left: 12rpx;
}
</style>
