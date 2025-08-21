<script setup>
const props = defineProps({
  getPayrollItemByLabel: {
    type: Function,
    required: true,
  },
})

const deductions = computed(() =>
  [
    {
      label: 'بیمه سهم کارمند',
      amount: props.getPayrollItemByLabel('بيمه سهم كارمند').amount,
    },
    {
      label: 'مالیات ماه',
      amount: props.getPayrollItemByLabel('ماليات ماه').amount,
    },
    {
      label: 'بیمه تکمیلی',
      amount: props.getPayrollItemByLabel('بيمه تكميلی').amount,
    },
    {
      label: 'کسر جاری کارکنان',
      amount: props.getPayrollItemByLabel('كسر جاری كاركنان').amount,
    },
    {
      label: 'وام ضروری',
      amount: props.getPayrollItemByLabel('وام ضروری').amount,
    },
    {
      label: 'وام ضروری 3',
      amount: props.getPayrollItemByLabel('وام ضروری 3').amount,
    },
    {
      label: 'خرید کارکنان 1',
      amount: props.getPayrollItemByLabel('خريد كاركنان 1').amount,
    },
    {
      label: 'خرید کارکنان 2',
      amount: props.getPayrollItemByLabel('خريد كاركنان 2').amount,
    },

    {
      label: 'خرید فروردین آریا',
      amount: props.getPayrollItemByLabel('خريد فروردين آريا').amount,
    },
    {
      label: 'خرید اردیبهشت آریا',
      amount: props.getPayrollItemByLabel('خريد اريبهشت آريا').amount,
    },
    {
      label: 'خرید خرداد آریا',
      amount: props.getPayrollItemByLabel('خريد خرداد آريا').amount,
    },
    {
      label: 'خرید تیر آریا',
      amount: props.getPayrollItemByLabel('خرید تیر آریا').amount,
    },
    {
      label: 'خرید مرداد آریا',
      amount: props.getPayrollItemByLabel('خريد مرداد آريا').amount,
    },
    {
      label: 'خرید شهریور آریا',
      amount: props.getPayrollItemByLabel('خريد شهريور آريا').amount,
    },
    {
      label: 'خرید مهر آریا',
      amount: props.getPayrollItemByLabel('خريد مهر آريا').amount,
    },
    {
      label: 'خرید آبان آریا',
      amount: props.getPayrollItemByLabel('خريد آبان آريا').amount,
    },
    {
      label: 'خرید آذر آریا',
      amount: props.getPayrollItemByLabel('خريد آذر آريا').amount,
    },
    {
      label: 'خرید دی آریا',
      amount: props.getPayrollItemByLabel('خريد دی آريا').amount,
    },
    {
      label: 'خرید بهمن آریا',
      amount: props.getPayrollItemByLabel('خريد بهمن آريا').amount,
    },
    {
      label: 'خرید فروردین چادرملو',
      amount: props.getPayrollItemByLabel('خريد فروردين چادرملو').amount,
    },
    {
      label: 'خرید اردیبهشت چادرملو',
      amount: props.getPayrollItemByLabel('خريد ارديبهشت چادرملو').amount,
    },
    {
      label: 'خرید خرداد چادرملو',
      amount: props.getPayrollItemByLabel('خريد خرداد چادرملو').amount,
    },
    {
      label: 'خرید تیر چادرملو',
      amount: props.getPayrollItemByLabel('خريد تير چادرملو').amount,
    },
    {
      label: 'خرید مرداد چادرملو',
      amount: props.getPayrollItemByLabel('خريد مرداد چادرملو').amount,
    },
    {
      label: 'خرید شهریور چادرملو',
      amount: props.getPayrollItemByLabel('خريد شهريور چادرملو').amount,
    },
    {
      label: 'خرید مهر چادرملو',
      amount: props.getPayrollItemByLabel('خريد مهر چادرملو').amount,
    },
    {
      label: 'خرید آبان چادرملو',
      amount: props.getPayrollItemByLabel('خريد آبان چادرملو').amount,
    },
    {
      label: 'خرید آذر چادرملو',
      amount: props.getPayrollItemByLabel('خريد آذر چادرملو').amount,
    },
    {
      label: 'خرید دی چادرملو',
      amount: props.getPayrollItemByLabel('خريد دي چادرملو').amount,
    },
    {
      label: 'خرید بهمن چادرملو',
      amount: props.getPayrollItemByLabel('خريد بهمن چادرملو').amount,
    },
    {
      label: 'فروردین ابوطالبی',
      amount: props.getPayrollItemByLabel('خريد فروردين ابوطالبی').amount,
    },
    {
      label: 'اردیبهشت ابوطالبی',
      amount: props.getPayrollItemByLabel('خريد ارديبهشت ابوطالبی').amount,
    },
    {
      label: 'خرداد ابوطالبی',
      amount: props.getPayrollItemByLabel('خريد خرداد ابوطالبی').amount,
    },
    {
      label: 'تیر ابوطالبی',
      amount: props.getPayrollItemByLabel('خريد تير ابوطالبی').amount,
    },
    {
      label: 'مرداد ابوطالبی',
      amount: props.getPayrollItemByLabel('خريد مرداد ابوطالبی').amount,
    },
    {
      label: 'شهریور ابوطالبی',
      amount: props.getPayrollItemByLabel('خريد شهريور ابوطالبی').amount,
    },
    {
      label: 'مهر ابوطالبی',
      amount: props.getPayrollItemByLabel('خريد مهر ابوطالبی').amount,
    },
    {
      label: 'آبان ابوطالبی',
      amount: props.getPayrollItemByLabel('خريد آبان ابوطالبی').amount,
    },
    {
      label: 'آذر ابوطالبی',
      amount: props.getPayrollItemByLabel('خريد آذر ابوطالبی').amount,
    },
    {
      label: 'دی ابوطالبی',
      amount: props.getPayrollItemByLabel('خريد دي ابوطالبی').amount,
    },
    {
      label: 'بهمن ابوطالبی',
      amount: props.getPayrollItemByLabel('خريد بهمن ابوطالبی').amount,
    },
    {
      label: 'خرید فروردین شیشه',
      amount: props.getPayrollItemByLabel('خريد فروردين شیشه').amount,
    },
    {
      label: 'خرید اردیبهشت شیشه',
      amount: props.getPayrollItemByLabel('خرید اردیبهشت شیشه').amount,
    },
    {
      label: 'خرید خرداد شیشه',
      amount: props.getPayrollItemByLabel('خريد خرداد شیشه').amount,
    },
    {
      label: 'خرید تیر شیشه',
      amount: props.getPayrollItemByLabel('خريد تير شیشه').amount,
    },
    {
      label: 'خرید مرداد شیشه',
      amount: props.getPayrollItemByLabel('خريد مرداد شیشه').amount,
    },
    {
      label: 'خرید شهریور شیشه',
      amount: props.getPayrollItemByLabel('خريد شهريور شیشه').amount,
    },
    {
      label: 'خرید مهر شیشه',
      amount: props.getPayrollItemByLabel('خريد مهر شیشه').amount,
    },
    {
      label: 'خرید آبان شیشه',
      amount: props.getPayrollItemByLabel('خريد آبان شیشه').amount,
    },
    {
      label: 'خرید آذر شیشه',
      amount: props.getPayrollItemByLabel('خريد آذر شیشه').amount,
    },
    {
      label: 'خرید دی شیشه',
      amount: props.getPayrollItemByLabel('خريد دي شیشه').amount,
    },
    {
      label: 'خرید بهمن شیشه',
      amount: props.getPayrollItemByLabel('خريد بهمن شیشه').amount,
    },
    {
      label: 'خرید فروردین سالار',
      amount: props.getPayrollItemByLabel('خرید فروردین سالار').amount,
    },
    {
      label: 'خرید اردیبهشت سالار',
      amount: props.getPayrollItemByLabel('خرید اردیبهشت سالار').amount,
    },
    {
      label: 'خرید خرداد سالار',
      amount: props.getPayrollItemByLabel('خريد خرداد سالار').amount,
    },
    {
      label: 'خرید تیر سالار',
      amount: props.getPayrollItemByLabel('خريد تير سالار').amount,
    },
    {
      label: 'خرید مرداد سالار',
      amount: props.getPayrollItemByLabel('خريد مرداد سالار').amount,
    },
    {
      label: 'خرید شهریور سالار',
      amount: props.getPayrollItemByLabel('خريد شهريور سالار').amount,
    },
    {
      label: 'خرید مهر سالار',
      amount: props.getPayrollItemByLabel('خريد مهر سالار').amount,
    },
    {
      label: 'خرید آبان سالار',
      amount: props.getPayrollItemByLabel('خريد آبان سالار').amount,
    },
    {
      label: 'خرید آذر سالار',
      amount: props.getPayrollItemByLabel('خريد آذر سالار').amount,
    },
    {
      label: 'خرید دی سالار',
      amount: props.getPayrollItemByLabel('خريد دي سالار').amount,
    },
    {
      label: 'خرید بهمن سالار',
      amount: props.getPayrollItemByLabel('خريد بهمن سالار').amount,
    },
  ].filter(deduction => deduction.amount),
)

const total = computed(() => {
  return { amount: props.getPayrollItemByLabel('جمع کسورات').amount, percentChange: 5.0 }
})
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
            {{ total.amount }}
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
