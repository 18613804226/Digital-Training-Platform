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
  rotation: number = 0;
  rotationSpeed: number = 0;
  size: number = 1;
  speedX: number = 0;
  speedY: number = 1;
  x: number = 0;
  y: number = 0;

  reset() {
    this.x = Math.random() * width;
    this.y = -10;
    this.opacity = Math.random() * 0.4 + 0.3; // 更透明一些
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
  const count = props.type === 'snow' ? 150 : props.type === 'rain' ? 180 : 60; // 雨粒子更多，显得更密更细腻

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
        // 温柔细雨调整
        p.size = Math.random() * 1 + 0.4; // 雨滴极细（原来是1~3）
        p.speedY = Math.random() * 4 + 5; // 下降速度慢很多（原来10~25）
        p.speedX = Math.random() * 2 - 1; // 倾斜度大幅减小，几乎垂直（原来4~12）
        p.opacity = Math.random() * 0.5 + 0.2; // 更透明
        break;
      }
      case 'snow': {
        p.size = Math.random() * 4 + 2;
        p.speedY = Math.random() * 2 + 1;
        p.speedX = Math.random() * 2 - 1;
        p.rotationSpeed = Math.random() * 0.02 - 0.01;
        break;
      }
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
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'rain': {
        // 深邃诗意雨：深蓝灰色 + 修长雨丝 + 柔和圆头
        ctx.strokeStyle = 'rgba(100, 130, 170, 0.75)'; // 深蓝灰色，增加神秘沉静感（可调透明度最后一位）
        // 或者更冷调： 'rgba(120, 140, 180, 0.7)'
        // 或者偏夜雨黑蓝： 'rgba(80, 100, 140, 0.8)'
        ctx.lineWidth = p.size; // 保持细线
        ctx.lineCap = 'round'; // 雨丝两端圆润，更柔和
        ctx.globalAlpha = p.opacity; // 确保每根雨丝透明度独立（已有的）
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        // 关键：拖尾长度决定视觉速度和意境感
        const trailLength = 2; // 推荐 4~6，雨丝修长优雅，增强纵深和朦胧感
        ctx.lineTo(p.x + p.speedX * trailLength, p.y + p.speedY * trailLength);

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
  top: 0;
  left: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}
</style>
