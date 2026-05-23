/**
 * main.js - uni-app 入口文件
 * 初始化 Vue 应用并挂载
 */
import { createSSRApp } from 'vue';
import App from './App.vue';

export function createApp() {
  const app = createSSRApp(App);

  // 全局错误处理
  app.config.errorHandler = (err, instance, info) => {
    console.error('全局错误：', err, info);
  };

  return { app };
}
