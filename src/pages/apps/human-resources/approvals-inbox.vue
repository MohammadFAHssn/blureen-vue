<!-- Updated main component (Stage 4) -->
<script setup>
import { computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'

import { useApprovalsLogic } from '@/views/apps/humanResources/Confirmation/approvalsLogic.js'
import RequestsCards from '@/views/apps/humanResources/Confirmation/RequestsCards.vue'
import RequestsDialogsHost from '@/views/apps/humanResources/Confirmation/RequestsDialogsHost.vue'
import RequestsGrid from '@/views/apps/humanResources/Confirmation/RequestsGrid.vue'
import RequestsToolbar from '@/views/apps/humanResources/Confirmation/RequestsToolbar.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'use',
    subject: 'app',
  },
})

const { theme } = useAGGridTheme()
const { mdAndUp } = useDisplay()
const isMobile = computed(() => !mdAndUp.value)

const logic = useApprovalsLogic({ isMobile })

const rowData = computed(() =>
  (logic.state.requests ?? []).map(item => ({
    currentItem: item,
    id: item.id,
    personnelCode: item.request.user.personnel_code,
    fullName: `${item.request.user.first_name} ${item.request.user.last_name}`,
    requestType: item.request.type.name,
    startDate: item.request.start_date,
    endDate: item.request.end_date,
    timeRange:
      item.request.start_time && item.request.end_time
        ? `${item.request.start_time} - ${item.request.end_time}`
        : '-',
    actions: {
      approvable: true,
      detailsable: false,
      editable: { status: true, mode: 'view' },
      referrable: true,
    },
  })),
)

const columnDefs = [
  { headerName: 'کد پرسنلی', field: 'personnelCode' },
  { headerName: 'نام و نام خانوادگی', field: 'fullName' },
  { headerName: 'نوع درخواست', field: 'requestType' },
  { headerName: 'تاریخ شروع', field: 'startDate' },
  { headerName: 'تاریخ پایان', field: 'endDate' },
  { headerName: 'زمان', field: 'timeRange' },
  {
    headerName: 'عملیات',
    field: 'actions',
    valueFormatter: () => '',
    suppressHeaderMenuButton: true,
    suppressHeaderContextMenu: true,
    cellRendererSelector: () => ({
      component: 'Actions',
      params: {
        onApproveClick: logic.approveSingleRequest,
        onDetailsClick: logic.openDetails,
        onEditClick: logic.onEditClick,
        onReferralClick: logic.onReferralClick,
      },
    }),
  },
]

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

    <RequestsToolbar
      :is-mobile="isMobile"
      :selected-count="logic.selectedCount.value"
      :loading="logic.state.loading"
      :has-requests="!!logic.state.requests?.length"
      @refresh="logic.fetchRequests"
      @approve-selected="logic.approveMultiRequest"
      @reject-selected="logic.openRejectSelectedDialog"
      @select-all-mobile="logic.selectAllMobile"
      @clear-mobile-selection="logic.clearMobileSelection"
    />

    <section v-show="!isMobile" style="block-size: 100%">
      <RequestsGrid
        :column-defs="columnDefs"
        :row-data="rowData"
        :loading="logic.state.loading"
        :theme="theme"
        @grid-ready="logic.onGridReady"
        @selection-changed="logic.onSelectionChanged"
      />
    </section>

    <section v-show="isMobile" class="cards-wrapper">
      <RequestsCards
        :items="logic.state.requests"
        :loading="logic.state.loading"
        :selected-ids="logic.state.selection.cardIds"
        @toggle-select="logic.toggleCardSelection"
        @approve="logic.onCardsApprove"
        @reject="logic.onCardsReject"
        @edit="logic.onEditClick"
        @referral="logic.onReferralClick"
      />
    </section>

    <RequestsDialogsHost
      v-model:show-reject="logic.state.dialogs.reject"
      v-model:show-approve-confirm="logic.state.dialogs.approveConfirm"
      v-model:show-edit="logic.state.dialogs.edit"
      v-model:show-details="logic.state.dialogs.details"
      v-model:show-referral="logic.state.dialogs.referral"
      v-model:reject-reason="logic.state.rejectReason"
      :loading="logic.state.loading"
      :approve-confirm-title="logic.approveConfirmTitle.value"
      :details-item="logic.state.detailsItem"
      :pending-request="logic.pendingRequest.value"
      @confirm-approve="logic.confirmApproveDialog"
      @confirm-reject="logic.confirmRejectDialog"
      @submitted-edit="logic.onSubmittedEdit"
      @submitted-referral="logic.onSubmittedReferral"
    />
  </VLayout>
</template>

<style scoped lang="scss">
.app-layout {
  display: grid;
  grid-template-rows: auto 1fr;
  inline-size: 100%;
  block-size: 100%;
  overflow-x: hidden;
}
.cards-wrapper {
  block-size: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-inline: 0.25rem;
}
</style>
