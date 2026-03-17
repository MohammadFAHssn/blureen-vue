<script setup>
import { useSupervisorCartableLogic } from '@/views/apps/humanResources/SupervisorCartable/approvalsLogic.js'
import RequestsCards from '@/views/apps/humanResources/SupervisorCartable/RequestsCards.vue'
import RequestsToolbar from '@/views/apps/humanResources/SupervisorCartable/RequestsToolbar.vue'

const logic = useSupervisorCartableLogic({ isMobile: computed(() => true) })

const cardSelectedIds = ref([])

const selectedCount = computed(() => cardSelectedIds.value.length)

function toggleCardSelection(id) {
  cardSelectedIds.value = cardSelectedIds.value.includes(id)
    ? cardSelectedIds.value.filter((x) => x !== id)
    : [...cardSelectedIds.value, id]
}

function selectAllMobile() {
  cardSelectedIds.value = (logic.state.requests ?? [])
    .map((r) => r.id)
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
      :tabs="logic.state.tabs"
      :active-tab="logic.state.activeTab"
      :is-mobile="true"
      :selected-count="selectedCount"
      :loading="logic.state.loading"
      :show-confirm-btn="true"
      @select-tab="logic.setActiveTab"
      @refresh="logic.fetchRequestsForActiveTab"
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
        @edit="logic.onEditClick"
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
