<script setup>
const props = defineProps({
  params: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <VBtn v-if="params.node.data.scores.length" color="warning" size="small" @click="params.onEvaluateBtnClick(params.node)">
    ویرایش
  </VBtn>
  <VBtn v-else color="green" size="small" @click="params.onEvaluateBtnClick(params.node)">
    شروع
  </VBtn>
</template>
