<script setup>
const emit = defineEmits(['select'])
const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
})

const selectedUser = ref(useCookie('userData').value)
const users = ref([])
async function fetchUsers() {
  try {
    const loggedInUserId = useCookie('userData').value?.id
    const { data } = await axiosInstance.get('/base/user/subordinates', {
      params: { user_id: loggedInUserId, deputy_type: REQUEST_TYPES.DAILY_LEAVE },
    })

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
    uiState.hasError = true
    uiState.errorMessage = error.response.data.message ?? 'خطا در دریافت کاربران'
  }
}
async function onUserSelected(selected) {
  emit('select', selected)
}

onMounted(() => {
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
  <VCard>
    <div class="d-flex align-center justify-space-between">
      <v-autocomplete
        v-model="selectedUser"
        clearable
        label="انتخاب پرسنل"
        :items="users"
        item-title="fullName"
        return-object
        variant="solo-filled"
        @update:model-value="onUserSelected"
      />
    </div>
  </VCard>
</template>

<style scoped></style>
