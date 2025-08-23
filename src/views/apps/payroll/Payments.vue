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
      percentChange: props.getPayrollItemByLabel('حقوق پايه').percentChange,
    },
    {
      label: 'حق اولاد',
      amount: props.getPayrollItemByLabel('حق اولاد').amount,
      percentChange: props.getPayrollItemByLabel('حق اولاد').percentChange,
    },
    {
      label: 'حق مسکن',
      amount: props.getPayrollItemByLabel('حق مسكن').amount,
      percentChange: props.getPayrollItemByLabel('حق مسكن').percentChange,
    },
    {
      label: 'خواربار',
      amount: props.getPayrollItemByLabel('خواربار').amount,
      percentChange: props.getPayrollItemByLabel('خواربار').percentChange,
    },
    {
      label: 'حق تأهل',
      amount: props.getPayrollItemByLabel('حق تاهل').amount,
      percentChange: props.getPayrollItemByLabel('حق تاهل').percentChange,
    },
    {
      label: 'نوبت کاری 10%',
      amount: props.getPayrollItemByLabel('نوبتكاری 10%').amount,
      percentChange: props.getPayrollItemByLabel('نوبتكاری 10%').percentChange,
    },
    {
      label: 'نوبت کاری 15%',
      amount: props.getPayrollItemByLabel('نوبتكاری 15%').amount,
      percentChange: props.getPayrollItemByLabel('نوبتكاری 15%').percentChange,
    },
    {
      label: 'بن کارگری',
      amount: props.getPayrollItemByLabel('بن كارگری').amount,
      percentChange: props.getPayrollItemByLabel('بن كارگری').percentChange,
    },
    {
      label: 'پایه سنوات سالیانه',
      amount: props.getPayrollItemByLabel('پايه سنوات ساليانه').amount,
      percentChange:
        props.getPayrollItemByLabel('پايه سنوات ساليانه').percentChange,
    },
    {
      label: 'مزد سنوات',
      amount: props.getPayrollItemByLabel('مزد سنوات').amount,
      percentChange: props.getPayrollItemByLabel('مزد سنوات').percentChange,
    },
    {
      label: 'حق پست',
      amount: props.getPayrollItemByLabel('حق پست').amount,
      percentChange: props.getPayrollItemByLabel('حق پست').percentChange,
    },
    {
      label: 'ماندگاری پست',
      amount: props.getPayrollItemByLabel('ماندگاری پست').amount,
      percentChange: props.getPayrollItemByLabel('ماندگاری پست').percentChange,
    },
    {
      label: 'ماندگاری محیط کار (سختی کار)',
      amount: props.getPayrollItemByLabel('ماندگاری محيط كار(سختی كار)').amount,
      percentChange: props.getPayrollItemByLabel('ماندگاری محيط كار(سختی كار)')
        .percentChange,
    },
    {
      label: 'محیط کار (سختی کار)',
      amount: props.getPayrollItemByLabel('محيط كار(سختی كار)').amount,
      percentChange:
        props.getPayrollItemByLabel('محيط كار(سختی كار)').percentChange,
    },
    {
      label: 'پاداش مدیریت',
      amount: props.getPayrollItemByLabel('پاداش مدیریت').amount,
      percentChange: props.getPayrollItemByLabel('پاداش مدیریت').percentChange,
    },
    {
      label: 'ماندگاری پاداش مدیریت',
      amount: props.getPayrollItemByLabel('ماندگاری پاداش مدیریت').amount,
      percentChange: props.getPayrollItemByLabel('ماندگاری پاداش مدیریت')
        .percentChange,
    },
    {
      label: 'سایر مزایا',
      amount: props.getPayrollItemByLabel('ساير مزايا').amount,
      percentChange: props.getPayrollItemByLabel('ساير مزايا').percentChange,
    },
    {
      label: 'رتبه‌بندی',
      amount: props.getPayrollItemByLabel('رتبه بندی').amount,
      percentChange: props.getPayrollItemByLabel('رتبه بندی').percentChange,
    },
    {
      label: 'حق مأموریت',
      amount: props.getPayrollItemByLabel('حق ماموريت').amount,
      percentChange: props.getPayrollItemByLabel('حق ماموريت').percentChange,
    },
    {
      label: 'پرداختی معوق',
      amount: props.getPayrollItemByLabel('پرداختی معوق').amount,
      percentChange: props.getPayrollItemByLabel('پرداختی معوق').percentChange,
    },
  ].filter(payment => payment.amount || payment.percentChange),
)

const total = computed(() => {
  return {
    amount: props.getPayrollItemByLabel('جمع ناخالص پرداختی').amount,
    percentChange:
      props.getPayrollItemByLabel('جمع ناخالص پرداختی').percentChange,
  }
})
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
          :variant="`${!isFinite(payment.percentChange) ? 'outlined' : 'text'}`"
          :base-color="`${!isFinite(payment.percentChange) ? 'teal' : ''}`"
        >
          <VListItemTitle class="text-wrap">
            {{ payment.label }}
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div
                class="text-body-1"
                :style="`color: ${!isFinite(payment.percentChange) ? 'teal' : ''}`"
              >
                {{ formatNumber(payment.amount) }}
              </div>
              <div style="min-inline-size: 70px;" class="d-flex justify-end">
                <VIcon
                  v-if="!isFinite(payment.percentChange)"
                  icon="tabler-plus"
                  size="20"
                  class="mr-1"
                />

                <div
                  v-else-if="payment.percentChange"
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
            {{ formatNumber(total.amount) }}
          </h6>
          <div v-if="total.percentChange" class="percent-change">
            <div
              :class="`d-flex align-center ${
                total.percentChange > 0 ? 'text-teal' : 'text-error'
              }`"
            >
              <div class="text-sm">
                {{ Math.abs(total.percentChange) }}%
              </div>

              <VIcon
                :icon="
                  total.percentChange > 0
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
