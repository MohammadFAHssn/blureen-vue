<script setup>
import ContractorInvoice from '@/views/apps/food/kitchen/Statistics/ContractorInvoice.vue'
import ForContractor from '@/views/apps/food/kitchen/Statistics/ForContractor.vue'
// import ForGuest from '@/views/apps/food/kitchen/Statistics/ForGuest.vue'
import ForPersonnel from '@/views/apps/food/kitchen/Statistics/ForPersonnel.vue'

// تعریف emit
const emit = defineEmits(['back'])

const current = ref('root')

const componentsIcons = [
  { key: 'forPersonnel', label: 'پرسنل', icon: 'tabler-users' },
  // { key: 'forGuest', label: 'مهمان', icon: 'tabler-user-question' },
  { key: 'forContractor', label: 'پیمانکار', icon: 'tabler-calendar-user' },
  { key: 'contractorInvoice', label: 'حساب پیمانکار', icon: 'tabler-cash-register' },
]

const pages = {
  forPersonnel: ForPersonnel,
  // forGuest: ForGuest,
  forContractor: ForContractor,
  contractorInvoice: ContractorInvoice,
}

function goBack() {
  if (current.value !== 'root') {
    current.value = 'root'
  }
  else {
    emit('back')
  }
}

function open(key) {
  current.value = key
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
      {{ current === 'root' ? 'آشپزخانه' : 'آمار' }}
    </VBtn>
  </div>
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

    <component :is="pages[current]" />
  </VContainer>
</template>
