<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  type: string;
}>();

const backgroundClass = computed(() => {
  const desc = props.type.toLowerCase();
  if (desc.includes('mist') || desc.includes('fog')) return 'bg-mist';
  if (desc.includes('rain')) return 'bg-rain';
  if (desc.includes('snow')) return 'bg-snow';
  if (desc.includes('clear') || desc.includes('sun')) return 'bg-sunny';
  if (desc.includes('cloud')) return 'bg-cloudy';
  return 'bg-default';
});
</script>

<template>
  <div class="weather-wrapper" :class="[backgroundClass]">
    <slot></slot>
  </div>
</template>

<style scoped>
/* stylelint-disable-next-line keyframes-name-pattern */
@keyframes sunnyFlow {
  0%,
  100% {
    background-position: 0% 50%;
    filter: hue-rotate(0deg) brightness(1);
  }

  50% {
    background-position: 100% 50%;
    filter: hue-rotate(15deg) brightness(1.05);
  }
}

.weather-wrapper {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 基础层：柔和渐变底色 */
.weather-wrapper::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: '';
  background: inherit;
  opacity: 0.6;
  filter: blur(80px);
}

/* 晴天：梦幻金色流动光 */
.bg-sunny {
  background: linear-gradient(
    135deg,
    #ffecd2 0%,
    #fcb69f 30%,
    #ff9a9e 60%,
    #fad0c4 100%
  );
  animation: sunnyFlow 30s ease infinite;
}

/* 雨天：深蓝神秘 + 微光 */
.bg-rain {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 40%, #0f2027 100%);
}

/* 雪天：清新冷调蓝白 */
.bg-snow {
  background: linear-gradient(135deg, #e0f6ff 0%, #c0e8f9 40%, #a8d8ea 100%);
}

/* 多云：柔和灰蓝 */
.bg-cloudy {
  background: linear-gradient(135deg, #89a8c2 0%, #a8c6d9 40%, #d0e0ed 100%);
}

/* 雾/霾：高级磨玻璃 + 轻微纹理 */
.bg-mist {
  background: linear-gradient(
    135deg,
    rgb(255 255 255 / 10%) 0%,
    rgb(200 220 255 / 15%) 100%
  );
  backdrop-filter: blur(12px) saturate(180%);
}

/* 默认：中性优雅 */
.bg-default {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%);
}

/* ========== 暗色模式优化 ========== */
.dark .bg-sunny {
  background: linear-gradient(135deg, #ff8a00 0%, #e52e71 50%, #9a1e5e 100%);
  animation: sunnyFlow 35s ease infinite;
}

.dark .bg-rain {
  background: linear-gradient(135deg, #0c2b5a 0%, #0f172a 50%, #020617 100%);
}

.dark .bg-snow {
  background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
}

.dark .bg-cloudy {
  background: linear-gradient(135deg, #1e293b 0%, #334155 60%, #475569 100%);
}

.dark .bg-mist {
  background: linear-gradient(
    135deg,
    rgb(30 41 59 / 80%) 0%,
    rgb(51 65 85 / 60%) 100%
  );
  backdrop-filter: blur(16px) saturate(150%);
}

.dark .bg-default {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}
</style>
