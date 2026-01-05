<script setup>
import { can } from '@layouts/plugins/casl'
import ContractorInvoice from '@/views/apps/food/kitchen/ContractorInvoice.vue'
import Delivery from '@/views/apps/food/kitchen/Delivery.vue'
import Foods from '@/views/apps/food/kitchen/Foods.vue'
import MealPlan from '@/views/apps/food/kitchen/MealPlan.vue'
import Meals from '@/views/apps/food/kitchen/Meals.vue'
import Statistics from '@/views/apps/food/kitchen/Statistics.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'see',
    subject: 'Kitchen',
  },
})

const current = ref('root')

const canReadKitchen = computed(() => !!can('read', 'Kitchen'))
const canEditFoodPrice = computed(() => !!can('edit', 'Food-Price'))
const canReadContractorInvoice = computed(() => !!can('read', 'Contractor-Invoice'))

const componentsIcons = [
  { key: 'foods', label: 'غذاها', icon: 'tabler-meat', show: () => canReadKitchen.value || canEditFoodPrice.value },
  { key: 'meals', label: 'وعده‌های غذایی', icon: 'tabler-bowl-chopsticks', show: () => canReadKitchen.value },
  { key: 'mealPlan', label: 'برنامه غذایی', icon: 'tabler-calendar-time', show: () => canReadKitchen.value },
  { key: 'statistics', label: 'آمار', icon: 'tabler-report-analytics', show: () => canReadKitchen.value },
  {
    key: 'contractorInvoice',
    label: 'حساب پیمانکار',
    icon: 'tabler-cash-register',
    show: () => canReadKitchen.value || canReadContractorInvoice.value,
  },
  { key: 'delivery', label: 'تحویل غذا', icon: 'tabler-checklist', show: () => canReadKitchen.value },
]

const visibleComponentsIcons = computed(() =>
  componentsIcons.filter(item => item.show?.() !== false),
)

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
  </VContainer>
</template>
