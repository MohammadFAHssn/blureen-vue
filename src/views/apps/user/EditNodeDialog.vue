<script setup>
import { watch } from 'vue'
import { useUserSearch } from '@/composables/useUserSearch'
import SelectUserDialog from './SelectUserDialog.vue'

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },

  orgPositions: {
    type: Array,
    required: true,
  },

  orgUnits: {
    type: Array,
    required: true,
  },

  users: {
    type: Array,
    required: true,
  },

  node: {
    type: Object,
    required: false,
  },

  reloading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'update:isDialogVisible'])

const storageBaseUrl = import.meta.env.VITE_STORAGE_BASE_URL

// ----- states -----
const refVForm = ref()

const uiState = reactive({
  hasError: false,
  isSelectUserDialogOpen: false,
})

const pendingState = reactive({
  editOrgChartNode: false,
})

const orgUnits = ref(props.orgUnits)

const selectedOrgPosition = ref(null)
const selectedOrgUnit = ref(null)
const selectedUsers = ref([])
const selectedDeputy = ref(null)
const selectedLiaison = ref(null)

// Use composable for user search
const usersRef = computed(() => props.users)
const {
  searchQuery: userSearchQuery,
  filteredUsers,
  guardBackspace,
  resetSearch,
} = useUserSearch(usersRef)

const {
  searchQuery: deputySearchQuery,
  filteredUsers: filteredDeputyUsers,
  guardBackspace: guardDeputyBackspace,
  resetSearch: resetDeputySearch,
} = useUserSearch(usersRef)

const {
  searchQuery: liaisonSearchQuery,
  filteredUsers: filteredLiaisonUsers,
  guardBackspace: guardLiaisonBackspace,
  resetSearch: resetLiaisonSearch,
} = useUserSearch(usersRef)

function toComparisonKey(str) {
  return (str || '').toString().replace(/[\s\u200C]+/g, '')
}

function onOrgUnitComboboxUpdate(selectedItem) {
  if (typeof selectedItem !== 'string') return

  if (!selectedItem.trim()) {
    selectedOrgUnit.value = null
    return
  }

  const existing = orgUnits.value.find(
    unit => toComparisonKey(unit.name) === toComparisonKey(selectedItem),
  )
  if (existing) {
    selectedOrgUnit.value = existing
  }
}

function removeUser(userId) {
  selectedUsers.value = selectedUsers.value.filter(user => user.id !== userId)
}

function onSelectUserFromDialog(userIds) {
  selectedUsers.value = props.users.filter(user =>
    userIds.includes(user.id),
  )
}

function onFormSubmit() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      if (typeof selectedOrgUnit.value === 'string') {
        const name = selectedOrgUnit.value.trim()

        selectedOrgUnit.value = {
          id: `${Date.now()}-${Math.random()}`,
          name,
        }

        orgUnits.value.push(selectedOrgUnit.value)
      }

      update()
    }
  })
}

async function update() {
  const orgChartNode = {
    id: props.node.id,
    orgPosition: selectedOrgPosition.value,
    orgUnit: selectedOrgUnit.value,
    users: selectedUsers.value,
    deputy: selectedDeputy.value,
    liaison: selectedLiaison.value,
    parentId: props.node.parentId,
  }

  pendingState.editOrgChartNode = true

  await axiosInstance
    .put('/base/org-chart-node/update', {
      orgChartNode,
    })
    .then(() => {
      emit('edit', orgChartNode)
    })
    .catch((error) => {
      console.error('Error editing organization chart node:', error)
      uiState.hasError = true
      uiState.errorMessage
        = error.response?.data?.message || 'خطا در ویرایش گره چارت سازمانی'
    })
    .finally(() => {
      pendingState.editOrgChartNode = false
    })
}

function onFormReset() {
  emit('update:isDialogVisible', false)
}

function dialogModelValueUpdate(val) {
  emit('update:isDialogVisible', val)
}

watch(
  () => props.isDialogVisible,
  (newVal) => {
    if (newVal) {
      // Reset form states
      selectedOrgPosition.value = props.node.orgPosition
      selectedOrgUnit.value = props.node.orgUnit
      selectedUsers.value = [...(props.node.users || [])]
      selectedDeputy.value = props.node.deputy || null
      selectedLiaison.value = props.node.liaison || null
      resetSearch()
      resetDeputySearch()
      resetLiaisonSearch()
    }
  },
)
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-1">
      <VCardText>
        <!-- 👉 Title -->
        <h6 class="text-h6 text-center mb-6">
          ویرایش گره
        </h6>
        <!-- 👉 Form -->
        <VForm ref="refVForm" validate-on="submit lazy" @submit.prevent="onFormSubmit">
          <VRow>
            <!-- 👉 Org Position -->
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="selectedOrgPosition"
                label="سمت"
                :items="props.orgPositions"
                item-title="name"
                item-value="id"
                return-object
                :rules="[requiredValidator]"
              />
            </VCol>
            <!-- 👉 Org unit -->
            <VCol cols="12" md="6">
              <VCombobox
                v-model="selectedOrgUnit"
                label="واحد"
                :items="orgUnits"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
                @update:model-value="onOrgUnitComboboxUpdate"
              />
            </VCol>
            <VCol cols="12">
              <VAutocomplete
                v-model="selectedUsers"
                v-model:search="userSearchQuery"
                multiple
                :items="filteredUsers"
                :item-title="
                  (item) =>
                    `${item.first_name} ${item.last_name} (${item.personnel_code})`
                "
                clearable
                item-value="id"
                label="کاربران"
                :no-filter="true"
                return-object
                :rules="[requiredValidator]"
                @keydown.capture="guardBackspace"
              >
                <template #selection />

                <template #item="{ props: itemProps, item }">
                  <VListItem
                    v-bind="itemProps"
                    :prepend-avatar="`${storageBaseUrl}/${item?.raw?.avatar?.path}`"
                    :title="`${item?.raw?.first_name} ${item?.raw?.last_name} (${item?.raw?.personnel_code})`"
                    :subtitle="`${item?.raw?.profile?.work_area?.name || ''} ${
                      item?.raw?.profile?.work_area?.name ? '&larr;' : ''
                    } ${item?.raw?.profile?.cost_center?.name || ''}`"
                  />
                </template>

                <template #append>
                  <VChip
                    variant="outlined"
                    color="secondary"
                    class="ml-3"
                  >
                    {{ selectedUsers.length }}
                  </VChip>

                  <VBtn
                    variant="outlined"
                    color="secondary"
                    class="border"
                    @click="uiState.isSelectUserDialogOpen = true"
                  >
                    <VIcon icon="tabler-users" size="25" />
                  </VBtn>
                </template>
              </VAutocomplete>
            </VCol>
          </VRow>

          <VRow>
            <VCol cols="12" style="max-block-size: 50em;" class="overflow-auto">
              <VChip
                v-for="selectedUser in selectedUsers"
                :key="selectedUser.id"
                link
                pill
                closable
                variant="outlined"
                size="x-large"
                class="ml-3 mb-3"
                @click:close="removeUser(selectedUser.id)"
              >
                <VAvatar
                  start
                  size="40"
                  :image="`${storageBaseUrl}/${selectedUser.avatar?.path}`"
                />
                {{ selectedUser.first_name }} {{ selectedUser.last_name }}
              </VChip>
            </VCol>
          </VRow>

          <!-- 👉 Deputy -->
          <VRow>
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="selectedDeputy"
                v-model:search="deputySearchQuery"
                :items="filteredDeputyUsers"
                :item-title="
                  (item) =>
                    `${item.first_name} ${item.last_name} (${item.personnel_code})`
                "
                clearable
                item-value="id"
                label="جانشین"
                :no-filter="true"
                return-object
                @keydown.capture="guardDeputyBackspace"
              >
                <template #item="{ props: itemProps, item }">
                  <VListItem
                    v-bind="itemProps"
                    :prepend-avatar="`${storageBaseUrl}/${item?.raw?.avatar?.path}`"
                    :title="`${item?.raw?.first_name} ${item?.raw?.last_name} (${item?.raw?.personnel_code})`"
                    :subtitle="`${item?.raw?.profile?.work_area?.name || ''} ${
                      item?.raw?.profile?.work_area?.name ? '&larr;' : ''
                    } ${item?.raw?.profile?.cost_center?.name || ''}`"
                  />
                </template>
              </VAutocomplete>
            </VCol>

            <!-- 👉 Liaison -->
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="selectedLiaison"
                v-model:search="liaisonSearchQuery"
                :items="filteredLiaisonUsers"
                :item-title="
                  (item) =>
                    `${item.first_name} ${item.last_name} (${item.personnel_code})`
                "
                clearable
                item-value="id"
                label="رابط"
                :no-filter="true"
                return-object
                :rules="[requiredValidator]"
                @keydown.capture="guardLiaisonBackspace"
              >
                <template #item="{ props: itemProps, item }">
                  <VListItem
                    v-bind="itemProps"
                    :prepend-avatar="`${storageBaseUrl}/${item?.raw?.avatar?.path}`"
                    :title="`${item?.raw?.first_name} ${item?.raw?.last_name} (${item?.raw?.personnel_code})`"
                    :subtitle="`${item?.raw?.profile?.work_area?.name || ''} ${
                      item?.raw?.profile?.work_area?.name ? '&larr;' : ''
                    } ${item?.raw?.profile?.cost_center?.name || ''}`"
                  />
                </template>
              </VAutocomplete>
            </VCol>
          </VRow>

          <!-- 👉 Submit and Cancel -->
          <VRow>
            <VCol cols="12" class="d-flex justify-center gap-4">
              <VBtn type="submit" :loading="pendingState.editOrgChartNode || props.reloading">
                ویرایش
              </VBtn>

              <VBtn color="secondary" variant="tonal" @click="onFormReset">
                بستن
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>

  <SelectUserDialog
    v-model:is-dialog-visible="uiState.isSelectUserDialogOpen"
    :users="props.users"
    :selected-users="selectedUsers"
    @select-user="onSelectUserFromDialog"
  />

  <!-- Error Snackbar -->
  <VSnackbar
    v-model="uiState.hasError"
    :timeout="3000"
    location="top"
    color="error"
  >
    {{ uiState.errorMessage }}
  </VSnackbar>
</template>
