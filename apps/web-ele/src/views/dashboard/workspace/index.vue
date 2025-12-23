<script lang="ts" setup>
import type { Ref } from 'vue';

import type { WorkbenchTrendItem } from '@vben/common-ui';

import { computed, onMounted, ref } from 'vue';

import { VbenLoading, WorkbenchHeader, WorkbenchTrends } from '@vben/common-ui';
import { preferences, usePreferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';

import { activitylogLatstApi, getWeatherApi } from '#/api';

import WeatherBackground from './weatherBackground.vue';
import WeatherParticles from './weatherParticles.vue';

const { contentIsMaximize } = usePreferences();
const userStore = useUserStore();

// 动态计算可用高度
// vben 默认：Header 50px + Tabbar 40px = 90px（正常模式）
// 全屏内容模式时高度为 0
const dynamicHeight = computed(() => {
  return contentIsMaximize.value
    ? 'calc(100vh - 38px)' // 全屏内容模式：占满整个视口
    : 'calc(100vh - 88px)'; // 正常模式：减去 Header(50px) + Tabbar(40px)
});
// const handleResize = () => {
//   window.dispatchEvent(new Event('resize'));
// };
// 这是一个示例数据，实际项目中需要根据实际情况进行调整
// url 也可以是内部路由，在 navTo 方法中识别处理，进行内部跳转
// 例如：url: /dashboard/workspace
// const projectItems: WorkbenchProjectItem[] = [
//   {
//     color: '',
//     content: '不要等待机会，而要创造机会。',
//     date: '2021-04-01',
//     group: '开源组',
//     icon: 'carbon:logo-github',
//     title: 'Github',
//     url: 'https://github.com',
//   },
//   {
//     color: '#3fb27f',
//     content: '现在的你决定将来的你。',
//     date: '2021-04-01',
//     group: '算法组',
//     icon: 'ion:logo-vue',
//     title: 'Vue',
//     url: 'https://vuejs.org',
//   },
//   {
//     color: '#e18525',
//     content: '没有什么才能比努力更重要。',
//     date: '2021-04-01',
//     group: '上班摸鱼',
//     icon: 'ion:logo-html5',
//     title: 'Html5',
//     url: 'https://developer.mozilla.org/zh-CN/docs/Web/HTML',
//   },
//   {
//     color: '#bf0c2c',
//     content: '热情和欲望可以突破一切难关。',
//     date: '2021-04-01',
//     group: 'UI',
//     icon: 'ion:logo-angular',
//     title: 'Angular',
//     url: 'https://angular.io',
//   },
//   {
//     color: '#00d8ff',
//     content: '健康的身体是实现目标的基石。',
//     date: '2021-04-01',
//     group: '技术牛',
//     icon: 'bx:bxl-react',
//     title: 'React',
//     url: 'https://reactjs.org',
//   },
//   {
//     color: '#EBD94E',
//     content: '路是走出来的，而不是空想出来的。',
//     date: '2021-04-01',
//     group: '架构组',
//     icon: 'ion:logo-javascript',
//     title: 'Js',
//     url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript',
//   },
// ];

// 同样，这里的 url 也可以使用以 http 开头的外部链接
// const quickNavItems: WorkbenchQuickNavItem[] = [
//   {
//     color: '#1fdaca',
//     icon: 'ion:home-outline',
//     title: '首页',
//     url: '/',
//   },
//   {
//     color: '#bf0c2c',
//     icon: 'ion:grid-outline',
//     title: '仪表盘',
//     url: '/dashboard',
//   },
//   {
//     color: '#e18525',
//     icon: 'ion:layers-outline',
//     title: '组件',
//     url: '/demos/features/icons',
//   },
//   {
//     color: '#3fb27f',
//     icon: 'ion:settings-outline',
//     title: '系统管理',
//     url: '/demos/features/login-expired', // 这里的 URL 是示例，实际项目中需要根据实际情况进行调整
//   },
//   {
//     color: '#4daf1bc9',
//     icon: 'ion:key-outline',
//     title: '权限管理',
//     url: '/demos/access/page-control',
//   },
//   {
//     color: '#00d8ff',
//     icon: 'ion:bar-chart-outline',
//     title: '图表',
//     url: '/analytics',
//   },
// ];

// const todoItems = ref<WorkbenchTodoItem[]>([
//   {
//     completed: false,
//     content: `审查最近提交到Git仓库的前端代码，确保代码质量和规范。`,
//     date: '2024-07-30 11:00:00',
//     title: '审查前端代码提交',
//   },
//   {
//     completed: true,
//     content: `检查并优化系统性能，降低CPU使用率。`,
//     date: '2024-07-30 11:00:00',
//     title: '系统性能优化',
//   },
//   {
//     completed: false,
//     content: `进行系统安全检查，确保没有安全漏洞或未授权的访问。 `,
//     date: '2024-07-30 11:00:00',
//     title: '安全检查',
//   },
//   {
//     completed: false,
//     content: `更新项目中的所有npm依赖包，确保使用最新版本。`,
//     date: '2024-07-30 11:00:00',
//     title: '更新项目依赖',
//   },
//   {
//     completed: false,
//     content: `修复用户报告的页面UI显示问题，确保在不同浏览器中显示一致。 `,
//     date: '2024-07-30 11:00:00',
//     title: '修复UI显示问题',
//   },
// ]);
const trendItems: Ref<WorkbenchTrendItem[]> = ref([
  // {
  //   avatar: 'svg:avatar-1',
  //   content: `在 <a>开源组</a> 创建了项目 <a>Vue</a>`,
  //   date: '刚刚',
  //   title: '威廉',
  // },
]);

async function activitylogLatst() {
  const res = await activitylogLatstApi();
  res.forEach(
    (e: { content: any; createdAt: any; user: { username: any } }) => {
      trendItems.value.push({
        date: e.createdAt,
        content: e.content,
        title: e.user.username,
        avatar: `svg:avatar-${Math.floor(Math.random() * 4) + 1}`,
      });
    },
  );
}

// const router = useRouter();
// 这是一个示例方法，实际项目中需要根据实际情况进行调整
// This is a sample method, adjust according to the actual project requirements
// function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
//   if (nav.url?.startsWith('http')) {
//     openWindow(nav.url);
//     return;
//   }
//   if (nav.url?.startsWith('/')) {
//     router.push(nav.url).catch((error) => {
//       console.error('Navigation failed:', error);
//     });
//   } else {
//     console.warn(`Unknown URL for navigation item: ${nav.title} -> ${nav.url}`);
//   }
// }
function getGreeting() {
  const now = new Date(); // 获取当前日期和时间
  const hour = now.getHours(); // 从当前时间中提取小时部分

  const greeting =
    // eslint-disable-next-line unicorn/no-nested-ternary
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good night';

  return greeting;
}
const weather: any = ref({});
const iconUrl = computed(() => {
  return `${weather.value.icon}`;
});
async function fetchWeatherByLocation() {
  try {
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10_000,
        });
      },
    );

    const { latitude, longitude } = position.coords;

    // 调你自己的后端，传 lat/lon
    const res = await getWeatherApi({ lat: latitude, lon: longitude });
    weather.value = res;
    loading.value = false;
  } catch {
    console.warn('定位失败，回退到默认城市');
    const res = await getWeatherApi({ city: 'Vitebsk' });
    weather.value = res;
    loading.value = false;
  }
}
const particleType = computed(() => {
  const desc = (weather.value.description || '').toLowerCase();
  if (desc.includes('snow')) return 'snow';
  if (desc.includes('rain')) return 'rain';
  if (desc.includes('mist') || desc.includes('fog')) return 'fog';
  return 'none'; // ✅ 默认值
});
const weatherIconClass = computed(() => {
  const desc = (weather.value.description || '').toLowerCase();
  if (desc.includes('sun') || desc.includes('clear')) return 'icon-sun';
  if (desc.includes('cloud')) return 'icon-cloud';
  if (desc.includes('rain')) return 'icon-rain';
  if (desc.includes('snow')) return 'icon-snow';
  return 'icon-default';
});

const loading = ref(false);
onMounted(async () => {
  loading.value = true;
  fetchWeatherByLocation();
  activitylogLatst();
  // window.addEventListener('resize', handleResize);
});
// onUnmounted(() => {
//   window.removeEventListener('resize', handleResize);
// });
</script>

<template>
  <div class="flex flex-col" :style="{ height: dynamicHeight }">
    <WeatherBackground
      class="flex flex-1 flex-col overflow-hidden"
      :type="weather.description || ''"
    >
      <VbenLoading v-if="loading" :spinning="loading" />
      <WeatherParticles :type="particleType" />
      <div class="flex flex-1 flex-col overflow-hidden p-5">
        <WorkbenchHeader
          class="flex-shrink-0"
          :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
        >
          <template #title>
            {{ getGreeting() }}, {{ userStore.userInfo?.realName }}, Let's get
            started on our workday!
          </template>
          <template #description>
            <span class="font-bold">{{ weather.city }}</span>
            Today {{ weather.description }}，Current temperature：{{
              weather.temp
            }}°C
            <div class="flex items-center">
              <div>
                <p>Feels Like：{{ weather.feels_like }}°C</p>
                <p>
                  Range：{{ weather.temp_min }}°C ~ {{ weather.temp_max }}°C
                </p>
              </div>
              <img
                class="weather-icon ml-3"
                :class="weatherIconClass"
                :src="iconUrl"
                :alt="weather.description"
              />
            </div>
          </template>
        </WorkbenchHeader>

        <div class="flex flex-1 flex-col overflow-hidden">
          <div
            class="mr-4 flex w-full flex-1 flex-col overflow-hidden lg:w-3/5"
          >
            <!-- <WorkbenchProject :items="projectItems" title="项目" @click="navTo" /> -->
            <WorkbenchTrends
              :items="trendItems"
              class="mt-5 flex-1 overflow-auto"
              title="Latest news"
            />
            <!-- <WorkbenchTodo :items="todoItems" class="mt-5" title="待办事项" /> -->
          </div>
          <!-- <div class="w-full lg:w-2/5">
          <WorkbenchQuickNav :items="quickNavItems" class="mt-5 lg:mt-0" title="快捷导航" @click="navTo" />
          <WorkbenchTodo :items="todoItems" class="mt-5" title="待办事项" />
          <AnalysisChartCard class="mt-5" title="访问来源">
            <AnalyticsVisitsSource />
          </AnalysisChartCard>
        </div> -->
        </div>
      </div>
    </WeatherBackground>
  </div>
</template>
<style scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes cloud {
  0%,
  100% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(6px);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-2px);
  }

  75% {
    transform: translateX(2px);
  }
}

.weather-icon {
  width: 64px;
  height: 64px;
}

/* ☀️ 太阳：慢慢旋转 */
.icon-sun {
  animation: rotate 12s linear infinite;
}

/* ☁️ 云：左右飘 */
.icon-cloud {
  animation: cloud 4s ease-in-out infinite;
}

/* 🌧️ 雨：轻微抖动 */
.icon-rain {
  animation: shake 1.2s ease-in-out infinite;
}

/* ❄️ 雪：上下漂 */
.icon-snow {
  animation: cloud 3s ease-in-out infinite;
}

.icon-default {
  animation: cloud 3s ease-in-out infinite;
}
</style>
