<script setup>
definePage({
  meta: {
    // TODO: add permission
    // action: 'read',
    // subject: 'Surveys',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
})

const pendingState = reactive({
  fetchSurveys: false,
})

const surveys = ref([])

// ----- -----

async function fetchSurveys() {
  pendingState.fetchSurveys = true
  try {
    const { data, error } = await useApi(createUrl('/survey/survey'))

    pendingState.fetchSurveys = false

    if (error.value) throw error.value

    surveys.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching surveys:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت نظرسنجی‌ها'
  }
}

fetchSurveys()
</script>

<template>
  <VSnackbar
    v-model="uiState.hasError"
    :timeout="2000"
    location="center"
    variant="outlined"
    color="error"
  >
    {{ uiState.errorMessage }}
  </VSnackbar>

  <VRow>
    <VCol
      v-for="survey in surveys"
      :key="survey.id"
      cols="12"
      sm="12"
      md="6"
      lg="4"
      xl="3"
      xxl="3"
    >
      <VCard>
        <VCardTitle class="text-center mb-5 text-wrap">
          {{ survey.title }}
        </VCardTitle>

        <VCardActions class="justify-center">
          <VBtn variant="elevated">
            شرکت در نظرسنجی
          </VBtn>
        </VCardActions>
      </VCard>
    </VCol>
  </VRow>
</template>
