<script setup>
const props = defineProps({
  file: Object,
  loading: Boolean,
  isDialogVisible: Boolean,
})

const emit = defineEmits(['submit', 'update:isDialogVisible'])

// states
const birthdayGiftName = ref(props.file.selectedBirthdayGift.name)
const birthdayGiftCode = ref(props.file.selectedBirthdayGift.code)
const birthdayGiftAmount = ref(props.file.selectedBirthdayGift.amount)
const refVForm = ref()
const allStatus = ref([
  { label: 'فعال', value: 1 },
  { label: 'غیرفعال', value: 0 },
])
const birthdayGiftImage = ref(props.file.selectedBirthdayGift.iamge)
const birthdayGiftStatus = ref(props.file.selectedBirthdayGift.status)

const imageInputRules = [
  (file) => {
    if (!file) return true

    const ext = file.name.split('.').pop().toLowerCase()
    if (!['png', 'jpg', 'jpeg'].includes(ext))
      return 'فقط تصاویر با فرمت PNG یا JPG یا JPEG مجاز هستند!'

    if (file.size > 2 * 1024 * 1024)
      return 'حجم تصویر باید کمتر از ۲ مگابایت باشد!'

    return true
  },
]

// methods
function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit('submit', {
        birthdayGiftName: birthdayGiftName.value,
        birthdayGiftCode: birthdayGiftCode.value,
        birthdayGiftAmount: birthdayGiftAmount.value,
        birthdayGiftImage: birthdayGiftImage.value,
        birthdayGiftStatus: birthdayGiftStatus.value,
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
          ویرایش هدیه
        </h4>

        <!-- 👉 Form -->
        <VForm
          ref="refVForm"
          class="mt-6"
          validate-on="submit lazy"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- Gift Name -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="birthdayGiftName"
                :rules="[requiredValidator]"
                :disabled="loading"
                label="نام هدیه"
              />
            </VCol>

            <!-- Gift Code -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="birthdayGiftCode"
                :rules="[requiredValidator]"
                :disabled="loading"
                label="کد هدیه"
              />
            </VCol>

            <!-- Gift Amount -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="birthdayGiftAmount"
                :rules="[requiredValidator]"
                :disabled="loading"
                label="موجودی"
              />
            </VCol>

            <!-- Gift Status -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="birthdayGiftStatus"
                :items="allStatus"
                item-title="label"
                item-value="value"
                label="وضعیت"
                variant="outlined"
                clearable
              />
            </VCol>

            <!-- Gift Image -->
            <VCol cols="12" class="mb-3">
              <VFileInput
                v-model="birthdayGiftImage"
                :disabled="loading"
                label="تصویر"
                accept=".jpeg, .png, .jpg"
                :rules="imageInputRules"
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
