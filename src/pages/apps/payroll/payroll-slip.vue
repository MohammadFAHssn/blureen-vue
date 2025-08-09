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

        <VCol cols="4" class="pt-0 pl-0">
          <VCard variant="tonal" color="success">
            <VCardItem class="pa-4 pb-0">
              <VCardTitle>جمع ناخالص پرداختی:</VCardTitle>
            </VCardItem>

            <VCardText class="pa-4 pt-0">
              <div class="d-flex align-center justify-space-between gap-x-2">
                <h4 class="text-h6 text-center">
                  12,500,000
                </h4>
                <div class="text-sm text-success">
                  +1.6%
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="4" class="pt-0 pl-0">
          <VCard variant="tonal" color="error">
            <VCardItem class="pa-4 pb-0">
              <VCardTitle>جمع کسورات:</VCardTitle>
            </VCardItem>

            <VCardText class="pa-4 pt-0">
              <h4 class="text-h6">
                12,500,000-
              </h4>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="4" class="pt-0">
          <VCard variant="tonal" color="primary">
            <VCardItem class="pa-4 pb-0">
              <VCardTitle>خالص پرداختی:</VCardTitle>
            </VCardItem>

            <VCardText class="pa-4 pt-0">
              <div class="d-flex align-center justify-space-between gap-x-2">
                <h4 class="text-h6 text-center">
                  12,500,000
                </h4>
                <div class="text-sm text-success">
                  +1.6%
                </div>
              </div>
            </VCardText>
          </VCard>
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
