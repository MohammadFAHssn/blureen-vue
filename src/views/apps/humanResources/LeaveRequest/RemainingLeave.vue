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

const leaveClass = computed(() =>
  String(remainingLeave.value ?? '').includes('-')
    ? 'text-error'
    : 'text-success',
)

async function getRemainingLeave() {
  Loading.value = true
  try {
    const { data } = await axiosInstance.get(
      '/kasra/reports/get-remaining-leave',
      {
        params: {
          user_id: props.userId,
        },
      },
    )
    remainingLeave.value = data.data.remaining_leave
  } catch (error) {
    uiState.hasError = true
    uiState.errorMessage =
      error?.response?.data?.message ?? error.message ?? 'خطای ناشناخته'
  } finally {
    Loading.value = false
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

  <VCard color="primary" variant="tonal" class="mb-4 pa-4 text-center">
    <VRow align="center" justify="center">
      <VCol cols="auto">
        <VAvatar color="primary" size="56" variant="flat">
          <VIcon icon="tabler-calendar-stats" size="32" />
        </VAvatar>
      </VCol>

      <VCol cols="auto">
        <div class="text-h6 font-weight-bold text-primary-darken-3">
          مانده مرخصی تقریبی
        </div>

        <VSkeletonLoader v-if="Loading" type="list-item" />

        <div
          v-else
          class="text-h5 font-weight-bold"
          :class="leaveClass"
          dir="ltr"
        >
          {{ remainingLeave ?? '-' }}
        </div>
      </VCol>
    </VRow>
  </VCard>
</template>
