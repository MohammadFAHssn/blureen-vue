<script setup>
import EmUserStationSelectionDialog from '@/views/apps/employeeTransport/emdialog/EmUserStationSelectionDialog.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'em-user',
  },
})

/* -------------------- UI STATE -------------------- */
const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isEmUserStationSelectionDialogVisible: false,
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

/* -------------------- PENDING STATE -------------------- */
const pendingState = reactive({
  firstLoad: true,
  choosingEmCommuteStation: false,
  sendingSMS: false,
})

/* -------------------- DATA -------------------- */
const userStation = ref(null)
const cities = ref([])
const emShiftTypes = ref([])
const emCommuteStations = ref([])

const hasService = computed(() => !!userStation.value?.emCommuteServiceStation)
const service = computed(() => userStation.value?.emCommuteServiceStation?.emCommuteService || null)
const station = computed(() => userStation.value?.emCommuteServiceStation?.emCommuteStation || null)
const smsSentDriver = computed(() => userStation.value?.smsSentDriver ?? false)

/* -------------------- API -------------------- */
async function fetchUserEmCommuteStation() {
  pendingState.firstLoad = true
  const res = await $api('/employee-transport/user', { method: 'GET' })
  const d = res?.data

  userStation.value = (d && d.emCommuteServiceStation) ? d : null
  pendingState.firstLoad = false
}

async function fetchEmCities() {
  const res = await $api('/employee-transport/em-city', { method: 'GET' })
  cities.value = res?.data?.emCities || []
}

async function fetchEmShiftTypes() {
  const res = await $api('/employee-transport/em-shift-type', { method: 'GET' })
  emShiftTypes.value = res?.data?.emShiftTypes || []
}

async function fetchEmCommuteStations() {
  const res = await $api('/employee-transport/commute-station/getUsed', { method: 'GET' })
  emCommuteStations.value = res?.data?.emCommuteStations || []
}

/* -------------------- ACTIONS -------------------- */
async function onChooseStation(inComing) {
  resetMessages()

  const payload = {
    user_id: useCookie('userData')?.value?.id,
    em_shift_type_id: inComing.shiftType,
    em_commute_station_id: inComing.selectedStation,
  }

  pendingState.choosingEmCommuteStation = true
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

    setSuccess('ایستگاه با موفقیت انتخاب شد.')
  }
  catch (err) {
    console.error(err)
    setError(err?.message || 'خطای غیرمنتظره')
  }
  finally {
    uiState.isEmUserStationSelectionDialogVisible = false
    pendingState.choosingEmCommuteStation = false
    await fetchUserEmCommuteStation()
  }
}

async function useSendSms() {
  resetMessages()

  pendingState.sendingSMS = true
  try {
    await $api('/employee-transport/user/sms', {
      method: 'POST',
      onResponseError({ response }) {
        const msg = response?._data?.errors
          ? Object.values(response._data.errors).flat().join(' | ')
          : (response?._data?.message || 'خطا در ارسال یامک')
        throw new Error(msg)
      },
    })

    setSuccess('پیامک با موفقیت ارسال شد.')
  }
  catch (err) {
    console.error(err)
    setError(err?.message || 'خطای غیرمنتظره')
  }
  finally {
    pendingState.sendingSMS = false
    await fetchUserEmCommuteStation()
  }
}

/* -------------------- LIFECYCLE -------------------- */
onMounted(async () => {
  resetMessages()
  pendingState.firstLoad = true
  try {
    await Promise.all([
      fetchUserEmCommuteStation(),
      fetchEmCities(),
      fetchEmShiftTypes(),
      fetchEmCommuteStations(),
    ])
  }
  catch (e) {
    console.error(e)
    setError(e?.message || 'خطا در دریافت اطلاعات')
  }
  finally {
    pendingState.firstLoad = false
  }
})
</script>

<template>
  <VContainer class="py-8">
    <VSnackbar
      v-model="uiState.hasError"
      :timeout="3500"
      location="center"
      variant="flat"
      color="error"
    >
      {{ uiState.errorMessage }}
    </VSnackbar>
    <VSnackbar
      v-model="uiState.success"
      :timeout="2500"
      location="center"
      variant="flat"
      color="success"
    >
      {{ uiState.successMessage }}
    </VSnackbar>

    <VRow justify="center">
      <VCol>
        <VSkeletonLoader v-if="pendingState.firstLoad" type="card" />

        <VCard
          v-else-if="!hasService"
          class="pa-8 text-center"
        >
          <div class="text-h6 font-weight-bold mb-3">
            شما هنوز ایستگاهی انتخاب نکرده‌اید
          </div>

          <div class="text-body-2 text-medium-emphasis mb-6">
            برای شروع، روی دکمه زیر کلیک کنید.
          </div>

          <VBtn
            size="large"
            color="primary"
            @click="uiState.isEmUserStationSelectionDialogVisible = true"
          >
            انتخاب ایستگاه
          </VBtn>
        </VCard>

        <VCard v-else>
          <VCardTitle class="text-h6 font-weight-bold">
            سرویس شما
          </VCardTitle>

          <VDivider />

          <VCardText class="py-6">
            <VRow>
              <VCol cols="12" sm="6">
                <div class="text-caption text-medium-emphasis mb-1">
                  سرویس
                </div>
                <VChip color="deep-orange" variant="tonal" size="large">
                  {{ `${service?.code || ''} ${service?.emShiftType?.name || ''}` }}
                </VChip>
              </VCol>

              <VCol cols="12" sm="6">
                <div class="text-caption text-medium-emphasis mb-1">
                  راننده
                </div>
                <VChip color="orange-darken-2" variant="tonal" size="large">
                  {{ service?.emFleetVehicle?.driverName || '-' }}
                </VChip>
              </VCol>
            </VRow>

            <VDivider class="my-4" />

            <VRow>
              <VCol cols="12" sm="6">
                <div class="text-caption text-medium-emphasis mb-1">
                  موبایل راننده
                </div>
                <VChip color="primary" variant="tonal" size="large">
                  {{ service?.emFleetVehicle?.driverMobileNumber || '-' }}
                </VChip>
              </VCol>

              <VCol cols="12" sm="6">
                <div class="text-caption text-medium-emphasis mb-1">
                  ایستگاه شما
                </div>
                <VChip color="primary" variant="tonal" size="large" class="text-wrap">
                  {{
                    `${station?.emCity?.name || ''} -
                    ${station?.mainStreet || ''} -
                    ${station?.sideStreet || ''} -
                    ${station?.boardingPlace || ''}`
                  }}
                </VChip>
              </VCol>
            </VRow>

            <VDivider class="my-4" />

            <VRow align="center" justify="center">
              <div v-if="smsSentDriver" class="text-success mb-1">
                پیامک با موفقیت برای راننده ارسال شد!
              </div>
              <div v-else>
                <div class="text-error mb-1">
                  پیامک برای راننده ارسال نشد!
                  <VBtn
                    :disabled="pendingState.sendingSMS"
                    :loading="pendingState.sendingSMS"
                    size="small"
                    color="success"
                    variant="tonal"
                    rounded="lg"
                    @click="useSendSms"
                  >
                    ارسال پیامک
                  </VBtn>
                </div>
              </div>
            </VRow>
          </VCardText>
        </VCard>
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
    @submit="onChooseStation"
  />
</template>
