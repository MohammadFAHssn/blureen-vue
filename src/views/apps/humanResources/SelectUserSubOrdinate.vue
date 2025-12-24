<script setup>
const emit = defineEmits(['select'])
const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isEditRequestDialogVisible: false,
})

const selectedUser = ref(useCookie('userData').value)
const users = ref([])
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
        label="جستجوی پرسنل"
        :items="users"
        item-title="fullName"
        return-object
        variant="solo-filled"
        @update:model-value="onUserSelected"
      />
    </div>
  </VCard>
</template>

<style scoped>

</style>
