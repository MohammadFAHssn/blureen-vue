<script setup>
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  PieController,
  Tooltip,
} from 'chart.js'
import { onMounted } from 'vue'

const props = defineProps({
  foodData: {
    type: Object,
    required: true,
  },
})

Chart.register(
  PieController,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
)

onMounted(() => {
  const ctxPie = document.getElementById('foodPieChart').getContext('2d')
  // eslint-disable-next-line no-new
  new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: ['رزرو معمولی', 'رزرو اضطراری'],
      datasets: [
        {
          data: [props.foodData.normal_reserves, props.foodData.compulsive_reserves],
          backgroundColor: ['#238a04', '#ff6b02'],
        },
      ],
    },
  })

  console.log(props.foodData.years)
  const ctxYearShare = document.getElementById('foodYearSharePie').getContext('2d')
  // eslint-disable-next-line no-new
  new Chart(ctxYearShare, {
    type: 'pie',
    data: {
      labels: Object.keys(props.foodData.years),
      datasets: [
        {
          data: Object.values(props.foodData.years).map(y => y.year_total),
          backgroundColor: ['#038efd', '#fa2f2b', '#e4f533', '#49e751', '#ff9b08'],
        },
      ],
    },
  })

  Object.entries(props.foodData.years).forEach(([year, yearData]) => {
    const ctxBar = document.getElementById(`foodBarChart-${year}`).getContext('2d')
    // eslint-disable-next-line no-new
    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: [
          'فروردین',
          'اردیبهشت',
          'خرداد',
          'تیر',
          'مرداد',
          'شهریور',
          'مهر',
          'آبان',
          'آذر',
          'دی',
          'بهمن',
          'اسفند',
        ],
        datasets: [
          {
            label: `رزرو غذا در سال ${year}`,
            data: yearData.months,
            backgroundColor: '#8e24aa',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
          },
        },
      },
    })
  })
})
</script>

<template>
  <VRow class="mt-6">
    <!-- نمودار کلی نرمال / اضطراری -->
    <VCol cols="12" md="6">
      <VCard class="pa-4">
        <canvas id="foodPieChart" />
        <p class="text-center mt-3">
          مجموع رزروها: <strong>{{ props.foodData.total_reserves }}</strong>
        </p>
      </VCard>
    </VCol>

    <!-- نمودار نسبت سال‌ها -->
    <VCol cols="12" md="6">
      <VCard class="pa-4">
        <canvas id="foodYearSharePie" />
        <p class="text-center mt-3">
          مقایسه سهم هر سال از کل رزروها
        </p>
      </VCard>
    </VCol>
  </VRow>

  <!-- نمودار میله‌ای برای هر سال -->
  <VRow>
    <VCol
      v-for="(yearData, year) in props.foodData.years"
      :key="year"
      cols="12"
      md="6"
    >
      <VCard class="pa-4 mt-4">
        <p class="font-weight-bold mb-2">
          سال {{ year }}
        </p>
        <canvas :id="`foodBarChart-${year}`" />
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
</style>
