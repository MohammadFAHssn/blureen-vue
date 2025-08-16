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
            <div :class="`d-flex align-center ${-6.5 > 0 ? 'text-success' : 'text-error'}`">
              <div class="text-sm">
                {{ Math.abs(-6.5) }}%
              </div>

              <VIcon
                :icon="
                  -6.5 > 0
                    ? 'tabler-chevron-up'
                    : 'tabler-chevron-down'
                "
                size="20"
                class="mr-1"
              />
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
            <VChip variant="flat" :color="`${3.2 > 0 ? 'success' : 'error'}`" class="d-flex align-center">
              <div class="text-sm">
                {{ Math.abs(3.2) }}%
              </div>

              <VIcon
                :icon="
                  3.2 > 0
                    ? 'tabler-chevron-up'
                    : 'tabler-chevron-down'
                "
                size="20"
                class="mr-1"
              />
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
  </VRow>

  <VRow
    justify="center"
    align="center"
  >
    <VCol
      cols="12"
      sm="12"
      md="6"
      lg="6"
      xl="4"
      xxl="3"
    >
      <VCard color="warning">
        <VCardItem class="pa-3 pb-0">
          <VCardTitle>
            جمع کل پرداختی‌ها
          </VCardTitle>
        </VCardItem>

        <VCardText class="pa-3">
          <div class="d-flex align-center justify-space-between">
            <h6 class="text-h6 text-center">
              12,500,000
            </h6>
            <VChip variant="flat" :color="`${-3.2 > 0 ? 'success' : 'error'}`" class="d-flex align-center">
              <div class="text-sm">
                {{ Math.abs(-3.2) }}%
              </div>

              <VIcon
                :icon="
                  -3.2 > 0
                    ? 'tabler-chevron-up'
                    : 'tabler-chevron-down'
                "
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
