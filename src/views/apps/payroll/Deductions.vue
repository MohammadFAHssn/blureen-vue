<script setup>
const deductions = [
  {
    label: 'بیمه سهم کارمند',
    amount: '347,821-',
  },
  {
    label: 'مالیات ماه',
    amount: '1,892,456-',
  },
  {
    label: 'خرید کارکنان 1',
    amount: '623,789-',
  },
  {
    label: 'خرید کارکنان 2',
    amount: '298,543-',
  },
  {
    label: 'کسر جاری کارکنان',
    amount: '187,234-',
  },
  {
    label: 'بیمه تکمیلی',
    amount: '2,891-',
  },
  {
    label: 'وام ضروری',
    amount: '456,789-',
  },
  {
    label: 'وام ضروری 3',
    amount: '312,567-',
  },
  {
    label: 'بیمه تکمیلی فروردین',
    amount: '1,834-',
  },
  // {
  //   label: 'بن کارت خرید اردیبهشت ابوطالبی',
  //   amount: '134,567-',
  // },
  // {
  //   label: 'بن کارت خرید خرداد ابوطالبی',
  //   amount: '89,234-',
  // },
  // {
  //   label: 'بن کارت خرید تیر ابوطالبی',
  //   amount: '156,789-',
  // },
  // {
  //   label: 'بن کارت خرید مرداد ابوطالبی',
  //   amount: '92,345-',
  // },
  // {
  //   label: 'بن کارت خرید شهریور ابوطالبی',
  //   amount: '178,912-',
  // },
  // {
  //   label: 'بن کارت خرید مهر ابوطالبی',
  //   amount: '123,678-',
  // },
  // {
  //   label: 'بن کارت خرید آبان ابوطالبی',
  //   amount: '87,543-',
  // },
  // {
  //   label: 'بن کارت خرید آذر ابوطالبی',
  //   amount: '145,892-',
  // },
  // {
  //   label: 'بن کارت خرید دی ابوطالبی',
  //   amount: '76,234-',
  // },
  // {
  //   label: 'بن کارت خرید بهمن ابوطالبی',
  //   amount: '198,567-',
  // },
  // {
  //   label: 'بن کارت خرید فروردین آریا',
  //   amount: '112,789-',
  // },
  // {
  //   label: 'بن کارت خرید اردیبهشت آریا',
  //   amount: '89,456-',
  // },
  // {
  //   label: 'بن کارت خرید خرداد آریا',
  //   amount: '167,234-',
  // },
  // {
  //   label: 'بن کارت خرید تیر آریا',
  //   amount: '94,567-',
  // },
  // {
  //   label: 'بن کارت خرید مرداد آریا',
  //   amount: '134,890-',
  // },
  // {
  //   label: 'بن کارت خرید شهریور آریا',
  //   amount: '78,912-',
  // },
  // {
  //   label: 'بن کارت خرید مهر آریا',
  //   amount: '156,345-',
  // },
  // {
  //   label: 'بن کارت خرید آبان آریا',
  //   amount: '123,567-',
  // },
  // {
  //   label: 'بن کارت خرید آذر آریا',
  //   amount: '91,234-',
  // },
  // {
  //   label: 'بن کارت خرید دی آریا',
  //   amount: '178,456-',
  // },
  // {
  //   label: 'بن کارت خرید بهمن آریا',
  //   amount: '87,789-',
  // },
  // {
  //   label: 'بن کارت خرید فروردین چادرملو',
  //   amount: '145,123-',
  // },
  // {
  //   label: 'بن کارت خرید اردیبهشت چادرملو',
  //   amount: '76,890-',
  // },
  // {
  //   label: 'بن کارت خرید خرداد چادرملو',
  //   amount: '198,234-',
  // },
  // {
  //   label: 'بن کارت خرید تیر چادرملو',
  //   amount: '112,567-',
  // },
  // {
  //   label: 'بن کارت خرید مرداد چادرملو',
  //   amount: '89,345-',
  // },
  // {
  //   label: 'بن کارت خرید شهریور چادرملو',
  //   amount: '167,789-',
  // },
  // {
  //   label: 'بن کارت خرید مهر چادرملو',
  //   amount: '94,123-',
  // },
  // {
  //   label: 'بن کارت خرید آبان چادرملو',
  //   amount: '134,456-',
  // },
  // {
  //   label: 'بن کارت خرید آذر چادرملو',
  //   amount: '78,234-',
  // },
  // {
  //   label: 'بن کارت خرید دی چادرملو',
  //   amount: '156,890-',
  // },
  // {
  //   label: 'بن کارت خرید بهمن چادرملو',
  //   amount: '123,345-',
  // },
  // {
  //   label: 'خرید فروردین شیشه',
  //   amount: '91,567-',
  // },
  // {
  //   label: 'خرید اردیبهشت شیشه',
  //   amount: '178,789-',
  // },
  // {
  //   label: 'خرید خرداد شیشه',
  //   amount: '87,123-',
  // },
  // {
  //   label: 'خرید تیر شیشه',
  //   amount: '145,456-',
  // },
  // {
  //   label: 'خرید مرداد شیشه',
  //   amount: '76,234-',
  // },
  // {
  //   label: 'خرید شهریور شیشه',
  //   amount: '198,890-',
  // },
  // {
  //   label: 'خرید مهر شیشه',
  //   amount: '112,345-',
  // },
  // {
  //   label: 'خرید آبان شیشه',
  //   amount: '89,567-',
  // },
  // {
  //   label: 'خرید آذر شیشه',
  //   amount: '167,789-',
  // },
  // {
  //   label: 'خرید دی شیشه',
  //   amount: '94,123-',
  // },
  // {
  //   label: 'خرید بهمن شیشه',
  //   amount: '134,456-',
  // },
  // {
  //   label: 'خرید اردیبهشت سالار',
  //   amount: '78,890-',
  // },
  // {
  //   label: 'خرید خرداد سالار',
  //   amount: '156,234-',
  // },
  // {
  //   label: 'خرید تیر سالار',
  //   amount: '123,567-',
  // },
  // {
  //   label: 'خرید مرداد سالار',
  //   amount: '91,345-',
  // },
  // {
  //   label: 'خرید شهریور سالار',
  //   amount: '178,789-',
  // },
  // {
  //   label: 'خرید مهر سالار',
  //   amount: '87,123-',
  // },
  // {
  //   label: 'خرید آبان سالار',
  //   amount: '145,456-',
  // },
  // {
  //   label: 'خرید آذر سالار',
  //   amount: '76,890-',
  // },
  // {
  //   label: 'خرید دی سالار',
  //   amount: '198,234-',
  // },
  // {
  //   label: 'خرید بهمن سالار',
  //   amount: '112,567-',
  // },
]
</script>

<template>
  <VCard class="deductions-card">
    <VCardItem class="pa-3">
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

    <VCardText class="pa-3 pt-0">
      <VList>
        <VListItem
          v-for="deduction in deductions"
          :key="deduction.label"
          class="pa-2"
        >
          <VListItemTitle class="text-wrap">
            {{ deduction.label }}
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div class="text-body-1">
                {{ deduction.amount }}
              </div>
            </div>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.deductions-card {
  border-block: 2px solid rgb(var(--v-theme-error));
}
</style>
