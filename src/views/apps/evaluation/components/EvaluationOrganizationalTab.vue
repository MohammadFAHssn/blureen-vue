<script setup>
import { scoreColor } from '@/views/apps/evaluation/evaluationResultHelpers'

defineProps({
  result: {
    type: Object,
    required: true,
  },
})

const sections = [
  {
    key: 'org',
    title: 'اداری',
    icon: 'tabler-building',
    iconColor: 'primary',
    scoreKey: 'org_admin_score',
    maxScore: 10,
    reasonKey: null,
    counts: [
      { label: 'تعداد غیبت', key: 'org_absence_count' },
      { label: 'تعداد تاخیر', key: 'org_late_count' },
      { label: 'تعداد تعهد مرخصی', key: 'org_leave_commitment_count' },
    ],
  },
  {
    key: 'security',
    title: 'انتظامات',
    icon: 'tabler-shield-check',
    iconColor: 'info',
    scoreKey: 'org_security_score',
    maxScore: 5,
    reasonKey: 'org_security_penalty_reason',
    counts: [],
  },
  {
    key: 'safety',
    title: 'ایمنی',
    icon: 'tabler-helmet',
    iconColor: 'warning',
    scoreKey: 'org_safety_score',
    maxScore: 10,
    reasonKey: 'org_safety_penalty_reason',
    counts: [],
  },
  {
    key: 'discipline',
    title: 'کمیته انضباطی',
    icon: 'tabler-gavel',
    iconColor: 'error',
    scoreKey: 'org_discipline_committee_score',
    maxScore: 10,
    reasonKey: 'org_discipline_committee_penalty_reason',
    counts: [],
  },
  {
    key: 'monitoring',
    title: 'مانیتورینگ',
    icon: 'tabler-device-desktop-analytics',
    iconColor: 'secondary',
    scoreKey: 'org_monitoring_score',
    maxScore: 5,
    reasonKey: 'org_monitoring_penalty_reason',
    counts: [],
  },
]
</script>

<template>
  <VRow class="ma-1">
    <VCol
      v-for="section in sections"
      :key="section.key"
      cols="12"
      sm="6"
      xl="4"
    >
      <VCard
        flat
        border
        class="section-card"
      >
        <!-- Header -->
        <div class="d-flex align-center justify-space-between pa-4 pb-3">
          <div class="d-flex align-center gap-3">
            <VAvatar
              :color="section.iconColor"
              variant="tonal"
              size="40"
              rounded
            >
              <VIcon
                :icon="section.icon"
                size="22"
              />
            </VAvatar>
            <span class="text-subtitle-1 font-weight-bold">{{ section.title }}</span>
          </div>
          <VChip
            :color="scoreColor(result[section.scoreKey], section.maxScore)"
            variant="tonal"
            size="small"
            label
            class="font-weight-bold"
          >
            {{ result[section.scoreKey] ?? '-' }} از {{ section.maxScore }}
          </VChip>
        </div>

        <VDivider />

        <!-- Content -->
        <div class="pa-4 pt-3">
          <!-- Counts -->
          <template v-if="section.counts.length">
            <div
              v-for="item in section.counts"
              :key="item.key"
              class="d-flex align-center justify-space-between py-1"
            >
              <span class="text-body-2 text-medium-emphasis">{{ item.label }}</span>
              <VChip
                variant="text"
                size="small"
                color="default"
                class="font-weight-bold"
              >
                {{ result[item.key] ?? '-' }}
              </VChip>
            </div>
          </template>

          <!-- Penalty Reason -->
          <template v-if="section.reasonKey">
            <div
              v-if="result[section.reasonKey]"
              class="d-flex align-start gap-2 mt-1"
            >
              <VIcon
                icon="tabler-alert-triangle"
                size="19"
                color="warning"
                class="flex-shrink-0"
              />
              <div>
                <span class="text-body-2 text-medium-emphasis">علت جریمه</span>
                <p class="text-body-2 mb-0">
                  {{ result[section.reasonKey] }}
                </p>
              </div>
            </div>
            <div
              v-else
              class="d-flex align-center gap-2 mt-1"
            >
              <VIcon
                icon="tabler-circle-check"
                size="18"
                color="success"
              />
              <span class="text-body-2 text-medium-emphasis">بدون جریمه</span>
            </div>
          </template>
        </div>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
.section-card {
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgb(var(--v-theme-on-surface), 0.08);
    transform: translateY(-2px);
  }
}
</style>
