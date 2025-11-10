<script setup>
import AssignUserToPositionDialog from './AssignUserToPositionDialog.vue'

const props = defineProps({
  costCenter: {
    type: Object,
    required: true,
  },

  orgPositions: {
    type: Array,
    required: true,
  },

  loading: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['save', 'cancel'])

const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isAssignUserToPositionDialogVisible: false,
})

const costCenter = ref(props.costCenter)
const selectedPosition = ref(null)
const dragOverPositionId = ref(null)

function positionAssignments(costCenter, position) {
  return costCenter.orgPositions.filter(
    orgPosition => orgPosition.id === position.id,
  )
}

function onAddUserBtnClick(position) {
  selectedPosition.value = position
  uiState.isAssignUserToPositionDialogVisible = true
}

function handleAddUser(addedUser) {
  const orgPositions = costCenter.value.orgPositions

  if (
    orgPositions.some(orgPosition => orgPosition.user.id === addedUser.id)
  ) {
    uiState.hasError = true
    uiState.errorMessage
      = 'کاربر انتخاب شده، در این مرکز هزینه دارای سمت می‌باشد'
    return
  }

  orgPositions.push({ ...selectedPosition.value, user: addedUser })

  costCenter.value.orgPositions = orgPositions
}

function onDragOver(event) {
  event.preventDefault()
}

function onDragEnter(event, position) {
  dragOverPositionId.value = position.id
}

function onDragLeave(event, position) {
  const to = event.relatedTarget
  if (to && event.currentTarget.contains(to)) return

  if (dragOverPositionId.value === position.id)
    dragOverPositionId.value = null
}

function onDrop(event, position) {
  const jsonData = event.dataTransfer.getData('application/json')
  const data = JSON.parse(jsonData)

  const draggedUser = {
    id: data.id,
    personnelCode: data.personnelCode,
    firstName: data.firstName,
    lastName: data.lastName,
  }

  selectedPosition.value = position

  handleAddUser(draggedUser)

  dragOverPositionId.value = null
}

watch(
  () => props.costCenter,
  (newVal) => {
    costCenter.value = newVal
  },
  { deep: false },
)
</script>

<template>
  <VSnackbar
    v-model="uiState.hasError"
    :timeout="2000"
    location="center"
    variant="flat"
    color="error"
  >
    {{ uiState.errorMessage }}
  </VSnackbar>

  <VCard class="mb-3">
    <VCardTitle>
      <span class="ml-3"> سمت‌های </span>
      <v-chip color="info" class="ml-3 mb-3">
        {{ costCenter.name }}
      </v-chip>
    </VCardTitle>

    <v-divider />

    <VCardText class="pa-5" style="max-block-size: 25vh; overflow-y: auto;">
      <VRow>
        <VCol
          v-for="position in props.orgPositions"
          :key="position.id"
          cols="12"
          sm="6"
          md="4"
          lg="4"
          xl="2"
          xxl="2"
        >
          <VCard
            :class="{ 'drag-over': dragOverPositionId === position.id }"
            @dragover="onDragOver"
            @dragenter.prevent="onDragEnter($event, position)"
            @dragleave.prevent="onDragLeave($event, position)"
            @drop.prevent="onDrop($event, position)"
          >
            <VCardTitle>
              <v-chip color="primary">
                {{ position.name }}
              </v-chip>
            </VCardTitle>

            <VCardText>
              <v-chip
                v-for="positionAssignment in positionAssignments(
                  costCenter,
                  position,
                )"
                :key="positionAssignment.id"
                variant="outlined"
                color="primary"
                class="ma-1"
              >
                {{ positionAssignment.user.firstName }}
                {{ positionAssignment.user.lastName }} ({{
                  positionAssignment.user.personnelCode
                }})
              </v-chip>
            </VCardText>
            <VCardActions>
              <VBtn block @click="onAddUserBtnClick(position)">
                <VIcon size="24" icon="tabler-plus" />
              </VBtn>
            </VCardActions>
          </VCard>
        </VCol>
      </VRow>
    </VCardText>

    <v-divider />

    <VCardActions class="px-4 py-2">
      <VBtn
        color="success"
        :loading="loading"
        @click="emit('save')"
      >
        ذخیره
      </VBtn>
      <VBtn
        color="error"
        :disabled="loading"
        @click="emit('cancel')"
      >
        انصراف
      </VBtn>
    </VCardActions>
  </VCard>

  <AssignUserToPositionDialog
    v-model:is-dialog-visible="uiState.isAssignUserToPositionDialogVisible"
    @add-user="handleAddUser"
  />
</template>

<style>
.v-card-title {
  white-space: normal;
}

/* Drag-over visual effect for position cards */
.drag-over {
  border: 2px dashed rgb(var(--v-theme-primary));
  background-color: rgb(var(--v-theme-primary) / 8%);
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
  transform: translateY(-2px);
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease,
    border-color 0.15s ease;
}
</style>
