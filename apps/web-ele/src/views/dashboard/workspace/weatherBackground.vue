<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  type: string; // 传入天气描述，如 "mist", "rain", "clear"
}>();

const backgroundClass = computed(() => {
  const desc = props.type.toLowerCase();
  if (desc.includes('mist') || desc.includes('fog')) return 'bg-blur-glass';
  if (desc.includes('rain')) return 'bg-rainy';
  if (desc.includes('snow')) return 'bg-snowy';
  if (desc.includes('clear')) return 'bg-sunny';
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
@keyframes sunnyGradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@media (prefers-color-scheme: dark) {
  .bg-blur-glass {
    background: linear-gradient(
      135deg,
      rgb(40 40 40 / 60%),
      rgb(80 80 80 / 40%)
    );
    backdrop-filter: blur(10px) saturate(120%);
  }

  .bg-rainy {
    background: linear-gradient(180deg, #0d47a1 0%, #000 100%);
  }

  .bg-snowy {
    background: linear-gradient(180deg, #90caf9 0%, #e3f2fd 100%);
  }

  .bg-sunny {
    background: linear-gradient(180deg, #f57f17 0%, #fbc02d 100%);
  }

  .bg-cloudy {
    background: linear-gradient(180deg, #37474f 0%, #607d8b 100%);
  }

  .bg-default {
    /* background: #121212; */
  }
}

.weather-wrapper {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  transition:
    background 300ms ease,
    backdrop-filter 300ms ease;
}

/* 模糊玻璃（适合雾/霾） */
.bg-blur-glass {
  background: linear-gradient(
    135deg,
    rgb(255 255 255 / 15%),
    rgb(200 200 200 / 8%)
  );
  backdrop-filter: blur(10px) saturate(120%);
}

/* 雨天：蓝黑渐变 */
.bg-rainy {
  background: linear-gradient(180deg, #4a90e2 0%, #1c1c1c 100%);
}

/* 雪天：浅蓝白渐变 */
.bg-snowy {
  background: linear-gradient(180deg, #e0f7fa 0%, #fff 100%);
}

/* 晴天：暖色渐变 */

.bg-sunny {
  background: linear-gradient(270deg, #e7cd89, #ece498, #ebbf99);
  background-size: 600% 600%;
  animation: sunnyGradient 20s ease infinite;
}

/* 多云：灰色渐变 */
.bg-cloudy {
  background: linear-gradient(180deg, #c7dde7 0%, #d5dbde 100%);
}

/* 默认背景 */
.bg-default {
  /* background: #f5f5f5; */
}

/* ✅ Vben 项目暗色模式（切换时 html/body 会加 .dark） */
.dark .bg-blur-glass {
  background: linear-gradient(135deg, rgb(40 40 40 / 60%), rgb(80 80 80 / 40%));
  backdrop-filter: blur(10px) saturate(120%);
}

.dark .bg-rainy {
  background: linear-gradient(180deg, #0d47a1 0%, #000 100%);
}

.dark .bg-snowy {
  background: linear-gradient(180deg, #90caf9 0%, #e3f2fd 100%);
}

.dark .bg-sunny {
  background: linear-gradient(180deg, #f57f17 0%, #fbc02d 100%);
}

.dark .bg-cloudy {
  background: linear-gradient(180deg, #37474f 0%, #607d8b 100%);
}

.dark .bg-default {
  /* background: #121212; */
}

/* ✅ 系统暗色模式下的替代背景 */
</style>
