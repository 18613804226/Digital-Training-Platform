<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenForm, useVbenModal, z } from '@vben/common-ui';

import { createCourseApi, getUserListApi, putCourseApi } from '#/api';

defineOptions({ name: 'CourseModal' });
const props = defineProps<{
  modalData: any;
}>();

const emit = defineEmits<{ (e: 'confirm'): void }>();
const modalData: any = ref({
  title: 'Add Course',
});
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  title: modalData.value.title,
  onConfirm,
  onOpened: fetchTeachers,
});

const teacherOptions = ref<{ label: string; value: number }[]>([]);

async function fetchTeachers() {
  if (props.modalData) {
    modalData.value = props.modalData;
    modalApi.setState({ title: 'Edit Course' });
    formApi.setValues(props.modalData);
  }
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
      fieldName: 'category',
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
      fieldName: 'teacherId',
      defaultValue: undefined,
      label: 'Teacher',
      componentProps: {
        clearable: true,
        filterable: true, // ✅ Element 的搜索
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
    if (props.modalData) {
      try {
        const params = {
          id: props.modalData.id,
          ...(await formApi.getValues()),
        };

        await putCourseApi(params);
        modalApi.close();
        emit('confirm');
      } catch (error) {
        console.error('Update course failed:', error);
        // 可选：用 message.error() 提示用户
      }
    } else {
      try {
        await createCourseApi(await formApi.getValues());
        modalApi.close();
        emit('confirm');
      } catch (error) {
        console.error('Create course failed:', error);
        // 可选：用 message.error() 提示用户
      }
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
