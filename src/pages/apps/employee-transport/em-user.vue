<script setup>
import EmUserStationSelectionDialog from '@/views/apps/employeeTransport/emdialog/EmUserStationSelectionDialog.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'em-user',
  },
})

// states
const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isEmUserStationSelectionDialogVisible: false,
})
const pendingState = reactive({
  fetchingUserEmCommuteService: false,
  loading: false,
  choosingEmCommuteStation: false,
})
function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}
const cities = ref([])
const emShiftTypes = ref([])
const emCommuteStations = ref([])

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
  }
}
async function fetchEmCities() {
  pendingState.loading = true
  try {
    const res = await $api('/employee-transport/em-city', { method: 'GET' })
    cities.value = res?.data.emCities || []
  }
  catch (e) {
    console.error('Error fetching cities:', e)
    setError(e.message || 'خطا در دریافت شهرها')
  }
  finally {
    pendingState.loading = false
  }
}
async function fetchEmShiftTypes() {
  pendingState.loading = true
  try {
    const res = await $api('/employee-transport/em-shift-type', { method: 'GET' })
    emShiftTypes.value = res?.data.emShiftTypes || []
  }
  catch (e) {
    console.error('Error fetching emShiftTypes:', e)
    setError(e.message || 'خطا در دریافت انواع شیفت')
  }
  finally {
    pendingState.loading = false
  }
}
async function fetchEmCommuteStations() {
  pendingState.loading = true
  try {
    const res = await $api('/employee-transport/commute-station/getUsed', { method: 'GET' })
    emCommuteStations.value = res?.data.emCommuteStations || []
  }
  catch (e) {
    console.error('Error fetching emCommuteStations:', e)
    setError(e.message || 'خطا در دریافت ایستگاه‌ها')
  }
  finally {
    pendingState.loading = false
  }
}
onMounted(async () => {
  await Promise.all([fetchEmCities(), fetchEmShiftTypes(), fetchEmCommuteStations()])
})
</script>

<template>
  <VContainer>
    <VSnackbar
      v-model="uiState.hasError"
      :timeout="2000"
      location="center"
      variant="flat"
      color="error"
    >
      {{ uiState.errorMessage }}
    </VSnackbar>
    <VRow dense>
      <VCol cols="12">
        <VRow align="center" justify="center" class="gap-4">
          <div class="text-h6 font-weight-bold text-primary-darken-3">
            شما هنوز سرویسی انتخاب نکرده‌اید. برای این کار، میتوانید از دکمه زیر استفاده کنید.
          </div>
        </VRow>
        <VRow align="center" justify="center" class="gap-4">
          <VBtn :disabled="pendingState.loading" @click="uiState.isEmUserStationSelectionDialogVisible = true">
            شروع
          </VBtn>
        </VRow>
      </VCol>
    </VRow>
  </VContainer>

  <EmUserStationSelectionDialog
    v-if="uiState.isEmUserStationSelectionDialogVisible"
    v-model:is-dialog-visible="uiState.isEmUserStationSelectionDialogVisible"
    :loading="pendingState.choosingEmCommuteStation"
    :cities="cities"
    :shift-types="emShiftTypes"
    :stations="emCommuteStations"
    @submit="onCreateCommuteService"
  />
</template>
