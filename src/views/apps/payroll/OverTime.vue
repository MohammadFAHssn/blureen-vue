<script setup>
const props = defineProps({
  getPayrollItemByLabel: {
    type: Function,
    required: true,
  },
})

const overtimeItems = computed(() =>
  [
    {
      label: 'اضافه‌کاری عادی',
      amount: props.getPayrollItemByLabel('اضافه كاري عادی*').amount,
      percentChange:
        props.getPayrollItemByLabel('اضافه كاري عادی*').percentChange,
    },
    {
      label: 'جمعه‌کاری',
      amount: props.getPayrollItemByLabel('جمعه كاری*').amount,
      percentChange: props.getPayrollItemByLabel('جمعه كاری*').percentChange,
    },
  ].filter(item => item.amount || item.percentChange),
)

const total = computed(() => {
  return {
    amount: props.getPayrollItemByLabel('جمع اضافه کاری / جمعه کاری').amount,
    percentChange: props.getPayrollItemByLabel('جمع اضافه کاری / جمعه کاری')
      .percentChange,
  }
})
</script>

<template>
  <VCard class="overtime-card">
    <VCardItem class="pa-3">
      <template #prepend>
        <VAvatar
          color="success"
          variant="tonal"
          rounded
          icon="tabler-clock-plus"
        />
      </template>
      <VCardTitle>اضافه‌کاری</VCardTitle>
      <VCardSubtitle> ریال </VCardSubtitle>
    </VCardItem>

    <VDivider />

    <VCardText class="pa-3 pt-0">
      <VList>
        <VListItem v-for="item in overtimeItems" :key="item.label" class="pa-2">
          <VListItemTitle class="text-wrap">
            {{ item.label }}
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div class="text-body-1">
                {{ item.amount }}
              </div>
              <div style="min-inline-size: 70px;" class="d-flex justify-end">
                <div
                  v-if="item.percentChange"
                  :class="`d-flex align-center ${item.percentChange > 0 ? 'text-success' : 'text-error'}`"
                >
                  <div class="text-sm">
                    {{ Math.abs(item.percentChange) }}%
                  </div>

                  <VIcon
                    :icon="
                      item.percentChange > 0
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
      <VCard variant="tonal" color="success">
        <VCardText class="pa-3 sum-of-amounts-card">
          <div class="label v-card-title pa-0 text-wrap">
            جمع پرداختی اضافه‌کاری
          </div>

          <h6 class="text-h6 amount">
            {{ total.amount }}
          </h6>
          <div v-if="total.percentChange" class="percent-change">
            <div :class="`d-flex align-center ${total.percentChange > 0 ? 'text-success' : 'text-error'}`">
              <div class="text-sm">
                {{ Math.abs(total.percentChange) }}%
              </div>

              <VIcon
                :icon="total.percentChange > 0 ? 'tabler-chevron-up' : 'tabler-chevron-down'"
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
.overtime-card {
  border-block: 2px solid rgb(var(--v-theme-success));
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
