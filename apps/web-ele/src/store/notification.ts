import type { NotificationItem } from '@vben/layouts'; // 👈 复用官方类型

import { ref } from 'vue';

// src/stores/modules/notification.ts
import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<NotificationItem[]>([]);
  const unreadCount = ref(0);

  function addNotification(raw: any) {
    // const item: NotificationItem = {
    //   id: raw.id || raw._id,
    //   title: raw.title || raw.subject,
    //   content: raw.content || raw.message || raw.description,
    //   read: raw.read ?? false,
    //   date: raw.createdAt || raw.date || raw.created_at || new Date().toISOString(),
    //   avatar: ''
    // };

    notifications.value.unshift(raw);
    if (!raw.read) {
      unreadCount.value++;
    }
  }

  function markAsRead(id: number | string) {
    const item = notifications.value.find((n) => n.id === id);
    if (item && !item.read) {
      item.read = true;
      unreadCount.value--;
    }
  }

  function remove(id: number | string) {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      const item: any = notifications.value[index];
      if (!item.read) {
        unreadCount.value--;
      }
      notifications.value.splice(index, 1);
    }
  }

  function markAllAsRead() {
    notifications.value.forEach((n) => {
      if (!n.read) n.read = true;
    });
    unreadCount.value = 0;
  }

  function $reset() {
    notifications.value = [];
    unreadCount.value = 0;
  }

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    remove,
    markAllAsRead,
    $reset,
  };
});
