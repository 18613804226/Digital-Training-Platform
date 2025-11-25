import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('systemManagement.title'),
    },
    name: 'systemManagement',
    path: '/systemManagement',
    children: [
      {
        meta: {
          title: $t('systemManagement.userManagement'),
        },
        name: 'userManagement',
        path: '/systemManagement/userManagement',
        component: () =>
          import('#/views/systemManagement/userManagement/index.vue'),
      },
      {
        name: 'Profile',
        path: 'Profile',
        component: () => import('#/views/_core/profile/index.vue'),
        meta: {
          title: $t('page.auth.profile'),
        },
      },
    ],
  },
];

export default routes;
