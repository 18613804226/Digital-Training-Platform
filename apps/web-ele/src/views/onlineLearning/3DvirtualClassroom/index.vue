<!-- src/views/vr/StaticClassroom.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  CSS2DObject,
  CSS2DRenderer,
} from 'three/examples/jsm/renderers/CSS2DRenderer';

const container = ref<HTMLDivElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let labelRenderer: CSS2DRenderer;
let controls: OrbitControls;

onMounted(() => {
  init();
  animate();
});

onUnmounted(() => {
  // 清理 WebGL 渲染器
  if (renderer) {
    renderer.dispose();
  }

  // 清理 CSS2D 渲染器的 DOM 元素
  if (labelRenderer && labelRenderer.domElement && container.value) {
    labelRenderer.domElement.remove();
  }

  // 移除窗口缩放监听
  window.removeEventListener('resize', onWindowResize);

  // 清理控制器
  if (controls) {
    controls.dispose?.(); // 控制器有 dispose 方法
  }
});

const init = () => {
  // ====== 场景 ======
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0_f8_ff); // 淡蓝色背景

  // ====== 相机 ======
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 8, 15);
  camera.lookAt(0, 0, 0);

  // ====== 渲染器 ======
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value?.append(renderer.domElement);

  // ====== 标签渲染器（用于显示用户名字）======
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  container.value?.append(labelRenderer.domElement);

  // ====== 控制器 ======
  controls = new OrbitControls(camera, labelRenderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // ====== 光源 ======
  const ambientLight = new THREE.AmbientLight(0xff_ff_ff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xff_ff_ff, 0.8);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // ====== 创建教室（用基础几何体）======

  // 地板
  const floorGeometry = new THREE.PlaneGeometry(30, 20);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x5a_8f_4e });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // 墙壁（后墙）
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 10),
    new THREE.MeshStandardMaterial({ color: 0xd3_d3_d3 }),
  );
  backWall.position.set(0, 5, -10);
  backWall.receiveShadow = true;
  scene.add(backWall);

  // 黑板
  const blackboard = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 4),
    new THREE.MeshStandardMaterial({ color: 0x0a_0a_0a }),
  );
  blackboard.position.set(0, 6, -9.9);
  scene.add(blackboard);

  // 讲台
  const podium = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x8b_45_13 }),
  );
  podium.position.set(0, 0.5, -8);
  podium.castShadow = true;
  scene.add(podium);

  // 学生课桌（简单方块）
  const deskColor = 0xde_b8_87;
  for (let row = 0; row < 3; row++) {
    for (let col = -2; col <= 2; col++) {
      if (col === 0 && row === 2) continue; // 留出过道
      const desk = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.8, 0.6),
        new THREE.MeshStandardMaterial({ color: deskColor }),
      );
      desk.position.set(col * 2.5, 0.4, row * 2.5);
      desk.castShadow = true;
      scene.add(desk);
    }
  }

  // ====== 添加用户头像 ======
  addUser('张三', 2.5, 1, 0);
  addUser('李四', -2.5, 1, 0);
  addUser('王五', 0, 1, 2.5);
  addUser('老师', 0, 1, -7); // 老师在讲台旁

  // ====== 窗口缩放适配 ======
  window.addEventListener('resize', onWindowResize);
};

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
};

const addUser = (name: string, x: number, y: number, z: number) => {
  // 头像球
  const geometry = new THREE.SphereGeometry(0.6, 16, 16);
  const material = new THREE.MeshStandardMaterial({
    color: Math.random() * 0xff_ff_ff,
    roughness: 0.3,
    metalness: 0.1,
  });
  const avatar = new THREE.Mesh(geometry, material);
  avatar.position.set(x, y, z);
  avatar.castShadow = true;
  scene.add(avatar);

  // 名字标签（使用 CSS2DObject）
  const div = document.createElement('div');
  div.className = 'user-label';
  div.textContent = name;
  div.style.color = '#fff';
  div.style.fontSize = '14px';
  div.style.fontWeight = 'bold';
  div.style.textShadow = '1px 1px 2px #000';
  div.style.pointerEvents = 'none';

  const label = new CSS2DObject(div);
  label.position.set(0, 1.2, 0); // 在头像上方
  avatar.add(label);
};

const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
};
</script>

<template>
  <div ref="container" class="classroom-container"></div>
</template>

<style scoped>
.classroom-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* 用户标签样式 */
.user-label {
  /* 已在 JS 中设置，此处可补充 */
}
</style>
