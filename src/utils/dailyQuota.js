/**
 * 每日免费次数 + 付费次数管理工具
 * 使用 uni-app 的 localStorage 持久化
 * 每日2次免费，付费1元=3次额外解读
 */

const QUOTA_STORAGE_KEY = 'tarot_daily_quota';
const PAID_QUOTA_KEY = 'tarot_paid_quota'; // 付费次数剩余
const FREE_DAILY = 2;

/**
 * 获取今日日期字符串（本地时区 YYYY-MM-DD）
 * @returns {String}
 */
function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

/* ========= 免费次数管理 ========= */

function getUsedCount() {
  try {
    const raw = uni.getStorageSync(QUOTA_STORAGE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    if (data.date !== getTodayStr()) return 0;
    return data.count || 0;
  } catch (e) {
    return 0;
  }
}

function setUsedCount(count) {
  try {
    uni.setStorageSync(
      QUOTA_STORAGE_KEY,
      JSON.stringify({ date: getTodayStr(), count: count })
    );
  } catch (e) {
    console.error('写入次数失败', e);
  }
}

export function getRemainingQuota() {
  return Math.max(0, FREE_DAILY - getUsedCount());
}

export function consumeQuota() {
  const used = getUsedCount();
  if (used >= FREE_DAILY) return false;
  setUsedCount(used + 1);
  return true;
}

export function hasFreeQuota() {
  return getUsedCount() < FREE_DAILY;
}

export function getUsedQuota() {
  return getUsedCount();
}

/* ========= 付费次数管理（1元=3次） ========= */

/**
 * 获取付费剩余次数
 * @returns {Number}
 */
export function getPaidQuota() {
  try {
    // 优先从 uni storage 读取（跨平台兼容，H5环境底层也是 localStorage）
    const v = uni.getStorageSync(PAID_QUOTA_KEY);
    if (v !== '' && v !== null && v !== undefined) {
      return Math.max(0, parseInt(v) || 0);
    }
    // fallback: 浏览器 localStorage
    if (typeof localStorage !== 'undefined') {
      const lv = localStorage.getItem(PAID_QUOTA_KEY);
      if (lv) return Math.max(0, parseInt(lv) || 0);
    }
    return 0;
  } catch (e) {
    return 0;
  }
}

/**
 * 消耗一次付费次数，返回是否成功
 * @returns {Boolean}
 */
export function consumePaidQuota() {
  const remaining = getPaidQuota();
  if (remaining <= 0) return false;
  setPaidQuota(remaining - 1);
  return true;
}

/**
 * 增加付费次数（支付成功后调用，1元=3次）
 * @param {Number} addCount 默认3
 */
export function addPaidQuota(addCount) {
  const current = getPaidQuota();
  const newVal = current + (addCount || 3);
  setPaidQuota(newVal);
}

function setPaidQuota(val) {
  try {
    // 主存储：uni storage（跨平台兼容）
    uni.setStorageSync(PAID_QUOTA_KEY, String(val));
    // 同步写浏览器 localStorage（双保险）
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PAID_QUOTA_KEY, String(val));
    }
  } catch (e) {
    console.error('写入付费次数失败', e);
  }
}

/**
 * 是否有可用次数（免费或付费均可）
 * @returns {Boolean}
 */
export function hasQuota() {
  return getRemainingQuota() > 0 || getPaidQuota() > 0;
}

/**
 * 获取总可用次数（用于UI显示）
 * @returns {Number}
 */
export function getTotalRemaining() {
  return getRemainingQuota() + getPaidQuota();
}

/* ========= 旧版兼容（支付解锁开关，已废弃，保留以防旧逻辑调用） ========= */

export function unlockPaidQuota() {
  // 旧逻辑：设置为开关量；新逻辑改为次数管理
  // 若旧代码仍调用此函数，等效于增加3次
  addPaidQuota(3);
}

export function isPaidUnlocked() {
  // 旧逻辑：返回开关量；新逻辑改为有付费次数即视为已解锁
  return getPaidQuota() > 0;
}
