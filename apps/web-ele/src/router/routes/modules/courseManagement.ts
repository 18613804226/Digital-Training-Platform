import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      order: 1,
      icon: 'ic:baseline-book',
      keepAlive: true,
      title: $t('courseManagement.title'),
      authority: ['ADMIN', 'TEACHER', 'GUEST'],
    },
    name: 'courseManagement',
    path: '/courseManagement',
    children: [
      {
        meta: {
          title: $t('courseManagement.courseAdmin'),
          keepAlive: true,
          authority: ['ADMIN', 'TEACHER', 'GUEST'],
        },
        name: 'courseAdmin',
        path: '/courseManagement/courseAdmin',
        component: () =>
          import('#/views/courseManagement/courseAdmin/index.vue'),

      }, {
        meta: {
          title: $t('onlineLearning.courseDetail'),
          keepAlive: true,
          hideInMenu: true
        },
        name: 'courseDetail',
        // 动态课程详情
        path: 'courseDetail/:courseId',
        component: () => import('#/views/courseManagement/courseDetail/index.vue'),
        children: [
          {
            meta: {
              title: $t('onlineLearning.lessonPlayer'),
              keepAlive: true,
              hideInMenu: true
            },
            name: 'lessonPlayer',
            // 动态课时学习
            path: 'lessonPlayer/:lessonId',
            component: () =>
              import('#/views/courseManagement/lessonPlayer/index.vue'),
          },
        ]
      },
      // {
      //   meta: {
      //     title: $t('courseManagement.courseBank'),
      //     keepAlive: true,
      //   },
      //   name: 'formalExam',
      //   path: '/courseManagement/courseBank',
      //   component: () =>
      //     import('#/views/courseManagement/courseBank/index.vue'),
      // },
    ],
  },
];

export default routes;
