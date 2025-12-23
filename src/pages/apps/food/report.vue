<script setup>
import Exceptions from '@/views/apps/food/rep/Exceptions.vue'
import Limitations from '@/views/apps/food/rep/Limitations.vue'
import Report from '@/views/apps/food/rep/Report.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'Food-Report',
  },
})

const current = ref('root')

const componentsIcons = [
  { key: 'exceptions', label: 'استثنائات', icon: 'tabler-user-check' },
  { key: 'limitations', label: 'محدودیت‌های زمانی', icon: 'tabler-clock-hour-4' },
  { key: 'report', label: 'گزارش', icon: 'tabler-report-analytics' },
]

const pages = {
  exceptions: Exceptions,
  limitations: Limitations,
  report: Report,
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
        v-for="req in componentsIcons"
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

  <component :is="pages[current]" v-if="current !== 'root'" @back="goBack" />
</template>
