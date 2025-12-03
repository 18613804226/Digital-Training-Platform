<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';

// import { VbenLoading } from '@vben-core/shadcn-ui';
import { computed, onMounted, ref } from 'vue';

import {
  AnalysisChartsTabs,
  AnalysisOverview,
  Spinner,
} from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';

import { getDashboardApi, trackPageApi } from '#/api';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisits from './analytics-visits.vue';

const loading = ref(false);
onMounted(async () => {
  loading.value = true;
  await trackPageApi();
  await getDashboard();
  loading.value = false;
});

// Define data types
interface TrafficPoint {
  time: string;
  value: number;
}

interface MonthlyVisitsType {
  month: string;
  value: number;
}

interface DashboardResult {
  trafficTrend: TrafficPoint[];
  monthlyVisits: MonthlyVisitsType[];
  totalVisits: number;
  userCount: number;
  totalUsers: number;
  totalDownloads: number;
  totalUsage: number;
  usageCount: number;
  downloadCount: number;
  visitCount: number;
  // ...other fields
}

const result = ref<DashboardResult>({
  trafficTrend: [],
  monthlyVisits: [],
  totalVisits: 0,
  userCount: 0,
  totalUsers: 0,
  totalDownloads: 0,
  totalUsage: 0,
  usageCount: 0,
  downloadCount: 0,
  visitCount: 0,
});

async function getDashboard() {
  result.value = await getDashboardApi();
}

// Dynamically compute overview items
const overviewItems = computed<AnalysisOverviewItem[]>(() => {
  if (!result.value) {
    return [
      {
        icon: SvgCardIcon,
        title: 'Users',
        totalTitle: 'Total Users',
        totalValue: 0,
        value: 0,
      },
      {
        icon: SvgCakeIcon,
        title: 'Visits',
        totalTitle: 'Total Visits',
        totalValue: 0,
        value: 0,
      },
      {
        icon: SvgDownloadIcon,
        title: 'Downloads',
        totalTitle: 'Total Downloads',
        totalValue: 0,
        value: 0,
      },
      {
        icon: SvgBellIcon,
        title: 'Usage',
        totalTitle: 'Total Usage',
        totalValue: 0,
        value: 0,
      },
    ];
  }
  const data = result.value;
  return [
    {
      icon: SvgCardIcon,
      title: 'Users',
      totalTitle: 'Total Users',
      totalValue: data.totalUsers,
      value: data.userCount,
    },
    {
      icon: SvgCakeIcon,
      title: 'Visits',
      totalTitle: 'Total Visits',
      totalValue: data.totalVisits,
      value: data.visitCount,
    },
    {
      icon: SvgDownloadIcon,
      title: 'Downloads',
      totalTitle: 'Total Downloads',
      totalValue: data.totalDownloads,
      value: data.downloadCount,
    },
    {
      icon: SvgBellIcon,
      title: 'Usage',
      totalTitle: 'Total Usage',
      totalValue: data.totalUsage,
      value: data.usageCount,
    },
  ];
});

const chartTabs: TabOption[] = [
  {
    label: 'Traffic Trends',
    value: 'trends',
  },
  {
    label: 'Monthly Visits',
    value: 'visits',
  },
];
</script>
<template>
  <div class="p-5">
    <Spinner v-if="loading" :spinning="loading" />
    <AnalysisOverview :items="overviewItems" />
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends :data="result.trafficTrend" />
      </template>
      <template #visits>
        <AnalyticsVisits :data="result.monthlyVisits" />
      </template>
    </AnalysisChartsTabs>
  </div>
</template>
