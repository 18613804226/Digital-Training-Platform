import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-card-membership',
      keepAlive: false,
      order: 5,
      title: $t('myCertificates.title'),
    },
    name: 'myCertificates',
    path: '/myCertificates',
    component: () => import('#/views/myCertificates/certificatsList/index.vue'),
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
