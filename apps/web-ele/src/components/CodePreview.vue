<!-- src/components/CodePreview.vue -->
<script setup lang="ts">
import { computed } from 'vue';

import hljs from 'highlight.js/lib/core';
import css from 'highlight.js/lib/languages/css';
// 按需引入语言（避免打包过大）
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml'; // xml = HTML

const props = defineProps<{ code: string; language?: string }>();
// 注册语言
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('html', html);
hljs.registerLanguage('css', css);

const highlightedCode = computed(() => {
  const lang = props.language || 'plaintext';
  try {
    if (lang === 'plaintext') {
      return hljs.highlightAuto(props.code).value;
    }
    return hljs.highlight(props.code, { language: lang }).value;
  } catch {
    return hljs.highlightAuto(props.code).value;
  }
});
</script>

<template>
  <pre><code v-html="highlightedCode" class="hljs"></code></pre>
</template>

<style>
@import 'highlight.js/styles/github-dark.css';

/* 或 github.css / stackoverflow-light.css */
.hljs {
  padding: 1rem !important;
  font-size: 0.875rem;
  line-height: 1.5;
  background: #1e1e1e !important;
  border-radius: 0.5rem;
}
</style>
