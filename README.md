# 🔮 塔罗秘境 — 塔罗牌AI互动微信小程序

> uni-app (Vue3) 实现，支持微信小程序 / H5 多端发布

## 项目结构

```
tarot-miniprogram/
├── data/
│   ├── cards.json        # 78张塔罗牌数据库
│   └── spreads.json     # 5个牌阵配置
├── pages/
│   ├── index/index.vue   # 首页（牌阵选择+问题输入）
│   ├── draw/draw.vue    # 抽牌页（洗牌动画+抽牌+翻牌）
│   ├── result/result.vue # 解读结果页
│   └── history/history.vue # 历史记录页
├── utils/
│   ├── tarot.js         # 洗牌/抽牌逻辑
│   ├── dailyQuota.js    # 每日免费次数管理
│   └── ai.js            # AI解读接口（含对接注释）
├── static/              # 静态资源（tab图标等）
├── App.vue
├── main.js
├── pages.json           # uni-app 路由配置
├── manifest.json        # uni-app 应用配置
├── package.json
└── vite.config.js
```

## 快速启动

```bash
# 安装依赖
npm install

# 微信小程序（需微信开发者工具）
npm run dev:mp-weixin

# H5 网页版（浏览器预览）
npm run dev:h5
```

## AI 接口对接说明

在 `utils/ai.js` 中有三处标注了 `【AI 对接点】` 的注释：

1. **`INTERPRET_API_URL`** — 修改为你后端 AI 解读接口地址
2. **`interpret()` 函数** — 取消 `mockInterpret()` 调用，改用 `uni.request` 调用真实接口
3. **`drawFromServer()` 函数** — 可选，若后端负责洗牌则启用

### 接口请求格式示例

```json
POST /api/tarot/interpret
{
  "cards": [
    { "name_cn": "愚人", "orientation": "upright", "meaning": "新机会..." }
  ],
  "question": "我的桃花运如何？",
  "spread": "three_cards"
}
```

## 微信支付对接

在 `pages/index/index.vue` 的 `goPay()` 函数中调用微信支付 API，支付成功后：
```js
consumeQuota();        // 不消耗免费次数
paidUnlocked.value = true;
```

## 每日免费次数逻辑

- 默认每日 **2次** 免费（`utils/dailyQuota.js` 中 `FREE_DAILY` 常量）
- 使用 `uni.getStorageSync` 按日期持久化
- 次日凌晨自动重置

## 设计风格

| 元素 | 值 |
|------|-----|
| 主色（金） | `#D4AF37` |
| 背景（深紫） | `#1A1036` |
| 辅助色（紫） | `#B8A9E8` |
| 文字（白） | `#F5F5F5` |
| 风格 | 神秘学 + 现代简约 Dark Mode |

## 待补充

- [ ] `static/` 目录下放置 tabBar 图标（81×81px PNG）：
  - `tab-tarot.png` / `tab-tarot-active.png`
  - `tab-history.png` / `tab-history-active.png`
- [ ] 替换 `manifest.json` 中的 `appid` 为真实微信小程序 AppID
- [ ] 对接真实 AI 解读后端
- [ ] 对接微信支付
- [ ] 分享功能实现（`result.vue` → `shareResult()`）
- [ ] 牌面图片资源（可选，当前用文字代替牌面图）

---
*由编程 Agent 自动生成 | 2026-05-22*
