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

// ----- start ag-grid -----

const { theme } = useAGGridTheme()

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
          jobPosition: user.profile?.job_position?.name,
        }
      : [],
  ),
)

function getContextMenuItems(params) {
  console.log(params)

  if (!params.node.isSelected()) {
    params.api.deselectAll()
    params.node.setSelected(true)
  }

  const selectedNodes = params.api.getSelectedNodes()
  console.log(selectedNodes)

  // const selectedUsersPersonnelCode = []
  // selectedNodes.forEach((node) => {
  //   selectedUsersPersonnelCode.push(node.groupValue.split('-')[0].trim())
  // })

  return 0
    ? [
        // {
        //   icon: '<i class="tabler tabler-edit" style="font-size: 18px;"></i>',
        //   name: 'ویرایش دسترسی',
        //   action: () => {
        //     updateSelectedUsers(selectedUsersPersonnelCode)
        //     updateSelectedUserRoles()

        //     uiState.isEditAccessDialogVisible = true
        //   },
        // },
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
        cell-selection
        :row-selection="rowSelection"
        :get-context-menu-items="getContextMenuItems"
        group-display-type="multipleColumns"
        :theme="theme"
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
