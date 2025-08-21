<script setup>
const props = defineProps({
  getAmount: {
    type: Function,
    required: true,
  },
})

const allowanceItems = computed(() =>
  [
    {
      label: 'ماندگاری در شرکت',
      amount: props.getAmount('ماندگاری در شركت'),
      percentChange: -1.2,
    },
    {
      label: 'پاداش فنی',
      amount: props.getAmount('پاداش فنی'),
      percentChange: 0.8,
    },
    {
      label: 'فوق‌العاده مدیریت',
      amount: props.getAmount('فوق العاده مدیریت'),
      percentChange: 0.5,
    },
  ].filter(item => item.amount),
)

const welfareItems = [
  {
    label: 'کمک هزینه درمان',
    amount: props.getAmount('کمک هزینه درمان'),
    percentChange: -2.0,
  },
  {
    label: 'کمک هزینه سفر',
    amount: props.getAmount('کمک هزینه سفر'),
    percentChange: 1.1,
  },
  {
    label: 'کمک هزینه فرهنگی، ورزشی، سرگرمی',
    amount: props.getAmount('فرهنگی ورزشی'),
    percentChange: 3.4,
  },
  {
    label: 'کمک هزینه حمایت از خانواده',
    amount: props.getAmount('حمایت از خانواده'),
    percentChange: -0.3,
  },
]

const allowanceDeductions = {
  amount: props.getAmount('كسر فوق العاده'),
  reason: props.getAmount('علت کسر پاداش'),
}

const totalAllowances = computed(() => props.getAmount('جمع فوق العاده'))
</script>

<template>
  <VCard class="allowances-card">
    <VCardItem class="pa-3">
      <template #prepend>
        <VAvatar
          color="light-green"
          variant="tonal"
          rounded
          icon="tabler-medal"
        />
      </template>
      <VCardTitle>فوق‌العاده جذب</VCardTitle>
      <VCardSubtitle> ریال </VCardSubtitle>
    </VCardItem>

    <VDivider />

    <VCardText class="pa-3 pt-0">
      <VList>
        <VListItem
          v-for="allowanceItem in allowanceItems"
          :key="allowanceItem.label"
          class="pa-2"
        >
          <VListItemTitle class="text-wrap">
            {{ allowanceItem.label }}
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div class="text-body-1">
                {{ allowanceItem.amount }}
              </div>
              <div :class="`d-flex align-center ${allowanceItem.percentChange > 0 ? 'text-light-green' : 'text-error'}`">
                <div class="text-sm">
                  {{ Math.abs(allowanceItem.percentChange) }}%
                </div>

                <VIcon
                  :icon="
                    allowanceItem.percentChange > 0
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
      <VCard variant="outlined" color="light-green-lighten-3">
        <VCardItem class="pa-3">
          <VCardTitle class="v-list-item-title font-weight-bold">
            رفاهیات
          </VCardTitle>
        </VCardItem>

        <VCardText class="pa-3 pt-0">
          <VList>
            <VListItem
              v-for="welfareItem in welfareItems"
              :key="welfareItem.label"
              class="pa-2"
            >
              <VListItemTitle class="text-wrap">
                {{ welfareItem.label }}
              </VListItemTitle>

              <template #append>
                <div class="d-flex gap-x-4">
                  <div class="text-body-1">
                    {{ welfareItem.amount }}
                  </div>
                  <div :class="`d-flex align-center ${welfareItem.percentChange > 0 ? 'text-light-green' : 'text-error'}`">
                    <div class="text-sm">
                      {{ Math.abs(welfareItem.percentChange) }}%
                    </div>

                    <VIcon
                      :icon="
                        welfareItem.percentChange > 0
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
    </VCardText>

    <VCardText v-if="allowanceDeductions.amount">
      <VCard variant="outlined" color="error-lighten-2">
        <VCardItem class="pa-3">
          <VCardTitle class="v-list-item-title font-weight-bold">
            کسورات فوق‌العاده جذب
          </VCardTitle>
        </VCardItem>

        <VCardText class="pa-3 pt-0">
          <VList>
            <VListItem class="pa-2">
              <VListItemTitle class="text-wrap">
                مقدار
              </VListItemTitle>

              <template #append>
                <div class="d-flex gap-x-4">
                  <div class="text-body-1">
                    {{ allowanceDeductions.amount }}
                  </div>
                </div>
              </template>
            </VListItem>

            <VListItem class="pa-2">
              <VListItemTitle class="text-wrap">
                علت
              </VListItemTitle>

              <template #append>
                <div class="d-flex gap-x-4">
                  <div class="text-body-1">
                    {{ allowanceDeductions.reason }}
                  </div>
                </div>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCardText>

    <VCardText>
      <VCard variant="tonal" color="light-green">
        <VCardText class="pa-3 sum-of-amounts-card">
          <div class="label v-card-title pa-0 text-wrap">
            جمع فوق‌العاده جذب
          </div>

          <h6 class="text-h6 amount">
            {{ totalAllowances }}
          </h6>
          <div class="percent-change">
            <div :class="`d-flex align-center ${totalAllowances > 0 ? 'text-light-green' : 'text-error'}`">
              <div class="text-sm">
                {{ Math.abs(totalAllowances) }}%
              </div>

              <VIcon
                :icon="
                  totalAllowances > 0
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
.allowances-card {
  border-block: 2px solid rgb(var(--v-theme-light-green));
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
