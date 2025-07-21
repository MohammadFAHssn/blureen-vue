<script setup>

// states
const uiState = reactive({
  hasError: false,
  errorMessage: "",
})

const users = ref([])

// ----- start ag-grid -----
//  TODO: make theses globally
import MultiValuedCell from "@/plugins/ag-grid/components/MultiValuedCell.vue"
import { AG_GRID_LOCALE_IR } from "@ag-grid-community/locale"
import { AgGridVue } from "ag-grid-vue3"

const { theme } = useAGGridTheme()

const defaultColDef = ref({
  filter: true,
})

const columnDefs = ref([
  { headerName: "کد پرسنلی", field: "personnelCode", flex: 1 },
  { headerName: "نام", field: "firstName", flex: 2 },
  { headerName: "نام خانوادگی", field: "lastName", flex: 2 },
  {
    headerName: "نوع کاربر",
    field: "roles",
    flex: 3,
    cellRenderer: MultiValuedCell,
    cellStyle: { display: "flex", "align-items": "center" },
  },
  { headerName: "شماره تلفن", field: "mobileNumber", flex: 2 },
])

const rowData = computed(() =>
  users.value?.map(user => {
    return {
      personnelCode: parseInt(user.personnel_code),
      firstName: user.first_name,
      lastName: user.last_name,
      roles: user.roles?.map(role => role.name),
      mobileNumber: user.mobile_number,
    }
  }),
)

// ----- end ag-grid -----

const fetchUsers = async () => {
  try {
    const { data, error } = await useApi(
      createUrl("/base/user?fields[roles]=name&include=roles"),
    )

    if (error.value) throw error.value

    users.value = data.value.data
  } catch (e) {
    uiState.hasError = true
    uiState.errorMessage = e.message || "خطا در دریافت کاربران"
  }
}

await fetchUsers()
</script>

<template>
  <VSnackbar
    v-model="uiState.hasError"
    :timeout="2000"
    location="center"
    variant="outlined"
    color="error"
  >
    {{ uiState.errorMessage }}
  </VSnackbar>

  <section class="ag-grid-sec">
    <AgGridVue
      style="block-size: 100%; inline-size: 100%;"
      :column-defs="columnDefs"
      :row-data="rowData"
      :default-col-def="defaultColDef"
      :enable-rtl="true"
      :row-numbers="true"
      :pagination="true"
      :locale-text="AG_GRID_LOCALE_IR"
      :theme="theme"
    />
  </section>
</template>

<style scoped>
.ag-grid-sec {
  block-size: 100%;
}
</style>
