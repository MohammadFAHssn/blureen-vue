<script setup>
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'
import RejectDialog from '@/components/dialogs/RejectDialog.vue'
import ApprovalsFlowDialog from '@/views/apps/humanResources/Components/dialogs/ApprovalsFlowDialog.vue'
import AttendanceDialog from '@/views/apps/humanResources/Components/dialogs/AttendanceDialog.vue'
import RequestsToolbar from '@/views/apps/humanResources/Confirmation/RequestsToolbar.vue'
import EditDialog from '@/views/apps/humanResources/Components/dialogs/EditDialog.vue'
import SecurityCartableGrid from '@/views/apps/humanResources/SecurityCartable/SecurityCartableGrid.vue'
import { useSecurityCartableLogic } from '@/views/apps/humanResources/SecurityCartable/securityCartableLogic.js'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'use',
    subject: 'app',
  },
})

const logic = useSecurityCartableLogic()

const selectedIds = ref([])
const selectedCount = computed(() => selectedIds.value.length)

onMounted(() => {
  logic.fetchRequestsForActiveTab()
})

watch(
  () => logic.state.activeTab,
  () => {
    selectedIds.value = []
  },
)

function onApproveSelected() {
  logic.approveMultiRequest(selectedIds.value)
}

function onRejectSelected() {
  logic.openRejectSelectedDialog(selectedIds.value)
}
</script>

<template>
  <VLayout class="app-layout">
    <VSnackbar
      v-model="logic.state.ui.hasError"
      :timeout="3000"
      location="center"
      variant="flat"
      color="error"
    >
      {{ logic.state.ui.errorMessage }}
    </VSnackbar>

    <VSnackbar
      v-model="logic.state.ui.success"
      :timeout="2000"
      location="center"
      variant="flat"
      color="success"
    >
      {{ logic.state.ui.successMessage }}
    </VSnackbar>

    <div class="wrap">
      <RequestsToolbar
        :tabs="logic.state.tabs"
        :active-tab="logic.state.activeTab"
        :is-mobile="false"
        :selected-count="selectedCount"
        :loading="logic.state.loading"
        :show-confirm-btn="false"
        @select-tab="logic.setActiveTab"
        @refresh="logic.fetchRequestsForActiveTab"
        @approve-selected="onApproveSelected"
        @reject-selected="onRejectSelected"
      />

      <SecurityCartableGrid
        v-model:selected-ids="selectedIds"
        :tab="logic.state.activeTab"
        :items="logic.items.value"
        :loading="logic.state.loading"
        @edit="logic.onEditClick"
        @approve-row="logic.approveRow"
        @approval-flow="logic.onShowApprovalFlowClick"
        @attendance-log="logic.onShowAttendancesClick"
      />
    </div>

    <EditDialog
      v-if="logic.state.dialogs.edit"
      v-model:is-dialog-visible="logic.state.dialogs.edit"
      :request="logic.pendingRequest.value"
      @submit="logic.onSubmittedEdit"
    />

    <ApprovalsFlowDialog
      v-if="logic.state.dialogs.approvalFlow"
      v-model:is-dialog-visible="logic.state.dialogs.approvalFlow"
      :request="logic.pendingRequest.value"
    />

    <AttendanceDialog
      v-if="logic.state.dialogs.attendanceLogs"
      v-model:is-dialog-visible="logic.state.dialogs.attendanceLogs"
      :loading="logic.state.loading"
      :request="logic.pendingRequest.value"
      @submit="logic.confirmApproveDialog(true)"
    />
    <AreYouSureDialog
      v-if="logic.state.dialogs.approveConfirm"
      v-model:is-dialog-visible="logic.state.dialogs.approveConfirm"
      :title="logic.approveConfirmTitle.value"
      :loading="logic.state.loading"
      @confirm="logic.confirmApproveDialog"
    />

    <RejectDialog
      v-model:show="logic.state.dialogs.reject"
      v-model:reason="logic.state.rejectReason"
      :loading="logic.state.loading"
      max-width="520"
      @confirm="logic.confirmRejectDialog"
      @cancel="logic.resetConfirmationDialogState"
    />
  </VLayout>
</template>

<style scoped lang="scss">
.app-layout {
  display: grid;
  grid-template-rows: 1fr;
  inline-size: 100%;
  block-size: 100%;
  overflow: hidden;
}

.wrap {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 0.75rem;
  inline-size: 100%;
  block-size: 100%;
  min-height: 0;
}

.tabs-card {
  overflow: hidden;
}

:deep(.v-tabs) {
  min-height: 48px;
}
</style>
