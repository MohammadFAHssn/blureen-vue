<script setup>
definePage({
  meta: {
    action: 'use',
    subject: 'app',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
})

const pendingState = reactive({
  fetchEvaluatees: false,
})

const evaluatees = ref([])

// ----- -----

async function fetchEvaluatees() {
  pendingState.fetchEvaluatees = true
  try {
    const { data, error } = await useApi(
      createUrl('/evaluation/evaluatee/by-evaluator'),
    )

    pendingState.fetchEvaluatees = false

    if (error.value) throw error.value

    evaluatees.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching evaluatees:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت ارزیابی‌شونده‌ها'
  }
}

fetchEvaluatees()
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

  <VRow>
    <VCol v-if="evaluatees.length === 0">
      <VCard variant="text">
        ارزیابی فعالی وجود ندارد.
      </VCard>
    </VCol>

    <VCol
      v-for="evaluatee in evaluatees"
      v-else
      :key="evaluatee.id"
      cols="12"
      sm="12"
      md="6"
      lg="4"
      xl="3"
      xxl="3"
    >
      <VCard>
        <VCardTitle class="text-center mb-5 text-wrap">
          {{ evaluatee.user.personnel_code }} -
          {{ evaluatee.user.first_name }} {{ evaluatee.user.last_name }}
        </VCardTitle>

        <VCardActions class="justify-center">
          <VBtn
            variant="elevated"
            color="success"
          >
            شروع ارزیابی
          </VBtn>
        </VCardActions>
      </VCard>
    </VCol>
  </VRow>
</template>
