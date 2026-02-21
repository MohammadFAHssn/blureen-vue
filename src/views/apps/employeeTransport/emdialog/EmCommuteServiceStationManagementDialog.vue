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

  commuteStations: {
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

const commuteStations = ref(props.commuteStations)
const service = ref(props.service)

const selectedStations = ref([])

// methods
function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit('submit', {
        selectedStations: selectedStations.value,
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

// ----- start ag-grid -----
const { theme } = useAGGridTheme()
const columnDefs = ref([
  { headerName: 'شهر', field: 'city', sort: 'desc' },
  { headerName: 'خیابان اصلی', field: 'mainStreet' },
  { headerName: 'خیابان فرعی', field: 'sideStreet' },
  { headerName: 'محل سوار شدن', field: 'boardingPlace' },
  { headerName: 'کد', field: 'code' },
])

const rowData = computed(() =>
  service.value.stations?.map((station) => {
    return {
      city: station.city,
      mainStreet: station.mainStreet,
      sideStreet: station.sideStreet,
      boardingPlace: station.boardingPlace,
      code: station.code,
    }
  }),
)
// ----- end ag-grid -----
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 1000"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardText>
        <h4 class="text-h5 text-center mb-2">
          ایستگاه‌ها
        </h4>

        <!-- 👉 Form -->
        <VForm
          ref="refVForm"
          class="mt-6"
          validate-on="submit lazy"
          @submit.prevent="onFormSubmit"
        >
          <VRow justify="center">
            <!-- selectedStations -->
            <VCol cols="12" md="12">
              <VAutocomplete
                v-model="selectedStations"
                label="ایستگاه‌های جدید"
                :items="commuteStations"
                item-title="name"
                item-value="id"
                chips
                clearable
                multiple
                :rules="[requiredValidator]"
                variant="outlined"
              />
            </VCol>

            <!-- existing Stations -->
            <div class="ma-3 overflow-auto">
              <VCard style="height: 450px; width: 900px;">
                <section style="height: 100%; width: 100%;">
                  <AgGridVue
                    style="block-size: 100%; inline-size: 100%"
                    :column-defs="columnDefs"
                    :row-data="rowData"
                    enable-rtl
                    row-numbers
                    pagination
                    :theme="theme"
                  />
                </section>
              </VCard>
            </div>

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
