import { can } from '@layouts/plugins/casl.js'
/* global axiosInstance */
import { computed, reactive } from 'vue'
import { STATUSES } from '@/utils/constants.js'

export const REQUEST_TABS = Object.freeze([
  { value: STATUSES.PENDING_HR_APPROVAL, title: 'در انتظار تایید کارگزینی' },
  { value: STATUSES.PENDING, title: 'در روند' },
  { value: STATUSES.APPROVED, title: 'آرشیو تایید شده' },
  { value: STATUSES.REJECTED, title: 'آرشیو رد شده' },
])

export const userCanManege = computed(() => {
  return can('manage', 'HR-Cartable')
})

const visibleTabs = computed(() => {
  return REQUEST_TABS.filter((tab) => {
    if (tab.value === STATUSES.PENDING_HR_APPROVAL) {
      return userCanManege.value
    }
    return true
  })
})

export function useHrCartableLogic() {
  const state = reactive({
    tabs: visibleTabs,
    userCanManege,
    ui: {
      hasError: false,
      errorMessage: '',
      success: false,
      successMessage: '',
    },

    loading: false,
    activeTab: STATUSES.PENDING_HR_APPROVAL,

    loadedTabs: new Set(),
    requestsByTab: {
      [STATUSES.PENDING_HR_APPROVAL]: [],
      [STATUSES.PENDING]: [],
      [STATUSES.APPROVED]: [],
      [STATUSES.REJECTED]: [],
    },

    dialogs: {
      reject: false,
      approveConfirm: false,
      edit: false,
      details: false,
      referral: false,
      approvalFlow: false,
      attendanceLogs: false,
    },

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

  const items = computed(() => state.requestsByTab[state.activeTab] ?? [])
  const pendingRequest = computed(() => state.pendingItem ?? null)

  const approveConfirmTitle = computed(() => {
    const count = state.pendingIds.length || 1
    return `آیا از تایید ${count === 1 ? 'این مورد' : `${count} مورد`} اطمینان دارید؟`
  })

  function setPendingFromNode(node) {
    const data = node?.data ?? node
    const item = data?.currentItem ?? data
    state.pendingItem = item ?? null
    state.pendingIds = item?.id ? [item.id] : []
  }

  function resetConfirmationDialogState() {
    state.dialogs.reject = false
    state.rejectReason = ''
    state.pendingIds = []
    state.pendingItem = null
    state.dialogs.approveConfirm = false
    state.dialogs.attendanceLogs = false
  }

  async function fetchRequestsForActiveTab(force = false) {
    if (!force && state.loadedTabs.has(state.activeTab))
      return
    let statuses = [state.activeTab]
    if (state.activeTab === STATUSES.PENDING) {
      statuses = [
        STATUSES.PENDING,
        STATUSES.PENDING_LIAISON_APPROVAL,
        STATUSES.PENDING_SUPERVISOR_APPROVAL,
      ]
    }
    state.loading = true
    try {
      const { data } = await axiosInstance.get(
        '/hr-request/request/get-by-status',
        {
          params: { statuses },
        },
      )

      state.requestsByTab[state.activeTab] = data?.data ?? []
      state.loadedTabs.add(state.activeTab)
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

  function refreshActiveTab() {
    return fetchRequestsForActiveTab(true)
  }

  function setActiveTab(status) {
    state.activeTab = status
    fetchRequestsForActiveTab(false)
  }

  function openDetails(node) {
    setPendingFromNode(node)
    state.dialogs.details = true
  }

  function onEditClick(node) {
    setPendingFromNode(node)
    state.dialogs.edit = true
  }

  function onReferralClick(node) {
    setPendingFromNode(node)
    state.dialogs.referral = true
  }

  function onShowApprovalFlowClick(node) {
    setPendingFromNode(node)
    state.dialogs.approvalFlow = true
  }

  function onShowAttendancesClick(node) {
    setPendingFromNode(node)
    state.dialogs.attendanceLogs = true
  }

  function approveRow(node, approve) {
    setPendingFromNode(node)

    if (approve === false) {
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

  async function confirmApproveDialog(ignoreAttendance = false) {
    await handleApproveOrReject(true, ignoreAttendance)
  }

  async function confirmRejectDialog() {
    await handleApproveOrReject(false)
  }

  async function handleApproveOrReject(approve, ignoreAttendance = false) {
    state.loading = true
    try {
      await axiosInstance.post('/hr-request/request/hr-confirm', {
        requestIds: state.pendingIds,
        description: state.rejectReason,
        approve,
        ignoreAttendance,
        approverPosition: userCanManege.value ? 'HR_manager' : 'liaison',
      })
      raiseSuccess('با موفقیت ذخیره شد.')
    }
    catch (e) {
      raiseError(e?.response?.data?.message || 'خطایی رخ داد')
    }
    finally {
      state.loading = false
      resetConfirmationDialogState()
      await fetchRequestsForActiveTab(true)
    }
  }

  async function onSubmittedEdit() {
    raiseSuccess('ویرایش درخواست با موفقیت انجام شد.')
    await fetchRequestsForActiveTab(true)
  }

  async function onSubmittedReferral() {
    raiseSuccess('ارجاع درخواست با موفقیت انجام شد.')
    await fetchRequestsForActiveTab(true)
  }

  return {
    state,
    items,
    pendingRequest,
    approveConfirmTitle,

    setActiveTab,
    fetchRequestsForActiveTab,
    refreshActiveTab,

    openDetails,
    onEditClick,
    onReferralClick,
    onShowApprovalFlowClick,
    onShowAttendancesClick,

    approveRow,
    approveMultiRequest,
    openRejectSelectedDialog,

    confirmApproveDialog,
    confirmRejectDialog,
    resetConfirmationDialogState,

    onSubmittedEdit,
    onSubmittedReferral,
  }
}
