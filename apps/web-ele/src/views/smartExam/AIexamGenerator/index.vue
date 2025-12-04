<script lang="ts" setup>
import { ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { aiGenerateQuestionsApi, publishExamApi } from '#/api';
// 定义题目类型
interface Question {
  id: number;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

// 表单数据
const form: any = ref({
  subject: '安全',
  difficulty: '中等',
  questionType: '单选题',
  count: 3,
});

const questions = ref<Question[]>([]);
const loading = ref(false);
const error = ref('');
// 生成题目
async function handleGenerate() {
  formApi.validateAndSubmitForm();
}
async function onSubmit(values: Record<string, any>) {
  questions.value = [];
  loading.value = true;
  error.value = '';
  form.value = await formApi.getValues();

  try {
    const response = await aiGenerateQuestionsApi(values);
    questions.value = response;
  } catch {
    error.value = '网络错误，请重试';
  } finally {
    loading.value = false;
  }
}
// const reviewResult = ref<Question[]>([]);
// const reviewing = ref();
// async function handleReview() {
//   reviewing.value = true;
//   reviewResult.value = null;
//   try {
//     const response = await aiReviewQuestionsApi({ questions: questions.value });
//     if (response.code === 0) {
//       reviewResult.value = JSON.stringify(response.data, null, 2);
//     } else {
//       ElMessage.error(response.message);
//     }
//   } catch (err) {
//     ElMessage.error('审题失败');
//   } finally {
//     reviewing.value = false;
//   }
// }
// 一键发布
async function publishing() {
  const data = {
    ...form.value,
    questions: questions.value,
  };
  const res = await publishExamApi(data);
  if (res.success === true) {
    ElMessage.success(res.message);
  }
}
const [QueryForm, formApi] = useVbenForm({
  showDefaultActions: false,
  showCollapseButton: false,
  actionLayout: 'newLine',
  // 默认展开
  collapsed: false,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 50,
  },
  // 提交函数
  handleSubmit: onSubmit,
  layout: 'horizontal',
  schema: [
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [
          {
            label: 'Safety',
            value: 'Safety',
          },
          {
            label: 'technology',
            value: 'technology',
          },
          {
            label: 'manage',
            value: 'manage',
          },
          {
            label: 'Compliance',
            value: 'Compliance',
          },
        ],
        placeholder: 'Please Chose',
        showSearch: true,
      },
      fieldName: 'subject',
      label: 'Subject',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [
          {
            label: 'Simple',
            value: 'Simple',
          },
          {
            label: 'medium',
            value: 'medium',
          },
          {
            label: 'difficulty',
            value: 'difficulty',
          },
        ],
        placeholder: 'Please Chose',
        showSearch: true,
      },
      fieldName: 'difficulty',
      label: 'Difficulty',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [
          {
            label: 'Single choice questions',
            value: 'Single choice questions',
          },
          {
            label: 'Multiple choice questions',
            value: 'Multiple choice questions',
          },
          {
            label: 'Fill in the blanks',
            value: 'Fill in the blanks',
          },
          {
            label: 'Short answer questions',
            value: 'Short answer questions',
          },
        ],
        placeholder: 'Please Chose',
        showSearch: true,
      },
      fieldName: 'questionType',
      label: 'Type',
      rules: 'required',
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'InputNumber',
      // 对应组件的参数
      componentProps: {
        placeholder: 'Please enter the quantity.',
        min: 1, // 最小值
        max: 30, // 最大值
        step: 1, // 步长（可选
      },
      // 字段名
      fieldName: 'count',
      // 界面显示的label
      label: 'count',
      rules: 'required',
    },
  ],
  // submitButtonOptions: {
  //   content: '生成题目',
  // },
  wrapperClass: 'grid-cols-1 md:grid-cols-4',
});
</script>

<template>
  <div class="relative flex h-full flex-col p-4">
    <Page
      class="card-box flex-1 overflow-hidden rounded-lg"
      title="AI - powered question generation (Tongyi Qwen qwen-max)"
      :loading="loading"
      loading-text="AI is thinking... Please wait."
    >
      <!-- 描述区域（可选） -->
      <template #description>
        <div>
          Select the subject, difficulty level, question type, and number of
          questions, and AI will automatically generate training test questions
          for your company.
        </div>
      </template>
      <!-- 题目展示 -->
      <template #default>
        <div v-if="!error" class="mb-5 text-gray-500">
          Click "Generate Questions" to start creating AI test questions.
        </div>
        <!-- 表单区域 -->
        <div class="">
          <QueryForm />
        </div>
        <!-- 操作按钮 -->
        <div class="mb-6 flex justify-end gap-4">
          <VbenButton
            variant="default"
            size="default"
            @click="handleGenerate"
            :disabled="loading"
          >
            {{ loading ? 'AI is posing questions....' : 'Generate Questions' }}
          </VbenButton>
          <!-- <VbenButton variant="default" size="default" :disabled="!questions.length" @click="handleReview">
          AI-based question analysis
        </VbenButton> -->
          <VbenButton
            variant="default"
            size="default"
            :disabled="questions.length === 0"
            @click="publishing"
          >
            One-click Publish
          </VbenButton>
        </div>
        <!-- 错误提示 -->
        <div v-if="error" class="mb-4 rounded bg-red-50 p-3 text-red-700">
          {{ error }}
        </div>
        <div v-if="questions.length > 0">
          <h2 class="mb-3 text-base font-semibold">Generated questions：</h2>
          <div
            v-for="q in questions"
            :key="q.id"
            class="mb-4 rounded border bg-gray-50 p-4"
          >
            <p class="text-sm font-medium">{{ q.id }}. {{ q.question }}</p>
            <!-- 选项 -->
            <div
              v-if="q.options && q.options.length > 0"
              class="ml-4 mt-2 text-sm"
            >
              <div
                v-for="(opt, idx) in q.options"
                :key="idx"
                class="my-1 text-sm"
              >
                {{ opt }}
              </div>
            </div>
            <!-- 答案与解析 -->
            <p class="mt-2 text-sm text-red-600">
              <strong>Answer：</strong>{{ q.answer }}
            </p>
            <p class="mt-1 text-sm text-gray-700">
              <em>Analysis：</em>{{ q.explanation }}
            </p>
          </div>
        </div>
      </template>
    </Page>
  </div>
</template>
