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
      <!-- 调试信息（删除前先检查） -->
      <text class="debug-info">牌阵: {{ curSpreadId }} | 需抽: {{ cardCount }} 张</text>
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
          :class="['reveal-card']"
          @tap="flipCard(i)"
        >
          <view class="card-back" v-if="!card.revealed">
            <text class="back-icon">🌙</text>
            <text class="back-hint">点击翻牌</text>
          </view>
          <!-- 牌面（已翻牌，显示真实 Rider-Waite 牌图） -->
          <view class="card-front" v-show="card.revealed">
            <img
              v-if="!card.imgError"
              class="card-img"
              :src="card.image"
              @error="onImgError(i)"
            />
            <!-- 图片加载失败时的文字兜底 -->
            <view v-if="card.imgError" class="card-fallback">
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
import { onLoad } from '@dcloudio/uni-app';
import { performDraw } from '@/utils/tarot.js';
import cardsData from '@/data/cards.json';
import spreadsData from '@/data/spreads.json';

const phase = ref('meditate');
const meditationSeconds = ref(5);
const shuffleCards = ref([]);
const drawnCards = ref([]);
const cardCount = ref(3);
const question = ref('');
let curSpreadId = 'three_cards';
let meditationTimer = null;

const allRevealed = computed(() => drawnCards.value.length > 0 && drawnCards.value.every(c => c.revealed));

onLoad((query) => {
  // uni-app 专用 onLoad 生命周期，最可靠地接收 navigateTo 传来的参数
  const spreadId = query.spreadId || 'three_cards';
  const spread = spreadsData.find(s => s.id === spreadId);
  cardCount.value = spread ? spread.cardCount : 3;
  question.value = decodeURIComponent(query.question || '');
  curSpreadId = spreadId;
  console.log('[draw] spreadId:', spreadId, 'cardCount:', cardCount.value, 'spread:', spread ? spread.name : 'NOT FOUND');
});

onMounted(() => {
  // 开始冥想倒计时（不需要再读参数，onLoad 已处理）
  startMeditation();
});

function startMeditation() {
  phase.value = 'meditate';
  meditationSeconds.value = 5;
  if (meditationTimer) clearInterval(meditationTimer);
  meditationTimer = setInterval(() => {
    meditationSeconds.value = Math.max(0, meditationSeconds.value - 1);
    if (meditationSeconds.value <= 0) {
      clearInterval(meditationTimer);
      meditationTimer = null;
      startShuffle();
    }
  }, 1000);
}

function skipMeditation() {
  if (meditationTimer) {
    clearInterval(meditationTimer);
    meditationTimer = null;
  }
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
  // 逐张抽取：每次只抽1张
  const alreadyDrawn = drawnCards.value.map(c => c.id);
  const available = cardsData.filter(c => !alreadyDrawn.includes(c.id));
  if (available.length === 0) return;
  
  // 洗牌后抽1张
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const card = { ...shuffled[0] };
  card.orientation = Math.random() > 0.5 ? 'upright' : 'reversed';
  
  // 处理图片路径
  let imagePath = card.image;
  if (imagePath && imagePath.startsWith('/static/')) {
    imagePath = '.' + imagePath;
  }
  drawnCards.value = [...drawnCards.value, { ...card, image: imagePath, revealed: false, imgError: false }];
  
  // 抽完所有牌后自动进入翻牌阶段
  if (drawnCards.value.length >= cardCount.value) {
    phase.value = 'reveal';
  }
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
  const cardsParam = encodeURIComponent(JSON.stringify(drawnCards.value));
  setTimeout(() => {
    uni.navigateTo({
      url: '/pages/result/result?cards=' + cardsParam + '&question=' + encodeURIComponent(question.value) + '&spreadId=' + curSpreadId
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
.countdown {
  font-size: 100px;
  font-weight: bold;
  color: #F5D76E;
  line-height: 1;
  animation: countPulse 1s ease-in-out infinite;
}
@keyframes countPulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.25); opacity: 1; }
}
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
.debug-info { font-size: 20rpx; color: #F5D76E; background: rgba(212,175,55,0.1); padding: 8rpx 20rpx; border-radius: 20rpx; margin-top: 16rpx; border: 1rpx solid rgba(212,175,55,0.3); }

.reveal-title { font-size: 36rpx; color: #D4AF37; margin-bottom: 40rpx; }
.reveal-cards { display: flex; flex-wrap: wrap; justify-content: center; gap: 24rpx; margin-bottom: 48rpx; }
.reveal-card { width: 200rpx; height: 350rpx; perspective: 800rpx; cursor: pointer; position: relative; }
.card-front, .card-back { width: 100%; height: 100%; border-radius: 16rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; backface-visibility: hidden; transition: transform 0.6s; overflow: hidden; position: absolute; top: 0; left: 0; }
.card-back { background: linear-gradient(135deg, #2D1B69, #1A1036); border: 2rpx solid #D4AF37; }
.back-icon { font-size: 60rpx; }
.back-hint { font-size: 20rpx; color: #D4AF37; margin-top: 8rpx; }
.card-front { background: #111; }
.card-img { width: 100%; height: 100%; border-radius: 16rpx; object-fit: contain; display: block; }
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
