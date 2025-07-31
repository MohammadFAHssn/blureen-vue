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

const emit = defineEmits(["submit", "update:isDialogVisible"])

const constants = inject("constants")

// states
const payrollBatchDate = ref(null)
const refVForm = ref()
const payrollBatchFile = ref(null)

//

const fileInputRules = [
  fileList => {
    // if no file is selected yet
    if (!fileList.length) {
      return true
    }

    const extension = fileList[0].name.split(".").pop().toLowerCase()
    if (extension !== "xlsx" && extension !== "xls") {
      return "لطفا یک فایل اکسل معتبر انتخاب کنید!"
    }

    if (fileList[0].size > constants.MAX_FILE_SIZE) {
      return "حجم فایل باید کمتر از 5 مگابایت باشد!"
    }

    return true
  },
]

const datePickerRules = [
  () => !!payrollBatchDate.value || "لطفا دوره فیش را انتخاب کنید!",
]

// methods

const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit("submit", {
        payrollBatchDate: payrollBatchDate.value,
        payrollBatchFile: payrollBatchFile.value,
      })
    }
  })
}

const onFormReset = () => {
  // userData.value = structuredClone(toRaw(props.userData))
  emit("update:isDialogVisible", false)
}

const dialogModelValueUpdate = val => {
  emit("update:isDialogVisible", val)
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-sm-10 pa-2">
      <VCardText>
        <!-- 👉 Title -->
        <h4 class="text-h5 text-center mb-2">
          افزودن فیش حقوقی جدید
        </h4>

        <!-- 👉 Form -->
        <VForm
          ref="refVForm"
          class="mt-6"
          validate-on="submit lazy"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <VInput
                :rules="datePickerRules"
                :disabled="loading"
              >
                <PersianDatetimePicker
                  v-model="payrollBatchDate"
                  :disabled="loading"
                  type="year-month"
                  simple
                  label="دوره فیش"
                />
              </VInput>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VFileInput
                v-model="payrollBatchFile"
                :disabled="loading"
                label="فایل اکسل"
                accept=".xlsx, .xls"
                :rules="[requiredValidator, ...fileInputRules]"
              />
            </VCol>

            <!-- 👉 Submit and Cancel -->
            <VCol
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >
              <VBtn
                type="submit"
                :disabled="loading"
                :loading="loading"
                @click="refVForm?.validate()"
              >
                ذخیره
              </VBtn>

              <VBtn
                color="secondary"
                variant="tonal"
                @click="onFormReset"
              >
                انصراف
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
