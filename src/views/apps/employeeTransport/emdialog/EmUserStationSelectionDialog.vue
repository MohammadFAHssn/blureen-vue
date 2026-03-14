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

  shiftTypes: {
    type: Array,
    required: true,
  },

  stations: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['submit', 'update:isDialogVisible'])

const pendingState = reactive({
  fetchingEmCommuteStations: false,
})

// states
const refVForm = ref()

const shiftTypes = ref(props.shiftTypes)
const cities = ref(props.cities)
const emCommuteStations = ref([])
const selectedEmShiftType = ref(null)
const selectedEmCity = ref(null)
const selectedMainStreet = ref(null)
const selectedSideStreet = ref(null)
const selectedStation = ref(null)

const stationTree = computed(() => {
  const tree = {}

  emCommuteStations.value.forEach((s) => {
    const city = s.emCity.id
    const main = s.mainStreet
    const side = s.sideStreet

    tree[city] ??= {}
    tree[city][main] ??= {}
    tree[city][main][side] ??= []

    tree[city][main][side].push(s)
  })

  return tree
})
const mainStreets = computed(() => {
  return selectedEmCity.value
    ? Object.keys(stationTree.value[selectedEmCity.value] || {})
    : []
})
const sideStreets = computed(() => {
  return selectedEmCity.value && selectedMainStreet.value
    ? Object.keys(
        stationTree.value[selectedEmCity.value]?.[selectedMainStreet.value] || {},
      )
    : []
})
const boardingPlaces = computed(() => {
  return selectedEmCity.value
    && selectedMainStreet.value
    && selectedSideStreet.value
    ? stationTree.value[selectedEmCity.value]?.[
      selectedMainStreet.value
    ]?.[selectedSideStreet.value] || []
    : []
})

// methods
function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit('submit', {
        shiftType: selectedEmShiftType.value,
        selectedStation: selectedStation.value,
      })
    }
  })
}

async function fetchEmCommuteStations() {
  pendingState.fetchingEmCommuteStations = true
  try {
    const res = await $api('/employee-transport/commute-station/getUsed', {
      method: 'GET',
      params: {
        shiftTypeId: selectedEmShiftType.value,
      },
      onResponseError({ response }) {
        const msg = response?._data?.errors
          ? Object.values(response._data.errors).flat().join(' | ')
          : (response?._data?.message || 'خطا در دریافت ایستگاه‌ها')
        throw new Error(msg)
      },
    })
    emCommuteStations.value = res?.data?.emCommuteStations || []
  }
  catch (err) {
    console.error(err)
    setError(err?.message || 'خطای غیرمنتظره در دریافت ایستگاه‌ها')
  }
  finally {
    pendingState.fetchingEmCommuteStations = false
  }
}

function onFormReset() {
  emit('update:isDialogVisible', false)
}

function dialogModelValueUpdate(val) {
  emit('update:isDialogVisible', val)
}

watch(selectedEmShiftType, () => {
  fetchEmCommuteStations()
  selectedEmCity.value = null
  selectedMainStreet.value = null
  selectedSideStreet.value = null
  selectedStation.value = null
})

watch(selectedEmCity, () => {
  selectedMainStreet.value = null
  selectedSideStreet.value = null
  selectedStation.value = null
})
watch(selectedMainStreet, () => {
  selectedSideStreet.value = null
  selectedStation.value = null
})
watch(selectedSideStreet, () => {
  selectedStation.value = null
})
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
          انتخاب ایستگاه
        </h4>

        <!-- 👉 Form -->
        <VForm
          ref="refVForm"
          class="mt-6"
          validate-on="submit lazy"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- shift type -->
            <VCol cols="12" md="3">
              <VAutocomplete
                v-model="selectedEmShiftType"
                label="نوع شیفت"
                :items="shiftTypes"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
                :disabled="loading"
              />
            </VCol>

            <!-- city -->
            <VCol cols="12" md="4">
              <VAutocomplete
                v-model="selectedEmCity"
                label="شهر"
                :items="cities"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
                :disabled="loading"
              />
            </VCol>

            <!-- main street -->
            <VCol cols="12" md="5">
              <VAutocomplete
                v-model="selectedMainStreet"
                label="خیابان اصلی"
                :items="mainStreets"
                item-title="name"
                item-value="name"
                :rules="[requiredValidator]"
                :disabled="pendingState.fetchingEmCommuteStations"
              />
            </VCol>

            <!-- side street -->
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="selectedSideStreet"
                label="خیابان فرعی"
                :items="sideStreets"
                item-title="name"
                item-value="name"
                :rules="[requiredValidator]"
                :disabled="pendingState.fetchingEmCommuteStations"
              />
            </VCol>

            <!-- boarding place -->
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="selectedStation"
                label="محل سوار شدن(ایستگاه)"
                :items="boardingPlaces"
                item-title="boardingPlace"
                item-value="id"
                :rules="[requiredValidator]"
                :disabled="pendingState.fetchingEmCommuteStations"
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
