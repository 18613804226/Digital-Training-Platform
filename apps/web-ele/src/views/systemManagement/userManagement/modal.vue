<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

defineOptions({
  name: 'ExtraModal',
});

const [Modal] = useVbenModal({
  draggable: true,
});
</script>
<template>
  <Modal title="Add User"> modal content </Modal>
</template>
