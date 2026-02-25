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

  cities: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['submit', 'update:isDialogVisible'])

// states
const refVForm = ref()

const cities = ref(props.cities)

const city = ref(null)
const mainStreet = ref(null)
const sideStreet = ref(null)
const boardingPlace = ref(null)
const code = ref(null)

// methods
function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit('submit', {
        cityName: city.value,
        mainStreet: mainStreet.value,
        sideStreet: sideStreet.value,
        boardingPlace: boardingPlace.value,
        code: code.value,
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

function onCityComboboxUpdate(selectedItem) {
  if (typeof selectedItem !== 'string') return

  if (!selectedItem.trim()) {
    city.value = null
    return
  }

  const existing = cities.value.find(
    city => toComparisonKey(city.name) === toComparisonKey(selectedItem),
  )
  if (existing) {
    city.value = existing
  }
}
function toComparisonKey(str) {
  return (str || '').toString().replace(/[\s\u200C]+/g, '')
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
          افزودن ایستگاه
        </h4>

        <!-- 👉 Form -->
        <VForm
          ref="refVForm"
          class="mt-6"
          validate-on="submit lazy"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- city -->
            <VCol cols="12" md="6">
              <VCombobox
                v-model="city"
                label="شهر"
                :items="cities"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
                @update:model-value="onCityComboboxUpdate"
              />
            </VCol>

            <!-- code -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="code"
                :rules="[requiredValidator]"
                :disabled="loading"
                label="کد"
              />
            </VCol>

            <!-- main street -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="mainStreet"
                :rules="[requiredValidator]"
                :disabled="loading"
                label="خیابان اصلی"
              />
            </VCol>

            <!-- side street -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="sideStreet"
                :rules="[requiredValidator]"
                :disabled="loading"
                label="خیابان فرعی"
              />
            </VCol>

            <!-- boarding place -->
            <VCol cols="12" md="12">
              <VTextField
                v-model="boardingPlace"
                :rules="[requiredValidator]"
                :disabled="loading"
                label="محل سوار شدن"
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
