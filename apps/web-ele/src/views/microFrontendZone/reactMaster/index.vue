<script setup lang="ts">
import WujieVue from 'wujie-vue3';

// console.log(import.meta.env.VITE_REACT_SUB_APP_ADDRESS);

const subAppUrl = import.meta.env.VITE_REACT_SUB_APP_ADDRESS; // React 子应用开发地址

const handleBeforeLoad = () => {
  console.log('子应用开始加载');
};

const handleAfterLoad = () => {
  loading.value = false;
  console.log('子应用加载完成');
};
</script>

<template>
  <div class="micro-app-container">
    <WujieVue
      width="100%"
      height="100%"
      name="react-course"
      :url="subAppUrl"
      :sync="true"
    />
  </div>
</template>

<style scoped>
.micro-app-container {
  width: 100%;
  height: calc(100vh - 88px);

  /* 减去 Vben 的 header 高度 */
  overflow: auto;
}
</style>
