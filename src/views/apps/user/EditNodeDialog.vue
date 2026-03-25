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

  requestTypes: {
    type: Array,
    default: () => [],
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
const selectedLiaison = ref(null)

// Deputies: array of { user, deputyTypes }
const deputies = ref([])
const pendingDeputyUser = ref(null)
const pendingDeputyTypes = ref([])

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

// Filter out already-added deputies from the deputy autocomplete
const availableDeputyUsers = computed(() => {
  const addedIds = new Set(deputies.value.map(d => d.user.id))

  return filteredDeputyUsers.value.filter(u => !addedIds.has(u.id))
})

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

// Deputy management
function addDeputy() {
  if (!pendingDeputyUser.value) return

  deputies.value.push({
    user: { ...pendingDeputyUser.value },
    deputyTypes: [...pendingDeputyTypes.value],
  })

  pendingDeputyUser.value = null
  pendingDeputyTypes.value = []
  resetDeputySearch()
}

function removeDeputy(index) {
  deputies.value.splice(index, 1)
}

function getDeputyTypeNames(typeIds) {
  return typeIds
    .map(id => props.requestTypes.find(rt => rt.id === id)?.name)
    .filter(Boolean)
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
    deputies: deputies.value.map(d => ({
      ...d.user,
      deputyTypes: d.deputyTypes,
    })),
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
      selectedLiaison.value = props.node.liaison || null

      // Map deputies from node data
      deputies.value = (props.node.deputies || []).map(d => ({
        user: { ...d },
        deputyTypes: [...(d.deputyTypes || [])],
      }))

      pendingDeputyUser.value = null
      pendingDeputyTypes.value = []
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
                {{ selectedUser.first_name }} {{ selectedUser.last_name }} ({{ selectedUser.personnel_code }})
              </VChip>
            </VCol>
          </VRow>

          <VDivider class="my-6" />

          <!-- 👉 Deputies Section -->
          <VRow>
            <VCol cols="12">
              <div class="text-subtitle-1 font-weight-medium">
                جانشین‌ها
              </div>
            </VCol>
          </VRow>

          <!-- Deputy input row -->
          <VRow align="end">
            <VCol cols="12" md="5">
              <VAutocomplete
                v-model="pendingDeputyUser"
                v-model:search="deputySearchQuery"
                :items="availableDeputyUsers"
                :item-title="
                  (item) =>
                    `${item.first_name} ${item.last_name} (${item.personnel_code})`
                "
                clearable
                item-value="id"
                label="انتخاب جانشین"
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
            <VCol cols="12" md="5">
              <VAutocomplete
                v-model="pendingDeputyTypes"
                :items="props.requestTypes"
                item-title="name"
                item-value="id"
                label="نوع جانشینی"
                multiple
                chips
                closable-chips
                :disabled="!pendingDeputyUser"
              />
            </VCol>
            <VCol cols="12" md="2">
              <VBtn
                color="success"
                variant="tonal"
                block
                :disabled="!pendingDeputyUser"
                @click="addDeputy"
              >
                <VIcon icon="tabler-plus" class="me-1" />
                افزودن
              </VBtn>
            </VCol>
          </VRow>

          <!-- Added deputies list -->
          <VRow v-if="deputies.length">
            <VCol cols="12">
              <div class="d-flex flex-column gap-3 mt-1">
                <VCard
                  v-for="(deputy, index) in deputies"
                  :key="deputy.user.id"
                  variant="outlined"
                  class="pa-3"
                >
                  <div class="d-flex align-center gap-3">
                    <VAvatar
                      size="42"
                      :image="`${storageBaseUrl}/${deputy.user.avatar?.path}`"
                    />

                    <div class="flex-grow-1">
                      <div class="text-body-1 font-weight-medium">
                        {{ deputy.user.first_name }} {{ deputy.user.last_name }}
                        <span class="text-medium-emphasis text-body-2">({{ deputy.user.personnel_code }})</span>
                      </div>
                      <div v-if="deputy.deputyTypes.length" class="d-flex flex-wrap gap-1 mt-1">
                        <VChip
                          v-for="typeName in getDeputyTypeNames(deputy.deputyTypes)"
                          :key="typeName"
                          size="small"
                          color="info"
                          variant="tonal"
                        >
                          {{ typeName }}
                        </VChip>
                      </div>
                      <span v-else class="text-caption text-disabled">بدون نوع جانشینی</span>
                    </div>

                    <VBtn
                      icon
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeDeputy(index)"
                    >
                      <VIcon icon="tabler-trash" size="20" />
                    </VBtn>
                  </div>
                </VCard>
              </div>
            </VCol>
          </VRow>

          <VDivider class="my-8" />

          <!-- 👉 Liaison -->
          <VRow>
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
