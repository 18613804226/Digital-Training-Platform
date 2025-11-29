import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-card-membership',
      keepAlive: true,
      order: 1000,
      title: $t('myCertificates.title'),
    },
    name: 'myCertificates',
    path: '/myCertificates',
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
