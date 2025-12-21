<script setup>
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'
import ContractorCreateDialog from '@/views/apps/contractor/ContractorCreateDialog.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'use',
    subject: 'app',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isContractorCreateDialogVisible: false,
})

const pendingState = reactive({
  fetchingsContractors: false,
  createContractor: false,
  changeStatus: false,
})

const contractors = ref([])

const selectedNodes = ref([])
const gridApi = ref(null)

// ----- start ag-grid -----
const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption('loading', true)
}

const columnDefs = ref([
  { headerName: 'نام', field: 'fullName' },
  {
    headerName: 'وضعیت',
    field: 'active',
    cellRenderer: 'Active',
    cellStyle: { 'display': 'flex', 'align-items': 'center' },
    filterParams: {
      valueFormatter: params => (params.value === 1 ? 'فعال' : 'غیرفعال'),
    },
  },
  { headerName: 'ایجاد شده توسط', field: 'createdBy' },
  { headerName: 'آخرین ویرایش توسط', field: 'editedBy' },
  {
    headerName: 'تاریخ ایجاد',
    field: 'createdAt',
    valueFormatter: params =>
      moment(params.value, 'jYYYY-jMM-jDD HH:mm:ss').format(
        'jYYYY/jMM/jD HH:mm:ss',
      ),
  },
  {
    headerName: 'تاریخ آخرین ویرایش',
    field: 'updatedAt',
    valueFormatter: params =>
      moment(params.value, 'jYYYY-jMM-jDD HH:mm:ss').format(
        'jYYYY/jMM/jD HH:mm:ss',
      ),
  },
  { headerName: 'عملیات', field: 'actions', icon: 'tabler-power', @click="onChangeStatusClick" },
])

const rowData = computed(() =>
  contractors.value?.map((contractor) => {
    return {
      id: contractor.id,
      fullName: contractor.fullName,
      status: contractor.status,
      createdBy: contractor.createdBy?.fullName || '--',
      editedBy: contractor.editedBy?.fullName || '--',
      createdAt: moment(contractor.createdAt).format('jYYYY-jMM-jDD HH:mm:ss'),
      updatedAt: moment(contractor.updatedAt).format('jYYYY-jMM-jDD HH:mm:ss'),
    }
  }),
)
// ----- end ag-grid -----

async function fetchContractors() {
  pendingState.fetchingsContractors = true
  gridApi.value?.setGridOption('loading', true)
  try {
    const res = await $api('/contractor', { method: 'GET' })

    contractors.value = res?.data?.contractors || []
  }
  catch (e) {
    console.error('Error fetching contractors:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت پیمانکاران'
  }
  finally {
    pendingState.fetchingsContractors = false
    gridApi.value?.setGridOption('loading', false)
  }
}

fetchContractors()

async function onCreateContractor(payload) {
  const formData = new FormData()

  formData.append('first_name', payload.contractorFirstName)
  formData.append('last_name', payload.contractorLastName)
  if(payload.description) {
    formData.append('description', payload.description)
  }

  pendingState.createContractor = true

  try {
    await $api('/contractor', {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage = response._data?.message || 'خطا در ایجاد پیمانکار'
        }
      },
    })

    uiState.isContractorCreateDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.createContractor = false
    fetchContractors()
  }
}

async function onChangeStatusClick() {
  const id = selectedNodes.value[0].data.id
  pendingState.changeStatus = true
  try {
    await $api(`/status/${id}`, {
      method: 'DELETE',
      onResponseError({ response }) {
        pendingState.changeStatus = false
        uiState.hasError = true
        uiState.errorMessage = response._data.message || 'خطا در تغییر وضعیت'
      },
    })

    pendingState.changeStatus = false
    fetchContractors()
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
      variant="flat"
      color="error"
    >
      {{ uiState.errorMessage }}
    </VSnackbar>

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

    <ContractorCreateDialog
      v-if="uiState.isContractorCreateDialogVisible"
      v-model:is-dialog-visible="uiState.isContractorCreateDialogVisible"
      :loading="pendingState.createContractor"
      @submit="onCreateContractor"
    />

    <VApp>
      <VFab
        app
        icon="tabler-plus"
        size="x-large"
        @click="uiState.isContractorCreateDialogVisible = true"
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
