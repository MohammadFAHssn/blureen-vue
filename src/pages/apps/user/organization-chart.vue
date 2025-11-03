<script setup>
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
})

const users = ref([])
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
  {
    headerName: 'مرکز هزینه',
    field: 'costCenter',
    valueFormatter: params => params.value?.name,
    rowGroup: true,
    hide: true,
  },
  {
    headerName: 'سمت شغلی',
    field: 'jobPosition',
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

  isRowSelectable: rowNode => rowNode.field === 'jobPosition',
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
      jobPosition: user.profile?.job_position,
    }
  })
}

const autoGroupColumnDef = ref({
  filter: 'agGroupColumnFilter',
})

// ----- end ag-grid -----

async function fetchUsers() {
  try {
    const { data, error } = await useApi(
      createUrl('/base/user', {
        query: {
          'fields[users]': 'id,first_name,last_name,personnel_code,active',
          'fields[profiles]': 'id,user_id,workplace_id,work_area_id,cost_center_id,job_position_id',
          'include':
            'profile.workplace,profile.workArea,profile.costCenter,profile.jobPosition',
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

await fetchUsers()
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
  grid-template-columns: auto;
  grid-template-rows: auto;
}
</style>
