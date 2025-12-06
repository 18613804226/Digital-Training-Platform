import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-margin',
      keepAlive: true,
      order: 4,
      title: $t('smartExam.title'),
    },
    name: 'smartExam',
    path: '/smartExam',
    children: [
      {
        meta: {
          title: $t('smartExam.AIexamGenerator'),
          authority: ['ADMIN', 'TEACHER', 'GUEST'],
        },
        name: 'AIexamGenerator',
        path: '/smartExam/AIexamGenerator',
        component: () => import('#/views/smartExam/AIexamGenerator/index.vue'),
      },
      {
        meta: {
          title: $t('smartExam.formalExam'),
        },
        name: 'formalExam',
        path: '/smartExam/formalExam',
        component: () => import('#/views/smartExam/formalExam/index.vue'),
      },
    ],
  },
];

export default routes;
