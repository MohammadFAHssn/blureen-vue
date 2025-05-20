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

import { AgGridVue } from "ag-grid-vue3"

const defaultColDef = {
  filter: true,
}

const columnDefs = ref([
  { headerName: "کد پرسنلی", field: "personnelCode", flex: 1 },
  { headerName: "نام", field: "firstName", flex: 2 },
  { headerName: "نام خانوادگی", field: "lastName", flex: 2 },
  { headerName: "نوع کاربر", field: "role", flex: 3 },
  { headerName: "شماره تلفن", field: "phoneNumber", flex: 2 },
  {
    headerName: "وضعیت",
    field: "active",
    flex: 1,
    cellRenderer: Active,
    filterParams: {
      cellRenderer: Active,
    },
  },
])

const rowData = computed(() =>
  users.value.map(user => {
    return {
      personnelCode: user.personnel_code,
      firstName: user.first_name,
      lastName: user.last_name,
      role: null,
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

const users = computed(() => data.value.data)
</script>

<template>
  <section
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
