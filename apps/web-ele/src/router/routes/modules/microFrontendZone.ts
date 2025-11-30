import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-memory',
      keepAlive: false,
      order: 1000,
      title: $t('microFrontendZone.title'),
    },
    name: 'microFrontendZone',
    path: '/microFrontendZone',
    children: [
      {
        meta: {
          title: $t('microFrontendZone.reactMaster'),
          keepAlive: false,
        },
        name: 'reactMaster',
        path: '/reactMaster',
        component: () =>
          import('#/views/microFrontendZone/reactMaster/index.vue'),
      },
      // {
      //   meta: {
      //     title: $t('microFrontendZone.industrialLotSecurity'),
      //   },
      //   name: 'industrialLotSecurity',
      //   path: '/microFrontendZone/industrialLotSecurity',
      //   component: () =>
      //     import('#/views/microFrontendZone/industrialLotSecurity/index.vue'),
      // },
      {
        meta: {
          title: $t('microFrontendZone.pythonDataScience'),
          keepAlive: false,
        },
        name: 'pythonDataScience',
        path: '/python-data-analysis',
        component: () =>
          import('#/views/microFrontendZone/pythonDataScience/index.vue'),
      },
    ],
  },
];

export default routes;
