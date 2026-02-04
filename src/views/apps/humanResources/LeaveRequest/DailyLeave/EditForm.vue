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
const refVForm = ref()
const startDate = ref(props.request.start_date)
const endDate = ref(props.request.end_date)

function getDetailValue(key) {
  return props.request?.details?.find(d => d.key === key)?.value ?? ''
}

const description = ref(getDetailValue('description'))
const replacementUser = ref(null)
const replacements = ref([])

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

async function fetchReplacements() {
  try {
    const { data } = await axiosInstance.get('/base/user/replacements', {
      params: {
        user_id: props.request.user_id,
      },
    })
    replacements.value = (data.data || []).map(u => ({
      ...u,
      fullName: `${u.first_name} ${u.last_name} - ${u.personnel_code}`,
    }))

    const replacementId = getDetailValue('replacement_user_id') || 0
    replacementUser.value = Number(replacementId) ?? null
  }
  catch (error) {
    uiState.hasError = true
    uiState.errorMessage
      = error?.response?.data?.message ?? error.message ?? 'خطای ناشناخته'
  }
}

function onFormSubmit() {
  refVForm.value?.validate().then(async ({ valid: isValid }) => {
    if (isValid) {
      try {
        uiState.loading = true
        await axiosInstance.patch('/hr-request/request/update', {
          requestId: props.request.id,
          start_date: startDate.value,
          end_date: endDate.value,
          details: {
            replacement_user_id: replacementUser.value,
            description: description.value,
          },
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

onMounted(() => {
  fetchReplacements()
})
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

            <VCol cols="12" sm="6">
              <VSelect
                v-model="replacementUser"
                :items="replacements"
                item-title="fullName"
                item-value="id"
                label="انتخاب جانشین(اختیاری)"
                variant="outlined"
                :disabled="uiState.loading"
                clearable
              />
            </VCol>

            <VCol cols="12" sm="6">
              <VTextarea
                v-model="description"
                label="توضیحات(اختیاری)"
                variant="outlined"
                :disabled="uiState.loading"
                auto-grow
                rows="2"
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
