<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },

  isFetchItemsPending: {
    type: Boolean,
    required: true,
  },

  items: {
    type: Array,
    required: true,
  },

  selected: {
    type: Array,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  loading: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible', 'change'])

function dialogVisibleUpdate(val) {
  emit('update:isDialogVisible', val)
}

const items = props.items

const searchField = ref()

const search = ref('')

const selected = ref(
  items.filter((item) => {
    return props.selected.some(selectedItem => selectedItem.id === item.id)
  }),
)

const allSelected = computed(() => {
  return selected.value.length === items.length
})

const categories = computed(() => {
  const _search = search.value.toLowerCase()
  if (!_search) return items

  return items.filter((item) => {
    const text = item.name.toLowerCase()

    return text.includes(_search)
  })
})

const selections = computed(() => {
  const selections = []
  for (const selection of selected.value) {
    selections.push(selection)
  }

  return selections
})

watch(selected, () => {
  search.value = ''
})

function save() {
  emit('change', selected.value)
}
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    :width="$vuetify.display.smAndDown ? 'auto' : 800"
    @update:model-value="dialogVisibleUpdate"
  >
    <!-- 👉 Dialog close btn -->
    <DialogCloseBtn @click="$emit('update:isDialogVisible', false)" />

    <VCard>
      <VToolbar color="transparent" flat>
        <VToolbarTitle>{{ title }}</VToolbarTitle>
      </VToolbar>

      <VContainer>
        <VRow align="center" justify="start">
          <VCol
            v-for="(selection, i) in selections"
            :key="selection.id"
            class="py-1 pe-0"
            cols="auto"
          >
            <VChip
              :disabled="loading"
              closable
              @click:close="selected.splice(i, 1)"
            >
              <VIcon v-if="selection.icon" :icon="selection.icon" start />

              {{ selection.name }}
            </VChip>
          </VCol>

          <VCol v-if="!allSelected" cols="12">
            <VTextField
              ref="searchField"
              v-model="search"
              label="Search"
              hide-details
              single-line
            />
          </VCol>
        </VRow>
      </VContainer>

      <VDivider v-if="!allSelected" />

      <template v-if="isFetchItemsPending">
        <VSkeletonLoader v-for="i in 3" :key="i" type="list-item" />
      </template>

      <VList>
        <template v-for="item in categories">
          <VListItem
            v-if="!selected.includes(item)"
            :key="item.id"
            :disabled="loading"
            @click="selected.push(item)"
          >
            <template #prepend>
              <VIcon v-if="item.icon" :disabled="loading" :icon="item.icon" />
            </template>

            <VListItemTitle v-text="item.name" />
          </VListItem>
        </template>
      </VList>

      <VDivider />

      <VCardActions>
        <VSpacer />

        <VBtn :loading="loading" color="purple" variant="text" @click="save">
          ذخیره
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
