<script setup>
import EmStationForUserEditDialog from '@/views/apps/employeeTransport/emdialog/EmStationForUserEditDialog.vue'
import EmStationForUserSelectDialog from '@/views/apps/employeeTransport/emdialog/EmStationForUserSelectDialog.vue'
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
  isEmCommuteUserStationCreateDialogVisible: false,
  isEmCommuteUserStationEditDialogVisible: false,
})
const pendingState = reactive({
  fetchingEmCommuteUserStations: false,
  creatingEmCommuteUserStation: false,
  editingEmCommuteUserStation: false,
})
function resetMessages() {
  uiState.success = false
  uiState.successMessage = ''
  uiState.hasError = false
  uiState.errorMessage = ''
}

function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}

function setSuccess(message) {
  uiState.success = true
  uiState.successMessage = message
}
const users = ref([])
const cities = ref([])
const emShiftTypes = ref([])
const emCommuteUserStations = ref([])
const selectedEmCommuteUserStation = ref(null)
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
            selectedEmCommuteUserStation.value = selectedNode.data
            uiState.isEmCommuteUserStationEditDialogVisible = true
          },
        },
      }
    },
  },
])

const rowData = computed(() =>
  (emCommuteUserStations.value).map(emCommuteUserStation => ({
    id: emCommuteUserStation.id,
    emCommuteServiceStation: emCommuteUserStation.emCommuteServiceStation,
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

async function onChooseStation(inComing) {
  resetMessages()

  const payload = {
    user_id: inComing.selectedPersonnel,
    em_shift_type_id: inComing.shiftType,
    em_commute_station_id: inComing.selectedStation,
  }

  pendingState.creatingEmCommuteUserStation = true
  try {
    await $api('/employee-transport/user', {
      method: 'POST',
      body: payload,
      onResponseError({ response }) {
        const msg = response?._data?.errors
          ? Object.values(response._data.errors).flat().join(' | ')
          : (response?._data?.message || 'خطا در انتخاب')
        throw new Error(msg)
      },
    })
    uiState.isEmCommuteUserStationCreateDialogVisible = false
    setSuccess('ایستگاه با موفقیت انتخاب شد.')
    await fetchEmCommuteUsers()
  }
  catch (err) {
    console.error(err)
    setError(err?.message || 'خطای غیرمنتظره')
  }
  finally {
    pendingState.creatingEmCommuteUserStation = false
  }
}

async function onUpdateChoosedStation(inComing) {
  resetMessages()

  const id = selectedEmCommuteUserStation.value.id

  const payload = {
    em_shift_type_id: inComing.shiftType,
    em_commute_station_id: inComing.selectedStation,
  }

  pendingState.editingEmCommuteUserStation = true
  try {
    await $api(`/employee-transport/user/update/${id}`, {
      method: 'POST',
      body: payload,
      onResponseError({ response }) {
        const msg = response?._data?.errors
          ? Object.values(response._data.errors).flat().join(' | ')
          : (response?._data?.message || 'خطا در ویرایش')
        throw new Error(msg)
      },
    })
    uiState.isEmCommuteUserStationEditDialogVisible = false
    setSuccess('ایستگاه انتخاب شده با موفقیت ویرایش شد.')
    await fetchEmCommuteUsers()
  }
  catch (err) {
    console.error(err)
    setError(err?.message || 'خطای غیرمنتظره')
  }
  finally {
    pendingState.editingEmCommuteUserStation = false
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

async function fetchUsers() {
  try {
    const { data, error } = await useApi(createUrl('/base/user/details'))
    if (error.value) {
      setError('خطا در دریافت کاربران')
      throw error.value
    }

    if (data.value?.data) {
      users.value = data.value.data.map(u => ({
        ...u,
        fullName: `${u.first_name} ${u.last_name} - ${u.personnel_code}`,
      }))
    }
  }
  catch (e) {
    console.error('Unexpected error fetching users:', e)
    setError('خطای غیرمنتظره در دریافت کاربران')
  }
}

async function fetchEmCities() {
  const res = await $api('/employee-transport/em-city', { method: 'GET' })
  cities.value = res?.data?.emCities || []
}

async function fetchEmShiftTypes() {
  const res = await $api('/employee-transport/em-shift-type', { method: 'GET' })
  emShiftTypes.value = res?.data?.emShiftTypes || []
}

onMounted(async () => {
  await Promise.all([fetchEmCommuteUsers(), fetchUsers(), fetchEmCities(), fetchEmShiftTypes()])
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

    <EmStationForUserSelectDialog
      v-if="uiState.isEmCommuteUserStationCreateDialogVisible"
      v-model:is-dialog-visible="uiState.isEmCommuteUserStationCreateDialogVisible"
      :loading="pendingState.creatingEmCommuteUserStation"
      :users="users"
      :cities="cities"
      :shift-types="emShiftTypes"
      @submit="onChooseStation"
    />

    <EmStationForUserEditDialog
      v-if="uiState.isEmCommuteUserStationEditDialogVisible"
      v-model:is-dialog-visible="uiState.isEmCommuteUserStationEditDialogVisible"
      :loading="pendingState.editingEmCommuteUserStation"
      :user="selectedEmCommuteUserStation"
      :cities="cities"
      :shift-types="emShiftTypes"
      @submit="onUpdateChoosedStation"
    />

    <VApp>
      <VFab
        app
        icon="tabler-plus"
        size="x-large"
        @click="uiState.isEmCommuteUserStationCreateDialogVisible = true"
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
