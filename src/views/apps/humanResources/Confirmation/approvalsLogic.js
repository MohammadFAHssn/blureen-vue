/* global axiosInstance */
export function useApprovalsLogic({ isMobile }) {
  const state = reactive({
    ui: {
      hasError: false,
      errorMessage: '',
      success: false,
      successMessage: '',
    },
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

  function raiseError(msg) {
    state.ui.hasError = true
    state.ui.errorMessage = msg
  }

  function raiseSuccess(msg) {
    state.ui.success = true
    state.ui.successMessage = msg
  }

  function resetSelection() {
    state.gridApi?.deselectAll?.()
    state.selection.gridIds = []
    state.selection.cardIds = []
  }

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
  }

  function onSelectionChanged() {
    const rows = state.gridApi?.getSelectedRows?.() ?? []
    state.selection.gridIds = rows
      .map(r => r?.id ?? r?.currentItem?.id)
      .filter(Boolean)
    state.gridApi?.refreshCells?.({ force: true })
  }

  function isCardSelected(id) {
    return state.selection.cardIds.includes(id)
  }

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

  async function fetchRequests() {
    state.loading = true
    try {
      const { data } = await axiosInstance('/hr-request/request/get-by-approver')
      state.requests = data.data || []
    }
    catch (e) {
      raiseError(e?.message || 'خطا در دریافت درخواست‌ها')
    }
    finally {
      state.loading = false
    }
  }

  async function handleApproveOrReject(approve) {
    const ids = [...(state.pendingIds || [])].filter(Boolean)
    if (!ids.length)
      return raiseError('هیچ ردیفی انتخاب نشده است.')
    if (approve === false && !state.rejectReason?.trim())
      return raiseError('ثبت علت رد الزامی است.')

    state.loading = true
    try {
      const body = {
        approve,
        approvalRequestsIds: ids,
        ...(approve === false
          ? { description: state.rejectReason.trim() }
          : {}),
      }

      // eslint-disable-next-line no-undef
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

      if (approve)
        resetApproveDialogState()
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

  function onCardsApprove(id) {
    approveSingleRequest({ id }, true)
  }

  function onCardsReject(id) {
    approveSingleRequest({ id }, false)
  }

  async function onSubmittedEdit() {
    raiseSuccess('ویرایش درخواست با موفقیت انجام شد.')
    await fetchRequests()
  }

  async function onSubmittedReferral() {
    raiseSuccess('ارجاع درخواست با موفقیت انجام شد.')
    await fetchRequests()
  }

  const pendingRequest = computed(() => state.pendingItem?.request)

  return {
    state,

    selectedCount,
    approveConfirmTitle,
    pendingRequest,

    fetchRequests,
    onGridReady,
    onSelectionChanged,
    toggleCardSelection,
    selectAllMobile,
    clearMobileSelection,
    approveMultiRequest,
    openRejectSelectedDialog,
    confirmApproveDialog,
    confirmRejectDialog,
    openDetails,
    onEditClick,
    onReferralClick,
    onCardsApprove,
    onCardsReject,
    onSubmittedEdit,
    onSubmittedReferral,
    approveSingleRequest,
  }
}
