<script setup>
const props = defineProps({
  userId: {
    required: true,
  },
  date: {
    required: true,
  },
})
const emit = defineEmits(['created'])
const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  loading: false,
})
const leaveDate = ref(props.date)
const leaveDateRules = [
  () => !!leaveDate.value || 'لطفا تاریخ مرخصی را انتخاب کنید',
]
const startTime = ref('')
const startTimeRules = [
  () => !!startTime.value || 'لطفا ساعت شروع را انتخاب کنید',
]
const endTime = ref('')
const endTimeRules = [() => !!endTime.value || 'لطفا ساعت پایان را انتخاب کنید']
const refVForm = ref()

const startTimeDialog = ref(false)
const endTimeDialog = ref(false)

async function onFormSubmit() {
  const { valid } = await refVForm.value.validate()
  if (!valid) return

  try {
    uiState.loading = true
    const requestData = {
      request_type_id: REQUEST_TYPES.HOURLY_LEAVE,
      user_id: props.userId,
      start_date: leaveDate.value,
      end_date: leaveDate.value,
      start_time: startTime.value,
      end_time: endTime.value,
    }
    await axiosInstance.post('/hr-request/request/create', requestData)

    uiState.success = true
    uiState.successMessage = `درخواست مرخصی با موفقیت ثبت شد`
    startTime.value = ''
    endTime.value = ''
    emit('created')
  }
  catch (error) {
    uiState.hasError = true
    uiState.errorMessage
      = error?.response?.data?.message ?? 'خطا هنگام ثبت درخواست'
  }
  finally {
    uiState.loading = false
  }
}
</script>

<template>
  <VSnackbar
    v-model="uiState.hasError"
    :timeout="2000"
    location="center"
    variant="flat"
    color="error"
  >
    {{ uiState.errorMessage }}
  </VSnackbar>

  <VSnackbar
    v-model="uiState.success"
    :timeout="2000"
    location="center"
    variant="flat"
    color="success"
  >
    {{ uiState.successMessage }}
  </VSnackbar>

  <VDialog v-model="startTimeDialog" max-width="360">
    <VCard rounded="xl" elevation="8" class="pa-2">
      <VCardTitle class="text-center text-h6 font-weight-bold pt-4">
        ساعت شروع
      </VCardTitle>

      <VCardText class="px-4 pb-2">
        <div class="time-picker-wrapper">
          <VTimePicker
            v-model="startTime"
            format="24hr"
            elevation="0"
            class="mx-auto"
          />
        </div>
      </VCardText>

      <VCardActions class="px-4 pb-4">
        <VSpacer />
        <VBtn color="primary" rounded="lg" @click="startTimeDialog = false">
          تایید
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VDialog v-model="endTimeDialog" max-width="360">
    <VCard rounded="xl" elevation="8" class="pa-2">
      <VCardTitle class="text-center text-h6 font-weight-bold pt-4">
        ساعت پایان
      </VCardTitle>

      <VCardText class="px-4 pb-2">
        <div class="time-picker-wrapper">
          <VTimePicker
            v-model="endTime"
            format="24hr"
            elevation="0"
            class="mx-auto"
          />
        </div>
      </VCardText>

      <VCardActions class="px-4 pb-4">
        <VSpacer />
        <VBtn color="primary" rounded="lg" @click="endTimeDialog = false">
          تایید
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VCard class="mb-4 pa-4">
    <label class="font-weight-medium mb-2 d-block text-center">
      جزئیات درخواست
    </label>

    <VForm
      ref="refVForm"
      class="mt-6"
      validate-on="submit lazy"
      @submit.prevent="onFormSubmit"
    >
      <VRow>
        <VCol cols="12" sm="12" md="12">
          <VTextField
            v-model="leaveDate"
            :rules="leaveDateRules"
            label="تاریخ مرخصی"
            variant="outlined"
            readonly
          />
        </VCol>

        <VCol cols="12" sm="6">
          <VTextField
            v-model="startTime"
            :rules="startTimeRules"
            label="ساعت شروع"
            density="compact"
            variant="outlined"
            readonly
            prepend-inner-icon="tabler-clock"
            @click="startTimeDialog = true"
          />
        </VCol>

        <VCol cols="12" sm="6">
          <VTextField
            v-model="endTime"
            :rules="endTimeRules"
            label="ساعت پایان"
            density="compact"
            variant="outlined"
            readonly
            prepend-inner-icon="tabler-clock"
            @click="endTimeDialog = true"
          />
        </VCol>
      </VRow>

      <VRow justify="center" class="mt-4">
        <VCol cols="auto">
          <VBtn
            type="submit"
            color="primary"
            :loading="uiState.loading"
            :disabled="uiState.loading"
          >
            ثبت درخواست
          </VBtn>
        </VCol>
      </VRow>
    </VForm>
  </VCard>
</template>

<style scoped>
.time-picker-wrapper {
  display: flex;
  justify-content: center;
  border-radius: 20px;
  padding: 8px;
}

:deep(.v-picker-title) {
  display: none !important;
}

:deep(.v-time-picker-controls) {
  direction: ltr !important;
  justify-content: center !important;
}

:deep(.v-time-picker-controls__time) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0 !important;
  column-gap: 0 !important;
}

:deep(.v-time-picker-controls__time > div) {
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.v-time-picker-controls__time__separator) {
  margin: 0 6px !important;
  padding: 0 !important;
  width: auto !important;
  min-width: 0 !important;
}

:deep(.v-time-picker-controls__field-label) {
  display: none !important;
}
</style>
