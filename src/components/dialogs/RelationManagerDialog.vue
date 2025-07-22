<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(["update:isDialogVisible"])

const dialogVisibleUpdate = val => {
  emit("update:isDialogVisible", val)
}

import { computed, ref, watch } from "vue"

const items = [
  {
    text: "Nature",
    icon: "mdi-nature",
  },
  {
    text: "Nightlife",
    icon: "mdi-glass-wine",
  },
  {
    text: "November",
    icon: "mdi-calendar-range",
  },
  {
    text: "Portland",
    icon: "mdi-map-marker",
  },
  {
    text: "Biking",
    icon: "mdi-bike",
  },
]

const searchField = ref()

const loading = ref(false)
const search = ref("")
const selected = ref([])

const allSelected = computed(() => {
  return selected.value.length === items.length
})

const categories = computed(() => {
  const _search = search.value.toLowerCase()
  if (!_search) return items

  return items.filter(item => {
    const text = item.text.toLowerCase()

    return text.indexOf(_search) > -1
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
  search.value = ""
})

function next() {
  loading.value = true
  setTimeout(() => {
    search.value = ""
    selected.value = []
    loading.value = false
  }, 2000)
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
      <VToolbar
        color="transparent"
        flat
      >
        <VToolbarTitle>Photo Info</VToolbarTitle>

        <VBtn
          icon="mdi-magnify"
          @click="searchField.focus()"
        />
      </VToolbar>

      <VContainer>
        <VRow
          align="center"
          justify="start"
        >
          <VCol
            v-for="(selection, i) in selections"
            :key="selection.text"
            class="py-1 pe-0"
            cols="auto"
          >
            <VChip
              :disabled="loading"
              closable
              @click:close="selected.splice(i, 1)"
            >
              <VIcon
                :icon="selection.icon"
                start
              />

              {{ selection.text }}
            </VChip>
          </VCol>

          <VCol
            v-if="!allSelected"
            cols="12"
          >
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

      <VList>
        <template v-for="item in categories">
          <VListItem
            v-if="!selected.includes(item)"
            :key="item.text"
            :disabled="loading"
            @click="selected.push(item)"
          >
            <template #prepend>
              <VIcon
                :disabled="loading"
                :icon="item.icon"
              />
            </template>

            <VListItemTitle v-text="item.text" />
          </VListItem>
        </template>
      </VList>

      <VDivider />

      <VCardActions>
        <VSpacer />

        <VBtn
          :disabled="!selected.length"
          :loading="loading"
          color="purple"
          variant="text"
          @click="next"
        >
          Next
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
