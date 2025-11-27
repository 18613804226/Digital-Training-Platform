<!-- src/views/onlineLearning/videoPlayer/index.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import videojs from 'video.js';

import { getVideoApi } from '#/api';

import 'video.js/dist/video-js.css';
// 引入 Vben 组件
const router = useRouter();

// 页面数据
const courseTitle = 'Vue3 企业级开发实战';
const loading = ref(true);
const videoUrl = ref('');
const player: any = ref(null);

// 获取视频地址（调用后端 API）
const fetchVideoUrl = async () => {
  try {
    const res = await getVideoApi({ lessonId: '000' });
    // console.log('res', res);

    // const data = await res.json();
    if (res.url) {
      videoUrl.value = res.url;
    }
  } catch (error) {
    console.error('获取视频地址失败:', error);
  } finally {
    loading.value = false;
  }
};

// 初始化播放器
onMounted(() => {
  initPlayer();
});

// 添加动态水印和防右键
const addWatermarkAndSecurity = () => {
  if (!videoUrl.value || !document.querySelector('#my-video')) return;

  // 创建水印
  const watermark = document.createElement('div');
  watermark.id = 'video-watermark';
  watermark.innerHTML = `
    <div style="
      position: absolute;
      top: 30px;
      left: 30px;
      color: rgba(255,255,255,0.7);
      font-size: 16px;
      font-weight: bold;
      pointer-events: none;
      z-index: 9999;
      text-shadow: 1px 1px 2px #000;
      opacity: 0.8;
    ">
      用户：张三<br/>
      时间：${new Date().toLocaleString('zh-CN')}
    </div>
  `;
  const videoEl = document.querySelector('#my-video');
  if (videoEl) {
    videoEl.append(watermark);
  }

  // 禁用右键
  videoEl?.addEventListener('contextmenu', (e) => e.preventDefault());
  videoEl?.addEventListener('dragstart', (e) => e.preventDefault());
};

// 播放器初始化完成
const initPlayer = () => {
  if (!videoUrl.value) return;

  player.value = videojs(
    'my-video',
    {
      fluid: true,
      aspectRatio: '16:9',
      playbackRates: [0.75, 1, 1.25, 1.5],
      language: 'zh-CN',
      responsive: true,
      autoplay: true, // 👈 启用自动播放
      muted: true, // 👈 必须静音（即使标签已有，也建议配置）
      userActions: {
        hotkeys: true,
      },
    },
    () => {
      addWatermarkAndSecurity();
    },
  );
};

// 页面挂载后初始化
onMounted(() => {
  fetchVideoUrl();
});

// 页面卸载时清理
onUnmounted(() => {
  if (player.value) {
    player.value.dispose();
  }
  const wm = document.querySelector('#video-watermark');
  if (wm) wm.remove();
});

// 返回按钮
const goBack = () => {
  router.push('/onlineLearning/courseList');
};
</script>

<template>
  <div class="video-player-container">
    <div class="header">
      <!-- <h2>{{ courseTitle }}</h2> -->
      <p class="desc">请勿录屏或传播，本视频受版权保护</p>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在加载视频...</p>
    </div>

    <!-- 播放器 -->
    <div v-else-if="videoUrl" ref="playerContainer" class="player-wrapper">
      <div data-vjs-player>
        <video
          ref="videoElement"
          id="my-video"
          class="video-js vjs-big-play-centered"
          controls
          preload="auto"
          width="100%"
          poster="./assets/images/video-poster.png"
          muted
        >
          <source :src="videoUrl" type="application/x-mpegURL" />
          <p class="vjs-no-js">您的浏览器不支持 HTML5 视频，请升级浏览器。</p>
        </video>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-else class="error">
      <i class="icon-error"></i>
      <p>视频加载失败，请稍后重试。</p>
    </div>

    <!-- 操作按钮 -->
    <!-- <div class="actions">
      <VbenButton @click="goBack" variant="default" size="sm">
        返回课程列表
      </VbenButton>
    </div> -->
  </div>
</template>

<style scoped>
.video-player-container {
  max-width: 1200px;
  padding: 20px;
  margin: 0 auto;
}

.header {
  margin-bottom: 20px;
}

.desc {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  margin-bottom: 10px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.player-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;

  /* 16:9 */
  margin: 20px 0;
  overflow: hidden;
  border-radius: 8px;
}

.video-js {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
}

.error {
  padding: 40px;
  color: red;
  text-align: center;
}

.actions {
  margin-top: 20px;
  text-align: center;
}
</style>
