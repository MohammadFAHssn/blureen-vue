<script setup>
import EvaluationDialog from '@/components/dialogs/EvaluationDialog.vue'

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
  dialog: false,
})

const pendingState = reactive({
  fetchEvaluatees: false,
  fetchQuestions: false,
  evaluate: false,
})

const evaluatees = ref([])
const questions = ref([])

// Track evaluated evaluatees by ID
const evaluatedMap = reactive({})

// Store submitted evaluations: { [evaluateeId]: { [questionId]: score } }
const evaluationsByEvaluatee = reactive({})

// Dialog state
const evaluationDialog = reactive({
  isOpen: false,
  selectedEvaluatee: null,
})

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
    // Optional: initialize evaluated flags if backend provides any indicator
    // Fallback to preserving previously evaluated ones in evaluatedMap
    evaluatees.value.forEach((ev) => {
      if (ev && typeof ev.id !== 'undefined') {
        // If server provided a flag like ev.is_evaluated, sync it; otherwise keep existing value
        if (Object.prototype.hasOwnProperty.call(ev, 'is_evaluated'))
          evaluatedMap[ev.id] = !!ev.is_evaluated
        else if (evaluatedMap[ev.id] === undefined)
          evaluatedMap[ev.id] = false
      }
    })
  }
  catch (e) {
    console.error('Error fetching evaluatees:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت ارزیابی‌شونده‌ها'
  }
}

async function fetchQuestions() {
  pendingState.fetchQuestions = true
  try {
    const { data, error } = await useApi(
      createUrl('/evaluation/evaluation-question/actives'),
    )

    pendingState.fetchQuestions = false

    if (error.value) throw error.value

    questions.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching questions:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت سوالات ارزیابی'
  }
}

async function evaluate(results) {
  pendingState.evaluate = true
  try {
    let hadError = false
    await $api('/evaluation/evaluation-score/create', {
      method: 'POST',
      body: {
        results,
      },
      onResponseError({ response }) {
        uiState.hasError = true
        uiState.errorMessage = response._data.message || 'خطا در ارزیابی'
        hadError = true
      },
    })

    // Close dialog and refresh evaluatees only on success
    if (!hadError) {
      // Mark this evaluatee as evaluated in UI
      if (evaluationDialog.selectedEvaluatee?.id !== undefined)
        evaluatedMap[evaluationDialog.selectedEvaluatee.id] = true

      // Persist the submitted results locally for editing later
      if (evaluationDialog.selectedEvaluatee?.id !== undefined) {
        const evalId = evaluationDialog.selectedEvaluatee.id
        const map = {}
        results.forEach((r) => {
          map[r.question_id] = r.score
        })
        evaluationsByEvaluatee[evalId] = map
      }

      evaluationDialog.isOpen = false
      evaluationDialog.selectedEvaluatee = null

      // await fetchEvaluatees()
    }
  }
  catch (err) {
    console.error(err)
    uiState.hasError = true
    uiState.errorMessage = err?.message || 'خطا در ارزیابی'
  }
  finally {
    pendingState.evaluate = false
  }
}

function openEvaluationDialog(evaluatee) {
  evaluationDialog.selectedEvaluatee = evaluatee
  evaluationDialog.isOpen = true
}

await fetchEvaluatees()
fetchQuestions()

// ----- -----
onMounted(() => {
  uiState.dialog = true
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

  <v-dialog
    v-if="evaluatees.length !== 0"
    v-model="uiState.dialog"
    max-width="400"
    persistent
  >
    <v-card
      prepend-icon="mdi-map-marker"
      text="در صورت خروج از صفحه، موارد ارزیابی‌شده ثبت نهایی شده و از لیست حذف می‌شوند!"
      title="توجه"
    >
      <template #actions>
        <v-spacer />
        <v-btn @click="uiState.dialog = false">
          باشه
        </v-btn>
      </template>
    </v-card>
  </v-dialog>

  <!-- Evaluation Dialog -->
  <EvaluationDialog
    v-if="evaluationDialog.selectedEvaluatee"
    v-model="evaluationDialog.isOpen"
    :evaluatee="evaluationDialog.selectedEvaluatee"
    :questions="questions"
    :initial-ratings="evaluationsByEvaluatee[evaluationDialog.selectedEvaluatee?.id] || null"
    :loading="pendingState.evaluate"
    @save="evaluate"
  />

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
      <VCard :class="{ 'border-success': !!evaluationsByEvaluatee[evaluatee.id] }">
        <VCardTitle class="text-center mb-5 text-wrap">
          {{ evaluatee.user.personnel_code }} -
          {{ evaluatee.user.first_name }} {{ evaluatee.user.last_name }} ({{ evaluatee.user.profile.cost_center.name }})
        </VCardTitle>

        <VCardActions class="justify-center">
          <VBtn
            variant="elevated"
            :color="evaluationsByEvaluatee[evaluatee.id] ? 'warning' : 'success'"
            @click="openEvaluationDialog(evaluatee)"
          >
            {{ evaluationsByEvaluatee[evaluatee.id] ? 'ویرایش ارزیابی' : 'شروع ارزیابی' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VCol>
  </VRow>
</template>
