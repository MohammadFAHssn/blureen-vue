<template>
  <VChip v-if="params.value > 0" color="success" :label="false">
    موجود
  </VChip>

  <VChip v-if="params.value <= 0" color="error" :label="false">
    ناموجود
  </VChip>
</template>
