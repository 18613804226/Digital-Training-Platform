<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenForm, useVbenModal } from '@vben/common-ui';

import { getCourseApi } from '#/api';
import { label } from 'three/tsl';

defineOptions({
  name: 'ExtraModal',
});

// 定义要 emit 的事件名
const emit = defineEmits<{
  (e: 'confirm', data: Record<string, any>): void;
}>();

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  onConfirm,
  title: 'Add Certificates',
  onOpened: async () => {
    // 获取课程数据
    const courseList = await getCourseApi({});

    // 转换为 select 选项
    const courseOptions = courseList.list.map((course: { id: number; title: string }) => ({
      label: course.title,
      value: course.id,
    }));

    // 更新 schema 中对应字段的 options
    const schema = formSchema.value;

    // 找到 course 字段并更新 options
    const courseField = schema.find((item) => item.fieldName === 'courseId');
    if (courseField) {
      courseField.componentProps.options = courseOptions;
    }

    // 如果 password 字段也要用课程（或模板），同样处理
    const templateField = schema.find(
      (item) => item.fieldName === 'templateId',
    );
    if (templateField) {
      templateField.componentProps.options = [{ label: "Default", value: 1 }]; // 或其他模板数据
    }
  },
});

// 先定义基础 schema 结构（不含动态 options）
const baseSchema = [
  {
    component: 'Select',
    fieldName: 'username',
    label: 'UserName',
    rules: 'selectRequired',
    componentProps: {
      clearable: true,
      filterOption: true,
      // 这里可以写死，或从 API 获取（如果需要）
      options: [
        { label: 'admin', value: 'admin' },
        // ...其他用户
      ],
      placeholder: 'Please Chose',
    },
  },
  {
    component: 'Select',
    fieldName: 'courseId',
    label: 'Course',
    rules: 'selectRequired',
    componentProps: {
      clearable: true,
      filterOption: true,
      options: [], // 先空着，后面动态填
      placeholder: 'Please Chose',
      showsearch: true,
    },
  },
  {
    component: 'Select',
    fieldName: 'templateId', // 建议改名为 templateId 更合理
    label: 'Certificate Template',
    rules: 'selectRequired',
    componentProps: {
      clearable: true,
      filterOption: true,
      options: [], // 动态填充
      placeholder: 'Please enter',
    },
  },
];
const formSchema = ref([...baseSchema]);
const [Form, formApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 90,
  },
  // 提交函数
  // handleSubmit: onSubmit,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  scrollToFirstError: true,
  // showDefaultActions: true,
  layout: 'horizontal',
  schema: formSchema.value,
  wrapperClass: 'grid-cols-1',
});

// function onSubmit(values: Record<string, any>) {
//   console.log(values)
// }
async function onConfirm() {
  const { valid } = await formApi.validate();
  if (valid) {
    notifyParent();
    modalApi.close();
  }
}
function notifyParent() {
  // 触发事件，并传参
  emit('confirm', formApi.form.values);
}
</script>
<template>
  <Modal>
    <Form />
  </Modal>
</template>
