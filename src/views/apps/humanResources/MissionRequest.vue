<script setup>
import MissionInnerRequest from '@/views/apps/humanResources/MissionInnerRequest.vue'
import MissionOuterRequest from '@/views/apps/humanResources/MissionOuterRequest.vue'

const emit = defineEmits(['back'])
const current = ref('root')

const missionTypes = [
  { key: 'inner', label: 'درون‌شهری', icon: 'tabler-building' },
  { key: 'outer', label: 'برون‌شهری', icon: 'tabler-plane' },
]

const pages = {
  inner: MissionInnerRequest,
  outer: MissionOuterRequest,
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
      v-if="current === 'root'"
      variant="text"
      prepend-icon="tabler-arrow-right"
      class="mb-4"
      @click="goBack"
    >
      صفحه اصلی
    </VBtn>

    <!-- لیست یا فرم -->
    <div v-if="current === 'root'">
      <VRow>
        <VCol v-for="item in missionTypes" :key="item.key" cols="6" class="text-center">
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

    <component v-else :is="currentComponent" @back="current = 'root'" />
  </div>
</template>
