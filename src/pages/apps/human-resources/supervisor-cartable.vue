<script setup>
import { useDisplay } from 'vuetify'
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'
import RejectDialog from '@/components/dialogs/RejectDialog.vue'
import ApprovalsFlowDialog from '@/views/apps/humanResources/Components/dialogs/ApprovalsFlowDialog.vue'
import AttendanceDialog from '@/views/apps/humanResources/Components/dialogs/AttendanceDialog.vue'
import EditForm from '@/views/apps/humanResources/LeaveRequest/DailyLeave/EditForm.vue'
import ApprovalsCardsView from '@/views/apps/humanResources/SupervisorCartable/ApprovalsCardsView.vue'
import ApprovalsGridView from '@/views/apps/humanResources/SupervisorCartable/ApprovalsGridView.vue'
import DetailsDialog from '@/views/apps/humanResources/SupervisorCartable/DetailsDialog.vue'
import { useSupervisorCartableLogic } from '@/views/apps/humanResources/SupervisorCartable/supervisorCartableLogic.js'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'use',
    subject: 'app',
  },
})

const { mdAndUp } = useDisplay()
const isMobile = computed(() => !mdAndUp.value)

const logic = useSupervisorCartableLogic({ isMobile })

onMounted(() => {
  logic.fetchRequests()
})
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

    <ApprovalsGridView v-if="!isMobile" />
    <ApprovalsCardsView v-else />

    <RejectDialog
      v-model:show="logic.state.dialogs.reject"
      v-model:reason="logic.state.rejectReason"
      max-width="520"
      @confirm="logic.confirmRejectDialog"
      @cancel="logic.resetConfirmationDialogState"
    />

    <DetailsDialog
      v-if="logic.state.dialogs.details"
      v-model:show="logic.state.dialogs.details"
      :request="logic.pendingRequest.value"
      @close="logic.state.dialogs.details = false"
    />

    <EditForm
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
  </VLayout>
</template>

<style scoped lang="scss">
.app-layout {
  display: grid;
  grid-template-rows: 1fr;
  inline-size: 100%;
  block-size: 100%;
  overflow-x: hidden;
}
</style>
