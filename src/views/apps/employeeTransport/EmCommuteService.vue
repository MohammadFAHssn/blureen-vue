<script setup>
import EmCommuteServiceCreateDialog from '@/views/apps/employeeTransport/emdialog/EmCommuteServiceCreateDialog.vue'
import EmCommuteServiceEditDialog from '@/views/apps/employeeTransport/emdialog/EmCommuteServiceEditDialog.vue'
import EmCommuteServiceStationManagementDialog from '@/views/apps/employeeTransport/emdialog/EmCommuteServiceStationManagementDialog.vue'
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
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isEmCommuteServiceCreateDialogVisible: false,
  isEmCommuteServiceEditDialogVisible: false,
  isEmCommuteServicStationManagementDialogVisible: false,
})
const pendingState = reactive({
  fetchingEmCommuteServices: false,
  fetchingShiftTypes: false,
  fetchingFleetVehicles: false,
  fetchingEmCommuteStations: false,
  creatingEmCommuteService: false,
  editingEmCommuteService: false,
})
function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}
const emShiftTypes = ref([])
const emFleetVehicles = ref([])
const emCommuteServices = ref([])
const emCommuteStations = ref([])
const selectedEmCommuteService = ref(null)
// ----- start ag-grid -----
const gridApi = ref(null)
const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption('loading', true)
}

const columnDefs = ref([
  { headerName: 'نام راننده', field: 'driverName' },
  { headerName: 'شماره تماس', field: 'driverMobileNumber' },
  { headerName: 'شیفت', field: 'shiftType' },
  { headerName: 'کد', field: 'serviceCode' },
  { headerName: 'تعداد ایستگاه', field: 'stationsQuantity' },
  { headerName: 'تعداد مسافر', field: 'passengersQuantity' },
  {
    headerName: 'عملیات',
    field: 'actions',
    cellRendererSelector: (_params) => {
      return {
        component: 'Actions',
        params: {
          onEditClick: (selectedNode) => {
            selectedEmCommuteService.value = selectedNode.data
            uiState.isEmCommuteServiceEditDialogVisible = true
          },
          onAddStationClick: (selectedNode) => {
            selectedEmCommuteService.value = selectedNode.data
            uiState.isEmCommuteServicStationManagementDialogVisible = true
          },
        },
      }
    },
  },
])

const rowData = computed(() =>
  (emCommuteServices.value).map(emCommuteService => ({
    id: emCommuteService.id,
    driverName: emCommuteService.emFleetVehicle.driverName ?? '',
    driverMobileNumber: emCommuteService.emFleetVehicle.driverMobileNumber ?? '',
    shiftType: emCommuteService.emShiftType.name ?? '',
    serviceCode: emCommuteService.serviceCode,
    stationsQuantity: emCommuteService.stations.length,
    passengersQuantity: emCommuteService.stations.reduce((sum, station) => sum + (station.passengersQuantity || 0), 0) || 0,
    fleetVehicle: emCommuteService.emFleetVehicle.id,
    stations: emCommuteService.stations,
    actions: {
      editable: {
        status: true,
        mode: 'view',
      },
      addStation: true,
    },
  })),
)

// ----- end ag-grid -----
async function onCreateCommuteService(payload) {
  const formData = new FormData()
  formData.append('em_shift_type', payload.shiftType?.name ?? payload.shiftType)
  formData.append('em_fleet_vehicle_id', payload.fleetVehicle)
  formData.append('service_code', payload.serviceCode)

  pendingState.creatingEmCommuteService = true

  try {
    await $api('/employee-transport/service', {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage = response._data?.message || 'خطا در ایجاد سرویس'
        }
      },
    })

    uiState.isEmCommuteServiceCreateDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.creatingEmCommuteService = false
    fetchEmShiftTypes()
    fetchEmFleetVehicles()
    fetchEmCommuteServices()
  }
}

async function onUpdateCommuteService(payload) {
  const formData = new FormData()
  const id = selectedEmCommuteService.value.id
  formData.append('em_shift_type', payload.shiftType?.name ?? payload.shiftType)
  formData.append('em_fleet_vehicle_id', payload.fleetVehicle)
  formData.append('service_code', payload.serviceCode)

  pendingState.editingEmCommuteService = true

  try {
    await $api(`/employee-transport/service/update/${id}`, {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage = response._data?.message || 'خطا در ویرایش سرویس'
        }
      },
    })

    uiState.isEmCommuteServiceEditDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.editingEmCommuteService = false
    fetchEmShiftTypes()
    fetchEmFleetVehicles()
    fetchEmCommuteServices()
  }
}

async function onUpdateServiceStation(payload) {
  const id = selectedEmCommuteService.value.id
  pendingState.editingEmCommuteService = true
  try {
    const res = await $api(`/employee-transport/service/update/${id}`, {
      method: 'POST',
      body: JSON.stringify({
        selected_stations: payload.selectedStations,
      }),
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage = response._data?.message || 'خطا در مدیریت ایستگاه‌های سرویس'
        }
      },
    })

    const sr = res?.data?.stations_result || {}
    const created = sr.created || []
    const skipped = sr.exists_in_itself_or_other_services?.values || []
    const reasonMsg = sr.exists_in_itself_or_other_services?.message || ''

    const skippedText = skipped.length ? ` - ایستگاه‌ها: ${skipped.join(' | ')}` : ''
    const warnText = reasonMsg ? `${reasonMsg}${skippedText}` : skippedText

    if (created.length > 0 && skipped.length === 0) {
      uiState.success = true
      uiState.successMessage = 'ایستگاه/ها با موفقیت افزوده شدند.'
      uiState.isEmCommuteServicStationManagementDialogVisible = false
    }
    if (created.length > 0 && skipped.length > 0) {
      setError(`برخی از ایستگاه‌ها اضافه نشدند زیرا: ${warnText}`)
      uiState.isEmCommuteServicStationManagementDialogVisible = false
    }
    if (created.length === 0 && skipped.length > 0) {
      setError(`هیچ ایستگاهی به سرویس اضافه نشد زیرا: ${warnText}`)
    }
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.editingEmCommuteService = false
    fetchEmShiftTypes()
    fetchEmFleetVehicles()
    fetchEmCommuteServices()
  }
}

async function fetchEmShiftTypes() {
  pendingState.fetchingShiftTypes = true
  try {
    const res = await $api('/employee-transport/em-shift-type', { method: 'GET' })
    emShiftTypes.value = res?.data.emShiftTypes || []
  }
  catch (e) {
    console.error('Error fetching emShiftTypes:', e)
    setError(e.message || 'خطا در دریافت انواع شیفت')
  }
  finally {
    pendingState.fetchingShiftTypes = false
  }
}

async function fetchEmFleetVehicles() {
  pendingState.fetchingFleetVehicles = true
  try {
    const res = await $api('/employee-transport/fleet-vehicle', { method: 'GET' })
    if (res?.data.emFleetVehicles) {
      emFleetVehicles.value = res?.data.emFleetVehicles.map(v => ({
        ...v,
        vehicle: `${v.driverName} - ${v.emVehicleType.name} - ${v.plate}`,
      }))
    }
  }
  catch (e) {
    console.error('Error fetching emFleetVehicles:', e)
    setError(e.message || 'خطا در دریافت وسایل نقلیه')
  }
  finally {
    pendingState.fetchingFleetVehicles = false
  }
}

async function fetchEmCommuteServices() {
  pendingState.fetchingEmCommuteServices = true
  gridApi.value?.setGridOption('loading', true)
  try {
    const res = await $api('/employee-transport/service', { method: 'GET' })
    emCommuteServices.value = res?.data.emCommuteServices || []
  }
  catch (e) {
    console.error('Error fetching emCommuteServices:', e)
    setError(e.message || 'خطا در دریافت سرویس‌ها')
  }
  finally {
    pendingState.fetchingEmCommuteServices = false
    gridApi.value?.setGridOption('loading', false)
  }
}

async function fetchEmCommuteStations() {
  pendingState.fetchingEmCommuteStations = true
  gridApi.value?.setGridOption('loading', true)
  try {
    const res = await $api('/employee-transport/commute-station', { method: 'GET' })
    emCommuteStations.value = res?.data.emCommuteStations || []
    if (res?.data.emCommuteStations) {
      emCommuteStations.value = res?.data.emCommuteStations.map(s => ({
        ...s,
        name: `${s.emCity.name} (${s.code}) - ${s.mainStreet}-${s.sideStreet}-${s.boardingPlace}`,
      }))
    }
  }
  catch (e) {
    console.error('Error fetching emCommuteStations:', e)
    setError(e.message || 'خطا در دریافت ایستگاه‌ها')
  }
  finally {
    pendingState.fetchingEmCommuteStations = false
    gridApi.value?.setGridOption('loading', false)
  }
}

onMounted(async () => {
  await Promise.all([fetchEmShiftTypes(), fetchEmFleetVehicles(), fetchEmCommuteServices(), fetchEmCommuteStations()])
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

    <EmCommuteServiceCreateDialog
      v-if="uiState.isEmCommuteServiceCreateDialogVisible"
      v-model:is-dialog-visible="uiState.isEmCommuteServiceCreateDialogVisible"
      :loading="pendingState.creatingEmCommuteService"
      :shift-types="emShiftTypes"
      :fleet-vehicles="emFleetVehicles"
      @submit="onCreateCommuteService"
    />

    <EmCommuteServiceEditDialog
      v-if="uiState.isEmCommuteServiceEditDialogVisible"
      v-model:is-dialog-visible="uiState.isEmCommuteServiceEditDialogVisible"
      :loading="pendingState.editingEmCommuteService"
      :shift-types="emShiftTypes"
      :fleet-vehicles="emFleetVehicles"
      :service="selectedEmCommuteService"
      @submit="onUpdateCommuteService"
    />

    <EmCommuteServiceStationManagementDialog
      v-if="uiState.isEmCommuteServicStationManagementDialogVisible"
      v-model:is-dialog-visible="uiState.isEmCommuteServicStationManagementDialogVisible"
      :loading="pendingState.editingEmCommuteService"
      :commute-stations="emCommuteStations"
      :service="selectedEmCommuteService"
      @submit="onUpdateServiceStation"
    />

    <VApp>
      <VFab
        app
        icon="tabler-plus"
        size="x-large"
        @click="uiState.isEmCommuteServiceCreateDialogVisible = true"
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
