<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page, VbenButton } from '@vben/common-ui';

import { getLessonApi } from '#/api';

const route = useRoute();
const router = useRouter();
const lessonId = Number(route.params.lessonId);

// 当前课时数据
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
      console.log('Lesson Data:', res);
      lesson.value = {
        ...res,
        content: Array.isArray(res.content) ? res.content : [],
      };
    } catch (error) {
      console.error('Failed to load lesson:', error);
    }
  }
});

// 手动标记完成
function markCompleted() {
  lesson.value.completed = true;
  console.log(`课时 ${lesson.value.id} 已手动完成`);
}

// 跳转到下一课（简化：直接返回课程页）
function goToNextLesson() {
  router.push(`/courses/${route.params.courseId}`);
}

// 提取 YouTube 视频 ID
function extractVideoId(url: string): string {
  const regExp = /^.*(youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match: any = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : '';
}

// 下载文档（打开新标签页）
function downloadDocument(url: string) {
  window.open(url, '_blank');
}
</script>

<template>
  <div class="h-full p-4">
    <Page
      class="card-box h-full overflow-hidden rounded-lg"
      :title="lesson.title"
      :description="lesson.description"
    >
      <!-- 学习内容区域 -->
      <div class="rounded-xl p-5">
        <h2 class="mb-4 font-semibold">Learning content</h2>

        <!-- 遍历每个 content block -->
        <div
          v-for="(block, index) in lesson.content"
          :key="block.id"
          class="mb-6"
        >
          <!-- Video Block -->
          <div v-if="block.type === 'video'" class="flex justify-center">
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
            class="prose max-w-none rounded-lg bg-gray-50 p-4 text-gray-700"
            v-html="block.content || ''"
          ></div>

          <!-- Code Block -->
          <div
            v-else-if="block.type === 'code'"
            class="overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400"
          >
            <pre>{{ block.content || '' }}</pre>
          </div>

          <!-- Document Block -->
          <div
            v-else-if="block.type === 'document'"
            class="flex cursor-pointer items-center gap-2 text-blue-600 hover:underline"
            @click="downloadDocument(block.url || '')"
          >
            📄 <span>Download Document</span>
          </div>

          <!-- 未知类型 -->
          <div v-else class="italic text-gray-500">
            不支持的内容类型：{{ block.type }}
          </div>
        </div>

        <!-- 无内容提示 -->
        <div
          v-if="lesson.content.length === 0"
          class="py-8 text-center text-gray-500"
        >
          尚未添加任何学习内容。
        </div>
      </div>

      <!-- 操作按钮区 -->
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
/* 确保 iframe 填充容器 */
iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
