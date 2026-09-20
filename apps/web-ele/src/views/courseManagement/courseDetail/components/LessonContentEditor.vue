<script setup lang="ts">
import { ref, watch } from 'vue';

import CodePreview from '@/components/CodePreview.vue';
import MarkdownBlock from '@/components/MarkdownBlock.vue';
// Element Plus 图标
import { Close, Delete, Document, Upload } from '@element-plus/icons-vue';
import {
  ElAlert,
  ElButton,
  ElCard,
  ElCol,
  ElIcon,
  ElInput,
  ElMessage,
  ElRow,
  ElUpload,
} from 'element-plus';

import { uploadFileApi } from '#/api';

interface ContentBlock {
  id: string;
  type: 'code' | 'document' | 'text' | 'video';
  content: string; // 👈 统一存储：文本、代码、JSON 文件列表等
  url?: string;
  uploadStatus?: 'error' | 'idle' | 'uploading';
}

const props = defineProps<{ value?: ContentBlock[] }>();
const emit = defineEmits<{ (e: 'update:value', v: ContentBlock[]): void }>();

const blocks = ref<ContentBlock[]>([]);
const isExternalUpdate = ref(false);

// 1️⃣ 同步父组件值（外部更新）
watch(
  () => props.value,
  (v) => {
    if (!v) {
      blocks.value = [];
      return;
    }
    isExternalUpdate.value = true;
    blocks.value = [...v]; // 浅拷贝，保留对象响应性
  },
  { immediate: true },
);

// 2️⃣ 内部变化通知父组件
// watch(
//   blocks,
//   (newVal) => {
//     if (isExternalUpdate.value) {
//       isExternalUpdate.value = false;
//       return;
//     }
//     emit('update:value', newVal);
//   },
//   { deep: true }
// );

// const getEditedBlocks = () => blocks.value;
// 3️⃣ 增删块
const addBlock = (type: ContentBlock['type']) => {
  blocks.value = [
    ...blocks.value,
    {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? '<p></p>' : '',
      url: '',
    },
  ];
  emit('update:value', [...blocks.value]);
};

const removeBlock = (id: string) => {
  blocks.value = blocks.value.filter((b) => b.id !== id);
  emit('update:value', [...blocks.value]);
};

// 视频处理
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

// ✅ 解析 document 的 content 为文件列表
const parseFiles = (block: ContentBlock) => {
  if (!block.content || block.content === 'uploading') return [];
  try {
    const parsed = JSON.parse(block.content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn('Invalid content JSON:', block.content);
    return [];
  }
};

// 文档上传处理
const handleFileUpload = async (rawFile: any, block: ContentBlock) => {
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

  const file = rawFile.raw;
  if (!file) {
    ElMessage.warning('未选择文件');
    return;
  }

  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('Unsupported file type');
    return false;
  }

  // 设置上传中状态
  // block.content = 'uploading';
  // block.uploadStatus = 'uploading';

  try {
    const res = await uploadFileApi({ file });
    if (!res.success) throw new Error('Upload failed');

    // 获取当前文件列表（可能为空）
    const files = parseFiles(block);
    files.push({
      name: file.name, // ✅ 使用 file.name
      url: res.url,
    });

    // 序列化回 content
    block.content = JSON.stringify(files);
    // block.uploadStatus = 'idle';
    emit('update:value', [...blocks.value]);
    ElMessage.success('Upload success');
    return true;
  } catch (error) {
    console.error('Upload error:', error);
    ElMessage.error('Failed to upload document');
    block.content = '';
    // block.uploadStatus = 'error';
    return false;
  }
};

// 删除文件
const removeFile = (block: ContentBlock, index: number) => {
  const files = parseFiles(block);
  if (index >= 0 && index < files.length) {
    files.splice(index, 1);
    block.content = files.length > 0 ? JSON.stringify(files) : '';
  }
};
async function downloadDocument(url: string, name: string) {
  const fullUrl = import.meta.env.VITE_BASE_API + url;
  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = name;
    document.body.append(link);
    link.click();

    link.remove();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- 内容块列表 -->
    <ElCard v-for="block in blocks" :key="block.id" shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium capitalize">{{ block.type }}</span>
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
        <!-- 上传区域 -->
        <ElUpload
          :auto-upload="false"
          :show-file-list="false"
          :on-change="
            (uploadFile) =>
              uploadFile?.raw && handleFileUpload(uploadFile, block)
          "
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

        <!-- 已上传文件列表 -->
        <div v-if="parseFiles(block).length > 0" class="mt-3 space-y-2">
          <div
            v-for="(file, index) in parseFiles(block)"
            :key="index"
            class="flex items-center gap-2 py-1"
          >
            <ElIcon :size="16" class="text-blue-500">
              <Document />
            </ElIcon>
            <a
              @click="downloadDocument(file.url, file.name)"
              target="_blank"
              class="max-w-[200px] cursor-pointer truncate text-sm text-blue-600 hover:underline md:max-w-none"
              :title="file.name"
            >
              {{ file.name }}
            </a>
            <ElButton
              type="text"
              size="small"
              @click="removeFile(block, index)"
              class="ml-auto text-gray-500 hover:text-red-500"
            >
              <ElIcon>
                <Close />
              </ElIcon>
            </ElButton>
          </div>
        </div>
      </div>
    </ElCard>

    <!-- 添加按钮 -->
    <div class="flex flex-wrap justify-end gap-2 pt-2">
      <ElButton type="primary" @click="addBlock('text')">+ Text</ElButton>
      <ElButton type="success" @click="addBlock('video')">+ Video</ElButton>
      <ElButton type="warning" @click="addBlock('code')">+ Code</ElButton>
      <ElButton type="info" @click="addBlock('document')">+ Document</ElButton>
    </div>
  </div>
</template>

<style scoped>
.document-upload :deep(.el-upload-dragger) {
  height: 120px;
  padding: 16px;
}
</style>
