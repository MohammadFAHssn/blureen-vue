<script setup>
const allowanceItems = [
  {
    label: 'ماندگاری',
    amount: '1,000',
    percentChange: -1.2,

  },
  {
    label: 'پاداش فنی',
    amount: '2,000',
    percentChange: 0.8,

  },
  {
    label: 'فوق العاده مدیریت',
    amount: '30,000',
    percentChange: 0.5,

  },
]

const welfareItems = [
  {
    label: 'کمک هزینه درمان',
    amount: '1,200',
    percentChange: -2.0,

  },
  {
    label: 'کمک هزینه سفر',
    amount: '2,500',
    percentChange: 1.1,

  },
  {
    label: 'کمک هزینه فرهنگی، ورزشی، سرگرمی',
    amount: '3,200',
    percentChange: 3.4,

  },
  {
    label: 'کمک هزینه حمایت از خانواده',
    amount: '550,520,000',
    percentChange: -0.3,

  },
]

const allowanceDeductions = {
  amount: '1,200',
  reason: 'دلوم موخواد',
}
</script>

<template>
  <VCard class="allowances-card">
    <VCardItem class="pa-3">
      <template #prepend>
        <VAvatar
          color="light-green"
          variant="tonal"
          rounded
          icon="tabler-medal"
        />
      </template>
      <VCardTitle>فوق‌العاده پرداخت‌ها</VCardTitle>
      <VCardSubtitle> ریال </VCardSubtitle>
    </VCardItem>

    <VCardText class="pa-3 pt-0">
      <VList>
        <VListItem
          v-for="allowanceItem in allowanceItems"
          :key="allowanceItem.label"
          class="pa-2"
        >
          <VListItemTitle class="text-wrap">
            {{ allowanceItem.label }}
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div class="text-body-1">
                {{ allowanceItem.amount }}
              </div>
              <div :class="`d-flex align-center ${allowanceItem.percentChange > 0 ? 'text-light-green' : 'text-error'}`">
                <div class="text-sm">
                  {{ Math.abs(allowanceItem.percentChange) }}%
                </div>

                <VIcon
                  :icon="
                    allowanceItem.percentChange > 0
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
      <VCard variant="outlined" color="light-green-lighten-3">
        <VCardItem class="pa-3">
          <VCardTitle class="v-list-item-title font-weight-bold">
            رفاهیات
          </VCardTitle>
        </VCardItem>

        <VCardText class="pa-3 pt-0">
          <VList>
            <VListItem
              v-for="welfareItem in welfareItems"
              :key="welfareItem.label"
              class="pa-2"
            >
              <VListItemTitle class="text-wrap">
                {{ welfareItem.label }}
              </VListItemTitle>

              <template #append>
                <div class="d-flex gap-x-4">
                  <div class="text-body-1">
                    {{ welfareItem.amount }}
                  </div>
                  <div :class="`d-flex align-center ${welfareItem.percentChange > 0 ? 'text-light-green' : 'text-error'}`">
                    <div class="text-sm">
                      {{ Math.abs(welfareItem.percentChange) }}%
                    </div>

                    <VIcon
                      :icon="
                        welfareItem.percentChange > 0
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
    </VCardText>

    <VCardText>
      <VCard variant="outlined" color="error-lighten-2">
        <VCardItem class="pa-3">
          <VCardTitle class="v-list-item-title font-weight-bold">
            کسورات فوق‌العاده
          </VCardTitle>
        </VCardItem>

        <VCardText class="pa-3 pt-0">
          <VList>
            <VListItem class="pa-2">
              <VListItemTitle class="text-wrap">
                مقدار
              </VListItemTitle>

              <template #append>
                <div class="d-flex gap-x-4">
                  <div class="text-body-1">
                    {{ allowanceDeductions.amount }}
                  </div>
                </div>
              </template>
            </VListItem>

            <VListItem class="pa-2">
              <VListItemTitle class="text-wrap">
                علت
              </VListItemTitle>

              <template #append>
                <div class="d-flex gap-x-4">
                  <div class="text-body-1">
                    {{ allowanceDeductions.reason }}
                  </div>
                </div>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCardText>

    <VCardText>
      <VCard variant="tonal" color="light-green">
        <VCardItem class="pa-3 pb-0">
          <VCardTitle>جمع فوق‌العاده پرداخت‌ها</VCardTitle>
        </VCardItem>

        <VCardText class="pa-3">
          <div class="d-flex align-center justify-space-between">
            <h6 class="text-h6 text-center">
              12,500,000
            </h6>
            <div :class="`d-flex align-center ${-5 > 0 ? 'text-light-green' : 'text-error'}`">
              <div class="text-sm">
                {{ Math.abs(-5) }}%
              </div>

              <VIcon
                :icon="
                  -5 > 0
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
.allowances-card {
  border-block: 2px solid rgb(var(--v-theme-light-green));
}
</style>
