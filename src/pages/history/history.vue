<template>
  <view class="container">
    <view class="header">
      <text class="title">📜 占卜记录</text>
    </view>

    <view v-if="records.length === 0" class="empty">
      <text class="empty-icon">🔮</text>
      <text class="empty-text">暂无占卜记录</text>
      <button class="btn-go" @tap="goHome">去占卜</button>
    </view>

    <view v-else class="records-list">
      <view v-for="(rec, i) in records" :key="i" class="record-card" @tap="viewResult(rec)">
        <view class="record-header">
          <text class="record-date">{{ rec.date }}</text>
          <text class="record-spread">{{ rec.spreadName }}</text>
        </view>
        <text class="record-question">{{ rec.question }}</text>
        <view class="record-cards">
          <text v-for="(c, ci) in rec.cards" :key="ci" class="record-card-tag">
            {{ c.name_cn }}{{ c.orientation === 'reversed' ? '（逆）' : '' }}
          </text>
        </view>
        <text class="record-preview">{{ rec.interpretationPreview }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const records = ref([]);

onMounted(() => {
  loadRecords();
});

function loadRecords() {
  try {
    const raw = uni.getStorageSync('tarot_history');
    if (raw) {
      records.value = JSON.parse(raw) || [];
    }
  } catch (e) {
    records.value = [];
  }
}

function viewResult(rec) {
  // 跳转到结果页查看完整解读
  const cardsParam = encodeURIComponent(JSON.stringify(rec.cards));
  uni.navigateTo({
    url: '/pages/result/result?cards=' + cardsParam + '&question=' + encodeURIComponent(rec.question)
  });
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' });
}

// 【历史记录保存工具】在 result.vue 中调用此函数保存记录
function saveRecord(cards, question, spreadName, interpretation) {
  try {
    const raw = uni.getStorageSync('tarot_history');
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({
      date: formatDate(new Date()),
      question: question || '未输入问题',
      spreadName: spreadName || '三张牌阵',
      cards: cards,
      interpretationPreview: (interpretation || '').substring(0, 50) + '...'
    });
    // 最多保存50条
    if (list.length > 50) list.length = 50;
    uni.setStorageSync('tarot_history', JSON.stringify(list));
  } catch (e) {
    console.error('保存历史记录失败', e);
  }
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return y + '-' + m + '-' + day + ' ' + h + ':' + min;
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1A1036 0%, #2D1B69 100%);
  padding: 40rpx 32rpx;
  color: #F5F5F5;
}
.header { margin-bottom: 40rpx; }
.title { font-size: 40rpx; font-weight: bold; color: #D4AF37; }

.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 160rpx; }
.empty-icon { font-size: 120rpx; margin-bottom: 32rpx; }
.empty-text { font-size: 28rpx; color: #B8A9E8; margin-bottom: 48rpx; }
.btn-go { background: linear-gradient(135deg, #D4AF37, #F5D76E); color: #1A1036; font-weight: bold; border-radius: 48rpx; height: 88rpx; line-height: 88rpx; padding: 0 60rpx; }

.records-list { display: flex; flex-direction: column; gap: 24rpx; }
.record-card {
  background: rgba(255,255,255,0.06);
  border: 1rpx solid rgba(212,175,55,0.2);
  border-radius: 16rpx;
  padding: 28rpx;
}
.record-header { display: flex; justify-content: space-between; margin-bottom: 16rpx; }
.record-date { font-size: 22rpx; color: #B8A9E8; }
.record-spread { font-size: 22rpx; color: #D4AF37; background: rgba(212,175,55,0.12); padding: 4rpx 12rpx; border-radius: 8rpx; }
.record-question { font-size: 28rpx; color: #F5F5F5; display: block; margin-bottom: 16rpx; }
.record-cards { display: flex; flex-wrap: wrap; gap: 12rpx; margin-bottom: 16rpx; }
.record-card-tag { font-size: 22rpx; color: #D4AF37; background: rgba(212,175,55,0.1); padding: 4rpx 12rpx; border-radius: 8rpx; }
.record-preview { font-size: 24rpx; color: #B8A9E8; display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
</style>
