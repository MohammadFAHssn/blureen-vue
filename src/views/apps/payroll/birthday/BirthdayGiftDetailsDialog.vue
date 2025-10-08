<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  file: {
    type: Object,
    default: () => ({ image: null }),
  },
})

const emit = defineEmits(['update:isDialogVisible'])

// create a local reactive variable for dialog visibility
const localDialog = ref(props.isDialogVisible)

// watch the prop and update local state
watch(
  () => props.isDialogVisible,
  (val) => {
    localDialog.value = val
  },
)

// watch local state and emit updates
watch(localDialog, (val) => {
  emit('update:isDialogVisible', val)
})
</script>

<template>
  <VDialog v-model="localDialog" max-width="600">
    <VCard>
      <VCardText class="d-flex justify-center">
        <VImg
          v-if="props.file?.image"
          :src="props.file.image"
          max-width="100%"
          max-height="400"
          contain
        />
        <div v-else>
          تصویری وجود ندارد
        </div>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn color="primary" text @click="localDialog = false">
          بستن
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
