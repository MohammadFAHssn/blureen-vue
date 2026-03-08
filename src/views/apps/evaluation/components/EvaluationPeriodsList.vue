<script setup>
import { getJalaliMonthNameByIndex } from '@core/utils/helpers'
import {
  rankColor,
  scoreColor,
} from '@/views/apps/evaluation/evaluationResultHelpers'

defineProps({
  periods: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['select'])
</script>

<template>
  <h3 class="mb-4">
    نتایج ارزیابی
  </h3>

  <div v-if="periods.length === 0" class="text-center py-10">
    <VIcon
      icon="tabler-clipboard-off"
      size="64"
      color="secondary"
      class="mb-4"
    />
    <h6 class="text-h6 text-medium-emphasis">
      هنوز نتیجه ارزیابی منتشر نشده است.
    </h6>
  </div>

  <VRow v-else>
    <VCol
      v-for="period in periods"
      :key="period.id"
      cols="12"
      sm="6"
      md="5"
      lg="5"
      xl="3"
      xxl="3"
    >
      <VCard :disabled="!period.has_result" @click="emit('select', period)">
        <VCardText class="text-center">
          <VAvatar
            variant="tonal"
            :color="period.has_result ? 'primary' : 'secondary'"
            :size="$vuetify.display.smAndUp ? 56 : 44"
            rounded
            class="mb-3"
          >
            <VIcon
              :icon="period.has_result ? 'tabler-chart-bar' : 'tabler-lock'"
              size="28"
            />
          </VAvatar>

          <div class="d-flex align-center gap-2 justify-center mb-2">
            <VIcon icon="tabler-calendar" color="blue" />

            <h6 class="text-h6">
              دوره
              {{ period.period }}
            </h6>
          </div>

          <p class="text-body-2 text-medium-emphasis mb-3">
            {{ getJalaliMonthNameByIndex(period.period_start_month) }}
            {{ period.period_start_year }}
            تا
            {{ getJalaliMonthNameByIndex(period.period_end_month) }}
            {{ period.period_end_year }}
          </p>

          <div
            v-if="period.has_result && period.final_score != null"
            class="d-flex align-center justify-center gap-3"
          >
            <VChip
              :color="scoreColor(period.final_score, 100)"
              variant="tonal"
              size="small"
              label
            >
              <VIcon icon="tabler-star" size="14" start />
              نمره: {{ Math.round(period.final_score * 100) / 100 }}
            </VChip>

            <VChip
              v-if="period.final_rank"
              :color="rankColor(period.final_rank)"
              variant="tonal"
              size="small"
              label
            >
              <VIcon icon="tabler-trophy" size="14" start />
              {{ period.final_rank }}
            </VChip>
          </div>

          <VChip
            v-if="!period.has_result"
            color="warning"
            variant="tonal"
            size="small"
            label
          >
            عدم حضور
          </VChip>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
