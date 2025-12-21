<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { VBEN_GITHUB_URL } from '@vben/constants';
import { useWatermark } from '@vben/hooks';
import { SvgGithubIcon } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

// 👇 这些 API 保留，用于手动操作（标记已读、删除等）
import {
  deleteNotificationsAllApi,
  deleteNotificationsOneApi,
  getNotificationsApi,
  patchMarkAllAsReadApi,
  patchNotificationsReadApi,
} from '#/api';
import { $t } from '#/locales';
import { useAuthStore } from '#/store';
// 👇 新增：引入通知 Store
import { useNotificationStore } from '#/store/notification'; // 路径根据你实际调整
import { initNotificationSocket } from '#/utils/notification-socket';
import LoginForm from '#/views/_core/authentication/login.vue';

// 👇 不再用本地 ref，改用 Store
const notificationStore = useNotificationStore();
const accessStore = useAccessStore();

// 初始化：加载历史通知（可选，如果你希望首次进入显示历史记录）
onMounted(async () => {
  // 监听 userInfo 变化（应对刷新后异步加载）
  watch(
    () => userStore.userInfo,
    (userInfo) => {
      const token = accessStore.accessToken;
      if (userInfo?.id && token) {
        // console.log('🔁 Initializing WebSocket after page load...');
        initNotificationSocket(userInfo.id, token);
      }
    },
    { immediate: true },
  );
  const res = await getNotificationsApi();
  if (res.items.length > 0) {
    // 注意：这里只是初始化，后续由 WebSocket 实时更新
    notificationStore.notifications = res.items || [];
  }
});

// 👇 所有操作都通过 Store + API 同步
async function makeRead(item: NotificationItem) {
  const res = await patchNotificationsReadApi({ ids: [item.id] });
  if (res.success) {
    notificationStore.markAsRead(item.id);
  }
}

async function deleteNotificationsOne(item: { id: number | string }) {
  const res = await deleteNotificationsOneApi(item);
  if (res.success) {
    notificationStore.remove(item.id);
  }
}

async function deleteNotificationsAll() {
  const res = await deleteNotificationsAllApi();
  if (res.success) {
    notificationStore.$reset(); // 或直接调用 $reset()
  }
}

async function patchMarkAllAsRead() {
  const res = await patchMarkAllAsReadApi();
  if (res.success) {
    notificationStore.markAllAsRead();
  }
}

// 其他逻辑保持不变...
const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
// const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();

// 👇 计算属性从 Store 读取
const showDot = computed(() =>
  notificationStore.notifications.some((item) => !item.read),
);

const menus = computed(() => [
  {
    handler: () => router.push({ name: 'Profile' }),
    icon: 'lucide:user',
    text: $t('page.auth.profile'),
  },
  {
    handler: () => openWindow(VBEN_GITHUB_URL, { target: '_blank' }),
    icon: SvgGithubIcon,
    text: 'GitHub',
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});
const email = computed(() => {
  return userStore.userInfo?.email ?? '';
});
async function handleLogout() {
  await authStore.logout(false);
}

// 👇 移除本地方法，全部交给 Store
// markRead / remove / handleMakeAll / handleNoticeClear 已在 Store 中实现

watch(
  () => ({
    enable: preferences.app.watermark,
    content: preferences.app.watermarkContent,
  }),
  async ({ enable, content }) => {
    if (enable) {
      await updateWatermark({
        content:
          content ||
          `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  { immediate: true },
);
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.realName"
        :description="email"
        tag-text="Pro"
        @logout="handleLogout"
      />
    </template>
    <template #notification>
      <!-- 👇 直接传 Store 的数据 -->
      <Notification
        :dot="showDot"
        :notifications="notificationStore.notifications"
        @clear="deleteNotificationsAll"
        @read="makeRead"
        @remove="deleteNotificationsOne"
        @make-all="patchMarkAllAsRead"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
