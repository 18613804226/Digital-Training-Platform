<script lang="ts" setup>
import { ref, watch } from 'vue';

import { useVbenForm, useVbenModal, z } from '@vben/common-ui';

import { createLessonApi, updateLessonApi } from '#/api';

import LessonContentEditor from './components/LessonContentEditor.vue';

interface ContentBlock {
  id: string;
  type: 'code' | 'text' | 'video';
  content: string;
  url?: string;
}

const props = defineProps<{ courseId: number; lessonData: any }>();
const emit = defineEmits<{ (e: 'confirm'): void }>();

// 手动管理 contentBlocks
const contentBlocks = ref<ContentBlock[]>([]);

// 表单只管 title 和 description
const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' }, labelWidth: 100 },
  layout: 'horizontal',
  scrollToFirstError: true,
  wrapperClass: 'grid-cols-1',
  schema: [
    {
      component: 'Input',
      fieldName: 'title',
      label: 'Lesson Name',
      componentProps: {
        placeholder: 'Please enter lesson name',
        maxlength: 100,
      },
      rules: z.string().min(1).max(100),
    },
    {
      component: 'Input',
      fieldName: 'description',
      label: 'Description',
      componentProps: {
        placeholder: 'Optional description',
        maxlength: 500,
      },
    },
    // ❌ 删除 contentBlocks 的 Custom 字段！
  ],
});

// 同步 contentBlocks 到 formApi，用于验证和 getValues()
watch(
  contentBlocks,
  (val) => {
    formApi.setFieldValue('contentBlocks', val);
  },
  { immediate: true },
);

// 初始化数据
async function initFormData() {
  let blocks: ContentBlock[] = [];
  if (props.lessonData.id) {
    const rawContent = props.lessonData.content;
    if (typeof rawContent === 'string') {
      try {
        blocks = JSON.parse(rawContent);
      } catch (error) {
        console.warn('Failed to parse lesson content as JSON', error);
        blocks = [];
      }
    } else if (Array.isArray(rawContent)) {
      blocks = rawContent;
    }
  }
  contentBlocks.value = blocks;
}

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  title: 'Add New Lesson',
  class: 'w-2/4',
  onConfirm,
  async onOpened() {
    if (props.lessonData.id) {
      modalApi.setState({ title: 'Edit Lesson' });
      await initFormData();
      formApi.setValues({
        title: props.lessonData.title || '',
        description: props.lessonData.description || '',
        // contentBlocks 由 watch 自动同步，这里可不设
      });
    } else {
      modalApi.setState({ title: 'Add New Lesson' });
      contentBlocks.value = []; // 重置
    }
  },
});

async function onConfirm() {
  formApi.setFieldValue(
    'contentBlocks',
    JSON.parse(JSON.stringify(contentBlocks.value)),
  );
  const { valid } = await formApi.validate();
  if (!valid) return;
  // 获取完整值（包括 contentBlocks）
  const values = await formApi.getValues<{
    contentBlocks: ContentBlock[];
    description: string;
    title: string;
  }>();

  const payload = {
    title: values.title,
    description: values.description,
    content: values.contentBlocks, // 提交时用这个字段
  };

  try {
    await (props.lessonData.id
      ? updateLessonApi({
          lessonId: props.lessonData.id,
          ...payload,
        })
      : createLessonApi({
          courseId: props.courseId,
          ...payload,
        }));
    modalApi.close();
    emit('confirm');
  } catch (error) {
    console.error(
      props.lessonData.id ? 'Update lesson failed:' : 'Create lesson failed:',
      error,
    );
  }
}

defineExpose({
  open: () => modalApi.open(),
  close: () => modalApi.close(),
});
</script>

<template>
  <Modal>
    <Form />
    <!-- ✅ 手动插入编辑器 -->
    <div class="mt-4 w-full">
      <label class="mb-1 block text-sm font-medium">Lesson Content</label>
      <LessonContentEditor v-model:value="contentBlocks" class="w-full" />
    </div>
  </Modal>
</template>
