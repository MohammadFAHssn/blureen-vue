<script setup>
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'
import RejectDialog from '@/components/dialogs/RejectDialog.vue'
import DetailsDialog from '@/views/apps/humanResources/Confirmation/DetailsDialog.vue'

definePage({ meta: { layoutWrapperClasses: 'layout-content-height-fixed' } })

const { theme } = useAGGridTheme()

const state = reactive({
  alert: { show: false, type: '', message: '', timeout: 2000 },
  loading: false,
  requests: [],
  gridApi: null,
  dialogs: { reject: false, approveConfirm: false, details: false },
  detailsItem: null,
  rejectReason: '',
  pendingNodes: [],
  pendingRows: [],
})

function toIds(nodes) {
  return (nodes ?? []).map((n) => n?.data?.currentItemId).filter(Boolean)
}

function raiseError(msg) {
  state.alert.type = 'error'
  state.alert.message = msg
  state.alert.show = true
}

function raiseSuccess(msg) {
  state.alert.type = 'success'
  state.alert.message = msg
  state.alert.show = true
}

const rowData = computed(() =>
  (state.requests ?? []).map((item) => ({
    currentItemId: item.id,
    personnelCode: item.request.user.personnel_code,
    fullName: `${item.request.user.first_name} ${item.request.user.last_name}`,
    requestType: item.request.type.name,
    startDate: item.request.start_date,
    endDate: item.request.end_date,
    timeRange:
      item.request.start_time && item.request.end_time
        ? `${moment(item.request.start_time, 'HH:mm:ss').format('HH:mm')}-${moment(item.request.end_time, 'HH:mm:ss').format('HH:mm')}`
        : '-',
    actions: {
      approvable: true,
      detailsable: true,
    },
    raw: item,
  })),
)

const columnDefs = ref([
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
        onApproveClick: approveSingleRequest,
        onDetailsClick: openDetailsFromNode,
      },
    }),
  },
])

const selectedCount = computed(() => state.pendingRows.length ?? 0)

const approveConfirmTitle = computed(() => {
  return `آیا از تایید ${selectedCount.value === 1 ? 'این مورد' : `${selectedCount.value} مورد`} اطمینان دارید؟`
})

function onGridReady(params) {
  state.gridApi = params.api
  state.gridApi.setGridOption('rowData', rowData.value)
}

function onSelectionChanged() {
  state.pendingRows = state.gridApi?.getSelectedRows?.() ?? []
}

watch(rowData, (rows) => state.gridApi?.setGridOption?.('rowData', rows))

function openDetailsFromNode(node) {
  // todo:detailsItem value is not correct here
  state.detailsItem = node.data.raw
  state.dialogs.details = true
}

function resetRejectDialogState() {
  state.dialogs.reject = false
  state.pendingNodes = []
  state.rejectReason = ''
}

async function approveSingleRequest(node, action) {
  if (!node?.data) return raiseError('داده‌ی ردیف معتبر نیست.')
  state.pendingRows = [node]

  if (action === false) {
    state.rejectReason = ''
    state.dialogs.reject = true
    return
  }

  state.dialogs.approveConfirm = true
}

function handleMultiRequest(action) {
  state.pendingRows = state.gridApi?.getSelectedNodes?.() || []
  if (action === 'approve') {
    state.dialogs.approveConfirm = true
  } else if (action === 'reject') {
    state.rejectReason = ''
    state.dialogs.reject = true
  }
}

function confirmRejectDialog() {
  return handleApproveOrReject(false, state.pendingRows)
}

async function confirmApproveDialog() {
  await handleApproveOrReject(true, state.pendingRows)
  state.dialogs.approveConfirm = false
}

async function handleApproveOrReject(approve, nodes) {
  const ids = toIds(nodes)
  if (!ids.length) return raiseError('هیچ ردیفی انتخاب نشده است.')
  if (approve === false && !state.rejectReason?.trim())
    return raiseError('ثبت علت رد الزامی است.')

  state.loading = true
  try {
    const formData = {
      approve,
      approvalRequestsIds: ids,
      ...(approve === false ? { description: state.rejectReason.trim() } : {}),
    }

    const {data} = axiosInstance.post('/hr-request/request/approve' , formData)

    await $api('/hr-request/request/approve', {
      method: 'POST',
      body,
      onResponseError({ response }) {
        throw new Error(
          response?._data?.message || 'خطا در ثبت تایید/رد درخواست',
        )
      },
    })

    raiseSuccess(`با موفقیت ${approve ? 'تایید' : 'رد'} شد.`)
    resetRejectDialogState()
    await fetchRequests()
  } catch (err) {
    raiseError(err?.message || 'خطایی رخ داد')
  } finally {
    state.loading = false
  }
}

async function fetchRequests() {
  state.loading = true
  try {
    const { data } = await axiosInstance('/hr-request/request/get-by-approver')
    state.requests = data.data || []
  } catch (e) {
    raiseError(e?.message || 'خطا در دریافت درخواست‌ها')
  } finally {
    state.loading = false
  }
}

onMounted(() => {
  fetchRequests()
})
</script>

<template>
  <VLayout class="app-layout">
    <VSnackbar
      v-model="state.alert.show"
      :timeout="state.alert.timeout"
      location="center"
      variant="flat"
      :color="state.alert.type"
    >
      {{ state.alert.message }}
    </VSnackbar>
    <section class="toolbar">
      <div class="left-actions">
        <VBtn
          v-if="selectedCount > 1"
          color="success"
          @click="handleMultiRequest('approve')"
        >
          تایید انتخاب‌شده‌ها ({{ selectedCount }})
        </VBtn>

        <VBtn
          v-if="selectedCount > 1"
          color="error"
          @click="handleMultiRequest('reject')"
        >
          رد انتخاب‌شده‌ها ({{ selectedCount }})
        </VBtn>
      </div>

      <VSpacer />

      <VBtn
        variant="flat"
        color="primary"
        :loading="state.loading"
        :disabled="state.loading"
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
        :loading="state.loading"
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
    </section>

    <RejectDialog
      v-model:show="state.dialogs.reject"
      v-model:reason="state.rejectReason"
      max-width="520"
      @confirm="confirmRejectDialog"
      @cancel="resetRejectDialogState"
    />
    <DetailsDialog
      v-model:show="state.dialogs.details"
      :details="state.detailsItem"
      @close="
        () => {
          state.dialogs.details = false
        }
      "
    />
    <AreYouSureDialog
      v-if="state.dialogs.approveConfirm"
      v-model:is-dialog-visible="state.dialogs.approveConfirm"
      :title="approveConfirmTitle"
      :loading="state.loading"
      @confirm="confirmApproveDialog"
    />
  </VLayout>
</template>

<style lang="scss" scoped>
.app-layout {
  display: grid;
  grid-template-rows: auto 1fr;
  inline-size: 100%;
  block-size: 100%;
  overflow-x: hidden;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem;
  flex-wrap: wrap;
}

.left-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  max-inline-size: 100%;
}

:deep(.v-btn) {
  min-height: 36px;
}
</style>
