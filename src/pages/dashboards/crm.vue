<script setup>
import { can } from '@layouts/plugins/casl'
import PayrollChart from './PayrollChart.vue'
</script>

<template>
  <VRow class="match-height">
    <!-- 👉 Payroll  -->
    <VCol v-if="can('use', 'app')" cols="12">
      <VCard>
        <VCardItem class="d-flex flex-wrap justify-space-between gap-4">
          <VCardTitle>حقوق و دستمزد</VCardTitle>
        </VCardItem>

        <VCardText>
          <PayrollChart />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
