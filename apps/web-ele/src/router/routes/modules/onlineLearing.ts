import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-menu-book',
      keepAlive: true,
      order: 2,
      title: $t('onlineLearning.title'),
    },
    name: 'onlineLearning',
    path: '/onlineLearning',
    children: [
      // {
      //   meta: {
      //     title: $t('onlineLearning.videoPlayer'),
      //     keepAlive: true,
      //   },
      //   name: 'videoPlayer',
      //   path: '/videoPlayer',
      //   component: () => import('#/views/onlineLearning/videoPlayer/index.vue'),
      // },

      {
        meta: {
          icon: 'ic:baseline-live-tv',
          keepAlive: true,
          order: 1000,
          title: $t('liveStrenming.title'),
        },
        name: 'liveStreaming',
        path: '/liveStreaming',
        component: () => import('#/views/liveStreaming/liveRoom/index.vue'),
      },
      {
        meta: {
          title: $t('onlineLearning.3DvirtualClassroom'),
          keepAlive: true,
        },
        name: '3DvirtualClassroom',
        path: '/3DvirtualClassroom',
        component: () =>
          import('#/views/onlineLearning/3DvirtualClassroom/index.vue'),
      },
    ],
  },
];

export default routes;
