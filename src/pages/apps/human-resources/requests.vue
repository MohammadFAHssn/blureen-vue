<script setup>
import AttendanceRequest from '@/views/apps/humanResources/AttendanceRequest/AttendanceRequest.vue'
import LeaveRequestPage from '@/views/apps/humanResources/LeaveRequestPage.vue'
import MissionRequest from '@/views/apps/humanResources/MissionRequest.vue'
import OvertimeRequest from '@/views/apps/humanResources/OvertimeRequest.vue'
import SickRequest from '@/views/apps/humanResources/SickRequest.vue'

const current = ref('root')

const requests = [
  { key: 'leave', label: 'مرخصی', icon: 'tabler-calendar-event' },
  { key: 'overtime', label: 'اضافه‌کار', icon: 'tabler-clock-plus' },
  { key: 'mission', label: 'ماموریت', icon: 'tabler-briefcase' },
  { key: 'sick', label: 'استعلاجی', icon: 'tabler-stethoscope' },
  { key: 'attendance', label: 'ثبت تردد', icon: 'tabler-fingerprint' },
]

const pages = {
  leave: LeaveRequestPage,
  mission: MissionRequest,
  overtime: OvertimeRequest,
  sick: SickRequest,
  attendance: AttendanceRequest,
}

function goBack() {
  current.value = 'root'
}

function open(key) {
  current.value = key
}
</script>

<template>
  <VContainer>
    <div v-if="current === 'root'">
      <VRow>
        <VCol
          v-for="req in requests"
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

    <component :is="pages[current]" @back="goBack" />
  </VContainer>
</template>
