<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  reason: { type: String, default: null },
  loading: { type: Boolean, default: false },
  rules: {
    type: Array,
    default: () => [v => !!v || 'وارد کردن علت الزامی است'],
  },
})

const emit = defineEmits([
  'update:show',
  'update:reason',
  'confirm',
  'cancel',
])

const model = computed({
  get: () => props.show,
  set: v => emit('update:show', v),
})

const reasonProxy = computed({
  get: () => props.reason,
  set: v => emit('update:reason', v),
})

function onCancel() {
  emit('cancel')
  model.value = false
}

function onConfirm() {
  if (!reasonProxy.value)
    return
  emit('confirm', reasonProxy.value)
}
</script>

<template>
  <VDialog v-model="model" max-width="520">
    <VCard>
      <VCardTitle class="text-h6">
        علت رد درخواست
      </VCardTitle>

      <VCardText>
        <VTextarea
          v-model="reasonProxy"
          label="علت رد"
          auto-grow
          rows="3"
          :rules="rules"
          :disabled="loading"
        />
      </VCardText>

      <VCardActions class="justify-space-between">
        <VBtn variant="text" :disabled="loading" @click="onCancel">
          لغو
        </VBtn>

        <VBtn
          color="error"
          :loading="loading"
          :disabled="!reasonProxy"
          @click="onConfirm"
        >
          تایید رد
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
