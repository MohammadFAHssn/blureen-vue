<script setup>
import { can } from '@layouts/plugins/casl'
import { onMounted, ref } from 'vue'
import ReservationForGuestAndContractor from '@/views/apps/food/ReservationForGuestAndContractor.vue'
import ReservationForPersonnel from '@/views/apps/food/ReservationForPersonnel.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'use',
    subject: 'app',
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
            <template v-if="can('read', 'Reserve-Food')">
              <VBtn
                density="default"
                @click="
                  reservationForPersonnel = true;
                  reservationForGuestAndContractor = false;
                "
              >
                پرسنل
              </VBtn>

              <VBtn
                density="default"
                @click="
                  reservationForPersonnel = false;
                  reservationForGuestAndContractor = true;
                "
              >
                پیمانکار - مهمان - تعمیرکار
              </VBtn>
            </template>
            <VCol v-if="!can('read', 'Reserve-Food')" cols="auto">
              <div class="text-h6 font-weight-bold text-primary-darken-3">
                رزرو شده برای شما
              </div>
            </VCol>
          </VRow>
        </VCard>
      </VCol>

      <ReservationForPersonnel v-if="reservationForPersonnel && !reservationForGuestAndContractor" />

      <ReservationForGuestAndContractor v-if="!reservationForPersonnel && reservationForGuestAndContractor" />
    </VRow>
  </VContainer>
</template>
