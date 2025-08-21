<script setup>
const props = defineProps({
  getAmount: {
    type: Function,
    required: true,
  },
})

const deductions = computed(() =>
  [
    {
      label: 'بیمه سهم کارمند',
      amount: props.getAmount('بيمه سهم كارمند'),
    },
    {
      label: 'مالیات ماه',
      amount: props.getAmount('ماليات ماه'),
    },
    {
      label: 'بیمه تکمیلی',
      amount: props.getAmount('بيمه تكميلی'),
    },
    {
      label: 'کسر جاری کارکنان',
      amount: props.getAmount('كسر جاری كاركنان'),
    },
    {
      label: 'وام ضروری',
      amount: props.getAmount('وام ضروری'),
    },
    {
      label: 'وام ضروری 3',
      amount: props.getAmount('وام ضروری 3'),
    },
    {
      label: 'خرید کارکنان 1',
      amount: props.getAmount('خريد كاركنان 1'),
    },
    {
      label: 'خرید کارکنان 2',
      amount: props.getAmount('خريد كاركنان 2'),
    },

    {
      label: 'خرید فروردین آریا',
      amount: props.getAmount('خريد فروردين آريا'),
    },
    {
      label: 'خرید اردیبهشت آریا',
      amount: props.getAmount('خريد اريبهشت آريا'),
    },
    {
      label: 'خرید خرداد آریا',
      amount: props.getAmount('خريد خرداد آريا'),
    },
    {
      label: 'خرید تیر آریا',
      amount: props.getAmount('خرید تیر آریا'),
    },
    {
      label: 'خرید مرداد آریا',
      amount: props.getAmount('خريد مرداد آريا'),
    },
    {
      label: 'خرید شهریور آریا',
      amount: props.getAmount('خريد شهريور آريا'),
    },
    {
      label: 'خرید مهر آریا',
      amount: props.getAmount('خريد مهر آريا'),
    },
    {
      label: 'خرید آبان آریا',
      amount: props.getAmount('خريد آبان آريا'),
    },
    {
      label: 'خرید آذر آریا',
      amount: props.getAmount('خريد آذر آريا'),
    },
    {
      label: 'خرید دی آریا',
      amount: props.getAmount('خريد دی آريا'),
    },
    {
      label: 'خرید بهمن آریا',
      amount: props.getAmount('خريد بهمن آريا'),
    },
    {
      label: 'خرید فروردین چادرملو',
      amount: props.getAmount('خريد فروردين چادرملو'),
    },
    {
      label: 'خرید اردیبهشت چادرملو',
      amount: props.getAmount('خريد ارديبهشت چادرملو'),
    },
    {
      label: 'خرید خرداد چادرملو',
      amount: props.getAmount('خريد خرداد چادرملو'),
    },
    {
      label: 'خرید تیر چادرملو',
      amount: props.getAmount('خريد تير چادرملو'),
    },
    {
      label: 'خرید مرداد چادرملو',
      amount: props.getAmount('خريد مرداد چادرملو'),
    },
    {
      label: 'خرید شهریور چادرملو',
      amount: props.getAmount('خريد شهريور چادرملو'),
    },
    {
      label: 'خرید مهر چادرملو',
      amount: props.getAmount('خريد مهر چادرملو'),
    },
    {
      label: 'خرید آبان چادرملو',
      amount: props.getAmount('خريد آبان چادرملو'),
    },
    {
      label: 'خرید آذر چادرملو',
      amount: props.getAmount('خريد آذر چادرملو'),
    },
    {
      label: 'خرید دی چادرملو',
      amount: props.getAmount('خريد دي چادرملو'),
    },
    {
      label: 'خرید بهمن چادرملو',
      amount: props.getAmount('خريد بهمن چادرملو'),
    },
    {
      label: 'فروردین ابوطالبی',
      amount: props.getAmount('خريد فروردين ابوطالبی'),
    },
    {
      label: 'اردیبهشت ابوطالبی',
      amount: props.getAmount('خريد ارديبهشت ابوطالبی'),
    },
    {
      label: 'خرداد ابوطالبی',
      amount: props.getAmount('خريد خرداد ابوطالبی'),
    },
    {
      label: 'تیر ابوطالبی',
      amount: props.getAmount('خريد تير ابوطالبی'),
    },
    {
      label: 'مرداد ابوطالبی',
      amount: props.getAmount('خريد مرداد ابوطالبی'),
    },
    {
      label: 'شهریور ابوطالبی',
      amount: props.getAmount('خريد شهريور ابوطالبی'),
    },
    {
      label: 'مهر ابوطالبی',
      amount: props.getAmount('خريد مهر ابوطالبی'),
    },
    {
      label: 'آبان ابوطالبی',
      amount: props.getAmount('خريد آبان ابوطالبی'),
    },
    {
      label: 'آذر ابوطالبی',
      amount: props.getAmount('خريد آذر ابوطالبی'),
    },
    {
      label: 'دی ابوطالبی',
      amount: props.getAmount('خريد دي ابوطالبی'),
    },
    {
      label: 'بهمن ابوطالبی',
      amount: props.getAmount('خريد بهمن ابوطالبی'),
    },
    {
      label: 'خرید فروردین شیشه',
      amount: props.getAmount('خريد فروردين شیشه'),
    },
    {
      label: 'خرید اردیبهشت شیشه',
      amount: props.getAmount('خرید اردیبهشت شیشه'),
    },
    {
      label: 'خرید خرداد شیشه',
      amount: props.getAmount('خريد خرداد شیشه'),
    },
    {
      label: 'خرید تیر شیشه',
      amount: props.getAmount('خريد تير شیشه'),
    },
    {
      label: 'خرید مرداد شیشه',
      amount: props.getAmount('خريد مرداد شیشه'),
    },
    {
      label: 'خرید شهریور شیشه',
      amount: props.getAmount('خريد شهريور شیشه'),
    },
    {
      label: 'خرید مهر شیشه',
      amount: props.getAmount('خريد مهر شیشه'),
    },
    {
      label: 'خرید آبان شیشه',
      amount: props.getAmount('خريد آبان شیشه'),
    },
    {
      label: 'خرید آذر شیشه',
      amount: props.getAmount('خريد آذر شیشه'),
    },
    {
      label: 'خرید دی شیشه',
      amount: props.getAmount('خريد دي شیشه'),
    },
    {
      label: 'خرید بهمن شیشه',
      amount: props.getAmount('خريد بهمن شیشه'),
    },
    {
      label: 'خرید فروردین سالار',
      amount: props.getAmount('خرید فروردین سالار'),
    },
    {
      label: 'خرید اردیبهشت سالار',
      amount: props.getAmount('خرید اردیبهشت سالار'),
    },
    {
      label: 'خرید خرداد سالار',
      amount: props.getAmount('خريد خرداد سالار'),
    },
    {
      label: 'خرید تیر سالار',
      amount: props.getAmount('خريد تير سالار'),
    },
    {
      label: 'خرید مرداد سالار',
      amount: props.getAmount('خريد مرداد سالار'),
    },
    {
      label: 'خرید شهریور سالار',
      amount: props.getAmount('خريد شهريور سالار'),
    },
    {
      label: 'خرید مهر سالار',
      amount: props.getAmount('خريد مهر سالار'),
    },
    {
      label: 'خرید آبان سالار',
      amount: props.getAmount('خريد آبان سالار'),
    },
    {
      label: 'خرید آذر سالار',
      amount: props.getAmount('خريد آذر سالار'),
    },
    {
      label: 'خرید دی سالار',
      amount: props.getAmount('خريد دي سالار'),
    },
    {
      label: 'خرید بهمن سالار',
      amount: props.getAmount('خريد بهمن سالار'),
    },
  ].filter(deduction => deduction.amount),
)

const totalDeductions = computed(() =>
  props.getAmount('جمع کسورات'),
)
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
            {{ totalDeductions }}
          </h6>
          <div class="percent-change">
            <div :class="`d-flex align-center ${totalDeductions > 0 ? 'text-error' : 'text-success'}`">
              <div class="text-sm">
                {{ Math.abs(totalDeductions) }}%
              </div>

              <VIcon
                :icon="totalDeductions > 0 ? 'tabler-chevron-up' : 'tabler-chevron-down'"
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
