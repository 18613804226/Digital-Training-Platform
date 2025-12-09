import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      order: 1,
      icon: 'ic:baseline-book',
      keepAlive: false,
      title: $t('courseManagement.title'),
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
        path: '/courseAdmin',
        component: () =>
          import('#/views/courseManagement/courseAdmin/index.vue'),
      },
      {
        meta: {
          title: $t('onlineLearning.courseDetail'),
          keepAlive: false,
          hideInMenu: true,
        },
        name: 'courseDetail',
        // 动态课程详情
        path: '/courseDetail/:courseId',
        component: () =>
          import('#/views/courseManagement/courseDetail/index.vue'),
        children: [
          {
            meta: {
              title: $t('onlineLearning.lessonPlayer'),
              keepAlive: false,
              hideInMenu: true,
              hideDetail: true,
            },
            name: 'lessonPlayer',
            // 动态课时学习
            path: 'lessonPlayer/:lessonId',
            component: () =>
              import('#/views/courseManagement/lessonPlayer/index.vue'),
          },
        ],
      },

      {
        meta: {
          title: $t('courseManagement.courseLearning'),
          keepAlive: true,
        },
        name: 'courseLearning',
        path: '/courseLearning',
        component: () =>
          import('#/views/courseManagement/courseLearning/index.vue'),
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
