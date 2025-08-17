<script setup>
const attendances = [
  {
    label: 'کارکرد عادی',
    minutes: '160',
  },
  {
    label: 'بیماری',
    minutes: '125,000',
  },
  {
    label: 'غیبت',
    minutes: '12,100',
  },
  {
    label: 'مرخصی بدون حقوق',
    minutes: '50',
  },
]
</script>

<template>
  <VCard class="attendances-card">
    <VCardItem class="pa-3">
      <template #prepend>
        <VAvatar
          color="secondary"
          variant="tonal"
          rounded
          icon="tabler-clock"
        />
      </template>
      <VCardTitle>کارکرد و غیبت</VCardTitle>
      <VCardSubtitle> دقیقه </VCardSubtitle>
    </VCardItem>

    <VCardText class="pa-3 pt-0">
      <VList>
        <VListItem
          v-for="attendance in attendances"
          :key="attendance.label"
          class="pa-2"
        >
          <VListItemTitle class="text-wrap">
            {{ attendance.label }}
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div class="text-body-1">
                {{ attendance.minutes }}
              </div>
            </div>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.attendances-card {
  border-block: 2px solid rgb(var(--v-theme-secondary));
}
</style>
