<script setup>
const payments = [
  {
    label: 'حقوق پایه',
    amount: '35,485,962',
    percentChange: '4.2%+',
    statsColor: 'success',
  },
  {
    label: 'حق اولاد',
    amount: '1,523,489',
    percentChange: '1.8%+',
    statsColor: 'success',
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
    statsColor: 'success',
  },
  {
    label: 'حق تأهل',
    amount: '5,000,000',
    percentChange: '3.1%+',
    statsColor: 'success',
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
    statsColor: 'success',
  },
  {
    label: 'شب کاری 35%',
    amount: '904,123',
    percentChange: '4.5%+',
    statsColor: 'success',
  },
  {
    label: 'بن کارگری',
    amount: '1,250,000',
    percentChange: '0.9%+',
    statsColor: 'success',
  },
  {
    label: 'پایه سنوات',
    amount: '750,000',
    percentChange: '0.7%+',
    statsColor: 'success',
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
    statsColor: 'success',
  },
  {
    label: 'ماندگاری حق پست',
    amount: '450,000',
    percentChange: '0.4%+',
    statsColor: 'success',
  },
  {
    label: 'محیط کار (سختی کار)',
    amount: '2,100,000',
    percentChange: '2.5%+',
    statsColor: 'success',
  },
  {
    label: 'ماندگاری محیط کار(سختی کار)',
    amount: '1,000,000,000',
    percentChange: '99.99%+',
    statsColor: 'success',
  },
  {
    label: 'حق پست جدید',
    amount: '1,950,000',
    percentChange: '2.2%+',
    statsColor: 'success',
  },
  {
    label: 'ماندگاری پست جدید',
    amount: '487,500',
    percentChange: '0.5%+',
    statsColor: 'success',
  },
  {
    label: 'پاداش مدیریت',
    amount: '15,000,000',
    percentChange: '10.0%+',
    statsColor: 'success',
  },
  {
    label: 'ماندگاری پاداش مدیریت',
    amount: '3,750,000',
    percentChange: '2.5%+',
    statsColor: 'success',
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
    statsColor: 'success',
  },
  {
    label: 'سایر مزایا',
    amount: '450,000',
    percentChange: '0.8%+',
    statsColor: 'success',
  },
  {
    label: 'رتبه بندی',
    amount: '4,500,000',
    percentChange: '4.1%+',
    statsColor: 'success',
  },
]
</script>

<template>
  <VCard class="payments-card mb-3">
    <VCardItem class="pa-3">
      <template #prepend>
        <VAvatar
          color="success"
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
  </VCard>

  <VCard variant="tonal" color="success">
    <VCardItem class="pa-3 pb-0">
      <VCardTitle>جمع پرداختی‌ها</VCardTitle>
    </VCardItem>

    <VCardText class="pa-3">
      <div class="d-flex align-center justify-space-between">
        <h6 class="text-h6 text-center">
          12,500,000
        </h6>
        <div class="text-sm text-success">
          +1.6%
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.payments-card {
  border-block: 2px solid rgb(var(--v-theme-success));
}
</style>
