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
  meals: {
    type: Array,
    required: true,
  },
  users: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['submit', 'update:isDialogVisible'])
const uiState = reactive({
  hasError: false,
  errorMessage: '',
})

const date = ref([])
const selectedMeal = ref(null)
const refVForm = ref()
function onFormSubmit() {
  if (!Array.isArray(date.value) || !date.value[0] || !date.value[1]) {
    uiState.hasError = true
    uiState.errorMessage = 'تاریخ باید به صورت بازه‌ای باشد'
    return
  }

  refVForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('submit', {
        date: date.value,
        meal: selectedMeal.value,
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
          تهیه گزارش
        </h4>
        <VForm
          ref="refVForm"
          class="mt-6"
          validate-on="submit lazy"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <VCol cols="12" md="6">
              <VSelect
                v-model="selectedMeal"
                :items="meals"
                item-title="name"
                item-value="id"
                label="وعده"
                variant="outlined"
                clearable
                :rules="[requiredValidator]"
                :disabled="loading"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VInput :error="uiState.hasError" :error-messages="uiState.errorMessage" :disabled="loading">
                <PersianDatetimePicker
                  v-model="date"
                  range
                  format="jYYYY/jMM/jDD"
                  label="بازه زمانی"
                />
              </VInput>
            </VCol>

            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn
                type="submit"
                :disabled="loading"
                :loading="loading"
              >
                جستجو
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
