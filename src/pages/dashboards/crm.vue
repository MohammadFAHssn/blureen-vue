<script setup>
import { can } from '@layouts/plugins/casl'
import PayrollChart from './PayrollChart.vue'

const overlay = ref(true)
</script>

<template>
  <VRow>
    <!-- 👉 Payroll  -->
    <VCol
      v-if="can('use', 'app')"
      cols="12"
      sm="12"
      md="12"
      lg="12"
      xl="6"
      xxl="6"
    >
      <VCard>
        <v-overlay
          v-model="overlay"
          class="align-center justify-center"
          contained
        >
          <v-btn
            color="primary"
            @click="overlay = false"
          >
            نمایش نمودار
          </v-btn>
        </v-overlay>

        <VCardItem>
          <VCardTitle>حقوق و دستمزد</VCardTitle>
        </VCardItem>

        <VCardText>
          <PayrollChart />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style>
.v-overlay__scrim {
  backdrop-filter: blur(5px);
}
</style>
