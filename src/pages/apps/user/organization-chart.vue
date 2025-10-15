<script setup>
import ApprovalFlow from '@/views/apps/user/ApprovalFlow.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'Approval-Flows',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
})

const pendingState = reactive({
  updateApprovalFlow: false,
  changeRequestType: false,
})

const users = ref([])
const approvalFlows = ref([])
const requesters = ref([])
const approvalFlow = ref([])
const mode = ref('view') // 'view' | 'edit'
const gridApi = shallowRef(null)
const selectedNodes = ref([])

const requestTypes = ref([])
const selectedRequestType_or_Types__index = shallowRef(0)
// ----- start ag-grid -----

const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api

  gridApi.value.setGridOption('rowData', rowData())
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
  mode: 'multiRow',
  enableClickSelection: true,
  selectAll: 'filtered',

  isRowSelectable: rowNode =>
    !(rowNode.group && rowNode.field !== 'jobPosition'),
})

function rowData() {
  return users.value?.map((user) => {
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
  })
}

const autoGroupColumnDef = ref({
  filter: 'agGroupColumnFilter',
})

function getApproverNode(approval) {
  let approverNode
  gridApi.value.forEachNode((node) => {
    if (
      (approval.approver_user_id
        && node.data?.id == approval.approver_user_id)
      || (approval.approver_position_id
        && node.field === 'jobPosition'
        && node.groupValue?.rayvarz_id == approval.approver_position_id
        && node.parent.groupValue?.rayvarz_id == approval.approver_center_id)
    ) {
      approverNode = node
      return 'break loop!'
    }
  })
  return approverNode
}

function onSelectionChanged() {
  selectedNodes.value = gridApi.value.getSelectedNodes()

  for (const selectedNode of selectedNodes.value) {
    gridApi.value.setRowNodeExpanded(selectedNode, true, true)
  }

  if (mode.value === 'view') {
    requesters.value = selectedNodes.value

    if (selectedNodes.value.length !== 1) {
      approvalFlow.value = []
      return
    }

    if (selectedNodes.value[0].field === 'jobPosition') {
      const position_id = selectedNodes.value[0].groupValue.rayvarz_id
      const center_id = selectedNodes.value[0].parent.groupValue.rayvarz_id

      approvalFlow.value = approvalFlows.value
        .filter(
          approval =>
            approval.requester_position_id === position_id
            && approval.requester_center_id === center_id,
        )
        .map(approval => getApproverNode(approval))
    }

    if (!selectedNodes.value[0].group) {
      approvalFlow.value
        = selectedNodes.value[0].data.approvalFlowAsRequester.map(approval =>
          getApproverNode(approval),
        )
    }
  }
  else if (mode.value === 'edit') {
    approvalFlow.value = selectedNodes.value
  }
}

// ----- end ag-grid -----

async function fetchUsers() {
  try {
    const { data, error } = await useApi(
      createUrl('/base/user/approval-flows-as-requester', {
        query: {
          requestTypeId:
            requestTypes.value[
              Array.isArray(selectedRequestType_or_Types__index.value)
                ? selectedRequestType_or_Types__index.value[0]
                : selectedRequestType_or_Types__index.value
            ].id,
        },
      }),
    )

    if (error.value) throw error.value

    users.value = data.value.data
    gridApi.value?.setGridOption('rowData', rowData())
  }
  catch (e) {
    console.error('Error fetching users:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت کاربران'
  }
}

async function fetchApprovalFlows() {
  try {
    const { data, error } = await useApi(
      createUrl('/base/approval-flow', {
        query: {
          'filter[request_type_id]': `\${${
            requestTypes.value[
              Array.isArray(selectedRequestType_or_Types__index.value)
                ? selectedRequestType_or_Types__index.value[0]
                : selectedRequestType_or_Types__index.value
            ].id
          }}`,
        },
      }),
    )

    if (error.value) throw error.value

    approvalFlows.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching approval flows:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت رده تأییدیه‌ها'
  }
}

async function fetchRequestTypes() {
  try {
    const { data, error } = await useApi(createUrl('/base/request-type'))

    if (error.value) throw error.value

    requestTypes.value = data.value.data
  }
  catch (e) {
    console.error('Error fetching request types:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت نوع درخواست‌ها'
  }
}

async function onSave() {
  const approvalDeleted = approvalFlow.value.length === 0

  if (!Array.isArray(selectedRequestType_or_Types__index.value)) {
    selectedRequestType_or_Types__index.value = [
      selectedRequestType_or_Types__index.value,
    ]
  }

  const payload = []
  for (const selectedRequestTypeIndex of selectedRequestType_or_Types__index.value) {
    for (const requester of requesters.value) {
      (approvalDeleted ? [null] : approvalFlow.value).forEach(
        (approver, approverIndex) => {
          payload.push({
            requester_user_id: !requester.group
              ? requester.data.id
              : null,
            requester_position_id: requester.group
              ? requester.groupValue.rayvarz_id
              : null,
            requester_center_id: requester.group
              ? requester.parent.groupValue.rayvarz_id
              : null,
            approver_user_id: approvalDeleted
              ? null
              : !approver.group
                  ? approver.data.id
                  : null,
            approver_position_id: approvalDeleted
              ? null
              : approver.group
                ? approver.groupValue.rayvarz_id
                : null,
            approver_center_id: approvalDeleted
              ? null
              : approver.group
                ? approver.parent.groupValue.rayvarz_id
                : null,
            priority: approverIndex + 1,
            request_type_id: requestTypes.value[selectedRequestTypeIndex].id,
          })
        },
      )
    }
  }

  pendingState.updateApprovalFlow = true
  try {
    await $api('/base/approval-flow/update', {
      method: 'POST',
      body: { approvalFlows: payload },
      onResponseError({ response }) {
        uiState.hasError = true
        uiState.errorMessage
          = response._data.message || 'خطا در بروزرسانی رده تأییدیه‌ها'
      },
    })
  }
  catch (err) {
    console.error(err)
  }
  finally {
    fetchUsers()
    await fetchApprovalFlows()

    selectedRequestType_or_Types__index.value
      = selectedRequestType_or_Types__index.value[0]
    pendingState.updateApprovalFlow = false
    mode.value = 'view'
  }
}

async function onSelectedRequestTypeChange() {
  if (mode.value === 'view') {
    pendingState.changeRequestType = true
    fetchUsers()
    await fetchApprovalFlows()
    onSelectionChanged()
    pendingState.changeRequestType = false
  }
}

await fetchRequestTypes()
fetchUsers()
await fetchApprovalFlows()

// ----- -----

watch(mode, (newMode) => {
  if (newMode === 'view') {
    gridApi.value.deselectAll()
    gridApi.value.setNodesSelected({
      nodes: requesters.value.map(requester => gridApi.value.getRowNode(requester.id)),
      newValue: true,
    })
  }
  else if (newMode === 'edit') {
    gridApi.value.deselectAll()
    gridApi.value.setNodesSelected({
      nodes: approvalFlow.value.map(approval =>
        gridApi.value.getRowNode(approval.id),
      ),
      newValue: true,
    })
  }
})
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

    <VCard class="mb-3" :color="mode === 'edit' ? 'yellow-lighten-4' : ''">
      <v-card-text class="pa-3">
        <v-chip-group
          v-model="selectedRequestType_or_Types__index"
          column
          :multiple="mode === 'edit'"
          mandatory
          @update:model-value="onSelectedRequestTypeChange"
        >
          <v-chip
            v-for="(type, index) in requestTypes"
            :key="type.id"
            variant="outlined"
            filter
            :disabled="pendingState.changeRequestType"
          >
            {{ type.name }}
            <v-progress-circular
              v-if="
                pendingState.changeRequestType
                  && index === selectedRequestType_or_Types__index
              "
              class="mr-2"
              :size="20"
              :width="2"
              indeterminate
            />
          </v-chip>
        </v-chip-group>
      </v-card-text>
    </VCard>

    <div>
      <ApprovalFlow
        v-if="selectedNodes.length > 0 || mode === 'edit'"
        :requesters="requesters"
        :approval-flow="approvalFlow"
        :mode="mode"
        :loading="pendingState.updateApprovalFlow"
        @edit="mode = 'edit'"
        @save="onSave"
        @cancel="mode = 'view'"
      />
    </div>

    <section style="block-size: 100%;">
      <AgGridVue
        style="block-size: 100%; inline-size: 100%;"
        :column-defs="columnDefs"
        :get-row-id="(params) => String(params.data.id)"
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
  grid-template-rows: auto auto 1fr;
}
</style>
