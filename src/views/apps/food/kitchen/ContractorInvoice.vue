<script setup>
import ContractorInvoiceGetDialog from '@/views/apps/food/kitchen/ContractorInvoiceGetDialog.vue'
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
  isContractorInvoiceGetDialogVisible: false,
})
const pendingState = reactive({
  fetchingContractors: false,
  fetchingReports: false,
})
function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}
const contractors = ref([])
const reports = ref([])
// ----- start ag-grid -----
const gridApi = ref(null)
const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption('loading', false)
}

const columnDefs = ref([
  { headerName: 'نام', field: 'fullName' },
  { headerName: 'تاریخ', field: 'date' },
  { headerName: 'وعده', field: 'mealName' },
  { headerName: 'غذا', field: 'foodName' },
  { headerName: 'مبلغ جزء', field: 'foodPrice' },
  { headerName: 'تعداد', field: 'quantity' },
  { headerName: 'مبلغ کل', field: 'totalPrice' },
])

const rowData = computed(() =>
  (reports.value ?? []).map(report => ({
    fullName: `${(report.contractor.first_name ?? '').trim()} ${(report.contractor.last_name ?? '').trim()}`.trim(),
    date: report?.reservation?.date ?? '',
    mealName: report.reservation?.meal?.name ?? '',
    foodName: report.food?.name ?? '',
    foodPrice: report.food_price ?? '',
    quantity: report.quantity ?? '',
    totalPrice: (report.quantity) * (report.food_price) ?? '',
  })),
)

// ----- end ag-grid -----

async function onFetchReport(payload) {
  pendingState.fetchingReports = true
  try {
    const res = await $api('/food/meal-reservation-detail/get-for-specific-contractor-on-date', { params: {
      'date[]': payload.date,
      'contractor': payload.contractor,
    }, method: 'GET' })

    reports.value = (res.data || []).flat()
    uiState.isContractorInvoiceGetDialogVisible = false
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

async function fetchContractors() {
  pendingState.fetchingContractors = true
  try {
    const res = await $api('/contractor/get-actives', { method: 'GET' })
    contractors.value = res?.data.contractors || []
  }
  catch (e) {
    console.error('Error fetching contractors:', e)
    setError(e.message || 'خطا در دریافت پیمانکاران')
  }
  finally {
    pendingState.fetchingContractors = false
  }
}

onMounted(async () => {
  await Promise.all([fetchContractors()])
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

    <ContractorInvoiceGetDialog
      v-if="uiState.isContractorInvoiceGetDialogVisible"
      v-model:is-dialog-visible="uiState.isContractorInvoiceGetDialogVisible"
      :loading="pendingState.fetchingReports"
      :contractors="contractors"
      @submit="onFetchReport"
    />

    <VApp>
      <VFab
        app
        icon="tabler-search"
        size="x-large"
        @click="uiState.isContractorInvoiceGetDialogVisible = true"
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
