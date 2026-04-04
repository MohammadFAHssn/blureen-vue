<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  loading: {
    type: Boolean,
    required: true,
  },

  confirmLabel: {
    type: String,
    required: false,
  },

  rejectLabel: {
    type: String,
    required: false,
  },
})

const emit = defineEmits(['update:isDialogVisible', 'confirm'])

function dialogVisibleUpdate(val) {
  emit('update:isDialogVisible', val)
}
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    :width="$vuetify.display.smAndDown ? 'auto' : 400"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard>
      <!-- 👉 Title -->
      <VCardItem class="text-center">
        <VCardTitle>
          <h6 class="text-h6 mb-2 text-wrap">
            {{ props.title }}
          </h6>
        </VCardTitle>
      </VCardItem>

      <VCardActions class="justify-center">
        <VBtn
          :loading="props.loading"
          color="success"
          variant="text"
          @click="emit('confirm')"
        >
          <div v-if="!props.confirmLabel">
            بله
          </div>
          <div v-else>
            {{ props.confirmLabel }}
          </div>
        </VBtn>

        <VBtn
          color="secondary"
          variant="text"
          @click="$emit('update:isDialogVisible', false)"
        >
          <div v-if="!props.rejectLabel">
            خیر
          </div>
          <div v-else>
            {{ props.rejectLabel }}
          </div>
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
