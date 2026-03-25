<script setup>
const props = defineProps({ type: Object, required: true })
</script>

<template>
  <div class="d-flex align-center ga-2">
    <span>{{ props.params.value }}</span>
    <VBtn size="small" variant="flat" color="primary" title="بروزرسانی زمان">
      <VIcon icon="tabler-refresh" />
    </VBtn>
  </div>
</template>
