<script setup lang="ts">
import type { BasicOption } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';

import { computed, onMounted, ref } from 'vue';

import { ProfileBaseSetting, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

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
const isRoleNotAdmin = computed(() => infoData.value.role !== 'ADMIN');
const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'name',
      component: 'VbenInput',
      label: 'Full Name',
    },
    {
      fieldName: 'username',
      component: 'VbenInput',
      label: 'User Name',
      rules: 'required',
    },
    {
      fieldName: 'email',
      component: 'VbenInput',
      label: $t('authentication.email'),
      componentProps: {
        placeholder: $t('authentication.emailTip'),
      },
      rules: z
        .string()
        .min(1, { message: $t('authentication.emailTip') })
        .email({ message: $t('authentication.emailValidErrorTip') }),
    },
    {
      fieldName: 'role',
      component: 'VbenSelect',
      componentProps: {
        mode: 'tags',
        options: MOCK_ROLES_OPTIONS,
        disabled: isRoleNotAdmin,
      },
      label: 'Role',
      rules: 'required',
    },
    // {
    //   fieldName: 'introduction',
    //   component: 'Input',
    //   componentProps: {
    //     type: 'textarea',
    //     rows: 3,
    //     maxlength: 500,
    //     showWordLimit: true,
    //     clearable: true,
    //   },
    //   label: 'Personal Profile',
    // },
  ];
});
async function handleSubmit(val: any) {
  // console.log(val);
  const res: any = await uesrProfileApi(val);
  if (res.success === true) {
    ElMessage.success(res.message);
  }
}
export interface UserInfos {
  role: string;
  age?: number;
  email?: string;
  avatar?: string;
  introduction?: string;
}
const infoData = ref<UserInfos>({ role: '' });
onMounted(async () => {
  const data = await getUserInfoApi();
  profileBaseSettingRef.value.getFormApi().setValues(data);
  infoData.value = data as unknown as UserInfos;
});
</script>
<template>
  <ProfileBaseSetting
    ref="profileBaseSettingRef"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
