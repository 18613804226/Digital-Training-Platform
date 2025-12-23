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
let dpr = window.devicePixelRatio || 1;

class Particle {
  opacity = 1;
  rotation = 0;
  rotationSpeed = 0;
  size = 1;
  speedX = 0;
  speedY = 1;
  x = 0;
  y = 0;

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * -height;
    this.opacity = Math.random() * 0.4 + 0.4;
    this.rotation = Math.random() * Math.PI * 2;
  }
}

function resizeCanvas() {
  if (!canvas.value) return;
  dpr = window.devicePixelRatio || 1;

  width = window.innerWidth;
  height = window.innerHeight;

  canvas.value.width = width * dpr;
  canvas.value.height = height * dpr;
  canvas.value.style.width = `${width}px`;
  canvas.value.style.height = `${height}px`;

  ctx = canvas.value.getContext('2d');
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  if (props.type !== 'none') {
    initParticles();
  }
}

function initParticles() {
  if (!ctx) return;
  particles = [];

  const count =
    props.type === 'rain'
      ? 220
      : props.type === 'snow'
        ? 160
        : // eslint-disable-next-line unicorn/no-nested-ternary
          props.type === 'fog'
          ? 60
          : 0;

  for (let i = 0; i < count; i++) {
    const p = new Particle();
    p.reset();

    switch (props.type) {
      case 'fog': {
        p.size = Math.random() * 40 + 30;
        p.speedY = Math.random() * 0.3 + 0.1;
        p.speedX = Math.random() * 0.6 - 0.3;
        p.opacity = Math.random() * 0.15 + 0.08;
        break;
      }

      case 'rain': {
        p.size = Math.random() * 1 + 0.6;
        p.speedY = Math.random() * 4 + 4;
        p.speedX = Math.random() * 1 - 0.5;
        p.opacity = Math.random() * 0.4 + 0.4;
        break;
      }

      case 'snow': {
        p.size = Math.random() * 3 + 2;
        p.speedY = Math.random() * 1.5 + 0.6;
        p.speedX = Math.random() * 1 - 0.5;
        p.rotationSpeed = Math.random() * 0.02 - 0.01;
        p.opacity = Math.random() * 0.5 + 0.5;
        break;
      }
    }

    particles.push(p);
  }
}

function draw() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.opacity;

    switch (props.type) {
      case 'fog': {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'rain': {
        ctx.strokeStyle = 'rgba(180, 200, 230, 0.9)';
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';
        const trail = 6;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.speedX * trail, p.y + p.speedY * trail);
        ctx.stroke();
        break;
      }

      case 'snow': {
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
    }

    ctx.restore();

    p.x += p.speedX;
    p.y += p.speedY;

    if (p.y > height || p.x < -50 || p.x > width + 50) {
      p.reset();
    }
  }

  animationId = requestAnimationFrame(draw);
}

function start() {
  cancelAnimationFrame(animationId);
  if (props.type !== 'none') {
    initParticles();
    draw();
  }
}

watch(() => props.type, start, { immediate: true });

onMounted(() => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  start();
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
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
</style>
