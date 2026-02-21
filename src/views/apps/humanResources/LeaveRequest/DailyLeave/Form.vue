<script setup>
const props = defineProps({
  userId: {
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
const startDate = ref('')
const endDate = ref('')
const description = ref('')
const replacementUser = ref(null)
const replacements = ref([])

const startDateRules = [
  () => !!startDate.value || 'لطفا تاریخ شروع را انتخاب کنید',
]
const endDateRules = [
  () => !!endDate.value || 'لطفا تاریخ پایان را انتخاب کنید',
  () =>
    !(endDate.value < startDate.value)
    || 'تاریخ پایان نمیتواند قبل از تاریخ شروع باشد.',
]
const showStartPicker = ref(false)
const showEndPicker = ref(false)
const refVForm = ref()

function selectStart(val) {
  startDate.value = val.format ? val.format('jYYYY-jMM-jDD') : val
  showStartPicker.value = false
}
function selectEnd(val) {
  endDate.value = val.format ? val.format('jYYYY-jMM-jDD') : val
  showEndPicker.value = false
}

function onFormSubmit() {
  refVForm.value?.validate().then(async ({ valid: isValid }) => {
    if (isValid) {
      try {
        uiState.loading = true
        const requestData = {
          request_type_id: HR_REQUEST_TYPES.DAILY_LEAVE,
          user_id: props.userId,
          start_date: startDate.value,
          end_date: endDate.value,
          details: {
            replacement_user: replacementUser.value,
            description: description.value,
          },
        }
        await axiosInstance.post('/hr-request/request/create', requestData)
        uiState.success = true
        uiState.successMessage = `درخواست مرخصی با موفقیت ثبت شد`
        startDate.value = ''
        endDate.value = ''
        description.value = ''
        replacementUser.value = null
        emit('created')
      }
      catch (error) {
        uiState.hasError = true
        uiState.errorMessage = error.response.data.message
      }
      finally {
        uiState.loading = false
      }
    }
  })
}

async function fetchReplacements() {
  try {
    const { data } = await axiosInstance.get('/base/user/replacements', {
      params: {
        user_id: props.userId,
      },
    })
    replacements.value = data.data.map(u => ({
      ...u,
      fullName: `${u.first_name} ${u.last_name} - ${u.personnel_code}`,
    }))
  }
  catch (error) {
    uiState.hasError = true
    uiState.errorMessage = error.response.data.message
  }
}

onMounted(() => {
  fetchReplacements()
})
watch(
  () => props.userId,
  (newVal) => {
    if (newVal) {
      replacementUser.value = null
      fetchReplacements()
    }
  },
)
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
      انتخاب تاریخ
    </label>

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
            label="تاریخ شروع"
            :rules="startDateRules"
            readonly
            variant="outlined"
            @click="showStartPicker = true"
          />
          <VDialog v-model="showStartPicker" max-width="300px">
            <VCard>
              <input id="startDate-input" style="display: none" />
              <PersianDatetimePicker
                v-model="startDate"
                format="jYYYY/jMM/jDD"
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
            label="تاریخ پایان"
            :rules="endDateRules"
            readonly
            variant="outlined"
            @click="showEndPicker = true"
          />
          <VDialog v-model="showEndPicker" max-width="300px">
            <VCard>
              <input id="endDate-input" style="display: none" />
              <PersianDatetimePicker
                v-model="endDate"
                format="jYYYY/jMM/jDD"
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
            item-value="fullName"
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

<style scoped></style>
