<script setup>
import { can } from '@layouts/plugins/casl'
import MealReservation from '@/views/apps/food/MealReservation.vue'
import MealReservedForYou from '@/views/apps/food/MealReservedForYou.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'use',
    subject: 'app',
  },
})
</script>

<template>
  <VContainer max-width="100%">
    <VRow dense>
      <VCol cols="12">
        <VCard class="mb-4 pa-8 text-center">
          <VRow align="center" justify="center" class="gap-4">
            <div v-if="can('read', 'Reserve-Food')" class="text-h6 font-weight-bold text-primary-darken-3">
              رزرو غذا
            </div>
            <div v-if="!can('read', 'Reserve-Food')" class="text-h6 font-weight-bold text-primary-darken-3">
              رزرو شده برای شما
            </div>
          </VRow>
        </VCard>
      </VCol>

      <MealReservation v-if="can('read', 'Reserve-Food')" />

      <MealReservedForYou v-if="!can('read', 'Reserve-Food')" />
    </VRow>
  </VContainer>
</template>
