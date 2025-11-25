<script setup lang="ts">
import type { BasicOption } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';

import { computed, onMounted, ref } from 'vue';

import { ProfileBaseSetting } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { getUserInfoApi, uesrProfileApi } from '#/api';

const profileBaseSettingRef = ref();

const MOCK_ROLES_OPTIONS: BasicOption[] = [
  {
    label: 'ADMIN',
    value: 'ADMIN',
  },
  {
    label: 'USER',
    value: 'USER',
  },
  {
    label: 'TEACHER',
    value: 'TEACHER',
  },
];

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'name',
      component: 'Input',
      label: 'Full Name',
    },
    {
      fieldName: 'username',
      component: 'Input',
      label: 'User Name',
    },
    {
      fieldName: 'role',
      component: 'Select',
      componentProps: {
        mode: 'tags',
        options: MOCK_ROLES_OPTIONS,
      },
      label: 'Role',
    },
    {
      fieldName: 'introduction',
      component: 'Textarea',
      label: 'Personal Profile',
    },
  ];
});
async function handleSubmit(val: any) {
  // console.log(val);
  const res: any = await uesrProfileApi(val);
  if (res.success === true) {
    ElMessage.success(res.message);
  }
}
onMounted(async () => {
  const data = await getUserInfoApi();
  profileBaseSettingRef.value.getFormApi().setValues(data);
});
</script>
<template>
  <ProfileBaseSetting
    ref="profileBaseSettingRef"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
