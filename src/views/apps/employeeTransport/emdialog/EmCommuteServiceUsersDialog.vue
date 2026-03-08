<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },

  service: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['submit', 'update:isDialogVisible'])

const service = ref(props.service)

function dialogModelValueUpdate(val) {
  emit('update:isDialogVisible', val)
}

// ----- start ag-grid -----
const { theme } = useAGGridTheme()
const columnDefs = ref([
  { headerName: 'نام', field: 'fullName' },
  { headerName: 'کد پرسنلی', field: 'personnelCode' },
  { headerName: 'شهر', field: 'city' },
  { headerName: 'کد ایستگاه', field: 'code' },
])

const rowData = computed(() => {
  if (!service.value || !service.value.stations) {
    return []
  }

  // Use flatMap to iterate over stations and then over passengers,
  // flattening the result into a single array.
  return service.value.stations.flatMap((station) => {
    // If there are no passengers for this station, return an empty array for this station's result
    if (!station.passengers || station.passengers.length === 0) {
      return []
    }

    return station.passengers.map(passenger => ({
      fullName: `${passenger.user.first_name} ${passenger.user.last_name}`,
      personnelCode: passenger.user.personnel_code,
      city: station.city,
      code: station.code,
    }))
  })
})

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
          کاربران سرویس - {{ service.shiftType }} {{ service.serviceCode }}
        </h4>
        <VRow justify="center">
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
        </VRow>
      </VCardText>
    </VCard>
  </VDialog>
</template>
