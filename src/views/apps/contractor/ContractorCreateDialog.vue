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

// states
const contractorFirstName = ref(null)
const contractorLastName = ref(null)
const description = ref(null)
const refVForm = ref()

// methods
function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit('submit', {
        contractorFirstName: contractorFirstName.value,
        contractorLastName: contractorLastName.value,
        description: description.value,
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
          افزودن پیمانکار
        </h4>

        <!-- 👉 Form -->
        <VForm
          ref="refVForm"
          class="mt-6"
          validate-on="submit lazy"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- contractor first name -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="contractorFirstName"
                :rules="[requiredValidator]"
                :disabled="loading"
                label="نام"
              />
            </VCol>

            <!-- contractor last name -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="contractorLastName"
                :rules="[requiredValidator]"
                :disabled="loading"
                label="نام خانوادگی"
              />
            </VCol>

            <!-- description -->
            <VCol cols="12" md="12">
              <VTextField
                v-model="description"
                :disabled="loading"
                label="توضیحات - اختیاری"
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
