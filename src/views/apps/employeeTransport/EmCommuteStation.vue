<script setup>
import EmCommuteStationCreateDialog from '@/views/apps/employeeTransport/emdialog/EmCommuteStationCreateDialog.vue'
import EmCommuteStationEditDialog from '@/views/apps/employeeTransport/emdialog/EmCommuteStationEditDialog.vue'
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
  isEmCommuteStationCreateDialogVisible: false,
  isEmCommuteStationEditDialogVisible: false,
})
const pendingState = reactive({
  fetchingEmCommuteStations: false,
  fetchingCities: false,
  creatingEmCommuteStation: false,
  editingEmCommuteStation: false,
})
function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}
const cities = ref([])
const emCommuteStations = ref([])
const selectedEmCommuteStation = ref(null)
// ----- start ag-grid -----
const gridApi = ref(null)
const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption('loading', true)
}

const columnDefs = ref([
  { headerName: 'شهر', field: 'city' },
  { headerName: 'کد', field: 'code' },
  { headerName: 'آدرس', field: 'address' },
  {
    headerName: 'وضعیت',
    field: 'active',
    cellRenderer: 'Active',
    cellStyle: { 'display': 'flex', 'align-items': 'center' },
    filterParams: {
      valueFormatter: params => (params.value === 1 ? 'فعال' : 'غیرفعال'),
    },
  },
  {
    headerName: 'عملیات',
    field: 'actions',
    cellRendererSelector: (_params) => {
      return {
        component: 'Actions',
        params: {
          onEditClick: (selectedNode) => {
            selectedEmCommuteStation.value = selectedNode.data
            uiState.isEmCommuteStationEditDialogVisible = true
          },
          onActivityChange: (selectedNode, event) => {
            selectedEmCommuteStation.value = selectedNode.data
            onChangeStatus({
              active: event.target.checked,
            },
            )
          },
        },
      }
    },
  },
])

const rowData = computed(() =>
  (emCommuteStations.value).map(commuteStation => ({
    id: commuteStation.id,
    city: commuteStation.emCity.name ?? '',
    code: commuteStation.code ?? '',
    address: commuteStation.address ?? '',
    active: commuteStation.active,
    actions: {
      editable: {
        status: true,
        mode: 'view',
      },
      activable: true,
    },
  })),
)

// ----- end ag-grid -----
async function onCreateCommuteStation(payload) {
  const formData = new FormData()
  formData.append('city_name', payload.cityName?.name ?? payload.cityName)
  formData.append('address', payload.address)
  formData.append('code', payload.code)
  if (payload.description) {
    formData.append('description', payload.description)
  }

  pendingState.creatingEmCommuteStation = true

  try {
    await $api('/employee-transport/commute-station', {
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

    uiState.isEmCommuteStationCreateDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.creatingEmCommuteStation = false
    fetchEmCommuteStations()
    fetchEmCities()
  }
}

async function onUpdateCommuteStation(payload) {
  const formData = new FormData()
  const id = selectedEmCommuteStation.value.id
  formData.append('city_name', payload.cityName?.name ?? payload.cityName)
  formData.append('address', payload.address)
  formData.append('code', payload.code)
  formData.append('description', payload.description)

  pendingState.editingEmCommuteStation = true

  try {
    await $api(`/employee-transport/commute-station/update/${id}`, {
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

    uiState.isEmCommuteStationEditDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.editingEmCommuteStation = false
    fetchEmCommuteStations()
    fetchEmCities()
  }
}

async function onChangeStatus(data) {
  const id = selectedEmCommuteStation.value.id

  pendingState.editingEmCommuteStation = true

  try {
    await $api(`/employee-transport/commute-station/update/${id}`, {
      method: 'POST',
      body: data,
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

    uiState.isEmCommuteStationEditDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.editingEmCommuteStation = false
    fetchEmCommuteStations()
    fetchEmCities()
  }
}

async function fetchEmCities() {
  pendingState.fetchingCities = true
  try {
    const res = await $api('/employee-transport/em-city', { method: 'GET' })
    cities.value = res?.data.emCities || []
  }
  catch (e) {
    console.error('Error fetching cities:', e)
    setError(e.message || 'خطا در دریافت شهرها')
  }
  finally {
    pendingState.fetchingCities = false
  }
}

async function fetchEmCommuteStations() {
  gridApi.value?.setGridOption('loading', true)
  try {
    const res = await $api('/employee-transport/commute-station', { method: 'GET' })
    emCommuteStations.value = res?.data.emCommuteStations || []
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
  await Promise.all([fetchEmCities(), fetchEmCommuteStations()])
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

    <EmCommuteStationCreateDialog
      v-if="uiState.isEmCommuteStationCreateDialogVisible"
      v-model:is-dialog-visible="uiState.isEmCommuteStationCreateDialogVisible"
      :loading="pendingState.creatingEmCommuteStation"
      :cities="cities"
      @submit="onCreateCommuteStation"
    />

    <EmCommuteStationEditDialog
      v-if="uiState.isEmCommuteStationEditDialogVisible"
      v-model:is-dialog-visible="uiState.isEmCommuteStationEditDialogVisible"
      :loading="pendingState.editingEmCommuteStation"
      :cities="cities"
      :station="selectedEmCommuteStation"
      @submit="onUpdateCommuteStation"
    />

    <VApp>
      <VFab
        app
        icon="tabler-plus"
        size="x-large"
        @click="uiState.isEmCommuteStationCreateDialogVisible = true"
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
