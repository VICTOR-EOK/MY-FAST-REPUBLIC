/**
 * vite.config.js - uni-app Vite 配置
 */
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
  plugins: [uni(),
    {
      include: [/@\/static/]
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
