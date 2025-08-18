<script setup>
const bonuses = [
  {
    label: 'پاداش شناور فردی (ارزیابی)',
    period: 'هجدهم',
    group: 'عالی',
    amount: '35,485,962',
    percentChange: 4.2,
  },
  {
    label: 'پاداش شناور گروهی (بهره‌وری)',
    amount: '1,523,489',
    percentChange: 1.8,
  },
  {
    label: 'پاداش شناور مدیر واحد',
    amount: '9,123,456',
    percentChange: 0.5,
  },
  {
    label: 'فوق‌العاده بهره‌وری',
    amount: '1,100,000',
    percentChange: 2.3,
  },
]
</script>

<template>
  <VCard class="bonuses-card mb-3">
    <VCardItem class="pa-3">
      <template #prepend>
        <VAvatar color="primary" variant="tonal" rounded icon="tabler-gift" />
      </template>
      <VCardTitle>پاداش‌ها</VCardTitle>
      <VCardSubtitle> ریال </VCardSubtitle>
    </VCardItem>

    <VDivider />

    <VCardText class="pa-3 pt-0">
      <VList>
        <VListItem v-for="bonus in bonuses" :key="bonus.label" class="pa-2">
          <VListItemTitle class="text-wrap">
            {{ bonus.label }}
            <div v-if="bonus.period">
              دوره
              <VChip variant="outlined" color="primary" :label="false">
                {{ bonus.period }}
              </VChip>
            </div>
            <div v-if="bonus.group">
              گروه
              <VChip variant="flat" color="primary" :label="false">
                {{ bonus.group }}
              </VChip>
            </div>
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div class="text-body-1">
                {{ bonus.amount }}
              </div>
              <div :class="`d-flex align-center ${bonus.percentChange > 0 ? 'text-success' : 'text-error'}`">
                <div class="text-sm">
                  {{ Math.abs(bonus.percentChange) }}%
                </div>

                <VIcon
                  :icon="
                    bonus.percentChange > 0
                      ? 'tabler-chevron-up'
                      : 'tabler-chevron-down'
                  "
                  size="20"
                  class="mr-1"
                />
              </div>
            </div>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>

  <VCard color="primary">
    <VCardText class="pa-3 d-flex justify-space-between">
      <div class="v-card-title pa-0 text-white">
        جمع پاداش‌ها (پرداختی دوم)
      </div>

      <div class="d-flex align-center justify-space-between">
        <h6 class="text-h6 text-center ml-4 text-white">
          12,500,000
        </h6>
        <VChip variant="flat" :color="`${3.2 > 0 ? 'success' : 'error'}`" class="d-flex align-center">
          <div class="text-sm">
            {{ Math.abs(3.2) }}%
          </div>

          <VIcon
            :icon="
              3.2 > 0
                ? 'tabler-chevron-up'
                : 'tabler-chevron-down'
            "
            size="20"
            class="mr-1"
          />
        </VChip>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.bonuses-card {
  border-block: 2px solid rgb(var(--v-theme-primary));
}
</style>
