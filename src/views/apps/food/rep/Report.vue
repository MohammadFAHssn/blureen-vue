<script setup>
import ReportGetDialog from '@/views/apps/food/rep/ReportGetDialog.vue'
// emit
const emit = defineEmits(['back'])
const current = ref('root')
function goBack() {
  if (current.value !== 'root') {
    current.value = 'root'
  }
  else {
    emit('back')
  }
}

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isReportGetDialogVisible: false,
})

const pendingState = reactive({
  fetchingReports: false,
  fetchingMeals: false,
})

function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}

const reports = ref([])
const meals = ref([])

const gridApi = ref(null)

// ----- start ag-grid -----
const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption('loading', false)
}

const columnDefs = ref([
  { headerName: 'کد پرسنلی', field: 'userName' },
  { headerName: 'نام', field: 'fullName' },
  { headerName: 'وعده', field: 'mealName' },
  { headerName: 'غذا', field: 'foodName' },
  { headerName: 'قیمت', field: 'foodPrice' },
  { headerName: 'تاریخ', field: 'date' },
  { headerName: 'خروج', field: 'checkout' },
])

const rowData = computed(() =>
  (reports.value ?? []).map(report => ({
    id: report.id,
    userName: report.personnel?.username ?? '',
    fullName: `${(report.personnel?.first_name ?? '').trim()} ${(report.personnel?.last_name ?? '').trim()}`.trim(),
    mealName: report.reservation?.meal?.name ?? '',
    foodName: report.food?.name ?? '',
    foodPrice: report.food?.price ?? '',
    date: report.reservation?.date ?? '',
    checkout: report?.check_out_time ?? '-',
  })),
)

// ----- end ag-grid -----

async function onFetchReport(payload) {
  pendingState.fetchingReports = true
  try {
    const res = await $api('/food/report', { params: {
      'date[]': payload.date,
      'meal_id': payload.meal,
    }, method: 'GET' })

    reports.value = res?.data || []
    uiState.isReportGetDialogVisible = false
  }
  catch (e) {
    console.error('Error fetching reports:', e)

    const data = e?.data || e?.response?._data || e?.response?.data || null

    const validationMsg
      = data?.errors
        ? Object.values(data.errors).flat().join('\n')
        : null

    setError(validationMsg || data?.message || e?.message || 'خطا در دریافت گزارش')
  }
  finally {
    pendingState.fetchingReports = false
  }
}
async function fetchMeals() {
  pendingState.fetchingMeals = true
  try {
    const res = await $api('/food/meal', { method: 'GET' })

    meals.value = res?.data.meals || []
  }
  catch (e) {
    console.error('Error fetching meals:', e)
    setError(e.message || 'خطا در دریافت وعده‌ها')
  }
  finally {
    pendingState.fetchingMeals = false
  }
}
onMounted(async () => {
  await Promise.all([fetchMeals()])
})
</script>

<template>
  <VLayout class="app-layout">
    <VSnackbar
      v-model="uiState.hasError"
      :timeout="2000"
      location="center"
      variant="flat"
      color="error"
    >
      {{ uiState.errorMessage }}
    </VSnackbar>

    <div>
      <VBtn
        variant="text"
        prepend-icon="tabler-arrow-right"
        class="mb-4"
        @click="goBack"
      >
        {{ current === 'root' ? 'گزارش' : 'صفحه قبل' }}
      </VBtn>
    </div>

    <section style="block-size: 100%">
      <AgGridVue
        style="block-size: 100%; inline-size: 100%"
        :column-defs="columnDefs"
        :row-data="rowData"
        enable-rtl
        row-numbers
        pagination
        :theme="theme"
        @grid-ready="onGridReady"
      />
    </section>

    <ReportGetDialog
      v-if="uiState.isReportGetDialogVisible"
      v-model:is-dialog-visible="uiState.isReportGetDialogVisible"
      :loading="pendingState.fetchingReports"
      :meals="meals"
      @submit="onFetchReport"
    />

    <VApp>
      <VFab
        app
        icon="tabler-search"
        size="x-large"
        @click="uiState.isReportGetDialogVisible = true"
      />
    </VApp>
  </VLayout>
</template>

<style lang="scss" scoped>
@use '@styles/variables/vuetify';
@use '@core/scss/base/mixins';

.app-layout {
  @include mixins.elevation(vuetify.$card-elevation);

  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto 1fr;
}

.v-application {
  max-block-size: 100%;
  min-block-size: 100%;
}

:deep(.v-application__wrap) {
  max-block-size: 100% !important;
  min-block-size: 100% !important;
}
</style>
