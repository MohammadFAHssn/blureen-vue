<script setup>
// states
const uiState = reactive({
  hasError: false,
  errorMessage: "",
  isEditAccessDialogVisible: false,
})

const rowUserAccess = ref([])
const roles = ref([])
const selectedUsers = ref([])
const selectedUserRoles = ref([])

const pendingState = reactive({
  fetchingRoles: false,
  updatingUserRoles: false,
})

// ----- start ag-grid -----
import { AG_GRID_LOCALE_IR } from "@ag-grid-community/locale"
import { AgGridVue } from "ag-grid-vue3"

const { theme } = useAGGridTheme()

const gridApi = ref(null)

const onGridReady = params => {
  gridApi.value = params.api
}

const rowSelection = ref({
  mode: "multiRow",
  enableClickSelection: true,
  selectAll: "filtered",

  isRowSelectable: rowNode => rowNode.field === "user",
})

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

const getContextMenuItems = params => {
  if (!params.node.isSelected()) {
    params.api.deselectAll()
    params.node.setSelected(true)
  }

  const selectedNodes = params.api.getSelectedNodes()

  let selectedUsersPersonnelCode = []
  selectedNodes.forEach(node => {
    selectedUsersPersonnelCode.push(node.groupValue.split("-")[0].trim())
  })

  return selectedUsersPersonnelCode.length
    ? [
      {
        icon: '<i class="tabler tabler-edit" style="font-size: 18px;"></i>',
        name: "ویرایش دسترسی",
        action: () => {
          updateSelectedUsers(selectedUsersPersonnelCode)
          updateSelectedUserRoles()

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
    console.error("Error fetching user access:", e)
    uiState.hasError = true
    uiState.errorMessage = "خطا در دریافت دسترسی کاربران"
  }
}

const fetchRoles = async () => {
  pendingState.fetchingRoles = true
  try {
    const { data, error } = await useApi(
      createUrl("/base/role?include=permissions"),
    )

    pendingState.fetchingRoles = false

    if (error.value) throw error.value

    roles.value = data.value.data
  } catch (e) {
    console.error("Error fetching roles:", e)
    uiState.hasError = true
    uiState.errorMessage = "خطا در دریافت لیست نقش‌ها"
  }
}

const updateSelectedUsers = personnelCodes => {
  selectedUsers.value = []
  personnelCodes.forEach(personnelCode => {
    selectedUsers.value.push(
      rowUserAccess.value.find(user => user.personnel_code === personnelCode),
    )
  })
}

const updateSelectedUserRoles = () => {
  if (selectedUsers.value.length > 1) {
    selectedUserRoles.value = []
  } else {
    selectedUserRoles.value = selectedUsers.value[0].roles.map(role => {
      return {
        id: role.id,
        name: role.name,
      }
    })
  }
}

const onUserRolesChange = async newUserRoles => {
  pendingState.updatingUserRoles = true
  try {
    await $api("/base/user-role/update", {
      method: "POST",
      body: {
        userId: selectedUsers.value[0].id,
        roleIds: newUserRoles.map(role => role.id),
      },
      onResponseError({ response }) {
        pendingState.updatingUserRoles = false
        uiState.hasError = true
        uiState.errorMessage =
          response._data.message || "خطا در بروزرسانی دسترسی‌ها"
      },
    })

    pendingState.updatingUserRoles = false
    uiState.isEditAccessDialogVisible = false
    UpdateUserRoles(newUserRoles)
  } catch (err) {
    console.error(err)
  }
}

const UpdateUserRoles = newUserRoles => {
  rowUserAccess.value = rowUserAccess.value.map(user => {
    if (user.id === selectedUsers.value[0].id) {
      user.roles = newUserRoles.map(role =>
        roles.value.find(r => r.id === role.id),
      )
    }

    return user
  })
}

fetchRoles()
await fetchUserAccess()

const rowData = computed(() => {
  let userAccess = []
  rowUserAccess.value.map(user => {
    if (isEmpty(user.roles)) {
      userAccess.push({
        user: `${user.personnel_code} - ${user.first_name} ${user.last_name}`,
      })
    }
    user.roles.map(role => {
      if (isEmpty(role.permissions)) {
        userAccess.push({
          user: `${user.personnel_code} - ${user.first_name} ${user.last_name}`,
          role: role.name,
        })
      }
      role.permissions.map(permission =>
        userAccess.push({
          user: `${user.personnel_code} - ${user.first_name} ${user.last_name}`,
          role: role.name,
          permission: permission.name,
        }),
      )
    })
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

  <RelationManagerDialog
    v-if="uiState.isEditAccessDialogVisible"
    v-model:is-dialog-visible="uiState.isEditAccessDialogVisible"
    :title="
      'دسترسی ' +
        (selectedUsers.length > 1
          ? 'کاربران'
          : selectedUsers[0].first_name +
            ' ' +
            selectedUsers[0].last_name +
            ' (' +
            selectedUsers[0].personnel_code +
            ')')
    "
    :is-fetch-items-pending="pendingState.fetchingRoles"
    :items="roles"
    :selected="selectedUserRoles"
    :loading="pendingState.updatingUserRoles"
    @change="onUserRolesChange"
  />

  <section class="ag-grid-sec">
    <AgGridVue
      :theme="theme"
      style="block-size: 100%; inline-size: 100%;"
      :column-defs="columnDefs"
      :row-data="rowData"
      :default-col-def="defaultColDef"
      row-numbers
      cell-selection
      :row-selection="rowSelection"
      enable-rtl
      pagination
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
