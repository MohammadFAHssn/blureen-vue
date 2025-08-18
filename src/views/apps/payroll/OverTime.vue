<script setup>
const overtimeItems = [
  {
    label: 'اضافه‌کاری عادی',
    minutes: '15,555',
    amount: '350,485,962',
    percentChange: 100.123,
  },
  {
    label: 'جمعه‌کاری',
    minutes: '15,555',
    amount: '100,523,489',
    percentChange: -100.123,
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
      <VCardSubtitle> ریال </VCardSubtitle>
    </VCardItem>

    <VDivider />

    <VCardText class="pa-3 pt-0">
      <VList>
        <VListItem
          v-for="item in overtimeItems"
          :key="item.label"
          class="pa-2"
        >
          <VListItemTitle class="text-wrap">
            {{ item.label }}
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div class="text-body-1">
                {{ item.amount }}
              </div>
              <div :class="`d-flex align-center ${item.percentChange > 0 ? 'text-success' : 'text-error'}`">
                <div class="text-sm">
                  {{ Math.abs(item.percentChange) }}%
                </div>

                <VIcon
                  :icon="
                    item.percentChange > 0
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

    <VCardText>
      <VCard variant="tonal" color="success">
        <VCardText class="pa-3 d-flex justify-space-between">
          <div class="v-card-title pa-0">
            جمع پرداختی اضافه‌کاری
          </div>

          <div class="d-flex align-center justify-space-between">
            <h6 class="text-h6 text-center ml-4">
              12,500,000
            </h6>
            <div :class="`d-flex align-center ${10 > 0 ? 'text-success' : 'text-error'}`">
              <div class="text-sm">
                {{ Math.abs(10) }}%
              </div>

              <VIcon
                :icon="
                  10 > 0
                    ? 'tabler-chevron-up'
                    : 'tabler-chevron-down'
                "
                size="20"
                class="mr-1"
              />
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
</style>
