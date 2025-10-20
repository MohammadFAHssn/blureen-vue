<script setup>
definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
  },
})

const uiState = reactive({
  hasError: false,
  errorMessage: '',
  success: false,
  successMessage: '',
})

const isLoading = ref(false)
const requests = ref([])
const selectedNodes = ref([])
const gridApi = ref(null)

const isRejectDialogVisible = ref(false)
const rejectReason = ref('')
const pendingNodes = ref([])

const selectedCount = computed(() => selectedNodes.value.length)

const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption('rowData', rowData())
}

const columnDefs = ref([
  { headerName: 'کد پرسنلی', field: 'personnelCode' },
  { headerName: 'نام و نام خانوادگی', field: 'fullName' },
  { headerName: 'نوع درخواست', field: 'requestType' },
  {
    headerName: 'تاریخ شروع',
    field: 'startDate',
    valueFormatter: p =>
      p.value ? moment(p.value, 'jYYYY-jMM-jDD').format('jYYYY/jMM/jD') : null,
  },
  {
    headerName: 'تاریخ پایان',
    field: 'endDate',
    valueFormatter: p =>
      p.value ? moment(p.value, 'jYYYY-jMM-jDD').format('jYYYY/jMM/jD') : null,
  },
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
        onApproveClick: approveSingleRequest,
      },
    }),
  },
])

function rowData() {
  return requests.value?.map(item => ({
    currentItemId: item.id,
    personnelCode: item.request.user.personnel_code,
    fullName: `${item.request.user.first_name} ${item.request.user.last_name}`,
    requestType: item.request.type.name,
    startDate: item.request.start_date,
    endDate: item.request.end_date,
    timeRange:
      item.request.start_time && item.request.end_time
        ? `${item.request.start_time} - ${item.request.end_time}`
        : '-',
    actions: { approvable: true },
  }))
}

function toIds(nodes) {
  return (nodes ?? [])
    .map((n) => {
      const d = n?.data ?? n
      return d?.currentItemId ?? d?.id ?? null
    })
    .filter(Boolean)
}

function resetRejectDialogState() {
  isRejectDialogVisible.value = false
  pendingNodes.value = []
  rejectReason.value = ''
}

async function handleApproveOrReject(approve, nodes) {
  const ids = toIds(nodes)

  if (!ids.length) {
    uiState.hasError = true
    uiState.errorMessage = 'هیچ ردیفی انتخاب نشده است.'
    return
  }

  if (approve === false && !rejectReason.value?.trim()) {
    uiState.hasError = true
    uiState.errorMessage = 'ثبت علت رد الزامی است.'
    return
  }

  isLoading.value = true
  try {
    const body = {
      approve,
      approvalRequestsIds: ids,
      ...(approve === false ? { description: rejectReason.value.trim() } : {}),
    }

    await $api('/hr-request/request/approve', {
      method: 'POST',
      body,
      onResponseError({ response }) {
        throw new Error(
          response?._data?.message || 'خطا در ثبت تایید/رد درخواست',
        )
      },
    })

    uiState.success = true
    uiState.successMessage = `با موفقیت ${approve ? 'تایید' : 'رد'} شد.`
    resetRejectDialogState()

    await fetchRequests()
    gridApi.value?.deselectAll?.()
    selectedNodes.value = []
  }
  catch (err) {
    uiState.hasError = true
    uiState.errorMessage = err?.message || 'خطایی رخ داد'
  }
  finally {
    isLoading.value = false
  }
}
async function approveSingleRequest(rowOrNode, action) {
  const data = rowOrNode?.data ?? rowOrNode
  pendingNodes.value = [data]

  if (action === false) {
    rejectReason.value = ''
    isRejectDialogVisible.value = true
    return
  }
  await handleApproveOrReject(true, pendingNodes.value)
}

async function approveMultiRequest() {
  pendingNodes.value = gridApi.value.getSelectedRows?.() || []
  await handleApproveOrReject(true, pendingNodes.value)
}

function openRejectSelectedDialog() {
  pendingNodes.value = gridApi.value.getSelectedRows?.() || []
  rejectReason.value = ''
  isRejectDialogVisible.value = true
}

async function confirmRejectDialog() {
  await handleApproveOrReject(false, pendingNodes.value)
}

async function fetchRequests() {
  isLoading.value = true
  try {
    const { data, error } = await useApi(
      createUrl('/hr-request/requests/get-by-approver'),
    )
    if (error.value) throw error.value
    requests.value = data.value.data || []
    gridApi.value?.setGridOption?.('rowData', rowData())
    gridApi.value?.deselectAll?.()
    selectedNodes.value = []
  }
  catch (e) {
    uiState.hasError = true
    uiState.errorMessage = e?.message || 'خطا در دریافت درخواست‌ها'
  }
  finally {
    isLoading.value = false
  }
}

fetchRequests()

function onSelectionChanged() {
  selectedNodes.value = gridApi.value?.getSelectedRows?.() ?? []
  gridApi.value?.refreshCells?.({ force: true })
}
</script>

<template>
  <VLayout class="app-layout">
    <VSnackbar
      v-model="uiState.hasError"
      :timeout="3000"
      location="center"
      variant="flat"
      color="error"
    >
      {{ uiState.errorMessage }}
    </VSnackbar>

    <VSnackbar
      v-model="uiState.success"
      :timeout="2000"
      location="center"
      variant="flat"
      color="success"
    >
      {{ uiState.successMessage }}
    </VSnackbar>

    <section class="toolbar">
      <VBtn
        v-if="selectedCount > 1"
        color="success"
        @click="approveMultiRequest"
      >
        تایید انتخاب‌شده‌ها
      </VBtn>
      <VBtn
        v-if="selectedCount > 1"
        color="error"
        @click="openRejectSelectedDialog"
      >
        رد انتخاب‌شده‌ها
      </VBtn>

      <VSpacer />
      <VBtn
        variant="flat"
        color="primary"
        :loading="isLoading"
        :disabled="isLoading"
        title="بروزرسانی لیست"
        @click="fetchRequests"
      >
        <VIcon icon="tabler-refresh" />
      </VBtn>
    </section>

    <section style="block-size: 100%">
      <AgGridVue
        style="block-size: 100%; inline-size: 100%"
        :column-defs="columnDefs"
        :suppress-click-edit="true"
        :loading="isLoading"
        enable-rtl
        row-numbers
        pagination
        :row-selection="{
          mode: 'multiRow',
          enableClickSelection: false,
          enableSelectionWithoutKeys: true,
          checkboxes: true,
          headerCheckbox: true,
        }"
        :theme="theme"
        @grid-ready="onGridReady"
        @selection-changed="onSelectionChanged"
      />
    </section>

    <VDialog v-model="isRejectDialogVisible" max-width="520">
      <VCard>
        <VCardTitle class="text-h6">
          علت رد درخواست
        </VCardTitle>
        <VCardText>
          <VTextarea
            v-model="rejectReason"
            label="علت رد"
            auto-grow
            rows="3"
            :rules="[(v) => !!v || 'وارد کردن علت الزامی است']"
            :disabled="isLoading"
          />
        </VCardText>
        <VCardActions class="justify-space-between">
          <VBtn variant="text" :disabled="isLoading" @click="resetRejectDialogState">
            لغو
          </VBtn>
          <VBtn
            color="error"
            :loading="isLoading"
            :disabled="!rejectReason"
            @click="confirmRejectDialog"
          >
            تایید رد
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VLayout>
</template>

<style lang="scss" scoped>
.app-layout {
  display: grid;
  grid-template-rows: auto 1fr;
  inline-size: 100%;
  block-size: 100%;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem;
}
</style>
