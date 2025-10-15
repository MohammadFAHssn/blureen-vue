<script setup>
definePage({
  meta: {
    action: 'approve',
    subject: 'Request',
  },
})
const isLoading = ref(false)
const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
})
const requests = ref([])

// ----- start ag-grid -----

const { theme } = useAGGridTheme()
const columnDefs = ref([
  { headerName: 'کد پرسنلی', field: 'personnelCode' },
  { headerName: 'نام', field: 'firstName' },
  { headerName: 'نام خانوادگی', field: 'lastName' },
  {
    headerName: 'نوع درخواست',
    field: 'roles',
    cellRenderer: 'MultiValuedCell',
    cellStyle: { 'display': 'flex', 'align-items': 'center' },
  },
  {
    headerName: 'تاریخ شروع',
    field: 'startDate',
    valueFormatter: params =>
      params.value ? moment(params.value, 'jYYYY-jMM-jDD').format('jYYYY/jMM/jD') : null,
  },
  {
    headerName: 'تاریخ پایان',
    field: 'endDate',
    valueFormatter: params =>
      params.value ? moment(params.value, 'jYYYY-jMM-jDD').format('jYYYY/jMM/jD') : null,
  },
  { headerName: 'زمان', field: 'lastName' },
])
const rowData = computed(() =>
  requests.value?.map((item) => {
    return {
      personnelCode: Number.parseInt(item.user.personnel_code),
      firstName: item.user.first_name,
      lastName: item.user.last_name,
      roles: user.roles?.map(role => role.name),
      active: user.active,
      nationalCode: user.profile?.national_code,
      gender: user.profile?.gender,
      fatherName: user.profile?.father_name,
      birthPlace: user.profile?.birth_place,
      birthDate: user.profile?.birth_date ? moment(user.profile?.birth_date).format('jYYYY-jMM-jDD') : null,
      mobileNumber: user.profile?.mobile_number,
      maritalStatus: user.profile?.marital_status,
      employmentDate: user.profile?.employment_date
        ? moment(user.profile?.employment_date).format(
            'jYYYY-jMM-jDD',
          )
        : null,
      startDate: user.profile?.start_date ? moment(user.profile?.start_date).format('jYYYY-jMM-jDD') : null,
      educationLevel: user.profile?.education_level?.name,
      workplace: user.profile?.workplace?.name,
      workArea: user.profile?.work_area?.name,
      costCenter: user.profile?.cost_center?.name,
      jobPosition: user.profile?.job_position?.name,
    }
  }),
)
// ----- end ag-grid -----
async function fetchRequests() {
  try {
    const { data, error } = await useApi(
      createUrl(
        '/hr-request/requests/get-by-approver',
      ),
    )
    console.log(data.value.data)

    if (error.value) throw error.value
    requests.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching users:', e)
    uiState.hasError = true
    uiState.errorMessage = 'خطا در دریافت درخواست ها'
  }
}

await fetchRequests()
</script>

<template>
  <VContainer />
</template>
