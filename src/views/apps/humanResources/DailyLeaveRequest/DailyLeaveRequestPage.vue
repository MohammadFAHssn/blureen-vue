<script setup>
import DailyLeaveRequestForm from '@/views/apps/humanResources/DailyLeaveRequest/DailyLeaveRequestForm.vue'
import RequestsOfMonth from '@/views/apps/humanResources/DailyLeaveRequest/RequestsOfMonth.vue'
import RemainingLeave from '@/views/apps/humanResources/RemainingLeave.vue'

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isEditRequestDialogVisible: false,
})
const requestsLoading = ref(false)
const users = ref([])
const selectedUser = ref(useCookie('userData').value)

const currentMonthRequests = ref([])
async function getCurrentMonthRequests() {
  requestsLoading.value = true
  await axiosInstance
    .get(
      `/hr-request/requests/get-user-requests?request_type=${HR_REQUEST_TYPES.DAILY_LEAVE}`,
    )
    .then(({ data }) => {
      requestsLoading.value = false
      currentMonthRequests.value = data.data
    })
    .catch((error) => {
      uiState.hasError = true
      uiState.errorMessage = error.message ?? 'خطا در دریافت درخواست ها'
    })
}

async function fetchUsers() {
  try {
    const loggedInUserId = useCookie('userData').value?.id
    const { data } = await axiosInstance.get(
      '/base/org-chart-node/user-and-child',
      {
        params: { user_id: loggedInUserId },
      },
    )

    users.value = data.data.map(u => ({
      ...u,
      fullName: `${u.first_name} ${u.last_name} - ${u.personnel_code}`,
    }))

    const found = users.value.find(u => u.id === loggedInUserId)
    if (found) {
      selectedUser.value = found
    }
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
async function onUserSelected(user) {
  selectedUser.value = user
}

onMounted(() => {
  getCurrentMonthRequests()
  fetchUsers()
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
  <div class="mb-6 text-center">
    <h2 class="text-h5 font-weight-bold text-primary">
      درخواست مرخصی روزانه
    </h2>
  </div>
  <VRow justify="center" align="center">
    <VCol cols="12" sm="12" md="6" lg="6" xl="6">
      <VCard>
        <div class="d-flex align-center justify-space-between">
          <v-autocomplete
            v-model="selectedUser"
            clearable
            label="جستجوی پرسنل"
            :items="users"
            item-title="fullName"
            return-object
            variant="solo-filled"
            @update:model-value="onUserSelected"
          />
        </div>
      </VCard>
    </VCol>
  </VRow>
  <VRow class="pa-2" dense>
    <VCol cols="12" md="6" class="mx-auto">
      <RemainingLeave :user-id="selectedUser.id" />
      <DailyLeaveRequestForm :user-id="selectedUser.id" :request-type-id="HR_REQUEST_TYPES.DAILY_LEAVE" @created="getCurrentMonthRequests" />
      <RequestsOfMonth />
    </VCol>
  </VRow>
</template>

<style scoped>

</style>
