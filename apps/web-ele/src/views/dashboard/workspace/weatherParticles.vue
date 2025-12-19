<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  type: 'fog' | 'none' | 'rain' | 'snow';
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let animationId = 0;
let width = 0;
let height = 0;

class Particle {
  opacity: number = 1;
  rotation: number = 0; // 雪花旋转
  rotationSpeed: number = 0;
  size: number = 1;
  speedX: number = 0; // 横向漂移
  speedY: number = 1;
  x: number = 0;
  y: number = 0;

  reset() {
    this.x = Math.random() * width;
    this.y = -10;
    this.opacity = Math.random() * 0.5 + 0.5;
    this.rotation = Math.random() * Math.PI * 2;
  }
}

function resizeCanvas() {
  if (!canvas.value) return;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.value.width = width;
  canvas.value.height = height;
}

function initParticles() {
  if (!canvas.value) return;
  ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  resizeCanvas();

  particles = [];
  const count = props.type === 'snow' ? 150 : (props.type === 'rain' ? 120 : 60);

  for (let i = 0; i < count; i++) {
    const p = new Particle();
    p.reset();

    switch (props.type) {
      case 'fog': {
        p.size = Math.random() * 30 + 20;
        p.speedY = Math.random() * 0.5 + 0.2;
        p.speedX = Math.random() * 1 - 0.5;

        break;
      }
      case 'rain': {
        p.size = Math.random() * 2 + 1;
        p.speedY = Math.random() * 15 + 10;
        p.speedX = Math.random() * 8 + 4; // 雨倾斜

        break;
      }
      case 'snow': {
        p.size = Math.random() * 4 + 2;
        p.speedY = Math.random() * 2 + 1;
        p.speedX = Math.random() * 2 - 1; // 轻微左右
        p.rotationSpeed = Math.random() * 0.02 - 0.01;

        break;
      }
      // No default
    }

    particles.push(p);
  }
}

function draw() {
  if (!ctx || !canvas.value) return;
  ctx.clearRect(0, 0, width, height);

  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.opacity;

    switch (props.type) {
      case 'fog': {
        // 雾气大模糊圆点
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        break;
      }
      case 'rain': {
        // 雨滴拖尾线
        ctx.strokeStyle = '#64b5f6';
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.speedX * 3, p.y + p.speedY * 3);
        ctx.stroke();

        break;
      }
      case 'snow': {
        // 雪花圆点 + 轻微发光
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#e3f2fd';
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.rotation += p.rotationSpeed;

        break;
      }
      // No default
    }

    ctx.restore();

    // 更新位置
    p.y += p.speedY;
    p.x += p.speedX;

    if (p.y > height) {
      p.reset();
    }
  }

  animationId = requestAnimationFrame(draw);
}

function startAnimation() {
  cancelAnimationFrame(animationId);
  if (props.type !== 'none') {
    initParticles();
    draw();
  }
}

watch(() => props.type, startAnimation, { immediate: true });

onMounted(() => {
  window.addEventListener('resize', resizeCanvas);
  startAnimation();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', resizeCanvas);
});
</script>

<template>
  <canvas ref="canvas" class="particle-layer"></canvas>
</template>

<style scoped>
.particle-layer {
  position: fixed;

  /* 改成 fixed 更沉浸 */
  top: 0;
  left: 0;
  z-index: 0;

  /* 放在背景之上，内容之下 */
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}
</style>
