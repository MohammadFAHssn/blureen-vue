<script setup>
import Allowances from '@/views/apps/payroll/Allowances.vue'
import Bonuses from '@/views/apps/payroll/Bonuses.vue'
import Deductions from '@/views/apps/payroll/Deductions.vue'
import EmployeeInfo from '@/views/apps/payroll/EmployeeInfo.vue'
import OverTime from '@/views/apps/payroll/OverTime.vue'
import Payments from '@/views/apps/payroll/Payments.vue'
</script>

<template>
  <VRow>
    <VCol>
      <p class="text-lg font-weight-bold mb-1">
        گروه کارخانجات شیشه اردکان
      </p>

      <p class="text-lg mb-0">
        فیش حقوقی فروردین 1404
      </p>
    </VCol>
  </VRow>

  <VRow>
    <VCol>
      <EmployeeInfo />
    </VCol>
  </VRow>

  <VRow>
    <VCol
      cols="12"
      sm="12"
      md="6"
      lg="6"
      xl="4"
      xxl="3"
    >
      <Payments />
    </VCol>

    <VCol
      cols="12"
      sm="12"
      md="6"
      lg="6"
      xl="4"
      xxl="3"
    >
      <OverTime />
      <br />
      <Allowances />
      <br />
      <VCard variant="tonal" color="primary">
        <VCardItem class="pa-3 pb-0">
          <VCardTitle>
            جمع ناخالص پرداختی‌های اول
          </VCardTitle>
        </VCardItem>

        <VCardText class="pa-3">
          <div class="d-flex align-center justify-space-between">
            <h6 class="text-h6 text-center">
              12,500,000
            </h6>
            <div class="text-sm text-success">
              1.6%+
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      sm="12"
      md="6"
      lg="6"
      xl="4"
      xxl="3"
    >
      <Deductions />

      <br />

      <VCard color="primary">
        <VCardItem class="pa-3 pb-0">
          <VCardTitle class="text-white">
            جمع خالص پرداختی‌های اول
          </VCardTitle>
        </VCardItem>

        <VCardText class="pa-3">
          <div class="d-flex align-center justify-space-between">
            <h6 class="text-h6 text-center text-white">
              12,500,000
            </h6>
            <VChip variant="flat" color="success">
              1.6%+
            </VChip>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      sm="12"
      md="6"
      lg="6"
      xl="4"
      xxl="3"
    >
      <Bonuses />
    </VCol>

    <!-- <section class="payroll-slip-container">
    <section class="payroll-slip-a4-page pa-4">
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
          <VCard>
            <VCardText class="d-flex pa-4 align-center">
              <div class="me-auto">
                <p class="d-flex">
                  <VIcon color="primary" icon="tabler-user" size="22" />
                  <span class="ms-3">نام و نام خانوادگی:</span>
                  <span class="ms-3">محمد حسنی احمدآبادی</span>
                </p>

                <p class="d-flex mb-0">
                  <VIcon color="primary" icon="tabler-id" size="22" />
                  <span class="ms-3">کد پرسنلی:</span>
                  <span class="ms-3">6649</span>
                </p>
              </div>

              <VDivider vertical inset />

              <div class="ms-auto">
                <p class="d-flex">
                  <VIcon color="primary" icon="tabler-building" size="22" />
                  <span class="ms-3">واحد:</span>
                  <span class="ms-3">برنامه‌نویسی</span>
                </p>

                <p class="d-flex mb-0">
                  <VIcon color="primary" icon="tabler-star" size="22" />
                  <span class="ms-3">گروه:</span>
                  <span class="ms-3">10</span>
                </p>
              </div>
            </VCardText>
          </VCard>
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

      <VRow>
        <VCol cols="4" class="pt-0 pl-0">
          <Bonuses />
        </VCol>
      </VRow>
    </section>
  </section> -->
  </VRow>
</template>
