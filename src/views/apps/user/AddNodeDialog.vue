<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['add', 'update:isDialogVisible'])

function onFormSubmit() {
  emit('add')
  emit('update:isDialogVisible', false)
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
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-1">
      <VCardText>
        <!-- 👉 Title -->
        <h6 class="text-h6 text-center mb-6">
          افزودن گره جدید
        </h6>

        <!-- 👉 Form -->
        <VForm @submit.prevent="onFormSubmit">
          <VRow>
            <!-- 👉 Org Position -->
            <VCol cols="12" md="6">
              <v-combobox
                label="سمت"
                :items="['مدیر', 'سرپرست', 'سرشیفت']"
              />
            </VCol>

            <!-- 👉 Org unit -->
            <VCol cols="12" md="6">
              <v-combobox
                label="واحد"
                :items="['کارگزینی', 'بلوک', 'فلوت']"
              />
            </VCol>

            <!-- 👉 Submit and Cancel -->
            <VCol cols="12" class="d-flex justify-center gap-4">
              <VBtn type="submit">
                افزودن
              </VBtn>

              <VBtn color="secondary" variant="tonal" @click="onFormReset">
                بستن
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
