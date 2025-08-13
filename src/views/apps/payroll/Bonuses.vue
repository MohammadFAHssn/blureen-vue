<script setup>
const bonuses = [
  {
    label: 'پاداش شناور فردی (ارزیابی)',
    period: 'هجدهم',
    group: 'عالی',
    amount: '35,485,962',
    percentChange: '4.2%+',
    statsColor: 'success',
  },
  {
    label: 'پاداش شناور گروهی (بهره‌وری)',
    amount: '1,523,489',
    percentChange: '1.8%+',
    statsColor: 'success',
  },
  {
    label: 'پاداش شناور مدیر واحد',
    amount: '9,123,456',
    percentChange: '0.5%-',
    statsColor: 'error',
  },
  {
    label: 'فوق‌العاده بهره‌وری',
    amount: '1,100,000',
    percentChange: '2.3%+',
    statsColor: 'success',
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
              <div :class="`text-${bonus.statsColor} text-sm`">
                {{ bonus.percentChange }}
              </div>
            </div>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>

  <VCard color="primary">
    <VCardItem class="pa-3 pb-0">
      <VCardTitle class="text-white">
        جمع پاداش‌ها (پرداختی دوم)
      </VCardTitle>
    </VCardItem>

    <VCardText class="pa-3">
      <div class="d-flex align-center justify-space-between">
        <h6 class="text-h6 text-center text-white">
          12,500,000
        </h6>
        <VChip variant="flat" color="success">
          1.6%+
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
