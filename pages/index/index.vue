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
      <scroll-view scroll-x class="spread-scroll">
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
      </scroll-view>
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
      <text>今日免费剩余：{{ remainingQuota }}/{{ maxQuota }}次</text>
    </view>

    <!-- 开始按钮 -->
    <view class="btn-wrap">
      <button class="btn-start" @tap="startDivination" :disabled="!canStart">
        {{ canStart ? '🔮 开始占卜' : '今日次数已用完' }}
      </button>
      <text v-if="!hasQuota && !paidUnlocked" class="pay-hint" @tap="goPay">
        次数已用完，{{ payPrice }}元解锁本次
      </text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getRemainingQuota, consumeQuota, hasFreeQuota, isPaidUnlocked } from '@/utils/dailyQuota.js';
import spreadsData from '@/data/spreads.json';

const spreads = ref(spreadsData);
const selectedSpreadId = ref('three_cards');
const selectedSpread = computed(() => spreads.value.find(s => s.id === selectedSpreadId.value));
const question = ref('');
const remainingQuota = ref(2);
const maxQuota = ref(2);
const paidUnlocked = ref(false);
const payPrice = ref('1.2');
const hotTopics = ref(['桃花运', '考试运', '事业运', '财运', '健康']);

const hasQuota = computed(() => hasFreeQuota() || paidUnlocked.value);
const canStart = computed(() => question.value.trim().length > 0 && (hasQuota.value || paidUnlocked.value));

function selectSpread(spread) {
  selectedSpreadId.value = spread.id;
}

function useTopic(t) {
  question.value = '我的' + t + '如何？';
}

function goPay() {
  // 【支付对接点】调用微信支付，支付成功后调用：
  // consumeQuota();  // 不消耗免费次数
  // paidUnlocked.value = true;
  uni.showToast({ title: '支付功能对接中', icon: 'none' });
}

function startDivination() {
  if (!canStart.value) return;
  if (!hasQuota.value && !paidUnlocked.value) {
    goPay();
    return;
  }
  // 消耗免费次数
  if (hasFreeQuota()) {
    consumeQuota();
  }
  // 跳转到抽牌页
  uni.navigateTo({
    url: '/pages/draw/draw?spreadId=' + selectedSpreadId.value + '&question=' + encodeURIComponent(question.value)
  });
}

onMounted(() => {
  remainingQuota.value = getRemainingQuota();
  paidUnlocked.value = isPaidUnlocked();
});
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
  white-space: nowrap;
  height: 200rpx;
}
.spread-card {
  display: inline-block;
  width: 280rpx;
  height: 180rpx;
  background: rgba(255,255,255,0.08);
  border: 2rpx solid rgba(212,175,55,0.3);
  border-radius: 16rpx;
  padding: 20rpx;
  margin-right: 20rpx;
  vertical-align: top;
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
.pay-hint {
  display: block;
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #D4AF37;
  text-decoration: underline;
}
</style>
