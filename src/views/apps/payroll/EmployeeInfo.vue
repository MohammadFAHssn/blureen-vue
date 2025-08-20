<script setup>
const props = defineProps({
  getAmount: {
    type: Function,
    required: true,
  },
})

const employeeInfo = computed(() =>
  [
    {
      label: 'کد پرسنلی',
      value: props.getAmount('پرسنلی'),
      icon: 'tabler-id',
    },
    {
      label: 'نام و نام خانوادگی',
      value: `${props.getAmount('نام')} ${props.getAmount('نام خانوادگی')}`,
      icon: 'tabler-user',
    },
    {
      label: 'واحد کاری',
      value: props.getAmount('واحد کاری'),
      icon: 'tabler-building',
    },
    {
      label: 'گروه',
      value: props.getAmount('گروه'),
      icon: 'tabler-star',
    },
    {
      label: 'رتبه',
      value: props.getAmount('رتبه'),
      icon: 'tabler-tag-starred',
    },
  ].filter(info => info.value),
)
</script>

<template>
  <VCard>
    <VCardText class="pa-3">
      <VRow>
        <VCol
          v-for="info in employeeInfo"
          :key="info.label"
          class="d-flex align-center"
        >
          <VAvatar
            variant="text"
            color="primary"
            rounded
            size="31"
            class="text-primary me-0"
          >
            <VIcon :icon="info.icon" size="22" />
          </VAvatar>
          <div>
            <p class="text-medium-emphasis ma-0 text-no-wrap">
              {{ info.label }}
            </p>
            <p class="text-primary ma-0 text-no-wrap">
              {{ info.value }}
            </p>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
