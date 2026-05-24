<!-- src/views/onlineLearning/liveClassroom/index.vue -->

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { ElCheckbox, ElMessage } from 'element-plus';
import TIM from 'tim-js-sdk';
import TIMUploadPlugin from 'tim-upload-plugin'; // 👈 加载上传插件
import TRTC from 'trtc-js-sdk';

import { getUserSigApi } from '#/api';

// 注册插件（必须在 init 之前）

// 如果你使用 Vben 内置的 useBreakpoint（推荐）
const isMobile = ref(window.innerWidth < 768);

// 响应窗口变化（可选）
window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth < 768;
});
// ====== 配置 ======
const userStore = useUserStore();
const SDK_APP_ID = 1_600_115_551;
const ROOM_ID = 1;
const USER_ID: any = userStore.userInfo?.username;
const getUserSig = async (userId: string): Promise<string> => {
  const res = await getUserSigApi({ userId });
  if (res.code !== 0) throw new Error(res.msg || '获取签名失败');
  return res.userSig;
};

// ====== 状态 ======
const joining = ref(true);
const onlineCount = ref(0);
const inputMessage = ref('');
const chatMessages = ref<
  Array<{
    body: string; // 对于文本是实际文本内容；对于媒体类型是URL或文件名
    duration?: number; // 仅对音频有效，单位为秒
    fileName?: string; // 仅对文件有效
    fileSize?: number; // 仅对文件有效
    from: string;
    type: 'audio' | 'file' | 'image' | 'system' | 'text'; // 消息类型
  }>
>([]);
const showDanmaku = ref(true);
const danmakuList = ref<Array<{ duration: number; text: string; top: number }>>(
  [],
);
const isAudioEnabled = ref(true);
const isVideoEnabled = ref(true);

const remoteUsers = ref<Array<{ name?: string; userId: string }>>([]);
const remoteStreams = ref<Array<any>>([]);

// ✅ 不再需要 hoveredUser

// ====== 实例 ======
let trtcClient: any = null;
let localStream: any = null;
let timInstance: any = null;
const groupID = `@TGS#a337HYHSI`;

// ====== 计算属性：小窗列表（含 +N） ======
const MAX_THUMBS = 3;
const allThumbs = computed(() => {
  const users = remoteUsers.value;
  const total = users.length;

  if (total <= MAX_THUMBS) {
    return users.map((user) => ({
      key: user.userId,
      type: 'user' as const,
      userId: user.userId,
      name: user.name || `用户${user.userId}`,
    }));
  }

  const visibleCount = MAX_THUMBS - 1;
  const moreCount = total - visibleCount;

  const thumbs: any = users.slice(0, visibleCount).map((user) => ({
    key: user.userId,
    type: 'user' as const,
    userId: user.userId,
    name: user.name || `用户${user.userId}`,
  }));

  thumbs.push({
    key: 'more',
    type: 'more' as const,
    count: moreCount,
  });

  return thumbs;
});

// ====== 初始化 ======
const initTencent = async () => {
  try {
    const userSig = await getUserSig(USER_ID);

    // --- TRTC ---
    trtcClient = TRTC.createClient({
      mode: 'live',
      sdkAppId: SDK_APP_ID,
      userId: USER_ID,
      userSig,
    });

    trtcClient.on('stream-added', async (event: any) => {
      const remoteStream = event.stream;
      const userId = remoteStream.getUserId();
      await trtcClient.subscribe(remoteStream);

      remoteStreams.value.push(remoteStream);
      remoteUsers.value.push({ userId, name: `用户${userId}` });

      nextTick(() => {
        const thumbEl = document.querySelector(`thumb-${userId}`);
        if (thumbEl) {
          try {
            remoteStream.play(thumbEl.id);
          } catch (error) {
            console.warn('小窗播放失败:', error);
          }
        }
      });
    });

    trtcClient.on('stream-removed', (event: any) => {
      const userId = event.stream.getUserId();
      remoteStreams.value = remoteStreams.value.filter(
        (s) => s.getUserId() !== userId,
      );
      remoteUsers.value = remoteUsers.value.filter((u) => u.userId !== userId);

      const thumbEl = document.querySelector(`thumb-${userId}`);
      if (thumbEl) thumbEl.innerHTML = '';
      // ✅ 不再处理 hoveredUser
    });

    trtcClient.on('peer-join', () => {
      onlineCount.value = trtcClient.getRemoteStreams().length + 1;
    });
    trtcClient.on('peer-leave', () => {
      onlineCount.value = trtcClient.getRemoteStreams().length + 1;
    });

    localStream = TRTC.createStream({ audio: true, video: true });
    await localStream.initialize();
    await playLocalStream();
    await trtcClient.join({ roomId: ROOM_ID });
    await trtcClient.publish(localStream);

    // --- TIM ---
    timInstance = TIM.create({ SDKAppID: SDK_APP_ID });
    timInstance.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin });
    timInstance.setLogLevel(1);

    // ========== 消息处理函数 ==========
    const onMessageReceived = (event: { data: any[] }) => {
      event.data.forEach((msg) => {
        console.warn('收到消息:', msg.type, msg.payload);
        const from = msg.from;

        switch (msg.type) {
          // 📎 文件消息
          case 'TIMFileElem': {
            const fileUrl = msg.payload.url;
            const fileName = msg.payload.fileName;
            const fileSize = msg.payload.fileSize; // 字节
            if (fileUrl) {
              chatMessages.value.push({
                from,
                type: 'file',
                body: fileUrl,
                fileName,
                fileSize,
              });
              scrollToBottom();
            }
            break;
          }

          // 处理 TIMGroupTipElem（群提示）
          case 'TIMGroupTipElem': {
            const { operationType, memberList = [] } = msg.payload;
            const userNames = memberList
              .map((m: { userID: any }) => m.userID)
              .join('、');
            let systemText = '';
            if (operationType === 1) {
              systemText = `${userNames} Joined the group chat`;
            } else if (operationType === 2) {
              systemText = `${userNames} Left the group chat`;
            }

            chatMessages.value.push({
              from: 'System',
              type: 'system',
              body: systemText,
            });
            scrollToBottom();
            break;
          }

          // 🖼️ 图片消息
          case 'TIMImageElem': {
            const imageInfo = msg.payload.imageInfoArray?.[0]; // 取原图或大图
            const imageUrl = imageInfo?.url || '';
            if (imageUrl) {
              chatMessages.value.push({
                from,
                type: 'image',
                body: imageUrl,
              });
              scrollToBottom();
            }
            break;
          }

          // 🔊 语音消息
          case 'TIMSoundElem': {
            const soundUrl = msg.payload.url;
            const duration = msg.payload.duration; // 单位：秒
            if (soundUrl) {
              chatMessages.value.push({
                from,
                type: 'audio',
                body: soundUrl,
                duration,
              });
              scrollToBottom();
            }
            break;
          }

          // 📝 文本消息
          case 'TIMTextElem': {
            const textContent = msg.payload.text;
            chatMessages.value.push({
              from,
              type: 'text',
              body: textContent,
            });
            addDanmaku(textContent);
            scrollToBottom();
            break;
          }
          // ⚠️ 其他类型（群提示、自定义消息等）
          default: {
            if (msg.type === 'TIMGroupSystemNoticeElem') {
              const notice =
                msg.payload?.description ||
                'An operation occurred in the group';
              chatMessages.value.push({
                from: 'System',
                type: 'system',
                body: notice,
              });
              scrollToBottom();
            } else if (msg.type === 'TIMCustomElem') {
              const desc = msg.payload?.description || '自定义消息';
              chatMessages.value.push({
                from: 'System',
                type: 'system',
                body: `[自定义] ${desc}`,
              });
              scrollToBottom();
            } else {
              // 其他完全未知的类型
              console.warn('收到未处理的消息类型:', msg.type, msg);
              chatMessages.value.push({
                from: 'System',
                type: 'system',
                body: `[系统] 收到 ${msg.type} 类型消息`,
              });
              scrollToBottom();
            }
            break;
          }
        }
      });
    };

    // 监听消息事件
    timInstance.on(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);

    try {
      await timInstance.login({ userID: USER_ID, userSig });
    } catch {
      // 忽略已加入错误
    }
    try {
      await timInstance.joinGroup({
        groupID: '@TGS#a337HYHSI',
        type: 'AVChatRoom',
        allowCreate: true,
      });
    } catch {
      // 忽略已加入错误
    }

    joining.value = false;
    console.warn('TRTC + TIM 初始化成功');
  } catch (error: any) {
    console.error('初始化失败:', error);
    ElMessage.error(error.message || '无法连接直播服务');
    joining.value = false;
  }
};

const sendChatMessage = async () => {
  if (!inputMessage.value.trim() || !timInstance) return;

  const text = inputMessage.value.trim();
  const selfMsg: any = { from: USER_ID, type: 'text', body: text };

  try {
    chatMessages.value.push(selfMsg);
    addDanmaku(text);
    scrollToBottom();

    const message = timInstance.createTextMessage({
      to: groupID,
      conversationType: TIM.TYPES.CONV_GROUP,
      payload: { text },
    });
    await timInstance.sendMessage(message);
    inputMessage.value = '';
  } catch (error) {
    console.error('发送失败:', error);
    ElMessage.warning('消息发送失败');
  }
};

// ====== 工具函数 ======
// 格式化音频时长（秒 → mm:ss）
function formatDuration(seconds?: number): string {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 格式化文件大小
function formatFileSize(bytes?: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  else return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 可选：图片预览（简单弹窗）
function openImagePreview(url: string) {
  // 你可以用 modal、viewer 或直接 window.open
  window.open(url, '_blank');
}
const addDanmaku = (text: string) => {
  if (!showDanmaku.value) return;
  const top = Math.floor(Math.random() * 80) + 200;
  const duration = 5 + Math.random() * 3;
  danmakuList.value.push({ text, top, duration });
  setTimeout(() => danmakuList.value.shift(), duration * 1000);
};

const toggleMute = async (type: 'audio' | 'video') => {
  if (!localStream || !trtcClient) return;

  if (type === 'audio') {
    isAudioEnabled.value = !isAudioEnabled.value;
    localStream.muteAudio(!isAudioEnabled.value);
  } else {
    const newVideoState = !isVideoEnabled.value;
    isVideoEnabled.value = newVideoState;

    try {
      await trtcClient.unpublish(localStream);
      localStream.close();

      localStream = TRTC.createStream({
        audio: true,
        video: newVideoState,
      });

      await localStream.initialize();
      await playLocalStream();
      await trtcClient.publish(localStream);
    } catch (error) {
      console.error('切换摄像头失败:', error);
      ElMessage.error('操作失败，请重试');
      isVideoEnabled.value = !newVideoState;
    }
  }
};

const playLocalStream = async () => {
  if (!localStream) return;
  await localStream.play('local-video');

  setTimeout(() => {
    const container = document.querySelector('#local-video');
    if (container) {
      const mediaEl: any = container.querySelector('video, canvas');
      if (mediaEl) {
        Object.assign(mediaEl.style, {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          background: 'black',
        });
      }
    }
  }, 100);
};

// const requestToSpeak = () => {
//   ElMessage.info('已发送连麦请求，请等待老师同意');
// };

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.max-h-48.overflow-y-auto');
    if (container) container.scrollTop = container.scrollHeight;
  });
};

const leaveRoom = async () => {
  console.log('--- [DEBUG] 开始清理资源 ---');
  // 1. 先停止本地流（这个通常是同步或极快的）
  if (localStream) {
    try {
      localStream.stop();
      localStream.close();
      console.log('本地流已关闭');
    } catch (e) {
      console.warn('关闭流失败', e);
    }
    localStream = null;
  }
  // 2. 关键：等待 leave 完成
  if (trtcClient) {
    try {
      console.log('正在调用 leave()...');
      // 必须加上 await，确保服务器确认退出
      await trtcClient.leave();
      console.log('leave() 成功');
    } catch (error) {
      // 即使 leave 报错（比如网络断了），也要继续往下走，防止卡死
      console.error('leave() 接口报错:', error);
    } finally {
      // 3. 只有在执行完 leave 逻辑后（无论成功失败），才执行销毁
      try {
        trtcClient.off('*'); // 先取消所有事件监听
        trtcClient.destroy();
        console.log('trtcClient 已彻底销毁');
      } catch (destroyError) {
        console.error('destroy() 失败:', destroyError);
      }
      trtcClient = null;
    }
  }

  if (timInstance) {
    await timInstance.logout().catch(() => { });
    timInstance = null;
  }
  // if (localStream) localStream.close();
  // if (trtcClient) {
  //   trtcClient.leave().finally(() => trtcClient.destroy());
  // }
  // if (timInstance) {
  //   timInstance.logout();
  // }
  ElMessage.success('Left the classroom');
};

onMounted(() => {
  initTencent();
});

onUnmounted(() => {
  leaveRoom();
  // // 👇 只加这 3 行！清空 TRTC 自动插入的媒体元素
  // const local = document.getElementById('local-video');
  // if (local) local.innerHTML = '';
  // document.querySelectorAll('[id^="thumb-"]').forEach(el => el.innerHTML = '');

});
</script>

<template>
  <!-- 最外层：必须 h-full + overflow-hidden -->
  <div class="relative flex h-full flex-col overflow-hidden p-2 sm:p-4">
    <!-- 弹幕层 -->
    <div class="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      <div v-for="(dm, idx) in danmakuList" :key="idx"
        class="animate-danmaku absolute whitespace-nowrap text-sm font-bold text-white"
        :style="{ top: `${dm.top}px`, animationDuration: `${dm.duration}s` }">
        {{ dm.text }}
      </div>
    </div>

    <!-- Page 容器 -->
    <Page class="card-box relative flex-1 overflow-hidden rounded-lg"
      title="Online live classroom (Tencent Cloud · TRTC + IM)" :loading="joining" loading-text="正在加入直播间...">
      <!-- 顶部信息（仅桌面显示） -->
      <template #description>
        <div v-if="!isMobile" class="flex justify-between text-sm text-gray-600">
          <span>Course: xx</span>
          <span>Online users：{{ onlineCount }} 人</span>
        </div>
      </template>

      <!-- 桌面端：左右布局 -->
      <div v-if="!isMobile" class="flex h-full gap-6">
        <!-- 左侧：视频区域 -->
        <div class="relative flex-1">
          <div class="relative h-full w-full overflow-hidden rounded-lg bg-black">
            <div id="local-video" class="relative h-full w-full"></div>
            <div class="absolute bottom-2 left-2 right-2 rounded bg-black bg-opacity-60 px-2 py-1 text-xs text-white">
              Speaker: {{ USER_ID }}
            </div>

            <!-- 画中画小窗（右下角） -->
            <div v-if="allThumbs.length > 0" class="absolute bottom-4 right-4 z-10 flex gap-2">
              <div v-for="thumb in allThumbs" :key="thumb.key"
                class="thumb-container relative h-16 w-24 cursor-pointer overflow-hidden rounded border border-gray-600 bg-gray-800 transition-all duration-200">
                <template v-if="thumb.type === 'user'">
                  <div :id="`thumb-${thumb.userId}`" class="h-full w-full"></div>
                  <div
                    class="absolute bottom-0 left-0 right-0 truncate bg-black bg-opacity-50 px-1 text-[10px] text-white">
                    {{ thumb.name }}
                  </div>
                </template>
                <template v-else-if="thumb.type === 'more'">
                  <div class="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                    +{{ thumb.count }}
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：聊天区 -->
        <div class="flex w-80 flex-col">
          <div class="flex flex-1 flex-col rounded-lg p-3">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-sm font-medium">Real-time chat</h3>
              <ElCheckbox v-model="showDanmaku" size="small">
                {{
                  showDanmaku
                    ? 'The live chat is now enabled.'
                    : 'Turn on bullet comments'
                }}
              </ElCheckbox>
            </div>
            <div
              class="no-scrollbar mb-2 min-h-0 flex-1 overflow-y-auto border border-dashed border-gray-300 p-4 text-sm">
              <div v-for="(msg, idx) in chatMessages" :key="idx" class="mb-1 break-words">
                <span class="font-medium text-blue-600">[{{ msg.from }}]:</span>

                <!-- 📝 文本消息 -->
                <span v-if="msg.type === 'text'" class="ml-1">{{
                  msg.body
                }}</span>

                <!-- 🖼️ 图片消息 -->
                <img v-else-if="msg.type === 'image'" :src="msg.body" alt="图片消息"
                  class="ml-1 mt-1 max-w-[200px] rounded border" @click="openImagePreview(msg.body)" />

                <!-- 🔊 语音消息 -->
                <div v-else-if="msg.type === 'audio'" class="ml-1 mt-1 flex items-center">
                  <audio :src="msg.body" controls class="rounded"></audio>
                  <span class="ml-2 text-xs text-gray-500">({{ formatDuration(msg.duration) }})</span>
                </div>

                <!-- 📎 文件消息 -->
                <div v-else-if="msg.type === 'file'" class="ml-1 mt-1">
                  <a :href="msg.body" target="_blank" rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 text-blue-600 hover:underline">
                    📎 {{ msg.fileName || '未知文件' }}
                  </a>
                  <span class="ml-2 text-xs text-gray-500">
                    ({{ formatFileSize(msg.fileSize) }})
                  </span>
                </div>

                <!-- 🧾 系统消息（群提示、自定义等） -->
                <span v-else-if="msg.type === 'system'" class="ml-1 text-[12px] italic text-gray-500">
                  {{ msg.body }}
                </span>

                <!-- ⚠️ 其他完全未知的消息类型（兜底） -->
                <span v-else class="ml-1 text-red-500">[不支持的消息类型: {{ msg.type }}]</span>
              </div>
            </div>
            <div class="mt-auto flex gap-2">
              <input v-model="inputMessage" type="text" placeholder="输入消息..."
                class="flex-1 rounded border border-gray-300 px-2 py-1 text-sm" @keyup.enter="sendChatMessage" />
              <VbenButton size="sm" @click="sendChatMessage">Send</VbenButton>
            </div>
          </div>

          <!-- 底部操作按钮 -->
          <div class="mt-4 flex justify-end gap-4">
            <VbenButton :variant="isAudioEnabled ? 'default' : 'destructive'" size="sm" @click="toggleMute('audio')">
              {{ isAudioEnabled ? 'Mute' : 'Cancel Mute' }}
            </VbenButton>
            <VbenButton :variant="isVideoEnabled ? 'default' : 'destructive'" size="sm" @click="toggleMute('video')">
              {{ isVideoEnabled ? 'Turn off Camera' : 'Turn On Camera' }}
            </VbenButton>
            <!-- <VbenButton variant="default" size="sm" @click="requestToSpeak">
              举手连麦
            </VbenButton> -->
            <VbenButton variant="default" size="sm" @click="leaveRoom">
              Quit
            </VbenButton>
          </div>
        </div>
      </div>

      <!-- 移动端：全屏视频 + 底部控制 -->
      <div v-else class="relative h-full">
        <!-- 全屏视频 -->
        <div class="relative h-full w-full overflow-hidden rounded-lg bg-black">
          <div id="local-video" class="h-full w-full"></div>
          <div class="absolute bottom-2 left-2 right-2 rounded bg-black bg-opacity-60 px-2 py-1 text-xs text-white">
            Speaker: {{ USER_ID }}
          </div>

          <!-- 小窗移到左上角（最多显示2个） -->
          <div v-if="allThumbs.length > 0" class="absolute left-2 top-2 z-10 flex gap-1">
            <div v-for="thumb in allThumbs.slice(0, 2)" :key="thumb.key"
              class="thumb-container relative h-12 w-16 overflow-hidden rounded border border-gray-600 bg-gray-800">
              <div v-if="thumb.type === 'user'" :id="`thumb-${thumb.userId}`" class="h-full w-full"></div>
              <div v-else-if="thumb.type === 'more'"
                class="flex h-full w-full items-center justify-center text-[10px] font-bold text-white">
                +{{ thumb.count }}
              </div>
            </div>
          </div>
        </div>

        <!-- 底部控制栏 -->
        <div class="absolute bottom-0 left-0 right-0 bg-white p-3 shadow-lg">
          <div class="flex items-center gap-2">
            <input v-model="inputMessage" type="text" placeholder="输入消息..."
              class="flex-1 rounded border border-gray-300 px-2 py-1 text-sm" @keyup.enter="sendChatMessage" />
            <VbenButton size="sm" @click="sendChatMessage">Send</VbenButton>
          </div>
          <div class="mt-4 flex justify-end gap-4">
            <VbenButton :variant="isAudioEnabled ? 'default' : 'destructive'" size="sm" @click="toggleMute('audio')">
              {{ isAudioEnabled ? 'Mute' : 'Cancel Mute' }}
            </VbenButton>
            <VbenButton :variant="isVideoEnabled ? 'default' : 'destructive'" size="sm" @click="toggleMute('video')">
              {{ isVideoEnabled ? 'Turn off Camera' : 'Turn On Camera' }}
            </VbenButton>
            <!-- <VbenButton variant="default" size="sm" @click="requestToSpeak">
              举手连麦
            </VbenButton> -->
            <VbenButton variant="default" size="sm" @click="leaveRoom">
              Quit
            </VbenButton>
          </div>
        </div>
      </div>
    </Page>
  </div>
</template>

<style scoped>
@keyframes danmaku-move {
  from {
    transform: translateX(100vw);
  }

  to {
    transform: translateX(-100%);
  }
}

.animate-danmaku {
  left: 0;
  white-space: nowrap;
  text-shadow:
    0 0 2px black,
    0 0 4px rgb(0 0 0 / 80%);
  animation: danmaku-move linear forwards;
}

/* 主画面视频 */
:deep(#local-video > video),
:deep(#local-video > canvas) {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  background: black;
}

/* 小窗视频 */
:deep([id^='thumb-'] > video),
:deep([id^='thumb-'] > canvas) {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  background: #1f2937;
}

/* ✅ 小窗 hover 放大效果 */
.thumb-container {
  z-index: 10;
  transform-origin: bottom right;
}

.thumb-container:hover {
  z-index: 30;
  border-color: #fbbf24;
  box-shadow: 0 0 12px rgb(255 200 0 / 80%);
  transform: scale(2);
}
</style>
