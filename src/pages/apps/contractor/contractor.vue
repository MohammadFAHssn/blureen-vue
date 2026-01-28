<script setup>
import ContractorCreateDialog from '@/views/apps/contractor/ContractorCreateDialog.vue'
import ContractorEditDialog from '@/views/apps/contractor/ContractorEditDialog.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'Contractor',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isContractorCreateDialogVisible: false,
  isContractorEditDialogVisible: false,
})

const pendingState = reactive({
  fetchingsContractors: false,
  createContractor: false,
  editContractor: false,
  changeStatus: false,
})

const contractors = ref([])

const selectedContractor = ref(null)
const gridApi = ref(null)

// ----- start ag-grid -----
const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption('loading', true)
}

const columnDefs = ref([
  { headerName: 'نام', field: 'fullName' },
  { headerName: 'مسئول هزینه', field: 'costResponsible' },
  { headerName: 'توضیحات', field: 'description' },
  {
    headerName: 'وضعیت',
    field: 'status',
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
  {
    headerName: 'عملیات',
    field: 'actions',
    cellRendererSelector: (_params) => {
      return {
        component: 'Actions',
        params: {
          onStatusClick: (selectedNode) => {
            selectedContractor.value = selectedNode.data
            onChangeStatusClick()
          },
          onEditClick: (selectedNode) => {
            selectedContractor.value = selectedNode.data
            uiState.isContractorEditDialogVisible = true
          },
        },
      }
    },
  },
])

const rowData = computed(() =>
  contractors.value?.map((contractor) => {
    return {
      id: contractor.id,
      fullName: contractor.fullName,
      costResponsible: contractor.costResponsible === 'on_company' ? 'شرکت' : 'پیمانکار',
      description: contractor.description,
      status: contractor.status,
      createdBy: contractor.createdBy?.fullName || '--',
      editedBy: contractor.editedBy?.fullName || '--',
      createdAt: moment(contractor.createdAt).format('jYYYY-jMM-jDD HH:mm:ss'),
      updatedAt: moment(contractor.updatedAt).format('jYYYY-jMM-jDD HH:mm:ss'),
      actions: {
        status: true,
        editable: {
          status: true,
          mode: 'view',
        },
      },
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
  formData.append('cost_responsible', payload.costResponsible)
  if (payload.description) {
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

async function onEditContractor(payload) {
  const id = selectedContractor.value.id
  const formData = new FormData()
  formData.append('cost_responsible', payload.costResponsible)
  pendingState.editContractor = true

  try {
    await $api(`/contractor/${id}`, {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage = response._data?.message || 'خطا در ویرایش پیمانکار'
        }
      },
    })

    uiState.isContractorEditDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.editContractor = false
    fetchContractors()
  }
}

async function onChangeStatusClick() {
  const id = selectedContractor.value.id
  pendingState.changeStatus = true
  try {
    await $api(`/contractor/status/${id}`, {
      method: 'POST',
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

    <ContractorEditDialog
      v-if="uiState.isContractorEditDialogVisible"
      v-model:is-dialog-visible="uiState.isContractorEditDialogVisible"
      :loading="pendingState.editContractor"
      :file="selectedContractor"
      @submit="onEditContractor"
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
