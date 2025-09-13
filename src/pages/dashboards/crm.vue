<script setup>
import { can } from '@layouts/plugins/casl'
import PayrollChart from './PayrollChart.vue'
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
