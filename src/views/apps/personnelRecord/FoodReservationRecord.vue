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

let reserveTypeChart = null
let mealReserveChart = null
let reservePerYearChart = null
let reservePerMonthCharts = []

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
  createCharts()
})

watch(
  () => props.foodData,
  async () => {
    destroyCharts()
    await nextTick()
    createCharts()
  },
  { deep: true },
)

function createCharts() {
  const mrcPie = document.getElementById('meal-reserve-chart').getContext('2d')
  mealReserveChart = new Chart(mrcPie, {
    type: 'pie',
    data: {
      labels: ['شام', 'ناهار'],
      datasets: [
        {
          data: [props.foodData.dinner_reserves, props.foodData.launch_reserves],
          label: `تعداد رزرو`,
          backgroundColor: ['#e4f533', '#7930c7'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    },
  })

  const rtcPie = document.getElementById('reserve-type-chart').getContext('2d')
  reserveTypeChart = new Chart(rtcPie, {
    type: 'pie',
    data: {
      labels: ['رزرو اضطراری', 'رزرو معمولی'],
      datasets: [
        {
          data: [props.foodData.compulsive_reserves, props.foodData.normal_reserves],
          label: `تعداد رزرو`,
          backgroundColor: ['#ff6b02', '#238a04'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    },
  })

  const rpyPie = document.getElementById('reserve-per-year-chart').getContext('2d')
  reservePerYearChart = new Chart(rpyPie, {
    type: 'pie',
    data: {
      labels: Object.keys(props.foodData.years),
      datasets: [
        {
          data: Object.values(props.foodData.years).map(y => y.year_total),
          label: `تعداد رزرو در سال`,
          backgroundColor: ['#038efd', '#fa2f2b', '#e4f533', '#49e751', '#ff9b08'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    },
  })

  Object.entries(props.foodData.years).forEach(([year, yearData]) => {
    const canvas = document.getElementById(`foodBarChart-${year}`)
    if (!canvas) return

    const ctxBar = canvas.getContext('2d')

    const newChart = new Chart(ctxBar, {
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
            label: `تعداد رزرو در ماه`,
            data: yearData.months,
            backgroundColor: '#8e24aa',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    })
    reservePerMonthCharts.push(newChart)
  })
}

function destroyCharts() {
  [reserveTypeChart, mealReserveChart, reservePerYearChart].forEach((chart) => {
    if (chart) chart.destroy()
  })

  reservePerMonthCharts.forEach((chart) => {
    if (chart) chart.destroy()
  })
  reservePerMonthCharts = []
}
</script>

<template>
  <VRow class="mt-6" justify="space-evenly">
    <!-- نمودار تعداد ناهار و شام -->
    <VCol cols="11" sm="5" md="3" lg="3">
      <VCard class="pa-4 box">
        <p class="font-weight-bold mt-3">
          مقایسه تعداد رزرو ناهار و شام(تعداد کل:{{ props.foodData.total_reserves }})
        </p>
        <canvas id="meal-reserve-chart" />
      </VCard>
    </VCol>
    <!-- نمودار کلی نرمال / اضطراری -->
    <VCol cols="11" sm="5" md="3" lg="3">
      <VCard class="pa-4 box">
        <p class="font-weight-bold mt-3">
          مقایسه تعداد رزرو معمولی و اضطراری
        </p>
        <canvas id="reserve-type-chart" />
      </VCard>
    </VCol>

    <!-- نمودار نسبت سال‌ها -->
    <VCol cols="11" sm="5" md="3" lg="3">
      <VCard class="pa-4 box">
        <p class="font-weight-bold mt-3">
          مقایسه سهم هر سال از کل رزروها
        </p>
        <canvas id="reserve-per-year-chart" />
      </VCard>
    </VCol>
  </VRow>

  <!-- نمودار میله‌ای برای هر سال -->
  <VRow justify="space-evenly">
    <VCol
      v-for="(yearData, year) in props.foodData.years"
      :key="year"
      cols="12"
      sm="6"
      md="4"
      lg="4"
    >
      <VCard class="pa-4 mt-4 box">
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
