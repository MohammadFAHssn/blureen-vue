<script setup>
import { getJalaliMonthNameByIndex } from '@core/utils/helpers'
import EvaluationFieldTab from '@/views/apps/evaluation/components/EvaluationFieldTab.vue'
import EvaluationFinalScoreCard from '@/views/apps/evaluation/components/EvaluationFinalScoreCard.vue'
import EvaluationManagerTab from '@/views/apps/evaluation/components/EvaluationManagerTab.vue'
import EvaluationOrganizationalTab from '@/views/apps/evaluation/components/EvaluationOrganizationalTab.vue'
import EvaluationPeriodsList from '@/views/apps/evaluation/components/EvaluationPeriodsList.vue'
import EvaluationPersonnelCard from '@/views/apps/evaluation/components/EvaluationPersonnelCard.vue'
import EvaluationSectionSummary from '@/views/apps/evaluation/components/EvaluationSectionSummary.vue'

definePage({
  meta: {
    action: 'use',
    subject: 'app',
  },
})

// ----- State -----
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  loadingResult: false,
})

const periods = ref([])
const selectedPeriod = ref(null)
const result = ref(null)
const activeTab = ref('manager')

// ----- دریافت دوره‌ها -----
async function fetchPeriods() {
  try {
    const { data, error } = await useApi(
      createUrl('/evaluation/published'),
    )

    if (error.value) throw error.value

    periods.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching periods:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت دوره‌های ارزیابی'
  }
}

// ----- دریافت نتیجه -----
async function fetchResult(period) {
  selectedPeriod.value = period
  result.value = null
  uiState.loadingResult = true

  try {
    const { data, error } = await useApi(
      createUrl('/evaluation/result', { query: { evaluation_id: period.id } }),
    )

    if (error.value) throw error.value

    result.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching result:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت نتیجه ارزیابی'
  }
  finally {
    uiState.loadingResult = false
  }
}

function goBack() {
  selectedPeriod.value = null
  result.value = null
}

onBeforeRouteLeave(() => {
  if (selectedPeriod.value) {
    goBack()

    return false
  }
})

await fetchPeriods()
</script>

<template>
  <VSnackbar
    v-model="uiState.hasError"
    :timeout="3000"
    location="center"
    variant="flat"
    color="error"
  >
    {{ uiState.errorMessage }}
  </VSnackbar>

  <EvaluationPeriodsList
    v-if="!selectedPeriod"
    :periods="periods"
    @select="fetchResult"
  />

  <div v-else>
    <div
      v-if="uiState.loadingResult"
      class="d-flex justify-center py-16"
    >
      <VProgressCircular
        indeterminate
        color="primary"
        size="64"
      />
    </div>

    <template v-else-if="result">
      <div class="sticky-header d-flex align-center gap-5 mb-5 py-4">
        <VBtn
          icon
          variant="tonal"
          color="secondary"
          @click="goBack"
        >
          <VIcon icon="tabler-arrow-right" />
        </VBtn>
        <div>
          <h5 class="text-h6 text-sm-h5 mb-2">
            نتیجه ارزیابی دوره {{ selectedPeriod.period }}
          </h5>

          <div class="d-flex align-center gap-2">
            <VIcon
              icon="tabler-calendar"
              color="blue"
            />

            <span class="text-body-2 text-medium-emphasis">
              {{ getJalaliMonthNameByIndex(selectedPeriod.period_start_month) }} {{ selectedPeriod.period_start_year }}
              تا
              {{ getJalaliMonthNameByIndex(selectedPeriod.period_end_month) }} {{ selectedPeriod.period_end_year }}
            </span>
          </div>
        </div>
      </div>

      <VRow>
        <VCol
          cols="12"
          md="4"
        >
          <EvaluationPersonnelCard :result="result" />
          <EvaluationFinalScoreCard :result="result" />
          <EvaluationSectionSummary :result="result" />
        </VCol>

        <VCol
          cols="12"
          md="8"
        >
          <VCard
            variant="flat"
            class="details-card"
          >
            <VCardText>
              <VTabs
                v-model="activeTab"
                show-arrows
                density="comfortable"
              >
                <VTab value="manager">
                  <VIcon
                    icon="tabler-user-star"
                    class="me-1"
                  />
                  <span class="d-none d-sm-inline">ارزیابی مدیر</span>
                </VTab>
                <VTab value="organizational">
                  <VIcon
                    icon="tabler-building-community"
                    class="me-1"
                  />
                  <span class="d-none d-sm-inline">رفتار سازمانی</span>
                </VTab>
                <VTab value="field">
                  <VIcon
                    icon="tabler-clipboard-check"
                    class="me-1"
                  />
                  <span class="d-none d-sm-inline">ارزیابی میدانی</span>
                </VTab>
              </VTabs>

              <VDivider />

              <VWindow v-model="activeTab">
                <VWindowItem value="manager">
                  <EvaluationManagerTab :result="result" />
                </VWindowItem>

                <VWindowItem value="organizational">
                  <EvaluationOrganizationalTab :result="result" />
                </VWindowItem>

                <VWindowItem value="field">
                  <EvaluationFieldTab :result="result" />
                </VWindowItem>
              </VWindow>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.sticky-header {
  position: sticky;
  z-index: 1;
  background: rgb(var(--v-theme-background));
  inset-block-start: 70px;
}

.details-card {
  /* stylelint-disable */
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  /* stylelint-enable */
}
</style>
