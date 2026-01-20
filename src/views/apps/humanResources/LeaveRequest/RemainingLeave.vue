<script setup>
const props = defineProps({
  userId: {
    required: true,
  },
})

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
})
const Loading = ref(false)
const remainingLeave = ref(null)

async function getRemainingLeave() {
  Loading.value = true
  try {
    const { data } = await axiosInstance.get('/kasra/reports/get-remaining-leave', {
      params: {
        user_id: props.userId,
      },
    })
    Loading.value = false
    remainingLeave.value = data.data.remaining_leave
  }
  catch (error) {
    Loading.value = false

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

onMounted(() => {
  getRemainingLeave()
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

  <VCard color="primary" variant="tonal" class="mb-4 pa-4 text-center">
    <VRow align="center" justify="center">
      <VCol cols="auto">
        <VAvatar color="primary" size="56" variant="flat">
          <VIcon icon="tabler-calendar-stats" size="32" />
        </VAvatar>
      </VCol>
      <VCol cols="auto">
        <div class="text-h6 font-weight-bold text-primary-darken-3">
          مانده مرخصی
        </div>
        <VSkeletonLoader v-if="Loading" type="list-item" />
        <div v-else class="text-h5 font-weight-bold text-success">
          {{ remainingLeave }}
        </div>
      </VCol>
    </VRow>
  </VCard>
</template>

<style scoped>
</style>
