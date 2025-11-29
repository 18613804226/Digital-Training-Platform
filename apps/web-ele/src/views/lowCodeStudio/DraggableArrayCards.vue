<script>
import Sortable from 'sortablejs';

export default {
  mounted() {
    const el = this.$el;
    Sortable.create(el, {
      animation: 150,
      onEnd: (evt) => {
        console.log('拖拽结束', evt.oldIndex, evt.newIndex);
        // 在这里处理数据排序更新
      },
    });
  },
};
</script>

<template>
  <div>
    <!-- 这里放置你的可拖拽卡片 -->
    <slot></slot>
  </div>
</template>
