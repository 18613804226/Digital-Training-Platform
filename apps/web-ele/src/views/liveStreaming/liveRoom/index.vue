<!-- src/views/onlineLearning/liveClassroom/index.vue -->

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { ElCheckbox, ElMessage } from 'element-plus';
import TIM from 'tim-js-sdk';
import TRTC from 'trtc-js-sdk';

import { getUserSigApi } from '#/api';
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
const chatMessages = ref<Array<{ body: string; from: string }>>([]);
const showDanmaku = ref(false);
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
        const thumbEl = document.getElementById(`thumb-${userId}`);
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

      const thumbEl = document.getElementById(`thumb-${userId}`);
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
    timInstance.setLogLevel(1);

    timInstance.on(TIM.EVENT.MESSAGE_RECEIVED, (event: any) => {
      event.data.forEach((msg: any) => {
        if (msg.type === 'TIMTextElem') {
          const content = msg.payload.text;
          const from = msg.from;
          chatMessages.value.push({ from, body: content });
          addDanmaku(content);
          scrollToBottom();
        }
      });
    });

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
    console.log('TRTC + TIM 初始化成功');
  } catch (error: any) {
    console.error('初始化失败:', error);
    ElMessage.error(error.message || '无法连接直播服务');
    joining.value = false;
  }
};

const sendChatMessage = async () => {
  if (!inputMessage.value.trim() || !timInstance) return;

  const text = inputMessage.value.trim();
  const selfMsg = { from: USER_ID, body: text };

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

const requestToSpeak = () => {
  ElMessage.info('已发送连麦请求，请等待老师同意');
};

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.max-h-48.overflow-y-auto');
    if (container) container.scrollTop = container.scrollHeight;
  });
};

const leaveRoom = () => {
  if (localStream) localStream.close();
  if (trtcClient) {
    trtcClient.leave().finally(() => trtcClient.destroy());
  }
  if (timInstance) {
    timInstance.logout();
  }
  ElMessage.success('已退出教室');
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
      <div
        v-for="(dm, idx) in danmakuList"
        :key="idx"
        class="animate-danmaku absolute whitespace-nowrap text-sm font-bold text-white"
        :style="{ top: `${dm.top}px`, animationDuration: `${dm.duration}s` }"
      >
        {{ dm.text }}
      </div>
    </div>

    <!-- Page 容器 -->
    <Page
      class="card-box relative flex-1 overflow-hidden rounded-lg"
      title="Online live classroom (Tencent Cloud · TRTC + IM)"
      :loading="joining"
      loading-text="正在加入直播间..."
    >
      <!-- 顶部信息（仅桌面显示） -->
      <template #description>
        <div
          v-if="!isMobile"
          class="flex justify-between text-sm text-gray-600"
        >
          <span>Course: xx</span>
          <span>Online users：{{ onlineCount }} 人</span>
        </div>
      </template>

      <!-- 桌面端：左右布局 -->
      <div v-if="!isMobile" class="flex h-full gap-6">
        <!-- 左侧：视频区域 -->
        <div class="relative flex-1">
          <div
            class="relative h-full w-full overflow-hidden rounded-lg bg-black"
          >
            <div id="local-video" class="relative h-full w-full"></div>
            <div
              class="absolute bottom-2 left-2 right-2 rounded bg-black bg-opacity-60 px-2 py-1 text-xs text-white"
            >
              Speaker：{{ USER_ID }}
            </div>

            <!-- 画中画小窗（右下角） -->
            <div
              v-if="allThumbs.length > 0"
              class="absolute bottom-4 right-4 z-10 flex gap-2"
            >
              <div
                v-for="(thumb, index) in allThumbs"
                :key="thumb.key"
                class="thumb-container relative h-16 w-24 cursor-pointer overflow-hidden rounded border border-gray-600 bg-gray-800 transition-all duration-200"
              >
                <template v-if="thumb.type === 'user'">
                  <div
                    :id="`thumb-${thumb.userId}`"
                    class="h-full w-full"
                  ></div>
                  <div
                    class="absolute bottom-0 left-0 right-0 truncate bg-black bg-opacity-50 px-1 text-[10px] text-white"
                  >
                    {{ thumb.name }}
                  </div>
                </template>
                <template v-else-if="thumb.type === 'more'">
                  <div
                    class="flex h-full w-full items-center justify-center text-xs font-bold text-white"
                  >
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
              ref="chatContainer"
              class="no-scrollbar mb-2 min-h-0 flex-1 overflow-y-auto text-sm"
            >
              <div
                v-for="(msg, idx) in chatMessages"
                :key="idx"
                class="mb-1 break-words"
              >
                <span class="font-medium text-blue-600">[{{ msg.from }}]:</span>
                <span class="ml-1">{{ msg.body }}</span>
              </div>
            </div>
            <div class="mt-auto flex gap-2">
              <input
                v-model="inputMessage"
                type="text"
                placeholder="输入消息..."
                class="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                @keyup.enter="sendChatMessage"
              />
              <VbenButton size="sm" @click="sendChatMessage">Send</VbenButton>
            </div>
          </div>

          <!-- 底部操作按钮 -->
          <div class="mt-4 flex justify-end gap-4">
            <VbenButton
              variant="default"
              size="sm"
              @click="toggleMute('audio')"
              :class="{ 'bg-red-500': !isAudioEnabled }"
            >
              {{ isAudioEnabled ? '静音' : '取消静音' }}
            </VbenButton>
            <VbenButton
              variant="default"
              size="sm"
              @click="toggleMute('video')"
              :class="{ 'bg-red-500': !isVideoEnabled }"
            >
              {{ isVideoEnabled ? '关摄像头' : '开摄像头' }}
            </VbenButton>
            <VbenButton variant="default" size="sm" @click="requestToSpeak">
              举手连麦
            </VbenButton>
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
          <div
            class="absolute bottom-2 left-2 right-2 rounded bg-black bg-opacity-60 px-2 py-1 text-xs text-white"
          >
            Speaker：{{ USER_ID }}
          </div>

          <!-- 小窗移到左上角（最多显示2个） -->
          <div
            v-if="allThumbs.length > 0"
            class="absolute left-2 top-2 z-10 flex gap-1"
          >
            <div
              v-for="(thumb, index) in allThumbs.slice(0, 2)"
              :key="thumb.key"
              class="thumb-container relative h-12 w-16 overflow-hidden rounded border border-gray-600 bg-gray-800"
            >
              <div
                v-if="thumb.type === 'user'"
                :id="`thumb-${thumb.userId}`"
                class="h-full w-full"
              ></div>
              <div
                v-else-if="thumb.type === 'more'"
                class="flex h-full w-full items-center justify-center text-[10px] font-bold text-white"
              >
                +{{ thumb.count }}
              </div>
            </div>
          </div>
        </div>

        <!-- 底部控制栏 -->
        <div class="absolute bottom-0 left-0 right-0 bg-white p-3 shadow-lg">
          <div class="flex items-center gap-2">
            <input
              v-model="inputMessage"
              type="text"
              placeholder="输入消息..."
              class="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
              @keyup.enter="sendChatMessage"
            />
            <VbenButton size="sm" @click="sendChatMessage">发送</VbenButton>
          </div>
          <div class="mt-2 flex flex-wrap justify-center gap-2">
            <VbenButton
              size="sm"
              @click="toggleMute('audio')"
              :class="{ 'bg-red-500': !isAudioEnabled }"
            >
              {{ isAudioEnabled ? '静音' : '取消静音' }}
            </VbenButton>
            <VbenButton
              size="sm"
              @click="toggleMute('video')"
              :class="{ 'bg-red-500': !isVideoEnabled }"
            >
              {{ isVideoEnabled ? '关摄像头' : '开摄像头' }}
            </VbenButton>
            <VbenButton size="sm" @click="requestToSpeak">举手</VbenButton>
            <VbenButton size="sm" variant="heavy" @click="leaveRoom">
              退出
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
