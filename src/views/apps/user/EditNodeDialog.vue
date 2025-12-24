<script setup>
import Fuse from 'fuse.js'
import { watch } from 'vue'
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
})

const emit = defineEmits(['edit', 'update:isDialogVisible'])

const storageBaseUrl = import.meta.env.VITE_STORAGE_BASE_URL

// ----- states -----
const uiState = reactive({
  isSelectUserDialogOpen: false,
})

const orgUnits = ref(props.orgUnits)

const selectedOrgPosition = ref(null)
const selectedOrgUnit = ref(null)
const selectedUsers = ref([])

const userSearchQuery = ref('')

// ----- -----

const fuse = computed(() => {
  const usersWithSearchFields = props.users.map(user => ({
    ...user,
    full_name: normalizeForFuse([user.first_name, user.last_name]),
    work_area_cost_center: normalizeForFuse([
      user.profile?.work_area?.name,
      user.profile?.cost_center?.name,
    ]),
    last_name_work_area_cost_center: normalizeForFuse([
      user.last_name,
      user.profile?.work_area?.name,
      user.profile?.cost_center?.name,
    ]),
  }))

  return new Fuse(usersWithSearchFields, {
    keys: [
      { name: 'personnel_code', weight: 2.0 },
      { name: 'full_name', weight: 1.5 },
      { name: 'work_area_cost_center', weight: 1.5 },
      { name: 'last_name_work_area_cost_center', weight: 1.5 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    useExtendedSearch: true,
    includeScore: true,
    findAllMatches: true,
    minMatchCharLength: 1,
  })
})

const filteredUsers = computed(() => {
  const query = userSearchQuery.value?.trim()
  if (!query) return props.users

  const results = fuse.value.search(query)

  return results.map(r => r.item)
})

function normalizeForFuse(parts) {
  return parts
    .filter(Boolean)
    .join(' ')
    .replace(/[\s\u200C]+/g, '')
}

function toComparisonKey(str) {
  return (str || '').toString().replace(/[\s\u200C]+/g, '')
}

function guardBackspace(e) {
  if (e.key === 'Backspace' && !userSearchQuery.value) {
    e.stopPropagation()
  }
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
  if (typeof selectedOrgUnit.value === 'string') {
    const name = selectedOrgUnit.value.trim()

    selectedOrgUnit.value = {
      id: crypto.randomUUID(),
      name,
    }

    orgUnits.value.push(selectedOrgUnit.value)
  }

  emit('edit', {
    orgPosition: selectedOrgPosition.value,
    orgUnit: selectedOrgUnit.value,
    users: selectedUsers.value,
  })
  emit('update:isDialogVisible', false)
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
      selectedUsers.value = props.node.users
      userSearchQuery.value = ''
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
          افزودن گره جدید
        </h6>
        <!-- 👉 Form -->
        <VForm @submit.prevent="onFormSubmit">
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
                @keydown.capture="guardBackspace"
              >
                <template #selection />

                <template #item="{ props, item }">
                  <VListItem
                    v-bind="props"
                    :prepend-avatar="`${storageBaseUrl}/${item?.raw?.avatar?.path}`"
                    :title="`${item?.raw?.first_name} ${item?.raw?.last_name} (${item?.raw?.personnel_code})`"
                    :subtitle="`${item?.raw?.profile?.work_area?.name || ''} ${
                      item?.raw?.profile?.work_area?.name ? '&larr;' : ''
                    } ${item?.raw?.profile?.cost_center?.name || ''}`"
                  />
                </template>

                <template #append>
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
              <v-chip
                v-for="selectedUser in selectedUsers"
                v-bind="props"
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
              </v-chip>
            </VCol>
          </VRow>

          <!-- 👉 Submit and Cancel -->
          <VRow>
            <VCol cols="12" class="d-flex justify-center gap-4">
              <VBtn type="submit">
                افزودن
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
</template>
