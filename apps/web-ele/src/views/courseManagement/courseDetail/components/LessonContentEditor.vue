<script setup lang="ts">
import { ref, watch } from 'vue';

import CodePreview from '@/components/CodePreview.vue';
import MarkdownBlock from '@/components/MarkdownBlock.vue';
// Element Plus 图标
import { Delete, Document, Upload } from '@element-plus/icons-vue';
import {
  ElAlert,
  ElButton,
  ElCard,
  ElCol,
  ElIcon,
  ElInput,
  ElMessage,
  ElRow,
  ElSkeleton,
  ElUpload,
} from 'element-plus';

interface ContentBlock {
  id: string;
  type: 'code' | 'document' | 'text' | 'video';
  content: string;
  url?: string;
  filename?: string;
}

const props = defineProps<{ value?: ContentBlock[] }>();
const emit = defineEmits<{ (e: 'update:value', v: ContentBlock[]): void }>();

const blocks = ref<ContentBlock[]>([]);
const isExternalUpdate = ref(false); // 👈 关键：区分外部 vs 内部变化

// 1️⃣ 同步父组件传入的值（外部更新）
watch(
  () => props.value,
  (v) => {
    if (!v) {
      blocks.value = [];
      return;
    }
    isExternalUpdate.value = true; // 标记：这次是外部触发
    blocks.value = JSON.parse(JSON.stringify(v)); // 深拷贝避免引用污染
  },
  { immediate: true },
);

// 2️⃣ 监听内部变化并通知父组件（仅当不是外部更新时）
watch(
  blocks,
  (newVal) => {
    if (isExternalUpdate.value) {
      isExternalUpdate.value = false; // 重置标志
      return; // ❌ 不要 emit，避免闭环
    }

    // ✅ 安全地向上同步
    const plain = JSON.parse(JSON.stringify(newVal));
    emit('update:value', plain);
  },
  { deep: true },
);

// 3️⃣ 修改方法：始终替换整个数组
const addBlock = (type: ContentBlock['type']) => {
  blocks.value = [
    ...blocks.value,
    {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? '<p></p>' : '',
      url: '',
      filename: undefined,
    },
  ];
};

const removeBlock = (id: string) => {
  blocks.value = blocks.value.filter((b) => b.id !== id);
};

// 视频 URL 处理
const isValidEmbedUrl = (url: string | undefined) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['youtube.com', 'youtu.be', 'vimeo.com'].some((domain) =>
      parsed.hostname.includes(domain),
    );
  } catch {
    return false;
  }
};

const getEmbedUrl = (url: string) => {
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

// 文档上传处理
const handleFileUpload = async (file: File, block: ContentBlock) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('Unsupported file type');
    return false;
  }

  try {
    block.content = 'uploading...';

    // TODO: 替换为你的真实上传接口
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();

    block.content = data.url;
    block.filename = file.name;
    return true;
  } catch (error) {
    console.error('Upload error:', error);
    ElMessage.error('Failed to upload document');
    block.content = '';
    return false;
  }
};
</script>

<template>
  <div class="space-y-4">
    <!-- 内容块列表 -->
    <ElCard v-for="block in blocks" :key="block.id" shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium capitalize">{{ block.type }}</span>
          <!-- 删除按钮：圆形危险色，带图标 -->
          <ElButton
            size="small"
            circle
            type="danger"
            @click.stop="removeBlock(block.id)"
          >
            <ElIcon>
              <Delete />
            </ElIcon>
          </ElButton>
        </div>
      </template>

      <!-- 文本块 -->
      <div v-if="block.type === 'text'" class="mt-1">
        <MarkdownBlock v-model="block.content" />
      </div>

      <!-- 视频块 -->
      <div v-else-if="block.type === 'video'" class="mt-2">
        <ElInput
          v-model="block.url"
          placeholder="Paste YouTube, Vimeo, or .mp4/.mov URL"
          clearable
          class="mb-2"
        />
        <div v-if="block.url" class="mt-2">
          <video
            v-if="block.url.endsWith('.mp4') || block.url.endsWith('.mov')"
            :src="block.url"
            controls
            class="w-full rounded"
            @error="block.url = ''"
          ></video>
          <iframe
            v-else-if="isValidEmbedUrl(block.url)"
            :src="getEmbedUrl(block.url)"
            class="aspect-video w-full rounded"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
          ></iframe>
          <ElAlert
            v-else
            type="error"
            show-icon
            title="Invalid URL"
            description="Use .mp4/.mov files or YouTube/Vimeo links only."
            class="mt-2"
          />
        </div>
      </div>

      <!-- 代码块 -->
      <div v-else-if="block.type === 'code'" class="mt-2">
        <ElRow :gutter="20">
          <ElCol :span="24" :md="12">
            <div class="mb-1 text-xs text-gray-500">Edit Code</div>
            <ElInput
              v-model="block.content"
              type="textarea"
              :rows="6"
              placeholder="Enter code example"
              class="font-mono text-sm"
            />
          </ElCol>
          <ElCol :span="24" :md="12" class="mt-4 md:mt-0">
            <div class="mb-1 text-xs text-gray-500">Preview</div>
            <div class="rounded bg-gray-800 p-3 text-white">
              <CodePreview :code="block.content" language="javascript" />
            </div>
          </ElCol>
        </ElRow>
      </div>

      <!-- 文档块 -->
      <div v-else-if="block.type === 'document'" class="mt-2">
        <ElUpload
          :auto-upload="false"
          :show-file-list="false"
          :onchange="(file: { raw: File }) => handleFileUpload(file.raw, block)"
          :drag="true"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.xls,.xlsx"
          class="document-upload"
        >
          <ElIcon class="text-gray-400" size="24">
            <Upload />
          </ElIcon>
          <div class="mt-2 text-sm text-gray-500">
            Drop files here or click to upload
          </div>
          <div class="mt-1 text-xs text-gray-400">
            Supports PDF, DOC, PPT, TXT, MD, XLS
          </div>
        </ElUpload>

        <div
          v-if="block.content && !block.content.startsWith('uploading')"
          class="mt-3 flex items-center gap-2"
        >
          <ElIcon :size="16" class="text-blue-500">
            <Document />
          </ElIcon>
          <a
            :href="block.content"
            target="_blank"
            class="max-w-[200px] truncate text-blue-600 hover:underline md:max-w-none"
            :title="block.filename || block.content"
          >
            {{ block.filename || 'Download Document' }}
          </a>
        </div>

        <ElSkeleton
          v-else-if="block.content?.startsWith('uploading')"
          :rows="1"
          animated
        />
      </div>
    </ElCard>

    <!-- 添加按钮区域 -->
    <div class="flex flex-wrap justify-center gap-2 pt-2">
      <ElButton type="primary" @click="addBlock('text')">+ Text</ElButton>
      <ElButton type="success" @click="addBlock('video')">+ Video</ElButton>
      <ElButton type="warning" @click="addBlock('code')">+ Code</ElButton>
      <ElButton type="info" @click="addBlock('document')">+ Document</ElButton>
    </div>
  </div>
</template>

<style scoped>
/* 可选：微调样式以匹配 Vben */
.el-card {
  border-radius: 8px;
}
</style>
