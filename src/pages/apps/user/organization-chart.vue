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
  { headerName: 'محل کار', field: 'workplace' },
  { headerName: 'منطقه کاری', field: 'workArea' },
  { headerName: 'مرکز هزینه', field: 'costCenter' },
  { headerName: 'سمت شغلی', field: 'jobPosition' },
  { headerName: 'کاربر', field: 'user' },
])

const defaultColDef = ref({
  enableRowGroup: true,
  rowGroup: true,
})

const autoGroupColumnDef = ref({
  minWidth: 460,
})

const rowData = computed(() =>
  users.value?.flatMap(user =>
    user.active
      ? {
          user: `${user.personnel_code} - ${user.first_name} ${user.last_name}`,
          workplace: user.profile?.workplace?.name,
          workArea: user.profile?.work_area?.name,
          costCenter: user.profile?.cost_center?.name,
          jobPosition: user.profile?.job_position?.name,
        }
      : [],
  ),
)

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
        :default-col-def="defaultColDef"
        :auto-group-column-def="autoGroupColumnDef"
        enable-rtl
        row-numbers
        pagination
        row-group-panel-show="always"
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
