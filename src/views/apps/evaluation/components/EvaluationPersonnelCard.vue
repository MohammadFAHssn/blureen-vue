<script setup>
defineProps({
  result: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <VCard
    class="mb-6 personnel-card"
    variant="flat"
  >
    <VCardText class="text-center">
      <VAvatar
        variant="tonal"
        color="primary"
        :size="$vuetify.display.smAndUp ? 65 : 55"
        rounded
        class="mb-4"
      >
        <VIcon
          icon="tabler-user"
          :size="$vuetify.display.smAndUp ? 40 : 35"
        />
      </VAvatar>

      <h5 class="text-h6 text-sm-h5 mb-2">
        {{ result.full_name }}
      </h5>
      <p class="text-body-1 text-medium-emphasis mb-0">
        کد پرسنلی: {{ result.personnel_code }}
      </p>
    </VCardText>

    <VDivider />

    <VCardText>
      <VRow>
        <VCol
          v-if="result.unit_name"
          cols="12"
          xl="6"
          class="d-flex align-center gap-2"
        >
          <VIcon
            icon="tabler-building"
            color="#2563EB"
          />
          <span class="text-body-1">واحد: {{ result.unit_name }}</span>
        </VCol>
        <VCol
          v-if="result.manager_name"
          cols="12"
          xl="6"
          class="d-flex align-center gap-2"
        >
          <VIcon
            icon="tabler-user-star"
            color="primary"
          />
          <span class="text-body-1">مدیر: {{ result.manager_name }}</span>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.personnel-card {
  /* stylelint-disable */
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  /* stylelint-enable */
}
</style>
