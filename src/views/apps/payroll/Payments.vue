<script setup>
const payments = [
  {
    label: 'حقوق پایه',
    amount: '35,485,962',
    percentChange: '4.2%+',
    statsColor: 'teal',
  },
  {
    label: 'حق اولاد',
    amount: '1,523,489',
    percentChange: '1.8%+',
    statsColor: 'teal',
  },
  {
    label: 'حق مسکن',
    amount: '9,123,456',
    percentChange: '0.5%-',
    statsColor: 'error',
  },
  {
    label: 'خواربار',
    amount: '1,100,000',
    percentChange: '2.3%+',
    statsColor: 'teal',
  },
  {
    label: 'حق تأهل',
    amount: '5,000,000',
    percentChange: '3.1%+',
    statsColor: 'teal',
  },
  {
    label: 'نوبت کاری 10%',
    amount: '258,321',
    percentChange: '1.1%-',
    statsColor: 'error',
  },
  {
    label: 'نوبت کاری 15%',
    amount: '387,481',
    percentChange: '1.6%+',
    statsColor: 'teal',
  },
  {
    label: 'شب کاری 35%',
    amount: '904,123',
    percentChange: '4.5%+',
    statsColor: 'teal',
  },
  {
    label: 'بن کارگری',
    amount: '1,250,000',
    percentChange: '0.9%+',
    statsColor: 'teal',
  },
  {
    label: 'پایه سنوات',
    amount: '750,000',
    percentChange: '0.7%+',
    statsColor: 'teal',
  },
  {
    label: 'مزد سنوات',
    amount: '850,000',
    percentChange: '1.2%-',
    statsColor: 'error',
  },
  {
    label: 'حق پست',
    amount: '1,800,000',
    percentChange: '2.1%+',
    statsColor: 'teal',
  },
  {
    label: 'ماندگاری حق پست',
    amount: '450,000',
    percentChange: '0.4%+',
    statsColor: 'teal',
  },
  {
    label: 'محیط کار (سختی کار)',
    amount: '2,100,000',
    percentChange: '2.5%+',
    statsColor: 'teal',
  },
  {
    label: 'ماندگاری محیط کار(سختی کار)',
    amount: '1,000,000,000',
    percentChange: '99.99%+',
    statsColor: 'teal',
  },
  {
    label: 'حق پست جدید',
    amount: '1,950,000',
    percentChange: '2.2%+',
    statsColor: 'teal',
  },
  {
    label: 'ماندگاری پست جدید',
    amount: '487,500',
    percentChange: '0.5%+',
    statsColor: 'teal',
  },
  {
    label: 'پاداش مدیریت',
    amount: '15,000,000',
    percentChange: '10.0%+',
    statsColor: 'teal',
  },
  {
    label: 'ماندگاری پاداش مدیریت',
    amount: '3,750,000',
    percentChange: '2.5%+',
    statsColor: 'teal',
  },
  {
    label: 'حق ماموریت',
    amount: '3,200,000',
    percentChange: '3.0%-',
    statsColor: 'error',
  },
  {
    label: 'پرداختی معوق',
    amount: '7,800,000',
    percentChange: '5.0%+',
    statsColor: 'teal',
  },
  {
    label: 'سایر مزایا',
    amount: '450,000',
    percentChange: '0.8%+',
    statsColor: 'teal',
  },
  {
    label: 'رتبه بندی',
    amount: '4,500,000',
    percentChange: '4.1%+',
    statsColor: 'teal',
  },
]
</script>

<template>
  <VCard class="payments-card">
    <VCardItem class="pa-3">
      <template #prepend>
        <VAvatar
          color="teal"
          variant="tonal"
          rounded
          icon="tabler-cash-banknote-plus"
        />
      </template>
      <VCardTitle>پرداخت‌ها</VCardTitle>
      <VCardSubtitle> ریال </VCardSubtitle>
    </VCardItem>

    <VCardText class="pa-3 pt-0">
      <VList>
        <VListItem
          v-for="payment in payments"
          :key="payment.label"
          class="pa-2"
        >
          <VListItemTitle class="text-wrap">
            {{ payment.label }}
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div class="text-body-1">
                {{ payment.amount }}
              </div>
              <div :class="`text-${payment.statsColor} text-sm`">
                {{ payment.percentChange }}
              </div>
            </div>
          </template>
        </VListItem>
      </VList>
    </VCardText>

    <VCardText>
      <VCard variant="tonal" color="teal">
        <VCardItem class="pa-3 pb-0">
          <VCardTitle>جمع پرداختی‌ها</VCardTitle>
        </VCardItem>

        <VCardText class="pa-3">
          <div class="d-flex align-center justify-space-between">
            <h6 class="text-h6 text-center">
              12,500,000
            </h6>
            <div class="text-sm text-teal">
              +1.6%
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.payments-card {
  border-block: 2px solid rgb(var(--v-theme-teal));
}
</style>
