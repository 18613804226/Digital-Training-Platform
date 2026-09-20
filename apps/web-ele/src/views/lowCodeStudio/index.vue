<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { confirm, Page, VbenButton } from '@vben/common-ui';

import { createForm, onFieldValueChange } from '@formily/core';
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
  ElOption,
  ElSelect,
} from 'element-plus';

import {
  deleteExamTemplateApi,
  getCourseApi,
  getExamTemplateApi,
  postExamTemplateApi,
  putExamTemplateApi,
} from '#/api';

const form = createForm({
  effects(form) {
    onFieldValueChange('courseId', (field) => {
      const selectedCourse: any = courseOptions.value.find(
        (item: any) => item.value === field.value,
      );
      if (selectedCourse) {
        form.setValues({
          name: selectedCourse.label, // 👈 自动填充模板名称
        });
      }
    });
  },
});
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
  { label: 'Single Choice', value: 'single', id: 1 },
  { label: 'Multiple Choice', value: 'multiple', id: 2 },
  { label: 'True/False', value: 'true_false', id: 3 },
  { label: 'Essay', value: 'essay', id: 4 },
  { label: 'Coding', value: 'coding', id: 5 },
];

const templates = ref<any[]>([
  {
    id: 1,
    name: 'New Employee Onboarding Exam',
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

const showQuestionDrawer = ref(false);

const handleMobileSelect = (e: number) => {
  const id = e;
  if (id) {
    const item = templates.value.find((t) => t.id === Number(id));
    if (item) loadTemplate(item);
  } else {
    createNew();
  }
};

const addQuestionTypeMobile = (item: any) => {
  const current = form.query('sections').value() || [];
  if (current.some((sec: any) => sec?.questionType === item.value)) {
    ElMessage.warning(`Question type "${item.label}" already exists`);
    return;
  }

  const field: any = form.query('sections').take();
  if (field?.append) {
    field.append({
      questionType: item.value,
      count: 5,
      score: 2,
    });
  } else {
    form.setValues({
      sections: [
        ...current,
        {
          questionType: item.value,
          count: 5,
          score: 2,
          id: Date.now(),
        },
      ],
    });
  }
  showQuestionDrawer.value = false;
};
// ------------
const schema = ref({});
const courseOptions = ref([]);
async function getCourseList() {
  const res = await getCourseApi({});
  courseOptions.value = res.list.map((item: { id: any; title: any }) => ({
    label: item.title,
    value: item.id,
  }));

  schema.value = {
    type: 'object',
    properties: {
      courseId: {
        type: 'string',
        title: 'Courses',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          options: courseOptions.value, // 👈 你需要准备这个数组
          placeholder: 'Please select a course',
          filterable: true, // ← 改这里
          // filterOption: (input: string, option: { label: string; }) =>
          //   option.label.toLowerCase().includes(input.toLowerCase()),
        },
      },
      name: {
        type: 'string',
        title: 'Template Name',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      duration: {
        type: 'number',
        title: 'Exam Duration (minutes)',
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
              'display: flex; align-items: center; gap: 12px; padding: 8px;margin:4px 8px;border:1px dashed #ccc;border-radius:7px',
          },
          properties: {
            questionType: {
              type: 'string',
              title: 'Question Type',
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                options: questionTypeOptions,
                disabled: true,
                size: 'small',
              },
              'x-decorator-props': {
                feedbackLayout: 'none',
                labelStyle: { fontSize: '13px' },
              },
            },
            count: {
              type: 'number',
              title: 'Count',
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
                labelStyle: { fontSize: '14px' }, // fixed typo: "with" → "width"
              },
            },
            score: {
              type: 'number',
              title: 'Score',
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
                innerHTML: 'Delete',
                style: `
                color: #ef4444;
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
      },
    },
  };
}
// --------

const getTotalCount = (template: any) =>
  template.sections?.reduce(
    (sum: number, sec: any) => sum + (sec.count || 0),
    0,
  ) || 0;

const getQuestionTypeName = (type: string) => {
  const map: Record<string, string> = {
    single: 'Single Choice',
    multiple: 'Multiple Choice',
    true_false: 'True/False',
    essay: 'Essay',
    coding: 'Coding',
  };
  return map[type] || type;
};

const createNew = () => {
  editingTemplate.value = null;
  activeTemplateId.value = null;
  form.reset();
  form.setValues({ sections: [] });
};

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
        ElMessage.success('Deleted successfully');
        getExamTemplateAll();
      }
    })
    .catch(() => {});
}

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
        ElMessage.success('Saved successfully');
        createNew();
        getExamTemplateAll();
      }
    })
    .catch(() => {});
};

const cancelEdit = () => createNew();

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
    ElMessage.warning(
      `Question type "${item.label}" already exists and cannot be added again`,
    );
    return;
  }

  const field: any = form.query('sections').take();

  if (!field) {
    console.error('❌ Sections field not found');
    return;
  }

  if (typeof field.append !== 'function') {
    console.error(
      '❌ field.append is not a function, falling back to setValues',
    );
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

  field.append({
    questionType: item.value,
    count: 5,
    score: 2,
  });
};

async function getExamTemplateAll() {
  const res = await getExamTemplateApi();
  templates.value = res;
}

onMounted(async () => {
  await getCourseList();
  await createNew();
  await getExamTemplateAll();
});
</script>

<template>
  <div class="h-full">
    <div class="flex h-full flex-col p-2 sm:p-4">
      <!-- Mobile: Template selector at top -->
      <ElCard class="mb-4 sm:hidden">
        <label class="mb-1 block text-sm font-medium text-gray-700"
          >Select Template</label
        >
        <ElSelect
          v-model="activeTemplateId"
          class="w-full rounded p-2"
          @change="handleMobileSelect"
        >
          <ElOption value="" label="Create New Template" />
          <ElOption
            v-for="item in templates"
            :key="item.id"
            :value="item.id"
            :label="item.name"
          />
        </ElSelect>
      </ElCard>

      <!-- Desktop: Three-column layout -->
      <div
        class="hidden h-full gap-4 sm:flex"
        :class="{ 'pointer-events-none opacity-50': isDragging }"
      >
        <!-- Left: Template list -->
        <div class="flex w-1/5 flex-col overflow-hidden">
          <Page
            class="card-box flex-1 overflow-auto rounded-lg"
            title="Template List"
          >
            <ElCard
              v-for="item in templates"
              :key="item.id"
              shadow="hover"
              class="mb-2 cursor-pointer rounded-lg border transition-colors hover:border-blue-400"
              :class="{ 'border-blue-500': activeTemplateId === item.id }"
              @click="loadTemplate(item)"
            >
              <div class="flex items-start justify-between">
                <h4 class="text-sm font-medium text-gray-800">
                  {{ item.name }}
                </h4>
                <span class="text-xs text-gray-500"
                  >{{ item.duration }} min</span
                >
              </div>
              <p class="mt-1 text-xs text-gray-500">
                Total {{ getTotalCount(item) }} questions
              </p>
              <div class="mt-2 flex gap-2">
                <VbenButton size="sm" @click.stop="previewTemplate(item)">
                  Preview
                </VbenButton>
                <VbenButton
                  size="sm"
                  variant="outline"
                  plain
                  @click.stop="editTemplate(item)"
                >
                  Edit
                </VbenButton>
                <VbenButton
                  size="sm"
                  variant="destructive"
                  @click.stop="deleteTemplate(item.id)"
                >
                  Delete
                </VbenButton>
              </div>
            </ElCard>
          </Page>
        </div>

        <!-- Middle: Form canvas -->
        <div class="flex h-full w-3/5 flex-col">
          <Page
            class="card-box relative flex flex-col overflow-hidden rounded-lg"
            :title="
              editingTemplate?.name
                ? `Editing: ${editingTemplate.name}`
                : 'Create New Exam Template'
            "
          >
            <div
              class="relative h-full flex-1 overflow-y-auto pb-16 pr-2"
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
                Drag a question type from the right panel
              </div>

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

            <div class="absolute bottom-4 right-4 flex gap-2">
              <VbenButton variant="outline" @click="cancelEdit">
                Cancel
              </VbenButton>
              <VbenButton variant="default" @click="saveTemplate">
                Save
              </VbenButton>
            </div>
          </Page>
        </div>

        <!-- Right: Question type library -->
        <div class="flex w-1/5 flex-col">
          <Page
            class="card-box flex overflow-hidden rounded-lg"
            title="Question Type Library"
          >
            <div class="flex-1 overflow-y-auto py-2">
              <div
                v-for="item in questionTypeOptions"
                :key="item.value"
                class="m-2 cursor-grab rounded-lg border border-dashed border-blue-200 p-2 text-center text-blue-600 transition-all hover:bg-blue-100"
                draggable="true"
                @dragstart="onDragStart($event, item)"
              >
                {{ item.label }}
              </div>
            </div>
          </Page>
        </div>
      </div>

      <!-- Mobile: Single-column layout -->
      <div class="flex h-full flex-col sm:hidden">
        <Page
          class="card-box relative flex flex-1 flex-col overflow-hidden rounded-lg"
          :title="
            editingTemplate?.name
              ? `Editing: ${editingTemplate.name}`
              : 'Create New Exam Template'
          "
        >
          <div
            class="relative h-full flex-1 overflow-y-auto pb-20 pr-2"
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
              Tap "Add Question Type" below
            </div>

            <div
              v-show="isDragging"
              class="absolute inset-0 top-20 z-10 rounded-lg"
              style="
                pointer-events: auto;
                background: rgb(66 155 245 / 8%);
                border: 2px dashed #4299e1;
              "
            ></div>
          </div>

          <div class="absolute bottom-2 left-2 right-2 flex gap-2">
            <VbenButton block @click="showQuestionDrawer = true">
              Add Question Type
            </VbenButton>
            <VbenButton block @click="cancelEdit">Cancel</VbenButton>
            <VbenButton block type="primary" @click="saveTemplate">
              Save
            </VbenButton>
          </div>
        </Page>
      </div>
    </div>

    <!-- Mobile: Question type drawer -->
    <ElDialog
      v-model="showQuestionDrawer"
      title="Select Question Type"
      width="90%"
      append-to-body
      @close="showQuestionDrawer = false"
    >
      <div class="grid grid-cols-2 gap-3">
        <VbenButton
          v-for="item in questionTypeOptions"
          :key="item.value"
          block
          @click="addQuestionTypeMobile(item)"
        >
          {{ item.label }}
        </VbenButton>
      </div>
    </ElDialog>

    <!-- Preview dialog -->
    <ElDialog
      v-model="previewVisible"
      title="Exam Template Preview"
      width="90%"
      max-width="600px"
      append-to-body
    >
      <div v-if="previewData" class="space-y-4">
        <h3 class="text-lg font-bold">{{ previewData.name }}</h3>
        <p class="text-md text-gray-600">
          Duration: {{ previewData.duration }} minutes
        </p>
        <p class="text-md text-gray-600">
          TotalScore: {{ previewData.totalScore }}
        </p>
        <ElDivider />
        <div
          v-for="(section, index) in previewData.sections"
          :key="index"
          class="mb-3"
        >
          <div class="font-medium text-gray-800">
            {{ getQuestionTypeName(section.questionType) }} (
            {{ section.count }} questions, {{ section.score }} points each )
          </div>
        </div>
      </div>
      <template #footer>
        <VbenButton @click="previewVisible = false">Close</VbenButton>
      </template>
    </ElDialog>
  </div>
</template>
