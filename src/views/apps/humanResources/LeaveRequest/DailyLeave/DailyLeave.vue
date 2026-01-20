<script setup>
import Form from '@/views/apps/humanResources/LeaveRequest/DailyLeave/Form.vue'
import List from '@/views/apps/humanResources/LeaveRequest/DailyLeave/List.vue'
import RemainingLeave from '@/views/apps/humanResources/LeaveRequest/RemainingLeave.vue'
import SelectUserSubOrdinate from '@/views/apps/humanResources/SelectUserSubOrdinate.vue'

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isEditRequestDialogVisible: false,
  requestsKey: 0,
})
const selectedUser = ref(useCookie('userData').value)
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
      درخواست مرخصی روزانه
    </h2>
  </div>
  <VRow justify="center" align="center">
    <VCol cols="12" sm="12" md="8" lg="8" xl="8">
      <VCard>
        <SelectUserSubOrdinate @select="onUserSelected" />
      </VCard>
    </VCol>
  </VRow>
  <VRow class="pa-2" dense>
    <VCol cols="12" md="8" class="mx-auto">
      <RemainingLeave :key="selectedUser.id" :user-id="selectedUser.id" />
      <Form :user-id="selectedUser.id" @created="uiState.requestsKey++" />
      <List :key="uiState.requestsKey" :user-id="selectedUser.id" />
    </VCol>
  </VRow>
</template>

<style scoped>

</style>
