<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted } from 'vue';

import { prompt, useVbenModal, VbenButton } from '@vben/common-ui';

import {
  // ElButton,
  // ElCard,
  ElMessage,
  // ElNotification,
  // ElSegmented,
  // ElSpace,
  // ElTable,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteUserApi, getUserListApi } from '#/api';

// @ts-ignore
import ExtraModal from './modal.vue';

const [Modal, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ExtraModal,
});
// import { MOCK_API_DATA } from '../table-data';

interface RowType {
  username: string;
  role: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
}
const formOptions: VbenFormProps = {
  showDefaultActions: true,
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 默认展开
  collapsed: true,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter category',
        clearable: true,
      },
      defaultValue: '',
      fieldName: 'username',
      label: 'UserName',
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: [
          {
            label: 'ADMIN',
            value: 'ADMIN',
          },
          {
            label: 'TEACHER',
            value: 'TEACHER',
          },
          {
            label: 'STUDENT',
            value: 'STUDENT',
          },
        ],
        placeholder: 'Please Chose',
      },
      fieldName: 'role',
      label: 'Role',
    },
    {
      component: 'DatePicker',
      componentProps: {
        type: 'daterange', // 👈 关键！启用范围选择
        // placeholder: '11',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
        format: 'YYYY-MM-DD',
        clearable: true,
      },
      // defaultValue: [],
      fieldName: 'createdAt',
      label: 'DateRange',
    },
  ],

  submitButtonOptions: {
    content: 'Search',
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};
// 数据实例

// const sleep = (time = 1000) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(true);
//     }, time);
//   });
// };

const gridOptions: VxeGridProps<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '#', type: 'seq', width: 50 },
    // { align: 'left', title: 'Name', type: 'checkbox', width: 100 },
    { field: 'username', title: 'UserName' },
    { field: 'role', title: 'Role' },
    { field: 'name', title: 'Name' },
    { field: 'createdAt', title: 'Creatdate' },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: 'Operate',
      width: 120,
    },
  ],
  // data: [
  //   { username: 'test', role: 'admin' } // ← 手写一条数据
  // ],
  exportConfig: {},
  // pagerConfig: {},
  height: '100%', // 如果设置为 auto，则必须确保存在父节点且不允许存在相邻元素，否则会出现高度闪动问题
  autoResize: true,
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
        return await getUserListData(page, formValues, startDate, endDate);
      },
    },
  },
  toolbarConfig: {
    custom: true,
    export: true,
    // import: true,
    refresh: true,
    zoom: true,
    buttons: [
      // { name: '新增', code: 'myAdd', status: 'primary' },
      // { name: '删除', code: 'myDel', status: 'error' },
      // { name: '保存', code: 'mySave', status: 'success' }
    ],
  },
};

async function getUserListData(
  page: any,
  formValues: any,
  startDate: string,
  endDate: string,
) {
  const res: any = await getUserListApi({
    page: page.currentPage,
    pageSize: page.pageSize,
    ...formValues,
    startDate,
    endDate,
  });
  return {
    result: res.list || [],
    total: res.total || 0,
    currentPage: page.currentPage,
    pageSize: page.pageSize,

  };
}
function showIconConfirm(row: RowType) {
  prompt({
    component: () => { },
    content: 'Confirm whether to delete',
    icon: 'warning',
    modelPropName: 'value',
  }).then(async () => {
    const res: any = await deleteUserApi(row);
    if (res.success === true) {
      ElMessage.success(res.message);
      gridApi.query();
    }
  });
}
function handleAdd() {
  modalApi.open();
}
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
  formOptions,
});
onMounted(() => {
  gridApi.query();
});
</script>

<template>
  <div class="h-[calc(100vh-88px)] w-full p-4">
    <Modal @confrim="gridApi.query()" />
    <Grid>
      <!-- 自定义工具栏左侧区域 -->
      <template #toolbar-actions>
        <VbenButton variant="outline" size="default" @click="handleAdd">
          Add
        </VbenButton>
      </template>
      <template #action="{ row }">
        <VbenButton class="text-red-500 hover:text-red-700" variant="link" size="sm" @click="showIconConfirm(row)">
          delete
        </VbenButton>
      </template>
    </Grid>
  </div>
</template>
