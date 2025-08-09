<script setup>
const otherDetails = [
  {
    label: 'دقیقه کارکرد عادی',
    value: '13,640',
  },
]
</script>

<template>
  <VCard>
    <VCardItem class="pa-4 pb-0">
      <template #prepend>
        <VAvatar
          color="info"
          variant="tonal"
          rounded
          icon="tabler-info-square-rounded"
        />
      </template>
      <VCardTitle>سایر جزئیات</VCardTitle>
    </VCardItem>

    <VCardText class="pa-4">
      <VList class="card-list">
        <VListItem v-for="item in otherDetails" :key="item.label">
          <VListItemTitle>
            {{ item.label }}
          </VListItemTitle>

          <template #append>
            <div class="d-flex gap-x-4">
              <div class="text-body-1">
                {{ item.value }}
              </div>
            </div>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1rem;
}
</style>
