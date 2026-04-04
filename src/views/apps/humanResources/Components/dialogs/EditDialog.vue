<script setup>
import EditBereavementLeave from '@/views/apps/humanResources/LeaveRequest/BereavementLeave/EditBereavementLeave.vue'
import EditDailyLeave from '@/views/apps/humanResources/LeaveRequest/DailyLeave/EditDailyLeave.vue'
import EditHourlyLeave from '@/views/apps/humanResources/LeaveRequest/HourlyLeave/EditHourlyLeave.vue'

const props = defineProps({
  isDialogVisible: { type: Boolean, required: true },
  request: { type: Object, required: true },
})

const emit = defineEmits(['submit', 'update:isDialogVisible'])

const uiState = reactive({
  isEditDailyRequestDialogVisible: false,
  isEditHourlyRequestDialogVisible: false,
  isEditBereavementRequestDialogVisible: false,
})

function onFormSubmit() {
  emit('submit')
  emit('update:isDialogVisible', false)
}

watch(
  () => props.request,
  (newRequest) => {
    uiState.isEditDailyRequestDialogVisible = false
    uiState.isEditHourlyRequestDialogVisible = false

    switch (newRequest.request_type_id) {
      case REQUEST_TYPES.DAILY_LEAVE:
        uiState.isEditDailyRequestDialogVisible = true
        break

      case REQUEST_TYPES.HOURLY_LEAVE:
        uiState.isEditHourlyRequestDialogVisible = true
        break
      case REQUEST_TYPES.BEREAVEMENT_LEAVE:
        uiState.isEditBereavementRequestDialogVisible = true
        break
    }
  },
  { immediate: true },
)
</script>

<template>
  <EditDailyLeave
    v-if="uiState.isEditDailyRequestDialogVisible"
    v-model:is-dialog-visible="uiState.isEditDailyRequestDialogVisible"
    :request="props.request"
    @submit="onFormSubmit"
  />
  <EditHourlyLeave
    v-if="uiState.isEditHourlyRequestDialogVisible"
    v-model:is-dialog-visible="uiState.isEditHourlyRequestDialogVisible"
    :request="props.request"
    @submit="onFormSubmit"
  />
  <EditBereavementLeave
    v-if="uiState.isEditBereavementRequestDialogVisible"
    v-model:is-dialog-visible="uiState.isEditBereavementRequestDialogVisible"
    :request="props.request"
    @submit="onFormSubmit"
  />
</template>
