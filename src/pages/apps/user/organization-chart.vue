<script setup>
import ApprovalFlow from '@/views/apps/user/ApprovalFlow.vue'

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
const jobPositions = ref([])
const approvalFlow = ref([])
const gridApi = ref(null)

// ----- start ag-grid -----

const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
}

const columnDefs = ref([
  { headerName: 'محل کار', field: 'workplace', rowGroup: true, hide: true },
  { headerName: 'منطقه کاری', field: 'workArea', rowGroup: true, hide: true },
  { headerName: 'مرکز هزینه', field: 'costCenter', rowGroup: true, hide: true },
  {
    headerName: 'سمت شغلی',
    field: 'jobPosition',
    valueFormatter: params => params.value?.name,
    rowGroup: true,
    hide: true,
  },
  { headerName: 'کد پرسنلی', field: 'personnelCode' },
  { headerName: 'نام', field: 'firstName' },
  { headerName: 'نام خانوادگی', field: 'lastName' },
])

const rowSelection = ref({
  mode: 'multiRow',
  enableClickSelection: true,
  selectAll: 'filtered',
})

const rowData = computed(() =>
  users.value?.map((user) => {
    return {
      personnelCode: Number.parseInt(user.personnel_code),
      firstName: user.first_name,
      lastName: user.last_name,
      workplace: user.profile?.workplace?.name,
      workArea: user.profile?.work_area?.name,
      costCenter: user.profile?.cost_center?.name,
      jobPosition: user.profile?.job_position,
      approvalFlowAsRequester: user.approval_flows_as_requester,
    }
  }),
)

const autoGroupColumnDef = ref({
  filter: 'agGroupColumnFilter',
})

function getContextMenuItems(params) {
  if (!params.node.isSelected()) {
    params.api.deselectAll()
    params.node.setSelected(true)
  }

  console.log(params.api.getSelectedNodes())

  const selectedNodes = params.api.getSelectedNodes()

  const requester = []
  for (const node of selectedNodes) {
    if (node.group && node.field === 'jobPosition') {
      requester.push({
        type: 'jobPosition',
        rayvarzId: node.groupValue.rayvarz_id,
        name: node.groupValue.name,
      })
    }
    else if (!node.group) {
      requester.push({
        type: 'user',
        personnelCode: node.data.personnelCode,
        name: `${node.data.firstName} ${node.data.lastName}`,
      })
    }
  }

  return requester.length > 0
    ? [
        {
          icon: '<i class="tabler tabler-shield-check" style="font-size: 18px;"></i>',
          name: 'تخصیص تأییدیه برای',
          subMenu: [
            {
              icon: '<i class="tabler tabler-calendar-time" style="font-size: 18px;"></i>',
              name: 'درخواست مرخصی',
              action: () => {
                console.log('Edit access for:', requester)
              },
            },
            {
              icon: '<i class="tabler tabler-box" style="font-size: 18px;"></i>',
              name: 'درخواست کالا',
              action: () => {
                console.log('Edit access for:', requester)
              },
            },
          ],
        },
        'separator',
        ...params.defaultItems,
      ]
    : [...params.defaultItems]
}

function onSelectionChanged() {
  const selectedNodes = gridApi.value.getSelectedNodes()

  if (selectedNodes.length !== 1) {
    approvalFlow.value = []
    return
  }

  if (selectedNodes[0].group && selectedNodes[0].field === 'jobPosition') {
    approvalFlow.value = jobPositions.value
      .filter(
        jp => jp.rayvarz_id === selectedNodes[0].groupValue.rayvarz_id,
      )[0]
      .approval_flows_as_requester
      .map((af) => {
        if (af.approver_user_id) {
          return {
            name: `${af.approver_user.first_name} ${af.approver_user.last_name}`,
          }
        }
        else {
          return {
            name: af.approver_position.name,
          }
        }
      })
  }

  if (!selectedNodes[0].group) {
    approvalFlow.value = selectedNodes[0].data.approvalFlowAsRequester.map(
      (af) => {
        if (af.approver_user_id) {
          return {
            name: `${af.approver_user.first_name} ${af.approver_user.last_name}`,
          }
        }
        else {
          return {
            name: af.approver_position.name,
          }
        }
      },
    )
  }
}

// ----- end ag-grid -----

async function fetchUsers() {
  try {
    const { data, error } = await useApi(
      createUrl('/base/user/approval-flows-as-requester', {
        query: {
          requestTypeId: 1,
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

async function fetchJobPositions() {
  try {
    const { data, error } = await useApi(
      createUrl('/base/job-position/approval-flows-as-requester', {
        query: {
          requestTypeId: 1,
        },
      }),
    )

    if (error.value) throw error.value

    jobPositions.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching job positions:', e)
    uiState.hasError = true
    uiState.errorMessage = 'خطا در دریافت سمت‌های شغلی'
  }
}

fetchUsers()
await fetchJobPositions()
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

    <ApprovalFlow :approval-flow="approvalFlow" />

    <section style="block-size: 100%;">
      <AgGridVue
        style="block-size: 100%; inline-size: 100%;"
        :column-defs="columnDefs"
        :row-data="rowData"
        enable-rtl
        row-numbers
        pagination
        row-group-panel-show="always"
        group-display-type="multipleColumns"
        :auto-group-column-def="autoGroupColumnDef"
        cell-selection
        :row-selection="rowSelection"
        :get-context-menu-items="getContextMenuItems"
        :theme="theme"
        @grid-ready="onGridReady"
        @selection-changed="onSelectionChanged"
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
  box-shadow: none;
  grid-template-columns: auto;
  grid-template-rows: auto 1fr;
}
</style>
