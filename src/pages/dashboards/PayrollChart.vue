<script setup>
import { getLineChartSimpleConfig } from '@core/libs/apex-chart/apexCharConfig'
import { getJalaliMonthNameByIndex } from '@core/utils/helpers'
import { useTheme } from 'vuetify'

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
})

const pendingState = reactive({
  fetchingPayrollSlips: false,
})

const payrollSlips = ref([])

const last = 13

async function fetchPayrollSlips() {
  pendingState.fetchingPayrollSlips = true
  try {
    const { data, error } = await useApi(
      createUrl('/payroll/payroll-slip/get-the-last-few-months', {
        query: {
          last,
        },
      }),
    )

    pendingState.fetchingPayrollSlips = false

    if (error.value) throw error.value

    payrollSlips.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching payrollSlips:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت فیش حقوقی'
  }
}

fetchPayrollSlips()

const categories = computed(() =>
  payrollSlips.value.flatMap(slip => slip
    ? getJalaliMonthNameByIndex(slip.payroll_batch.month)
    : [],
  ).reverse(),
)

const series = computed(() => {
  return [
    {
      data: payrollSlips.value.flatMap(
        slip => slip
          ? slip.payroll_items.filter(
            item => item.item_title === 'جمع کل پرداختی',
          )[0].item_value
          : [],
      ).reverse(),
    },
  ]
})

const vuetifyTheme = useTheme()
const baseChartConfig = getLineChartSimpleConfig(vuetifyTheme.current.value)

const chartConfig = computed(() => {
  return {
    ...baseChartConfig,
    xaxis: {
      ...baseChartConfig.xaxis,
      categories: categories.value,
    },

  }
})
</script>

<template>
  <VSnackbar
    v-model="uiState.hasError"
    :timeout="2000"
    location="center"
    variant="flat"
    color="error"
  >
    {{ uiState.errorMessage }}
  </VSnackbar>

  <VProgressCircular
    v-if="pendingState.fetchingPayrollSlips"
    indeterminate
    color="primary"
  />

  <VueApexCharts
    v-else
    type="line"
    :options="chartConfig"
    :series="series"
  />
</template>
