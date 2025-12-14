<script setup>
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
})

const emit = defineEmits(['add', 'update:isDialogVisible'])

const orgUnits = ref(props.orgUnits)

const selectedOrgPosition = ref(null)
const selectedOrgUnit = ref(null)

function onOrgUnitComboboxUpdate(selectedItem) {
  if (typeof selectedItem !== 'string') return

  if (!selectedItem.trim()) {
    selectedOrgUnit.value = null
    return
  }

  const existing = orgUnits.value.find(
    unit =>
      unit.name.replace(/[\s\u200C]+/g, '')
      === selectedItem.replace(/[\s\u200C]+/g, ''),
  )
  if (existing) {
    selectedOrgUnit.value = existing
  }
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

  emit('add')
  emit('update:isDialogVisible', false)
}

function onFormReset() {
  emit('update:isDialogVisible', false)
}

function dialogModelValueUpdate(val) {
  emit('update:isDialogVisible', val)
}
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

            <!-- 👉 Submit and Cancel -->
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
</template>
