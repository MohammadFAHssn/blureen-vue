<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

import { useApprovalsLogic } from '@/views/apps/humanResources/Confirmation/approvalsLogic.js'
import RequestsCards from '@/views/apps/humanResources/Confirmation/RequestsCards.vue'
import RequestsToolbar from '@/views/apps/humanResources/Confirmation/RequestsToolbar.vue'

const logic = useApprovalsLogic({ isMobile: computed(() => true) })

const cardSelectedIds = ref([])

const selectedCount = computed(() => cardSelectedIds.value.length)

function toggleCardSelection(id) {
  cardSelectedIds.value = cardSelectedIds.value.includes(id)
    ? cardSelectedIds.value.filter(x => x !== id)
    : [...cardSelectedIds.value, id]
}

function selectAllMobile() {
  cardSelectedIds.value = (logic.state.requests ?? [])
    .map(r => r.id)
    .filter(Boolean)
}

function clearMobileSelection() {
  cardSelectedIds.value = []
}

function onApproveSelected() {
  logic.approveMultiRequest(cardSelectedIds.value)
}

function onRejectSelected() {
  logic.openRejectSelectedDialog(cardSelectedIds.value)
}

function onApprove(id) {
  logic.approveSingleRequest({ id }, true)
}

function onReject(id) {
  logic.approveSingleRequest({ id }, false)
}

onBeforeUnmount(() => {
  clearMobileSelection()
})
</script>

<template>
  <div class="wrap">
    <RequestsToolbar
      :is-mobile="true"
      :selected-count="selectedCount"
      :loading="logic.state.loading"
      :show-confirm-btn="true"
      @refresh="logic.fetchRequests"
      @approve-selected="onApproveSelected"
      @reject-selected="onRejectSelected"
      @select-all-mobile="selectAllMobile"
      @clear-mobile-selection="clearMobileSelection"
    />

    <section class="cards-wrapper">
      <RequestsCards
        :items="logic.state.requests"
        :loading="logic.state.loading"
        :selected-ids="cardSelectedIds"
        @toggle-select="toggleCardSelection"
        @approve="onApprove"
        @reject="onReject"
        @attendance="logic.onShowAttendanceLogsClick"
        @details="logic.openDetails"
        @edit="logic.onEditClick"
        @referral="logic.onReferralClick"
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
  min-height: 0;
}
.cards-wrapper {
  overflow-y: auto;
  min-height: 0;
}
</style>
