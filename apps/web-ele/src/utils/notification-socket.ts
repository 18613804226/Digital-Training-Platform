import { ElNotification } from 'element-plus';
// src/utils/notification-socket.ts
import { io, Socket } from 'socket.io-client';

import { $t } from '#/locales';

let socket: null | Socket = null;
let currentUserId: null | number = null;
let currentToken: null | string = null;

export function initNotificationSocket(userId: number, token: string) {
  // 如果已连接且用户相同，无需重复初始化
  if (socket?.connected && currentUserId === userId) {
    return;
  }

  // 保存当前凭证（用于重连）
  currentUserId = userId;
  currentToken = token;

  // 销毁旧连接
  destroyNotificationSocket();

  const API_BASE_URL = import.meta.env.VITE_BASE_API;
  const wsUrl = `${API_BASE_URL}/notifications`;

  socket = io(wsUrl, {
    auth: { token },
    withCredentials: true,
    transports: ['websocket'],
    reconnection: true, // ✅ 启用自动重连
    reconnectionAttempts: 10, // 最多重连 10 次
    reconnectionDelay: 2000, // 2秒后重试
  });

  // ✅ 关键：每次连接成功都重新注册！
  socket.on('connect', () => {
    console.log('✅ WebSocket connected');
    if (currentUserId !== null) {
      socket?.emit('register', { userId: currentUserId }); // 👈 重新绑定用户
    }
  });

  socket.on('new_notification', (data) => {
    ElNotification({
      title: $t('notification.newNotification'),
      message: data.title || data.content,
      type: 'info',
      duration: 5000,
    });

    // 👇 这里也要更新 Pinia Store！
    import('#/store/notification').then(({ useNotificationStore }) => {
      const store = useNotificationStore();
      store.addNotification(data);
    });
  });

  socket.on('connect_error', (err) => {
    console.error('❌ WebSocket connect error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 WebSocket disconnected:', reason);
  });
}

export function destroyNotificationSocket() {
  if (socket) {
    socket.disconnect();
    socket.close(); // 👈 更彻底地关闭
    socket = null;
    currentUserId = null;
    currentToken = null;
    console.log('🧹 WebSocket destroyed');
  }
}
