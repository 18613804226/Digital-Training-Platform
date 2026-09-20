<script lang="ts" setup>
import { useVbenForm, useVbenModal, z } from '@vben/common-ui';

import { createUserApi } from '#/api';

defineOptions({
  name: 'ExtraModal',
});

// 定义要 emit 的事件名
const emit = defineEmits<{
  (e: 'confrim'): void;
}>();

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  onConfirm,
});

const [Form, formApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 130,
  },
  // 提交函数
  // handleSubmit: onSubmit,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  scrollToFirstError: true,
  // showDefaultActions: true,
  layout: 'horizontal',
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: 'Please enter',
      },
      // 字段名
      fieldName: 'username',
      label: 'UserName',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [
          {
            label: 'USER',
            value: 'USER',
          },
          {
            label: 'STUDENT',
            value: 'STUDENT',
          },
          {
            label: 'TEACHER',
            value: 'TEACHER',
          },
          {
            label: 'ADMIN',
            value: 'ADMIN',
          },
        ],
        placeholder: 'Please Chose',
        showSearch: true,
      },
      defaultValue: undefined,
      fieldName: 'role',
      label: 'Role',
      rules: 'selectRequired',
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: 'Please enter',
      },
      fieldName: 'password',
      label: 'PassWord',
      rules: 'required',
    },
    {
      fieldName: 'confirmPassword',
      label: 'Confirm Password',
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: 'Please enter your new password again',
      },
      dependencies: {
        rules(values) {
          const { password } = values;
          return z
            .string({ required_error: 'Please enter your password again.' })
            .min(1, { message: 'Please enter your password again.' })
            .refine((value) => value === password, {
              message: 'The two passwords did not match.',
            });
        },
        triggerFields: ['password'],
      },
    },
  ],
  wrapperClass: 'grid-cols-1',
});

// function onSubmit(values: Record<string, any>) {
//   console.log(values)
// }
async function onConfirm() {
  await createUserApi(formApi.form.values);
  modalApi.close();
  notifyParent();
}
function notifyParent() {
  // 触发事件，并传参
  emit('confrim');
}
</script>
<template>
  <Modal title="Add User">
    <Form />
  </Modal>
</template>
