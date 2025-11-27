import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('liveStrenming.title'),
    },
    name: 'liveStreaming',
    path: '/liveStreaming',
    component: () => import('#/views/liveStreaming/liveRoom/index.vue'),
    children: [
      // {
      //   meta: {
      //     title: $t('liveStrenming.title'),
      //   },
      //   name: 'videoPlayer',
      //   path: '/liveStreaming/liveRoom',
      //   component: () => import('#/views/liveStreaming/liveRoom/index.vue'),
      // },
    ],
  },
];

export default routes;
