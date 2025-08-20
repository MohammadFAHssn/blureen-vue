<script setup>
const props = defineProps({
  getAmount: {
    type: Function,
    required: true,
  },
})
</script>

<template>
  <VCard>
    <VCardText class="pa-3">
      <VRow>
        <VCol class="d-flex align-center">
          <VAvatar
            variant="text"
            color="primary"
            rounded
            size="31"
            class="text-primary me-0"
          >
            <VIcon icon="tabler-id" size="22" />
          </VAvatar>
          <div>
            <p class="text-medium-emphasis ma-0 text-no-wrap">
              کد پرسنلی
            </p>
            <p class="text-primary ma-0 text-no-wrap">
              {{ props.getAmount('پرسنلی') }}
            </p>
          </div>
        </VCol>

        <VCol class="d-flex align-center">
          <VAvatar
            variant="text"
            color="primary"
            rounded
            size="31"
            class="text-primary me-0"
          >
            <VIcon icon="tabler-user" size="22" />
          </VAvatar>
          <div>
            <p class="text-medium-emphasis ma-0 text-no-wrap">
              نام و نام خانوادگی
            </p>
            <p class="text-primary ma-0 text-no-wrap">
              {{ props.getAmount('نام') }}
              {{ props.getAmount('نام خانوادگی') }}
            </p>
          </div>
        </VCol>

        <VCol class="d-flex align-center">
          <VAvatar
            variant="text"
            color="primary"
            rounded
            size="31"
            class="text-primary me-0"
          >
            <VIcon icon="tabler-building" size="22" />
          </VAvatar>
          <div>
            <p class="text-medium-emphasis ma-0 text-no-wrap">
              واحد کاری
            </p>
            <p class="text-primary ma-0 text-no-wrap">
              {{ props.getAmount('واحد کاری') }}
            </p>
          </div>
        </VCol>

        <VCol class="d-flex align-center">
          <VAvatar
            variant="text"
            color="primary"
            rounded
            size="31"
            class="text-primary me-0"
          >
            <VIcon icon="tabler-star" size="22" />
          </VAvatar>
          <div>
            <p class="text-medium-emphasis ma-0 text-no-wrap">
              گروه
            </p>
            <p class="text-primary ma-0 text-no-wrap">
              {{ props.getAmount('گروه') }}
            </p>
          </div>
        </VCol>

        <VCol v-if="props.getAmount('رتبه')" class="d-flex align-center">
          <VAvatar
            variant="text"
            color="primary"
            rounded
            size="31"
            class="text-primary me-0"
          >
            <VIcon icon="tabler-tag-starred" size="25" />
          </VAvatar>
          <div>
            <p class="text-medium-emphasis ma-0 text-no-wrap">
              رتبه
            </p>
            <p class="text-primary ma-0 text-no-wrap">
              {{ props.getAmount('رتبه') }}
            </p>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
