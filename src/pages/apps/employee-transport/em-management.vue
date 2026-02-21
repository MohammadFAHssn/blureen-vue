<script setup>
import EmCommuteService from '@/views/apps/employeeTransport/EmCommuteService.vue'
import EmCommuteStation from '@/views/apps/employeeTransport/EmCommuteStation.vue'
import EmFleetVehicle from '@/views/apps/employeeTransport/EmFleetVehicle.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'em-Management',
  },
})

const current = ref('root')

const componentsIcons = [
  { key: 'stations', label: 'ایستگاه‌ها', icon: 'tabler-bus-stop' },
  { key: 'vehicles', label: 'وسایل نقلیه', icon: 'tabler-bus' },
  { key: 'services', label: 'سرویس‌ها', icon: 'tabler-route' },
]

const visibleComponentsIcons = computed(() =>
  componentsIcons.filter(item => item.show?.() !== false),
)

const pages = {
  stations: EmCommuteStation,
  vehicles: EmFleetVehicle,
  services: EmCommuteService,
}

function goBack() {
  current.value = 'root'
}

function open(key) {
  current.value = key
}
</script>

<template>
  <div v-if="current === 'root'">
    <VRow class="ma-0 pa-0">
      <VCol
        v-for="req in visibleComponentsIcons"
        :key="req.key"
        cols="6"
        sm="4"
        md="3"
        class="text-center"
      >
        <VCard
          class="pa-4 d-flex flex-column align-center justify-center"
          variant="outlined"
          rounded="xl"
          @click="open(req.key)"
        >
          <VAvatar variant="tonal" color="primary" size="56" class="mb-2">
            <VIcon :icon="req.icon" size="32" />
          </VAvatar>
          <span class="font-weight-medium">{{ req.label }}</span>
        </VCard>
      </VCol>
    </VRow>
  </div>

  <component :is="pages[current]" v-if="pages[current]" @back="goBack" />
</template>
