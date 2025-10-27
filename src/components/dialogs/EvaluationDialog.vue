<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  evaluatee: {
    type: Object,
    required: true,
  },
  questions: {
    type: Array,
    required: true,
  },
  // Loading state for save action, controlled by parent
  loading: {
    type: Boolean,
    default: false,
  },
  // Optional initial ratings to prefill when editing: { [questionId]: score }
  initialRatings: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const isDialogVisible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

// State for user ratings
const ratings = ref({})

// Initialize ratings object, prefilling from initialRatings if provided
function buildRatingsFromProps() {
  const newRatings = {}
  if (props.questions && props.questions.length > 0) {
    props.questions.forEach((category) => {
      category.questions.forEach((question) => {
        const qid = question.id
        const initial = props.initialRatings?.[qid] ?? 0
        newRatings[qid] = initial
      })
    })
  }
  ratings.value = newRatings
}

watch([() => props.questions, () => props.initialRatings], () => {
  buildRatingsFromProps()
}, { immediate: true })

// Check if all questions are answered
const allQuestionsAnswered = computed(() => {
  return Object.values(ratings.value).every(rating => rating > 0)
})

// Handle save
function handleSave() {
  const results = []

  Object.entries(ratings.value).forEach(([questionId, score]) => {
    results.push({
      evaluatee_id: props.evaluatee.id,
      question_id: Number(questionId),
      score,
    })
  })

  emit('save', results)
  // Do not close here; parent closes on successful save
}

// Handle cancel
function handleCancel() {
  // Restore to initial ratings (or 0 if none)
  buildRatingsFromProps()
  isDialogVisible.value = false
}
</script>

<template>
  <VDialog
    v-model="isDialogVisible"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <VCard>
      <!-- Dialog Header -->
      <VToolbar
        color="primary"
        dark
      >
        <VBtn
          icon
          dark
          @click="handleCancel"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
        <VToolbarTitle>
          {{ evaluatee.user.personnel_code }} - {{ evaluatee.user.first_name }} {{ evaluatee.user.last_name }} ({{ evaluatee.user.profile.cost_center.name }})
        </VToolbarTitle>
      </VToolbar>

      <!-- Dialog Content -->
      <VCardText class="pa-6">
        <VContainer>
          <VRow>
            <VCol cols="12">
              <div
                v-for="category in questions"
                :key="category.id"
                class="mb-8"
              >
                <!-- Category Header -->
                <div class="text-h6 font-weight-bold mb-4 text-primary">
                  {{ category.name }}
                </div>

                <!-- Questions in this category -->
                <VRow>
                  <VCol
                    v-for="question in category.questions"
                    :key="question.id"
                    cols="12"
                    md="6"
                  >
                    <VCard
                      variant="outlined"
                      class="pa-4"
                      :class="{ 'border-success': ratings[question.id] > 0 }"
                    >
                      <!-- Question Text -->
                      <div class="text-body-1 mb-3">
                        {{ question.question_text }}
                      </div>

                      <!-- Rating Stars -->
                      <div class="d-flex align-center justify-start">
                        <VRating
                          v-model="ratings[question.id]"
                          :length="10"
                          color="amber"
                          active-color="amber"
                          :size="23"
                          hover
                        />
                        <span
                          v-if="ratings[question.id] > 0"
                          class="mr-3 text-body-2 font-weight-medium"
                        >
                          {{ ratings[question.id] }}/10
                        </span>
                      </div>
                    </VCard>
                  </VCol>
                </VRow>
              </div>
            </VCol>
          </VRow>
        </VContainer>
      </VCardText>

      <!-- Dialog Actions -->
      <VDivider />
      <VCardActions class="pa-4 justify-end">
        <VBtn
          variant="outlined"
          color="error"
          :disabled="loading"
          @click="handleCancel"
        >
          انصراف
        </VBtn>
        <VBtn
          variant="elevated"
          color="success"
          :loading="loading"
          :disabled="!allQuestionsAnswered || loading"
          @click="handleSave"
        >
          ذخیره
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.border-success {
  border-width: 2px;
  border-color: rgb(var(--v-theme-success)) !important;
}
</style>
