<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, VbenButton, VbenLoading } from '@vben/common-ui';

import { ElMessage } from 'element-plus';
import * as faceapi from 'face-api.js';

import { getExamApi, submitExamApi } from '#/api';
// 路由
const router = useRouter();

// 考试状态
const questions = ref<any[]>([]);
const selectedAnswers = ref<Record<number, string | string[]>>({});
const loading = ref(true);
const examStatus = ref(false);
const error = ref('');
const submitted = ref(false);
const score = ref(0);
const blockchainUrl = ref(
  // 'https://tan-legislative-woodpecker-839.mypinata.cloud/ipfs/bafkreiag6awxj6hhboig4f4hkubldw2edyizznwlqogb6beyntbkzx4lqe',
  '/myCertificates',
);

// 考试配置
const examConfig = ref({
  id: 0,
  title: 'End of term',
  totalQuestions: 22,
  timeLimit: 60 * 60, // 1小时
});

// 倒计时
const remainingTime: any = ref(examConfig.value.timeLimit);
const timer: any = ref<null | number>(null);

// 防作弊状态
const faceVerified = ref(false); // 初始未验证
const windowLocked = ref(true); // 默认禁止切换
let visibilityChangeTimer: any = null;

// 替换原来的 videoRef
const detectionVideoRef = ref<HTMLVideoElement | null>(null); // 用于后台检测（可隐藏）
const previewVideoRef = ref<HTMLVideoElement | null>(null); // 用于前台预览（可见）
const isFaceDetected = ref(false);
let detectionInterval: any = null;

// 初始化
onMounted(async () => {
  try {
    const res: any = await getExamApi();
    examConfig.value.title = res.title;
    examConfig.value.totalQuestions = res.questions.length;
    examConfig.value.timeLimit = res.duration;
    examConfig.value.id = res.examId;
    questions.value = res.questions.map((q: any, idx: any) => ({
      ...q,
      id: idx + 1,
      questionId: q.id,
    }));
    loading.value = false;
  } catch {
    error.value = 'Failed to load exam.';
  } finally {
    loading.value = false;
  }
});

// 修改 onUnmounted
onUnmounted(() => {
  stopCamera(); // 复用同一个清理函数
});
let currentStream: MediaStream | null = null;

// 封装统一的摄像头停止函数
const stopCamera = () => {
  // 方法1：通过 ref 停止（用于正常卸载）
  [detectionVideoRef, previewVideoRef].forEach((ref) => {
    const stream = ref.value?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((track) => {
        if (track.readyState !== 'ended') {
          track.stop();
        }
      });
      if (ref.value) ref.value.srcObject = null;
    }
  });

  // 方法2：通过保存的 stream 引用停止（更可靠，尤其页面关闭时）
  if (currentStream) {
    currentStream.getTracks().forEach((track) => {
      if (track.readyState !== 'ended') {
        track.stop();
      }
    });
    currentStream = null;
  }

  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }

  document.removeEventListener('visibilitychange', handleVisibilityChange);
  showPreview.value = false;
  faceVerified.value = false;
  consecutiveDetected.value = 0;
};
// ================开始按钮事件==========
async function startExam() {
  // 考试状态
  examStatus.value = true;

  // 启动倒计时
  startTimer();

  // 启动人脸识别
  // await initFaceDetection();
  await startCamera();

  // 监听窗口切换
  document.addEventListener('visibilitychange', handleVisibilityChange);
}
// 在 data 中添加
const consecutiveDetected = ref(0); // 连续检测到的次数
// const requiredConsecutive = 3; // 需要连续检测 3 次才算通过
async function startCamera() {
  try {
    // 🔥 第一步：加载模型（只加载一次即可）
    if (!faceapi.nets.tinyFaceDetector.params) {
      ElMessage.info('Loading face detection model...');
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      // 如果你还用 landmarks（比如后续做人脸对齐），也加载：
      // await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    }
    showPreview.value = true;
    // 第二步：获取摄像头
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    currentStream = stream; // 👈 关键：保存全局引用
    if (!window.hasCameraCleanup) {
      const cleanup = () => stopCamera();
      window.addEventListener('beforeunload', cleanup);
      window.addEventListener('unload', cleanup);
      window.hasCameraCleanup = true; // ✅ 现在类型安全了
    }
    if (detectionVideoRef.value) {
      detectionVideoRef.value.srcObject = stream;
      detectionVideoRef.value.play();
    }
    if (previewVideoRef.value) {
      previewVideoRef.value.srcObject = stream;
      try {
        await previewVideoRef.value.play();
      } catch {
        ElMessage.error('Failed to display camera feed.');
        return;
      }
    }

    consecutiveDetected.value = 0;
    faceVerified.value = false;

    // 第三步：开始检测
    detectionInterval = setInterval(async () => {
      if (!detectionVideoRef.value) return;

      const detections = await faceapi.detectAllFaces(
        detectionVideoRef.value,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.4,
        }),
      );

      if (detections.length > 0) {
        consecutiveDetected.value++;
        if (consecutiveDetected.value >= 3) {
          faceVerified.value = true;
        }
      } else {
        consecutiveDetected.value = 0;
        faceVerified.value = false;
      }
      isFaceDetected.value = detections.length > 0;
      faceVerified.value = isFaceDetected.value;
    }, 500);
  } catch (error_) {
    console.error('Camera or face detection error:', error_);
    ElMessage.error('Failed to start camera or load model.');
  }
}
// ========== 倒计时 ==========
const startTimer = () => {
  if (timer.value) clearInterval(timer.value);
  timer.value = window.setInterval(() => {
    remainingTime.value--;
    if (remainingTime.value <= 0) {
      submitAllAnswers();
    }
  }, 1000);
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// ========== 人脸识别 ==========
const showPreview = ref(false);
// ========== 窗口切换监听 ==========
const handleVisibilityChange = () => {
  if (document.hidden) {
    visibilityChangeTimer = setTimeout(() => {
      // 用非阻塞提示替代 alert
      ElMessage.warning('检测到你离开了考试页面！系统已记录。');
      windowLocked.value = false; // 标记违规
    }, 3000); // 3秒内切回不算违规
  } else {
    clearTimeout(visibilityChangeTimer);
  }
};

const submitLoading = ref(false);
// ========== 提交答案 ==========
const submitAllAnswers = async () => {
  if (!faceVerified.value) {
    ElMessage.error('Facial verification is required before submission.');
    return;
  }
  try {
    ElMessage.info('AI is judging the problem, please wait a moment...');
    submitLoading.value = true;
    // 📤 提交答案
    const payload = {
      examId: examConfig.value.id,
      answers: Object.entries(selectedAnswers.value).map(([index, value]) => ({
        questionId: questions.value[Number(index)].questionId,
        userAnswer: value,
      })),
    };
    const res = await submitExamApi(payload);
    if (res.passed) {
      ElMessage.success(res.message);
      submitted.value = true;
      score.value = res.totalScore;
      questions.value = [];
      stopCamera(); // 👈 统一调用！
      clearInterval(timer.value);
    }
  } finally {
    submitLoading.value = false;
  }
};

function openCert() {
  window.open(
    'https://tan-legislative-woodpecker-839.mypinata.cloud/ipfs/bafkreiag6awxj6hhboig4f4hkubldw2edyizznwlqogb6beyntbkzx4lqe',
    '_blank',
  );
}
// ========== 选项变更 ==========
const handleMultipleChange = (
  questionIndex: number,
  option: string,
  checked: boolean,
) => {
  // 初始化为空数组（如果还没选过）
  if (!selectedAnswers.value[questionIndex]) {
    selectedAnswers.value[questionIndex] = [];
  }

  const current = selectedAnswers.value[questionIndex] as string[];

  if (checked) {
    // 勾选：添加选项（去重）
    if (!current.includes(option)) {
      selectedAnswers.value[questionIndex] = [...current, option];
    }
  } else {
    // 取消勾选：移除选项
    selectedAnswers.value[questionIndex] = current.filter(
      (opt) => opt !== option,
    );
  }
};
</script>

<template>
  <div class="relative flex h-full flex-col p-4">
    <VbenLoading v-if="loading" :spinning="loading" />
    <!-- 后台检测用（可继续隐藏） -->
    <video ref="detectionVideoRef" class="absolute left-0 top-0 h-0 w-0 opacity-0" muted playsinline></video>

    <Page class="card-box flex-1 overflow-hidden rounded-lg" title="Exam - Answer Questions">
      <!-- <template #description>
        <div>
          正式考试（防作弊模式已开启）
        </div>
      </template> -->

      <template #default>
        <div v-if="error" class="mb-4 rounded bg-red-50 p-3 text-red-700">
          {{ error }}
        </div>
        <div v-if="examStatus === false" class="flex justify-end">
          <VbenButton variant="default" size="sm" @click="startExam">
            Start Exam
          </VbenButton>
        </div>
        <div class="space-y-4">
          <div v-if="examStatus === true">
            <!-- 考试信息 -->
            <div class="rounded border border-gray-700 bg-gray-800 p-3 text-white">
              <div class="text-sm font-medium">
                Formal exam (anti-cheating mode is now enabled)
              </div>
            </div>

            <div class="flex flex-row justify-between rounded border bg-white p-4 shadow-sm">
              <div>
                <div class="mb-2 text-sm text-gray-700">
                  <strong>Exam Name：</strong>{{ examConfig.title }}
                </div>
                <div class="mb-2 flex items-center text-sm text-gray-700">
                  <strong>Time Left：</strong>
                  <span class="countdown-timer ml-1 font-mono">
                    {{ formatTime(remainingTime) }} ⏰
                  </span>
                </div>
                <div class="text-sm text-gray-700">
                  <strong>Current number</strong>
                  {{ Object.values(selectedAnswers).length }}/{{
                    questions.length
                  }}
                  question
                </div>
              </div>

              <!-- 前台预览用（可见） -->
              <div v-if="showPreview" class="mt-0 flex justify-center">
                <div class="relative inline-block overflow-hidden rounded-lg border border-gray-300 shadow-sm">
                  <video ref="previewVideoRef" autoplay muted playsinline class="h-28 w-44 object-cover"></video>
                  <div
                    class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 px-2 py-1 text-center text-xs text-white">
                    {{
                      isFaceDetected
                        ? '✅ Face detected'
                        : '⚠️ No face detected'
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 防作弊状态 -->
          <div v-if="examStatus === true" class="rounded border bg-gray-50 p-3">
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center">
                <span class="mr-2">Facial recognition (hold for two seconds)：</span>
                <span v-if="faceVerified" class="text-green-600">✅ Verified</span>
                <span v-else class="text-red-600">❌ Unverified</span>
              </div>
              <div class="flex items-center">
                <span class="mr-2">Disable window switching：</span>
                <span v-if="windowLocked" class="text-red-600">⚠️ Prohibit</span>
                <span v-else class="text-orange-600">❌ Left</span>
              </div>
            </div>
          </div>
          <!-- 违规提示条 -->
          <div v-if="!windowLocked && examStatus" class="mt-2 rounded border border-red-300 bg-red-50 p-2">
            <div class="text-center text-sm font-medium text-red-700">
              ⚠️ It has been detected that you left the exam page; this has been
              recorded by the system.
            </div>
          </div>
          <!-- 题目 -->
          <div v-for="(q, index) in questions" :key="index" class="mt-6 rounded border p-4 shadow-sm">
            <p class="mb-4 text-base font-medium">
              {{ index + 1 }}. {{ q.question }}
            </p>

            <!-- 单选题 -->
            <div v-if="q.questionType === 'single'" class="ml-2 space-y-2">
              <label v-for="(option, idx) in q.options" :key="idx" class="flex cursor-pointer items-start rounded p-2">
                <input type="radio" :value="option" v-model="selectedAnswers[index]" :disabled="examStatus === false"
                  class="mr-2 mt-1 h-4 w-4 text-blue-600" />
                <span>{{ option }}</span>
              </label>
            </div>

            <!-- 多选题 -->
            <div v-else-if="q.questionType === 'multiple'" class="ml-2 space-y-2">
              <label v-for="(option, idx) in q.options" :key="idx" class="flex cursor-pointer items-start rounded p-2">
                <input type="checkbox" :value="option" :checked="Array.isArray(selectedAnswers[index]) &&
                  selectedAnswers[index].includes(option)
                  " @change="
                    (e) =>
                      handleMultipleChange(
                        index,
                        option,
                        (e.target as HTMLInputElement).checked,
                      )
                  " :disabled="!examStatus" class="mr-2 mt-1 h-4 w-4 text-blue-600" />
                <span>{{ option }}</span>
              </label>
            </div>

            <!-- 判断题 -->
            <div v-else-if="q.questionType === 'true_false'" class="ml-2 space-y-2">
              <label class="flex items-center">
                <input type="radio" value="true" v-model="selectedAnswers[index]" :disabled="examStatus === false"
                  class="mr-2" />
                True
              </label>
              <label class="flex items-center">
                <input type="radio" value="false" v-model="selectedAnswers[index]" :disabled="examStatus === false"
                  class="mr-2" />
                False
              </label>
            </div>

            <!-- 简答题 -->
            <div v-else-if="q.questionType === 'essay'" class="ml-2">
              <textarea v-model="selectedAnswers[index]" :disabled="examStatus === false" rows="4"
                class="w-full rounded border p-2" placeholder="请输入答案..."></textarea>
            </div>

            <!-- 编程题 -->
            <div v-else-if="q.questionType === 'coding'" class="ml-2">
              <textarea v-model="selectedAnswers[index]" :disabled="examStatus === false" rows="8"
                class="w-full rounded border p-2 font-mono" placeholder="请输入代码..."></textarea>
              <p class="mt-2 text-xs text-gray-500">
                语言：{{ q.answer?.language || '未指定' }}
              </p>
            </div>
          </div>

          <!-- 交卷按钮 -->
          <div v-if="examStatus && !submitted" class="mt-4 flex justify-end">
            <VbenButton :loading="submitLoading" variant="default" size="default" @click="submitAllAnswers">
              Submit Exam
            </VbenButton>
          </div>

          <!-- 交卷结果 -->
          <div v-if="submitted" class="mt-6 rounded border border-blue-200 bg-blue-50 p-4">
            <div class="text-lg font-bold text-blue-800">
              Exam complete! Score：{{ score }}/100
            </div>
            <div class="mt-1 text-sm text-blue-700">
              Scoring complete, certificate uploaded to blockchain！
            </div>
            <div class="mt-1 break-all text-sm text-blue-700">
              Blockchain certificate link：<a :href="blockchainUrl" target="_blank" class="text-blue-600 underline">{{
                blockchainUrl }}</a>
            </div>
            <div class="mt-3 flex space-x-2">
              <VbenButton variant="default" size="sm" @click="openCert">
                View Certificate
              </VbenButton>
              <VbenButton variant="default" size="sm" @click="router.push('/')">
                Return to Homepage
              </VbenButton>
            </div>
          </div>
        </div>
      </template>
    </Page>
  </div>
</template>
<style scoped>
/* stylelint-disable-next-line keyframes-name-pattern */
@keyframes pulseRed {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.countdown-timer {
  color: #ef4444;
  animation: pulseRed 1s infinite;
}
</style>
