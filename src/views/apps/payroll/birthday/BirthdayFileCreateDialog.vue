<script setup>
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

const constants = inject('constants')

// states
const birthdayFileDate = ref(null)
const refVForm = ref()
const birthdayFile = ref(null)

const fileInputRules = [
  (fileList) => {
    
    if (!fileList.length) {
      return true
    }

    const extension = fileList[0].name.split('.').pop().toLowerCase()
    if (extension !== 'xlsx' && extension !== 'xls') {
      return 'لطفا یک فایل اکسل معتبر انتخاب کنید!'
    }

    if (fileList[0].size > constants.MAX_FILE_SIZE) {
      return 'حجم فایل باید کمتر از 5 مگابایت باشد!'
    }

    return true
  },
]

const datePickerRules = [
  () => !!birthdayFileDate.value || 'لطفا دوره هدیه را انتخاب کنید!',
]

// methods
function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit('submit', {
        birthdayFileDate: birthdayFileDate.value,
        birthdayFile: birthdayFile.value,
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
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 900" :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate">
    
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardText>
        
        <h4 class="text-h5 text-center mb-2">
          افزودن فایل هدیه جدید
        </h4>

        <!-- 👉 Form -->
        <VForm ref="refVForm" class="mt-6" validate-on="submit lazy" @submit.prevent="onFormSubmit">
          <VRow>
            <!-- Time Period -->
            <VCol cols="12" md="6">
              <VInput :rules="datePickerRules" :disabled="loading">
              <PersianDatetimePicker v-model="birthdayFileDate" :disabled="loading" type="year-month" simple
                label="دوره هدیه" />
              </VInput>
            </VCol>

            <!-- Excel File -->
            <VCol cols="12" md="6">
              <VFileInput v-model="birthdayFile" :disabled="loading" label="فایل اکسل" accept=".xlsx, .xls"
                :rules="[requiredValidator, ...fileInputRules]" />
            </VCol>

            <!-- Submit and Cancel -->
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit" :disabled="loading" :loading="loading" @click="refVForm?.validate()">
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
