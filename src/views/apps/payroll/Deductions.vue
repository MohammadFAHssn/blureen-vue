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
    label: 'بیمه تکمیلی',
    amount: '2,891-',
  },
  {
    label: 'کسر جاری کارکنان',
    amount: '187,234-',
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
    label: 'خرید کارکنان 1',
    amount: '623,789-',
  },
  {
    label: 'خرید کارکنان 2',
    amount: '298,543-',
  },

  {
    label: 'خرید فروردین آریا',
    amount: '112,789-',
  },
  // {
  //   label: 'خرید اردیبهشت آریا',
  //   amount: '89,456-',
  // },
  // {
  //   label: 'خرید خرداد آریا',
  //   amount: '167,234-',
  // },
  // {
  //   label: 'خرید تیر آریا',
  //   amount: '94,567-',
  // },
  // {
  //   label: 'خرید مرداد آریا',
  //   amount: '134,890-',
  // },
  // {
  //   label: 'خرید شهریور آریا',
  //   amount: '78,912-',
  // },
  // {
  //   label: 'خرید مهر آریا',
  //   amount: '156,345-',
  // },
  // {
  //   label: 'خرید آبان آریا',
  //   amount: '123,567-',
  // },
  // {
  //   label: 'خرید آذر آریا',
  //   amount: '91,234-',
  // },
  // {
  //   label: 'خرید دی آریا',
  //   amount: '178,456-',
  // },
  // {
  //   label: 'خرید بهمن آریا',
  //   amount: '87,789-',
  // },
  // {
  //   label: 'خرید فروردین چادرملو',
  //   amount: '145,123-',
  // },
  // {
  //   label: 'خرید اردیبهشت چادرملو',
  //   amount: '76,890-',
  // },
  // {
  //   label: 'خرید خرداد چادرملو',
  //   amount: '198,234-',
  // },
  // {
  //   label: 'خرید تیر چادرملو',
  //   amount: '112,567-',
  // },
  // {
  //   label: 'خرید مرداد چادرملو',
  //   amount: '89,345-',
  // },
  // {
  //   label: 'خرید شهریور چادرملو',
  //   amount: '167,789-',
  // },
  // {
  //   label: 'خرید مهر چادرملو',
  //   amount: '94,123-',
  // },
  // {
  //   label: 'خرید آبان چادرملو',
  //   amount: '134,456-',
  // },
  // {
  //   label: 'خرید آذر چادرملو',
  //   amount: '78,234-',
  // },
  // {
  //   label: 'خرید دی چادرملو',
  //   amount: '156,890-',
  // },
  // {
  //   label: 'خرید بهمن چادرملو',
  //   amount: '123,345-',
  // },
  // {
  //   label: 'فروردین ابوطالبی',
  //   amount: '134,567-',
  // },
  // {
  //   label: 'اردیبهشت ابوطالبی',
  //   amount: '134,567-',
  // },
  // {
  //   label: 'خرداد ابوطالبی',
  //   amount: '89,234-',
  // },
  // {
  //   label: 'تیر ابوطالبی',
  //   amount: '156,789-',
  // },
  // {
  //   label: 'مرداد ابوطالبی',
  //   amount: '92,345-',
  // },
  // {
  //   label: 'شهریور ابوطالبی',
  //   amount: '178,912-',
  // },
  // {
  //   label: 'مهر ابوطالبی',
  //   amount: '123,678-',
  // },
  // {
  //   label: 'آبان ابوطالبی',
  //   amount: '87,543-',
  // },
  // {
  //   label: 'آذر ابوطالبی',
  //   amount: '145,892-',
  // },
  // {
  //   label: 'دی ابوطالبی',
  //   amount: '76,234-',
  // },
  // {
  //   label: 'بهمن ابوطالبی',
  //   amount: '198,567-',
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
  //   label: 'خرید فروردین سالار',
  //   amount: '78,890-',
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

    <VDivider />

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

    <VCardText>
      <VCard variant="tonal" color="error">
        <VCardText class="pa-3 sum-of-amounts-card">
          <div class="label v-card-title pa-0 text-wrap">
            جمع کسورات
          </div>

          <h6 class="text-h6 amount">
            12,500,000
          </h6>
          <div class="percent-change">
            <div :class="`d-flex align-center ${3.3 > 0 ? 'text-error' : 'text-success'}`">
              <div class="text-sm">
                {{ Math.abs(3.3) }}%
              </div>

              <VIcon
                :icon="
                  3.3 > 0
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
.deductions-card {
  border-block: 2px solid rgb(var(--v-theme-error));
}

.sum-of-amounts-card {
  display: grid;
  grid-gap: 0;
  grid-template-columns: 1fr auto;
  grid-template-rows: repeat(2, 1fr);

  .label {
    grid-area: 1 / 1 / 2 / 2;
  }

  .amount {
    grid-area: 2 / 1 / 3 / 2;
  }

  .percent-change {
    grid-area: 1 / 2 / 3 / 3;
    place-self: center center;
  }

  @media (min-width: 1700px) {
    grid-gap: 0 1rem;
    grid-template-columns: 1fr auto auto;
    grid-template-rows: 1fr;

    .label {
      grid-area: 1 / 1 / 2 / 2;
    }

    .amount {
      grid-area: 1 / 2 / 2 / 3;
    }

    .percent-change {
      grid-area: 1 / 3 / 2 / 4;
    }
  }
}
</style>
