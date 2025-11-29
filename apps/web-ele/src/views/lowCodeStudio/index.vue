<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { confirm, Page, VbenButton } from '@vben/common-ui';

import { createForm } from '@formily/core';
import {
  ArrayItems,
  FormItem,
  Input,
  InputNumber,
  Select,
} from '@formily/element-plus';
import { createSchemaField, FormProvider } from '@formily/vue';
import {
  ElButton,
  ElCard,
  ElCard as ElCardComponent,
  ElDialog,
  ElDivider,
  ElMessage,
} from 'element-plus';

import {
  deleteExamTemplateApi,
  getExamTemplateApi,
  postExamTemplateApi,
  putExamTemplateApi,
} from '#/api';
// 只保留一个 form
const form = createForm();
const { SchemaField } = createSchemaField({
  components: {
    FormItem,
    Input,
    InputNumber,
    Select,
    ArrayItems,
    Card: ElCardComponent,
    Button: ElButton,
  },
});

const questionTypeOptions = [
  { label: '单选题', value: 'single', id: 1 },
  { label: '多选题', value: 'multiple', id: 2 },
  { label: '判断题', value: 'true_false', id: 3 },
  { label: '简答题', value: 'essay', id: 4 },
  { label: '编程题', value: 'coding', id: 5 },
];

const templates = ref<any[]>([
  {
    id: 1,
    name: '新员工入职考试',
    duration: 60,
    sections: [
      { questionType: 'single', count: 10, score: 2, id: 1 },
      { questionType: 'true_false', count: 5, score: 2, id: 2 },
    ],
  },
]);

const activeTemplateId = ref<null | number>(null);
const editingTemplate = ref<any>(null);
const previewVisible = ref(false);
const previewData = ref<any>(null);
const isDragging = ref(false);
const dragCounter = ref(0);

// ✅ 完整 schema：包含基本信息 + sections（用 ArrayItems）
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '模板名称',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
    },
    duration: {
      type: 'number',
      title: '考试时长（分钟）',
      default: 60,
      'x-decorator': 'FormItem',
      'x-component': 'InputNumber',
      'x-component-props': { min: 1, max: 360, step: 5 },
    },
    sections: {
      type: 'array',
      'x-component': 'ArrayItems',
      items: {
        type: 'object',
        'x-component': 'div',
        'x-component-props': {
          style:
            'display: flex; align-items: center; gap: 12px; padding: 8px;margin:8px;border:1px dashed #ccc;border-radius:7px',
        },
        properties: {
          questionType: {
            type: 'string',
            title: '题型',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              options: questionTypeOptions,
              disabled: true,
              size: 'small',
            },
            'x-decorator-props': {
              feedbackLayout: 'none',
              labelStyle: { fontSize: '14px' },
              style: { with: '100px' },
            },
          },
          count: {
            type: 'number',
            title: '数量',
            default: 5,
            'x-decorator': 'FormItem',
            'x-component': 'InputNumber',
            'x-component-props': {
              min: 1,
              max: 100,
              size: 'small',
            },
            'x-decorator-props': {
              feedbackLayout: 'none',
              labelStyle: { fontSize: '14px' },
            },
          },
          score: {
            type: 'number',
            title: '分值',
            default: 2,
            'x-decorator': 'FormItem',
            'x-component': 'InputNumber',
            'x-component-props': {
              min: 1,
              max: 100,
              size: 'small',
            },
            'x-decorator-props': {
              feedbackLayout: 'none',
              labelStyle: { fontSize: '14px' },
            },
          },
          sort: {
            type: 'void',
            'x-component': 'ArrayItems.SortHandle',
            'x-component-props': {
              style: 'cursor: move; color: #9ca3af;',
            },
          },
          remove: {
            type: 'void',
            'x-component': 'Button',
            'x-component-props': {
              innerHTML: 'Delete', // 或 '删除'
              style: `
              color: #ef4444;
              margin-left: 100px;
              cursor: pointer;
              line-height: 20px;
              text-align: center;
              font-size: 14px;
            `,
              onClick: `{{() => {
              const currentId = $self.parent.value.id;
              if (!currentId) return;
              const sections = $form.query('sections').value() || [];
              const newSections = sections.filter(item => item.id !== currentId);
              $form.setValues({ sections: newSections });
              }}}`,
            },
          },
        },
      },
      properties: {
        // 隐藏默认“添加”按钮（因为我们用拖拽）
        // add: {
        //   type: 'void',
        //   title: '添加题型',
        //   'x-component': 'ArrayItems.Addition',
        // },
      },
    },
  },
};

// 工具函数
const getTotalCount = (template: any) =>
  template.sections?.reduce(
    (sum: number, sec: any) => sum + (sec.count || 0),
    0,
  ) || 0;

const getQuestionTypeName = (type: string) => {
  const map: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    true_false: '判断题',
    essay: '简答题',
    coding: '编程题',
  };
  return map[type] || type;
};

// 新建
const createNew = () => {
  editingTemplate.value = null;
  activeTemplateId.value = null;
  form.reset();
  form.setValues({ sections: [] });
};

// 加载模板
const loadTemplate = (item: any) => {
  activeTemplateId.value = item.id;
  editingTemplate.value = { ...item };
  form.setValues({
    name: item.name,
    duration: item.duration,
    sections: item.sections || [],
  });
};

const editTemplate = (item: any) => loadTemplate(item);
const previewTemplate = (item: any) => {
  previewData.value = { ...item };
  previewVisible.value = true;
};

const deleteTemplate = async (id: number) => {
  try {
    showConfirm(id);
  } catch {}
};
function showConfirm(id: null | number) {
  confirm({
    content: 'Are you sure you want to delete?',
    icon: 'error',
  })
    .then(async () => {
      const res = await deleteExamTemplateApi(id);
      if (res.success) {
        ElMessage.success('Delete success');
        getExamTemplateAll();
      }
    })
    .catch(() => {});
}
// 保存
const saveTemplate = () => {
  form
    .submit()
    .then(async (values: any) => {
      let res;
      res = await (activeTemplateId.value
        ? putExamTemplateApi({
            ...values,
            id: activeTemplateId.value,
          })
        : postExamTemplateApi(values));
      if (res.success) {
        ElMessage.success('Create success');
        createNew();
        getExamTemplateAll();
      }
    })
    .catch(() => {
      // ElMessage.error('请检查表单是否填写完整')
    });
};

const cancelEdit = () => createNew();

// 拖拽逻辑：拖入题型到 ArrayItems 区域
const onDragStart = (event: DragEvent, item: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'copy';
  }
};

const onDragEnter = (e: DragEvent) => {
  e.preventDefault();
  dragCounter.value++;
  isDragging.value = true;
};

const onDragLeave = (e: DragEvent) => {
  e.preventDefault();
  dragCounter.value--;
  if (dragCounter.value <= 0) {
    isDragging.value = false;
    dragCounter.value = 0;
  }
};
const onDrop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = false;
  dragCounter.value = 0;

  if (!event.dataTransfer) return;
  const data = event.dataTransfer.getData('application/json');
  if (!data) return;

  const item = JSON.parse(data);
  const current = form.query('sections').value() || [];

  if (current.some((sec: any) => sec?.questionType === item.value)) {
    ElMessage.warning(`题型「${item.label}」已存在，不可重复添加`);
    return;
  }

  const field: any = form.query('sections').take();

  // 安全检查
  if (!field) {
    console.error('❌ 未找到 sections 字段');
    return;
  }

  if (typeof field.append !== 'function') {
    console.error('❌ field.append 不是函数，尝试使用 setValues');
    // 回退方案：直接设置值
    const newSection = {
      questionType: item.value,
      count: 5,
      score: 2,
      id: item.id,
    };
    form.setValues({
      sections: [...current, newSection],
    });
    return;
  }

  // 正常情况
  field.append({
    questionType: item.value,
    count: 5,
    score: 2,
  });
};

async function getExamTemplateAll() {
  const res = await getExamTemplateApi();
  // console.log(res);
  templates.value = res;
}

// async function createTemplate(data) {
//   const res = await postExamTemplateApi(data)
//   console.log(res);
// }
onMounted(() => {
  createNew();
  getExamTemplateAll();
});
</script>

<template>
  <div class="flex h-full gap-6 bg-gray-50 p-4">
    <!-- 左侧：模板列表 -->
    <div class="flex w-1/5 flex-col overflow-hidden">
      <Page class="card-box flex-1 overflow-auto rounded-lg" title="模板列表">
        <!-- <div class="flex justify-between items-center mb-2">
          <VbenButton type="primary" size="sm" @click="createNew">新建</VbenButton>
        </div> -->

        <ElCard
          v-for="item in templates"
          :key="item.id"
          shadow="hover"
          class="mb-2 cursor-pointer rounded-lg border transition-colors hover:border-blue-400"
          :class="{ 'border-blue-500': activeTemplateId === item.id }"
          @click="loadTemplate(item)"
        >
          <div class="flex items-start justify-between">
            <h4 class="text-sm font-medium text-gray-800">{{ item.name }}</h4>
            <span class="text-xs text-gray-500">{{ item.duration }}分钟</span>
          </div>
          <p class="mt-1 text-xs text-gray-500">
            共 {{ getTotalCount(item) }} 题
          </p>
          <div class="mt-2 flex gap-2">
            <VbenButton size="sm" @click.stop="previewTemplate(item)">
              预览
            </VbenButton>
            <VbenButton
              size="sm"
              type="primary"
              plain
              @click.stop="editTemplate(item)"
            >
              编辑
            </VbenButton>
            <VbenButton
              size="sm"
              type="danger"
              @click.stop="deleteTemplate(item.id)"
            >
              删除
            </VbenButton>
          </div>
        </ElCard>
      </Page>
    </div>

    <!-- 中间：试卷画布 -->
    <div class="flex h-full w-3/5 flex-col">
      <Page
        class="card-box relative flex flex-col overflow-hidden rounded-lg"
        :title="
          editingTemplate?.name
            ? `编辑：${editingTemplate.name}`
            : '新建试卷模板'
        "
      >
        <!-- 表单区域（不含按钮） -->
        <div
          class="relative h-full flex-1 overflow-y-auto pb-4 pr-2"
          @dragover.prevent
          @dragenter="onDragEnter"
          @dragleave="onDragLeave"
          @drop="onDrop"
        >
          <FormProvider :form="form">
            <SchemaField :schema="schema" />
          </FormProvider>

          <div
            v-if="!form.query('sections').value()?.length"
            class="py-4 text-center text-gray-400"
          >
            Please drag the question type from the right.
          </div>
          <!-- ✅ 拖拽覆盖层：放在 FormProvider 同级，但仍在 relative 容器内 -->
          <div
            v-show="isDragging"
            class="absolute inset-0 top-24 z-10 rounded-lg"
            style="
              pointer-events: auto;
              background: rgb(66 155 245 / 8%);
              border: 2px dashed #4299e1;
            "
          ></div>
        </div>
        <!-- 按钮区域（固定在底部，不被覆盖） -->
        <div class="absolute bottom-4 right-4">
          <VbenButton @click="cancelEdit">取消</VbenButton>
          <VbenButton class="ml-2" type="primary" @click="saveTemplate">
            保存
          </VbenButton>
        </div>
      </Page>
    </div>

    <!-- 右侧：题型组件库 -->
    <div class="flex w-1/5 flex-col">
      <Page class="card-box flex overflow-hidden rounded-lg" title="题型组件库">
        <div class="flex-1 overflow-y-auto py-2">
          <div
            v-for="item in questionTypeOptions"
            :key="item.value"
            class="m-3 cursor-grab rounded-lg border border-dashed border-blue-200 bg-blue-50 p-3 text-center text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-100"
            draggable="true"
            @dragstart="onDragStart($event, item)"
          >
            {{ item.label }}
          </div>
        </div>
      </Page>
    </div>

    <!-- 预览弹窗 -->
    <ElDialog
      v-model="previewVisible"
      title="试卷模板预览"
      width="600px"
      append-to-body
    >
      <div v-if="previewData" class="space-y-4">
        <h3 class="text-lg font-bold">{{ previewData.name }}</h3>
        <p class="text-sm text-gray-600">
          考试时长：{{ previewData.duration }} 分钟
        </p>
        <ElDivider />
        <div
          v-for="(section, index) in previewData.sections"
          :key="index"
          class="mb-3"
        >
          <div class="font-medium text-gray-800">
            {{ getQuestionTypeName(section.questionType) }}（共
            {{ section.count }} 题，每题 {{ section.score }}
            分）
          </div>
        </div>
      </div>
      <template #footer>
        <VbenButton @click="previewVisible = false">关闭</VbenButton>
      </template>
    </ElDialog>
  </div>
</template>
