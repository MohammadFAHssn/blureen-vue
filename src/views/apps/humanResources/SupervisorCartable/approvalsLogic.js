/* global axiosInstance */
import { computed, reactive } from 'vue'
import { STATUSES } from '@/utils/constants.js'

export const REQUEST_TABS = Object.freeze([
  {
    value: STATUSES.PENDING_SUPERVISOR_APPROVAL,
    title: 'در انتظار تایید',
    icon: 'tabler-clock',
  },
  {
    value: STATUSES.PENDING,
    title: 'در روند',
    icon: 'tabler-loader-2',
  },
  {
    value: STATUSES.PENDING_LIAISON_APPROVAL,
    title: 'تایید شده',
    icon: 'tabler-check',
  },
  {
    value: STATUSES.REJECTED,
    title: 'رد شده',
    icon: 'tabler-ban',
  },
])

let _state
let _fns

function createShared() {
  const state = reactive({
    ui: {
      hasError: false,
      errorMessage: '',
      success: false,
      successMessage: '',
    },
    tabs: REQUEST_TABS,
    activeTab: STATUSES.PENDING_SUPERVISOR_APPROVAL,

    loading: false,
    requests: [],

    dialogs: {
      reject: false,
      approveConfirm: false,
      edit: false,
      approvalFlow: false,
    },

    detailsItem: null,
    rejectReason: '',

    pendingIds: [],
    pendingItem: null,
  })

  async function fetchRequestsForActiveTab() {
    state.loading = true
    try {
      const { data } = await axiosInstance.get(
        '/hr-request/request/get-hourly-requests',
        {
          params: { status: state.activeTab },
        },
      )

      state.requests = data?.data ?? []
    }
    catch (e) {
      raiseError(
        e?.response?.data?.message || e?.message || 'خطا در دریافت درخواست‌ها',
      )
    }
    finally {
      state.loading = false
    }
  }

  function setActiveTab(status) {
    state.activeTab = status
    fetchRequestsForActiveTab()
  }
  function raiseError(msg) {
    state.ui.hasError = true
    state.ui.errorMessage = msg
  }

  function raiseSuccess(msg) {
    state.ui.success = true
    state.ui.successMessage = msg
  }

  function openDetails(request) {
    setPendingFromItem(request)
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

  function onShowApprovalFlowClick(request) {
    setPendingFromItem(request)
    state.dialogs.approvalFlow = true
  }

  function resetConfirmationDialogState() {
    state.dialogs.reject = false
    state.pendingIds = []
    state.pendingItem = null
    state.rejectReason = ''
    state.dialogs.approveConfirm = false
    state.dialogs.attendanceLogs = false
  }

  async function handleApproveOrReject(approve, ignoreAttendance = false) {
    const ids = [...(state.pendingIds || [])].filter(Boolean)
    if (!ids.length)
      return raiseError('هیچ ردیفی انتخاب نشده است.')
    if (approve === false && !state.rejectReason?.trim())
      return raiseError('ثبت علت رد الزامی است.')

    state.loading = true
    try {
      await axiosInstance.post('/hr-request/request/approve', {
        approve,
        approvalRequestsIds: ids,
        ...(approve === false
          ? { description: state.rejectReason.trim() }
          : {}),
        ignoreAttendance,
      })
      raiseSuccess(`با موفقیت ${approve ? 'تایید' : 'رد'} شد.`)
    }
    catch (err) {
      raiseError(err?.response?.data?.message || 'خطایی رخ داد')
    }
    finally {
      state.loading = false
      resetConfirmationDialogState()
      await fetchRequestsForActiveTab()
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

  function approveMultiRequest(ids) {
    state.pendingIds = (ids ?? []).filter(Boolean)
    state.pendingItem = null
    state.dialogs.approveConfirm = true
  }

  function openRejectSelectedDialog(ids) {
    state.pendingIds = (ids ?? []).filter(Boolean)
    state.pendingItem = null
    state.rejectReason = ''
    state.dialogs.reject = true
  }

  function confirmRejectDialog() {
    return handleApproveOrReject(false)
  }

  async function confirmApproveDialog(ignoreAttendance = false) {
    await handleApproveOrReject(true, ignoreAttendance)
  }

  async function onSubmittedEdit() {
    raiseSuccess('ویرایش درخواست با موفقیت انجام شد.')
    await fetchRequestsForActiveTab()
  }

  async function onSubmittedReferral() {
    raiseSuccess('ارجاع درخواست با موفقیت انجام شد.')
    await fetchRequestsForActiveTab()
  }

  const approveConfirmTitle = computed(() => {
    const count = state.pendingIds.length || 1
    return `آیا از تایید ${count === 1 ? 'این مورد' : `${count} مورد`} اطمینان دارید؟`
  })

  const pendingRequest = computed(() => state.pendingItem?.request)

  return {
    state,
    setActiveTab,
    fetchRequestsForActiveTab,
    openDetails,
    onEditClick,
    onShowApprovalFlowClick,
    approveSingleRequest,
    approveMultiRequest,
    openRejectSelectedDialog,
    confirmApproveDialog,
    confirmRejectDialog,
    resetConfirmationDialogState,
    onSubmittedEdit,
    onSubmittedReferral,
    approveConfirmTitle,
    pendingRequest,
  }
}

export function useSupervisorCartableLogic({ isMobile } = {}) {
  if (!_state || !_fns) {
    const shared = createShared()
    _state = shared.state
    _fns = shared
  }

  return {
    ..._fns,
    state: _state,
    isMobile: isMobile ?? computed(() => false),
  }
}
