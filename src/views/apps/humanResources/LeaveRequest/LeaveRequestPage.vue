<script setup>
import BereavementLeaveRequest from '@/views/apps/humanResources/LeaveRequest/BereavementLeave/BereavementLeaveRequest.vue'
import DailyLeave from '@/views/apps/humanResources/LeaveRequest/DailyLeave/DailyLeave.vue'
import HourlyLeave from '@/views/apps/humanResources/LeaveRequest/HourlyLeave/HourlyLeave.vue'
import MarriageLeaveRequest from '@/views/apps/humanResources/MarriageLeaveRequest/MarriageLeaveRequest.vue'

const emit = defineEmits(['back'])
const current = ref('root')

const leaveTypes = [
  { key: 'daily', label: 'روزانه', icon: 'tabler-calendar' },
  { key: 'hourly', label: 'ساعتی', icon: 'tabler-clock-hour-4' },
  { key: 'marriage', label: 'ازدواج', icon: 'tabler-hearts' },
  { key: 'funeral', label: 'فوت بستگان', icon: 'tabler-mood-sad' },
]

const pages = {
  daily: DailyLeave,
  hourly: HourlyLeave,
  marriage: MarriageLeaveRequest,
  funeral: BereavementLeaveRequest,
}

const currentComponent = computed(() => pages[current.value] || null)

function goBack() {
  if (current.value !== 'root') {
    current.value = 'root'
  }
  else {
    emit('back')
  }
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
      {{ current === 'root' ? 'صفحه اصلی' : 'انواع مرخصی' }}
    </VBtn>

    <div v-if="current === 'root'">
      <VRow>
        <VCol
          v-for="item in leaveTypes"
          :key="item.key"
          cols="6"
          class="text-center"
        >
          <VCard
            class="pa-4 d-flex flex-column align-center justify-center"
            variant="outlined"
            rounded="xl"
          >
            <!--            @click="current = item.key" -->

            <VAvatar
              :color="item.key === 'daily' ? 'primary' : 'secondary'"
              variant="tonal"
              size="56"
              class="mb-2"
            >
              <VIcon :icon="item.icon" size="32" />
            </VAvatar>
            <span>{{ item.label }}</span>
            <span
              v-if="item.key === 'daily'"
              class="font-weight-medium"
              style="color: red"
            >(به زودی)</span>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <component :is="currentComponent" v-else />
  </div>
</template>
