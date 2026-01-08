<script setup>
import { can } from '@layouts/plugins/casl'
import { onMounted, ref } from 'vue'
import ReservationForGuestAndContractor from '@/views/apps/food/ReservationForGuestAndContractor.vue'
import ReservationForPersonnel from '@/views/apps/food/ReservationForPersonnel.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'Reserve-Food',
  },
})

const reservationForPersonnel = ref(true)
const reservationForGuestAndContractor = ref(false)

onMounted(() => {
  reservationForPersonnel.value = true
  reservationForGuestAndContractor.value = false
})
</script>

<template>
  <VContainer>
    <VRow dense>
      <VCol cols="12">
        <VCard class="mb-4 pa-8 text-center">
          <VRow align="center" justify="center" class="gap-4">
            <VBtn
              density="default"
              @click="
                reservationForPersonnel = true;
                reservationForGuestAndContractor = false;
              "
            >
              رزرو غذا
            </VBtn>

            <VBtn
              density="default"
              @click="
                reservationForPersonnel = false;
                reservationForGuestAndContractor = true;
              "
            >
              رزرو غذای مهمان/ پیمانکار
            </VBtn>
          </VRow>
        </VCard>
      </VCol>

      <ReservationForPersonnel v-if="reservationForPersonnel && !reservationForGuestAndContractor" />

      <ReservationForGuestAndContractor v-if="!reservationForPersonnel && reservationForGuestAndContractor" />
    </VRow>
  </VContainer>
</template>
