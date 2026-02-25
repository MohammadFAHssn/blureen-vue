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

  shiftTypes: {
    type: Array,
    required: true,
  },

  fleetVehicles: {
    type: Array,
    required: true,
  },

  service: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['submit', 'update:isDialogVisible'])

// states
const refVForm = ref()

// const shiftTypes = ref(props.shiftTypes)
const fleetVehicles = ref(props.fleetVehicles)
const service = ref(props.service)

const shiftType = ref(service.value.shiftType)
const fleetVehicle = ref(service.value.fleetVehicle)
const serviceCode = ref(service.value.serviceCode)

// methods
function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit('submit', {
        shiftType: shiftType.value,
        fleetVehicle: fleetVehicle.value,
        serviceCode: serviceCode.value,
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

// function onShiftTypeComboboxUpdate(selectedItem) {
//   if (typeof selectedItem !== 'string') return

//   if (!selectedItem.trim()) {
//     shiftType.value = null
//     return
//   }

//   const existing = shiftTypes.value.find(
//     shiftType => toComparisonKey(shiftType.name) === toComparisonKey(selectedItem),
//   )
//   if (existing) {
//     shiftType.value = existing
//   }
// }
// function toComparisonKey(str) {
//   return (str || '').toString().replace(/[\s\u200C]+/g, '')
// }
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
          ویرایش: {{ serviceCode }} - {{ shiftType }}
        </h4>

        <!-- 👉 Form -->
        <VForm
          ref="refVForm"
          class="mt-6"
          validate-on="submit lazy"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- fleetVehicle -->
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="fleetVehicle"
                label="وسیله نقلیه"
                :items="fleetVehicles"
                item-title="vehicle"
                item-value="id"
                chips
                clearable
                :rules="[requiredValidator]"
                variant="outlined"
              />
            </VCol>

            <!-- shiftType -->
            <!-- <VCol cols="12" md="6">
              <VCombobox
                v-model="shiftType"
                label="نوع شیفت"
                :items="shiftTypes"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
                @update:model-value="onShiftTypeComboboxUpdate"
              />
            </VCol> -->

            <!-- serviceCode -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="serviceCode"
                :rules="[requiredValidator]"
                :disabled="loading"
                label="کد"
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
