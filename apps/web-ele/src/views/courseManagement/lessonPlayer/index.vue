<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page, VbenButton } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { getLessonApi, updateCompleteApi } from '#/api';

const route = useRoute();
const router = useRouter();
const lessonId = Number(route.params.lessonId);

const lesson = ref({
  id: (route.params.lessonId as string) || 'l1',
  title: 'HTML简介',
  description: '本课时介绍 HTML 的基本概念和作用。',
  completed: false,
  content: [] as Array<{
    content?: string;
    id: string;
    type: string;
    url?: string;
  }>,
});

onMounted(async () => {
  if (lessonId) {
    try {
      const res = await getLessonApi({ lessonId });
      lesson.value = {
        ...res,
        content: Array.isArray(res.content) ? res.content : [],
      };
    } catch (error) {
      console.error('Failed to load lesson:', error);
    }
  }
});

async function markCompleted() {
  // getLessonApi，updateCompleteApi
  // lesson.value.completed = true;
  const data = {
    courseId: route.params.courseId,
    lessonId,
  };
  const res = await updateCompleteApi(data);
  if (res.success) {
    lesson.value.completed = true;
    ElMessage.success(res.message);
  }
}

function goToNextLesson() {
  router.push(`/courseDetail/${route.params.courseId}`);
}

function extractVideoId(url: string): string {
  const regExp = /^.*(youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match: any = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : '';
}

async function downloadDocument(url: string, name: string) {
  const fullUrl = import.meta.env.VITE_BASE_API + url;

  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = name;
    document.body.append(link);
    link.click();

    link.remove();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
  }
}

// ✅ 新增：解析文件列表
function parseFiles(content: any): { name: string; url: string }[] {
  try {
    return JSON.parse(content || '[]');
  } catch (error) {
    console.warn('Failed to parse document content:', error);
    return [];
  }
}
</script>

<template>
  <div class="h-full p-4">
    <Page
      class="card-box h-full overflow-hidden rounded-lg"
      :title="lesson.title"
      :description="lesson.description"
    >
      <div class="">
        <!-- <h2 class="mb-4 font-semibold">Learning content</h2> -->

        <div
          v-for="(block, index) in lesson.content"
          :key="block.id"
          class="mb-6"
        >
          <!-- Video Block -->
          <div
            v-if="block.type === 'video'"
            class="card-box flex justify-center"
          >
            <div
              class="relative aspect-video w-full max-w-3xl overflow-hidden rounded-lg bg-black"
            >
              <iframe
                :src="`https://www.youtube.com/embed/${extractVideoId(block.url || '')}`"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                class="absolute inset-0 h-full w-full"
              ></iframe>
            </div>
          </div>
          <!-- Text Block -->
          <div
            v-else-if="block.type === 'text'"
            class="card-box prose max-w-none rounded-lg p-4 text-gray-700"
            v-html="block.content || ''"
          ></div>
          <!-- Code Block -->
          <div
            v-else-if="block.type === 'code'"
            class="card-box overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400"
          >
            <pre>{{ block.content || '' }}</pre>
          </div>
          <!-- Document Block -->
          <div
            v-else-if="block.type === 'document'"
            class="card-box rounded-lg p-4"
          >
            <h3 class="mb-2 font-medium text-gray-800">📄 附加文档</h3>
            <ul class="space-y-2">
              <li
                v-for="(file, idx) in parseFiles(block.content)"
                :key="idx"
                class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-gray-100"
                @click="downloadDocument(file.url, file.name)"
              >
                <span class="text-sm text-blue-600">📄</span>
                <span class="truncate text-sm text-gray-700">{{
                  file.name
                }}</span>
              </li>
            </ul>
          </div>

          <!-- 未知类型 -->
          <div v-else class="italic text-gray-500">
            不支持的内容类型：{{ block.type }}
          </div>
        </div>

        <div
          v-if="lesson.content.length === 0"
          class="py-8 text-center text-gray-500"
        >
          尚未添加任何学习内容。
        </div>
      </div>

      <div
        class="flex flex-wrap items-center justify-between gap-3 rounded-xl p-5"
      >
        <VbenButton
          variant="default"
          size="sm"
          @click="markCompleted"
          :disabled="lesson.completed"
        >
          {{ lesson.completed ? '✅ 已完成' : '标记为已完成' }}
        </VbenButton>

        <VbenButton
          variant="outline"
          size="sm"
          @click="goToNextLesson"
          class="whitespace-nowrap"
        >
          下一课时 →
        </VbenButton>
      </div>
    </Page>
  </div>
</template>

<style scoped>
/* 文件列表样式优化 */
.doc-list {
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.doc-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 0;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.doc-item:hover {
  background-color: #f9fafb;
}

.doc-item:last-child {
  border-bottom: none;
}

.doc-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
