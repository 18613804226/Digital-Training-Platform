<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { getCourseApi } from '#/api';
import { router } from '#/router';
// 定义课程类型
interface Course {
  id: string;
  title: string;
  category: string;
  teacher: string;
  createdAt: string;
}

// 响应式课程列表
const courseList = ref<Course[]>([]);
const loading = ref(false);

// 获取课程列表（简化版，不带分页或筛选，若需可扩展）
async function fetchCourses() {
  try {
    loading.value = true;
    const res = await getCourseApi({
      page: 1,
      pageSize: 100, // 或根据实际需求分页加载
    });
    courseList.value = res.list || [];
  } catch (error) {
    ElMessage.error('Failed to load courses');
    console.error(error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchCourses();
});
</script>

<template>
  <div class="h-full p-4">
    <Page
      class="card-box h-full overflow-hidden rounded-lg"
      title="Available Courses"
    >
      <!-- Loading state -->
      <div v-if="loading" class="py-8 text-center">Loading courses...</div>

      <!-- Empty state -->
      <div
        v-else-if="courseList.length === 0"
        class="py-8 text-center text-gray-500"
      >
        No courses available.
      </div>

      <!-- Card Grid -->
      <div
        v-else
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div
          v-for="course in courseList"
          :key="course.id"
          class="card-box overflow-hidden rounded-lg shadow transition-shadow duration-200 hover:shadow-lg"
        >
          <!-- 可选：课程封面图（如果有） -->
          <!-- <div class="h-32 bg-gray-200 flex items-center justify-center">
          <span class="text-gray-500">Cover</span>
        </div> -->

          <div class="p-5">
            <h3 class="mb-2 line-clamp-2 text-lg font-semibold">
              {{ course.title }}
            </h3>
            <p class="mb-1 text-sm text-gray-600">
              <span class="font-medium">Teacher:</span> {{ course.teacher }}
            </p>
            <p class="mb-1 text-sm text-gray-600">
              <span class="font-medium">Category:</span> {{ course.category }}
            </p>
            <p class="text-xs text-gray-500">
              Added on {{ new Date(course.createdAt).toLocaleDateString() }}
            </p>

            <VbenButton
              class="mt-4 w-full"
              size="sm"
              @click="
                router.push({
                  name: 'courseDetail',
                  params: { courseId: course.id },
                })
              "
            >
              Start Learning
            </VbenButton>
          </div>
        </div>
      </div>
    </Page>
  </div>
</template>
