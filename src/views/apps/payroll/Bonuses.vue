<script setup>
const props = defineProps({
  getAmount: {
    type: Function,
    required: true,
  },
})

const bonuses = computed(() =>
  [
    {
      label: 'پاداش شناور فردی (ارزیابی)',
      period: props.getAmount('دوره ارزیابی'),
      group: props.getAmount('گروه ارزیابی'),
      amount: props.getAmount('پاداش شناور فردی(ارزيابی)'),
      percentChange: 4.2,
    },
    {
      label: 'پاداش شناور گروهی (بهره‌وری)',
      amount: props.getAmount('پاداش شناور گروهی(بهره وری)'),
      percentChange: 1.8,
    },
    {
      label: 'پاداش شناور مدیر واحد',
      amount: props.getAmount('پاداش شناور مدير واحد'),
      percentChange: 0.5,
    },
    {
      label: 'فوق‌العاده بهره‌وری',
      amount: props.getAmount('فوق العاده بهره وری'),
      percentChange: 2.3,
    },
  ].filter(bonus => bonus.amount),
)

const total = computed(() => {
  return { amount: props.getAmount('جمع پاداش'), percentChange: 5.0 }
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
              <div :class="`d-flex align-center ${bonus.percentChange > 0 ? 'text-success' : 'text-error'}`">
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
      <div class="percent-change">
        <VChip
          variant="flat"
          :color="`${3.2 > 0 ? 'success' : 'error'}`"
          class="d-flex align-center"
        >
          <div class="text-sm">
            {{ Math.abs(3.2) }}%
          </div>

          <VIcon
            :icon="
              3.2 > 0 ? 'tabler-chevron-up' : 'tabler-chevron-down'
            "
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
