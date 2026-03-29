<script setup>
const props = defineProps({
  params: { type: Object, required: true },
})
</script>

<template>
  <div class="d-flex align-center ga-1">
    <VBtn
      v-for="(item, index) in props.params.value"
      :key="index"
      size="small"
      variant="outlined"
      color="success"
    >
      {{ moment(item.created_at, 'jYYYY-jMM-jDD HH:mm:ss').format('HH:mm') }}
    </VBtn>
  </div>
</template>
