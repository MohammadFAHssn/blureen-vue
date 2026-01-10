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
const selectedPersonnels = ref([])
const selectedMeal = ref(null)
const refVForm = ref()
function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit('submit', {
        selectedPersonnels: selectedPersonnels.value,
        selectedMeal: selectedMeal.value,
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
          افزودن استثناء
        </h4>
        <VForm
          ref="refVForm"
          class="mt-6"
          validate-on="submit lazy"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="selectedPersonnels"
                :items="users"
                item-title="fullName"
                item-value="id"
                label="افراد"
                multiple
                chips
                clearable
                variant="outlined"
                :rules="[requiredValidator]"
              />
            </VCol>
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
              />
            </VCol>
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn
                type="submit"
                :disabled="loading"
                :loading="loading"
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
