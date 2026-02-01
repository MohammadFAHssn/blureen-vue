<script setup>
import { useDisplay } from 'vuetify'
import RequestsCards from '@/views/apps/humanResources/Confirmation/RequestsCards.vue'
import RequestsDialogsHost from '@/views/apps/humanResources/Confirmation/RequestsDialogsHost.vue'
import RequestsGrid from '@/views/apps/humanResources/Confirmation/RequestsGrid.vue'
import RequestsToolbar from '@/views/apps/humanResources/Confirmation/RequestsToolbar.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'use',
    subject: 'app',
  },
})

const { theme } = useAGGridTheme()
const { mdAndUp } = useDisplay()
const isMobile = computed(() => !mdAndUp.value)

const state = reactive({
  ui: { hasError: false, errorMessage: '', success: false, successMessage: '' },
  loading: false,
  requests: [],
  gridApi: null,

  selection: {
    gridIds: [],
    cardIds: [],
  },

  dialogs: {
    reject: false,
    approveConfirm: false,
    edit: false,
    details: false,
    referral: false,
  },

  detailsItem: null,
  rejectReason: '',

  pendingIds: [],
  pendingItem: null,
})

function fmtTimeRange(r) {
  return r.start_time && r.end_time ? `${r.start_time} - ${r.end_time}` : '-'
}

function resetSelection() {
  state.gridApi?.deselectAll?.()
  state.selection.gridIds = []
  state.selection.cardIds = []
}

function raiseError(msg) {
  state.ui.hasError = true
  state.ui.errorMessage = msg
}

function raiseSuccess(msg) {
  state.ui.success = true
  state.ui.successMessage = msg
}

const rowData = computed(() =>
  (state.requests ?? []).map(item => ({
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
        onDetailsClick: openDetails,
        onEditClick,
        onReferralClick,
      },
    }),
  },
])

function effectiveSelectedIds() {
  return isMobile.value
    ? [...state.selection.cardIds]
    : [...state.selection.gridIds]
}

const selectedCount = computed(() => effectiveSelectedIds().length)

const approveConfirmTitle = computed(() => {
  const count = state.pendingIds.length || 1
  return `آیا از تایید ${count === 1 ? 'این مورد' : `${count} مورد`} اطمینان دارید؟`
})

function onGridReady(params) {
  state.gridApi = params.api
  state.gridApi.setGridOption('rowData', rowData.value)
}

watch(rowData, rows => state.gridApi?.setGridOption?.('rowData', rows))

const isCardSelected = id => state.selection.cardIds.includes(id)

function toggleCardSelection(id) {
  state.selection.cardIds = isCardSelected(id)
    ? state.selection.cardIds.filter(x => x !== id)
    : [...state.selection.cardIds, id]
}

function selectAllMobile() {
  state.selection.cardIds = state.requests.map(r => r.id).filter(Boolean)
}

function clearMobileSelection() {
  state.selection.cardIds = []
}

function openDetails(item) {
  state.detailsItem = item?.currentItem ?? item
  state.dialogs.details = true
}

function setPendingFromItem(item) {
  const current = item?.data?.currentItem ?? item?.currentItem ?? item
  const id = current?.id ?? item?.id ?? item?.data?.id
  state.pendingItem = current || null
  state.pendingIds = id ? [id] : []
}

function onEditClick(request) {
  setPendingFromItem(request)
  state.dialogs.edit = true
}

function onReferralClick(request) {
  setPendingFromItem(request)
  state.dialogs.referral = true
}

function resetRejectDialogState() {
  state.dialogs.reject = false
  state.pendingIds = []
  state.pendingItem = null
  state.rejectReason = ''
}

function resetApproveDialogState() {
  state.dialogs.approveConfirm = false
  state.pendingIds = []
  state.pendingItem = null
}

async function handleApproveOrReject(approve) {
  const ids = [...(state.pendingIds || [])].filter(Boolean)
  if (!ids.length) return raiseError('هیچ ردیفی انتخاب نشده است.')
  if (approve === false && !state.rejectReason?.trim())
    return raiseError('ثبت علت رد الزامی است.')

  state.loading = true
  try {
    const body = {
      approve,
      approvalRequestsIds: ids,
      ...(approve === false ? { description: state.rejectReason.trim() } : {}),
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

    raiseSuccess(`با موفقیت ${approve ? 'تایید' : 'رد'} شد.`)

    if (approve) resetApproveDialogState()
    else resetRejectDialogState()

    await fetchRequests()
    resetSelection()
  }
  catch (err) {
    raiseError(err?.message || 'خطایی رخ داد')
  }
  finally {
    state.loading = false
  }
}

function approveSingleRequest(rowOrNode, action) {
  const data = rowOrNode?.data ?? rowOrNode
  setPendingFromItem(data)

  if (action === false) {
    state.rejectReason = ''
    state.dialogs.reject = true
    return
  }

  state.dialogs.approveConfirm = true
}

function approveMultiRequest() {
  state.pendingIds = effectiveSelectedIds()
  state.pendingItem = null
  state.dialogs.approveConfirm = true
}

function openRejectSelectedDialog() {
  state.pendingIds = effectiveSelectedIds()
  state.pendingItem = null
  state.rejectReason = ''
  state.dialogs.reject = true
}

function confirmRejectDialog() {
  return handleApproveOrReject(false)
}

async function confirmApproveDialog() {
  await handleApproveOrReject(true)
}

async function fetchRequests() {
  state.loading = true
  try {
    const { data } = await axiosInstance('/hr-request/request/get-by-approver')
    state.requests = data.data || []
  }
  catch (error) {
    const error_message
      = error?.response?.data?.message
        || error?.message
        || 'خطا در دریافت اطلاعات'
    state.ui.hasError = true
    state.ui.errorMessage = error_message
  }
  finally {
    state.loading = false
  }
}

function onSelectionChanged() {
  const rows = state.gridApi?.getSelectedRows?.() ?? []
  state.selection.gridIds = rows
    .map(r => r?.id ?? r?.currentItem?.id)
    .filter(Boolean)
  state.gridApi?.refreshCells?.({ force: true })
}

function onCardsApprove(id) {
  approveSingleRequest({ id }, true)
}

function onCardsReject(id) {
  approveSingleRequest({ id }, false)
}

function onSubmittedEdit() {
  fetchRequests()
  raiseSuccess('ویرایش درخواست با موفقیت انجام شد.')
}

function onSubmittedReferral() {
  raiseSuccess('ارجاع درخواست با موفقیت انجام شد.')
  fetchRequests()
}

onMounted(() => {
  fetchRequests()
})
</script>

<template>
  <VLayout class="app-layout">
    <VSnackbar
      v-model="state.ui.hasError"
      :timeout="3000"
      location="center"
      variant="flat"
      color="error"
    >
      {{ state.ui.errorMessage }}
    </VSnackbar>

    <VSnackbar
      v-model="state.ui.success"
      :timeout="2000"
      location="center"
      variant="flat"
      color="success"
    >
      {{ state.ui.successMessage }}
    </VSnackbar>

    <RequestsToolbar
      :is-mobile="isMobile"
      :selected-count="selectedCount"
      :loading="state.loading"
      :has-requests="!!state.requests?.length"
      @refresh="fetchRequests"
      @approve-selected="approveMultiRequest"
      @reject-selected="openRejectSelectedDialog"
      @select-all-mobile="selectAllMobile"
      @clear-mobile-selection="clearMobileSelection"
    />

    <section v-show="!isMobile" style="block-size: 100%">
      <RequestsGrid
        :column-defs="columnDefs"
        :loading="state.loading"
        :theme="theme"
        @grid-ready="onGridReady"
        @selection-changed="onSelectionChanged"
      />
    </section>

    <section v-show="isMobile" class="cards-wrapper">
      <RequestsCards
        :items="state.requests"
        :loading="state.loading"
        :selected-ids="state.selection.cardIds"
        @toggle-select="toggleCardSelection"
        @approve="onCardsApprove"
        @reject="onCardsReject"
        @edit="onEditClick"
        @referral="onReferralClick"
      />
    </section>

    <RequestsDialogsHost
      v-model:show-reject="state.dialogs.reject"
      v-model:show-approve-confirm="state.dialogs.approveConfirm"
      v-model:show-edit="state.dialogs.edit"
      v-model:show-details="state.dialogs.details"
      v-model:show-referral="state.dialogs.referral"
      v-model:reject-reason="state.rejectReason"
      :loading="state.loading"
      :approve-confirm-title="approveConfirmTitle"
      :details-item="state.detailsItem"
      :pending-request="state.pendingItem?.request"
      @confirm-approve="confirmApproveDialog"
      @confirm-reject="confirmRejectDialog"
      @submitted-edit="onSubmittedEdit"
      @submitted-referral="onSubmittedReferral"
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
.cards-wrapper {
  block-size: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-inline: 0.25rem;
}
</style>
