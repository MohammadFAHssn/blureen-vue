<script setup>
const props = defineProps({
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false },

  onApproveClick: { type: Function, required: true },
  onDetailsClick: { type: Function, required: true },
  onEditClick: { type: Function, required: true },
  onReferralClick: { type: Function, required: true },
})

const selectedIds = defineModel('selectedIds', {
  type: Array,
  default: () => [],
})

const { theme } = useAGGridTheme()
const gridApi = ref(null)

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
    requestType: item.request_type_id ?? '-',
    startDate: item.start_date ?? '-',
    endDate: item.end_date ?? '-',
    timeRange: fmtTimeRange(item),

    actions: {
      approvable: true,
      detailsable: true,
      editable: { status: true, mode: 'view' },
      referrable: true,
    },
  })),
)

const columnDefs = computed(() => [
  { headerName: 'پرسنل', field: 'personnel' },
  { headerName: 'نوع درخواست', field: 'requestType', maxWidth: 160 },
  { headerName: 'تاریخ شروع', field: 'startDate', maxWidth: 150 },
  { headerName: 'تاریخ پایان', field: 'endDate', maxWidth: 150 },
  { headerName: 'زمان', field: 'timeRange', maxWidth: 150 },
  {
    headerName: 'عملیات',
    field: 'actions',
    width: 250,
    valueFormatter: () => '',
    suppressHeaderMenuButton: true,
    suppressHeaderContextMenu: true,
    cellRendererSelector: () => ({
      component: 'Actions',
      params: {
        onApproveClick: props.onApproveClick,
        onDetailsClick: props.onDetailsClick,
        onEditClick: props.onEditClick,
        onReferralClick: props.onReferralClick,
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
    @grid-ready="onGridReady"
    @selection-changed="onSelectionChanged"
  />
</template>
