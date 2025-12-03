<script lang="ts" setup>
import { ref, watch } from 'vue'; // 👈 不需要 onMounted

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

interface TrafficPoint {
  time: string;
  value: number;
}

const props = defineProps<{
  data: TrafficPoint[];
}>();

const chartRef = ref();
const { renderEcharts } = useEcharts(chartRef);

// ✅ 核心：监听 data 变化，自动重绘
watch(
  () => props.data,
  (newData) => {
    if (!newData || newData.length === 0) {
      // 可选：渲染空图避免白屏
      renderEcharts({
        series: [{ data: [], type: 'line' }],
        xAxis: { data: [] },
        yAxis: { type: 'value' },
      });
      return;
    }

    const xAxisData = newData.map((item) => item.time);
    const seriesData = newData.map((item) => item.value);

    renderEcharts({
      grid: {
        bottom: 0,
        containLabel: true,
        left: '1%',
        right: '1%',
        top: '2%',
      },
      series: [
        {
          areaStyle: {},
          data: seriesData,
          itemStyle: {
            color: '#5ab1ef',
          },
          smooth: true,
          type: 'line',
        },
      ],
      tooltip: {
        axisPointer: {
          lineStyle: {
            color: '#019680',
            width: 1,
          },
        },
        trigger: 'axis',
      },
      xAxis: {
        axisTick: { show: false },
        boundaryGap: false,
        data: xAxisData,
        splitLine: {
          lineStyle: { type: 'solid', width: 1 },
          show: true,
        },
        type: 'category',
      },
      yAxis: [
        {
          axisTick: { show: false },
          splitArea: { show: true },
          splitNumber: 4,
          type: 'value',
        },
      ],
    });
  },
  { immediate: true }, // 👈 关键！立即执行一次（包括初始空数据）
);
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
