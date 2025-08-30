<script setup>
import { getLineChartSimpleConfig } from '@core/libs/apex-chart/apexCharConfig'
import { getJalaliMonthNameByIndex } from '@core/utils/helpers'

import { useTheme } from 'vuetify'

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
})

const payrollSlips = ref([]) // the current and previous month

const pendingState = reactive({
  fetchingPayrollSlips: false,
})

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

const xaxis = computed(() => {
  return {
    categories: payrollSlips.value.flatMap(slip => slip
      ? getJalaliMonthNameByIndex(slip?.payroll_batch.month)
      : [],
    ).reverse(),
  }
})

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
      categories: xaxis.value.categories,
    },

  }
})
</script>

<template>
  <VueApexCharts
    type="line"
    height="400"
    :options="chartConfig"
    :series="series"
  />
</template>
