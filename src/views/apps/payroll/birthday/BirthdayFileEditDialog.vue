<script setup>
const props = defineProps({
  file: Object,
  loading: Boolean,
  isDialogVisible: Boolean,
})

const emit = defineEmits(['submit', 'update:isDialogVisible'])

// states
const birthdayFileDate = ref(null)
const refVForm = ref()
const birthdayFile = ref(null)
const birthdayFileStatus = ref(props.file.selectedBirthdayFile.status)
const allStatus = ref([
  { label: 'فعال', value: 1 },
  { label: 'غیرفعال', value: 0 },
])

const fileInputRules = [
  (file) => {
    if (!file) return true

    const ext = file.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls'].includes(ext))
      return 'لطفا یک فایل اکسل معتبر انتخاب کنید!'

    if (file.size > MAX_FILE_SIZE)
      return 'حجم فایل باید کمتر از 5 مگابایت باشد!'

    return true
  },
]

// methods
function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit('submit', {
        birthdayFileDate: birthdayFileDate.value,
        birthdayFile: birthdayFile.value,
        birthdayFileStatus: birthdayFileStatus.value,
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
        ویرایش فایل هدیه: {{ props.file.selectedBirthdayFile.name }}
      </VCardTitle>

      <VCardText>
        <VRow>
          <VCol cols="12" sm="6">
            <p><strong>ماه:</strong> {{ props.file.selectedBirthdayFile.month }}</p>
          </VCol>
          <VCol cols="12" sm="6">
            <p><strong>سال:</strong> {{ props.file.selectedBirthdayFile.year }}</p>
          </VCol>
        </VRow>

        <VDivider class="my-3" />

        <VForm ref="refVForm" @submit.prevent="onFormSubmit">
          <VRow>
            <!-- Time Period -->
            <VCol cols="12" md="6">
              <VInput :disabled="loading">
                <PersianDatetimePicker
                  v-model="birthdayFileDate"
                  :disabled="loading"
                  type="year-month"
                  simple
                  label="دوره هدیه"
                />
              </VInput>
            </VCol>

            <!-- Excel File -->
            <VCol cols="12" md="6">
              <VFileInput
                v-model="birthdayFile"
                :disabled="loading"
                label="فایل اکسل"
                accept=".xlsx, .xls"
                :rules="fileInputRules"
              />
            </VCol>
            <VCol cols="12" md="12">
              <VSelect
                v-model="birthdayFileStatus"
                :items="allStatus"
                item-title="label"
                item-value="value"
                label="وضعیت"
                variant="outlined"
                clearable
              />
            </VCol>

            <!-- Submit and Cancel -->
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn
                type="submit"
                :disabled="loading"
                :loading="loading"
                @click="refVForm?.validate()"
              >
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
