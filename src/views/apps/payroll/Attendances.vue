<script setup>
const props = defineProps({
  getPayrollItemByLabel: {
    type: Function,
    required: true,
  },
})

const attendances = computed(() =>
  [
    {
      label: 'کارکرد عادی',
      minutes: props.getPayrollItemByLabel('دقیقه كاركرد عادی').amount,
    },
    {
      label: 'بیماری',
      minutes: props.getPayrollItemByLabel('دقیقه بيماری').amount,
    },
    {
      label: 'غیبت',
      minutes: props.getPayrollItemByLabel('دقیقه غيبت').amount,
    },
    {
      label: 'مرخصی بدون حقوق',
      minutes: props.getPayrollItemByLabel('دقیقه مرخصی بدون حقوق').amount,
    },
    {
      label: 'اضافه‌کاری',
      minutes: props.getPayrollItemByLabel('دقیقه اضافه كاری عادی').amount,
    },
    {
      label: 'جمعه‌کاری',
      minutes: props.getPayrollItemByLabel('دقیقه جمعه كاری').amount,
    },
  ].filter(attendance => attendance.minutes),
)
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

    <VDivider />

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
                {{ formatNumber(attendance.minutes) }}
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
