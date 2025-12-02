<!-- 主页面：例如 src/views/cert/index.vue -->
<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref } from 'vue';

import {
  prompt,
  useVbenDrawer,
  useVbenModal,
  VbenButton,
} from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createCertificategApi,
  deleteCertificategApi,
  getCertificategApi,
} from '#/api';

import CertificateDetailDrawer from './CertificateDetailDrawer.vue'; // 👈 新增导入
import ExtraModal from './modal.vue';

const [Drawer, drawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: CertificateDetailDrawer,
});
// 用户信息
const userStore = useUserStore();
const currentUserRole = computed(() => userStore.userInfo?.role); // 'ADMIN' | 'TEACHER' | 'USER'

// 弹窗
const [Modal, modalApi] = useVbenModal({ connectedComponent: ExtraModal });

// 抽屉状态
const currentRow = ref<any>(null);

interface RowType {
  id: string;
  username: string;
  name: string;
  role: string;
  createdAt: string;
}

// ========================
// 动态表单
// ========================
const formOptions = computed((): VbenFormProps => {
  const baseSchema = [
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter your username.',
        clearable: true,
      },
      defaultValue: '',
      fieldName: 'username',
      label: 'User Name',
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: [
          { label: 'ADMIN', value: 'ADMIN' },
          { label: 'TEACHER', value: 'TEACHER' },
          { label: 'USER', value: 'USER' },
        ],
        placeholder: 'Please select a character',
      },
      fieldName: 'role',
      label: 'Role',
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
      label: 'Date Range',
    },
  ];

  if (currentUserRole.value === 'USER') {
    return {
      ...baseFormConfig,
      schema: baseSchema.filter((s) => s.fieldName === 'createdAt'),
    };
  } else if (currentUserRole.value === 'TEACHER') {
    return {
      ...baseFormConfig,
      schema: baseSchema.filter((s) => s.fieldName !== 'role'),
    };
  }
  return { ...baseFormConfig, schema: baseSchema };
});

const baseFormConfig = {
  showDefaultActions: true,
  showCollapseButton: true,
  collapsed: true,
  submitButtonOptions: { content: 'Search' },
  submitOnChange: false,
  submitOnEnter: false,
};

// ========================
// 动态列
// ========================
const dynamicColumns: any = computed(() => {
  const cols = [{ title: '#', type: 'seq', width: 50 }];

  if (currentUserRole.value === 'ADMIN') {
    return [
      ...cols,
      { field: 'username', title: 'User Name' },
      { field: 'role', title: 'Role' },
      { field: 'name', title: 'Name' },
      { field: 'courseName', title: 'Course Name' },
      { field: 'createdAt', title: 'Issuance Time' },
      {
        field: 'action',
        fixed: 'right',
        slots: { default: 'action' },
        title: 'Operate',
        width: 160,
      },
    ];
  } else if (currentUserRole.value === 'TEACHER') {
    return [
      ...cols,
      { field: 'username', title: 'User Name' },
      { field: 'name', title: 'Name' },
      { field: 'courseName', title: 'Course Name' },
      { field: 'createdAt', title: 'Issuance Time' },
      {
        field: 'action',
        fixed: 'right',
        slots: { default: 'action' },
        title: 'Operate',
        width: 100,
      },
    ];
  } else {
    return [
      ...cols,
      { field: 'courseName', title: 'Course Name' },
      { field: 'name', title: 'Name' },
      { field: 'createdAt', title: 'Issuance Time' },
      {
        field: 'action',
        fixed: 'right',
        slots: { default: 'action' },
        title: 'Operate',
        width: 100,
      },
    ];
  }
});

// ========================
// 表格配置
// ========================
const gridOptions = computed(
  (): VxeGridProps<RowType> => ({
    checkboxConfig:
      currentUserRole.value === 'ADMIN'
        ? { highlight: true, labelField: 'name' }
        : undefined,
    columns: dynamicColumns.value,
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
            startDate = formValues.createdAt[0];
            endDate = formValues.createdAt[1];
            formValues.createdAt = [];
          }

          if (currentUserRole.value === 'USER') {
            formValues.userId = userStore.userInfo?.userId;
          }

          const res: any = await getCertificategApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
            startDate,
            endDate,
            role: userStore.userInfo?.role,
          });

          return {
            result: res.list || [],
            total: res.pagination.total || 0,
            currentPage: page.currentPage,
            pageSize: page.pageSize,
          };
        },
      },
    },
    toolbarConfig: {
      custom: true,
      export: currentUserRole.value === 'ADMIN',
      refresh: true,
      zoom: true,
      buttons: [],
    },
  }),
);

// ========================
// Operate方法
// ========================
function handleAdd() {
  // if (currentUserRole.value !== 'ADMIN') return;
  modalApi.open();
}

function handlePreview(row: RowType) {
  currentRow.value = row;
  drawerApi.open();
}

function showIconConfirm(row: RowType) {
  if (currentUserRole.value !== 'ADMIN') {
    ElMessage.warning('无权限Operate');
    return;
  }
  prompt({
    component: () => {},
    content: 'Confirm whether to delete',
    icon: 'error',
    modelPropName: 'value',
  }).then(async () => {
    const res: any = await deleteCertificategApi(row.id);
    if (res.success === true) {
      ElMessage.success(res.message);
      _gridApi.query();
    }
  });
}

// 抽屉删除回调
function handleDeleteFromDrawer(row: RowType) {
  showIconConfirm(row); // 复用确认逻辑
}

// ========================
// 初始化
// ========================
const gridApi = ref<any>(null);
const [Grid, _gridApi] = useVbenVxeGrid({
  gridOptions: gridOptions.value,
  formOptions: formOptions.value,
});
async function createCertificates(data: any) {
  await createCertificategApi(data);
  gridApi.value?.query();
}
onMounted(() => {
  gridApi.value = _gridApi;
  gridApi.value?.query();
});
</script>

<template>
  <div class="vp-raw w-full p-4">
    <!-- 列表 -->
    <Grid>
      <template #toolbar-actions>
        <VbenButton
          v-access:role="['ADMIN']"
          variant="outline"
          size="default"
          @click="handleAdd"
        >
          Add
        </VbenButton>
      </template>
      <template #action="{ row }">
        <VbenButton variant="link" size="sm" @click="handlePreview(row)">
          PreView
        </VbenButton>
        <VbenButton
          v-access:role="['ADMIN']"
          variant="link"
          size="sm"
          class="text-red-500 hover:text-red-700"
          @click="showIconConfirm(row)"
        >
          Delete
        </VbenButton>
      </template>
    </Grid>

    <!-- 证书详情抽屉 -->
    <Drawer :data="currentRow" @delete="handleDeleteFromDrawer" />

    <!-- 新增/编辑弹窗 -->
    <Modal @confirm="createCertificates" />
  </div>
</template>
