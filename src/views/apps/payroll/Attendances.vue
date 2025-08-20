<script setup>
const props = defineProps({
  getAmount: {
    type: Function,
    required: true,
  },
})

const attendances = [
  {
    label: 'کارکرد عادی',
    minutes: props.getAmount('دقیقه كاركرد عادی'),
  },
  {
    label: 'بیماری',
    minutes: props.getAmount('دقیقه بيماری'),
  },
  {
    label: 'غیبت',
    minutes: props.getAmount('دقیقه غيبت'),
  },
  {
    label: 'مرخصی بدون حقوق',
    minutes: props.getAmount('دقیقه مرخصی بدون حقوق'),
  },
  {
    label: 'اضافه‌کاری',
    minutes: props.getAmount('اضافه كاري عادی*'),
  },
  {
    label: 'جمعه‌کاری',
    minutes: props.getAmount('جمعه كاری*'),
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
