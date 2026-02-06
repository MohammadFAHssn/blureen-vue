<script setup>
const props = defineProps({
  show: { type: Boolean, default: false },
  request: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  title: { type: String, default: 'جزئیات درخواست' },
  maxWidth: { type: [Number, String], default: 640 },
  closeText: { type: String, default: 'بستن' },
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

const normalizedDetails = computed(() =>
  (props.request?.details ?? [])
    .filter(d => HR_REQUEST_DETAILS_TITLE[d.key])
    .map(d => ({
      key: d.key,
      title: HR_REQUEST_DETAILS_TITLE[d.key],
      value: d.value??'-',
    })),
)
</script>

<template>
  <VDialog v-model="model" :max-width="maxWidth">
    <VCard>
      <VCardTitle class="text-h6">
        {{ title }}
      </VCardTitle>

      <VCardText>
        <div v-if="request && normalizedDetails.length">
          <VList density="compact">
            <VListItem v-for="item in normalizedDetails" :key="item.key">
              <template #title>
                <div class="d-flex align-center justify-space-between w-100">
                  <span class="text-body-2 font-weight-medium">
                    {{ item.title }}
                  </span>
                  <span class="text-body-2">
                    {{ item.value }}
                  </span>
                </div>
              </template>
            </VListItem>
          </VList>
        </div>

        <div v-else class="text-body-2">
          جزئیاتی برای نمایش وجود ندارد.
        </div>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn variant="text" :disabled="loading" @click="onClose">
          {{ closeText }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
