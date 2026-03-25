<script setup>
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'

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

const emit = defineEmits(['submit', 'deleteServiceStation', 'update:isDialogVisible'])

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isServiceStationDeleteDialogVisible: false,
})
const pendingState = reactive({
  deleteServiceStation: false,
})
const refVForm = ref()

const commuteStations = ref(props.commuteStations)
const service = ref(props.service)

const selectedStations = ref([])
const gridSelectedStations = ref([])
const selectedCount = computed(() => gridSelectedStations.value.length)

// methods
function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}

function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      emit('submit', {
        selectedStations: selectedStations.value,
      })
    }
  })
}

async function onDelete() {
  pendingState.deleteServiceStation = true
  try {
    const res = await $api('/employee-transport/service/station/delete', {
      method: 'DELETE',
      body: {
        gridSelectedStations: gridSelectedStations.value,
      },
      onResponseError({ response }) {
        setError(response._data?.message || 'خطا در حذف')
      },
    })

    if (res?.data) {
      service.value.stations = service.value.stations.filter(
        station => !gridSelectedStations.value.includes(station.serviceStationId),
      )
      emit('deleteServiceStation')
      uiState.isServiceStationDeleteDialogVisible = false
    }
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.deleteServiceStation = false
  }
}

function onFormReset() {
  emit('update:isDialogVisible', false)
}

function dialogModelValueUpdate(val) {
  emit('update:isDialogVisible', val)
}

// ----- start ag-grid -----
const { theme } = useAGGridTheme()
const gridApi = ref(null)
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
      id: station.serviceStationId,
      city: station.city,
      mainStreet: station.mainStreet,
      sideStreet: station.sideStreet,
      boardingPlace: station.boardingPlace,
      code: station.code,
    }
  }),
)
// checkbox selection
function syncSelectedIds() {
  const rows = gridApi.value?.getSelectedRows?.() ?? []
  gridSelectedStations.value = rows
    .map(r => r?.id ?? r?.currentItem?.id)
    .filter(Boolean)
}

function onGridReady(params) {
  gridApi.value = params.api
  syncSelectedIds()
}

function onSelectionChanged() {
  syncSelectedIds()
  gridApi.value?.refreshCells?.({ force: true })
}
// ----- end ag-grid -----
</script>

<template>
  <VSnackbar
    v-model="uiState.hasError"
    :timeout="2000"
    location="center"
    variant="flat"
    color="error"
  >
    {{ uiState.errorMessage }}
  </VSnackbar>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 1000"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardText>
        <h4 class="text-h5 text-center mb-2">
          ایستگاه‌ها - {{ service.shiftType }} {{ service.serviceCode }}
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

            <VCol cols="12" md="12">
              <VBtn :disabled="selectedCount < 1" color="error" @click="uiState.isServiceStationDeleteDialogVisible = true">
                حذف ({{ selectedCount }})
              </VBtn>
            </VCol>

            <!-- existing Stations -->
            <div class="ma-3 overflow-auto">
              <VCard style="height: 450px; width: 900px;">
                <section style="height: 100%; width: 100%;">
                  <AgGridVue
                    style="block-size: 100%; inline-size: 100%"
                    :column-defs="columnDefs"
                    :row-data="rowData"
                    :row-selection="{
                      mode: 'multiRow',
                      enableClickSelection: true,
                    }"
                    enable-rtl
                    row-numbers
                    pagination
                    :theme="theme"
                    @grid-ready="onGridReady"
                    @selection-changed="onSelectionChanged"
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

  <AreYouSureDialog
    v-if="uiState.isServiceStationDeleteDialogVisible"
    v-model:is-dialog-visible="uiState.isServiceStationDeleteDialogVisible"
    title="با حذف ایستگاه/های انتخاب شده از سرویس، انتخاب کاربران این ایستگاه/ها از بین می‌رود. آیا ادامه می‌دهید؟"
    :loading="pendingState.deleteServiceStation"
    @confirm="onDelete"
  />
</template>
