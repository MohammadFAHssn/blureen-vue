/* global axiosInstance */
import { computed, reactive } from 'vue'

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
    loading: false,
    requests: [],

    dialogs: {
      reject: false,
      approveConfirm: false,
      edit: false,
      details: false,
      referral: false,
      approvalFlow: false,
      attendanceLogs: false,
    },

    detailsItem: null,
    rejectReason: '',

    pendingIds: [],
    pendingItem: null,
  })

  function raiseError(msg) {
    state.ui.hasError = true
    state.ui.errorMessage = msg
  }

  function raiseSuccess(msg) {
    state.ui.success = true
    state.ui.successMessage = msg
  }

  async function fetchRequests() {
    state.loading = true
    try {
      const { data } = await axiosInstance(
        '/hr-request/request/get-by-approver',
      )
      state.requests = data.data || []
    }
    catch (e) {
      raiseError(e?.message || 'خطا در دریافت درخواست‌ها')
    }
    finally {
      state.loading = false
    }
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

  function onReferralClick(request) {
    setPendingFromItem(request)
    state.dialogs.referral = true
  }

  function onShowApprovalFlowClick(request) {
    setPendingFromItem(request)
    state.dialogs.approvalFlow = true
  }
  function onShowAttendanceLogsClick(request) {
    setPendingFromItem(request)
    state.dialogs.attendanceLogs = true
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
      await fetchRequests()
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
    await fetchRequests()
  }

  async function onSubmittedReferral() {
    raiseSuccess('ارجاع درخواست با موفقیت انجام شد.')
    await fetchRequests()
  }

  const approveConfirmTitle = computed(() => {
    const count = state.pendingIds.length || 1
    return `آیا از تایید ${count === 1 ? 'این مورد' : `${count} مورد`} اطمینان دارید؟`
  })

  const pendingRequest = computed(() => state.pendingItem?.request)

  return {
    state,
    fetchRequests,
    openDetails,
    onEditClick,
    onReferralClick,
    onShowApprovalFlowClick,
    onShowAttendanceLogsClick,
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

export function useApprovalsLogic({ isMobile } = {}) {
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
