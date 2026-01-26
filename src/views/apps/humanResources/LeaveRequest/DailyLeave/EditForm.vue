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
})
const refVForm = ref()
const startDate = ref(props.request.start_date)
const endDate = ref(props.request.end_date)
const showStartPicker = ref(false)
const showEndPicker = ref(false)
function selectStart(val) {
  startDate.value = val.format ? val.format('jYYYY-jMM-jDD') : val
  showStartPicker.value = false
}
function selectEnd(val) {
  endDate.value = val.format ? val.format('jYYYY-jMM-jDD') : val
  showEndPicker.value = false
}

const startDateRules = [
  () => !!startDate.value || 'لطفا تاریخ شروع را انتخاب کنید',
]
const endDateRules = [
  () => !!endDate.value || 'لطفا تاریخ پایان را انتخاب کنید',
  () =>
    !(endDate.value < startDate.value)
    || 'تاریخ پایان نمیتواند قبل از تاریخ شروع باشد.',
]

function onFormSubmit() {
  refVForm.value?.validate().then(async ({ valid: isValid }) => {
    if (isValid) {
      try {
        await axiosInstance.patch('/hr-request/request/update', {
          requestId: props.request.id,
          start_date: startDate.value,
          end_date: endDate.value,
          editor: useCookie('userData').value.id === props.request.user_id ? 'personnel' : 'supervisor',
        })
        emit('submit')
        emit('update:isDialogVisible', false)
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
            <VCol cols="12" sm="6">
              <VTextField
                v-model="startDate"
                :rules="startDateRules"
                label="تاریخ شروع"
                readonly
                variant="outlined"
                @click="showStartPicker = true"
              />
              <VDialog v-model="showStartPicker" max-width="300px">
                <VCard>
                  <input id="startDate-input" style="display: none" />
                  <PersianDatetimePicker
                    v-model="startDate"
                    format="jYYYY-jMM-jDD"
                    inline
                    custom-input="#startDate-input"
                    @change="selectStart"
                  />
                </VCard>
              </VDialog>
            </VCol>

            <VCol cols="12" sm="6">
              <VTextField
                v-model="endDate"
                :rules="endDateRules"
                label="تاریخ پایان"
                readonly
                variant="outlined"
                @click="showEndPicker = true"
              />
              <VDialog v-model="showEndPicker" max-width="300px">
                <VCard>
                  <input id="endDate-input" style="display: none" />
                  <PersianDatetimePicker
                    v-model="endDate"
                    format="jYYYY-jMM-jDD"
                    inline
                    custom-input="#endDate-input"
                    @change="selectEnd"
                  />
                </VCard>
              </VDialog>
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
