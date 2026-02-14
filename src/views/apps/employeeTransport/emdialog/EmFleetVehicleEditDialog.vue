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

  vehicleTypes: {
    type: Array,
    required: true,
  },

  emVehicleType: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['submit', 'update:isDialogVisible'])

// states
const refVForm = ref()

const vehicleTypes = ref(props.vehicleTypes)
const emVehicleType = ref(props.emVehicleType)

const vehicleType = ref(emVehicleType.value.type)
const driverName = ref(emVehicleType.value.driverName)
const driverMobileNumber = ref(emVehicleType.value.driverMobile)
const ownerName = ref(emVehicleType.value.owner)
const plate = ref(emVehicleType.value.plate)
const seatsCount = ref(emVehicleType.value.seatsCount)

// methods
function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit('submit', {
        vehicleType: vehicleType.value,
        driverName: driverName.value,
        driverMobileNumber: driverMobileNumber.value,
        ownerName: ownerName.value,
        plate: plate.value,
        seatsCount: seatsCount.value,
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

function onVehicleTypeComboboxUpdate(selectedItem) {
  if (typeof selectedItem !== 'string') return

  if (!selectedItem.trim()) {
    vehicleType.value = null
    return
  }

  const existing = vehicleTypes.value.find(
    vehicleType => toComparisonKey(vehicleType.name) === toComparisonKey(selectedItem),
  )
  if (existing) {
    vehicleType.value = existing
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
          ویرایش وسیله نقلیه
        </h4>

        <!-- 👉 Form -->
        <VForm
          ref="refVForm"
          class="mt-6"
          validate-on="submit lazy"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- vehicle type -->
            <VCol cols="12" md="4">
              <VCombobox
                v-model="vehicleType"
                label="نوع"
                :items="vehicleTypes"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
                @update:model-value="onVehicleTypeComboboxUpdate"
              />
            </VCol>

            <!-- driver name -->
            <VCol cols="12" md="4">
              <VTextField
                v-model="driverName"
                :rules="[requiredValidator]"
                :disabled="loading"
                label="نام راننده"
              />
            </VCol>

            <!-- driver mobile number -->
            <VCol cols="12" md="4">
              <VTextField
                v-model="driverMobileNumber"
                :rules="[requiredValidator]"
                :disabled="loading"
                label="موبایل راننده"
              />
            </VCol>

            <!-- owner name -->
            <VCol cols="12" md="4">
              <VTextField
                v-model="ownerName"
                :rules="[requiredValidator]"
                :disabled="loading"
                label="نام صاحب"
              />
            </VCol>

            <!-- plate -->
            <VCol cols="12" md="4">
              <VTextField
                v-model="plate"
                :rules="[requiredValidator]"
                :disabled="loading"
                label="پلاک"
              />
            </VCol>

            <!-- seats count -->
            <VCol cols="12" md="4">
              <VTextField
                v-model="seatsCount"
                :rules="[requiredValidator]"
                :disabled="loading"
                type="number"
                label="تعداد مسافر(صندلی)"
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
