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

const supervisors = ref([])
const selectedSupervisor = ref()
const selectSupervisorRule = [
  () =>
    !!selectedSupervisor.value
    || 'لطفا یک شخص را جهت ارجاع درخواست انتخاب نمایید.',
]
async function fetchUserSupervisors() {
  try {
    const { data } = await axiosInstance.get(
      '/hr-request/request/get-approvers',
      {
        params: {
          user_id: props.request.user_id,
          requestId: props.request.id,
        },
      },
    )

    supervisors.value = data.data
      .filter(item => item.orgPosition)
      .map(item => ({
        users: item.users,
        fullName: `${item.users[0].first_name} ${item.users[0].last_name} - ${item.users[0].personnel_code}`,
      }))
  }
  catch (error) {
    uiState.hasError = true
    uiState.errorMessage
      = error.response.data.message ?? 'خطا در دریافت اطلاعات'
  }
}

function onFormSubmit() {
  refVForm.value?.validate().then(async ({ valid: isValid }) => {
    if (isValid) {
      try {
        await axiosInstance.post('/hr-request/request/referral', {
          approver: [selectedSupervisor.value],
          requestId: props.request.id,
        })
        emit('submit')
        emit('update:isDialogVisible', false)
      }
      catch (error) {
        uiState.hasError = true
        uiState.errorMessage
          = error?.response?.data?.message ?? 'خطا هنگام ارجاع درخواست'
      }
    }
  })
}

onMounted(() => {
  fetchUserSupervisors()
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
    @update:model-value="emit('update:isDialogVisible', false)"
  >
    <DialogCloseBtn @click="emit('update:isDialogVisible', false)" />

    <VCard>
      <VCardText>
        <h4 class="text-h5 text-center mb-2">
          ارجاع درخواست
        </h4>
        <VForm
          ref="refVForm"
          class="mt-6"
          validate-on="submit lazy"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <v-autocomplete
                v-model="selectedSupervisor"
                clearable
                label="انتخاب جهت ارجاع"
                :items="supervisors"
                :rules="selectSupervisorRule"
                item-title="fullName"
                return-object
                variant="solo-filled"
              />
            </VCol>
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit" @click="refVForm?.validate()">
                ارجاع
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
