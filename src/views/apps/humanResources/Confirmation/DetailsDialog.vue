<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  details: { type: Object, default: null },
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
</script>

<template>
  <VDialog v-model="model" :max-width="maxWidth">
    <VCard>
      <VCardTitle class="text-h6">
        {{ title }}
      </VCardTitle>

      <VCardText>
        <slot name="content" :details="details">
          <div v-if="details" class="text-body-2">
            <p>
              اینجا محل نمایش جزئیات است. بعداً فیلدهای موردنظر اضافه می‌شود.
            </p>
          </div>

          <div v-else class="text-body-2">
            <p>جزئیاتی برای نمایش وجود ندارد.</p>
          </div>
        </slot>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn variant="text" :disabled="loading" @click="onClose">
          {{ closeText }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
