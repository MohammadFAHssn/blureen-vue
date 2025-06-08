<script setup>
import Active from "@/plugins/ag-grid/components/Active.vue"

// ----- start ag-grid -----

import { AG_GRID_LOCALE_IR } from "@ag-grid-community/locale"

const { theme } = useAGGridTheme()

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
  { headerName: "شماره تلفن", field: "mobileNumber", flex: 2 },
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
      mobileNumber: user.mobile_number,
      active: user.active,
    }
  }),
)

// ----- end ag-grid -----

const {
  execute: fetchUsers,
  data,
  error,
} = await useApi(createUrl("/get?model=commerce.supplier"))

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
    خطایی رخ داده‌است
  </VSnackbar>

  <section
    v-if="!hasError"
    class="ag-grid-sec"
  >
    <AgGridVue
      style="block-size: 100%; inline-size: 100%"
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
