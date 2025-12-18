<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },

  users: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible'])

// ----- states -----
const gridApi = shallowRef(null)

// ----- start ag-grid -----

const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api

  gridApi.value.setGridOption('rowData', rowData())
}

const columnDefs = ref([
  { headerName: 'محل کار', field: 'workplace', rowGroup: true, hide: true },
  { headerName: 'منطقه کاری', field: 'workArea', rowGroup: true, hide: true },
  { headerName: 'مرکز هزینه', field: 'costCenter', rowGroup: true, hide: true },
  { headerName: 'سمت شغلی', field: 'jobPosition', rowGroup: true, hide: true },
  { headerName: 'کد پرسنلی', field: 'personnelCode' },
  { headerName: 'نام', field: 'firstName' },
  { headerName: 'نام خانوادگی', field: 'lastName' },
])

const rowSelection = ref({
  mode: 'multiRow',
  enableClickSelection: true,
  selectAll: 'filtered',
  groupSelects: 'filteredDescendants',
})

function rowData() {
  return props.users.map((user) => {
    return {
      id: user.id,
      personnelCode: Number.parseInt(user.personnel_code),
      firstName: user.first_name,
      lastName: user.last_name,
      workplace: user.profile?.workplace?.name,
      workArea: user.profile?.work_area?.name,
      costCenter: user.profile?.cost_center?.name,
      jobPosition: user.profile?.job_position?.name,
    }
  })
}

const autoGroupColumnDef = ref({
  filter: 'agGroupColumnFilter',
})

// ----- end ag-grid -----

function dialogModelValueUpdate(val) {
  emit('update:isDialogVisible', val)
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : '90%'"
    :height="$vuetify.display.smAndDown ? 'auto' : '90%'"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VRow>
      <VCol>
        <VCard style="block-size: 100%;">
          <VCardText style="block-size: 100%;">
            <section style="block-size: 100%;">
              <AgGridVue
                style="block-size: 100%; inline-size: 100%;"
                :column-defs="columnDefs"
                :get-row-id="(params) => String(params.data.id)"
                enable-rtl
                pagination
                group-display-type="multipleColumns"
                :auto-group-column-def="autoGroupColumnDef"
                cell-selection
                :row-selection="rowSelection"
                :theme="theme"
                @grid-ready="onGridReady"
              />
            </section>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VDialog>
</template>
