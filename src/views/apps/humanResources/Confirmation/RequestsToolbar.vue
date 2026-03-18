<script setup>
defineProps({
  tabs: { type: Array, required: true },
  activeTab: { type: Number, required: true },
  isMobile: { type: Boolean, required: true },
  selectedCount: { type: Number, required: true },
  loading: { type: Boolean, required: true },
  showConfirmBtn: { type: Boolean, required: true },
})

const emit = defineEmits([
  'refresh',
  'selectTab',
  'approveSelected',
  'rejectSelected',
  'selectAllMobile',
  'clearMobileSelection',
])
</script>

<template>
  <section class="toolbar">
    <VCard v-if="isMobile" class="tabs-card" rounded="xl">
      <VTabs
        :model-value="activeTab"
        class="px-2"
        @update:model-value="(val) => emit('selectTab', val)"
      >
        <VTab :value="STATUSES.PENDING">
          <VIcon icon="tabler-loader-2" class="me-1" />
        </VTab>
        <VTab :value="STATUSES.APPROVED">
          <VIcon icon="tabler-circle-check" class="me-1" />
        </VTab>
        <VTab :value="STATUSES.REJECTED">
          <VIcon icon="tabler-ban" class="me-1" />
        </VTab>
      </VTabs>
    </VCard>
    <VCard v-else class="tabs-card" rounded="xl">
      <VTabs
        :model-value="activeTab"
        class="px-2"
        @update:model-value="(val) => emit('selectTab', val)"
      >
        <VTab v-for="t in tabs" :key="t.value" :value="t.value">
          {{ t.title }}
        </VTab>
      </VTabs>
    </VCard>
    <div v-if="showConfirmBtn" class="left-actions">
      <VBtn
        v-if="selectedCount > 0"
        color="success"
        :disabled="loading"
        @click="emit('approveSelected')"
      >
        تایید انتخاب‌شده‌ها ({{ selectedCount }})
      </VBtn>

      <VBtn
        v-if="selectedCount > 0"
        color="error"
        :disabled="loading"
        @click="emit('rejectSelected')"
      >
        رد انتخاب‌شده‌ها ({{ selectedCount }})
      </VBtn>

      <template v-if="isMobile">
        <VBtn
          variant="text"
          density="comfortable"
          :disabled="loading"
          @click="emit('selectAllMobile')"
        >
          انتخاب همه
        </VBtn>

        <VBtn
          variant="text"
          density="comfortable"
          :disabled="!selectedCount"
          @click="emit('clearMobileSelection')"
        >
          حذف انتخاب‌ها
        </VBtn>
      </template>
    </div>

    <VSpacer />

    <VBtn
      variant="flat"
      color="primary"
      :loading="loading"
      :disabled="loading"
      title="بروزرسانی لیست"
      @click="emit('refresh')"
    >
      <VIcon icon="tabler-refresh" />
    </VBtn>
  </section>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem;
  flex-wrap: wrap;
}
.left-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  max-inline-size: 100%;
}
:deep(.v-btn) {
  min-height: 36px;
}
@media (max-width: 960px) {
  .left-actions .v-btn {
    flex: 1 1 48%;
    min-width: 0;
  }
}
</style>
