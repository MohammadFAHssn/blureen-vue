<script setup>
import AttendanceLog from '@/views/apps/humanResources/AttendanceLog.vue'
import Form from '@/views/apps/humanResources/LeaveRequest/HourlyLeave/Form.vue'
import List from '@/views/apps/humanResources/LeaveRequest/HourlyLeave/List.vue'
import RemainingLeave from '@/views/apps/humanResources/LeaveRequest/RemainingLeave.vue'
import SelectUserSubOrdinate from '@/views/apps/humanResources/SelectUserSubOrdinate.vue'

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  requestsKey: 0,
})

const selectedUser = ref(useCookie('userData').value)
const leaveDate = ref(moment().locale('fa').format('jYYYY/jMM/jDD'))

async function onUserSelected(selected) {
  selectedUser.value = selected
  uiState.requestsKey++
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

  <div class="mb-6 text-center">
    <h2 class="text-h5 font-weight-bold text-primary">
      درخواست مرخصی ساعتی
    </h2>
  </div>

  <VRow dense>
    <VCol cols="12" md="12" sm="12">
      <SelectUserSubOrdinate @select="onUserSelected" />
    </VCol>
  </VRow>
  <VRow dense>
    <VCol cols="12" md="12" sm="12">
      <RemainingLeave :user-id="selectedUser.id" />
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
      />
    </VCol>

    <VCol cols="12" md="8">
      <AttendanceLog :key="leaveDate" :date="leaveDate" :user-id="selectedUser.id" />
      <Form :date="leaveDate" :user-id="selectedUser.id" />
      <List :key="uiState.requestsKey" :user-id="selectedUser.id" />
    </VCol>
  </VRow>
</template>

<style scoped>

</style>
