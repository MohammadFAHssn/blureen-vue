<script setup>
import { useDisplay } from 'vuetify'
import { scoreColor } from '@/views/apps/evaluation/evaluationResultHelpers'

defineProps({
  result: {
    type: Object,
    required: true,
  },
})

const { smAndUp } = useDisplay()
</script>

<template>
  <VCardText>
    <VRow>
      <VCol
        cols="6"
        sm="3"
      >
        <VCard
          flat
          border
          class="text-center pa-3 pa-sm-4"
        >
          <VProgressCircular
            :model-value="result.field_discipline_score ? (Number.parseFloat(result.field_discipline_score) / 20) * 100 : 0"
            :size="smAndUp ? 64 : 48"
            :width="smAndUp ? 5 : 4"
            :color="scoreColor(result.field_discipline_score, 20)"
            class="mb-2"
          >
            <span class="text-body-2 text-sm-body-1 font-weight-bold">{{ result.field_discipline_score ?? '-' }}</span>
          </VProgressCircular>
          <div class="text-caption text-sm-body-2 text-medium-emphasis">
            نظم و انضباط
          </div>
          <div class="text-caption">
            از ۲۰
          </div>
        </VCard>
      </VCol>
      <VCol
        cols="6"
        sm="3"
      >
        <VCard
          flat
          border
          class="text-center pa-3 pa-sm-4"
        >
          <VProgressCircular
            :model-value="result.field_ethics_score ? (Number.parseFloat(result.field_ethics_score) / 20) * 100 : 0"
            :size="smAndUp ? 64 : 48"
            :width="smAndUp ? 5 : 4"
            :color="scoreColor(result.field_ethics_score, 20)"
            class="mb-2"
          >
            <span class="text-body-2 text-sm-body-1 font-weight-bold">{{ result.field_ethics_score ?? '-' }}</span>
          </VProgressCircular>
          <div class="text-caption text-sm-body-2 text-medium-emphasis">
            جنبه اخلاقی
          </div>
          <div class="text-caption">
            از ۲۰
          </div>
        </VCard>
      </VCol>
      <VCol
        cols="6"
        sm="3"
      >
        <VCard
          flat
          border
          class="text-center pa-3 pa-sm-4"
        >
          <VProgressCircular
            :model-value="result.field_job_competency_score ? (Number.parseFloat(result.field_job_competency_score) / 20) * 100 : 0"
            :size="smAndUp ? 64 : 48"
            :width="smAndUp ? 5 : 4"
            :color="scoreColor(result.field_job_competency_score, 20)"
            class="mb-2"
          >
            <span class="text-body-2 text-sm-body-1 font-weight-bold">{{ result.field_job_competency_score ?? '-' }}</span>
          </VProgressCircular>
          <div class="text-caption text-sm-body-2 text-medium-emphasis">
            شایستگی شغلی
          </div>
          <div class="text-caption">
            از ۲۰
          </div>
        </VCard>
      </VCol>
      <VCol
        cols="6"
        sm="3"
      >
        <VCard
          flat
          border
          class="text-center pa-3 pa-sm-4"
        >
          <VProgressCircular
            :model-value="result.field_communication_training_score ? (Number.parseFloat(result.field_communication_training_score) / 20) * 100 : 0"
            :size="smAndUp ? 64 : 48"
            :width="smAndUp ? 5 : 4"
            :color="scoreColor(result.field_communication_training_score, 20)"
            class="mb-2"
          >
            <span class="text-body-2 text-sm-body-1 font-weight-bold">{{ result.field_communication_training_score ?? '-' }}</span>
          </VProgressCircular>
          <div class="text-caption text-sm-body-2 text-medium-emphasis">
            مهارت ارتباطی و آموزشی
          </div>
          <div class="text-caption">
            از ۲۰
          </div>
        </VCard>
      </VCol>
    </VRow>
  </VCardText>
</template>
