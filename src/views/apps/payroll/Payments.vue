<script setup>
const props = defineProps({
  getAmount: {
    type: Function,
    required: true,
  },
})

const payments = computed(() =>
  [
    {
      label: 'حقوق پایه',
      amount: props.getAmount('حقوق پايه'),
      percentChange: 4.2,
    },
    {
      label: 'حق اولاد',
      amount: props.getAmount('حق اولاد'),
      percentChange: 1.8,
    },
    {
      label: 'حق مسکن',
      amount: props.getAmount('حق مسكن'),
      percentChange: -0.5,
    },
    {
      label: 'خواربار',
      amount: props.getAmount('خواربار'),
      percentChange: 2.3,
    },
    {
      label: 'حق تأهل',
      amount: props.getAmount('حق تاهل'),
      percentChange: 3.1,
    },
    {
      label: 'نوبت کاری 10%',
      amount: props.getAmount('نوبتكاری 10%'),
      percentChange: -1.1,
    },
    {
      label: 'نوبت کاری 15%',
      amount: props.getAmount('نوبتكاری 15%'),
      percentChange: 1.6,
    },
    {
      label: 'بن کارگری',
      amount: props.getAmount('بن كارگری'),
      percentChange: 0.9,
    },
    {
      label: 'پایه سنوات سالیانه',
      amount: props.getAmount('پايه سنوات ساليانه'),
      percentChange: 0.7,
    },
    {
      label: 'مزد سنوات',
      amount: props.getAmount('مزد سنوات'),
      percentChange: -1.2,
    },
    {
      label: 'حق پست',
      amount: props.getAmount('حق پست'),
      percentChange: 2.1,
    },
    {
      label: 'ماندگاری پست',
      amount: props.getAmount('ماندگاری پست'),
      percentChange: 0.4,
    },
    {
      label: 'ماندگاری محیط کار (سختی کار)',
      amount: props.getAmount('ماندگاری محيط كار(سختی كار)'),
      percentChange: 99.99,
    },
    {
      label: 'محیط کار (سختی کار)',
      amount: props.getAmount('محيط كار(سختی كار)'),
      percentChange: 2.5,
    },
    {
      label: 'پاداش مدیریت',
      amount: props.getAmount('پاداش مدیریت'),
      percentChange: 10.0,
    },
    {
      label: 'ماندگاری پاداش مدیریت',
      amount: props.getAmount('ماندگاری پاداش مدیریت'),
      percentChange: 2.5,
    },
    {
      label: 'سایر مزایا',
      amount: props.getAmount('ساير مزايا'),
      percentChange: 0.8,
    },
    {
      label: 'رتبه‌بندی',
      amount: props.getAmount('رتبه بندی'),
      percentChange: 4.1,
    },
    {
      label: 'حق مأموریت',
      amount: props.getAmount('حق ماموريت'),
      percentChange: -3.0,
    },
    {
      label: 'پرداختی معوق',
      amount: props.getAmount('پرداختی معوق'),
      percentChange: 5.0,
    },
  ].filter(payment => payment.amount),
)

const total = computed(() => {
  return {
    amount: props.getAmount('جمع ناخالص پرداختی'),
    percentChange: 5.0,
  }
},
)
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
        <VCardText class="pa-3 sum-of-amounts-card">
          <div class="label v-card-title pa-0 text-wrap">
            جمع پایه‌ پرداخت‌ها
          </div>

          <h6 class="text-h6 amount">
            {{ total.amount }}
          </h6>
          <div class="percent-change">
            <div
              :class="`d-flex align-center ${
                10 > 0 ? 'text-teal' : 'text-error'
              }`"
            >
              <div class="text-sm">
                {{ Math.abs(10) }}%
              </div>

              <VIcon
                :icon="
                  10 > 0 ? 'tabler-chevron-up' : 'tabler-chevron-down'
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
.payments-card {
  border-block: 2px solid rgb(var(--v-theme-teal));
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
