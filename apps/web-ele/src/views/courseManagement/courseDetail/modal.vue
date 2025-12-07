<script lang="ts" setup>
import { useVbenForm, useVbenModal, z } from '@vben/common-ui';
import { ref } from 'vue';
import { getUserListApi, createCourseApi, putCourseApi } from '#/api';

defineOptions({ name: 'CourseModal' });
const props = defineProps<{
  modalData: any
}>();



const emit = defineEmits<{ (e: 'confirm'): void }>();
const formData: any = ref({
  title: 'Add Lesson Name'
})
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  title: formData.value.title,
  onConfirm,
  // onOpened: fetchTeachers,
});

// const teacherOptions = ref<{ label: string; value: number }[]>([]);

// async function fetchTeachers() {
//   if (props.modalData) {
//     formData.value = props.modalData
//     modalApi.setState({ title: 'Edit Course' })
//     formApi.setValues(props.modalData)
//   }
//   try {
//     const { list }: any = await getUserListApi({}); // 确保结构是 { list: [...] }
//     teacherOptions.value = list.map((user: any) => ({
//       label: user.username,
//       value: user.id,
//     }));
//   } catch (error) {
//     console.error('Failed to load teachers:', error);
//   }

// }

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: { class: 'w-full' },
    labelWidth: 100,
  },
  layout: 'horizontal',
  scrollToFirstError: true,
  wrapperClass: 'grid-cols-1',
  schema: [
    {
      component: 'Input',
      fieldName: 'title',
      label: 'Lesson Name',
      componentProps: {
        clearable: true,
        placeholder: 'Please enter Lesson Name',
        maxlength: 100,
      },
      rules: z
        .string({ required_error: 'Lesson Name is required' })
        .min(1)
        .max(100),
    },
  ],
});

async function onConfirm() {
  modalApi.close();
  // const { valid } = await formApi.validate();
  // if (valid) {
  //   if (props.modalData) {
  //     try {
  //       const params = {
  //         id: props.modalData.id,
  //         ...await formApi.getValues()
  //       }

  //       await putCourseApi(params);
  //       modalApi.close();
  //       emit('confirm');
  //     } catch (error) {
  //       console.error('Update course failed:', error);
  //       // 可选：用 message.error() 提示用户
  //     }
  //   } else {
  //     try {
  //       await createCourseApi(await formApi.getValues());
  //       modalApi.close();
  //       emit('confirm');
  //     } catch (error) {
  //       console.error('Create course failed:', error);
  //       // 可选：用 message.error() 提示用户
  //     }
  //   }

  // }
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
