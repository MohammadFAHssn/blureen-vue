<script setup>
definePage({
  meta: {
    action: 'use',
    subject: 'app',
  },
})

const GENERAL_CATEGORY = 'سوالات عمومی'

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  hasSuccess: false,
  successMessage: '',
})

const pendingState = reactive({
  fetchQuestions: false,
  evaluate: false,
})

const formState = reactive({
  submitted: false,
})

const questions = ref([])
const answersState = reactive({})

const groupedQuestions = computed(() => {
  const groups = new Map()

  questions.value.forEach((question) => {
    const key = question?.category?.name || GENERAL_CATEGORY
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(question)
  })

  return Array.from(groups.entries()).map(([name, qs]) => ({
    name,
    questions: qs,
  }))
})

const answeredCount = computed(() => {
  return questions.value.reduce((count, question) => {
    return count + (isQuestionAnswered(question) ? 1 : 0)
  }, 0)
})

const completionPercentage = computed(() => {
  if (!questions.value.length)
    return 0

  return Math.round((answeredCount.value / questions.value.length) * 100)
})

const isFormValid = computed(() => {
  if (!questions.value.length)
    return false

  return questions.value.every(question => isQuestionAnswered(question))
})

function initializeAnswers(questionList = []) {
  Object.keys(answersState).forEach((key) => {
    delete answersState[key]
  })

  questionList.forEach((question) => {
    if (question.question_type_id === 3)
      answersState[question.id] = []
    else if (question.question_type_id === 2 || question.question_type_id === 1)
      answersState[question.id] = null
    else
      answersState[question.id] = ''
  })
}

function isQuestionAnswered(question) {
  const answer = answersState[question.id]

  switch (question.question_type_id) {
    case 1:
      return typeof answer === 'number' && answer >= 1 && answer <= 10
    case 2:
      return typeof answer === 'number' && answer > 0
    case 3:
      return Array.isArray(answer) && answer.length > 0
    default:
      return !!answer
  }
}

function showQuestionError(question) {
  return formState.submitted && !isQuestionAnswered(question)
}

function buildAnswersPayload() {
  return questions.value.map((question) => {
    const base = {
      question_id: question.id,
      question_type_id: question.question_type_id,
    }

    const answer = answersState[question.id]

    if (question.question_type_id === 1)
      base.score = answer
    else if (question.question_type_id === 2)
      base.option_id = answer
    else if (question.question_type_id === 3)
      base.option_ids = answer
    else
      base.answer = answer

    return base
  })
}

async function handleSubmit() {
  formState.submitted = true

  if (!isFormValid.value)
    return

  const payload = {
    answers: buildAnswersPayload(),
  }

  const success = await evaluate(payload)

  if (success) {
    uiState.hasSuccess = true
    uiState.successMessage = 'خودارزیابی شما با موفقیت ثبت شد.'
    formState.submitted = false
  }
}

// ----- -----

async function fetchQuestions() {
  pendingState.fetchQuestions = true
  try {
    const { data, error } = await useApi(
      createUrl('/evaluation/evaluation-question/self-evaluation'),
    )

    if (error.value) throw error.value

    const payload = data.value?.data || []
    questions.value = payload
    initializeAnswers(payload)
  }
  catch (e) {
    console.error('Error fetching questions:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت سوالات خودارزیابی'
  }
  finally {
    pendingState.fetchQuestions = false
  }
}

async function evaluate(answers) {
  pendingState.evaluate = true
  let requestFailed = false
  try {
    await $api('/evaluation/self-evaluation/create', {
      method: 'POST',
      body: answers,
      onResponseError({ response }) {
        requestFailed = true
        uiState.hasError = true
        uiState.errorMessage
          = response?._data?.message || 'خطا در ثبت خودارزیابی'
      },
    })

    fetchQuestions()
    return !requestFailed
  }
  catch (err) {
    console.error(err)
    uiState.hasError = true
    uiState.errorMessage = err?.message || 'خطا در ثبت خودارزیابی'
    return false
  }
  finally {
    pendingState.evaluate = false
  }
}

await fetchQuestions()
</script>

<template>
  <VSnackbar
    v-model="uiState.hasError"
    :timeout="2500"
    location="center"
    variant="flat"
    color="error"
  >
    {{ uiState.errorMessage }}
  </VSnackbar>

  <VSnackbar
    v-model="uiState.hasSuccess"
    :timeout="2500"
    location="center"
    variant="flat"
    color="success"
  >
    {{ uiState.successMessage }}
  </VSnackbar>

  <VContainer class="py-6">
    <VRow justify="center">
      <VCol
        cols="12"
        md="11"
        lg="10"
        xl="8"
      >
        <VCard class="elevation-2">
          <VCardTitle class="d-flex align-center justify-space-between flex-wrap gap-4">
            <div>
              <div class="text-h6 font-weight-semibold mb-1">
                فرم خودارزیابی
              </div>
              <div class="text-body-2 text-medium-emphasis text-wrap">
                لطفاً به تمام سوالات زیر با دقت و صداقت پاسخ دهید.
              </div>
            </div>
            <div class="text-center">
              <div class="text-caption text-medium-emphasis mb-1">
                درصد تکمیل
              </div>
              <VProgressCircular
                :size="64"
                :width="6"
                color="primary"
                :model-value="completionPercentage"
              >
                {{ completionPercentage }}%
              </VProgressCircular>
            </div>
          </VCardTitle>

          <VDivider />

          <VCardText>
            <VAlert
              type="info"
              variant="tonal"
              border="start"
              class="mb-6"
            >
              پاسخ‌های شما فقط برای بهبود شرایط کاری و شناخت بهتر نیازهای کارکنان شرکت استفاده می‌شود.
              نمره کامل این بخش با تکمیل کامل فرم برای شما ثبت خواهد شد.
              تمامی نظرات شما محرمانه هستند و در اختیار سرشیفت، سرپرست یا مدیر قرار نخواهند گرفت.
            </VAlert>

            <div
              v-if="pendingState.fetchQuestions"
              class="d-flex justify-center py-10"
            >
              <VProgressCircular
                color="primary"
                indeterminate
                size="56"
              />
            </div>

            <div
              v-else-if="!questions.length"
              class="text-center py-10 text-medium-emphasis"
            >
              در حال حاضر سوالی برای پاسخگویی وجود ندارد.
            </div>

            <div v-else>
              <div
                v-for="group in groupedQuestions"
                :key="group.name"
                class="mb-8"
              >
                <div class="d-flex align-center mb-4 flex-wrap gap-3">
                  <vCard class="text-subtitle-1 font-weight-bold pa-2" color="primary" variant="tonal">
                    {{ group.name }}
                  </vCard>
                  <VDivider class="flex-grow-1" />
                </div>

                <VRow>
                  <VCol
                    v-for="question in group.questions"
                    :key="question.id"
                    cols="12"
                  >
                    <VCard
                      class="mb-4 pa-4 question-card"
                      variant="outlined"
                      :class="{ 'border-success': isQuestionAnswered(question) }"
                    >
                      <div class="d-flex align-center justify-space-between flex-wrap gap-3 mb-3">
                        <div class="text-body-1 font-weight-medium">
                          {{ question.question_text }}
                        </div>
                      </div>

                      <div v-if="question.question_type_id === 1" class="question-input d-flex align-center flex-wrap gap-4">
                        <VRating
                          v-model="answersState[question.id]"
                          :length="10"
                          color="amber"
                          active-color="amber"
                          :size="21"
                          density="comfortable"
                          hover
                        />
                        <VChip
                          v-if="answersState[question.id]"
                          variant="flat"
                          color="warning"
                          size="small"
                        >
                          {{ answersState[question.id] }}/10
                        </VChip>
                      </div>

                      <div v-else-if="question.question_type_id === 2" class="question-input">
                        <VRadioGroup
                          v-model="answersState[question.id]"
                          hide-details
                        >
                          <VRadio
                            v-for="option in question.options"
                            :key="option.id"
                            :label="option.option_title"
                            :value="option.id"
                          />
                        </VRadioGroup>
                      </div>

                      <div v-else-if="question.question_type_id === 3" class="question-input">
                        <div class="d-flex flex-column gap-2">
                          <VCheckbox
                            v-for="option in question.options"
                            :key="option.id"
                            v-model="answersState[question.id]"
                            :label="option.option_title"
                            :value="option.id"
                            hide-details
                          />
                        </div>
                      </div>

                      <div v-else class="question-input">
                        <VTextarea
                          v-model="answersState[question.id]"
                          rows="3"
                          auto-grow
                          hide-details
                        />
                      </div>

                      <p
                        v-if="showQuestionError(question)"
                        class="text-error text-caption mt-3 mb-0"
                      >
                        لطفاً به این سوال پاسخ دهید.
                      </p>
                    </VCard>
                  </VCol>
                </VRow>
              </div>

              <VAlert
                v-if="formState.submitted && !isFormValid"
                type="error"
                variant="tonal"
                border="start"
                class="mb-4"
              >
                لطفاً قبل از ثبت، به تمام سوالات پاسخ دهید.
              </VAlert>

              <div class="d-flex flex-wrap gap-4 align-center justify-space-between">
                <div class="text-body-2 text-medium-emphasis">
                  {{ answeredCount }} از {{ questions.length }} سوال پاسخ داده شده است.
                </div>
                <VBtn
                  color="primary"
                  size="large"
                  :loading="pendingState.evaluate"
                  :disabled="pendingState.evaluate"
                  @click="handleSubmit"
                >
                  ثبت خودارزیابی
                </VBtn>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<style scoped>
.question-card.border-success {
  border-width: 2px;
  border-color: rgb(var(--v-theme-success)) !important;
}

.question-input {
  min-block-size: 48px;
}
</style>
