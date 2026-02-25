<script setup>
import { rankColor, scoreColor } from '@/views/apps/evaluation/evaluationResultHelpers'

defineProps({
  result: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <VCard
    class="mb-6 final-score-card"
    variant="flat"
  >
    <VCardText class="text-center">
      <h6 class="text-h6 mb-4">
        امتیاز نهایی
      </h6>

      <v-progress-circular
        :model-value="Number.parseFloat(result.final_score) || 0"
        :size="$vuetify.display.smAndUp ? 120 : 100"
        :width="$vuetify.display.smAndUp ? 10 : 8"
        bg-color="surface-light"
        :color="scoreColor(result.final_score, 100)"
        rounded
      >
        <v-avatar color="surface-light" :size="$vuetify.display.smAndUp ? 93 : 78">
          <div class="text-sm-h5 text-h6">
            <span>{{ Math.round(result.final_score * 100) / 100 ?? '-' }}</span>
            <br />
            <span class="text-subtitle-2 text-medium-emphasis">از ۱۰۰</span>
          </div>
        </v-avatar>
      </v-progress-circular>

      <VChip
        v-if="result.final_rank"
        :color="rankColor(result.final_rank)"
        variant="tonal"
        class="mr-4"
        label
      >
        {{ result.final_rank }}
      </VChip>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.final-score-card {
  /* stylelint-disable */
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  /* stylelint-enable */
}
</style>
