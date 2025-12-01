import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-book',
      keepAlive: true,
      order: 1000,
      title: $t('courseManagement.title'),
    },
    name: 'courseManagement',
    path: '/courseManagement',
    children: [
      {
        meta: {
          title: $t('courseManagement.courseAdmin'),
          keepAlive: true,
        },
        name: 'courseAdmin',
        path: '/courseManagement/courseAdmin',
        component: () =>
          import('#/views/courseManagement/courseAdmin/index.vue'),
      },
      {
        meta: {
          title: $t('courseManagement.courseBank'),
          keepAlive: true,
        },
        name: 'formalExam',
        path: '/courseManagement/courseBank',
        component: () =>
          import('#/views/courseManagement/courseBank/index.vue'),
      },
    ],
  },
];

export default routes;
