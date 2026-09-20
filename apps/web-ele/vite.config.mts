import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
      ],
      resolve: {
        alias: {
          // ✅ 配置 @ 指向 src 目录
          '@': path.resolve(__dirname, './src'),
        },
      },
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:3000/api/v1',
            ws: true,
          },
        },
      },
    },
  };
});
