<script setup>
const props = defineProps({
  show: { type: Boolean, default: false },
  request: { type: Object, default: null },
  maxWidth: { type: [Number, String], default: 680 },
})

const emit = defineEmits(['update:show', 'close'])

const model = computed({
  get: () => props.show,
  set: v => emit('update:show', v),
})

function onClose() {
  emit('close')
  model.value = false
}

function getDetailValue(key) {
  return props.request?.details?.find(d => d.key === key)?.value ?? null
}

const replacementUser = computed(() => getDetailValue('replacement_user'))
const description = computed(() => getDetailValue('description'))
const hasAnyDetail = computed(
  () => !!replacementUser.value || !!description.value,
)
</script>

<template>
  <VDialog v-model="model" :max-width="maxWidth">
    <VCard>
      <VCardTitle class="text-h6">
        جزئیات درخواست
      </VCardTitle>

      <VCardText>
        <div v-if="hasAnyDetail" class="details-wrap">
          <VRow dense>
            <VCol cols="12" sm="6">
              <div class="label">
                <VIcon size="16" class="me-1" icon="tabler-user-check" />
                {{ HR_REQUEST_DETAILS_TITLE.replacement_user || 'جایگزین' }}
              </div>

              <div class="value">
                <VChip size="small" variant="tonal">
                  {{ replacementUser ?? 'ثبت نشده' }}
                </VChip>
              </div>
            </VCol>

            <VCol cols="12" sm="6">
              <div class="label">
                <VIcon size="16" class="me-1" icon="tabler-message-dots" />
                {{ HR_REQUEST_DETAILS_TITLE.description || 'توضیحات' }}
              </div>

              <div class="desc-box">
                {{ description }}
              </div>
            </VCol>
          </VRow>
        </div>

        <VEmptyState v-else title="جزئیاتی برای نمایش وجود ندارد." />
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn variant="text" @click="onClose">
          بستن
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.details-wrap {
  padding-top: 4px;
}

.label {
  display: flex;
  align-items: center;
  font-size: 12px;
  opacity: 0.75;
  margin-bottom: 6px;
}

.value {
  display: flex;
  align-items: center;
  min-height: 36px;
}

.desc-box {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  min-height: 64px;
}
</style>
