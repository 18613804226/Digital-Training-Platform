<script lang="ts" setup>
import { useVbenForm, useVbenModal, z } from '@vben/common-ui';

import { createLessonApi, updateLessonApi } from '#/api';

const props = defineProps<{ courseId: string; lessonData: any }>();
const emit = defineEmits<{ (e: 'confirm'): void }>();

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  title: 'Add New Lesson',
  onConfirm,
  onOpened() {
    if (props.lessonData.id) {
      modalApi.setState({ title: 'Edit Lesson' });
      formApi.setValues(props.lessonData);
    } else {
      modalApi.setState({ title: 'Add New Lesson' });
    }
  },
});

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
  ],
});

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues(); // { title: "...", description: "..." }
  if (props.lessonData.id) {
    // ✅ 编辑模式
    try {
      await updateLessonApi({
        lessonId: props.lessonData.id,
        ...values,
      });
      modalApi.close();
      emit('confirm');
    } catch (error) {
      console.error('Update lesson failed:', error);
    }
  } else {
    // ✅ 新增模式
    try {
      await createLessonApi({
        courseId: props.courseId,
        ...values,
      });
      modalApi.close();
      emit('confirm');
    } catch (error) {
      console.error('Create lesson failed:', error);
    }
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
  </Modal>
</template>
