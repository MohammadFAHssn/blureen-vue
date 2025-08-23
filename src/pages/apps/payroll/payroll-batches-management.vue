<script setup>
import PayrollBatchCreateDialog from '@/views/apps/payroll/PayrollBatchCreateDialog.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
  },
})

// states
const uiState = reactive({
  isPayrollBatchCreateDialogVisible: false,
})

const pendingState = reactive({
  createPayrollBatch: false,
  fetchingPayrollBatches: false,
})

const payrollBatches = ref([])
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
  grid-template-rows: auto;
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
