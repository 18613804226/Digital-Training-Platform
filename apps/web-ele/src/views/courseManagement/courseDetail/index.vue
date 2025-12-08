<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { prompt, useVbenModal, VbenButton } from '@vben/common-ui';

import { Check, Clock, Delete, Edit, Rank } from '@element-plus/icons-vue';
import { ElIcon, ElMessage } from 'element-plus';
import Sortable from 'sortablejs';

import {
  deleteLessonApi,
  getCourseByIdApi,
  updateLessonsOrderApi,
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

// —————— Load Course ——————
onMounted(async () => {
  if (!route.meta.hideDetail) {
    await loadCourse();
    initSortable();
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
    component: () => {},
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
  lessonData.value = lesson || {};
  modalApi.open();
}

// —————— Toggle Completion Status ——————
async function toggleLessonComplete(lessonId: number) {
  // const lesson = lessons.value.find((l: any) => l.id === lessonId);
  // const data = {
  //   lessonId,
  //   courseId,
  // };
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
</script>

<template>
  <div class="h-full">
    <div class="m-4 space-y-4" v-if="!route.meta.hideDetail">
      <!-- Top Course Info -->
      <div class="card-box flex items-start justify-between p-6">
        <div>
          <h1 class="text-xl font-bold text-gray-800">{{ course.title }}</h1>
          <p class="mt-2 text-sm text-gray-600">{{ course.description }}</p>

          <div class="mt-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-blue-600">
                📊 Learning Progress: {{ completedLessons }} /
                {{ totalLessons }} Lessons
              </span>
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  class="h-full bg-blue-500 transition-all duration-300"
                  :style="{ width: `${progressPercent}%` }"
                ></div>
              </div>
              <span class="whitespace-nowrap text-xs text-gray-500"
                >{{ progressPercent }}%</span
              >
            </div>
          </div>

          <div class="mt-3 space-x-4 text-xs text-gray-500">
            <span>📚 Category: {{ course.category }}</span>
            <span>👤 Instructor: {{ course.teacher.username }}</span>
            <span>📅 Created At: {{ course.createdAt }}</span>
          </div>
        </div>

        <VbenButton
          v-access:role="['ADMIN', 'GUEST', 'TEACHER']"
          variant="default"
          size="sm"
          @click="openAddLesson"
        >
          + Add Lesson
        </VbenButton>
      </div>

      <!-- Lesson List -->
      <div class="card-box p-5">
        <h3 class="mb-3 text-lg font-bold text-gray-800">Course Content</h3>
        <ul ref="lessonListRef" class="ml-2 space-y-2">
          <li
            v-for="(lesson, index) in lessons"
            :key="lesson.id"
            class="group flex items-center justify-between rounded px-2 py-2 hover:bg-gray-50"
          >
            <!-- Left: Drag Handle + Icon + Title -->
            <div class="flex items-center gap-2">
              <ElIcon v-if="lesson.completed" color="#409EFF" size="16">
                <Check />
              </ElIcon>
              <ElIcon v-else color="#ccc" size="16">
                <Clock />
              </ElIcon>
              <span class="text-gray-700">{{ lesson.title }}</span>
            </div>

            <!-- Right: Action Buttons -->
            <div class="flex items-center gap-1">
              <!-- Drag Handle -->
              <div
                class="drag-handle cursor-grab text-gray-400 hover:text-gray-600"
              >
                <VbenButton
                  v-access:role="['ADMIN', 'GUEST', 'TEACHER']"
                  variant="ghost"
                  size="sm"
                  class="w-8"
                >
                  <ElIcon>
                    <Rank />
                  </ElIcon>
                </VbenButton>
              </div>
              <!-- Edit -->
              <VbenButton
                v-access:role="['ADMIN', 'GUEST', 'TEACHER']"
                variant="ghost"
                size="sm"
                class="w-8"
                @click="openAddLesson(lesson)"
              >
                <ElIcon>
                  <Edit />
                </ElIcon>
              </VbenButton>
              <!-- Delete -->
              <VbenButton
                v-access:role="['ADMIN', 'GUEST', 'TEACHER']"
                variant="ghost"
                size="sm"
                class="w-8"
                @click="deleteLesson(lesson.id)"
              >
                <ElIcon>
                  <Delete />
                </ElIcon>
              </VbenButton>
              <!-- Toggle Completion -->
              <VbenButton
                variant="link"
                size="sm"
                @click="toggleLessonComplete(lesson.id)"
                class="ml-2 w-24 text-sm"
              >
                {{ lesson.completed ? 'Relearning' : 'Start Learning' }}
              </VbenButton>
            </div>
          </li>
          <li
            v-if="lessons.length === 0"
            class="py-2 text-sm italic text-gray-400"
          >
            No lessons available.
          </li>
        </ul>
      </div>

      <!-- Modal -->
      <Modal
        :course-id="courseId"
        :lesson-data="lessonData"
        @confirm="loadCourse()"
      />
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
