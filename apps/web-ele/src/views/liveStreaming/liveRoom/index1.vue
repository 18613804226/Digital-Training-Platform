<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { conference, ConferenceMainView } from '@tencentcloud/roomkit-web-vue3';

import { getUserSigApi } from '#/api';

const USER_ID = `user_${Date.now()}`;
// let USER_SIG = ''
const config = {
  sdkAppId: 1_600_115_551,
  userId: USER_ID,
  userSig: '',
  roomId: 1,
  mode: 'classroom', // live 或 classroom
  role: 'teacher', // teacher / audience
};
async function getUserSig(userId: string) {
  const res = await getUserSigApi({ userId });
  if (res.code !== 0) throw new Error(res.msg || '获取签名失败');
  config.userSig = res.userSig;
}
const conferenceRef = ref<any>(null);

const startConference = async () => {
  console.log(config);

  await conference.login(config);
  await conference.start('123456', {
    roomName: 'TestRoom',
    isSeatEnabled: false,
    isOpenCamera: false,
    isOpenMicrophone: false,
  });
};

// 登录成功
const onLoginSuccess = () => {
  console.log('登录成功');
};

// 加入房间
const onJoinRoom = () => {
  console.log('已加入房间');
};

// 错误处理
const onError = (err: any) => {
  console.error('错误:', err);
};
onMounted(async () => {
  await getUserSig(USER_ID);
  await startConference();
});
</script>
<template>
  <div class="h-full rounded-lg p-5">
    <ConferenceMainView
      ref="conferenceRef"
      :config="config"
      @login-success="onLoginSuccess"
      @join-room="onJoinRoom"
      @error="onError"
    />
  </div>
</template>
