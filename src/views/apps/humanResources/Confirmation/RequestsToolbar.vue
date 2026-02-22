<script setup>
defineProps({
  isMobile: { type: Boolean, required: true },
  selectedCount: { type: Number, required: true },
  loading: { type: Boolean, default: false },
  hasRequests: { type: Boolean, default: false },
})

const emit = defineEmits([
  'refresh',
  'approveSelected',
  'rejectSelected',
  'selectAllMobile',
  'clearMobileSelection',
])
</script>

<template>
  <section class="toolbar">
    <div class="left-actions">
      <VBtn
        v-if="selectedCount > 0"
        color="success"
        @click="emit('approveSelected')"
      >
        تایید انتخاب‌شده‌ها ({{ selectedCount }})
      </VBtn>

      <VBtn
        v-if="selectedCount > 0"
        color="error"
        @click="emit('rejectSelected')"
      >
        رد انتخاب‌شده‌ها ({{ selectedCount }})
      </VBtn>

      <template v-if="isMobile">
        <VBtn
          variant="text"
          density="comfortable"
          :disabled="!hasRequests"
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
