<script setup>
import CreateDailyRequest from '@/views/apps/humanResources/CreateDailyRequest.vue'
import EditDailyLeaveRequestDialog from '@/views/apps/humanResources/EditDailyLeaveRequestDialog.vue'
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
const selectedRequest = ref(null)
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

async function updateRequest(item) {
  uiState.isEditRequestDialogVisible = false
  await axiosInstance
    .patch('/hr-request/requests/update', {
      request: item,
    })
    .then(({ data }) => {
      console.log(data.data)
    })
    .catch((error) => {
      uiState.hasError = true
      uiState.errorMessage = error.message || 'خطا در بروزرسانی درخواست'
    })
}
async function onUserSelected(user) {
  selectedUser.value = user
}

async function onEditClick(request) {
  selectedRequest.value = request
  uiState.isEditRequestDialogVisible = true
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

  <EditDailyLeaveRequestDialog
    v-if="uiState.isEditRequestDialogVisible"
    v-model:is-dialog-visible="uiState.isEditRequestDialogVisible"
    :request="selectedRequest"
    @submit="updateRequest"
  />
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
      <CreateDailyRequest :user-id="selectedUser.id" :request-type-id="HR_REQUEST_TYPES.DAILY_LEAVE" @created="getCurrentMonthRequests" />

      <div class="ma-3 overflow-auto d-none d-md-block">
        <VCard class="pa-4">
          <label class="font-weight-medium mb-4 d-block text-center">
            مرخصی‌های روزانه ماه جاری
          </label>
          <VSkeletonLoader v-if="requestsLoading" type="card" />
          <table v-else class="requests-table w-100">
            <thead>
              <tr>
                <th>تاریخ شروع</th>
                <th>تاریخ پایان</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in currentMonthRequests" :key="index">
                <td>{{ item.start_date }}</td>
                <td>{{ item.end_date }}</td>
                <td>
                  <VChip
                    :color="item.status.color"
                    size="small"
                    label
                    variant="tonal"
                  >
                    {{ item.status.title }}
                  </VChip>
                </td>
                <td>
                  <VBtn
                    color="orange"
                    variant="text"
                    size="small"
                    @click="onEditClick(item)"
                  >
                    <VIcon icon="tabler-edit" size="20" />
                  </VBtn>
                  <VBtn color="red" variant="text" size="small">
                    <VIcon icon="tabler-trash" size="20" />
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </table>
        </VCard>
      </div>

      <div class="d-md-none pa-3">
        <VExpansionPanels variant="accordion">
          <VExpansionPanel>
            <VExpansionPanelTitle>
              <span class="font-weight-medium">
                مرخصی‌های روزانه ماه جاری
              </span>
            </VExpansionPanelTitle>

            <VExpansionPanelText>
              <VRow dense>
                <VCol
                  v-for="(item, index) in currentMonthRequests"
                  :key="index"
                  cols="12"
                >
                  <VCard outlined class="pa-3 mb-3">
                    <div>
                      <strong>تاریخ شروع:</strong> {{ item.start_date }}
                    </div>
                    <div><strong>تاریخ پایان:</strong> {{ item.end_date }}</div>

                    <div class="d-flex align-center mt-1">
                      <strong class="mr-1">وضعیت:</strong>
                      <VChip
                        :color="item.status.color"
                        size="small"
                        label
                        variant="tonal"
                      >
                        {{ item.status.title }}
                      </VChip>
                    </div>

                    <div class="mt-3 text-center">
                      <VBtn
                        color="orange"
                        variant="text"
                        size="small"
                        @click="onEditClick(item)"
                      >
                        <VIcon icon="tabler-edit" size="20" />
                      </VBtn>
                      <VBtn color="red" variant="text" size="small">
                        <VIcon icon="tabler-trash" size="20" />
                      </VBtn>
                    </div>
                  </VCard>
                </VCol>
              </VRow>

              <div
                v-if="!currentMonthRequests.length"
                class="text-center text-medium-emphasis mt-2"
              >
                موردی یافت نشد!
              </div>
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </div>
    </VCol>
  </VRow>
</template>

<style scoped>
.requests-table {
  width: 100%;
  border-collapse: collapse;
}
.requests-table th,
.requests-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.requests-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}
</style>
