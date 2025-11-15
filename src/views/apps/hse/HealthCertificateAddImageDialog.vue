<script setup>
const props = defineProps({
  loading: Boolean,
  isDialogVisible: Boolean,

  // progress-related (fed by parent)
  progress: { type: Number, default: 0 }, // 0..100
  total: { type: Number, default: 0 },
  done: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
})

const emit = defineEmits(['submit', 'update:isDialogVisible'])

// states
const refVForm = ref()
const healthCertificateImages = ref([])

const fileInputRules = [
  (fileList) => {
    if (!fileList.length) return 'حداقل یک تصویر انتخاب کنید!'
    if (fileList.length > 3000) return 'حداکثر می‌توانید 3000 تصویر انتخاب کنید!'

    for (const file of fileList) {
      const ext = file.name.split('.').pop().toLowerCase()
      if (!['jpg', 'jpeg', 'png'].includes(ext))
        return 'فقط فایل‌های تصویری (jpg, jpeg, png) مجاز هستند!'
      if (file.size > 2 * 1024 * 1024)
        return `حجم هر تصویر باید کمتر از ${2 * 1024 * 1024 / 1024 / 1024} مگابایت باشد!`
    }
    return true
  },
]

// methods
function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit('submit', { healthCertificateImages: healthCertificateImages.value })
    }
  })
}
function onFormReset() {
  emit('update:isDialogVisible', false)
}
function dialogModelValueUpdate(val) {
  emit('update:isDialogVisible', val)
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardTitle class="text-h6">
        افزودن عکس
      </VCardTitle>

      <!-- PROGRESS BAR (visible only while loading) -->
      <VCardText v-if="loading" class="pt-0">
        <VProgressLinear
          :model-value="progress"
          height="10"
          color="primary"
          rounded
          striped
          class="mb-2"
        />
        <div class="text-caption d-flex justify-space-between">
          <span>در حال آپلود...</span>
          <span>
            {{ done }} / {{ total }}
            <span v-if="failed"> | ناموفق: {{ failed }}</span>
            | {{ Math.round(progress) }}%
          </span>
        </div>
      </VCardText>

      <VCardText>
        <VForm ref="refVForm" class="mt-2" validate-on="submit lazy" @submit.prevent="onFormSubmit">
          <VRow>
            <!-- Submit / Cancel -->
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit" :disabled="loading" :loading="loading">
                ذخیره
              </VBtn>

              <VBtn color="secondary" variant="tonal" :disabled="loading" @click="onFormReset">
                انصراف
              </VBtn>
            </VCol>
          </VRow>
          <VRow>
            <!-- Image Files -->
            <VCol cols="12" md="12">
              <VFileInput
                v-model="healthCertificateImages"
                multiple
                chips
                show-size
                :disabled="loading"
                label="تصاویر (حداکثر 3000 فایل)"
                accept="image/*"
                :rules="fileInputRules"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
