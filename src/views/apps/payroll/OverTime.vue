<script setup>
const overtimeItems = [
  {
    label: 'اضافه کاری عادی',
    minutes: 15555,
    amount: '350,485,962',
    percentChange: '100.100%-',
    statsColor: 'error',
  },
  {
    label: 'جمعه کاری',
    minutes: 15555,
    amount: '100,523,489',
    percentChange: '100.100%+',
    statsColor: 'success',
  },
]
</script>

<template>
  <VCard class="overtime-card">
    <VCardItem class="pa-3">
      <template #prepend>
        <VAvatar
          color="success"
          variant="tonal"
          rounded
          icon="tabler-clock-plus"
        />
      </template>
      <VCardTitle>اضافه‌کاری</VCardTitle>
    </VCardItem>

    <VCardText class="pa-3 pt-0">
      <VList>
        <VListItem class="pa-2 custom-v-list-item">
          <VListItemTitle class="text-wrap" />

          <template #append>
            <div class="d-flex justify-space-between gap-x-4">
              <div class="text-body-1 font-weight-bold">
                دقیقه
              </div>
              <div class="text-body-1 font-weight-bold">
                پرداختی
              </div>
              <div />
            </div>
          </template>
        </VListItem>

        <VListItem
          v-for="item in overtimeItems"
          :key="item.label"
          class="pa-2 custom-v-list-item"
        >
          <VListItemTitle class="text-wrap">
            {{ item.label }}
          </VListItemTitle>

          <template #append>
            <div class="d-flex justify-space-between gap-x-4">
              <div class="text-body-1">
                {{ item.minutes }}
              </div>
              <div class="text-body-1">
                {{ item.amount }}
              </div>
              <div :class="`text-${item.statsColor} text-sm`">
                {{ item.percentChange }}
              </div>
            </div>
          </template>
        </VListItem>
      </VList>
    </VCardText>

    <VCardText>
      <VCard variant="tonal" color="success">
        <VCardItem class="pa-3 pb-0">
          <VCardTitle>جمع پرداختی اضافه‌کاری</VCardTitle>
        </VCardItem>

        <VCardText class="pa-3">
          <div class="d-flex align-center justify-space-between">
            <h6 class="text-h6 text-center">
              12,500,000
            </h6>
            <div class="text-sm text-success">
              1.6%+
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.overtime-card {
  border-block: 2px solid rgb(var(--v-theme-success));
}

.custom-v-list-item {
  grid-template-columns: 1px auto 220px;
}

:deep(.v-list-item__append) {
  display: block;
}
</style>
