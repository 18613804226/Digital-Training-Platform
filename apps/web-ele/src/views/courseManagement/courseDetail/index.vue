<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { ElIcon, ElMessage, ElMessageBox, ElDialog, ElForm, ElFormItem, ElInput } from 'element-plus';
import { Check, Clock, Edit, Delete, ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import { getCourseByIdApi, } from '#/api';
import { useRoute } from 'vue-router';
import { useVbenModal, VbenButton } from '@vben/common-ui';
// updateLessonApi, deleteLessonApi, createLessonApi
import ExtraModal from './modal.vue';

const [Modal, modalApi] = useVbenModal({
  connectedComponent: ExtraModal,
});
const route = useRoute();
const course = ref({
  id: 0,
  title: '',
  category: '',
  teacher: { username: '' },
  createdAt: '',
  description: '',
});

const lessons = ref<any[]>([]);

// —————— 弹窗状态 ——————
const editLessonVisible = ref(false);
const addLessonVisible = ref(false);
const editLessonForm = ref({ id: 0, title: '', courseId: 0 });
const addLessonForm = ref({ title: '' });

onMounted(async () => {
  await loadCourse();
});

async function loadCourse() {
  const courseId = Number(route.params.courseId);
  if (courseId) {
    const res = await getCourseByIdApi({ courseId });
    course.value = res;
    // 确保按 order 排序
    lessons.value = (res.lessons || []).sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);
  }
}

// —————— 编辑课时 ——————
function openEditLesson(lesson: any) {
  editLessonForm.value = { ...lesson };
  editLessonVisible.value = true;
}

// async function saveLesson() {
//   try {
//     await updateLessonApi(editLessonForm.value);
//     ElMessage.success('课时已更新');
//     editLessonVisible.value = false;
//     await loadCourse(); // 重新加载确保顺序正确
//   } catch (err) {
//     ElMessage.error('更新失败');
//   }
// }

// —————— 删除课时 ——————
// function deleteLesson(lessonId: number) {
//   ElMessageBox.confirm('确定要删除此课时吗？', '警告', {
//     type: 'warning',
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//   }).then(async () => {
//     await deleteLessonApi({ lessonId });
//     ElMessage.success('课时已删除');
//     await loadCourse();
//   }).catch(() => { });
// }

// —————— 新增课时 ——————
function openAddLesson() {
  modalApi.open();
}

async function saveAddLesson() {
  if (!addLessonForm.value.title.trim()) {
    ElMessage.warning('请输入课时标题');
    return;
  }
  try {
    const newLesson = {
      title: addLessonForm.value.title,
      courseId: course.value.id,
      // order 默认为最后一位
      order: lessons.value.length > 0 ? Math.max(...lessons.value.map(l => l.order)) + 1 : 1,
    };
    // await createLessonApi(newLesson);
    ElMessage.success('课时已添加');
    addLessonVisible.value = false;
    await loadCourse();
  } catch (err) {
    ElMessage.error('添加失败');
  }
}

// —————— 调整顺序 ——————
async function moveUp(index: number) {
  if (index <= 0) return;
  const current = lessons.value[index];
  const prev = lessons.value[index - 1];

  // 交换 order
  const tempOrder = current.order;
  current.order = prev.order;
  prev.order = tempOrder;

  // 更新到后端（可批量，这里逐个）
  try {
    // await updateLessonApi(current);
    // await updateLessonApi(prev);
    // 重新排序本地数据
    lessons.value.sort((a, b) => a.order - b.order);
  } catch (err) {
    ElMessage.error('排序失败，已恢复');
    await loadCourse(); // 回滚
  }
}

async function moveDown(index: number) {
  if (index >= lessons.value.length - 1) return;
  const current = lessons.value[index];
  const next = lessons.value[index + 1];

  const tempOrder = current.order;
  current.order = next.order;
  next.order = tempOrder;

  try {
    // await updateLessonApi(current);
    // await updateLessonApi(next);
    lessons.value.sort((a, b) => a.order - b.order);
  } catch (err) {
    ElMessage.error('排序失败，已恢复');
    await loadCourse();
  }
}

// —————— 学习状态切换 ——————
function toggleLessonComplete(lessonId: number) {
  const lesson = lessons.value.find((l: any) => l.id === lessonId);
  if (lesson) {
    lesson.completed = !lesson.completed;
    ElMessage.success(lesson.completed ? '标记为已完成' : '取消完成状态');
    // 注意：completed 可能也需要存到后端，根据你的需求决定是否调 API
  }
}

// —————— 进度计算 ——————
const totalLessons = computed(() => lessons.value.length);
const completedLessons = computed(() =>
  lessons.value.filter((lesson: any) => lesson.completed).length
);
const progressPercent = computed(() => {
  if (totalLessons.value === 0) return 0;
  return Math.round((completedLessons.value / totalLessons.value) * 100);
});
</script>

<template>
  <div class="p-4 space-y-4 h-full">
    <!-- 顶部课程信息 -->
    <div class="card-box p-6 flex justify-between items-start">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">{{ course.title }}</h1>
        <p class="text-sm text-gray-600 mt-2">{{ course.description }}</p>

        <div class="mt-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-blue-600">
              📊 Learning progress：Section {{ completedLessons }} / {{ totalLessons }}
            </span>
            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 transition-all duration-300" :style="{ width: `${progressPercent}%` }">
              </div>
            </div>
            <span class="text-xs text-gray-500 whitespace-nowrap">{{ progressPercent }}%</span>
          </div>
        </div>

        <div class="mt-3 text-xs text-gray-500 space-x-4">
          <span>📚 Category: {{ course.category }}</span>
          <span>👤 Teacher: {{ course.teacher.username }}</span>
          <span>📅 Create Time: {{ course.createdAt }}</span>
        </div>
      </div>

      <!-- 新增课时按钮 -->
      <VbenButton v-access:role="['ADMIN', 'GUEST', 'TEACHER']" variant="default" size="sm" @click="openAddLesson">+
        Add Lesson
      </VbenButton>
    </div>

    <!-- 扁平课时列表 -->
    <div class="card-box p-5">
      <h3 class="text-lg font-bold text-gray-800 mb-3">课程内容</h3>
      <ul class="space-y-2 ml-2">
        <li v-for="(lesson, index) in lessons" :key="lesson.id"
          class="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded group">
          <!-- 左侧：图标 + 标题 -->
          <div class="flex items-center gap-2">
            <ElIcon v-if="lesson.completed" color="#409EFF" size="16">
              <Check />
            </ElIcon>
            <ElIcon v-else color="#ccc" size="16">
              <Clock />
            </ElIcon>
            <span class="text-gray-700">{{ lesson.title }}</span>
          </div>

          <!-- 右侧：操作按钮（悬停显示） -->
          <div class="flex items-center gap-1 ">
            <!-- <VbenButton variant="ghost" size="xs" :disabled="index === 0" @click="moveUp(index)">
              <ElIcon>
                <ArrowUp />
              </ElIcon>
            </VbenButton>
            <VbenButton variant="ghost" size="xs" :disabled="index === lessons.length - 1" @click="moveDown(index)">
              <ElIcon>
                <ArrowDown />
              </ElIcon>
            </VbenButton>
            <VbenButton variant="ghost" size="xs" @click="openEditLesson(lesson)">
              <ElIcon>
                <Edit />
              </ElIcon>
            </VbenButton>
            <VbenButton variant="ghost" size="xs" @click="deleteLesson(lesson.id)">
              <ElIcon>
                <Delete />
              </ElIcon>
            </VbenButton> -->
            <VbenButton variant="link" size="sm" @click="toggleLessonComplete(lesson.id)">
              {{ lesson.completed ? '重学' : '开始学习' }}
            </VbenButton>
          </div>
        </li>
        <li v-if="lessons.length === 0" class="text-gray-400 text-sm italic py-2">
          暂无课时
        </li>
      </ul>
    </div>

    <!-- 编辑课时弹窗 -->
    <ElDialog v-model="editLessonVisible" title="编辑课时" width="400px">
      <ElForm :model="editLessonForm" label-width="80px">
        <ElFormItem label="课时标题">
          <ElInput v-model="editLessonForm.title" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VbenButton variant="outline" size="sm" @click="editLessonVisible = false">取消</VbenButton>
          <!-- <VbenButton variant="default" size="sm" @click="saveLesson">保存</VbenButton> -->
        </div>
      </template>
    </ElDialog>
    <Modal @confirm="" />
    <!-- 新增课时弹窗 -->
    <!-- <ElDialog v-model="addLessonVisible" title="添加新课时" width="400px">
      <ElForm :model="addLessonForm" label-width="80px">
        <ElFormItem label="课时标题">
          <ElInput v-model="addLessonForm.title" placeholder="例如：变量与作用域" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VbenButton variant="outline" size="sm" @click="addLessonVisible = false">取消</VbenButton>
          <VbenButton variant="default" size="sm" @click="saveAddLesson">添加</VbenButton>
        </div>
      </template>
    </ElDialog> -->
  </div>
</template>

<style scoped></style>
