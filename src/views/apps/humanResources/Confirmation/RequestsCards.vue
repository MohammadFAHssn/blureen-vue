<script setup>
const props = defineProps({
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  selectedIds: { type: Array, required: true },
})

const emit = defineEmits([
  'toggleSelect',
  'approve',
  'reject',
  'edit',
  'referral',
])

function isSelected(id) {
  return props.selectedIds.includes(id)
}

function fmtTimeRange(r) {
  return r.start_time && r.end_time ? `${r.start_time} - ${r.end_time}` : '-'
}
</script>

<template>
  <VEmptyState
    v-if="!loading && !items.length"
    headline="درخواستی یافت نشد"
    title="لیست خالی است"
  />

  <VContainer v-else fluid class="pa-2">
    <VRow dense>
      <VCol v-for="item in items" :key="item.id" cols="12">
        <VCard
          class="request-card"
          :elevation="isSelected(item.id) ? 6 : 2"
          :class="{ 'request-card--selected': isSelected(item.id) }"
        >
          <VCardText class="pa-3">
            <div class="card-header">
              <div class="card-title">
                <div class="name">
                  {{ item.request.user.first_name }}
                  {{ item.request.user.last_name }}
                </div>
                <div class="meta">
                  کد پرسنلی: {{ item.request.user.personnel_code }}
                </div>
              </div>

              <VCheckbox
                :model-value="isSelected(item.id)"
                density="comfortable"
                :ripple="false"
                class="card-checkbox"
                color="primary"
                hide-details
                @update:model-value="emit('toggleSelect', item.id)"
              />
            </div>

            <div class="chips">
              <VChip size="small" color="primary" variant="flat">
                {{ item.request.type.name }}
              </VChip>
            </div>

            <div class="rows">
              <div class="row">
                <span class="label">تاریخ شروع</span>
                <span class="value">{{ item.request.start_date }}</span>
              </div>
              <div class="row">
                <span class="label">تاریخ پایان</span>
                <span class="value">{{ item.request.end_date }}</span>
              </div>
              <div class="row">
                <span class="label">زمان</span>
                <span class="value">{{ fmtTimeRange(item.request) }}</span>
              </div>
            </div>
          </VCardText>

          <VDivider />

          <VCardActions class="pa-2 actions">
            <VBtn
              size="small"
              color="success"
              variant="tonal"
              @click="emit('approve', item.id)"
            >
              <VIcon icon="tabler-check" />
            </VBtn>

            <VBtn
              size="small"
              color="error"
              variant="tonal"
              @click="emit('reject', item.id)"
            >
              <VIcon icon="tabler-ban" />
            </VBtn>

            <VSpacer />

            <VBtn
              size="small"
              color="warning"
              variant="tonal"
              @click="emit('edit', item)"
            >
              <VIcon icon="tabler-edit" />
            </VBtn>

            <VBtn
              size="small"
              color="info"
              variant="tonal"
              @click="emit('referral', item)"
            >
              <VIcon icon="tabler-user-share" />
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<style lang="scss" scoped>
.request-card {
  inline-size: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
.request-card--selected {
  outline: 2px solid rgba(var(--v-theme-primary), 0.45);
  outline-offset: 0;
}
.request-card .card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  justify-content: space-between;
}
.request-card .card-title {
  display: grid;
  gap: 0.125rem;
}
.request-card .card-title .name {
  font-weight: 600;
}
.request-card .card-title .meta {
  font-size: 0.85rem;
  opacity: 0.7;
}
.request-card .card-checkbox {
  margin-inline-start: 0.25rem;
  margin-inline-end: 0;
}
.request-card .chips {
  margin-block: 0.5rem;
}
.request-card .rows {
  display: grid;
  gap: 0.375rem;
}
.request-card .row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  column-gap: 1rem;
}
.request-card .label {
  opacity: 0.75;
  font-size: 0.9rem;
}
.request-card .value {
  font-weight: 500;
}
.request-card .actions {
  gap: 0.5rem;
}
</style>
