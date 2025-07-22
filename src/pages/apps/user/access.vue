<script setup>
// states
const uiState = reactive({
  hasError: false,
  errorMessage: "",
  isEditAccessDialogVisible: false,
})

const rowUserAccess = ref([])

// ----- start ag-grid -----
import { AG_GRID_LOCALE_IR } from "@ag-grid-community/locale"
import { AgGridVue } from "ag-grid-vue3"

const { theme } = useAGGridTheme()

const gridApi = ref(null)

const columnDefs = ref([
  { headerName: "کاربر", field: "user" },
  { headerName: "نقش", field: "role" },
  { headerName: "مجوز", field: "permission" },
])

const defaultColDef = ref({
  flex: 1,
  enableRowGroup: true,
  rowGroup: true,
  filter: true,
})

const onGridReady = params => {
  gridApi.value = params.api
}

const getContextMenuItems = params => {
  return params.node.field === "user"
    ? [
      {
        icon: '<i class="tabler tabler-edit" style="font-size: 18px;"></i>',
        name: "ویرایش دسترسی",
        action: () => {
          uiState.isEditAccessDialogVisible = true
        },
      },
      ...params.defaultItems,
    ]
    : [...params.defaultItems]
}

// ----- end ag-grid -----

// ----- Methods -----

const fetchUserAccess = async () => {
  try {
    const { data, error } = await useApi(
      createUrl(
        "/base/user?fields[users]=id,personnel_code,first_name,last_name&fields[roles]=id,name&fields[roles.permissions]=name&include=roles.permissions",
      ),
    )

    if (error.value) throw error.value

    rowUserAccess.value = data.value.data
  } catch (e) {
    uiState.hasError = true
    uiState.errorMessage = "خطا در دریافت دسترسی کاربران"
  }
}

await fetchUserAccess()

const rowData = computed(() => {
  let userAccess = []
  rowUserAccess.value.map(user => {
    user.roles.map(role =>
      role.permissions.map(permission =>
        userAccess.push({
          user: `${user.personnel_code} - ${user.first_name} ${user.last_name}`,
          role: role.name,
          permission: permission.name,
        }),
      ),
    )
  })

  return userAccess
})
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
      :theme="theme"
      style="block-size: 100%; inline-size: 100%;"
      :column-defs="columnDefs"
      :row-data="rowData"
      :default-col-def="defaultColDef"
      :row-numbers="true"
      :enable-rtl="true"
      :pagination="true"
      row-group-panel-show="always"
      :get-context-menu-items="getContextMenuItems"
      :locale-text="AG_GRID_LOCALE_IR"
      @grid-ready="onGridReady"
    />
  </section>
</template>

<style scoped>
.ag-grid-sec {
  block-size: 100%;
}
</style>
