import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-menu-book',
      keepAlive: true,
      order: 1000,
      title: $t('onlineLearning.title'),
    },
    name: 'onlineLearning',
    path: '/onlineLearning',
    children: [
      {
        meta: {
          title: $t('onlineLearning.videoPlayer'),
        },
        name: 'videoPlayer',
        path: '/onlineLearing/videoPlayer',
        component: () => import('#/views/onlineLearning/videoPlayer/index.vue'),
      },
      {
        meta: {
          title: $t('onlineLearning.3DvirtualClassroom'),
        },
        name: '3DvirtualClassroom',
        path: '/onlineLearning/3DvirtualClassroom',
        component: () =>
          import('#/views/onlineLearning/3DvirtualClassroom/index.vue'),
      },
    ],
  },
];

export default routes;
