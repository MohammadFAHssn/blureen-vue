<script setup>
const props = defineProps({
  userId: {
    required: true,
  },
  date: {
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
const attendanceLogs = ref([])

async function getCurrentMonthAttendances() {
  Loading.value = true
  try {
    const { data } = await axiosInstance.get(
      '/kasra/reports/get-attendance-report',
      {
        params: {
          user_id: props.userId,
          start_date: props.date,
          end_date: props.date,
        },
      },
    )
    attendanceLogs.value = data.data.attendances
  }
  catch (error) {
    uiState.hasError = true
    uiState.errorMessage = error.response.data.message ?? 'خطا در دریافت ترددها'
  }
  finally {
    Loading.value = false
  }
}
onMounted(() => {
  getCurrentMonthAttendances()
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

  <VCard class="mb-4">
    <label class="font-weight-medium mb-4 mt-2 d-block text-center">
      ترددهای
      {{ props.date }}
    </label>
    <VSkeletonLoader v-if="Loading" type="card" />
    <VRow v-else justify="center" dense>
      <template v-for="(log, i) in attendanceLogs" :key="`pair-${i}`">
        <VCol cols="3" sm="3" md="2" class="d-flex flex-column align-center">
          <div class="mb-1 font-weight-medium">
            ورود {{ i + 1 }}
          </div>
          <div class="text-error">
            {{ log.in || '-' }}
          </div>
        </VCol>
        <VCol cols="3" sm="3" md="2" class="d-flex flex-column align-center">
          <div class="mb-1 font-weight-medium">
            خروج {{ i + 1 }}
          </div>
          <div class="text-error">
            {{ log.out || '-' }}
          </div>
        </VCol>
      </template>
      <h6
        v-if="attendanceLogs.length === 0"
        class="mb-2 font-weight-medium text-error"
      >
        ترددی یافت نشد
      </h6>
    </VRow>
  </VCard>
</template>

<style scoped></style>
