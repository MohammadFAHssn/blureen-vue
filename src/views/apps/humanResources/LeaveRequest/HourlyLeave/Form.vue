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
  isEditRequestDialogVisible: false,
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
const endTimeRules = [
  () => !!startTime.value || 'لطفا ساعت پایان را انتخاب کنید',
]
const refVForm = ref()

function onFormSubmit() {
  refVForm.value?.validate().then(async ({ valid: isValid }) => {
    if (isValid) {
      try {
        const requestData = {
          request_type_id: HR_REQUEST_TYPES.HOURLY_LEAVE,
          user_id: props.userId,
          start_date: leaveDate.value,
          end_date: leaveDate.value,
          start_time: startTime.value,
          end_time: endTime.value,
        }
        await axiosInstance.post('/hr-request/requests/create', requestData)

        uiState.success = true
        uiState.successMessage = `درخواست مرخصی با موفقیت ثبت شد`
        startTime.value = ''
        endTime.value = ''
        emit('created')
      }
      catch (error) {
        let error_message
        if (!('errors' in error.response.data)) {
          error_message = error.response.data.message
        }
        else {
          error_message = error.response.data.message
        }

        uiState.hasError = true
        uiState.errorMessage = error_message
      }
    }
  })
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
            type="time"
            density="compact"
            variant="outlined"
            step="60"
          />
        </VCol>
        <VCol cols="12" sm="6">
          <VTextField
            v-model="endTime"
            :rules="endTimeRules"
            label="ساعت پایان"
            type="time"
            density="compact"
            variant="outlined"
            step="60"
          />
        </VCol>
      </VRow>
      <VRow justify="center" class="mt-4">
        <VCol cols="auto">
          <VBtn type="submit" color="primary" @click="refVForm?.validate()">
            ثبت درخواست
          </VBtn>
        </VCol>
      </VRow>
    </VForm>
  </VCard>
</template>

<style scoped></style>
