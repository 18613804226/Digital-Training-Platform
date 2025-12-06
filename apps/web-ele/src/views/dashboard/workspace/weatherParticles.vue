<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  type: 'fog' | 'none' | 'rain' | 'snow';
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let particles: any[] = [];
let animationId: number;

function initParticles() {
  if (!canvas.value) return;
  ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  canvas.value.width = window.innerWidth;
  canvas.value.height = window.innerHeight;

  particles = [];
  const count = props.type === 'snow' ? 120 : (props.type === 'rain' ? 100 : 80);

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.value.width,
      y: Math.random() * canvas.value.height,
      r: props.type === 'rain' ? Math.random() * 2 + 1 : Math.random() * 3 + 1, // 大小随机
      d: Math.random() * 2 + 0.5, // 下落速度随机
      opacity: Math.random() * 0.5 + 0.3, // 透明度随机
      trail: Math.random() * 15 + 5, // 雨滴拖尾长度
    });
  }
}

function draw() {
  if (!ctx || !canvas.value) return;
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  for (const p of particles) {
    if (props.type === 'rain') {
      ctx.strokeStyle = `rgba(0,150,255,${p.opacity})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + p.trail); // 拖尾效果
      ctx.stroke();
    } else {
      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
      ctx.fill();
    }
  }

  update();
  animationId = requestAnimationFrame(draw);
}

function update() {
  for (const p of particles) {
    p.y += p.d;
    if (p.y > canvas.value!.height) {
      p.y = 0;
      p.x = Math.random() * canvas.value!.width;
    }
  }
}

watch(
  () => props.type,
  (newType) => {
    cancelAnimationFrame(animationId);
    if (newType !== 'none') {
      initParticles();
      draw();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (props.type !== 'none') {
    initParticles();
    draw();
  }
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId);
});
</script>

<template>
  <!-- 粒子层覆盖在背景上 -->
  <canvas ref="canvas" class="particle-layer"></canvas>
</template>

<style scoped>
.particle-layer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}
</style>
