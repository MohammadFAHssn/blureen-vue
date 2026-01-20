<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  request: {
    required: true,
  },
})

const emit = defineEmits(['submit', 'update:isDialogVisible'])

// states
const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isEditRequestDialogVisible: false,
})
const leaveDate = ref(props.request.start_date)
const leaveDateRules = [
  () => !!leaveDate.value || 'لطفا تاریخ مرخصی را انتخاب کنید',
]
const startTime = ref(props.request.start_time)
const startTimeRules = [
  () => !!startTime.value || 'لطفا ساعت شروع را انتخاب کنید',
]
const endTime = ref(props.request.end_time)
const endTimeRules = [
  () => !!startTime.value || 'لطفا ساعت پایان را انتخاب کنید',
]
const refVForm = ref()

function onFormSubmit() {
  refVForm.value?.validate().then(async ({ valid: isValid }) => {
    if (isValid) {
      try {
        await axiosInstance.patch(
          '/hr-request/requests/update',
          {
            formData: {
              requestId: props.request.id,
              leaveDate,
              startTime,
              endTime,
            },
          },
        )
        dialogModelValueUpdate(false)
      }
      catch (error) {
        uiState.hasError = true
        uiState.errorMessage = error.message ?? 'خطا هنگام بروزرسانی درخواست'
      }
    }
  })
}
function dialogModelValueUpdate(val) {
  emit('update:isDialogVisible', val)
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
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardText>
        <h4 class="text-h5 text-center mb-2">
          ویرایش درخواست
        </h4>
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
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit" @click="refVForm?.validate()">
                ذخیره
              </VBtn>

              <VBtn
                color="secondary"
                variant="tonal"
                @click="emit('update:isDialogVisible', false)"
              >
                انصراف
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
