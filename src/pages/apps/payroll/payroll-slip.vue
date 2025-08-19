<script setup>
import Allowances from '@/views/apps/payroll/Allowances.vue'
import Attendance from '@/views/apps/payroll/Attendances.vue'
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

  <div class="my-6">
    <v-divider color="info" thickness="3" class="border-opacity-50">
      <template #default>
        <span class="v-card-title px-2 text-info v-card-title">پرداختی اول</span>
      </template>
    </v-divider>
  </div>

  <VRow>
    <VCol
      cols="12"
      sm="12"
      md="4"
      lg="4"
      xl="4"
      xxl="4"
    >
      <Attendance />
      <br />
      <Payments />
    </VCol>

    <VCol
      cols="12"
      sm="12"
      md="4"
      lg="4"
      xl="4"
      xxl="4"
    >
      <Deductions />
    </VCol>

    <VCol
      cols="12"
      sm="12"
      md="4"
      lg="4"
      xl="4"
      xxl="4"
    >
      <OverTime />
      <br />
      <Allowances />
      <br />
      <VCard color="primary">
        <VCardText class="pa-3 first-payment">
          <div class="label v-card-title pa-0 text-white">
            جمع خالص پرداختی‌های اول
          </div>

          <h6 class="text-h6 text-white amount">
            12,500,000
          </h6>
          <div class="percent-change">
            <VChip
              variant="flat"
              :color="`${3.2 > 0 ? 'success' : 'error'}`"
              class="d-flex align-center"
            >
              <div class="text-sm">
                {{ Math.abs(3.2) }}%
              </div>

              <VIcon
                :icon="3.2 > 0 ? 'tabler-chevron-up' : 'tabler-chevron-down'"
                size="20"
                class="mr-1"
              />
            </VChip>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <div class="my-6">
    <v-divider color="info" thickness="3" class="border-opacity-50">
      <template #default>
        <span class="v-card-title px-2 text-info v-card-title">پرداختی دوم</span>
      </template>
    </v-divider>
  </div>

  <VRow>
    <VCol
      cols="12"
      sm="12"
      md="6"
      lg="6"
      xl="4"
      xxl="4"
    >
      <Bonuses />
    </VCol>
  </VRow>

  <VRow justify="center" align="center">
    <VCol
      cols="12"
      sm="12"
      md="6"
      lg="4"
      xl="4"
      xxl="4"
    >
      <VCard color="warning">
        <VCardText class="pa-3 d-flex justify-space-between">
          <div class="v-card-title pa-0">
            جمع کل پرداخت‌ها
          </div>

          <div class="d-flex align-center justify-space-between">
            <h6 class="text-h6 text-center ml-4">
              12,500,000
            </h6>
            <VChip
              variant="flat"
              :color="`${-3.2 > 0 ? 'success' : 'error'}`"
              class="d-flex align-center"
            >
              <div class="text-sm">
                {{ Math.abs(-3.2) }}%
              </div>

              <VIcon
                :icon="-3.2 > 0 ? 'tabler-chevron-up' : 'tabler-chevron-down'"
                size="20"
                class="mr-1"
              />
            </VChip>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
.first-payment {
  display: grid;
  grid-gap: 0;
  grid-template-columns: 1fr auto;
  grid-template-rows: repeat(2, 1fr);

  .label {
    grid-area: 1 / 1 / 2 / 2;
  }

  .amount {
    grid-area: 2 / 1 / 3 / 2;
  }

  .percent-change {
    grid-area: 1 / 2 / 3 / 3;
    place-self: center center;
  }

  // حالت صفحه‌نمایش بزرگ
  @media (min-width: 1600px) {
    grid-gap: 0 1rem;
    grid-template-columns: 1fr auto auto;
    grid-template-rows: 1fr;

    .label {
      grid-area: 1 / 1 / 2 / 2;
    }

    .amount {
      grid-area: 1 / 2 / 2 / 3;
    }

    .percent-change {
      grid-area: 1 / 3 / 2 / 4;
    }
  }
}
</style>
