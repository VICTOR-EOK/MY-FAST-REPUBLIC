<script setup>
/**
 * App.vue - 小程序根组件
 * 负责全局初始化、主题变量注入
 */
import { onLaunch } from '@dcloudio/uni-app';
import { ref } from 'vue';

const globalData = ref({
  theme: 'dark',
  primaryColor: '#D4AF37',
  bgColor: '#1A1036'
});

onLaunch(() => {
  console.log('🔮 塔罗秘境小程序启动');
  // 检查是否首次使用
  const hasUsed = uni.getStorageSync('tarot_has_used');
  if (!hasUsed) {
    uni.setStorageSync('tarot_has_used', '1');
    // 可在此展示新手引导
  }
});
</script>

<template>
  <view id="app">
    <router-view />
  </view>
</template>

<style lang="scss">
/* 全局样式 */
page {
  background: #1A1036;
  color: #F5F5F5;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* 滚动条隐藏 */
::-webkit-scrollbar { display: none; }

/* 通用工具类 */
.text-gold { color: #D4AF37; }
.text-purple { color: #B8A9E8; }
.text-light { color: #F5F5F5; }
.bg-glass {
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(10px);
}
.btn-gold {
  background: linear-gradient(135deg, #D4AF37 0%, #F5D76E 100%);
  color: #1A1036;
  font-weight: bold;
  border: none;
  border-radius: 48rpx;
}
</style>
