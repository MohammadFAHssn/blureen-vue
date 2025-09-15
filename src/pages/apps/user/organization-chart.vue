<script setup>
definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'Approval-Levels',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
})

const users = ref([])
const gridApi = ref(null)

// ----- start ag-grid -----

const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
}

const columnDefs = ref([
  { headerName: 'محل کار', field: 'workplace', rowGroup: true, hide: true },
  { headerName: 'منطقه کاری', field: 'workArea', rowGroup: true, hide: true },
  { headerName: 'مرکز هزینه', field: 'costCenter', rowGroup: true, hide: true },
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
])

const rowSelection = ref({
  mode: 'multiRow',
  enableClickSelection: true,
  selectAll: 'filtered',
})

const rowData = computed(() =>
  users.value?.flatMap(user =>
    user.active
      ? {
          personnelCode: Number.parseInt(user.personnel_code),
          firstName: user.first_name,
          lastName: user.last_name,
          workplace: user.profile?.workplace?.name,
          workArea: user.profile?.work_area?.name,
          costCenter: user.profile?.cost_center?.name,
          jobPosition: user.profile?.job_position,
        }
      : [],
  ),
)

function getContextMenuItems(params) {
  if (!params.node.isSelected()) {
    params.api.deselectAll()
    params.node.setSelected(true)
  }

  console.log(params.api.getSelectedNodes())

  const selectedNodes = params.api.getSelectedNodes()

  const requester = []
  for (const node of selectedNodes) {
    if (node.group && node.field === 'jobPosition') {
      requester.push(
        {
          type: 'jobPosition',
          rayvarzId: node.groupValue.rayvarz_id,
          name: node.groupValue.name,
        },
      )
    }
    else if (!node.group) {
      requester.push(
        {
          type: 'user',
          personnelCode: node.data.personnelCode,
          name: `${node.data.firstName} ${node.data.lastName}`,
        },
      )
    }
  }

  return requester.length > 0
    ? [
        {
          icon: '<i class="tabler tabler-shield-check" style="font-size: 18px;"></i>',
          name: 'تخصیص تأییدیه برای',
          subMenu: [
            {
              icon: '<i class="tabler tabler-calendar-time" style="font-size: 18px;"></i>',
              name: 'درخواست مرخصی',
              action: () => {
                console.log('Edit access for:', requester)
              },
            },
            {
              icon: '<i class="tabler tabler-box" style="font-size: 18px;"></i>',
              name: 'درخواست کالا',
              action: () => {
                console.log('Edit access for:', requester)
              },
            },
          ],
        },
        'separator',
        ...params.defaultItems,
      ]
    : [...params.defaultItems]
}

// ----- end ag-grid -----

async function fetchUsers() {
  try {
    const { data, error } = await useApi(
      createUrl('/base/user', {
        query: {
          'fields[roles]': 'name',
          'include':
            'roles,profile.workplace,profile.educationLevel,profile.workplace,profile.workArea,profile.costCenter,profile.jobPosition',
        },
      }),
    )

    if (error.value) throw error.value

    users.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching users:', e)
    uiState.hasError = true
    uiState.errorMessage = 'خطا در دریافت کاربران'
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
      variant="outlined"
      color="error"
    >
      {{ uiState.errorMessage }}
    </VSnackbar>

    <section style="block-size: 100%;">
      <AgGridVue
        style="block-size: 100%; inline-size: 100%;"
        :column-defs="columnDefs"
        :row-data="rowData"
        enable-rtl
        row-numbers
        pagination
        row-group-panel-show="always"
        group-display-type="multipleColumns"
        cell-selection
        :row-selection="rowSelection"
        :get-context-menu-items="getContextMenuItems"
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
