<script setup>
import AttendanceLog from '@/views/apps/humanResources/Components/AttendanceLog.vue'
import SelectUserSubOrdinate from '@/views/apps/humanResources/Components/SelectUserSubOrdinate.vue'
import Form from '@/views/apps/humanResources/LeaveRequest/HourlyLeave/Form.vue'
import RemainingLeave from '@/views/apps/humanResources/LeaveRequest/RemainingLeave.vue'
import UserRequestsList from '@/views/apps/humanResources/UserRequestsList.vue'

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  remainingLeaveKey: 0,
  attendanceKey: 0,
  requestsKey: 0,
  dateKey: 0,
})

const selectedUser = ref(useCookie('userData').value)
async function onUserSelected(selected) {
  selectedUser.value = selected
  uiState.requestsKey++
  uiState.attendanceKey++
  uiState.remainingLeaveKey++
  uiState.requestsKey++
}

const leaveDate = ref(moment().locale('fa').format('jYYYY/jMM/jDD'))
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
      درخواست مرخصی ساعتی
    </h2>
  </div>

  <VRow dense>
    <VCol cols="12" md="12" sm="12">
      <SelectUserSubOrdinate :request-type="REQUEST_TYPES.HOURLY_LEAVE" @select="onUserSelected" />
    </VCol>
  </VRow>
  <VRow dense>
    <VCol cols="12" md="12" sm="12">
      <RemainingLeave :key="selectedUser.id" :user-id="selectedUser.id" />
    </VCol>
  </VRow>
  <VRow dense>
    <VCol cols="12" md="4" class="d-flex justify-center mb-4 mb-md-0">
      <input id="custom-input" style="display: none" />
      <PersianDatetimePicker
        v-model="leaveDate"
        format="jYYYY/jMM/jDD"
        inline
        custom-input="#custom-input"
        @click="
          () => {
            uiState.dateKey++
            uiState.attendanceKey++
          }
        "
      />
    </VCol>

    <VCol cols="12" md="8">
      <AttendanceLog
        :key="uiState.attendanceKey"
        :date="leaveDate"
        :user-id="selectedUser.id"
      />
      <Form
        :key="uiState.dateKey"
        :date="leaveDate"
        :user-id="selectedUser.id"
        @created="uiState.requestsKey++"
      />
    </VCol>
  </VRow>
  <VRow>
    <VCol cols="12">
      <UserRequestsList :key="uiState.requestsKey" :user-id="selectedUser.id" />
    </VCol>
  </VRow>
</template>

<style scoped></style>
