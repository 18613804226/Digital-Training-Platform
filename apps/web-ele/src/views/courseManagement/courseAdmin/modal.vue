<script lang="ts" setup>
import { useVbenForm, useVbenModal, z } from '@vben/common-ui';
import { ref } from 'vue';
import { getUserListApi, createCourseApi } from '#/api';

defineOptions({ name: 'CourseModal' });

const emit = defineEmits<{ (e: 'confirm'): void }>();

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  title: 'Add Course',
  onConfirm,
  onOpened: fetchTeachers,
});

const teacherOptions = ref<{ label: string; value: number }[]>([]);

async function fetchTeachers() {
  try {
    const { list }: any = await getUserListApi({}); // 确保结构是 { list: [...] }
    teacherOptions.value = list.map((user: any) => ({
      label: user.username,
      value: user.id,
    }));
  } catch (error) {
    console.error('Failed to load teachers:', error);
  }
}

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: { class: 'w-full' },
    labelWidth: 90,
  },
  layout: 'horizontal',
  scrollToFirstError: true,
  wrapperClass: 'grid-cols-1',
  schema: [
    {
      component: 'Input',
      fieldName: 'title',
      label: 'Course Title',
      componentProps: {
        clearable: true,
        placeholder: 'Please enter course title',
        maxlength: 100,
      },
      rules: z
        .string({ required_error: 'Course title is required' })
        .min(1)
        .max(100),
    },
    {
      component: 'Input',
      fieldName: 'description',
      label: 'Description',
      componentProps: {
        type: 'textarea',
        clearable: true,
        placeholder: 'Brief description (optional)',
        rows: 3,
        maxlength: 500,
        showWordLimit: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'cover',
      label: 'Cover Image URL',
      componentProps: {
        clearable: true,
        placeholder: 'https://example.com/cover.jpg',
      },
    },
    // category
    {
      component: 'Select',
      fieldName: 'category', defaultValue: undefined,
      label: 'Category',
      componentProps: {
        clearable: true,
        options: [
          { label: 'Frontend', value: 'frontend' },
          { label: 'Backend', value: 'backend' },
          { label: 'Database', value: 'database' },
          { label: 'DevOps', value: 'devops' },
          { label: 'Other', value: 'other' },
        ],
        placeholder: 'Select a teacher',
      },
      rules: 'selectRequired',
    },
    {
      component: 'Select',
      fieldName: 'teacherId', defaultValue: undefined,
      label: 'Teacher',
      componentProps: {
        clearable: true,
        filterable: true,       // ✅ Element 的搜索
        options: teacherOptions,
        placeholder: 'Select a teacher',
      },
      rules: z.number({ required_error: 'Please select a teacher' }),
    },
  ],
});

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (valid) {
    try {
      await createCourseApi(formApi.form.values);
      modalApi.close();
      emit('confirm');
    } catch (error) {
      console.error('Create course failed:', error);
      // 可选：用 message.error() 提示用户
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
