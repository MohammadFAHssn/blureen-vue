<script setup>
const payments = [
  {
    title: 'حقوق پایه',
    count: '35,485,962',
    stats: '4.2%+',
    statsColor: 'success',
  },
  {
    title: 'حق اولاد',
    count: '1,523,489',
    stats: '1.8%+',
    statsColor: 'success',
  },
  {
    title: 'حق مسکن',
    count: '9,123,456',
    stats: '0.5%-',
    statsColor: 'error',
  },
  {
    title: 'خواربار',
    count: '1,100,000',
    stats: '2.3%+',
    statsColor: 'success',
  },
  {
    title: 'حق تأهل',
    count: '5,000,000',
    stats: '3.1%+',
    statsColor: 'success',
  },
  {
    title: 'نوبت کاری 10%',
    count: '258,321',
    stats: '1.1%-',
    statsColor: 'error',
  },
  {
    title: 'نوبت کاری 15%',
    count: '387,481',
    stats: '1.6%+',
    statsColor: 'success',
  },
  {
    title: 'شب کاری 35%',
    count: '904,123',
    stats: '4.5%+',
    statsColor: 'success',
  },
  {
    title: 'بن کارگری',
    count: '1,250,000',
    stats: '0.9%+',
    statsColor: 'success',
  },
  {
    title: 'پایه سنوات',
    count: '750,000',
    stats: '0.7%+',
    statsColor: 'success',
  },
  {
    title: 'مزد سنوات',
    count: '850,000',
    stats: '1.2%-',
    statsColor: 'error',
  },
  // {
  //   title: 'حق پست',
  //   count: '1,800,000',
  //   stats: '2.1%+',
  //   statsColor: 'success',
  // },
  // {
  //   title: 'ماندگاری حق پست',
  //   count: '450,000',
  //   stats: '0.4%+',
  //   statsColor: 'success',
  // },
  // {
  //   title: 'محیط کار (سختی کار)',
  //   count: '2,100,000',
  //   stats: '2.5%+',
  //   statsColor: 'success',
  // },
  // {
  //   title: 'ماندگاری محیط کار(سختی کار)',
  //   count: '525,000',
  //   stats: '0.6%-',
  //   statsColor: 'error',
  // },
  // {
  //   title: 'حق پست جدید',
  //   count: '1,950,000',
  //   stats: '2.2%+',
  //   statsColor: 'success',
  // },
  // {
  //   title: 'ماندگاری پست جدید',
  //   count: '487,500',
  //   stats: '0.5%+',
  //   statsColor: 'success',
  // },
  // {
  //   title: 'پاداش مدیریت',
  //   count: '15,000,000',
  //   stats: '10.0%+',
  //   statsColor: 'success',
  // },
  // {
  //   title: 'ماندگاری پاداش مدیریت',
  //   count: '3,750,000',
  //   stats: '2.5%+',
  //   statsColor: 'success',
  // },
  // {
  //   title: 'حق ماموریت',
  //   count: '3,200,000',
  //   stats: '3.0%-',
  //   statsColor: 'error',
  // },
  // {
  //   title: 'پرداختی معوق',
  //   count: '7,800,000',
  //   stats: '5.0%+',
  //   statsColor: 'success',
  // },
  // {
  //   title: 'سایر مزایا',
  //   count: '450,000',
  //   stats: '0.8%+',
  //   statsColor: 'success',
  // },
  // {
  //   title: 'رتبه بندی',
  //   count: '4,500,000',
  //   stats: '4.1%+',
  //   statsColor: 'success',
  // },
]
</script>

<template>
  <VCard>
    <VCardItem class="pa-4 pb-0">
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

    <VCardText class="pa-4">
      <VList class="card-list">
        <VListItem v-for="payment in payments" :key="payment.title">
          <VListItemTitle>
            {{ payment.title }}
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div class="text-body-1">
                {{ payment.count }}
              </div>
              <div :class="`text-${payment.statsColor} text-sm`">
                {{ payment.stats }}
              </div>
            </div>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1rem;
}
</style>
