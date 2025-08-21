<script setup>
const props = defineProps({
  getPayrollItemByLabel: {
    type: Function,
    required: true,
  },
})

const payments = computed(() =>
  [
    {
      label: 'حقوق پایه',
      amount: props.getPayrollItemByLabel('حقوق پايه').amount,
      percentChange: 4.2,
    },
    {
      label: 'حق اولاد',
      amount: props.getPayrollItemByLabel('حق اولاد').amount,
      percentChange: 1.8,
    },
    {
      label: 'حق مسکن',
      amount: props.getPayrollItemByLabel('حق مسكن').amount,
      percentChange: -0.5,
    },
    {
      label: 'خواربار',
      amount: props.getPayrollItemByLabel('خواربار').amount,
      percentChange: 2.3,
    },
    {
      label: 'حق تأهل',
      amount: props.getPayrollItemByLabel('حق تاهل').amount,
      percentChange: 3.1,
    },
    {
      label: 'نوبت کاری 10%',
      amount: props.getPayrollItemByLabel('نوبتكاری 10%').amount,
      percentChange: -1.1,
    },
    {
      label: 'نوبت کاری 15%',
      amount: props.getPayrollItemByLabel('نوبتكاری 15%').amount,
      percentChange: 1.6,
    },
    {
      label: 'بن کارگری',
      amount: props.getPayrollItemByLabel('بن كارگری').amount,
      percentChange: 0.9,
    },
    {
      label: 'پایه سنوات سالیانه',
      amount: props.getPayrollItemByLabel('پايه سنوات ساليانه').amount,
      percentChange: 0.7,
    },
    {
      label: 'مزد سنوات',
      amount: props.getPayrollItemByLabel('مزد سنوات').amount,
      percentChange: -1.2,
    },
    {
      label: 'حق پست',
      amount: props.getPayrollItemByLabel('حق پست').amount,
      percentChange: 2.1,
    },
    {
      label: 'ماندگاری پست',
      amount: props.getPayrollItemByLabel('ماندگاری پست').amount,
      percentChange: 0.4,
    },
    {
      label: 'ماندگاری محیط کار (سختی کار)',
      amount: props.getPayrollItemByLabel('ماندگاری محيط كار(سختی كار)').amount,
      percentChange: 99.99,
    },
    {
      label: 'محیط کار (سختی کار)',
      amount: props.getPayrollItemByLabel('محيط كار(سختی كار)').amount,
      percentChange: 2.5,
    },
    {
      label: 'پاداش مدیریت',
      amount: props.getPayrollItemByLabel('پاداش مدیریت').amount,
      percentChange: 10.0,
    },
    {
      label: 'ماندگاری پاداش مدیریت',
      amount: props.getPayrollItemByLabel('ماندگاری پاداش مدیریت').amount,
      percentChange: 2.5,
    },
    {
      label: 'سایر مزایا',
      amount: props.getPayrollItemByLabel('ساير مزايا').amount,
      percentChange: 0.8,
    },
    {
      label: 'رتبه‌بندی',
      amount: props.getPayrollItemByLabel('رتبه بندی').amount,
      percentChange: 4.1,
    },
    {
      label: 'حق مأموریت',
      amount: props.getPayrollItemByLabel('حق ماموريت').amount,
      percentChange: -3.0,
    },
    {
      label: 'پرداختی معوق',
      amount: props.getPayrollItemByLabel('پرداختی معوق').amount,
      percentChange: 5.0,
    },
  ].filter(payment => payment.amount),
)

const total = computed(() => {
  return {
    amount: props.getPayrollItemByLabel('جمع ناخالص پرداختی').amount,
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
