<script setup>
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
      case HR_REQUEST_TYPES.DAILY_LEAVE:
        uiState.isEditDailyRequestDialogVisible = true
        break

      case HR_REQUEST_TYPES.HOURLY_LEAVE:
        uiState.isEditHourlyRequestDialogVisible = true
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
</template>
