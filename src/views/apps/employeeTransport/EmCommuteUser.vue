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
  fetchingEmCommuteUserStations: false,
  creatingEmCommuteUserStation: false,
  editingEmCommuteUserStation: false,
})
function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}
const vehicleTypes = ref([])
const emCommuteUserStations = ref([])
const selectedEmFleetVehicle = ref(null)
// ----- start ag-grid -----
const gridApi = ref(null)
const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption('loading', true)
}

const columnDefs = ref([
  { headerName: 'نام', field: 'fullName' },
  { headerName: 'کد پرسنلی', field: 'personnelCode' },
  { headerName: 'نوع شیفت', field: 'shiftType' },
  { headerName: 'کد سرویس', field: 'serviceCode' },
  { headerName: 'کد ایستگاه', field: 'stationCode' },
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
  (emCommuteUserStations.value).map(emCommuteUserStation => ({
    fullName: emCommuteUserStation.user.fullName,
    personnelCode: emCommuteUserStation.user.username,
    shiftType: emCommuteUserStation.emCommuteServiceStation?.emCommuteService.emShiftType.name ?? 'خطا',
    serviceCode: emCommuteUserStation.emCommuteServiceStation?.emCommuteService.code ?? 'خطا',
    stationCode: emCommuteUserStation.emCommuteServiceStation?.emCommuteStation.code ?? 'خطا',
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

  pendingState.creatingEmCommuteUserStation = true

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
    pendingState.creatingEmCommuteUserStation = false
    fetchEmCommuteUsers()
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

  pendingState.editingEmCommuteUserStation = true

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
    pendingState.editingEmCommuteUserStation = false
    fetchEmCommuteUsers()
  }
}

async function fetchEmCommuteUsers() {
  pendingState.fetchingEmCommuteUserStations = true
  gridApi.value?.setGridOption('loading', true)
  try {
    const res = await $api('/employee-transport/user/all', { method: 'GET' })
    emCommuteUserStations.value = res?.data.emCommuteUserStations || []
  }
  catch (e) {
    console.error('Error fetching emCommuteUserStations:', e)
    setError(e.message || 'خطا در دریافت کاربران')
  }
  finally {
    pendingState.fetchingEmCommuteUserStations = false
    gridApi.value?.setGridOption('loading', false)
  }
}

onMounted(async () => {
  await Promise.all([fetchEmCommuteUsers()])
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
      :loading="pendingState.creatingEmCommuteUserStation"
      :vehicle-types="vehicleTypes"
      @submit="onCreateEmFleetVehicle"
    />

    <EmFleetVehicleEditDialog
      v-if="uiState.isEmFleetVehicleEditDialogVisible"
      v-model:is-dialog-visible="uiState.isEmFleetVehicleEditDialogVisible"
      :loading="pendingState.editingEmCommuteUserStation"
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
