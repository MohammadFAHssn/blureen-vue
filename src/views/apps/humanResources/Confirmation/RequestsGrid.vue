<script setup>
import { computed, ref } from 'vue'

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
  return r.start_time && r.end_time ? `${r.start_time} - ${r.end_time}` : '-'
}

const rowData = computed(() =>
  (props.items ?? []).map((item) => ({
    currentItem: item,
    id: item.id,
    personnelCode: item.request.user.personnel_code,
    fullName: `${item.request.user.first_name} ${item.request.user.last_name}`,
    requestType: item.request.type.name,
    startDate: item.request.start_date,
    endDate: item.request.end_date,
    timeRange: fmtTimeRange(item.request),
    actions: {
      approvable: true,
      detailsable: false,
      editable: { status: true, mode: 'view' },
      referrable: true,
    },
  })),
)

const columnDefs = computed(() => [
  { headerName: 'کد پرسنلی', field: 'personnelCode' },
  { headerName: 'نام و نام خانوادگی', field: 'fullName' },
  { headerName: 'نوع درخواست', field: 'requestType' },
  { headerName: 'تاریخ شروع', field: 'startDate' },
  { headerName: 'تاریخ پایان', field: 'endDate' },
  { headerName: 'زمان', field: 'timeRange' },
  {
    headerName: 'عملیات',
    field: 'actions',
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
    .map((r) => r?.id ?? r?.currentItem?.id)
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
    @grid-ready="onGridReady"
    @selection-changed="onSelectionChanged"
  />
</template>
