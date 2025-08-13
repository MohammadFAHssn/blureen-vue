<script setup>
const allowanceItems = [
  {
    label: 'ماندگاری',
    amount: '1,000',
    percentChange: '1.2%+',
    statsColor: 'light-green',
  },
  {
    label: 'پاداش فنی',
    amount: '2,000',
    percentChange: '0.8%+',
    statsColor: 'light-green',
  },
  {
    label: 'فوق العاده مدیریت',
    amount: '30,000',
    percentChange: '0.5%-',
    statsColor: 'error',
  },
]

const welfareItems = [
  {
    label: 'کمک هزینه درمان',
    amount: '1,200',
    percentChange: '2.0%+',
    statsColor: 'light-green',
  },
  {
    label: 'کمک هزینه سفر',
    amount: '2,500',
    percentChange: '1.1%-',
    statsColor: 'error',
  },
  {
    label: 'کمک هزینه فرهنگی، ورزشی، سرگرمی',
    amount: '3,200',
    percentChange: '3.4%+',
    statsColor: 'light-green',
  },
  {
    label: 'کمک هزینه حمایت از خانواده',
    amount: '550,520,000',
    percentChange: '0.3%+',
    statsColor: 'light-green',
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
              <div :class="`text-${allowanceItem.statsColor} text-sm`">
                {{ allowanceItem.percentChange }}
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
                  <div :class="`text-${welfareItem.statsColor} text-sm`">
                    {{ welfareItem.percentChange }}
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
            <div class="text-sm text-light-green">
              +1.6%
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
