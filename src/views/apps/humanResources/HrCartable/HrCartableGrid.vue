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
  'attendanceLog',
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
    actions: {
      approvable: item.kasra_credit_id,
      detailsable: true,
    },
  })),
)

const baseCols = [
  { headerName: 'پرسنل', field: 'personnel' },
  { headerName: 'واحد', field: 'costCenter' },
  { headerName: 'رابط اداری', field: 'liaisons' },
  /*
  { headerName: 'نوع درخواست', field: 'requestType', maxWidth: 160 },
*/
  { headerName: 'تاریخ شروع', field: 'startDate', maxWidth: 150 },
  { headerName: 'تاریخ پایان', field: 'endDate', maxWidth: 150 },
  /*
  { headerName: 'زمان', field: 'timeRange', maxWidth: 150 },
*/
]

const approverCol = {
  headerName: 'تایید کننده',
  field: 'approver',
  maxWidth: 200,
}

const actionsCol = {
  headerName: 'عملیات',
  field: 'actions',
  width: 150,
  valueFormatter: () => '',
  suppressHeaderMenuButton: true,
  suppressHeaderContextMenu: true,
  cellRendererSelector: () => ({
    component: 'Actions',
    params: {
      onApproveClick: (node, approve) => emit('approveRow', node, approve),
      onDetailsClick: node => emit('details', node),
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

function getContextMenuItems(params) {
  const api = params.api
  const node = params.node
  const data = node?.data

  if (node && !node.isSelected?.()) {
    api?.deselectAll?.()
    node.setSelected?.(true)
  }

  if (!data) return params.defaultItems ?? []

  const items = []

  if (props.tab === STATUSES.PENDING_HR_APPROVAL) {
    items.push({
      name: 'ویرایش',
      icon: '<i class="tabler tabler-edit" style="font-size: 18px;"></i>',
      action: () => emit('edit', node),
    })
  }

  items.push({
    name: 'نمایش ترددها',
    icon: '<i class="tabler-arrows-left-right" style="font-size: 18px;"></i>',
    action: () => emit('attendanceLog', node),
  })

  items.push({
    name: 'نمایش تاییدیه ها',
    icon: '<i class="tabler-git-branch" style="font-size: 18px;"></i>',
    action: () => emit('approvalFlow', node),
  })

  if (!items.length) return params.defaultItems ?? []

  return [...items, 'separator', ...(params.defaultItems ?? [])]
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
      :get-context-menu-items="getContextMenuItems"
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
