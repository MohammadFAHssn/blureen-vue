<script setup>
const props = defineProps({
  file: Object,
  loading: Boolean,
  isDialogVisible: Boolean,
})

const emit = defineEmits(['submit', 'update:isDialogVisible'])

// states
const refVForm = ref()
const healthCertificateDate = ref(null)
const healthCertificateName = ref(props.file.name)
const healthCertificateStatus = ref(props.file.status)
const allStatus = ref([
  { label: 'فعال', value: 1 },
  { label: 'غیرفعال', value: 0 },
])

// methods
function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit('submit', {
        healthCertificateDate: healthCertificateDate.value,
        healthCertificateName: healthCertificateName.value,
        healthCertificateStatus: healthCertificateStatus.value,
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
      <VCardTitle class="text-h6">
        ویرایش گروه شناسنامه
      </VCardTitle>

      <VCardText>
        <VRow>
          <VCol cols="12" sm="6">
            <p><strong>ماه:</strong> {{ props.file.month }}</p>
          </VCol>
          <VCol cols="12" sm="6">
            <p><strong>سال:</strong> {{ props.file.year }}</p>
          </VCol>
        </VRow>

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
              <VInput :disabled="loading">
                <PersianDatetimePicker
                  v-model="healthCertificateDate"
                  :disabled="loading"
                  type="year-month"
                  simple
                  label="دوره شناسنامه"
                />
              </VInput>
            </VCol>

            <!-- Status -->
            <VCol cols="12" md="12">
              <VSelect
                v-model="healthCertificateStatus"
                :items="allStatus"
                item-title="label"
                item-value="value"
                label="وضعیت"
                variant="outlined"
                clearable
              />
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
