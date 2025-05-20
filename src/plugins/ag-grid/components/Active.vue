<template>
  <span v-if="params.value === '(انتخاب همه)'"> {{ params.value }}</span>

  <VChip
    v-else-if="params.value === 1"
    color="success"
    :label="false"
  >
    فعال
  </VChip>

  <VChip
    v-else-if="params.value === 0"
    color="error"
    :label="false"
  >
    غیرفعال
  </VChip>
</template>
