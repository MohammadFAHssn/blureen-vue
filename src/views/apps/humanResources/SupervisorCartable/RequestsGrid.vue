<script setup>
const props = defineProps({
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false },

  onApproveClick: { type: Function, required: true },
  onEditClick: { type: Function, required: true },
  onShowApprovalFlowClick: { type: Function, required: true },
})

const selectedIds = defineModel('selectedIds', {
  type: Array,
  default: () => [],
})

const { theme } = useAGGridTheme()
const gridApi = ref(null)

function fmtTimeRange(r) {
  return r.start_time && r.end_time ? `${r.start_time} - ${r.end_time}` : '-'
}

const rowData = computed(() =>
  (props.items ?? []).map(item => ({
    currentItem: item,
    id: item.id,
    personnelCode: item.user.personnel_code,
    personnel: `${item.user.personnel_code} - ${item.user.first_name} ${item.user.last_name}`,
    requestType: item.type.name,
    startDate: item.start_date,
    endDate: item.end_date,
    timeRange: fmtTimeRange(item),
    actions: {
      approvable: true,
    },
  })),
)

const columnDefs = computed(() => [
  { headerName: 'پرسنل', field: 'personnel' },
  { headerName: 'نوع درخواست', field: 'requestType', maxWidth: 150 },
  { headerName: 'تاریخ شروع', field: 'startDate', maxWidth: 150 },
  { headerName: 'تاریخ پایان', field: 'endDate', maxWidth: 150 },
  { headerName: 'زمان', field: 'timeRange', maxWidth: 150 },
  {
    headerName: 'عملیات',
    field: 'actions',
    width: 175,
    sortable: false,
    filter: false,
    valueFormatter: () => '',
    suppressHeaderMenuButton: true,
    suppressHeaderContextMenu: true,
    cellRendererSelector: () => ({
      component: 'Actions',
      params: {
        onApproveClick: props.onApproveClick,
      },
    }),
  },
])

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

  items.push({
    name: 'ویرایش',
    icon: '<i class="tabler-edit" style="font-size: 18px;"></i>',
    action: () => props.onEditClick(node),
  })

  items.push({
    name: 'نمایش تاییدیه ها',
    icon: '<i class="tabler-git-branch" style="font-size: 18px;"></i>',
    action: () => props.onShowApprovalFlowClick(node),
  })

  if (!items.length) return params.defaultItems ?? []

  return [...items, 'separator', ...(params.defaultItems ?? [])]
}

defineExpose({
  clearSelection() {
    gridApi.value?.deselectAll?.()
    selectedIds.value = []
  },
})
</script>

<template>
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
</template>
