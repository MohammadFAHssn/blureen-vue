<script setup>
defineProps({
  columnDefs: { type: Array, required: true },
  rowData: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['gridReady', 'selectionChanged'])
const { theme } = useAGGridTheme()

function onGridReady(params) {
  emit('gridReady', params)
}

function onSelectionChanged(params) {
  emit('selectionChanged', params)
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
