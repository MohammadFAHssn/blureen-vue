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
  fetchSurveys: false,
  participateInSurvey: [],
})

const surveys = ref([])

const url = ref([])

// ----- -----

async function fetchSurveys() {
  pendingState.fetchSurveys = true
  try {
    const { data, error } = await useApi(
      createUrl('/survey/survey?filter[active]=1'),
    )

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

async function generateSurveyLink(porslineId) {
  pendingState.participateInSurvey[porslineId] = true
  try {
    const res = await $api('/survey/survey/participate', {
      method: 'POST',
      body: {
        porslineId,
      },
      onResponseError({ response }) {
        pendingState.participateInSurvey[porslineId] = false
        uiState.hasError = true
        uiState.errorMessage
          = response._data.message || 'خطا در شرکت در نظرسنجی'
      },
    })

    pendingState.participateInSurvey[porslineId] = false

    url.value[porslineId] = res.data
  }
  catch (err) {
    console.error(err)
  }
}

function participateInSurvey(porslineId) {
  window.open(url.value[porslineId], '_blank', 'noopener,noreferrer')
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

  <VRow>
    <VCol v-if="surveys.length === 0">
      <VCard variant="text">
        نظرسنجی فعالی وجود ندارد.
      </VCard>
    </VCol>

    <VCol
      v-for="survey in surveys"
      v-else
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
          <VBtn
            v-if="url[survey.porsline_id]"
            variant="elevated"
            color="success"
            @click="participateInSurvey(survey.porsline_id)"
          >
            شروع
          </VBtn>
          <VBtn
            v-else-if="!url[survey.porsline_id]"
            variant="elevated"
            :disabled="pendingState.participateInSurvey[survey.porsline_id]"
            @click="generateSurveyLink(survey.porsline_id)"
          >
            <span v-if="pendingState.participateInSurvey[survey.porsline_id]">در حال ساخت لینک</span>
            <span v-else-if="!pendingState.participateInSurvey[survey.porsline_id]">دریافت لینک نظرسنجی</span>
          </VBtn>
        </VCardActions>
      </VCard>
    </VCol>
  </VRow>
</template>
