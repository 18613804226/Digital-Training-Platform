<script lang="ts" setup>
import { ref, watch } from 'vue';

import { cn } from '@vben-core/shared/utils';

interface Props {
  class?: string;
  /**
   * @zh_CN 最小加载时间
   * @en_US Minimum loading time
   */
  minLoadingTime?: number;
  /**
   * @zh_CN loading状态开启
   */
  spinning?: boolean;
}

defineOptions({
  name: 'VbenSpinner',
});

const props = withDefaults(defineProps<Props>(), {
  minLoadingTime: 50,
});
// const startTime = ref(0);
const showSpinner = ref(false);
const renderSpinner = ref(false);
const timer = ref<ReturnType<typeof setTimeout>>();

watch(
  () => props.spinning,
  (show) => {
    if (!show) {
      showSpinner.value = false;
      clearTimeout(timer.value);
      return;
    }

    // startTime.value = performance.now();
    timer.value = setTimeout(() => {
      // const loadingTime = performance.now() - startTime.value;

      showSpinner.value = true;
      if (showSpinner.value) {
        renderSpinner.value = true;
      }
    }, props.minLoadingTime);
  },
  {
    immediate: true,
  },
);

function onTransitionEnd() {
  if (!showSpinner.value) {
    renderSpinner.value = false;
  }
}
</script>

<template>
  <div
    :class="
      cn(
        'flex-center absolute left-0 top-0 z-100 size-full bg-overlay-content backdrop-blur-sm transition-all duration-500',
        {
          'invisible opacity-0': !showSpinner,
        },
        props.class,
      )
    "
    @transitionend="onTransitionEnd"
  >
    <div
      :class="{ paused: !renderSpinner }"
      v-if="renderSpinner"
      class="loader relative size-12 before:absolute before:left-0 before:top-[60px] before:h-[5px] before:w-12 before:rounded-[50%] before:content-[''] after:absolute after:left-0 after:top-0 after:h-full after:w-full after:rounded after:bg-primary after:content-['']"
    ></div>
  </div>
</template>

<style scoped>
.paused {
  &::before {
    animation-play-state: paused !important;
  }

  &::after {
    animation-play-state: paused !important;
  }
}

.loader {
  &::after {
    background: linear-gradient(
      135deg,
      hsl(210deg 100% 50%),
      hsl(240deg 100% 50%)
    );
    border-radius: 10px;
    box-shadow:
      0 0 20px rgb(0 255 255 / 50%),
      inset 0 0 20px rgb(0 255 255 / 50%);

    /* 渐变色 */
    animation:
      jump-ani 1s cubic-bezier(0.55, 0.09, 0.68, 0.53) infinite,
      rotate-ani 4s linear infinite,
      color-shift 3s ease-in-out infinite alternate;
  }
}

@keyframes rotate-ani {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes color-shift {
  0% {
    background: linear-gradient(
      135deg,
      hsl(210deg 100% 50%),
      hsl(240deg 100% 50%)
    );
  }

  50% {
    background: linear-gradient(
      135deg,
      hsl(180deg 100% 50%),
      hsl(270deg 100% 50%)
    );
  }

  100% {
    background: linear-gradient(
      135deg,
      hsl(210deg 100% 50%),
      hsl(240deg 100% 50%)
    );
  }
}

@keyframes jump-ani {
  15% {
    border-bottom-right-radius: 3px;
  }

  25% {
    transform: translateY(9px) rotate(22.5deg);
  }

  50% {
    border-bottom-right-radius: 40px;
    transform: translateY(18px) scale(1, 0.9) rotate(45deg);
  }

  75% {
    transform: translateY(9px) rotate(67.5deg);
  }

  100% {
    transform: translateY(0) rotate(90deg);
  }
}

@keyframes loader-jump-ani {
  15% {
    border-bottom-right-radius: 3px;
  }

  25% {
    transform: translateY(9px) rotate(22.5deg);
  }

  50% {
    border-bottom-right-radius: 40px;
    transform: translateY(18px) scale(1, 0.9) rotate(45deg);
  }

  75% {
    transform: translateY(9px) rotate(67.5deg);
  }

  100% {
    transform: translateY(0) rotate(90deg);
  }
}

@keyframes loader-shadow-ani {
  0%,
  100% {
    transform: scale(1, 1);
  }

  50% {
    transform: scale(1.2, 1);
  }
}
</style>
