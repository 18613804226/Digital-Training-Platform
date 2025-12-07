<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { prompt, useVbenModal, VbenButton } from '@vben/common-ui';
import { ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
// Replace with your course API
import { deleteCourseApi, getCourseApi } from '#/api';

// Modal component (for create/edit)
import ExtraModal from './modal.vue';
import { router } from '#/router';

const [Modal, modalApi] = useVbenModal({
  connectedComponent: ExtraModal,
});

// Define table row data type
interface CourseRow {
  id: string;
  title: string;
  category: string;
  teacher: string;
  createdAt: string;
}

// Form configuration
const formOptions: VbenFormProps = {
  showDefaultActions: true,
  showCollapseButton: true,
  collapsed: true,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Enter course title',
        clearable: true,
      },
      defaultValue: '',
      fieldName: 'title',
      label: 'Course Title',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Enter teacher name',
        clearable: true,
      },
      defaultValue: '',
      fieldName: 'teacher',
      label: 'Teacher',
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: [
          { label: 'Frontend Development', value: 'frontend' },
          { label: 'Backend Development', value: 'backend' },
          { label: 'Database', value: 'database' },
          { label: 'DevOps', value: 'devops' },
          { label: 'Other', value: 'other' },
        ],
        placeholder: 'Select category',
      },
      fieldName: 'category',
      label: 'Category',
    },
    {
      component: 'DatePicker',
      componentProps: {
        type: 'daterange',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
        format: 'YYYY-MM-DD',
        clearable: true,
      },
      fieldName: 'createdAt',
      label: 'Created At',
    },
  ],
  submitButtonOptions: {
    content: 'Search',
  },
  submitOnChange: false,
  submitOnEnter: false,
};

// Grid configuration
const gridOptions: VxeGridProps<CourseRow> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'id',
  },
  columns: [
    { type: 'seq', width: 50, title: '#' },
    { field: 'title', title: 'Course Title' },
    { field: 'category', title: 'Category' },
    { field: 'teacher', title: 'Teacher' },
    { field: 'createdAt', title: 'Created At' },
    {
      field: 'action',
      title: 'Actions',
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  keepSource: true,
  proxyConfig: {
    showLoading: true,
    autoLoad: false,
    ajax: {
      query: async ({ page }, formValues) => {
        let startDate = '';
        let endDate = '';
        if (
          Array.isArray(formValues.createdAt) &&
          formValues.createdAt.length === 2
        ) {
          [startDate, endDate] = formValues.createdAt;
          delete formValues.createdAt; // Remove original field to avoid sending array
        }

        const res: any = await getCourseListData(page, {
          ...formValues,
          startDate,
          endDate,
        });
        return {
          result: res.result || [],
          total: res.page.total || 0,
          currentPage: page.currentPage,
          pageSize: page.pageSize,

        };
      },
    },
  },
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    zoom: true,
    buttons: [],
  },
};

// Fetch course list
async function getCourseListData(
  page: { currentPage: number; pageSize: number },
  params: Record<string, any>,
) {
  const res = await getCourseApi({
    page: page.currentPage,
    pageSize: page.pageSize,
    ...params,
  });

  return {
    result: res.list || [],
    page: {
      total: res.total || 0,
      currentPage: page.currentPage,
      pageSize: page.pageSize,
    },
  };
}
const modalData = ref()

function handleEdit(params: any) {
  modalData.value = params
  modalApi.open();
}
// Delete confirmation
function handleDelete(row: any) {
  // if (currentUserRole.value !== 'ADMIN') {
  //   ElMessage.warning('无权限Operate');
  //   return;
  // }
  prompt({
    component: () => { },
    content: 'Confirm whether to delete',
    icon: 'error',
    modelPropName: 'value',
  }).then(async () => {
    const res: any = await deleteCourseApi(row.id);
    if (res.success === true) {
      ElMessage.success(res.message);
      gridApi.query();
    }
  });
}

// Open create modal
function handleAdd() {
  modalData.value = undefined
  modalApi.open();
}

// Initialize grid & form
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
  formOptions,
});

onMounted(() => {
  gridApi.query();
});
</script>

<template>
  <div class="vp-raw w-full p-4">
    <!-- Create/Edit Modal -->
    <Modal @confirm="gridApi.query()" :modalData="modalData" />

    <!-- Grid Body -->
    <Grid>
      <!-- Toolbar left buttons -->
      <template #toolbar-actions>
        <VbenButton variant="outline" size="default" @click="handleAdd">
          Add Course
        </VbenButton>
      </template>

      <!-- Action column slot -->
      <template #action="{ row }">
        <VbenButton class="" variant="link" size="sm"
          @click="router.push({ name: 'courseDetail', params: { courseId: row.id } })">
          Details
        </VbenButton>
        <VbenButton class="" variant="link" size="sm" @click="handleEdit(row)">
          Edit
        </VbenButton>
        <VbenButton class="text-red-500 hover:text-red-700" variant="link" size="sm" @click="handleDelete(row)">
          Delete
        </VbenButton>
      </template>
    </Grid>
  </div>
</template>
