<script setup>
import PayrollBatchCreateDialog from '@/views/apps/payroll/PayrollBatchCreateDialog.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
})

const pendingState = reactive({
  createPayrollBatch: false,
  fetchingPayrollBatches: false,
  deletePayrollBatches: false,
})

const payrollBatches = ref([])

// ----- start ag-grid -----

const { theme } = useAGGridTheme()

const columnDefs = ref([
  { headerName: 'ماه', field: 'monthName', flex: 1 },
  { headerName: 'سال', field: 'year', flex: 1 },
  { headerName: 'بارگذاری توسط', field: 'uploadedBy', flex: 2 },
  {
    headerName: 'تاریخ بارگذاری',
    field: 'createdAt',
    flex: 2,
    valueFormatter: params =>
      moment(params.value, 'jYYYY-jMM-jDD HH:mm:ss').format(
        'jYYYY/jMM/jD HH:mm:ss',
      ),
  },
  { headerName: 'نام فایل بارگذاری شده', field: 'fileName', flex: 2 },
  // { headerName: 'وضعیت ارسال پیامک', field: 'smsSent', flex: 2 },
  {
    headerName: 'عملیات',
    field: 'actions',
    cellRendererSelector: (params) => {
      return {
        component: 'Actions',
        params: {
          onDeleteClick,
        },
      }
    },
    flex: 1,
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

pendingState.fetchingPayrollBatches = true
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

  if (error.value) throw error.value

  payrollBatches.value = data.value.data
}
catch (e) {
  console.error('Error fetching payrollBatches:', e)
  uiState.hasError = true
  uiState.errorMessage = e.message || 'خطا در دریافت فیش‌های حقوقی'
}

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
        pendingState.createPayrollBatch = false
        uiState.hasError = true
        uiState.errorMessage
          = response._data.message || 'خطا در ایجاد فیش حقوقی'
      },
    })

    pendingState.createPayrollBatch = false
    uiState.isPayrollBatchCreateDialogVisible = false

    // UpdateUserRoles(newUserRoles)
  }
  catch (err) {
    console.error(err)
  }
}

async function onDeleteClick(batchId) {
  pendingState.deletePayrollBatches = true
  try {
    await $api('/payroll/payroll-batch', {
      method: 'DELETE',
      body: {
        ids: [batchId],
      },
      onResponseError({ response }) {
        pendingState.deletePayrollBatches = false
        uiState.hasError = true
        uiState.errorMessage
          = response._data.message || 'خطا در حذف فیش حقوقی'
      },
    })

    pendingState.deletePayrollBatches = false
    payrollBatches.value = payrollBatches.value.filter(
      batch => batch.id !== batchId,
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
      />
    </section>

    <PayrollBatchCreateDialog
      v-if="uiState.isPayrollBatchCreateDialogVisible"
      v-model:is-dialog-visible="uiState.isPayrollBatchCreateDialogVisible"
      :loading="pendingState.createPayrollBatch"
      @submit="onCreatePayrollBatch"
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
