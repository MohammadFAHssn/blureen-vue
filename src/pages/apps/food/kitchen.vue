<script setup>
import ContractorInvoice from '@/views/apps/food/kitchen/ContractorInvoice.vue'
import Delivery from '@/views/apps/food/kitchen/Delivery.vue'
import Foods from '@/views/apps/food/kitchen/Foods.vue'
import MealPlan from '@/views/apps/food/kitchen/MealPlan.vue'
import Meals from '@/views/apps/food/kitchen/Meals.vue'
import Statistics from '@/views/apps/food/kitchen/Statistics.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'Kitchen',
  },
})

const current = ref('root')

const componentsIcons = [
  { key: 'foods', label: 'غذاها', icon: 'tabler-meat' },
  { key: 'meals', label: 'وعده‌های غذایی', icon: 'tabler-bowl-chopsticks' },
  { key: 'mealPlan', label: 'برنامه غذایی', icon: 'tabler-calendar-time' },
  { key: 'statistics', label: 'آمار', icon: 'tabler-report-analytics' },
  { key: 'contractorInvoice', label: 'حساب پیمانکار', icon: 'tabler-cash-register' },
  { key: 'delivery', label: 'تحویل غذا', icon: 'tabler-checklist' },
]

const pages = {
  foods: Foods,
  mealPlan: MealPlan,
  meals: Meals,
  statistics: Statistics,
  contractorInvoice: ContractorInvoice,
  delivery: Delivery,
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

    <component :is="pages[current]" @back="goBack" />
  </VContainer>
</template>
