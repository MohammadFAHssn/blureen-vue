<script setup>
import EvaluateBtn from '@/views/apps/evaluation/components/EvaluateBtn.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'manage',
    subject: 'Subordinates-Evaluation',
  },
})

const errorStates = reactive({
  active: false,
  message: '',
})

const users = ref([])

// ----- start ag-grid -----

const agGridStates = reactive({
  gridApi: null,
  initialState: null,
})

const { theme } = useAGGridTheme()

function onGridReady(params) {
  agGridStates.gridApi = params.api

  agGridStates.gridApi.setGridOption('rowData', rowData())
}

const columnDefs = [
  { headerName: 'محل کار', field: 'workplace', rowGroup: true, hide: true },
  { headerName: 'منطقه کاری', field: 'workArea', rowGroup: true, hide: true },
  { headerName: 'مرکز هزینه', field: 'costCenter', rowGroup: true, hide: true },
  { headerName: 'کد پرسنلی', field: 'personnelCode' },
  { headerName: 'نام', field: 'firstName' },
  { headerName: 'نام خانوادگی', field: 'lastName' },
  {
    headerName: 'ارزیابی',
    field: 'scores',
    cellRendererSelector: (params) => {
      if (!params.node.group) {
        return {
          component: 'EvaluateBtn',
          params: {
            onEvaluateBtnClick: (node) => {
              console.log(node)
            },
          },
        }
      }
    },
  },
]

function rowData() {
  return users.value.map((user) => {
    return {
      id: user.id,
      personnelCode: Number.parseInt(user.personnel_code),
      firstName: user.first_name,
      lastName: user.last_name,
      workplace: user.profile?.workplace?.name,
      workArea: user.profile?.work_area?.name,
      costCenter: user.profile?.cost_center?.name,
      scores: user.manager_evaluation_scores,
    }
  })
}

const autoGroupColumnDef = ref({
  filter: 'agGroupColumnFilter',
})

async function fetchSubordinates() {
  await axiosInstance
    .get('/evaluation/manager-evaluation-relation/subordinates')
    .then(({ data }) => {
      users.value = data.data
    })
    .catch((error) => {
      errorStates.active = true
      errorStates.message = error.response.data.message || 'هنگام دریافت پرسنل زیرمجموعه خطایی رخ داده‌است!'
    })
}

await fetchSubordinates()
</script>

<template>
  <VSnackbar
    v-model="errorStates.active"
    :timeout="2000"
    location="center"
    variant="flat"
    color="error"
  >
    {{ errorStates.message }}
  </VSnackbar>

  <VLayout class="app-layout">
    <h3 class="mb-4">
      ارزیابی مدیر
    </h3>

    <section style="block-size: 100%;">
      <AgGridVue
        style="block-size: 100%; inline-size: 100%;"
        :column-defs="columnDefs"
        :get-row-id="(params) => String(params.data.id)"
        enable-rtl
        pagination
        group-display-type="multipleColumns"
        :auto-group-column-def="autoGroupColumnDef"
        :theme="theme"
        :initial-state="agGridStates.initialState"
        :components="{ EvaluateBtn }"
        @grid-ready="onGridReady"
      />
    </section>
  </VLayout>
</template>

<style lang="scss" scoped>
.app-layout {
  display: grid;
  box-shadow: none;
  grid-template-columns: auto;
  grid-template-rows: auto 1fr;
}
</style>
