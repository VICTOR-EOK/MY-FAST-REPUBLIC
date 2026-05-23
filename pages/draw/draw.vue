<template>
  <view class="container">
    <!-- 冥想引导 -->
    <view v-if="phase === 'meditate'" class="meditate-wrap">
      <text class="meditate-icon">🌙</text>
      <text class="meditate-text">请闭眼冥想你的问题...</text>
      <text class="countdown">{{ meditationSeconds }}s</text>
      <button class="btn-skip" @tap="skipMeditation">跳过</button>
    </view>

    <!-- 洗牌动画 -->
    <view v-else-if="phase === 'shuffle'" class="shuffle-wrap">
      <view class="shuffle-cards">
        <view
          v-for="(c, i) in shuffleCards"
          :key="i"
          :class="['card-back', 'shuffle-anim-' + (i % 5)]"
          :style="'animation-delay:' + (i * 0.05) + 's'"
        >
          <view class="card-back-inner">🌙</view>
        </view>
      </view>
      <text class="shuffle-hint">正在洗牌...</text>
    </view>

    <!-- 抽牌指示 -->
    <view v-else-if="phase === 'ready'" class="ready-wrap">
      <text class="ready-text">点击屏幕，抽取你的牌</text>
      <view class="tap-area" @tap="drawCard">
        <view class="tap-circle"></view>
      </view>
      <text class="draw-progress">已抽 {{ drawnCards.length }} / {{ cardCount }} 张</text>
    </view>

    <!-- 翻牌展示 -->
    <view v-else-if="phase === 'reveal'" class="reveal-wrap">
      <text class="reveal-title">你抽到的牌</text>
      <view class="reveal-cards">
        <view
          v-for="(card, i) in drawnCards"
          :key="card.id"
          :class="['reveal-card', card.revealed ? 'flipped' : '']"
          @tap="flipCard(i)"
        >
          <!-- 牌背（未翻牌） -->
          <view class="card-back" v-if="!card.revealed">
            <text class="back-icon">🌙</text>
            <text class="back-hint">点击翻牌</text>
          </view>
          <!-- 牌面（已翻牌，显示真实 Rider-Waite 牌图） -->
          <view class="card-front" v-else>
            <image
              v-if="!card.imgError"
              class="card-img"
              :src="card.image"
              mode="aspectFit"
              @error="onImgError(i)"
            />
            <!-- 图片加载失败时的文字兜底 -->
            <view v-else class="card-fallback">
              <text class="fallback-name">{{ card.name_cn }}</text>
              <text class="fallback-en">{{ card.name_en }}</text>
            </view>
            <view class="card-label">
              <text class="card-name">{{ card.name_cn }}</text>
              <text class="card-dir">{{ card.orientation === 'reversed' ? '逆位' : '正位' }}</text>
            </view>
          </view>
        </view>
      </view>
      <button v-if="allRevealed" class="btn-next" @tap="goResult">查看解读</button>
      <text v-else class="flip-hint">点击卡牌翻面</text>
    </view>

    <!-- 加载解读 -->
    <view v-else-if="phase === 'loading'" class="loading-wrap">
      <view class="loading-spinner"></view>
      <text class="loading-text">塔罗正在解读...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { performDraw } from '@/utils/tarot.js';
import cardsData from '@/data/cards.json';

const phase = ref('meditate'); // meditate | shuffle | ready | reveal | loading
const meditationSeconds = ref(5);
const shuffleCards = ref([]);
const drawnCards = ref([]);
const cardCount = ref(3);
const question = ref('');
let meditationTimer = null;

const allRevealed = computed(() => drawnCards.value.length > 0 && drawnCards.value.every(c => c.revealed));

onMounted(() => {
  const pages = getCurrentPages();
  const cur = pages[pages.length - 1];
  const opts = cur.$page ? cur.$page.query : cur.options || {};
  cardCount.value = parseInt(opts.cardCount) || 3;
  question.value = decodeURIComponent(opts.question || '');

  // 开始冥想倒计时
  startMeditation();
});

function startMeditation() {
  phase.value = 'meditate';
  meditationSeconds.value = 5;
  meditationTimer = setInterval(() => {
    meditationSeconds.value--;
    if (meditationSeconds.value <= 0) {
      clearInterval(meditationTimer);
      startShuffle();
    }
  }, 1000);
}

function skipMeditation() {
  clearInterval(meditationTimer);
  startShuffle();
}

function startShuffle() {
  phase.value = 'shuffle';
  // 生成洗牌视觉卡片
  const backs = [];
  for (let i = 0; i < 12; i++) backs.push(i);
  shuffleCards.value = backs;
  setTimeout(() => {
    phase.value = 'ready';
  }, 2500);
}

function drawCard() {
  if (drawnCards.value.length >= cardCount.value) return;
  const result = performDraw(cardsData, cardCount.value);
  drawnCards.value = result.map(c => ({ ...c, revealed: false, imgError: false }));
  phase.value = 'reveal';
}

function onImgError(idx) {
  drawnCards.value[idx].imgError = true;
  drawnCards.value = [...drawnCards.value];
}

function flipCard(index) {
  drawnCards.value[index].revealed = true;
  // 触发响应式
  drawnCards.value = [...drawnCards.value];
}

function goResult() {
  phase.value = 'loading';
  // 将抽牌结果传递到结果页
  const cardsParam = encodeURIComponent(JSON.stringify(drawnCards.value));
  setTimeout(() => {
    uni.redirectTo({
      url: '/pages/result/result?cards=' + cardsParam + '&question=' + encodeURIComponent(question.value)
    });
  }, 800);
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1A1036 0%, #2D1B69 100%);
  color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.meditate-wrap, .shuffle-wrap, .ready-wrap, .reveal-wrap, .loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
}
.meditate-icon { font-size: 120rpx; margin-bottom: 40rpx; }
.meditate-text { font-size: 32rpx; color: #D4AF37; margin-bottom: 24rpx; }
.countdown { font-size: 80rpx; font-weight: bold; color: #F5D76E; }
.btn-skip { margin-top: 40rpx; background: transparent; color: #B8A9E8; border: 1rpx solid #B8A9E8; }

.shuffle-cards { display: flex; flex-wrap: wrap; justify-content: center; gap: 16rpx; margin-bottom: 40rpx; }
.card-back { width: 100rpx; height: 150rpx; background: linear-gradient(135deg, #2D1B69, #1A1036); border: 2rpx solid #D4AF37; border-radius: 12rpx; display: flex; align-items: center; justify-content: center; font-size: 40rpx; animation: shuffleBounce 0.6s ease-in-out infinite alternate; }
@keyframes shuffleBounce { 0% { transform: translateY(0) rotate(-3deg); } 100% { transform: translateY(-20rpx) rotate(3deg); } }
.shuffle-hint { font-size: 28rpx; color: #B8A9E8; }

.ready-text { font-size: 34rpx; color: #D4AF37; margin-bottom: 48rpx; }
.tap-area { width: 200rpx; height: 200rpx; border-radius: 50%; background: rgba(212,175,55,0.12); display: flex; align-items: center; justify-content: center; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.15); opacity: 1; } }
.tap-circle { width: 120rpx; height: 120rpx; border-radius: 50%; background: rgba(212,175,55,0.25); }
.draw-progress { margin-top: 32rpx; font-size: 26rpx; color: #B8A9E8; }

.reveal-title { font-size: 36rpx; color: #D4AF37; margin-bottom: 40rpx; }
.reveal-cards { display: flex; flex-wrap: wrap; justify-content: center; gap: 24rpx; margin-bottom: 48rpx; }
.reveal-card { width: 200rpx; height: 350rpx; perspective: 800rpx; cursor: pointer; position: relative; }
.card-front, .card-back { width: 100%; height: 100%; border-radius: 16rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; backface-visibility: hidden; transition: transform 0.6s; overflow: hidden; position: absolute; top: 0; left: 0; }
.card-back { background: linear-gradient(135deg, #2D1B69, #1A1036); border: 2rpx solid #D4AF37; }
.back-icon { font-size: 60rpx; }
.back-hint { font-size: 20rpx; color: #D4AF37; margin-top: 8rpx; }
.card-front { background: #111; }
.card-img { width: 100%; height: 100%; border-radius: 16rpx; }
.card-label { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.55); padding: 8rpx 0; text-align: center; border-radius: 0 0 16rpx 16rpx; }
.card-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #D4AF37, #F5D76E);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
}
.fallback-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #1A1036;
}
.fallback-en {
  font-size: 16rpx;
  color: #3D2E00;
  margin-top: 6rpx;
}
.flip-hint { font-size: 26rpx; color: #B8A9E8; }
.btn-next { margin-top: 40rpx; background: linear-gradient(135deg, #D4AF37, #F5D76E); color: #1A1036; font-weight: bold; border-radius: 48rpx; height: 88rpx; line-height: 88rpx; padding: 0 60rpx; }

.loading-spinner { width: 80rpx; height: 80rpx; border: 6rpx solid rgba(212,175,55,0.3); border-top-color: #D4AF37; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 32rpx; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 30rpx; color: #D4AF37; }
</style>
