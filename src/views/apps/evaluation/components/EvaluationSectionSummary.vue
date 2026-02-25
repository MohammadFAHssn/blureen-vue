<script setup>
import { scoreColor } from '@/views/apps/evaluation/evaluationResultHelpers'

defineProps({
  result: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <VCard
    variant="flat"
    class="section-summary-card"
  >
    <VCardItem title="خلاصه امتیازات" />
    <VCardText>
      <VRow>
        <VCol
          cols="6"
          sm="3"
          md="6"
          xl="3"
          class="d-flex flex-column align-center"
        >
          <VProgressCircular
            :model-value="result.mgr_final_score ? (Number.parseFloat(result.mgr_final_score) / 35) * 100 : 0"
            :size="46"
            :width="4"
            :color="scoreColor(result.mgr_final_score, 35)"
            class="mb-2"
          >
            <span class="text-body-2 font-weight-medium">{{ result.mgr_final_score ?? '-' }}</span>
          </VProgressCircular>
          <span class="font-weight-medium text-body-2">ارزیابی مدیر</span>
          <span class="text-caption text-medium-emphasis">از ۳۵</span>
        </VCol>

        <VCol
          cols="6"
          sm="3"
          md="6"
          xl="3"
          class="d-flex flex-column align-center"
        >
          <VProgressCircular
            :model-value="result.org_final_score ? (Number.parseFloat(result.org_final_score) / 40) * 100 : 0"
            :size="46"
            :width="4"
            :color="scoreColor(result.org_final_score, 40)"
            class="mb-2"
          >
            <span class="text-body-2 font-weight-medium">{{ result.org_final_score ?? '-' }}</span>
          </VProgressCircular>
          <span class="font-weight-medium text-body-2">رفتار سازمانی</span>
          <span class="text-caption text-medium-emphasis">از ۴۰</span>
        </VCol>

        <VCol
          cols="6"
          sm="3"
          md="6"
          xl="3"
          class="d-flex flex-column align-center"
        >
          <VProgressCircular
            :model-value="result.self_eval_score ? (Number.parseFloat(result.self_eval_score) / 5) * 100 : 0"
            :size="46"
            :width="4"
            :color="scoreColor(result.self_eval_score, 5)"
            class="mb-2"
          >
            <span class="text-body-2 font-weight-medium">{{ result.self_eval_score ?? '-' }}</span>
          </VProgressCircular>
          <span class="font-weight-medium text-body-2">خودارزیابی</span>
          <span class="text-caption text-medium-emphasis">از ۵</span>
        </VCol>

        <VCol
          cols="6"
          sm="3"
          md="6"
          xl="3"
          class="d-flex flex-column align-center"
        >
          <VProgressCircular
            :model-value="result.field_final_score ? (Number.parseFloat(result.field_final_score) / 20) * 100 : 0"
            :size="46"
            :width="4"
            :color="scoreColor(result.field_final_score, 20)"
            class="mb-2"
          >
            <span class="text-body-2 font-weight-medium">{{ Math.round(result.field_final_score * 100) / 100 ?? '-' }}</span>
          </VProgressCircular>
          <span class="font-weight-medium text-body-2">ارزیابی میدانی</span>
          <span class="text-caption text-medium-emphasis">از ۲۰</span>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.section-summary-card {
  /* stylelint-disable */
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  /* stylelint-enable */
}
</style>
