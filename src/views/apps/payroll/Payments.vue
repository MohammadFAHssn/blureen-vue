<script setup>
const payments = [
  {
    title: 'حقوق پایه',
    count: '25,000,000',
    stats: '0.3%',
    statsColor: 'success',
  },
  {
    title: 'حق مسکن',
    count: '8,734',
    stats: '2.1%',
    statsColor: 'success',
  },
  {
    title: 'خواربار',
    count: '967',
    stats: '1.4%',
    statsColor: 'error',
  },
  {
    title: 'حق تأهل',
    count: '345',
    stats: '8.5%',
    statsColor: 'success',
  },
  {
    title: 'بن کارگری',
    count: '10',
    stats: '1.5%',
    statsColor: 'error',
  },
  {
    title: 'پایه سنوات',
    count: '86',
    stats: '0.8%',
    statsColor: 'success',
  },
]
</script>

<template>
  <VCard>
    <VCardItem class="pa-4 pb-0">
      <VCardTitle>پرداخت‌ها</VCardTitle>
      <VCardSubtitle>
        ریال
      </VCardSubtitle>
    </VCardItem>

    <VCardText class="pa-4">
      <VList class="card-list">
        <VListItem
          v-for="payment in payments"
          :key="payment.title"
        >
          <VListItemTitle>
            {{ payment.title }}
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div class="text-body-1">
                {{ payment.count }}
              </div>
              <div :class="`text-${payment.statsColor} text-sm` ">
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
