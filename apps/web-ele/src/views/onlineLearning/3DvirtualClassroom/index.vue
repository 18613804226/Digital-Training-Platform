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

// 用户数据（可扩展为响应式）
const users = [
  { name: '张三', x: 2.5, y: 1, z: 0, avatar: '🧑' },
  { name: '李四', x: -2.5, y: 1, z: 0, avatar: '👩' },
  { name: '王五', x: 0, y: 1, z: 2.5, avatar: '👨' },
  { name: '赵老师', x: 0, y: 1, z: -7, avatar: '👩‍🏫' },
];

onMounted(() => {
  init();
  animate();
});

onUnmounted(() => {
  if (renderer) renderer.dispose();
  if (labelRenderer?.domElement && container.value) {
    labelRenderer.domElement.remove();
  }
  window.removeEventListener('resize', onWindowResize);
  if (controls) controls.dispose?.();
});

const init = () => {
  // ====== 场景 ======
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0_f8_ff); // AliceBlue
  scene.fog = new THREE.Fog(0xf0_f8_ff, 20, 40); // 添加雾效增强深度感

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
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 防止高分屏过载
  renderer.shadowMap.enabled = true; // 启用阴影
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 柔和阴影
  container.value?.append(renderer.domElement);

  // ====== CSS2D 渲染器 ======
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none'; // 允许穿透点击
  container.value?.append(labelRenderer.domElement);

  // ====== 控制器 ======
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.1; // 限制俯视角度
  controls.minDistance = 5;
  controls.maxDistance = 30;

  // ====== 光源 ======
  const ambientLight = new THREE.AmbientLight(0xff_ff_ff, 0.4);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xff_ff_ff, 0.8);
  mainLight.position.set(10, 20, 10);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 1024;
  mainLight.shadow.mapSize.height = 1024;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 50;
  mainLight.shadow.camera.left = -20;
  mainLight.shadow.camera.right = 20;
  mainLight.shadow.camera.top = 20;
  mainLight.shadow.camera.bottom = -20;
  scene.add(mainLight);

  // 环境光补充（模拟天窗）
  const hemiLight = new THREE.HemisphereLight(0x80_de_ea, 0x30_30_30, 0.3);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  // ====== 教室构建 ======
  buildClassroom();

  // ====== 添加用户 ======
  users.forEach((user) =>
    addUser(user.name, user.x, user.y, user.z, user.avatar),
  );

  // ====== 窗口监听 ======
  window.addEventListener('resize', onWindowResize);
};

const buildClassroom = () => {
  // === 地板 ===
  const floorTexture = new THREE.TextureLoader().load(
    'https://threejs.org/examples/textures/hardwood2_diffuse.jpg',
  );
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(10, 10);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 20),
    new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.8 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // === 墙壁 ===
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf5_f5_f5,
    roughness: 0.7,
  });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), wallMat);
  backWall.position.set(0, 5, -10);
  backWall.receiveShadow = true;
  scene.add(backWall);

  // === 黑板 ===
  const blackboard = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 4),
    new THREE.MeshStandardMaterial({ color: 0x0a_0a_0a, roughness: 0.3 }),
  );
  blackboard.position.set(0, 6, -9.9);
  scene.add(blackboard);

  // === 讲台 ===
  const podium = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x8b_45_13, roughness: 0.6 }),
  );
  podium.position.set(0, 0.5, -8);
  podium.castShadow = true;
  scene.add(podium);

  // === 课桌 ===
  for (let row = 0; row < 3; row++) {
    for (let col = -2; col <= 2; col++) {
      if (col === 0 && row === 2) continue; // 过道
      const desk = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.8, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xd2_b4_8c, roughness: 0.7 }),
      );
      desk.position.set(col * 2.5, 0.4, row * 2.5);
      desk.castShadow = true;
      scene.add(desk);

      // 椅子（小方块）
      const chair = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.8, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x8b_45_13 }),
      );
      chair.position.set(col * 2.5, 0.4, row * 2.5 + 0.5);
      chair.castShadow = true;
      scene.add(chair);
    }
  }

  // === 窗户（左墙）===
  const windowGeo = new THREE.PlaneGeometry(6, 4);
  const windowMat = new THREE.MeshBasicMaterial({
    color: 0xad_d8_e6,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  const windowMesh = new THREE.Mesh(windowGeo, windowMat);
  windowMesh.position.set(-15, 5, 0);
  windowMesh.rotation.y = Math.PI / 2;
  scene.add(windowMesh);

  // === 投影仪（天花板）===
  const projector = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.2, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x33_33_33 }),
  );
  projector.position.set(0, 9.8, -2);
  scene.add(projector);

  // === 绿植 ===
  const plantGeo = new THREE.ConeGeometry(0.5, 2, 8);
  const plantMat = new THREE.MeshStandardMaterial({ color: 0x2e_8b_57 });
  const plant = new THREE.Mesh(plantGeo, plantMat);
  plant.position.set(7, 1, 8);
  plant.castShadow = true;
  scene.add(plant);

  // === 时钟 ===
  const clockGroup = new THREE.Group();
  const clockFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.8, 32),
    new THREE.MeshStandardMaterial({ color: 0xff_ff_ff }),
  );
  const clockBorder = new THREE.Mesh(
    new THREE.RingGeometry(0.8, 0.85, 32),
    new THREE.MeshStandardMaterial({ color: 0x00_00_00 }),
  );
  clockGroup.add(clockFace, clockBorder);
  clockGroup.position.set(12, 7, -10);
  scene.add(clockGroup);
};

const addUser = (
  name: string,
  x: number,
  y: number,
  z: number,
  emoji: string = '👤',
) => {
  // 使用 emoji 作为头像（更生动）
  const div = document.createElement('div');
  div.className = 'user-avatar';
  div.textContent = emoji;
  div.style.fontSize = '24px';
  div.style.pointerEvents = 'auto'; // 允许 hover
  div.style.cursor = 'pointer';
  div.style.transition = 'transform 0.2s, filter 0.2s';

  // 悬停效果
  div.addEventListener('mouseenter', () => {
    div.style.transform = 'scale(1.3)';
    div.style.filter = 'drop-shadow(0 0 8px rgba(255,255,255,0.8))';
  });
  div.addEventListener('mouseleave', () => {
    div.style.transform = 'scale(1)';
    div.style.filter = 'none';
  });

  const label = new CSS2DObject(div);
  label.position.set(0, 1.2, 0);

  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.add(label);
  scene.add(group);
};

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
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
  background: #f0f8ff;
}

/* 可选：全局样式（如果未被 scoped 覆盖） */
.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgb(0 0 0 / 20%);
  border-radius: 50%;
  backdrop-filter: blur(2px);
}
</style>
