<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { prompt, useVbenModal, VbenButton, VbenLoading } from '@vben/common-ui';

import { Check, Clock, Delete, Edit, Rank } from '@element-plus/icons-vue';
import { ElIcon, ElMessage } from 'element-plus';
import Sortable from 'sortablejs';

import {
  deleteLessonApi,
  getCourseByIdApi,
  updateLessonsOrderApi,
  updateUncompleteApi,
} from '#/api';

import ExtraModal from './modal.vue';

const [Modal, modalApi] = useVbenModal({
  connectedComponent: ExtraModal,
});

const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);

const course = ref({
  id: 0,
  title: '',
  category: '',
  teacher: { username: '' },
  createdAt: '',
  description: '',
});

const lessons = ref<any[]>([]);
const lessonData = ref({});
const loading = ref(false)
// —————— Load Course ——————
onMounted(async () => {
  if (!route.meta.hideDetail) {
    loading.value = true
    await loadCourse();
    initSortable();
    loading.value = false
  }
});

let sortableInstance: null | Sortable = null;
const lessonListRef = ref<HTMLElement | null>(null);

function initSortable() {
  if (lessonListRef.value) {
    sortableInstance = new Sortable(lessonListRef.value, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'drag-ghost',
      onEnd: async (evt) => {
        const { oldIndex, newIndex } = evt;
        if (
          oldIndex === newIndex ||
          oldIndex === undefined ||
          newIndex === undefined
        )
          return;

        const items = [...lessons.value];
        const movedItem = items.splice(oldIndex, 1)[0];
        items.splice(newIndex, 0, movedItem);
        lessons.value = items;

        try {
          const lessonIds = items.map((l) => l.id);
          await updateLessonsOrderApi({ courseId, lessonIds });
          ElMessage.success('The order of lessons has been updated.');
        } catch {
          ElMessage.error('Synchronization failed. Please refresh the page.');
          await loadCourse();
        }
      },
    });
  }
}

onUnmounted(() => {
  sortableInstance?.destroy();
});

async function loadCourse() {
  if (courseId) {
    const res = await getCourseByIdApi({ courseId });
    course.value = res;
    lessons.value = (res.lessons || []).sort(
      (a: any, b: any) => a.order - b.order,
    );
  }
}

// —————— Delete Lesson ——————
function deleteLesson(lessonId: number) {
  prompt({
    component: () => { },
    content: 'Are you sure you want to delete this lesson?',
    icon: 'error',
    modelPropName: 'value',
  }).then(async () => {
    const res: any = await deleteLessonApi({ lessonId });
    if (res.success === true) {
      ElMessage.success(res.message || 'Deleted successfully');
      loadCourse();
    }
  });
}

// —————— Edit / Add Lesson ——————
function openAddLesson(lesson?: any) {
  lessonData.value = lesson;
  modalApi.open();
}

// —————— Toggle Completion Status ——————
async function toggleLessonComplete(lessonId: number) {
  const lesson = lessons.value.find((l: any) => l.id === lessonId);
  const data = {
    lessonId,
    courseId,
  };
  if (lesson.completed) {
    const res = await updateUncompleteApi(data);
    if (res.success) {
    }
  }
  router.push({ name: 'lessonPlayer', params: { lessonId } });
  // if (lesson) {
  //   lesson.completed = !lesson.completed;
  //   if (lesson.completed) {
  //     const res = await updateCompleteApi(data);
  //     if (res.success) {
  //       ElMessage.success(res.message || 'Lesson marked as completed.');
  //     }
  //   } else {
  //     const res = await updateUncompleteApi(data);
  //     if (res.success) {
  //       ElMessage.success(res.message || 'Lesson marked as incomplete.');
  //     }
  //   }
  // }
}

// —————— Progress Calculation ——————
const totalLessons = computed(() => lessons.value.length);
const completedLessons = computed(
  () => lessons.value.filter((lesson: any) => lesson.completed).length,
);
const progressPercent = computed(() => {
  return totalLessons.value
    ? Math.round((completedLessons.value / totalLessons.value) * 100)
    : 0;
});
// -----------------------------
// 假设 lessons 是响应式数组，每个 lesson 有 contentBlocks: ContentBlock[]
const hasTypeInLesson = (lesson: any, type: string): boolean => {
  return (
    lesson?.content &&
    Array.isArray(lesson.content) &&
    lesson.content.some((block: any) => block.type === type)
  );
};
</script>

<template>
  <div class="h-full">
    <VbenLoading v-if="loading" :spinning="loading" />
    <div class="m-4 space-y-4" v-if="!route.meta.hideDetail">
      <!-- Top Course Info -->
      <div class="card-box flex items-start justify-between p-6">
        <div>
          <h1 class="text-xl font-bold">{{ course.title }}</h1>
          <p class="mt-2 text-sm">{{ course.description }}</p>

          <div class="mt-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-blue-600">
                📊 Learning Progress: {{ completedLessons }} /
                {{ totalLessons }} Lessons
              </span>
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div class="h-full bg-blue-500 transition-all duration-300" :style="{ width: `${progressPercent}%` }">
                </div>
              </div>
              <span class="whitespace-nowrap text-xs text-gray-500">{{ progressPercent }}%</span>
            </div>
          </div>

          <div class="mt-3 space-x-4 text-xs text-gray-500">
            <span>📚 Category: {{ course.category }}</span>
            <span>👤 Instructor: {{ course.teacher.username }}</span>
            <span>📅 Created At: {{ course.createdAt }}</span>
          </div>
        </div>

        <VbenButton v-access:role="['ADMIN', 'GUEST', 'TEACHER']" variant="default" size="sm" @click="openAddLesson">
          + Add Lesson
        </VbenButton>
      </div>

      <!-- Lesson List -->
      <div class="card-box rounded-lg border p-5">
        <h3 class="mb-3 text-lg font-bold">Course Content</h3>

        <ul ref="lessonListRef" class="space-y-3">
          <li v-for="lesson in lessons" :key="lesson.id"
            class="group flex flex-col rounded border border-transparent px-3 py-3 transition hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-600 dark:hover:bg-gray-700">
            <!-- Title & Status Row -->
            <div class="flex w-full items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <ElIcon v-if="lesson.completed" color="#409EFF" size="16" class="dark:text-blue-400">
                    <Check />
                  </ElIcon>
                  <ElIcon v-else color="#9CA3AF" size="16" class="dark:text-gray-400">
                    <Clock />
                  </ElIcon>
                  <span class="font-medium text-gray-700 dark:text-gray-200">
                    {{ lesson.title }}
                  </span>
                </div>

                <div v-if="
                  lesson.content &&
                  Array.isArray(lesson.content) &&
                  lesson.content.length > 0
                " class="mt-2 flex flex-wrap gap-1">
                  <span v-if="hasTypeInLesson(lesson, 'text')"
                    class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    📝 Text
                  </span>
                  <span v-if="hasTypeInLesson(lesson, 'video')"
                    class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    🎬 Video
                  </span>
                  <span v-if="hasTypeInLesson(lesson, 'code')"
                    class="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    💻 Code
                  </span>
                  <span v-if="hasTypeInLesson(lesson, 'document')"
                    class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    📄 Document
                  </span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-1">
                <!-- Drag Handle -->
                <VbenButton v-access:role="['ADMIN', 'GUEST', 'TEACHER']" variant="ghost" size="sm"
                  class="w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <ElIcon>
                    <Rank />
                  </ElIcon>
                </VbenButton>

                <!-- Edit -->
                <VbenButton v-access:role="['ADMIN', 'GUEST', 'TEACHER']" variant="ghost" size="sm"
                  class="w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" @click="openAddLesson(lesson)">
                  <ElIcon>
                    <Edit />
                  </ElIcon>
                </VbenButton>

                <!-- Delete -->
                <VbenButton v-access:role="['ADMIN', 'GUEST', 'TEACHER']" variant="ghost" size="sm"
                  class="w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  @click="deleteLesson(lesson.id)">
                  <ElIcon>
                    <Delete />
                  </ElIcon>
                </VbenButton>

                <!-- Toggle Completion -->
                <VbenButton variant="link" size="sm" @click="toggleLessonComplete(lesson.id)"
                  class="ml-2 w-24 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  {{ lesson.completed ? 'Relearning' : 'Start Learning' }}
                </VbenButton>
              </div>
            </div>
          </li>

          <li v-if="lessons.length === 0" class="py-4 text-center text-sm italic text-gray-400 dark:text-gray-500">
            No lessons available.
          </li>
        </ul>
      </div>

      <!-- Modal -->
      <Modal :course-id="courseId" :lesson-data="lessonData" @confirm="loadCourse()" />
    </div>
    <router-view v-else />
  </div>
</template>

<style scoped>
.drag-ghost {
  background: #f0f9ff;
  border: 1px dashed #409eff;
  opacity: 0.6;
}

.drag-handle {
  padding: 4px;
}
</style>
