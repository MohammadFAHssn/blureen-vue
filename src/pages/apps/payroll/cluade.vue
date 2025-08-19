<script setup>
// Payment items data
const paymentsData = [
  { title: 'حقوق پایه', value: '' },
  { title: 'حق اولاد', value: '' },
  { title: 'حق مسکن', value: '' },
  { title: 'خواربار', value: '' },
  { title: 'حق تاهل', value: '' },
  { title: 'نوبت کاری 10%', value: '' },
  { title: 'نوبت کاری 15%', value: '' },
  { title: 'شب کاری 35%', value: '' },
  { title: 'بن کارگری', value: '' },
  { title: 'پایه سنوات', value: '' },
  { title: 'مزد سنوات', value: '' },
  { title: 'حق پست', value: '' },
  { title: 'ماندگاری حق پست', value: '' },
  { title: 'محیط کار (سختی کار)', value: '' },
  { title: 'ماندگاری محیط کار(سختی کار)', value: '' },
  { title: 'حق پست جدید', value: '' },
  { title: 'ماندگاری پست جدید', value: '' },
  { title: 'پاداش مدیریت', value: '' },
  { title: 'ماندگاری پاداش مدیریت', value: '' },
  { title: 'حق ماموریت', value: '' },
  { title: 'پرداختی معوق', value: '' },
  { title: 'سایر مزایا', value: '' },
  { title: 'رتبه بندی', value: '' },

  // Empty rows
  ...Array.from({ length: 17 }, () => ({ title: '', value: null })),
]

// Deduction items data
const deductionsData = [
  { title: 'بیمه سهم کارمند', value: '' },
  { title: 'مالیات ماه', value: '' },
  { title: 'خرید کارکنان 1', value: '' },
  { title: 'خرید کارکنان 2', value: '' },
  { title: 'کسر جاری کارکنان', value: '' },
  { title: 'بیمه تکمیلی', value: '' },
  { title: 'وام ضروری', value: '' },
  { title: 'وام ضروری 3', value: '' },
  { title: 'بیمه تکمیلی فروردین', value: '' },
  { title: 'بن کارت خرید اردیبهشت ابوطالبی', value: '' },
  { title: 'بن کارت خرید خرداد ابوطالبی', value: '' },
  { title: 'بن کارت خرید تیر ابوطالبی', value: '' },
  { title: 'بن کارت خرید مرداد ابوطالبی', value: '' },
  { title: 'بن کارت خرید شهریور ابوطالبی', value: '' },
  { title: 'بن کارت خرید مهر ابوطالبی', value: '' },
  { title: 'بن کارت خرید آبان ابوطالبی', value: '' },
  { title: 'بن کارت خرید آذر ابوطالبی', value: '' },
  { title: 'بن کارت خرید دی ابوطالبی', value: '' },
  { title: 'بن کارت خرید بهمن ابوطالبی', value: '' },
  { title: 'بن کارت خرید فروردین آریا', value: '' },
  { title: 'بن کارت خرید اردیبهشت آریا', value: '' },
  { title: 'بن کارت خرید خرداد آریا', value: '' },
  { title: 'بن کارت خرید تیر آریا', value: '' },
  { title: 'بن کارت خرید مرداد آریا', value: '' },
  { title: 'بن کارت خرید شهریور آریا', value: '' },
  { title: 'بن کارت خرید مهر آریا', value: '' },
  { title: 'بن کارت خرید آبان آریا', value: '' },
  { title: 'بن کارت خرید آذر آریا', value: '' },
  { title: 'بن کارت خرید دی آریا', value: '' },
  { title: 'بن کارت خرید بهمن آریا', value: '' },
  { title: 'بن کارت خرید فروردین چادرملو', value: '' },
  { title: 'بن کارت خرید اردیبهشت چادرملو', value: '' },
  { title: 'بن کارت خرید خرداد چادرملو', value: '' },
  { title: 'بن کارت خرید تیر چادرملو', value: '' },
  { title: 'بن کارت خرید مرداد چادرملو', value: '' },
  { title: 'بن کارت خرید شهریور چادرملو', value: '' },
  { title: 'بن کارت خرید مهر چادرملو', value: '' },
  { title: 'بن کارت خرید آبان چادرملو', value: '' },
  { title: 'بن کارت خرید آذر چادرملو', value: '' },
  { title: 'بن کارت خرید دی چادرملو', value: '' },
  { title: 'بن کارت خرید بهمن چادرملو', value: '' },
  { title: 'خرید فروردین شیشه', value: '' },
  { title: 'خرید اردیبهشت شیشه', value: '' },
  { title: 'خرید خرداد شیشه', value: '' },
  { title: 'خرید تیر شیشه', value: '' },
  { title: 'خرید مرداد شیشه', value: '' },
  { title: 'خرید شهریور شیشه', value: '' },
  { title: 'خرید مهر شیشه', value: '' },
  { title: 'خرید آبان شیشه', value: '' },
  { title: 'خرید آذر شیشه', value: '' },
  { title: 'خرید دی شیشه', value: '' },
  { title: 'خرید بهمن شیشه', value: '' },
  { title: 'خرید اردیبهشت سالار', value: '' },
  { title: 'خرید خرداد سالار', value: '' },
  { title: 'خرید تیر سالار', value: '' },
  { title: 'خرید مرداد سالار', value: '' },
  { title: 'خرید شهریور سالار', value: '' },
  { title: 'خرید مهر سالار', value: '' },
  { title: 'خرید آبان سالار', value: '' },
  { title: 'خرید آذر سالار', value: '' },
  { title: 'خرید دی سالار', value: '' },
  { title: 'خرید بهمن سالار', value: '' },

  // Empty rows
  ...Array.from({ length: 20 }, () => ({ title: '', value: null })),
]

// Print function
function printPayrollSlip() {
  window.print()
}

// Page meta
definePage({
  meta: {
    title: 'Payroll Slip',
    navActiveLink: 'apps-payroll-slip',
  },
})
</script>

<template>
  <section class="payroll-slip-container">
    <!-- Print Button (only visible on screen) -->
    <div class="print-button-container d-print-none">
      <VBtn
        color="primary"
        size="large"
        class="print-btn"
        @click="printPayrollSlip"
      >
        <VIcon
          start
          icon="tabler-printer"
        />
        چاپ فیش حقوقی
      </VBtn>
    </div>

    <VCard class="payroll-slip-a4-page pa-0 ma-auto">
      <!-- Employee Header Information -->
      <div class="employee-header print-row bg-surface pa-6 mb-4">
        <VTable class="employee-info-table">
          <tbody>
            <tr>
              <td class="font-weight-medium">
                کد پرسنلی:
              </td>
              <td class="font-weight-bold">
                6649
              </td>
              <td class="font-weight-medium">
                نام و نام خانوادگی:
              </td>
              <td class="font-weight-bold">
                محمد حسني احمدآبادي
              </td>
            </tr>
            <tr>
              <td class="font-weight-medium">
                واحد:
              </td>
              <td class="font-weight-bold">
                واحد برنامه نويسي
              </td>
              <td class="font-weight-medium">
                گروه:
              </td>
              <td class="font-weight-bold">
                6
              </td>
            </tr>
            <tr>
              <td class="font-weight-medium">
                ماه:
              </td>
              <td class="font-weight-bold">
                12
              </td>
              <td class="font-weight-medium">
                سال:
              </td>
              <td class="font-weight-bold">
                1403
              </td>
            </tr>
          </tbody>
        </VTable>
      </div>

      <!-- Main Payroll Tables Section -->
      <div class="payroll-tables-section print-row px-6">
        <VRow class="mb-6">
          <!-- Payments Table -->
          <VCol
            cols="4"
            class="pe-2"
          >
            <VCard
              class="h-100 border"
              elevation="0"
            >
              <VCardTitle class="text-center bg-primary text-white pa-3">
                <h6 class="text-h6 text-white">
                  پرداخت ها
                </h6>
              </VCardTitle>
              <VTable
                density="compact"
                class="payments-table"
              >
                <thead>
                  <tr>
                    <th class="text-right font-weight-bold">
                      شرح
                    </th>
                    <th class="text-center font-weight-bold">
                      ریال
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in paymentsData"
                    :key="index"
                    :class="{ 'table-row-empty': !item.title }"
                  >
                    <td class="text-right">
                      {{ item.title }}
                    </td>
                    <td class="text-center">
                      <VTextField
                        v-if="item.value !== null"
                        :model-value="item.value"
                        variant="plain"
                        density="compact"
                        readonly
                        class="text-center"
                        hide-details
                      />
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCard>
          </VCol>

          <!-- Deductions Table -->
          <VCol
            cols="4"
            class="px-1"
          >
            <VCard
              class="h-100 border"
              elevation="0"
            >
              <VCardTitle class="text-center bg-error text-white pa-3">
                <h6 class="text-h6 text-white">
                  کسورات
                </h6>
              </VCardTitle>
              <VTable
                density="compact"
                class="deductions-table"
              >
                <thead>
                  <tr>
                    <th class="text-right font-weight-bold">
                      شرح
                    </th>
                    <th class="text-center font-weight-bold">
                      ریال
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in deductionsData"
                    :key="index"
                    :class="{ 'table-row-empty': !item.title }"
                  >
                    <td class="text-right">
                      {{ item.title }}
                    </td>
                    <td class="text-center">
                      <VTextField
                        v-if="item.value !== null"
                        :model-value="item.value"
                        variant="plain"
                        density="compact"
                        readonly
                        class="text-center"
                        hide-details
                      />
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCard>
          </VCol>

          <!-- Other Information Table -->
          <VCol
            cols="4"
            class="ps-2"
          >
            <VCard
              class="h-100 border"
              elevation="0"
            >
              <VCardTitle class="text-center bg-info text-white pa-3">
                <h6 class="text-h6 text-white">
                  سایر اطلاعات
                </h6>
              </VCardTitle>
              <VTable
                density="compact"
                class="other-info-table"
              >
                <thead>
                  <tr>
                    <th class="text-right font-weight-bold">
                      شرح
                    </th>
                    <th class="text-center font-weight-bold">
                      مقدار
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="text-right">
                      دقیقه کارکرد عادی
                    </td>
                    <td class="text-center">
                      <VTextField
                        model-value=""
                        variant="plain"
                        density="compact"
                        readonly
                        class="text-center"
                        hide-details
                      />
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCard>
          </VCol>
        </VRow>

        <!-- Summary Section -->
        <VRow class="mb-6">
          <VCol
            cols="4"
            class="pe-2"
          >
            <VCard
              class="border bg-success"
              elevation="0"
            >
              <VCardText class="pa-4 text-center">
                <h6 class="text-h6 text-white font-weight-bold mb-2">
                  جمع ناخالص پرداختی
                </h6>
                <VTextField
                  model-value=""
                  variant="outlined"
                  density="compact"
                  readonly
                  class="text-center"
                  hide-details
                />
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="4"
            class="px-1"
          >
            <VCard
              class="border bg-warning"
              elevation="0"
            >
              <VCardText class="pa-4 text-center">
                <h6 class="text-h6 text-white font-weight-bold mb-2">
                  جمع کسورات
                </h6>
                <VTextField
                  model-value=""
                  variant="outlined"
                  density="compact"
                  readonly
                  class="text-center"
                  hide-details
                />
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="4"
            class="ps-2"
          >
            <VCard
              class="border bg-primary"
              elevation="0"
            >
              <VCardText class="pa-4 text-center">
                <h6 class="text-h6 text-white font-weight-bold mb-2">
                  خالص پرداختی
                </h6>
                <VTextField
                  model-value=""
                  variant="outlined"
                  density="compact"
                  readonly
                  class="text-center"
                  hide-details
                />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- Bonus and Overtime Section -->
        <VRow class="mb-6">
          <!-- Bonus Section -->
          <VCol
            cols="6"
            class="pe-2"
          >
            <VCard
              class="border"
              elevation="0"
            >
              <VCardTitle class="text-center bg-secondary text-white pa-3">
                <h4 class="text-h4 text-white">
                  پاداش
                </h4>
              </VCardTitle>
              <VTable density="compact">
                <tbody>
                  <tr>
                    <td class="text-right">
                      پاداش شناور فردی (ارزیابی) 1
                    </td>
                    <td class="text-center">
                      1
                    </td>
                    <td class="text-center">
                      <VTextField
                        model-value=""
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                  </tr>
                  <tr>
                    <td class="text-right">
                      پاداش شناور گروهی (بهره وری)
                    </td>
                    <td
                      class="text-center"
                      colspan="2"
                    >
                      <VTextField
                        model-value=""
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                  </tr>
                  <tr>
                    <td class="text-right">
                      پاداش شناور مدیر واحد
                    </td>
                    <td
                      class="text-center"
                      colspan="2"
                    >
                      <VTextField
                        model-value=""
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                  </tr>
                  <tr>
                    <td class="text-right">
                      فوق العاده بهره وری
                    </td>
                    <td
                      class="text-center"
                      colspan="2"
                    >
                      <VTextField
                        model-value=""
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                  </tr>
                </tbody>
              </VTable>
              <VDivider />
              <div class="pa-3 d-flex justify-space-between align-center bg-grey-lighten-4">
                <span class="font-weight-bold">جمع پاداش</span>
                <VTextField
                  model-value=""
                  variant="outlined"
                  density="compact"
                  readonly
                  style="max-inline-size: 120px;"
                  hide-details
                />
              </div>
            </VCard>
          </VCol>

          <!-- Overtime Section -->
          <VCol
            cols="6"
            class="ps-2"
          >
            <VCard
              class="border"
              elevation="0"
            >
              <VCardTitle class="text-center bg-secondary text-white pa-3">
                <h4 class="text-h4 text-white">
                  اضافه کاری
                </h4>
              </VCardTitle>
              <VTable density="compact">
                <tbody>
                  <tr>
                    <td class="text-right">
                      دقیقه اضافه کاری
                    </td>
                    <td class="text-center">
                      163
                    </td>
                  </tr>
                  <tr>
                    <td class="text-right">
                      مبلغ
                    </td>
                    <td class="text-center">
                      <VTextField
                        model-value=""
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                  </tr>
                  <tr>
                    <td class="text-right">
                      دقیقه جمعه کاری
                    </td>
                    <td class="text-center">
                      1
                    </td>
                  </tr>
                  <tr>
                    <td class="text-right">
                      مبلغ
                    </td>
                    <td class="text-center">
                      <VTextField
                        model-value=""
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                  </tr>
                </tbody>
              </VTable>
              <VDivider />
              <div class="pa-3 d-flex justify-space-between align-center bg-grey-lighten-4">
                <span class="font-weight-bold">جمع اضافه کاری</span>
                <VTextField
                  model-value=""
                  variant="outlined"
                  density="compact"
                  readonly
                  style="max-inline-size: 120px;"
                  hide-details
                />
              </div>
            </VCard>
          </VCol>
        </VRow>

        <!-- Extra Benefits Section -->
        <VRow class="mb-6">
          <VCol cols="12">
            <VCard
              class="border"
              elevation="0"
            >
              <VCardTitle class="text-center bg-accent text-white pa-3">
                <h5 class="text-h5 text-white">
                  فوق العاده و رفاهیات
                </h5>
              </VCardTitle>
              <VTable density="compact">
                <tbody>
                  <tr>
                    <td class="text-center font-weight-bold">
                      فوق العاده
                    </td>
                    <td class="text-center font-weight-bold">
                      ماندگاری
                    </td>
                    <td class="text-center font-weight-bold">
                      پاداش فنی
                    </td>
                    <td class="text-center font-weight-bold">
                      فوق العاده مدیریت
                    </td>
                    <td class="text-center font-weight-bold">
                      رفاهیات
                    </td>
                  </tr>
                  <tr>
                    <td class="text-center">
                      <VTextField
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                    <td class="text-center">
                      <VTextField
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                    <td class="text-center">
                      <VTextField
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                    <td class="text-center font-weight-bold">
                      کمک هزینه درمان
                    </td>
                    <td class="text-center font-weight-bold">
                      کمک هزینه سفر
                    </td>
                  </tr>
                  <tr>
                    <td />
                    <td />
                    <td />
                    <td class="text-center">
                      <VTextField
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                    <td class="text-center">
                      <VTextField
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      <div class="d-flex align-center gap-2">
                        <span class="font-weight-bold">کسورات فوق العاده:</span>
                        <VTextField
                          variant="plain"
                          density="compact"
                          readonly
                          hide-details
                          style="max-inline-size: 100px;"
                        />
                      </div>
                    </td>
                    <td colspan="2">
                      <div class="d-flex align-center gap-2">
                        <span class="font-weight-bold">علت کسر:</span>
                        <span>1</span>
                      </div>
                    </td>
                    <td />
                  </tr>
                </tbody>
              </VTable>
              <VDivider />
              <div class="pa-3 d-flex justify-space-between align-center bg-grey-lighten-4">
                <span class="font-weight-bold">جمع فوق العاده</span>
                <VTextField
                  model-value=""
                  variant="outlined"
                  density="compact"
                  readonly
                  style="max-inline-size: 150px;"
                  hide-details
                />
              </div>
            </VCard>
          </VCol>
        </VRow>

        <!-- Final Summary Section -->
        <VRow class="mb-4">
          <VCol
            cols="6"
            class="pe-2"
          >
            <VCard
              class="border bg-purple"
              elevation="0"
            >
              <VCardText class="pa-4 text-center">
                <h6 class="text-h6 text-white font-weight-bold mb-3">
                  جمع ناخالص پرداختی<br />
                  (ناخالص حقوق،پاداش،فوق العاده،اضافه کاری)
                </h6>
                <VTextField
                  model-value=""
                  variant="outlined"
                  density="compact"
                  readonly
                  class="text-center"
                  hide-details
                />
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="6"
            class="ps-2"
          >
            <VCard
              class="border"
              elevation="0"
            >
              <VCardTitle class="text-center bg-teal text-white pa-3">
                <h4 class="text-h4 text-white">
                  هزینه های قانونی
                </h4>
              </VCardTitle>
              <VTable density="compact">
                <tbody>
                  <tr>
                    <td class="text-right">
                      بیمه سهم کارمند
                    </td>
                    <td class="text-center">
                      <VTextField
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                  </tr>
                  <tr>
                    <td class="text-right">
                      بیمه سهم کارفرما
                    </td>
                    <td class="text-center">
                      <VTextField
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                  </tr>
                  <tr>
                    <td class="text-right">
                      بیمه بیکاری سهم کارفرما
                    </td>
                    <td class="text-center">
                      <VTextField
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                  </tr>
                  <tr>
                    <td class="text-right">
                      مالیات
                    </td>
                    <td class="text-center">
                      <VTextField
                        variant="plain"
                        density="compact"
                        readonly
                        hide-details
                      />
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCard>
          </VCol>
        </VRow>

        <!-- Final Total -->
        <VRow>
          <VCol cols="12">
            <VCard
              class="border bg-deep-purple"
              elevation="0"
            >
              <VCardText class="pa-4 d-flex justify-space-between align-center">
                <h5 class="text-h5 text-white font-weight-bold">
                  جمع کل پرداخت ها:
                </h5>
                <VTextField
                  model-value=""
                  variant="outlined"
                  density="compact"
                  readonly
                  style="background-color: white; max-inline-size: 200px;"
                  hide-details
                />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </div>
    </VCard>
  </section>
</template>

<style lang="scss" scoped>
.payroll-slip-container {
  position: relative;
  overflow: auto;
  padding: 20mm;
  background-color: #f5f5f5;
  direction: rtl;
  min-block-size: 100vh;
}

.print-button-container {
  position: fixed;
  z-index: 1000;
  inset-block-start: 20px;
  inset-inline-end: 20px;
}

.print-btn {
  box-shadow: 0 4px 8px rgba(0 0 0 / 15%);
}

.payroll-slip-a4-page {
  background: white;
  box-shadow: 0 4px 6px rgba(0 0 0 / 10%);
  font-family: Roboto, sans-serif;
  inline-size: 210mm;
  min-block-size: 297mm;
}

.employee-header {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
}

.employee-info-table {
  .v-table__wrapper {
    border: none;
  }

  td {
    border: none;
    font-size: 14px;
    padding-block: 8px;
    padding-inline: 12px;
  }
}

.payroll-tables-section {
  .v-card {
    border-radius: 8px;
  }

  .v-table {
    font-size: 12px;

    th,
    td {
      border-block-end: 1px solid #e0e0e0;
      font-size: 11px;
      padding-block: 6px;
      padding-inline: 8px;
    }

    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
  }
}

.table-row-empty {
  td {
    block-size: 20px;
    padding-block: 4px !important;
    padding-inline: 8px !important;
  }
}

.payments-table,
.deductions-table,
.other-info-table {
  .v-input {
    font-size: 11px;
  }

  .v-field__input {
    min-block-size: auto;
    padding-block: 2px;
    padding-inline: 4px;
  }
}

// Print styles
@media print {
  .payroll-slip-container {
    padding: 0;
    background-color: white;
  }

  .payroll-slip-a4-page {
    margin: 0;
    block-size: 297mm;
    box-shadow: none;
    inline-size: 210mm;
  }

  .v-navigation-drawer,
  .layout-vertical-nav,
  .app-customizer-toggler,
  .layout-footer,
  .layout-navbar,
  .layout-navbar-and-nav-container {
    display: none !important;
  }

  .layout-content-wrapper {
    padding: 0 !important;
  }

  .v-card {
    box-shadow: none !important;
  }

  .print-row {
    flex-direction: row !important;
  }

  .v-table__wrapper {
    overflow: hidden !important;
  }

  body {
    background: none !important;
  }

  // Ensure colors print properly
  .bg-primary,
  .bg-error,
  .bg-info,
  .bg-success,
  .bg-warning,
  .bg-secondary,
  .bg-accent,
  .bg-purple,
  .bg-teal,
  .bg-deep-purple {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
