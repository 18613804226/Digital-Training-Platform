<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed, ref } from 'vue';

import { ProfilePasswordSetting, z } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { uesrProfileApi } from '#/api';

const profilePasswordSettingRef = ref();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'oldPassword',
      label: 'Old Password',
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: 'Please enter your old password.',
      },
    },
    {
      fieldName: 'newPassword',
      label: 'New Password',
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: 'Please enter your new password.',
      },
    },
    {
      fieldName: 'confirmPassword',
      label: 'Confirm Password',
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: 'Please enter your new password again.',
      },
      dependencies: {
        rules(values) {
          const { newPassword } = values;
          return z
            .string({ required_error: 'Please enter your new password again.' })
            .min(1, { message: 'Please enter your new password again.' })
            .refine((value) => value === newPassword, {
              message: 'The two passwords did not match.',
            });
        },
        triggerFields: ['newPassword'],
      },
    },
  ];
});

async function handleSubmit(val: any) {
  const res: any = await uesrProfileApi(val);
  if (res.success === true) {
    ElMessage.success(res.message);
  }
}
</script>
<template>
  <ProfilePasswordSetting
    ref="profilePasswordSettingRef"
    class=""
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
