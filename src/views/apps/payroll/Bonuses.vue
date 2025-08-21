<script setup>
const props = defineProps({
  getPayrollItemByLabel: {
    type: Function,
    required: true,
  },
})

const bonuses = computed(() =>
  [
    {
      label: 'پاداش شناور فردی (ارزیابی)',
      period: props.getPayrollItemByLabel('دوره ارزیابی').amount,
      group: props.getPayrollItemByLabel('گروه ارزیابی').amount,
      amount: props.getPayrollItemByLabel('پاداش شناور فردی(ارزيابی)').amount,
      percentChange: props.getPayrollItemByLabel('پاداش شناور فردی(ارزيابی)')
        .percentChange,
    },
    {
      label: 'پاداش شناور گروهی (بهره‌وری)',
      amount: props.getPayrollItemByLabel('پاداش شناور گروهی(بهره وری)').amount,
      percentChange: props.getPayrollItemByLabel('پاداش شناور گروهی(بهره وری)')
        .percentChange,
    },
    {
      label: 'پاداش شناور مدیر واحد',
      amount: props.getPayrollItemByLabel('پاداش شناور مدير واحد').amount,
      percentChange: props.getPayrollItemByLabel('پاداش شناور مدير واحد')
        .percentChange,
    },
    {
      label: 'فوق‌العاده بهره‌وری',
      amount: props.getPayrollItemByLabel('فوق العاده بهره وری').amount,
      percentChange: props.getPayrollItemByLabel('فوق العاده بهره وری')
        .percentChange,
    },
  ].filter(bonus => bonus.amount || bonus.percentChange),
)

const total = computed(() => {
  return {
    amount: props.getPayrollItemByLabel('جمع پاداش').amount,
    percentChange: props.getPayrollItemByLabel('جمع پاداش').percentChange,
  }
})
</script>

<template>
  <VCard class="bonuses-card mb-3">
    <VCardItem class="pa-3">
      <template #prepend>
        <VAvatar color="primary" variant="tonal" rounded icon="tabler-gift" />
      </template>
      <VCardTitle>پاداش‌ها</VCardTitle>
      <VCardSubtitle> ریال </VCardSubtitle>
    </VCardItem>

    <VDivider />

    <VCardText class="pa-3 pt-0">
      <VList>
        <VListItem v-for="bonus in bonuses" :key="bonus.label" class="pa-2">
          <VListItemTitle class="text-wrap">
            {{ bonus.label }}
            <div v-if="bonus.period">
              دوره
              <VChip variant="outlined" color="primary" :label="false">
                {{ bonus.period }}
              </VChip>
            </div>
            <div v-if="bonus.group">
              گروه
              <VChip variant="flat" color="primary" :label="false">
                {{ bonus.group }}
              </VChip>
            </div>
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div class="text-body-1">
                {{ bonus.amount }}
              </div>
              <div style="min-inline-size: 70px;" class="d-flex justify-end">
                <div v-if="bonus.percentChange" :class="`d-flex align-center ${bonus.percentChange > 0 ? 'text-success' : 'text-error'}`">
                  <div class="text-sm">
                    {{ Math.abs(bonus.percentChange) }}%
                  </div>

                  <VIcon
                    :icon="
                      bonus.percentChange > 0
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
  </VCard>

  <VCard color="primary">
    <VCardText class="pa-3 sum-of-amounts-card">
      <div class="label v-card-title pa-0 text-white text-wrap">
        جمع پاداش‌ها (پرداختی دوم)
      </div>

      <h6 class="text-h6 text-white amount">
        {{ total.amount }}
      </h6>
      <div v-if="total.percentChange" class="percent-change">
        <VChip
          variant="flat"
          :color="`${total.percentChange > 0 ? 'success' : 'error'}`"
          class="d-flex align-center"
        >
          <div class="text-sm">
            {{ Math.abs(total.percentChange) }}%
          </div>

          <VIcon
            :icon="total.percentChange > 0 ? 'tabler-chevron-up' : 'tabler-chevron-down'"
            size="20"
            class="mr-1"
          />
        </VChip>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.bonuses-card {
  border-block: 2px solid rgb(var(--v-theme-primary));
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
