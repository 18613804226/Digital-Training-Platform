<script setup lang="ts">
import type { Props } from './types';

import { ref } from 'vue';

import { preferences } from '@vben-core/preferences';
import {
  Card,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  VbenAvatar,
} from '@vben-core/shadcn-ui';

import { Page } from '../../components';

defineOptions({
  name: 'ProfileUI',
});

withDefaults(defineProps<Props>(), {
  title: '关于项目',
  tabs: () => [],
});
const isMobile: any = ref(window.innerWidth < 768);
window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth < 768;
});

const tabsValue = defineModel<string>('modelValue');
</script>
<template>
  <Page auto-content-height>
    <!-- 桌面端：左右布局 -->
    <div v-if="!isMobile" class="flex h-full w-full">
      <Card class="w-1/6 flex-none">
        <div class="mt-4 flex h-40 flex-col items-center justify-center gap-4">
          <VbenAvatar
            :src="userInfo?.avatar ?? preferences.app.defaultAvatar"
            class="size-20"
          />
          <span class="text-lg font-semibold">
            {{ userInfo?.realName ?? '' }}
          </span>
          <span class="text-foreground/80 text-sm">
            {{ userInfo?.username ?? '' }}
          </span>
        </div>
        <Separator class="my-4" />
        <Tabs v-model="tabsValue" orientation="vertical" class="m-4">
          <TabsList class="bg-card grid w-full grid-cols-1">
            <TabsTrigger
              v-for="tab in tabs"
              :key="tab.value"
              :value="tab.value"
              class="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-12 justify-start"
            >
              {{ tab.label }}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>
      <Card class="ml-4 w-5/6 flex-auto p-8">
        <slot name="content"></slot>
      </Card>
    </div>

    <!-- 移动端：上下布局 -->
    <div v-else class="flex h-full w-full flex-col">
      <!-- 头像区 -->
      <Card class="p-4">
        <div class="flex flex-col items-center justify-center gap-3 py-4">
          <VbenAvatar
            :src="userInfo?.avatar ?? preferences.app.defaultAvatar"
            class="size-16"
          />
          <span class="text-center text-base font-semibold">
            {{ userInfo?.realName ?? '' }}
          </span>
          <span class="text-foreground/80 text-center text-sm">
            {{ userInfo?.username ?? '' }}
          </span>
        </div>
      </Card>

      <!-- 横向 Tabs -->
      <Card class="mt-2 p-2">
        <Tabs v-model="tabsValue" class="w-full">
          <TabsList class="grid w-full grid-cols-2 gap-1 sm:grid-cols-3">
            <TabsTrigger
              v-for="tab in tabs"
              :key="tab.value"
              :value="tab.value"
              class="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 text-sm"
            >
              {{ tab.label }}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>

      <!-- 内容区 -->
      <Card class="mt-2 flex-auto p-4">
        <slot name="content"></slot>
      </Card>
    </div>
  </Page>
</template>
