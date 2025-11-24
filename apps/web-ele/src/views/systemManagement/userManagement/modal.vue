<script lang="ts" setup>
defineOptions({
  name: 'ExtraModal'
});
import { useVbenModal } from '@vben/common-ui';

const [Modal] = useVbenModal({
  draggable: true,
});

</script>
<template>
  <Modal title="Add User"> modal content </Modal>
</template>
