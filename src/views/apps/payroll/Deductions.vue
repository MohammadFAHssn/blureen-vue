<script setup>
const deductions = [
  {
    title: 'بیمه سهم کارمند',
    count: '347,821',
  },
  {
    title: 'مالیات ماه',
    count: '1,892,456',
  },
  {
    title: 'خرید کارکنان 1',
    count: '623,789',
  },
  {
    title: 'خرید کارکنان 2',
    count: '298,543',
  },
  {
    title: 'کسر جاری کارکنان',
    count: '187,234',
  },
  {
    title: 'بیمه تکمیلی',
    count: '2,891',
  },
  {
    title: 'وام ضروری',
    count: '456,789',
  },
  {
    title: 'وام ضروری 3',
    count: '312,567',
  },
  {
    title: 'بیمه تکمیلی فروردین',
    count: '1,834',
  },
  // {
  //   title: 'بن کارت خرید اردیبهشت ابوطالبی',
  //   count: '134,567',
  // },
  // {
  //   title: 'بن کارت خرید خرداد ابوطالبی',
  //   count: '89,234',
  // },
  // {
  //   title: 'بن کارت خرید تیر ابوطالبی',
  //   count: '156,789',
  // },
  // {
  //   title: 'بن کارت خرید مرداد ابوطالبی',
  //   count: '92,345',
  // },
  // {
  //   title: 'بن کارت خرید شهریور ابوطالبی',
  //   count: '178,912',
  // },
  // {
  //   title: 'بن کارت خرید مهر ابوطالبی',
  //   count: '123,678',
  // },
  // {
  //   title: 'بن کارت خرید آبان ابوطالبی',
  //   count: '87,543',
  // },
  // {
  //   title: 'بن کارت خرید آذر ابوطالبی',
  //   count: '145,892',
  // },
  // {
  //   title: 'بن کارت خرید دی ابوطالبی',
  //   count: '76,234',
  // },
  // {
  //   title: 'بن کارت خرید بهمن ابوطالبی',
  //   count: '198,567',
  // },
  // {
  //   title: 'بن کارت خرید فروردین آریا',
  //   count: '112,789',
  // },
  // {
  //   title: 'بن کارت خرید اردیبهشت آریا',
  //   count: '89,456',
  // },
  // {
  //   title: 'بن کارت خرید خرداد آریا',
  //   count: '167,234',
  // },
  // {
  //   title: 'بن کارت خرید تیر آریا',
  //   count: '94,567',
  // },
  // {
  //   title: 'بن کارت خرید مرداد آریا',
  //   count: '134,890',
  // },
  // {
  //   title: 'بن کارت خرید شهریور آریا',
  //   count: '78,912',
  // },
  // {
  //   title: 'بن کارت خرید مهر آریا',
  //   count: '156,345',
  // },
  // {
  //   title: 'بن کارت خرید آبان آریا',
  //   count: '123,567',
  // },
  // {
  //   title: 'بن کارت خرید آذر آریا',
  //   count: '91,234',
  // },
  // {
  //   title: 'بن کارت خرید دی آریا',
  //   count: '178,456',
  // },
  // {
  //   title: 'بن کارت خرید بهمن آریا',
  //   count: '87,789',
  // },
  // {
  //   title: 'بن کارت خرید فروردین چادرملو',
  //   count: '145,123',
  // },
  // {
  //   title: 'بن کارت خرید اردیبهشت چادرملو',
  //   count: '76,890',
  // },
  // {
  //   title: 'بن کارت خرید خرداد چادرملو',
  //   count: '198,234',
  // },
  // {
  //   title: 'بن کارت خرید تیر چادرملو',
  //   count: '112,567',
  // },
  // {
  //   title: 'بن کارت خرید مرداد چادرملو',
  //   count: '89,345',
  // },
  // {
  //   title: 'بن کارت خرید شهریور چادرملو',
  //   count: '167,789',
  // },
  // {
  //   title: 'بن کارت خرید مهر چادرملو',
  //   count: '94,123',
  // },
  // {
  //   title: 'بن کارت خرید آبان چادرملو',
  //   count: '134,456',
  // },
  // {
  //   title: 'بن کارت خرید آذر چادرملو',
  //   count: '78,234',
  // },
  // {
  //   title: 'بن کارت خرید دی چادرملو',
  //   count: '156,890',
  // },
  // {
  //   title: 'بن کارت خرید بهمن چادرملو',
  //   count: '123,345',
  // },
  // {
  //   title: 'خرید فروردین شیشه',
  //   count: '91,567',
  // },
  // {
  //   title: 'خرید اردیبهشت شیشه',
  //   count: '178,789',
  // },
  // {
  //   title: 'خرید خرداد شیشه',
  //   count: '87,123',
  // },
  // {
  //   title: 'خرید تیر شیشه',
  //   count: '145,456',
  // },
  // {
  //   title: 'خرید مرداد شیشه',
  //   count: '76,234',
  // },
  // {
  //   title: 'خرید شهریور شیشه',
  //   count: '198,890',
  // },
  // {
  //   title: 'خرید مهر شیشه',
  //   count: '112,345',
  // },
  // {
  //   title: 'خرید آبان شیشه',
  //   count: '89,567',
  // },
  // {
  //   title: 'خرید آذر شیشه',
  //   count: '167,789',
  // },
  // {
  //   title: 'خرید دی شیشه',
  //   count: '94,123',
  // },
  // {
  //   title: 'خرید بهمن شیشه',
  //   count: '134,456',
  // },
  // {
  //   title: 'خرید اردیبهشت سالار',
  //   count: '78,890',
  // },
  // {
  //   title: 'خرید خرداد سالار',
  //   count: '156,234',
  // },
  // {
  //   title: 'خرید تیر سالار',
  //   count: '123,567',
  // },
  // {
  //   title: 'خرید مرداد سالار',
  //   count: '91,345',
  // },
  // {
  //   title: 'خرید شهریور سالار',
  //   count: '178,789',
  // },
  // {
  //   title: 'خرید مهر سالار',
  //   count: '87,123',
  // },
  // {
  //   title: 'خرید آبان سالار',
  //   count: '145,456',
  // },
  // {
  //   title: 'خرید آذر سالار',
  //   count: '76,890',
  // },
  // {
  //   title: 'خرید دی سالار',
  //   count: '198,234',
  // },
  // {
  //   title: 'خرید بهمن سالار',
  //   count: '112,567',
  // },
]
</script>

<template>
  <VCard class="deductions-card">
    <VCardItem class="pa-4 pb-0">
      <template #prepend>
        <VAvatar
          color="error"
          variant="tonal"
          rounded
          icon="tabler-cash-banknote-minus"
        />
      </template>
      <VCardTitle>کسورات</VCardTitle>
      <VCardSubtitle> ریال </VCardSubtitle>
    </VCardItem>

    <VCardText class="pa-4">
      <VList class="card-list">
        <VListItem v-for="deduction in deductions" :key="deduction.title">
          <VListItemTitle>
            {{ deduction.title }}
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div class="text-body-1">
                {{ deduction.count }}
              </div>
            </div>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
@use '@core/scss/base/mixins' as mixins;

.card-list {
  --v-card-list-gap: 1rem;
}

.deductions-card {
  border-block: 2px solid rgb(var(--v-theme-error));

  &:hover {
    border-block-width: 3px;
    margin-block: -1px;

    @include mixins.elevation(8);

    transition: all 0.1s ease-out;
  }
}
</style>
