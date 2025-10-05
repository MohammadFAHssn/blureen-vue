<script setup>
import { ref, computed } from 'vue'

import MissionOuterBandarRequest from '@/views/apps/humanResources/MissionOuterBandarRequest.vue'
import MissionOuterOtherRequest from '@/views/apps/humanResources/MissionOuterOtherRequest.vue'
import MissionOuterTehranRequest from '@/views/apps/humanResources/MissionOuterTehranRequest.vue'

const emit = defineEmits(['back'])
const current = ref('root')

const outerCities = [
  { key: 'tehran', label: 'تهران', icon: 'tabler-building-skyscraper' },
  { key: 'bandar', label: 'بندرعباس', icon: 'tabler-building-warehouse' },
  { key: 'other', label: 'سایر', icon: 'tabler-map' },
]

const pages = {
  tehran: MissionOuterTehranRequest,
  bandar: MissionOuterBandarRequest,
  other: MissionOuterOtherRequest,
}

const currentComponent = computed(() => pages[current.value] || null)

function goBack() {
  if (current.value !== 'root') current.value = 'root'
  else emit('back')
}
</script>

<template>
  <div>
    <VBtn
      variant="text"
      prepend-icon="tabler-arrow-right"
      class="mb-4"
      @click="goBack"
    >
      {{ current === 'root' ? 'انواع مأموریت' : 'شهرها' }}
    </VBtn>

    <!-- لیست شهرها -->
    <div v-if="current === 'root'">
      <VRow>
        <VCol v-for="item in outerCities" :key="item.key" cols="6" sm="4" class="text-center">
          <VCard
            class="pa-4 d-flex flex-column align-center justify-center"
            variant="outlined"
            rounded="xl"
            @click="current = item.key"
          >
            <VAvatar variant="tonal" color="primary" size="56" class="mb-2">
              <VIcon :icon="item.icon" size="32" />
            </VAvatar>
            <span>{{ item.label }}</span>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <component v-else :is="currentComponent" />
  </div>
</template>
