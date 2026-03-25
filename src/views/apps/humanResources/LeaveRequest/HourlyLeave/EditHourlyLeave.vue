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

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  loading: false,
})

const showDatePicker = ref(false)
const leaveDate = ref(props.request.start_date)
const leaveDateRules = [
  () => !!leaveDate.value || 'لطفا تاریخ مرخصی را انتخاب کنید',
]
function selectDate(val) {
  leaveDate.value = val?.format ? val.format('jYYYY-jMM-jDD') : val
  showDatePicker.value = false
}

const startTime = ref(props.request.start_time)
const startTimeRules = [
  () => !!startTime.value || 'لطفا ساعت شروع را انتخاب کنید',
]
const endTime = ref(props.request.end_time)
const endTimeRules = [() => !!endTime.value || 'لطفا ساعت پایان را انتخاب کنید']
const refVForm = ref()

function onFormSubmit() {
  refVForm.value?.validate().then(async ({ valid: isValid }) => {
    if (isValid) {
      uiState.loading = true
      try {
        await axiosInstance.patch('/hr-request/request/update', {
          requestId: props.request.id,
          start_date: leaveDate.value,
          end_date: leaveDate.value,
          start_time: startTime.value,
          end_time: endTime.value,
        })
        emit('submit')
        emit('update:isDialogVisible', false)
      }
      catch (error) {
        uiState.hasError = true
        uiState.errorMessage
          = error?.response?.data?.message ?? error.message ?? 'خطای ناشناخته'
      }
      finally {
        uiState.loading = false
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
            <VCol cols="12" sm="12">
              <VTextField
                v-model="leaveDate"
                :rules="leaveDateRules"
                label="تاریخ مرخصی"
                readonly
                variant="outlined"
                @click="showDatePicker = true"
              />
              <VDialog v-model="showDatePicker" max-width="300px">
                <VCard>
                  <input id="leaveDate-input" style="display: none" />
                  <PersianDatetimePicker
                    v-model="leaveDate"
                    format="jYYYY-jMM-jDD"
                    inline
                    custom-input="#leaveDate-input"
                    @change="selectDate"
                  />
                </VCard>
              </VDialog>
            </VCol>

            <VCol cols="12" sm="6">
              <VTextField
                v-model="startTime"
                :rules="startTimeRules"
                label="ساعت شروع"
                type="time"
                format="H:i"
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
                format="H:i"
                density="compact"
                variant="outlined"
                step="60"
              />
            </VCol>
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn
                type="submit"
                :loading="uiState.loading"
                :disabled="uiState.loading"
              >
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
