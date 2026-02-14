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

const maxLevels = computed(() => {
  const userList = users.value ?? []
  return userList.reduce((max, user) => {
    const levelCount = user.org_charts_path[0]?.length ?? 0
    return Math.max(max, levelCount)
  }, 0)
})
// ----- start ag-grid -----

const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api

  gridApi.value.setGridOption('rowData', rowData())
}

const columnDefs = computed(() => {
  const groupCols = Array.from({ length: maxLevels.value }, (_, i) => ({
    field: `level${i + 1}`,
    rowGroup: true,
    hide: true,
    keyCreator: p => p.value?.id,
    valueFormatter: p => p.value?.name ?? '',
  }))

  return [
    ...groupCols,
    { headerName: 'کد پرسنلی', field: 'personnelCode' },
    { headerName: 'نام', field: 'firstName' },
    { headerName: 'نام خانوادگی', field: 'lastName' },
    {
      headerName: 'وضعیت',
      field: 'active',
      cellRenderer: 'Active',
      cellStyle: { display: 'flex', alignItems: 'center' },
      filterParams: {
        valueFormatter: params => (params.value === 1 ? 'فعال' : 'غیرفعال'),
      },
    },
  ]
})

const rowSelection = ref({
  mode: 'multiRow',
  enableClickSelection: true,
  selectAll: 'filtered',
})

function rowData() {
  return (users.value ?? []).map((user) => {
    const path = user.org_charts_path[0] ?? []

    const levelFields = Object.fromEntries(
      Array.from({ length: maxLevels.value }, (_, i) => [
        `level${i + 1}`,
        path[i]
          ? {
              id: path[i].id,
              name: `${path[i].org_position.name} ${path[i].org_unit.name}`,
            }
          : null,
      ]),
    )

    return {
      id: user.id,
      personnelCode: Number.parseInt(user.personnel_code),
      firstName: user.first_name,
      lastName: user.last_name,
      active: user.active,
      ...levelFields,
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
      || (approval.approver_org_chart_node_id
        && node.group
        && node.groupValue?.id == approval.approver_org_chart_node_id)
    ) {
      approverNode = node
      return 'break loop!'
    }
  })
  return approverNode
}

function onSelectionChanged() {
  if (!gridApi.value) return

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

    if (selectedNodes.value[0].group) {
      const org_chart_node_id = selectedNodes.value[0].groupValue.id

      approvalFlow.value = approvalFlows.value
        .filter(
          approval =>
            approval.requester_org_chart_node_id === org_chart_node_id,
        )
        .map(approval => getApproverNode(approval))
        .filter(Boolean)
    }

    if (!selectedNodes.value[0].group) {
      approvalFlow.value
        = selectedNodes.value[0].data.approvalFlowAsRequester.map(approval =>
          getApproverNode(approval),
        )
    }
  }
  else if (mode.value === 'edit') {
    if (selectedNodes.value.length !== 0) {
      const lastNode = selectedNodes.value[selectedNodes.value.length - 1]

      if (lastNode.data?.active === 0) {
        uiState.hasError = true
        uiState.errorMessage
          = 'کاربر غیرفعال را نمی‌توان به عنوان تأییدکننده انتخاب کرد.'
        lastNode.setSelected(false, false)
      }
    }

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
          'filter[request_type_id]': `\${${requestTypes.value[
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
            requester_user_id: !requester.group ? requester.data.id : null,
            requester_org_chart_node_id: requester.group
              ? requester.groupValue.id
              : null,
            approver_user_id: approvalDeleted
              ? null
              : !approver.group
                  ? approver.data.id
                  : null,
            approver_org_chart_node_id: approvalDeleted
              ? null
              : approver.group
                ? approver.groupValue.id
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
  if (!gridApi.value) return

  if (mode.value === 'view') {
    pendingState.changeRequestType = true
    fetchUsers()
    await fetchApprovalFlows()
    onSelectionChanged()
    pendingState.changeRequestType = false
  }
}

function removeApprover(index) {
  const approverNode = approvalFlow.value[index]
  approverNode.setSelected(false, false)
  approvalFlow.value.splice(index, 1)
}

await fetchRequestTypes()
fetchUsers()
await fetchApprovalFlows()

// ----- -----

watch(mode, (newMode) => {
  if (newMode === 'view') {
    gridApi.value.deselectAll()
    gridApi.value.setNodesSelected({
      nodes: requesters.value.map(requester =>
        gridApi.value.getRowNode(requester.id),
      ),
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
    <VSnackbar v-model="uiState.hasError" :timeout="2000" location="center" variant="flat" color="error">
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
        @remove-approver="removeApprover"
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
        :group-allow-unbalanced="true"
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
