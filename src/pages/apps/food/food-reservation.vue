<script setup>
import { can } from '@layouts/plugins/casl'
import { onMounted, ref } from 'vue'
import ReservationForGuestAndContractor from '@/views/apps/food/ReservationForGuestAndContractor.vue'
import ReservationForPersonnel from '@/views/apps/food/ReservationForPersonnel.vue'

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
            <VCol v-if="!can('use', 'reserve-for-others')" cols="auto">
              <div class="text-h6 font-weight-bold text-primary-darken-3">
                رزرو غذا
              </div>
            </VCol>

            <template v-if="can('use', 'reserve-for-others')">
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
                رزرو غذای میهمان/ پیمانکار
              </VBtn>
            </template>
          </VRow>
        </VCard>
      </VCol>

      <ReservationForPersonnel v-if="reservationForPersonnel && !reservationForGuestAndContractor" />

      <ReservationForGuestAndContractor v-if="!reservationForPersonnel && reservationForGuestAndContractor" />
    </VRow>
  </VContainer>
</template>
