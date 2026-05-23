<template>
  <view class="container">
    <view class="pay-card">
      <view class="trial-badge">🎉 免费体验版</view>
      <text class="pay-title">获取解读次数</text>
      <text class="pay-desc">体验版免费获得 <text class="highlight">{{ count }}</text> 次塔罗牌解读</text>
      <text class="trial-notice">⚠️ 当前为免费体验模式，不产生任何费用</text>

      <!-- 体验按钮 -->
      <button class="btn-pay trial-btn" @tap="doPay" :disabled="paying">
        {{ paying ? '处理中...' : '免费体验 · 获得' + count + '次解读' }}
      </button>

      <text class="pay-tip trial-tip">✨ 完全免费 · 无任何支付行为 · 体验后可根据需求决定是否正式上线</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { addPaidQuota } from '@/utils/dailyQuota.js';

const amount = ref('1');
const count = ref(3);
const paying = ref(false);
const fromPage = ref('');

onLoad((options) => {
  if (options.amount) amount.value = options.amount;
  if (options.count) count.value = parseInt(options.count) || 3;
  fromPage.value = options.from || 'index';
});

function doPay() {
  paying.value = true;
  
  // 【体验模式】不产生任何真实支付，仅模拟解锁流程
  setTimeout(() => {
    onPaySuccess();
  }, 1500);
}

function onPaySuccess() {
  paying.value = false;
  
  // 增加体验次数（1元=3次，体验版同样逻辑）
  addPaidQuota(count.value);
  
  uni.showToast({
    title: '体验成功！已获得' + count.value + '次解读',
    icon: 'success',
    duration: 1500
  });
  
  // 1.8秒后跳转到首页
  setTimeout(() => {
    uni.redirectTo({
      url: '/pages/index/index',
      success: () => {
        console.log('[pay] 跳转首页成功');
      },
      fail: (err) => {
        console.error('[pay] 跳转首页失败，尝试 navigateBack', err);
        uni.navigateBack({ delta: 10 });
      }
    });
  }, 1800);
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1A1036 0%, #2D1B69 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.pay-card {
  background: rgba(255, 255, 255, 0.06);
  border:2rpx solid rgba(212, 175, 55, 0.3);
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  width: 100%;
  max-width: 680rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.trial-badge {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  letter-spacing: 2rpx;
}

.pay-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #D4AF37;
  margin-bottom: 16rpx;
}

.pay-desc {
  font-size: 26rpx;
  color: #B8A9D4;
  margin-bottom: 16rpx;
}

.trial-notice {
  font-size: 22rpx;
  color: #FF9800;
  margin-bottom: 32rpx;
  text-align: center;
  line-height: 1.6;
}

.amount-box {
  display: flex;
  align-items: baseline;
  margin-bottom: 56rpx;
}

.amount-symbol {
  font-size: 40rpx;
  color: #F5F5F5;
  margin-right: 8rpx;
}

.amount-value {
  font-size: 80rpx;
  font-weight: bold;
  color: #F5F5F5;
}

.pay-methods {
  width: 100%;
  margin-bottom: 48rpx;
}

.method-title {
  font-size: 28rpx;
  color: #B8A9D4;
  margin-bottom: 20rpx;
  display: block;
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.method-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  border:2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  position: relative;
  
  &.active {
    border-color: #D4AF37;
    background: rgba(212, 175, 55, 0.08);
  }
}

.method-icon {
  font-size: 44rpx;
  margin-right: 20rpx;
}

.method-name {
  font-size: 30rpx;
  color: #F5F5F5;
  flex: 1;
}

.method-check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #D4AF37;
  color: #1A1036;
  font-size: 24rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-pay {
  width: 100%;
  background: linear-gradient(135deg, #D4AF37, #F5D76E);
  color: #1A1036;
  border: none;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  padding: 28rpx;
  margin-bottom: 24rpx;
  
  &[disabled] {
    opacity: 0.6;
  }
}

.trial-btn {
  background: linear-gradient(135deg, #4CAF50, #8BC34A) !important;
  color: #fff !important;
  font-size: 30rpx;
}

.amount-unit {
  font-size: 28rpx;
  color: #B8A9D4;
  margin-left: 8rpx;
}

.highlight {
  color: #D4AF37;
  font-weight: bold;
}

.pay-tip {
  font-size: 22rpx;
  color: #8BC34A;
  text-align: center;
  line-height: 1.6;
}
</style>
