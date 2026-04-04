<script setup>
import SelectUserSubOrdinate from '@/views/apps/humanResources/Components/SelectUserSubOrdinate.vue'
import Form from '@/views/apps/humanResources/LeaveRequest/BereavementLeave/Form.vue'
import UserRequestsList from '@/views/apps/humanResources/UserRequestsList.vue'

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isEditRequestDialogVisible: false,
  requestsKey: 0,
})
const selectedUser = ref(useCookie('userData').value)
// TODO:change select user
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
      درخواست مرخصی فوت بستگان
    </h2>
  </div>
  <VRow justify="center" align="center">
    <VCol cols="12" sm="12" md="12" lg="10" xl="10">
      <VCard>
        <SelectUserSubOrdinate
          :request-type="REQUEST_TYPES.BEREAVEMENT_LEAVE"
          @select="onUserSelected"
        />
      </VCard>
    </VCol>
  </VRow>
  <VRow class="pa-2" dense>
    <VCol cols="12" md="12" class="mx-auto">
      <Form :user-id="selectedUser.id" @created="uiState.requestsKey++" />
      <UserRequestsList :key="uiState.requestsKey" :user-id="selectedUser.id" />
    </VCol>
  </VRow>
</template>

<style scoped></style>
