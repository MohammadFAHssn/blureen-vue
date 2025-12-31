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

  selectedUsers: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible', 'selectUser'])

// ----- states -----
const gridApi = shallowRef(null)
const initialState = ref(null)

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
  { headerName: 'کد پرسنلی', field: 'personnelCode' },
  { headerName: 'نام', field: 'firstName' },
  { headerName: 'نام خانوادگی', field: 'lastName' },
  {
    headerName: 'وضعیت',
    field: 'active',
    cellRenderer: 'Active',
    cellStyle: { 'display': 'flex', 'align-items': 'center' },
    filterParams: {
      valueFormatter: params => (params.value === 1 ? 'فعال' : 'غیرفعال'),
    },
  },
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
      active: user.active,
    }
  })
}

const autoGroupColumnDef = ref({
  filter: 'agGroupColumnFilter',
})

function addUsers() {
  emit(
    'selectUser',
    gridApi.value.getSelectedRows().map(user => Number.parseInt(user.id)),
  )
  emit('update:isDialogVisible', false)
}
// ----- end ag-grid -----

function dialogModelValueUpdate(val) {
  emit('update:isDialogVisible', val)
}

watch(
  () => props.isDialogVisible,
  (newVal) => {
    if (newVal) {
      initialState.value = {
        rowSelection: props.selectedUsers.map(user => String(user.id)),
      }
    }
  },
)
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
        <VCard style="block-size: 100%;" class="d-flex flex-column">
          <VCardTitle class="ma-3">
            انتخاب کاربران
          </VCardTitle>
          <VCardText>
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
                :initial-state="initialState"
                @grid-ready="onGridReady"
              />
            </section>
          </VCardText>

          <VCardActions>
            <VBtn color="primary" @click="addUsers">
              افزودن
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </VDialog>
</template>
