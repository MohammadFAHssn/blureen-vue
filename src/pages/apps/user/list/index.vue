<script setup>
import { useTheme } from "vuetify"

const vuetifyTheme = useTheme()

import Active from "@/plugins/ag-grid/components/Active.vue"

// ----- start ag-grid -----

import { AG_GRID_LOCALE_IR } from "@ag-grid-community/locale"
import {
  colorSchemeDarkBlue,
  colorSchemeLight,
  themeQuartz,
} from "ag-grid-community"

const theme = computed(() =>
  vuetifyTheme.current.value.colors.surface === "#fff"
    ? themeQuartz.withPart(colorSchemeLight)
    : themeQuartz.withPart(colorSchemeDarkBlue),
)

import MultiValuedCell from "@/plugins/ag-grid/components/MultiValuedCell.vue"
import { AgGridVue } from "ag-grid-vue3"
import { computed } from "vue"

const defaultColDef = {
  filter: true,
}

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
  { headerName: "شماره تلفن", field: "phoneNumber", flex: 2 },
  {
    headerName: "وضعیت",
    field: "active",
    flex: 1,
    cellRenderer: Active,
    filterParams: {
      cellRenderer: Active,
    },
    cellStyle: { display: "flex", "align-items": "center" },
  },
])

const rowData = computed(() =>
  users.value?.map(user => {
    return {
      personnelCode: user.personnel_code,
      firstName: user.first_name,
      lastName: user.last_name,
      roles: user.roles?.map(role => role.name),
      phoneNumber: user.phone_number,
      active: user.active,
    }
  }),
)

// ----- end ag-grid -----

const {
  execute: fetchUsers,
  data,
  error,
} = await useApi(createUrl("/base/user/get"))

const hasError = computed(() => Boolean(error.value))

const users = computed(() => data.value?.data)
</script>

<template>
  <VSnackbar
    v-model="hasError"
    :timeout="2000"
    location="center"
    variant="outlined"
    color="error"
  >
    مشکلی پیش آمده است
  </VSnackbar>

  <section
    v-if="!hasError"
    class="ag-grid-sec"
    :data-ag-theme-mode="
      vuetifyTheme.current.value.colors === '#fff' ? 'light' : 'dark'
    "
  >
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
