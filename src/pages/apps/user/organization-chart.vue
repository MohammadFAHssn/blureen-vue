<script setup>
import Positions from '@/views/apps/user/Positions.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'Organization-Chart',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  mode: 'view',
})

const pendingState = reactive({
  updateOrganizationChart: false,
})

const users = ref([])
const orgPositions = ref([])

const gridApi = shallowRef(null)

const selectedCostCenters = ref([])

// ----- start ag-grid -----

const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api

  gridApi.value.setGridOption('rowData', rowData())
}

const columnDefs = ref([
  { headerName: 'محل کار', field: 'workplace', rowGroup: true, hide: true },
  { headerName: 'منطقه کاری', field: 'workArea', rowGroup: true, hide: true },
  {
    headerName: 'مرکز هزینه',
    field: 'costCenter',
    valueFormatter: params => params.value?.name,
    rowGroup: true,
    hide: true,
  },
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

  isRowSelectable: rowNode => rowNode.field === 'costCenter',
})

function rowData() {
  return users.value?.map((user) => {
    return {
      id: user.id,
      personnelCode: Number.parseInt(user.personnel_code),
      firstName: user.first_name,
      lastName: user.last_name,
      active: user.active,
      workplace: user.profile?.workplace?.name,
      workArea: user.profile?.work_area?.name,
      costCenter: user.profile?.cost_center,
    }
  })
}

const autoGroupColumnDef = ref({
  filter: 'agGroupColumnFilter',
})

function onSelectionChanged() {
  const selectedNodes = gridApi.value.getSelectedNodes()

  selectedCostCenters.value = selectedNodes
    .filter(node => node.field === 'costCenter')
    .map(node => node.groupValue)
}

// ----- end ag-grid -----

async function fetchUsers() {
  try {
    const { data, error } = await useApi(
      createUrl('/base/user', {
        query: {
          'fields[users]': 'id,first_name,last_name,personnel_code,active',
          'fields[profiles]': 'id,user_id,workplace_id,work_area_id,cost_center_id',
          'include':
            'profile.workplace,profile.workArea,profile.costCenter',
        },
      }),
    )

    if (error.value) throw error.value

    users.value = data.value.data
    gridApi.value?.setGridOption('rowData', rowData())
  }
  catch (e) {
    console.error('Error fetching users:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت کاربران'
  }
}

async function fetchOrgPositions() {
  try {
    const { data, error } = await useApi(
      createUrl('/base/org-position'),
    )

    if (error.value) throw error.value

    orgPositions.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching organization positions:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت سمت‌ها'
  }
}

function onSave() {
  uiState.mode = 'view'
}

fetchUsers()
await fetchOrgPositions()
</script>

<template>
  <VLayout class="app-layout">
    <VSnackbar
      v-model="uiState.hasError"
      :timeout="2000"
      location="center"
      variant="flat"
      color="error"
    >
      {{ uiState.errorMessage }}
    </VSnackbar>

    <div>
      <Positions
        v-if="selectedCostCenters.length > 0 || uiState.mode === 'edit'"
        :mode="uiState.mode"
        :cost-centers="selectedCostCenters"
        :loading="pendingState.updateOrganizationChart"
        @edit="uiState.mode = 'edit'"
        @save="onSave"
        @cancel="uiState.mode = 'view'"
      />
    </div>

    <section style="block-size: 100%;">
      <AgGridVue
        style="block-size: 100%; inline-size: 100%;"
        :column-defs="columnDefs"
        :get-row-id="(params) => String(params.data.id)"
        enable-rtl
        row-numbers
        pagination
        group-display-type="multipleColumns"
        :auto-group-column-def="autoGroupColumnDef"
        cell-selection
        :row-selection="rowSelection"
        :theme="theme"
        @grid-ready="onGridReady"
        @selection-changed="onSelectionChanged"
      />
    </section>
  </VLayout>
</template>

<style lang="scss" scoped>
@use '@styles/variables/vuetify';
@use '@core/scss/base/mixins';

.app-layout {
  @include mixins.elevation(vuetify.$card-elevation);

  display: grid;
  box-shadow: none;
  grid-template-columns: auto;
  grid-template-rows: auto 1fr;
}
</style>
