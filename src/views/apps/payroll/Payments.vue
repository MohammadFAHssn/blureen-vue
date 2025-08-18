<script setup>
const payments = [
  {
    label: 'حقوق پایه',
    amount: '35,485,962',
    percentChange: 4.2,
  },
  {
    label: 'حق اولاد',
    amount: '1,523,489',
    percentChange: 1.8,
  },
  {
    label: 'حق مسکن',
    amount: '9,123,456',
    percentChange: -0.5,
  },
  {
    label: 'خواربار',
    amount: '1,100,000',
    percentChange: 2.3,
  },
  {
    label: 'حق تأهل',
    amount: '5,000,000',
    percentChange: 3.1,
  },
  {
    label: 'نوبت کاری 10%',
    amount: '258,321',
    percentChange: -1.1,
  },
  {
    label: 'نوبت کاری 15%',
    amount: '387,481',
    percentChange: 1.6,
  },
  {
    label: 'بن کارگری',
    amount: '1,250,000',
    percentChange: 0.9,
  },
  {
    label: 'پایه سنوات سالیانه',
    amount: '750,000',
    percentChange: 0.7,
  },
  {
    label: 'مزد سنوات',
    amount: '850,000',
    percentChange: -1.2,
  },
  {
    label: 'حق پست',
    amount: '1,800,000',
    percentChange: 2.1,
  },
  {
    label: 'ماندگاری پست',
    amount: '450,000',
    percentChange: 0.4,
  },
  {
    label: 'ماندگاری محیط کار (سختی کار)',
    amount: '1,000,000,000',
    percentChange: 99.99,
  },
  {
    label: 'محیط کار (سختی کار)',
    amount: '2,100,000',
    percentChange: 2.5,
  },
  {
    label: 'پاداش مدیریت',
    amount: '15,000,000',
    percentChange: 10.0,
  },
  {
    label: 'ماندگاری پاداش مدیریت',
    amount: '3,750,000',
    percentChange: 2.5,
  },
  {
    label: 'سایر مزایا',
    amount: '450,000',
    percentChange: 0.8,
  },
  {
    label: 'رتبه‌بندی',
    amount: '4,500,000',
    percentChange: 4.1,
  },
  {
    label: 'حق مأموریت',
    amount: '3,200,000',
    percentChange: -3.0,
  },
  {
    label: 'پرداختی معوق',
    amount: '7,800,000',
    percentChange: 5.0,
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
      <VCardTitle>پایه پرداخت‌ها</VCardTitle>
      <VCardSubtitle> ریال </VCardSubtitle>
    </VCardItem>

    <VDivider />

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
              <div
                :class="`d-flex align-center ${
                  payment.percentChange > 0 ? 'text-teal' : 'text-error'
                }`"
              >
                <div class="text-sm">
                  {{ Math.abs(payment.percentChange) }}%
                </div>

                <VIcon
                  :icon="
                    payment.percentChange > 0
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
      <VCard variant="tonal" color="teal">
        <VCardText class="pa-3 d-flex justify-space-between">
          <div class="v-card-title pa-0">
            جمع پایه پرداخت‌ها
          </div>

          <div class="d-flex align-center justify-space-between">
            <h6 class="text-h6 text-center ml-4">
              12,500,000
            </h6>
            <div
              :class="`d-flex align-center ${
                10 > 0 ? 'text-teal' : 'text-error'
              }`"
            >
              <div class="text-sm">
                {{ Math.abs(10) }}%
              </div>

              <VIcon
                :icon="10 > 0 ? 'tabler-chevron-up' : 'tabler-chevron-down'"
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
.payments-card {
  border-block: 2px solid rgb(var(--v-theme-teal));
}
</style>
