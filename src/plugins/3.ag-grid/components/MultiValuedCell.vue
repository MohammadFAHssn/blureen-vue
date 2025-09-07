<template>
  <div class="d-flex gap-1">
    <VChip
      v-for="(value, index) in params.value"
      :key="index"
      variant="outlined"
      :color="
        index % 4 === 0
          ? 'warning'
          : index % 4 === 1
            ? 'info'
            : index % 4 === 2
              ? 'primary'
              : 'secondary'
      "
    >
      {{ value }}
    </VChip>
  </div>
</template>
