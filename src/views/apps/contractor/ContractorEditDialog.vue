<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  file: Object,
  loading: Boolean,
  isDialogVisible: Boolean,
})

const emit = defineEmits(['submit', 'update:isDialogVisible'])

const refVForm = ref()
const costResponsible = ref(null)

function normalizeCostResponsible(file) {
  const v = String(file?.costResponsible || '').trim()
  if (v === 'پیمانکار') return 'on_contractor'
  if (v === 'شرکت') return 'on_company'
  if (v === 'on_contractor' || v === 'on_company') return v
  return null
}

watch(
  () => [props.isDialogVisible, props.file],
  ([open]) => {
    if (!open) return
    costResponsible.value = normalizeCostResponsible(props.file)
  },
  { immediate: true, deep: true },
)

function onFormSubmit() {
  refVForm.value?.validate().then(({ valid }) => {
    if (!valid) return

    emit('submit', {
      costResponsible: costResponsible.value,
    })
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
    :width="$vuetify.display.smAndDown ? 'auto' : 450"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardText>
        <h4 class="text-h5 text-center mb-2">
          ویرایش مسئول هزینه
        </h4>

        <VForm ref="refVForm" class="mt-6" validate-on="submit lazy" @submit.prevent="onFormSubmit">
          <VRow>
            <VCol cols="12" md="12">
              <VRadioGroup
                v-model="costResponsible"
                class="mt-2"
                inline
                label="هزینه بر عهده:"
              >
                <VRadio label="پیمانکار" value="on_contractor" />
                <VRadio label="شرکت" value="on_company" />
              </VRadioGroup>
            </VCol>

            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit" :disabled="loading" :loading="loading">
                ذخیره
              </VBtn>
              <VBtn color="secondary" variant="tonal" @click="onFormReset">
                انصراف
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
