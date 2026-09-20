// 注意：Node 18+ 用 'node:path
import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [Vue(), VueJsx()],
  test: {
    environment: 'happy-dom',
    exclude: [...configDefaults.exclude, '**/e2e/**'],
  },
  // resolve: {
  //   alias: {
  //     '@': path.resolve(__dirname, './src'), // 关键！把 @ 映射到 src/
  //   },
  // },
  //  vite: {
  //     server: {
  //       proxy: {
  //         '/api': {
  //           changeOrigin: true,
  //           rewrite: (path) => path.replace(/^\/api/, ''),
  //           // mock代理目标地址
  //           target: 'http://localhost:5320/api',
  //           ws: true,
  //         },
  //       },
  //     },
  //   },
});
