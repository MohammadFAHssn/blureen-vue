<script setup>
defineProps({
  payrollData: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <VRow>
    <VCol
      v-for="(year, index) in payrollData"
      :key="index"
      cols="12"
      md="6"
      lg="6"
    >
      <VCard class="pa-4">
        <h3 class="mb-3">
          فیش حقوقی سال({{ index }})
        </h3>
        <div class="heatmap">
          <div
            v-for="(status, month) in year"
            :key="month"
            class="heatmap-cell"
            :class="status === 1 ? 'seen' : 'unseen'"
          >
            {{ month }}
          </div>
        </div>
        <div class="legend mt-3">
          <span class="legend-box seen" /> دیده شده
          <span class="legend-box unseen ms-4" /> دیده نشده
        </div>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.heatmap {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-top: 10px;
}
.heatmap-cell {
  text-align: center;
  padding: 20px 0;
  border-radius: 6px;
  color: white;
  font-weight: bold;
}
.seen {
  background-color: #4caf50; /* سبز */
}
.unseen {
  background-color: #b0bec5; /* خاکستری */
}
.legend {
  display: flex;
  align-items: center;
  font-size: 14px;
}
.legend-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: inline-block;
  margin-left: 6px;
}
.legend-box.seen {
  background-color: #4caf50;
}
.legend-box.unseen {
  background-color: #b0bec5;
}
</style>
