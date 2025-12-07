<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VbenButton } from '@vben/common-ui';

const route = useRoute();
const router = useRouter();

// 假数据：当前课程结构（用于“下一课”逻辑）
const mockCourseStructure = [
  { moduleId: 'm1', lessons: ['l1', 'l2'] },
  { moduleId: 'm2', lessons: ['l3', 'l4'] },
];

// 当前课时信息
const lesson = ref({
  id: (route.params.lessonId as string) || 'l1',
  title: 'HTML简介',
  type: 'video',
  contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  description: '本课时介绍 HTML 的基本概念和作用。',
  completed: false,
});

const videoRef = ref<HTMLVideoElement | null>(null);
const isVideoLoaded = ref(false);
const videoError = ref(false);

// 查找下一课时（支持跨模块）
function findNextLesson(currentLessonId: string) {
  let found = false;
  for (const module of mockCourseStructure) {
    for (const lessonId of module.lessons) {
      if (found) {
        return { moduleId: module.moduleId, lessonId };
      }
      if (lessonId === currentLessonId) {
        found = true;
      }
    }
  }
  return null; // 已到最后
}

// 手动标记完成
function markCompleted() {
  lesson.value.completed = true;
  console.log(`课时 ${lesson.value.id} 已手动完成`);
}

// 跳转到下一课
function goToNextLesson() {
  const next = findNextLesson(lesson.value.id);
  if (next) {
    router.push(`/courses/${route.params.courseId}/modules/${next.moduleId}/lessons/${next.lessonId}`);
  } else {
    // 课程结束，跳回课程详情页
    router.push(`/courses/${route.params.courseId}`);
  }
}

// 视频事件监听（自动完成）
function handleTimeUpdate() {
  const video = videoRef.value;
  if (video && !lesson.value.completed) {
    const progress = video.currentTime / video.duration;
    if (progress >= 0.9) {
      // 播放到 90% 自动标记完成
      lesson.value.completed = true;
      console.log('视频播放完成，自动标记为已完成');
    }
  }
}

// 视频加载状态
function handleLoadedData() {
  isVideoLoaded.value = true;
  videoError.value = false;
}

function handleVideoError() {
  isVideoLoaded.value = true;
  videoError.value = true;
}

onMounted(() => {
  // 可在此处调用真实 API 获取 lesson 数据
});

onUnmounted(() => {
  // 清理（如果需要）
});
</script>

<template>
  <div class="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
    <!-- 课时信息 -->
    <div class="bg-white rounded-xl shadow-sm p-5">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-800">{{ lesson.title }}</h1>
          <p class="text-sm text-gray-600 mt-1">{{ lesson.description }}</p>
        </div>
        <div class="flex gap-2">
          <!-- 笔记按钮（预留） -->
          <VbenButton variant="ghost" size="sm" icon="ri:edit-line" />
          <!-- 收藏按钮（预留） -->
          <VbenButton variant="ghost" size="sm" icon="ri:star-line" />
        </div>
      </div>
    </div>

    <!-- 播放区 -->
    <div class="bg-white rounded-xl shadow-sm p-5">
      <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-4">学习内容</h2>

      <!-- 视频加载中 / 错误状态 -->
      <div v-if="lesson.type === 'video'" class="relative">
        <video ref="videoRef" class="w-full aspect-video rounded-lg border bg-black" controls
          @timeupdate="handleTimeUpdate" @loadeddata="handleLoadedData" @error="handleVideoError">
          <source :src="lesson.contentUrl" type="video/mp4" />
          您的浏览器不支持视频播放。
        </video>

        <!-- 加载遮罩 -->
        <div v-if="!isVideoLoaded && !videoError"
          class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <div class="text-white">正在加载视频...</div>
        </div>

        <!-- 错误提示 -->
        <div v-if="videoError"
          class="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
          <div class="text-red-600 mb-2">⚠️ 视频加载失败</div>
          <div class="text-sm text-gray-600">请检查网络或稍后重试</div>
        </div>
      </div>

      <!-- 非视频内容（如文本、PDF等） -->
      <div v-else class="prose max-w-none text-gray-700 p-4 bg-gray-50 rounded-lg">
        {{ lesson.contentUrl }}
      </div>
    </div>

    <!-- 操作区 -->
    <div class="bg-white rounded-xl shadow-sm p-5 flex flex-wrap gap-3 justify-between items-center">
      <div class="flex gap-2">
        <VbenButton variant="default" size="sm" @click="markCompleted" :disabled="lesson.completed"
          class="whitespace-nowrap">
          {{ lesson.completed ? '✅ 已完成' : '标记为已完成' }}
        </VbenButton>
      </div>

      <VbenButton variant="outline" size="sm" @click="goToNextLesson" class="whitespace-nowrap">
        下一课时 →
      </VbenButton>
    </div>
  </div>
</template>

<style scoped>
/* 确保视频比例正确 */
video {
  object-fit: contain;
}
</style>
