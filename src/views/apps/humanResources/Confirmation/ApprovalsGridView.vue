<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useApprovalsLogic } from '@/views/apps/humanResources/Confirmation/approvalsLogic.js'
import RequestsGrid from '@/views/apps/humanResources/Confirmation/RequestsGrid.vue'
import RequestsToolbar from '@/views/apps/humanResources/Confirmation/RequestsToolbar.vue'

const logic = useApprovalsLogic({ isMobile: computed(() => false) })
const gridSelectedIds = ref([])
const selectedCount = computed(() => gridSelectedIds.value.length)

function onApproveSelected() {
  logic.approveMultiRequest(gridSelectedIds.value)
}
function onRejectSelected() {
  logic.openRejectSelectedDialog(gridSelectedIds.value)
}
function clearGridSelection() {
  gridSelectedIds.value = []
}

onBeforeUnmount(() => {
  clearGridSelection()
})
</script>

<template>
  <div class="wrap">
    <RequestsToolbar
      :tabs="logic.state.tabs"
      :active-tab="logic.state.activeTab"
      :is-mobile="false"
      :selected-count="selectedCount"
      :loading="logic.state.loading"
      :show-confirm-btn="true"
      @select-tab="logic.setActiveTab"
      @refresh="logic.fetchRequestsForActiveTab"
      @approve-selected="onApproveSelected"
      @reject-selected="onRejectSelected"
    />

    <section class="grid">
      <RequestsGrid
        v-model:selected-ids="gridSelectedIds"
        :items="logic.state.requests"
        :loading="logic.state.loading"
        :can-be-changed="logic.state.requestCanBeManaged"
        :on-approve-click="logic.approveSingleRequest"
        :on-details-click="logic.openDetails"
        :on-edit-click="logic.onEditClick"
        :on-referral-click="logic.onReferralClick"
        :on-show-approval-flow-click="logic.onShowApprovalFlowClick"
        :on-show-attendance-logs-click="logic.onShowAttendanceLogsClick"
      />
    </section>
  </div>
</template>

<style scoped lang="scss">
.wrap {
  display: grid;
  grid-template-rows: auto 1fr;
  inline-size: 100%;
  block-size: 100%;
}
.grid {
  block-size: 100%;
}
</style>
