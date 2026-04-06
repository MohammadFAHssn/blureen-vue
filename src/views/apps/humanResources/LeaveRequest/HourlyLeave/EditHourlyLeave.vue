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

const startTimeDialog = ref(false)
const endTimeDialog = ref(false)

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
      } catch (error) {
        uiState.hasError = true
        uiState.errorMessage =
          error?.response?.data?.message ?? error.message ?? 'خطای ناشناخته'
      } finally {
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

    <VCard>
      <VCardText>
        <h4 class="text-h5 text-center mb-2">ویرایش درخواست</h4>
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
