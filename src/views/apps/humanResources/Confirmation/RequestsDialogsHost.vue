<script setup>
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'
import RejectDialog from '@/components/dialogs/RejectDialog.vue'
import ReferralToSupervisorDialog from '@/views/apps/humanResources/Components/ReferralToSupervisorDialog.vue'
import DetailsDialog from '@/views/apps/humanResources/Confirmation/DetailsDialog.vue'
import EditForm from '@/views/apps/humanResources/LeaveRequest/DailyLeave/EditForm.vue'

defineProps({
  loading: { type: Boolean, default: false },
  approveConfirmTitle: { type: String, required: true },
  detailsItem: { type: Object, default: null },
  pendingRequest: { type: Object, default: null },
})

const emit = defineEmits([
  'confirmApprove',
  'confirmReject',
  'submittedEdit',
  'submittedReferral',
])
const showReject = defineModel('showReject', { type: Boolean, default: false })
const showApproveConfirm = defineModel('showApproveConfirm', {
  type: Boolean,
  default: false,
})
const showEdit = defineModel('showEdit', { type: Boolean, default: false })
const showDetails = defineModel('showDetails', {
  type: Boolean,
  default: false,
})
const showReferral = defineModel('showReferral', {
  type: Boolean,
  default: false,
})
const rejectReason = defineModel('rejectReason', { type: String, default: '' })

</script>

<template>
  <RejectDialog
    v-model:show="showReject"
    v-model:reason="rejectReason"
    max-width="520"
    @confirm="emit('confirmReject')"
    @cancel="showReject = false"
  />

  <DetailsDialog
    v-model:show="showDetails"
    :details="detailsItem"
    @close="showDetails = false"
  />

  <ReferralToSupervisorDialog
    v-if="showReferral"
    v-model:is-dialog-visible="showReferral"
    :request="pendingRequest"
    @submit="emit('submittedReferral')"
  />

  <EditForm
    v-if="showEdit"
    v-model:is-dialog-visible="showEdit"
    :request="pendingRequest"
    @submit="emit('submittedEdit')"
  />

  <AreYouSureDialog
    v-if="showApproveConfirm"
    v-model:is-dialog-visible="showApproveConfirm"
    :title="approveConfirmTitle"
    :loading="loading"
    @confirm="emit('confirmApprove')"
  />
</template>
