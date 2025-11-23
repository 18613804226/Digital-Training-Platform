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
    ],
  },
];

export default routes;
