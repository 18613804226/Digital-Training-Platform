<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

// 🔹 定义传入数据类型
interface MonthVisit {
  month: string;
  value: number;
}

// 🔹 接收父组件传入的数据
const props = defineProps<{
  data: MonthVisit[];
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

// 🔁 监听数据变化并渲染图表（关键！）
watch(
  () => props.data,
  (newData) => {
    if (!newData || newData.length === 0) {
      // 可选：渲染空图避免白屏
      renderEcharts({
        series: [{ data: [], type: 'bar' }],
        xAxis: { data: [] },
        yAxis: { type: 'value' },
      });
      return;
    }

    const xAxisData = newData.map((item) => item.month);
    const seriesData = newData.map((item) => item.value);

    renderEcharts({
      grid: {
        bottom: 0,
        containLabel: true,
        left: '1%',
        right: '1%',
        top: '2%', // 👈 修正：原为 '2 %'（多了一个空格）
      },
      series: [
        {
          barMaxWidth: 80,
          data: seriesData, // ✅ 动态数据
          type: 'bar',
        },
      ],
      tooltip: {
        axisPointer: {
          lineStyle: {
            width: 1,
          },
        },
        trigger: 'axis',
      },
      xAxis: {
        data: xAxisData, // ✅ 动态月份
        type: 'category',
      },
      yAxis: {
        splitNumber: 4,
        type: 'value',
      },
    });
  },
  { immediate: true }, // 👈 立即执行一次（包括初始空数组）
);
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
