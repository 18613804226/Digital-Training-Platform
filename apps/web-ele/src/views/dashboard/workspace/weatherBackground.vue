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

/* stylelint-disable-next-line keyframes-name-pattern */
@keyframes sunGlow {
  from {
    transform: translate(-5%, -5%) scale(1);
  }

  to {
    transform: translate(5%, 5%) scale(1.1);
  }
}

/* stylelint-disable-next-line keyframes-name-pattern */
@keyframes rainGlow {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(100%);
  }
}

/* stylelint-disable-next-line keyframes-name-pattern */
@keyframes snowNoise {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 100px 200px;
  }
}

/* stylelint-disable-next-line keyframes-name-pattern */
@keyframes cloudMove {
  from {
    transform: translateX(-10%);
  }

  to {
    transform: translateX(10%);
  }
}

/* stylelint-disable-next-line keyframes-name-pattern */
@keyframes mistFlow {
  0% {
    transform: translateX(-30%);
  }

  50% {
    transform: translateX(30%);
  }

  100% {
    transform: translateX(-30%);
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

.weather-wrapper::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
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

.bg-sunny::after {
  position: absolute;
  inset: -20%;
  pointer-events: none;
  content: '';
  background: radial-gradient(
    circle at 70% 30%,
    rgb(255 255 255 / 35%) 0%,
    rgb(255 255 255 / 15%) 25%,
    transparent 60%
  );
  animation: sunGlow 18s ease-in-out infinite alternate;
}

/* 雨天：深蓝神秘 + 微光 */
.bg-rain {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 40%, #0f2027 100%);
}

.bg-rain::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: linear-gradient(
    120deg,
    transparent 30%,
    rgb(255 255 255 / 8%) 50%,
    transparent 70%
  );
  animation: rainGlow 6s linear infinite;
}

/* 雪天：清新冷调蓝白 */
.bg-snow {
  background: linear-gradient(135deg, #e0f6ff 0%, #c0e8f9 40%, #a8d8ea 100%);
}

.bg-snow::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background-image: radial-gradient(
    rgb(255 255 255 / 25%) 1px,
    transparent 1px
  );
  background-size: 6px 6px;
  opacity: 0.25;
  animation: snowNoise 20s linear infinite;
}

/* 多云：柔和灰蓝 */
.bg-cloudy {
  background: linear-gradient(135deg, #89a8c2 0%, #a8c6d9 40%, #d0e0ed 100%);
}

.bg-cloudy::after {
  position: absolute;
  inset: -30%;
  pointer-events: none;
  content: '';
  background: radial-gradient(
    ellipse at 50% 50%,
    rgb(255 255 255 / 25%) 0%,
    transparent 60%
  );
  animation: cloudMove 40s linear infinite;
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

.bg-mist::after {
  position: absolute;
  inset: -20%;
  pointer-events: none;
  content: '';
  background: linear-gradient(
    90deg,
    transparent,
    rgb(255 255 255 / 25%),
    transparent
  );
  animation: mistFlow 25s ease-in-out infinite;
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
} /* stylelint-disable-next-line keyframes-name-pattern */
</style>
