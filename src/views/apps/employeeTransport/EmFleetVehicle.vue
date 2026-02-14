<script setup>
import EmFleetVehicleCreateDialog from '@/views/apps/employeeTransport/emdialog/EmFleetVehicleCreateDialog.vue'
import EmFleetVehicleEditDialog from '@/views/apps/employeeTransport/emdialog/EmFleetVehicleEditDialog.vue'
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
  isEmFleetVehicleCreateDialogVisible: false,
  isEmFleetVehicleEditDialogVisible: false,
})
const pendingState = reactive({
  fetchingEmFleetVehicles: false,
  fetchingEmVehicleTypes: false,
  creatingEmFleetVehicle: false,
  editingEmFleetVehicle: false,
})
function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}
const vehicleTypes = ref([])
const emFleetVehicles = ref([])
const selectedEmFleetVehicle = ref(null)
// ----- start ag-grid -----
const gridApi = ref(null)
const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption('loading', true)
}

const columnDefs = ref([
  { headerName: 'نوع', field: 'type' },
  { headerName: 'نام راننده', field: 'driverName' },
  { headerName: 'شماره راننده', field: 'driverMobile' },
  { headerName: 'نام صاحب', field: 'owner' },
  { headerName: 'پلاک', field: 'plate' },
  { headerName: 'تعداد مسافر', field: 'seatsCount' },
  {
    headerName: 'عملیات',
    field: 'actions',
    cellRendererSelector: (_params) => {
      return {
        component: 'Actions',
        params: {
          onEditClick: (selectedNode) => {
            selectedEmFleetVehicle.value = selectedNode.data
            uiState.isEmFleetVehicleEditDialogVisible = true
          },
        },
      }
    },
  },
])

const rowData = computed(() =>
  (emFleetVehicles.value).map(emFleetVehicle => ({
    id: emFleetVehicle.id,
    type: emFleetVehicle.emVehicleType.name ?? '',
    driverName: emFleetVehicle.driverName ?? '',
    driverMobile: emFleetVehicle.driverMobileNumber ?? '',
    owner: emFleetVehicle.ownerName,
    plate: emFleetVehicle.plate,
    seatsCount: emFleetVehicle.seatsCount,
    actions: {
      editable: {
        status: true,
        mode: 'view',
      },
    },
  })),
)

// ----- end ag-grid -----
async function onCreateEmFleetVehicle(payload) {
  const formData = new FormData()
  formData.append('vehicle_type', payload.vehicleType?.name ?? payload.vehicleType)
  formData.append('driver_name', payload.driverName)
  formData.append('driver_mobile_number', payload.driverMobileNumber)
  formData.append('owner_name', payload.ownerName)
  formData.append('plate', payload.plate)
  formData.append('seats_count', payload.seatsCount)

  pendingState.creatingEmFleetVehicle = true

  try {
    await $api('/employee-transport/fleet-vehicle', {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage = response._data?.message || 'خطا در ایجاد ایستگاه'
        }
      },
    })

    uiState.isEmFleetVehicleCreateDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.creatingEmFleetVehicle = false
    fetchEmFleetVehicles()
    fetchEmVehicleTypes()
  }
}

async function onUpdateEmFleetVehicle(payload) {
  const formData = new FormData()
  const id = selectedEmFleetVehicle.value.id
  formData.append('vehicle_type', payload.vehicleType?.name ?? payload.vehicleType)
  formData.append('driver_name', payload.driverName)
  formData.append('driver_mobile_number', payload.driverMobileNumber)
  formData.append('owner_name', payload.ownerName)
  formData.append('plate', payload.plate)
  formData.append('seats_count', payload.seatsCount)

  pendingState.editingEmFleetVehicle = true

  try {
    await $api(`/employee-transport/fleet-vehicle/update/${id}`, {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage = response._data?.message || 'خطا در ویرایش ایستگاه'
        }
      },
    })

    uiState.isEmFleetVehicleEditDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.editingEmFleetVehicle = false
    fetchEmFleetVehicles()
    fetchEmVehicleTypes()
  }
}

async function fetchEmVehicleTypes() {
  pendingState.fetchingEmVehicleTypes = true
  try {
    const res = await $api('/employee-transport/em-vehicle-type', { method: 'GET' })
    vehicleTypes.value = res?.data.emVehicleTypes || []
  }
  catch (e) {
    console.error('Error fetching vehicleTypes:', e)
    setError(e.message || 'خطا در دریافت انواع وسیله نقلیه')
  }
  finally {
    pendingState.fetchingEmVehicleTypes = false
  }
}

async function fetchEmFleetVehicles() {
  pendingState.fetchingEmFleetVehicles = true
  gridApi.value?.setGridOption('loading', true)
  try {
    const res = await $api('/employee-transport/fleet-vehicle', { method: 'GET' })
    emFleetVehicles.value = res?.data.emFleetVehicles || []
  }
  catch (e) {
    console.error('Error fetching emFleetVehicles:', e)
    setError(e.message || 'خطا در دریافت وسایل نقلیه')
  }
  finally {
    pendingState.fetchingEmFleetVehicles = false
    gridApi.value?.setGridOption('loading', false)
  }
}

onMounted(async () => {
  await Promise.all([fetchEmVehicleTypes(), fetchEmFleetVehicles()])
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
        {{ 'صفحه قبل' }}
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

    <EmFleetVehicleCreateDialog
      v-if="uiState.isEmFleetVehicleCreateDialogVisible"
      v-model:is-dialog-visible="uiState.isEmFleetVehicleCreateDialogVisible"
      :loading="pendingState.creatingEmFleetVehicle"
      :vehicle-types="vehicleTypes"
      @submit="onCreateEmFleetVehicle"
    />

    <EmFleetVehicleEditDialog
      v-if="uiState.isEmFleetVehicleEditDialogVisible"
      v-model:is-dialog-visible="uiState.isEmFleetVehicleEditDialogVisible"
      :loading="pendingState.editingEmFleetVehicle"
      :vehicle-types="vehicleTypes"
      :em-vehicle-type="selectedEmFleetVehicle"
      @submit="onUpdateEmFleetVehicle"
    />

    <VApp>
      <VFab
        app
        icon="tabler-plus"
        size="x-large"
        @click="uiState.isEmFleetVehicleCreateDialogVisible = true"
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
