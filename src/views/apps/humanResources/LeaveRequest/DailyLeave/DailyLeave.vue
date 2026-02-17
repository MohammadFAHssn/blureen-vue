<script setup>
import SelectUserSubOrdinate from '@/views/apps/humanResources/Components/SelectUserSubOrdinate.vue'
import Form from '@/views/apps/humanResources/LeaveRequest/DailyLeave/Form.vue'
import List from '@/views/apps/humanResources/LeaveRequest/DailyLeave/List.vue'
import RemainingLeave from '@/views/apps/humanResources/LeaveRequest/RemainingLeave.vue'

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isEditRequestDialogVisible: false,
  requestsKey: 0,
  disableSubmit: true,
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
    <VCol cols="12" sm="12" md="12" lg="10" xl="10">
      <VCard>
        <SelectUserSubOrdinate @select="onUserSelected" />
      </VCard>
    </VCol>
  </VRow>
  <VRow class="pa-2" dense>
    <VCol cols="12" md="12" class="mx-auto">
      <RemainingLeave :key="selectedUser.id" :user-id="selectedUser.id" />
      <Form :user-id="selectedUser.id" @created="uiState.requestsKey++" />
      <List :key="uiState.requestsKey" :user-id="selectedUser.id" />
    </VCol>
  </VRow>

  <v-dialog v-if="uiState.disableSubmit" v-model="uiState.disableSubmit" max-width="400" persistent>
    <v-card
      prepend-icon="mdi-map-marker"
      text="امکان ثبت مرخصی موقتاً در دسترس نمیباشد."
      title="توجه"
    >
      <template #actions>
        <v-spacer />
        <v-btn @click="uiState.disableSubmit = false">
          باشه
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
