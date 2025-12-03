<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, VbenLoading, VbenButton } from '@vben/common-ui';

import { ElMessage } from 'element-plus';
import * as faceapi from 'face-api.js';

import { getExamApi } from '#/api';
// Thirdweb
// import { ThirdwebSDK } from '@thirdweb-dev/sdk';
// import { Ethereum } from '@thirdweb-dev/chains';

// 路由
const router = useRouter();

// 考试状态
const questions = ref<any[]>([]);
const selectedAnswers: any = ref<Record<number, string>>({});
const loading = ref(true);
const examStatus = ref(false);
const error = ref('');
const submitted = ref(false);
const score = ref(0);
const blockchainUrl = ref(
  'https://tan-legislative-woodpecker-839.mypinata.cloud/ipfs/bafkreiag6awxj6hhboig4f4hkubldw2edyizznwlqogb6beyntbkzx4lqe',
);

// 考试配置
const examConfig = {
  title: 'End of term',
  totalQuestions: 22,
  timeLimit: 60 * 60, // 1小时
};

// 倒计时
const remainingTime: any = ref(examConfig.timeLimit);
const timer: any = ref<null | number>(null);

// 防作弊状态
const faceVerified = ref(false); // 初始未验证
const windowLocked = ref(true); // 默认禁止切换
let visibilityChangeTimer: any = null;

// 摄像头 & 人脸
const videoRef = ref<HTMLVideoElement | null>(null);
const isFaceDetected = ref(false);
let detectionInterval: any = null;

// 初始化
onMounted(async () => {
  try {
    const res: any = await getExamApi();
    questions.value = res.map((q: any, idx: any) => ({ ...q, id: idx + 1 }));
    loading.value = false;
  } catch {
    error.value = 'Failed to load exam.';
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  clearInterval(timer.value);
  clearInterval(detectionInterval);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  if (videoRef.value) {
    const stream = videoRef.value.srcObject as MediaStream;
    if (stream) stream.getTracks().forEach((track) => track.stop());
  }
});
// ================开始按钮事件==========
async function startExam() {
  // 考试状态
  examStatus.value = true;

  // 启动倒计时
  startTimer();

  // 启动人脸识别
  await initFaceDetection();

  // 监听窗口切换
  document.addEventListener('visibilitychange', handleVisibilityChange);
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
const initFaceDetection = async () => {
  try {
    // 加载模型（需 public/models/ 下有 face-api 模型）
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    ]);

    // 请求摄像头
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      videoRef.value.play();
    }

    // 开始检测
    detectionInterval = setInterval(async () => {
      if (!videoRef.value) return;
      const detections = await faceapi.detectAllFaces(
        videoRef.value,
        new faceapi.TinyFaceDetectorOptions(),
      );
      isFaceDetected.value = detections.length > 0;
      faceVerified.value = isFaceDetected.value;
    }, 2000); // 每2秒检测一次
  } catch {
    // console.log('人脸识别初始化失败:', error_);
    faceVerified.value = false;
  }
};

// ========== 窗口切换监听 ==========
const handleVisibilityChange = () => {
  if (document.hidden) {
    // 用户切换走了
    visibilityChangeTimer = setTimeout(() => {
      ElMessage.warning('检测到你离开了考试页面！系统已记录。');
      // alert('检测到你离开了考试页面！系统已记录。');
      windowLocked.value = false; // 标记违规
    }, 3000); // 3秒内切回不算
  } else {
    clearTimeout(visibilityChangeTimer);
  }
};

// ========== 提交答案 ==========
const submitAllAnswers = async () => {
  clearInterval(timer.value);
  submitted.value = true;

  // 计算得分（假设后端返回正确答案字段为 `correctAnswer`）
  let correct = 0;
  questions.value.forEach((q, index) => {
    // console.log(typeof selectedAnswers.value[index], q.answer);
    if (
      typeof selectedAnswers.value[index] === 'string' &&
      selectedAnswers.value[index].toString().slice(0, 1) === q.answer
    ) {
      correct++;
    }
  });

  score.value = Math.round((correct / questions.value.length) * 100);

  questions.value = [];
  // 上链证书（模拟）
  // await mintCertificate();

  clearInterval(timer.value);
  clearInterval(detectionInterval);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  if (videoRef.value) {
    const stream = videoRef.value.srcObject as MediaStream;
    if (stream) stream.getTracks().forEach((track) => track.stop());
  }
};

// const mintCertificate = async () => {
//   try {
//     const sdk = new ThirdwebSDK(Ethereum);
//     const nftCollection = await sdk.getContract(
//       '0xYourNFTContractAddress', // 替换为你的 Thirdweb NFT 合约地址
//       'nft-collection'
//     );

//     const metadata = {
//       name: `考试证书 - ${examConfig.title}`,
//       description: `考试完成，得分 ${score.value}/100`,
//       image: 'https://your-domain.com/certificate-bg.png', // 证书背景图
//       properties: {
//         score: score.value,
//         exam: examConfig.title,
//         date: new Date().toISOString(),
//       },
//     };

//     const tx = await nftCollection.mintTo(
//       '0xUserWalletAddress', // 实际应为用户钱包地址
//       metadata
//     );
//     const receipt = await tx.receipt;
//     blockchainUrl.value = `https://polygonscan.com/tx/${receipt.transactionHash}`;
//   } catch (err) {
//     console.error('上链失败:', err);
//     blockchainUrl.value = 'https://tan-legislative-woodpecker-839.mypinata.cloud/ipfs/bafkreiag6awxj6hhboig4f4hkubldw2edyizznwlqogb6beyntbkzx4lqe'; // 回退链接
//   }
// };
function openCert() {
  window.open(
    'https://tan-legislative-woodpecker-839.mypinata.cloud/ipfs/bafkreiag6awxj6hhboig4f4hkubldw2edyizznwlqogb6beyntbkzx4lqe',
    '_blank',
  );
}
// ========== 选项变更 ==========
const handleOptionChange = (option: string, questionIndex: number) => {
  selectedAnswers.value[questionIndex] = option;
};
</script>

<template>
  <div class="relative flex h-full flex-col p-4">
    <VbenLoading v-if="loading" :spinning="loading" />
    <!-- 隐藏的视频流（用于人脸识别） -->
    <video ref="videoRef" class="absolute left-0 top-0 h-0 w-0 opacity-0" muted playsinline></video>

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

            <div class="rounded border bg-white p-4 shadow-sm">
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

          <!-- 题目 -->
          <div v-for="(q, index) in questions" :key="index" class="mt-6 rounded border p-4 shadow-sm">
            <p class="mb-4 text-base font-medium">
              {{ index + 1 }}. {{ q.question }}
            </p>
            <div class="ml-2 space-y-2">
              <label v-for="(option, idx) in q.options" :key="idx" :disabled="examStatus === false"
                class="flex cursor-pointer items-start rounded p-2 transition hover:bg-gray-200 dark:hover:bg-gray-700">
                <input type="radio" :value="option" v-model="selectedAnswers[index]" :disabled="examStatus === false"
                  @change="handleOptionChange(option, index)" class="mr-2 mt-1 h-4 w-4 text-blue-600" />
                <span class="">{{ option }}</span>
              </label>
            </div>
          </div>

          <!-- 交卷按钮 -->
          <div v-if="examStatus && !submitted" class="mt-4 flex justify-end">
            <VbenButton variant="default" size="default" @click="submitAllAnswers">
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
