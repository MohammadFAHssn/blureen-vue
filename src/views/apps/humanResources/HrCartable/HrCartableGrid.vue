<script setup>
const props = defineProps({
  tab: { type: Number, required: true },
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits([
  'details',
  'edit',
  'referral',
  'approvalFlow',
  'approveRow',
  'update:selectedIds',
])

const selectedIds = defineModel('selectedIds', {
  type: Array,
  default: () => [],
})

const { theme } = useAGGridTheme()
const gridApi = ref(null)

watch(
  () => props.tab,
  () => {
    gridApi.value?.deselectAll?.()
    selectedIds.value = []
  },
)

function fmtTimeRange(r) {
  return r?.start_time && r?.end_time ? `${r.start_time} - ${r.end_time}` : '-'
}

function fullName(u) {
  if (!u) return '-'
  return `${u.personnel_code} - ${u.first_name} ${u.last_name}`
}

const actions = computed(() => ({
  approvable: props.tab === STATUSES.PENDING_HR_APPROVAL,
  detailsable: true,
  editable: {
    status: props.tab === STATUSES.PENDING_HR_APPROVAL,
    mode: 'view',
  },
  referrable: props.tab === STATUSES.PENDING_HR_APPROVAL,
  approvalFlow: true,
}))

const rowData = computed(() =>
  (props.items ?? []).map(item => ({
    currentItem: item,
    id: item.id,
    personnel: fullName(item.user),
    costCenter:
      item?.user?.org_chart_nodes_as_primary[0]?.org_unit?.name ?? '-',
    liaisons: fullName(
      item?.user?.org_chart_nodes_as_primary[0]?.org_unit?.liaisons[0],
    ),
    requestType: item.type.name ?? '-',
    startDate: item.start_date ?? '-',
    endDate: item.end_date ?? '-',
    timeRange: fmtTimeRange(item),
    approver: pendingApproverName(item.approvals),
    actions: actions.value,
  })),
)

const baseCols = [
  { headerName: 'پرسنل', field: 'personnel' },
  { headerName: 'واحد', field: 'costCenter' },
  { headerName: 'رابط اداری', field: 'liaisons' },
  { headerName: 'نوع درخواست', field: 'requestType', maxWidth: 160 },
  { headerName: 'تاریخ شروع', field: 'startDate', maxWidth: 150 },
  { headerName: 'تاریخ پایان', field: 'endDate', maxWidth: 150 },
  { headerName: 'زمان', field: 'timeRange', maxWidth: 150 },
]

const approverCol = {
  headerName: 'تایید کننده',
  field: 'approver',
  maxWidth: 200,
}

const actionsCol = {
  headerName: 'عملیات',
  field: 'actions',
  width: 300,
  valueFormatter: () => '',
  suppressHeaderMenuButton: true,
  suppressHeaderContextMenu: true,
  cellRendererSelector: () => ({
    component: 'Actions',
    params: {
      onApproveClick: (node, approve) => emit('approveRow', node, approve),
      onDetailsClick: node => emit('details', node),
      onEditClick: node => emit('edit', node),
      onReferralClick: node => emit('referral', node),
      onShowApprovalFlowClick: node => emit('approvalFlow', node),
    },
  }),
}

const columnDefs = computed(() => {
  const cols = [...baseCols]
  if (props.tab === STATUSES.PENDING) {
    cols.push(approverCol)
  }
  cols.push(actionsCol)
  return cols
})

function syncSelectedIds() {
  const rows = gridApi.value?.getSelectedRows?.() ?? []
  selectedIds.value = rows
    .map(r => r?.id ?? r?.currentItem?.id)
    .filter(Boolean)
}

function onGridReady(params) {
  gridApi.value = params.api
  syncSelectedIds()
}

function onSelectionChanged() {
  syncSelectedIds()
  gridApi.value?.refreshCells?.({ force: true })
}

function pendingApproverName(approvals) {
  const pending = (approvals ?? []).filter(a => a?.status_id === 1)

  const first = pending.reduce((best, cur) => {
    if (!cur) return best
    if (!best) return cur
    const bp = best.priority ?? Number.POSITIVE_INFINITY
    const cp = cur.priority ?? Number.POSITIVE_INFINITY
    return cp < bp ? cur : best
  }, null)

  const u = first?.approver
  if (!u) return '-'
  return `${u.personnel_code} - ${u.first_name} ${u.last_name}`
}
</script>

<template>
  <div class="grid">
    <AgGridVue
      style="block-size: 100%; inline-size: 100%"
      :column-defs="columnDefs"
      :row-data="rowData"
      :suppress-click-edit="true"
      :loading="loading"
      enable-rtl
      row-numbers
      pagination
      :row-selection="{
        mode: 'multiRow',
        enableClickSelection: true,
        checkboxes: true,
        headerCheckbox: true,
      }"
      :theme="theme"
      @grid-ready="onGridReady"
      @selection-changed="onSelectionChanged"
    />
  </div>
</template>

<style scoped lang="scss">
.grid {
  block-size: 100%;
  min-height: 0;
}
</style>
