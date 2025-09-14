<script setup>
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'
import PayrollBatchCreateDialog from '@/views/apps/payroll/PayrollBatchCreateDialog.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'Payroll-Batches',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isPayrollBatchDeleteDialogVisible: false,
})

const pendingState = reactive({
  createPayrollBatch: false,
  fetchingPayrollBatches: false,
  deletePayrollBatches: false,
})

const payrollBatches = ref([])

const selectedNodes = ref([])
const gridApi = ref(null)
// ----- start ag-grid -----

const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption('loading', true)
}

const columnDefs = ref([
  { headerName: 'ماه', field: 'monthName' },
  { headerName: 'سال', field: 'year' },
  { headerName: 'بارگذاری توسط', field: 'uploadedBy' },
  {
    headerName: 'تاریخ بارگذاری',
    field: 'createdAt',
    valueFormatter: params =>
      moment(params.value, 'jYYYY-jMM-jDD HH:mm:ss').format(
        'jYYYY/jMM/jD HH:mm:ss',
      ),
  },
  { headerName: 'نام فایل بارگذاری شده', field: 'fileName' },
  // { headerName: 'وضعیت ارسال پیامک', field: 'smsSent'},
  {
    headerName: 'عملیات',
    field: 'actions',
    cellRendererSelector: (params) => {
      return {
        component: 'Actions',
        params: {
          onDeleteClick: (selectedNode) => {
            selectedNodes.value = [selectedNode]
            uiState.isPayrollBatchDeleteDialogVisible = true
          },
        },
      }
    },
  },
])

const rowData = computed(() =>
  payrollBatches.value?.map((batch) => {
    return {
      id: batch.id,
      monthName: batch.month_name,
      year: batch.year,
      uploadedBy: `${batch.uploaded_by.first_name} ${batch.uploaded_by.last_name}`,
      createdAt: moment(batch.created_at).format('jYYYY-jMM-jDD HH:mm:ss'),
      fileName: batch.filename,
      // smsSent: batch.sms_sent,
      actions: {
        deletable: true,
      },
    }
  }),
)

// ----- end ag-grid -----

// ----- -----

async function fetchPayrollBatches() {
  pendingState.fetchingPayrollBatches = true
  gridApi.value?.setGridOption('loading', true)
  try {
    const { data, error } = await useApi(
      createUrl('/payroll/payroll-batch', {
        query: {
          'fields[uploaded_bies]': 'id,first_name,last_name',
          'include': 'uploadedBy',
        },
      }),
    )

    pendingState.fetchingPayrollBatches = false
    gridApi.value?.setGridOption('loading', false)

    if (error.value) throw error.value

    payrollBatches.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching payrollBatches:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت فیش‌های حقوقی'
  }
}

fetchPayrollBatches()

async function onCreatePayrollBatch(payload) {
  const formData = new FormData()

  formData.append('month', Number(payload.payrollBatchDate.split('/')[1]))
  formData.append('year', Number(payload.payrollBatchDate.split('/')[0]))

  formData.append('file', payload.payrollBatchFile)

  pendingState.createPayrollBatch = true
  try {
    await $api('/payroll/payroll-batch/create', {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        uiState.hasError = true
        uiState.errorMessage
          = response._data.message || 'خطا در ایجاد فیش حقوقی'
      },
    })

    uiState.isPayrollBatchCreateDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.createPayrollBatch = false
    fetchPayrollBatches()
  }
}

async function onDelete() {
  pendingState.deletePayrollBatches = true
  try {
    await $api('/payroll/payroll-batch', {
      method: 'DELETE',
      body: {
        ids: [selectedNodes.value[0].data.id],
      },
      onResponseError({ response }) {
        pendingState.deletePayrollBatches = false
        uiState.hasError = true
        uiState.errorMessage = response._data.message || 'خطا در حذف فیش حقوقی'
      },
    })

    pendingState.deletePayrollBatches = false
    uiState.isPayrollBatchDeleteDialogVisible = false
    payrollBatches.value = payrollBatches.value.filter(
      batch => batch.id !== selectedNodes.value[0].data.id,
    )
  }
  catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <VLayout class="app-layout">
    <VSnackbar
      v-model="uiState.hasError"
      :timeout="2000"
      location="center"
      variant="outlined"
      color="error"
    >
      {{ uiState.errorMessage }}
    </VSnackbar>

    <section style="block-size: 100%;">
      <AgGridVue
        style="block-size: 100%; inline-size: 100%;"
        :column-defs="columnDefs"
        :row-data="rowData"
        enable-rtl
        row-numbers
        pagination
        :theme="theme"
        @grid-ready="onGridReady"
      />
    </section>

    <PayrollBatchCreateDialog
      v-if="uiState.isPayrollBatchCreateDialogVisible"
      v-model:is-dialog-visible="uiState.isPayrollBatchCreateDialogVisible"
      :loading="pendingState.createPayrollBatch"
      @submit="onCreatePayrollBatch"
    />

    <AreYouSureDialog
      v-if="uiState.isPayrollBatchDeleteDialogVisible"
      v-model:is-dialog-visible="uiState.isPayrollBatchDeleteDialogVisible"
      title="آیا از حذف این فیش اطمینان دارید؟"
      :loading="pendingState.deletePayrollBatches"
      @confirm="onDelete"
    />

    <VApp>
      <VFab
        app
        icon="tabler-plus"
        size="x-large"
        @click="uiState.isPayrollBatchCreateDialogVisible = true"
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
  grid-template-rows: 1fr auto;
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
