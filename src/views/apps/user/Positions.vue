<script setup>
import AssignUserToPositionDialog from './AssignUserToPositionDialog.vue'

const props = defineProps({
  costCenters: {
    type: Array,
    required: true,
  },

  orgPositions: {
    type: Array,
    required: true,
  },

  mode: {
    type: String,
    required: true,
  },

  loading: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['save', 'cancel', 'edit'])

const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isAssignUserToPositionDialogVisible: false,
})

const costCenters = ref(props.costCenters)
const selectedPosition = ref(null)

function positionAssignments(costCenters, position) {
  if (costCenters.length > 1) {
    return []
  }

  return costCenters[0].orgPositions.filter(
    orgPosition => orgPosition.id === position.id,
  )
}

function onAddUserBtnClick(position) {
  selectedPosition.value = position
  uiState.isAssignUserToPositionDialogVisible = true
}

function handleAddUser(addedUser) {
  const orgPositions = costCenters.value[0].orgPositions

  if (orgPositions.some(orgPosition => orgPosition.user.id === addedUser.id)) {
    uiState.hasError = true
    uiState.errorMessage = 'کاربر انتخاب شده، در این مرکز هزینه دارای سمت می‌باشد'
    return
  }

  orgPositions.push(
    { ...selectedPosition.value, user: addedUser },
  )

  costCenters.value[0].orgPositions = orgPositions
}
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

  <VCard class="mb-3" :color="mode === 'edit' ? 'yellow-lighten-4' : ''">
    <VCardTitle>
      <span class="ml-3"> سمت‌های </span>
      <v-chip
        v-for="costCenter in costCenters"
        :key="costCenter.rayvarzId"
        color="info"
        class="ml-3 mb-3"
      >
        {{ costCenter.name }}
      </v-chip>
    </VCardTitle>

    <VCardText class="d-flex align-center pa-5">
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
          <VCard :color="mode === 'edit' ? 'yellow-lighten-4' : ''">
            <VCardTitle>
              <v-chip color="primary">
                {{ position.name }}
              </v-chip>
            </VCardTitle>

            <VCardText>
              <v-chip
                v-for="positionAssignment in positionAssignments(
                  costCenters,
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
              <VBtn
                block
                @click="onAddUserBtnClick(position)"
              >
                <VIcon size="24" icon="tabler-plus" />
              </VBtn>
            </VCardActions>
          </VCard>
        </VCol>
      </VRow>
    </VCardText>
    <VCardActions>
      <VBtn
        v-if="mode === 'edit'"
        color="success"
        :loading="loading"
        @click="emit('save')"
      >
        ذخیره
      </VBtn>
      <VBtn
        v-if="mode === 'edit'"
        color="error"
        :disabled="loading"
        @click="emit('cancel')"
      >
        بستن
      </VBtn>

      <VBtn v-if="mode === 'view'" color="warning" @click="emit('edit')">
        ویرایش
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
</style>
