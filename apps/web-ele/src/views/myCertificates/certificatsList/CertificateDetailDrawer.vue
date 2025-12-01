<!-- src/views/cert/modal/CertificateDetailDrawer.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import { ElMessage } from 'element-plus';

import { downloadCertificatePdf } from '#/api';

const props = defineProps<{
  data?: any;
}>();

const emit = defineEmits(['update:modelValue', 'confirm']);

const [Drawer, drawerApi] = useVbenDrawer({
  onOpened: opened,
  onClosed: closed,
});

// const userStore = useUserStore();
// const isAdmin = computed(() => userStore.userInfo?.role === 'ADMIN');

// const visible = computed({
//   get: () => props.modelValue,
//   set: (val) => emit('update:modelValue', val),
// });

const data = computed(() => props.data);

const previewHtml = computed(() => {
  if (!data.value) return '';
  return `
    <div style="font-family: 'STKaiti', serif; text-align: center;">
      <h2>结业证书</h2>
      <p>兹证明 <strong>${data.value.username}</strong> 已完成...</p>
      <p>颁发日期：${data.value.createdAt?.split('T')[0]}</p>
    </div>
  `;
});

async function downloadPdf() {
  // 调用后端接口：window.open(`/api/certificates/${data.value.id}/pdf`)
  // window.open(`/api/certificates/${data.value.id}/pdf`, '_blank');
  const id = data.value.id;
  try {
    const blob = await downloadCertificatePdf(id); // 已是 Blob
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error: any) {
    // 错误可能是：
    // - 网络错误（如 404、500）
    // - 后端返回了文本错误（如 "证书不存在"）
    console.error('下载失败:', error);
    // 可选：尝试读取错误文本
    if (error.response?.data instanceof Blob) {
      const text = await error.response.data.text();
      ElMessage.error(text || '下载失败');
    } else {
      ElMessage.error('证书下载失败，请稍后重试');
    }
  }
}

function onDelete() {
  emit('confirm', data.value);
  // visible.value = false;
}
const pdfUrl: any = ref();
const accessStore = useAccessStore().accessToken;
const loading = ref(false);
// 1. 注册打开事件的监听器
async function opened() {
  loading.value = true;

  // 2. 抽屉打开时才发起请求
  const BASE_URL = import.meta.env.VITE_GLOB_API_URL;
  const response = await fetch(
    `${BASE_URL}/certificates/${data.value.id}/pdf`,
    {
      headers: { Authorization: `Bearer ${accessStore}` },
    },
  );

  if (!response.ok) {
    throw new Error('PDF 获取失败');
  }

  const blob = await response.blob();
  pdfUrl.value = URL.createObjectURL(blob);
  loading.value = false;
}
// 👇 可选：关闭时释放 URL 避免内存泄漏
function closed() {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value);
    pdfUrl.value = null;
  }
}

onMounted(async () => {});
</script>

<template>
  <Drawer title="Certificate Details" :loading="loading">
    <div v-if="data" class="p-4">
      <!-- 证书预览区 -->
      <div class="rounded border p-4" style="min-height: 400px">
        <embed
          :src="pdfUrl"
          type="application/pdf"
          width="100%"
          height="480px"
          style="border: 1px solid #ddd"
        />
      </div>
      <!-- 操作按钮 -->
      <div class="mt-6 flex justify-end gap-2">
        <VbenButton @click="downloadPdf">Download PDF</VbenButton>
        <!-- <VbenButton v-if="isAdmin" type="danger" @click="onDelete">删除</VbenButton> -->
      </div>
      <!-- </ElDescriptions> -->
    </div>
  </Drawer>
</template>
