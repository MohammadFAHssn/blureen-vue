<script setup>
import AttendanceLog from '@/views/apps/humanResources/Components/AttendanceLog.vue'
import Form from '@/views/apps/humanResources/OvertimeRequest/Form.vue'
import List from '@/views/apps/humanResources/OvertimeRequest/List.vue'
import SelectUserSubOrdinate from '@/views/apps/humanResources/Components/SelectUserSubOrdinate.vue'

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  requestsKey: 0,
  dateKey: 0,
})
const selectedUser = ref(useCookie('userData').value)
async function onUserSelected(selected) {
  selectedUser.value = selected
  uiState.requestsKey++
}

const overtimeDate = ref(moment().locale('fa').format('jYYYY/jMM/jDD'))
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
  <VBtn variant="text" prepend-icon="tabler-arrow-right" class="mb-4" @click="$emit('back')">
    صفحه اصلی
  </VBtn>
  <div class="mb-6 text-center">
    <h2 class="text-h5 font-weight-bold text-primary">
      درخواست ثبت اضافه کار
    </h2>
  </div>

  <VRow dense>
    <VCol md="4" />
    <VCol cols="12" md="8" sm="12">
      <SelectUserSubOrdinate @select="onUserSelected" />
    </VCol>
  </VRow>
  <VRow dense>
    <VCol cols="12" md="4" class="d-flex justify-center mb-4 mb-md-0">
      <input id="custom-input" style="display: none" />
      <PersianDatetimePicker
        v-model="overtimeDate"
        format="jYYYY/jMM/jDD"
        inline
        custom-input="#custom-input"
        @change="uiState.dateKey++"
      />
    </VCol>
    <VCol cols="12" md="8">
      <AttendanceLog :key="overtimeDate" :date="overtimeDate" :user-id="selectedUser.id" />
      <Form :key="uiState.dateKey" :date="overtimeDate" :user-id="selectedUser.id" @created="uiState.requestsKey++" />
      <List :key="uiState.requestsKey" :user-id="selectedUser.id" />
    </VCol>
  </VRow>
</template>

<style scoped>

</style>
