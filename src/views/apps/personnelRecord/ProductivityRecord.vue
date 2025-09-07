<script setup>
import { ArcElement, Chart, Legend, PieController, Tooltip } from 'chart.js'
import { computed, onMounted } from 'vue'

const props = defineProps({
  productivityData: {
    type: Array,
    required: true,
  },
})

Chart.register(PieController, ArcElement, Tooltip, Legend)

// مجموع تخلفات
const totalViolations = computed(() => props.productivityData.length)

// تعداد تخلفات به تفکیک دسته‌ها
const categoryCounts = computed(() => {
  const counts = {}
  props.productivityData.forEach((item) => {
    counts[item.penalty_type] = (counts[item.penalty_type] || 0) + 1
  })
  return counts
})

onMounted(() => {
  const chartConfig = {
    type: 'pie',
    data: {
      labels: Object.keys(categoryCounts.value),
      datasets: [
        {
          data: Object.values(categoryCounts.value),
          backgroundColor: ['#ef5350', '#42a5f5', '#ffca28', '#66bb6a'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
    },
  }

  //  نمودار دسکتاپ
  const ctxDesktop = document.getElementById('violationPieChartDesktop')
  if (ctxDesktop) {
    // eslint-disable-next-line no-new
    new Chart(ctxDesktop.getContext('2d'), chartConfig)
  }

  //  نمودار موبایل
  const ctxMobile = document.getElementById('violationPieChartMobile')
  if (ctxMobile) {
    // eslint-disable-next-line no-new
    new Chart(ctxMobile.getContext('2d'), chartConfig)
  }
})
</script>

<template>
  <!-- نمایش برای دسکتاپ (نمودار + جدول کنار هم) -->
  <VRow class="d-none d-md-flex mt-6">
    <!-- نمودار -->
    <VCol cols="12" md="4">
      <VCard class="pa-4">
        <h3 class="mb-3">
          تعداد تخلف در هر دسته
        </h3>
        <canvas id="violationPieChartDesktop" />
        <p class="text-center mt-3">
          تعداد کل تخلفات: <strong>{{ totalViolations }}</strong>
        </p>
      </VCard>
    </VCol>

    <!-- جدول -->
    <VCol cols="12" md="8">
      <VCard class="pa-4 mb-4 mb-md-0">
        <table class="violations-table">
          <thead>
            <tr>
              <th>سال</th>
              <th>ماه</th>
              <th>تاریخ وقوع</th>
              <th>عنوان تخلف</th>
              <th>دسته‌بندی</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in props.productivityData" :key="index">
              <td>{{ item.year }}</td>
              <td>{{ item.month }}</td>
              <td>{{ item.date_of_occurrence }}</td>
              <td>{{ item.penalty_title }}</td>
              <td>{{ item.penalty_type }}</td>
            </tr>
          </tbody>
        </table>
      </VCard>
    </VCol>
  </VRow>

  <!-- نمایش برای موبایل -->
  <VRow class="d-flex d-md-none mt-6">
    <!-- نمودار -->
    <VCol cols="12">
      <VCard class="pa-4 mb-4">
        <h3 class="mb-3">
          سهم دسته‌ها
        </h3>
        <canvas id="violationPieChartMobile" />
        <p class="text-center mt-3">
          تعداد کل تخلفات: <strong>{{ totalViolations }}</strong>
        </p>
      </VCard>
    </VCol>

    <!-- کارت‌ها -->
    <VCol v-for="(item, index) in props.productivityData" :key="index" cols="12">
      <VCard class="pa-4 mb-3">
        <p><strong>سال:</strong> {{ item.year }}</p>
        <p><strong>ماه:</strong> {{ item.month }}</p>
        <p><strong>تاریخ:</strong> {{ item.date_of_occurrence }}</p>
        <p><strong>عنوان:</strong> {{ item.penalty_title }}</p>
        <p><strong>دسته‌بندی:</strong> {{ item.penalty_type }}</p>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.violations-table {
  width: 100%;
  border-collapse: collapse;
}
.violations-table th,
.violations-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.violations-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}
</style>
