<script setup>
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'
import RejectDialog from '@/components/dialogs/RejectDialog.vue'
import ApprovalsFlowDialog from '@/views/apps/humanResources/Components/dialogs/ApprovalsFlowDialog.vue'
import AttendanceDialog from '@/views/apps/humanResources/Components/dialogs/AttendanceDialog.vue'
import ReferralToSupervisorDialog from '@/views/apps/humanResources/Components/dialogs/ReferralToSupervisorDialog.vue'
import RequestsToolbar from '@/views/apps/humanResources/Confirmation/RequestsToolbar.vue'
import HrCartableGrid from '@/views/apps/humanResources/HrCartable/HrCartableGrid.vue'
import { useHrCartableLogic } from '@/views/apps/humanResources/HrCartable/hrCartableLogic.js'
import EditForm from '@/views/apps/humanResources/LeaveRequest/DailyLeave/EditForm.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'see',
    subject: 'HR-cartable',
  },
})

const logic = useHrCartableLogic()

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
      <VCard class="tabs-card" rounded="xl">
        <VTabs
          :model-value="logic.state.activeTab"
          class="px-2"
          @update:model-value="logic.setActiveTab"
        >
          <VTab v-for="t in logic.state.tabs" :key="t.value" :value="t.value">
            {{ t.title }}
          </VTab>
        </VTabs>
      </VCard>

      <RequestsToolbar
        :is-mobile="false"
        :selected-count="selectedCount"
        :loading="logic.state.loading"
        :show-confirm-btn="logic.state.userCanManege"
        @refresh="logic.refreshActiveTab"
        @approve-selected="onApproveSelected"
        @reject-selected="onRejectSelected"
      />

      <HrCartableGrid
        v-model:selected-ids="selectedIds"
        :tab="logic.state.activeTab"
        :items="logic.items.value"
        :loading="logic.state.loading"
        :user-can-manage="logic.state.userCanManege"
        @details="logic.openDetails"
        @edit="logic.onEditClick"
        @referral="logic.onReferralClick"
        @approval-flow="logic.onShowApprovalFlowClick"
        @attendance-log="logic.onShowAttendancesClick"
        @approve-row="logic.approveRow"
      />
    </div>

    <RejectDialog
      v-model:show="logic.state.dialogs.reject"
      v-model:reason="logic.state.rejectReason"
      :loading="logic.state.loading"
      max-width="520"
      @confirm="logic.confirmRejectDialog"
      @cancel="logic.resetConfirmationDialogState"
    />

    <!--    <DetailsDialog
      v-if="logic.state.dialogs.details"
      v-model:show="logic.state.dialogs.details"
      :request="logic.pendingRequest.value"
      @close="logic.state.dialogs.details = false"
    /> -->

    <ReferralToSupervisorDialog
      v-if="logic.state.dialogs.referral"
      v-model:is-dialog-visible="logic.state.dialogs.referral"
      :request="logic.pendingRequest.value"
      @submit="logic.onSubmittedReferral"
    />

    <EditForm
      v-if="logic.state.dialogs.edit"
      v-model:is-dialog-visible="logic.state.dialogs.edit"
      :request="logic.pendingRequest.value"
      @submit="logic.onSubmittedEdit"
    />

    <AreYouSureDialog
      v-if="logic.state.dialogs.approveConfirm"
      v-model:is-dialog-visible="logic.state.dialogs.approveConfirm"
      :title="logic.approveConfirmTitle.value"
      :loading="logic.state.loading"
      @confirm="logic.confirmApproveDialog"
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
  grid-template-rows: auto auto 1fr;
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
