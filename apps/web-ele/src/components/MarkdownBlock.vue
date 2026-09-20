<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import DOMPurify from 'dompurify';
import { marked } from 'marked';

// Props & emits
const props = defineProps<{
  modelValue: string;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// Local state
const localContent = ref(props.modelValue);

// 安全渲染 Markdown → HTML 并净化
const safeRendered = computed(() => {
  try {
    const html = marked.parse(localContent.value || '', {
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // 转换 \n 为 <br>
      smartypants: true, // 智能引号等
    });
    // 防 XSS：只允许安全标签
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'strong',
        'em',
        'del',
        'code',
        'pre',
        'ul',
        'ol',
        'li',
        'blockquote',
        'hr',
        'a',
        'br',
      ],
      ALLOWED_ATTR: ['href', 'target'],
    });
  } catch (error) {
    console.warn('Markdown render error:', error);
    return '<p class="text-red-500">Invalid Markdown</p>';
  }
});

// 同步到父组件
watch(localContent, (val) => {
  emit('update:modelValue', val);
});

// 监听外部更新（如表单重置）
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== localContent.value) {
      localContent.value = newVal;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
    <!-- 编辑区域 -->
    <div class="flex flex-col">
      <label class="mb-1 text-xs text-gray-500">Edit (Markdown)</label>
      <textarea
        v-model="localContent"
        class="min-h-[120px] w-full resize-none rounded border p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Write in Markdown&#10;&#10;Examples:&#10;## Heading&#10;**bold** _italic_&#10;- list item&#10;```js&#10;console.log('code');&#10;```"
      ></textarea>
    </div>

    <!-- 预览区域 -->
    <div class="flex flex-col">
      <label class="mb-1 text-xs text-gray-500">Preview</label>
      <div
        class="prose prose-sm min-h-[120px] max-w-none overflow-auto rounded border p-3"
        v-html="safeRendered"
      ></div>
    </div>
  </div>
</template>

<style scoped>
/* 确保代码块有背景 */
:deep(.prose pre) {
  padding: 0.75rem;
  overflow-x: auto;
  background-color: #f8fafc;
  border-radius: 0.375rem;
}

:deep(.prose code:not(.prose pre code)) {
  padding: 0.2rem 0.4rem;
  font-size: 0.875em;
  background-color: #f1f5f9;
  border-radius: 0.25rem;
}

:deep(.prose a) {
  color: #3b82f6;
  text-decoration: underline;
}
</style>
