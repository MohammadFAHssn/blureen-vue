<script setup>
import { VTextField } from 'vuetify/components'

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['submit', 'update:isDialogVisible'])

// states
const refVForm = ref()
const healthCertificateDate = ref(null)
const healthCertificateName = ref([])

const datePickerRules = [
  () => !!healthCertificateDate.value || 'لطفا دوره را انتخاب کنید!',
]

// methods
function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit('submit', {
        healthCertificateDate: healthCertificateDate.value,
        healthCertificateName: healthCertificateName.value,
      })
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
      <VCardText>
        <h4 class="text-h5 text-center mb-2">
          ایجاد گروه شناسنامه جدید
        </h4>

        <VForm ref="refVForm" class="mt-6" validate-on="submit lazy" @submit.prevent="onFormSubmit">
          <VRow>
            <!-- Name -->
            <VCol cols="12" md="6">
              <VInput :disabled="loading">
                <VTextField
                  v-model="healthCertificateName"
                  :rules="[requiredValidator]"
                  :disabled="loading"
                  simple
                  label="نام"
                />
              </VInput>
            </VCol>

            <!-- Time Period -->
            <VCol cols="12" md="6">
              <VInput :rules="datePickerRules" :disabled="loading">
                <PersianDatetimePicker
                  v-model="healthCertificateDate"
                  :disabled="loading"
                  type="year-month"
                  simple
                  label="دوره شناسنامه"
                />
              </VInput>
            </VCol>

            <!-- Submit / Cancel -->
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
