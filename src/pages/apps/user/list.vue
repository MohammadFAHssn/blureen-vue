<script setup>
definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'User-Details',
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

const rowData = computed(() =>
  users.value?.map((user) => {
    return {
      personnelCode: Number.parseInt(user.personnel_code),
      firstName: user.first_name,
      lastName: user.last_name,
      roles: user.roles?.map(role => role.name),
      active: user.active,
      nationalCode: user.profile?.national_code,
      gender: user.profile?.gender,
      fatherName: user.profile?.father_name,
      birthPlace: user.profile?.birth_place,
      birthDate: user.profile?.birth_date
        ? moment(user.profile?.birth_date).format('jYYYY-jMM-jDD')
        : null,
      mobileNumber: user.profile?.mobile_number,
      maritalStatus: user.profile?.marital_status,
      employmentDate: user.profile?.employment_date
        ? moment(user.profile?.employment_date).format('jYYYY-jMM-jDD')
        : null,
      startDate: user.profile?.start_date
        ? moment(user.profile?.start_date).format('jYYYY-jMM-jDD')
        : null,
      educationLevel: user.profile?.education_level?.name,
      workplace: user.profile?.workplace?.name,
      workArea: user.profile?.work_area?.name,
      costCenter: user.profile?.cost_center?.name,
      jobPosition: user.profile?.job_position?.name,
    }
  }),
)

const allColumnDefs = [
  { headerName: 'کد پرسنلی', field: 'personnelCode' },
  { headerName: 'نام', field: 'firstName' },
  { headerName: 'نام خانوادگی', field: 'lastName' },
  {
    headerName: 'نوع کاربر',
    field: 'roles',

    cellRenderer: 'MultiValuedCell',
    cellStyle: { 'display': 'flex', 'align-items': 'center' },
  },
  {
    headerName: 'وضعیت',
    field: 'active',
    cellRenderer: 'Active',
    cellStyle: { 'display': 'flex', 'align-items': 'center' },
    filterParams: {
      valueFormatter: params => (params.value === 1 ? 'فعال' : 'غیرفعال'),
    },
  },
  { headerName: 'کد ملی', field: 'nationalCode' },
  { headerName: 'جنسیت', field: 'gender' },
  { headerName: 'نام پدر', field: 'fatherName' },
  { headerName: 'محل تولد', field: 'birthPlace' },
  {
    headerName: 'تاریخ تولد',
    field: 'birthDate',
    valueFormatter: params =>
      params.value
        ? moment(params.value, 'jYYYY-jMM-jDD').format('jYYYY/jMM/jDD')
        : null,
  },
  { headerName: 'وضعیت تاهل', field: 'maritalStatus' },
  {
    headerName: 'تاریخ استخدام',
    field: 'employmentDate',
    valueFormatter: params =>
      params.value
        ? moment(params.value, 'jYYYY-jMM-jDD').format('jYYYY/jMM/jDD')
        : null,
  },
  {
    headerName: 'تاریخ شروع به کار',
    field: 'startDate',
    valueFormatter: params =>
      params.value
        ? moment(params.value, 'jYYYY-jMM-jDD').format('jYYYY/jMM/jDD')
        : null,
  },
  { headerName: 'سطح تحصیلات', field: 'educationLevel' },
  { headerName: 'محل کار', field: 'workplace' },
  { headerName: 'منطقه کاری', field: 'workArea' },
  { headerName: 'مرکز هزینه', field: 'costCenter' },
  { headerName: 'سمت شغلی', field: 'jobPosition' },
  { headerName: 'شماره تلفن همراه', field: 'mobileNumber' },
]

function columnHasData(field, data) {
  return data.some((row) => {
    const value = row[field]

    if (Array.isArray(value)) return value.length > 0

    return value !== null && value !== undefined && value !== ''
  })
}

const columnDefs = computed(() => {
  if (!rowData.value || rowData.value.length === 0) return allColumnDefs

  return allColumnDefs.filter(col => columnHasData(col.field, rowData.value))
})

// ----- end ag-grid -----

async function fetchUsers() {
  try {
    const { data, error } = await useApi(createUrl('/base/user/details'))

    if (error.value) throw error.value

    users.value = data.value.data
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
        :row-data="rowData"
        enable-rtl
        row-numbers
        pagination
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
