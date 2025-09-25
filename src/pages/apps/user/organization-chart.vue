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
const approvalFlows = ref([])
const requester = ref(null)
const approvalFlow = ref([])
const mode = ref('view') // 'view' | 'edit'
const gridApi = shallowRef(null)
const selectedNodes = ref([])

// ----- start ag-grid -----

const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
}

const columnDefs = ref([
  { headerName: 'محل کار', field: 'workplace', rowGroup: true, hide: true },
  { headerName: 'منطقه کاری', field: 'workArea', rowGroup: true, hide: true },
  {
    headerName: 'مرکز هزینه',
    field: 'costCenter',
    valueFormatter: params => params.value?.name,
    rowGroup: true,
    hide: true,
  },
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
  {
    headerName: 'وضعیت',
    field: 'active',
    cellRenderer: 'Active',
    cellStyle: { 'display': 'flex', 'align-items': 'center' },
    filterParams: {
      valueFormatter: params => (params.value === 1 ? 'فعال' : 'غیرفعال'),
    },
  },
])

const rowSelection = ref({
  mode: 'singleRow',
  enableClickSelection: true,
  selectAll: 'filtered',

  isRowSelectable: rowNode =>
    !(rowNode.group && rowNode.field !== 'jobPosition'),
})

const rowData = computed(() =>
  users.value?.map((user) => {
    return {
      id: user.id,
      personnelCode: Number.parseInt(user.personnel_code),
      firstName: user.first_name,
      lastName: user.last_name,
      active: user.active,
      workplace: user.profile?.workplace?.name,
      workArea: user.profile?.work_area?.name,
      costCenter: user.profile?.cost_center,
      jobPosition: user.profile?.job_position,
      approvalFlowAsRequester: user.approval_flows_as_requester,
    }
  }),
)

const autoGroupColumnDef = ref({
  filter: 'agGroupColumnFilter',
})

function getApproverNode(approvalFlow) {
  let approverNode
  gridApi.value.forEachNode((node) => {
    if (
      (approvalFlow.approver_user_id && node.data?.id == approvalFlow.approver_user_id)
      || (approvalFlow.approver_position_id
        && node.field === 'jobPosition'
        && node.groupValue?.rayvarz_id == approvalFlow.approver_position_id
        && node.parent.groupValue?.rayvarz_id == approvalFlow.approver_center_id)
    ) {
      approverNode = node
      return 'break loop!'
    }
  })
  return approverNode
}

function onSelectionChanged() {
  selectedNodes.value = gridApi.value.getSelectedNodes()

  if (mode.value === 'view') {
    if (selectedNodes.value.length === 0) {
      approvalFlow.value = []
      return
    }

    requester.value = selectedNodes.value[0]

    if (selectedNodes.value[0].field === 'jobPosition') {
      const position_id = selectedNodes.value[0].groupValue.rayvarz_id
      const center_id = selectedNodes.value[0].parent.groupValue.rayvarz_id

      approvalFlow.value = approvalFlows.value
        .filter(
          approvalFlow =>
            approvalFlow.requester_position_id === position_id
            && approvalFlow.requester_center_id === center_id,
        )
        .map(approvalFlow => getApproverNode(approvalFlow))
    }

    if (!selectedNodes.value[0].group) {
      approvalFlow.value
        = selectedNodes.value[0].data.approvalFlowAsRequester.map(approvalFlow =>
          getApproverNode(approvalFlow),
        )
    }
  }
  else if (mode.value === 'edit') {
    approvalFlow.value = selectedNodes.value
  }

  selectedNodes.value.forEach((node) => {
    let parent = node.parent

    while (parent && parent.group) {
      parent.setExpanded(true)
      parent = parent.parent
    }
  })
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

async function fetchApprovalFlows() {
  try {
    const { data, error } = await useApi(
      createUrl('/base/approval-flow', {
        query: {
          'filter[request_type_id]': 1,
        },
      }),
    )

    if (error.value) throw error.value

    approvalFlows.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching approval flows:', e)
    uiState.hasError = true
    uiState.errorMessage = 'خطا در دریافت رده تأییدیه‌ها'
  }
}

function onEdit() {
  gridApi.value.setGridOption('rowSelection', {
    ...rowSelection.value,
    mode: 'multiRow',
  })

  mode.value = 'edit'

  gridApi.value.deselectAll()
  gridApi.value.setNodesSelected({
    nodes: approvalFlow.value,
    newValue: true,
  })
}

function onSave() {
  updateApprovalFlow({
    requester: requester.value,
    approvers: approvalFlow.value,
    requestTypeId: 1,
  })

  gridApi.value.setGridOption('rowSelection', {
    ...rowSelection.value,
    mode: 'singleRow',
  })

  mode.value = 'view'

  gridApi.value.deselectAll()
  gridApi.value.setNodesSelected({
    nodes: [requester.value],
    newValue: true,
  })
}

function onCancel() {
  gridApi.value.setGridOption('rowSelection', {
    ...rowSelection.value,
    mode: 'singleRow',
  })

  mode.value = 'view'

  gridApi.value.deselectAll()
  gridApi.value.setNodesSelected({
    nodes: [requester.value],
    newValue: true,
  })
}

function updateApprovalFlow({ requester, approvers, requestTypeId }) {
  const payload = approvers.map((approver) => {
    return {
      requester_user_id: requester.data?.id,
      requester_position_id: requester.groupValue?.rayvarz_id,
      approver_user_id: approver.data?.id,
      approver_position_id: approver.groupValue?.rayvarz_id,
      request_type_id: requestTypeId,
    }
  })
}

fetchUsers()
await fetchApprovalFlows()
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

    <div>
      <ApprovalFlow
        v-if="selectedNodes.length > 0 || mode === 'edit'"
        :requester="requester"
        :approval-flow="approvalFlow"
        :mode="mode"
        @edit="onEdit"
        @save="onSave"
        @cancel="onCancel"
      />
    </div>

    <section style="block-size: 100%;">
      <AgGridVue
        style="block-size: 100%; inline-size: 100%;"
        :column-defs="columnDefs"
        :row-data="rowData"
        enable-rtl
        row-numbers
        pagination
        group-display-type="multipleColumns"
        :auto-group-column-def="autoGroupColumnDef"
        cell-selection
        :row-selection="rowSelection"
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
