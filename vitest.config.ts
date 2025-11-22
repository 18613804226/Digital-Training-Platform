import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import { configDefaults, defineConfig } from 'vitest/config';
import path from 'node:path'; // 注意：Node 18+ 用 'node:path
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
});
