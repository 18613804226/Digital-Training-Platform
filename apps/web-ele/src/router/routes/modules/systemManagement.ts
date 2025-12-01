import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-settings',
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
          keepAlive: true,
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
          keepAlive: true,
        },
      },
    ],
  },
];

export default routes;
