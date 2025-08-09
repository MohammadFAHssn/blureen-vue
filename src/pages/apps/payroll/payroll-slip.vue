<script setup>
import Deductions from '@/views/apps/payroll/Deductions.vue'
import EmployeeInfo from '@/views/apps/payroll/EmployeeInfo.vue'
import OtherDetails from '@/views/apps/payroll/OtherDetails.vue'
import Payments from '@/views/apps/payroll/Payments.vue'
</script>

<template>
  <section class="payroll-slip-container">
    <section class="payroll-slip-a4-page">
      <h1 class="text-center">
        گروه کارخانجات شیشه اردکان
      </h1>

      <h2 class="text-center">
        فیش حقوقی
        <span> فروردین </span>

        <span> 1404 </span>
      </h2>

      <VRow>
        <VCol>
          <EmployeeInfo />
        </VCol>
      </VRow>

      <VRow>
        <VCol cols="4" class="pt-0 pl-0">
          <Payments />
        </VCol>

        <VCol cols="4" class="pt-0 pl-0">
          <Deductions />
        </VCol>

        <VCol cols="4" class="pt-0">
          <OtherDetails />
        </VCol>
      </VRow>
    </section>
  </section>
</template>

<style scoped>
.payroll-slip-a4-page {
  overflow: hidden;
  block-size: 297mm;
  inline-size: 210mm;
}

.payroll-slip-container {
  overflow: auto;
}

h1 {
  font-size: 17.28pt;
}

h2 {
  font-size: 14.4pt;

  /* ! */
  margin-block-end: 10pt;
}
</style>
