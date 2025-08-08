<script setup>
const payrollData = {
  employee: {
    id: '6649',
    name: 'محمد حسني احمدآبادي',
    department: 'واحد برنامه نويسي',
    group: '6',
    month: '12',
    year: '1403',
  },
  payments: [
    { item: 'حقوق پایه', amount: '100,000,000' },
    { item: 'حق اولاد', amount: '5,000,000' },
    { item: 'حق مسکن', amount: '9,000,000' },
    { item: 'خواربار', amount: '1,500,000' },
    { item: 'حق تاهل', amount: '2,000,000' },
    { item: 'نوبت کاری 10%', amount: '' },
    { item: 'نوبت کاری 15%', amount: '' },
    { item: 'شب کاری 35%', amount: '' },
    { item: 'بن کارگری', amount: '11,000,000' },
    { item: 'پایه سنوات', amount: '2,100,000' },
    { item: 'مزد سنوات', amount: '' },
    { item: 'حق پست', amount: '' },
    { item: 'ماندگاری حق پست', amount: '' },
    { item: 'محیط کار (سختی کار)', amount: '' },
    { item: 'ماندگاری محیط کار(سختی کار)', amount: '' },
    { item: 'حق پست جدید', amount: '' },
    { item: 'ماندگاری پست جدید', amount: '' },
    { item: 'پاداش مدیریت', amount: '' },
    { item: 'ماندگاری پاداش مدیریت', amount: '' },
    { item: 'حق ماموریت', amount: '' },
    { item: 'پرداختی معوق', amount: '' },
    { item: 'سایر مزایا', amount: '' },
    { item: 'رتبه بندی', amount: '' },
  ],
  deductions: [
    { item: 'بیمه سهم کارمند', amount: '7,000,000' },
    { item: 'مالیات ماه', amount: '8,500,000' },
    { item: 'خرید کارکنان 1', amount: '' },
    { item: 'خرید کارکنان 2', amount: '' },
    { item: 'کسر جاری کارکنان', amount: '' },
    { item: 'بیمه تکمیلی', amount: '1,200,000' },
    { item: 'وام ضروری', amount: '' },
    { item: 'وام ضروری 3', amount: '' },
  ],
  otherInfo: [
    { item: 'دقیقه کارکرد عادی', value: '10,800' },
  ],
  bonuses: [
    { item: 'پاداش شناور فردی (ارزیابی) 1', value: '1', amount: '5,000,000' },
    { item: 'پاداش شناور گروهی (بهره وری)', amount: '3,000,000' },
    { item: 'پاداش شناور مدیر واحد', amount: '2,000,000' },
    { item: 'فوق العاده بهره وری', amount: '1,500,000' },
  ],
  allowances: {
    items: [
      { name: 'ماندگاری', amount: '1,000,000' },
      { name: 'پاداش فنی', amount: '1,200,000' },
      { name: 'فوق العاده مدیریت', amount: '2,500,000' },
    ],
    welfare: [
      { name: 'کمک هزینه درمان', amount: '500,000' },
      { name: 'کمک هزینه سفر', amount: '700,000' },
      { name: 'کمک هزینه فرهنگی، ورزشی، سرگرمی', amount: '400,000' },
      { name: 'کمک هزینه حمایت از خانواده', amount: '600,000' },
    ],
    deduction: '50,000',
    deductionReason: '1',
  },
  overtime: {
    regular: { minutes: '163', amount: '2,500,000' },
    friday: { minutes: '1', amount: '300,000' },
  },
  summary: {
    grossEarnings: '130,600,000',
    totalDeductions: '16,700,000',
    netPay: '113,900,000',
    totalBonus: '11,500,000',
    totalAllowance: '7,400,000',
    totalOvertime: '2,800,000',
    totalGrossPay: '152,300,000',
    totalPayments: '135,550,000',
  },
  legalCosts: [
    { item: 'بیمه سهم کارمند', amount: '7,000,000' },
    { item: 'بیمه سهم کارفرما', amount: '23,000,000' },
    { item: 'بیمه بیکاری سهم کارفرما', amount: '3,000,000' },
    { item: 'مالیات', amount: '8,500,000' },
  ],
}
</script>

<template>
  <VCard
    class="payslip-card"
    dir="rtl"
  >
    <VCardText>
      <!-- Header -->
      <VRow class="mb-4">
        <VCol cols="6">
          <h4 class="text-h4">
            فیش حقوقی
          </h4>
          <div class="text-body-1">
            شرکت نمونه
          </div>
        </VCol>
        <VCol
          cols="6"
          class="text-left"
        >
          <div class="d-flex justify-end">
            <img
              src="/src/assets/images/logo.svg"
              alt="logo"
              height="40"
            >
          </div>
          <div class="text-body-2 mt-2 text-left">
            تاریخ: {{ new Date().toLocaleDateString('fa-IR') }}
          </div>
        </VCol>
      </VRow>

      <VDivider class="my-4" />

      <!-- Employee Info -->
      <VRow class="mb-4">
        <VCol cols="6">
          <div class="d-flex align-center mb-2">
            <VIcon
              start
              icon="mdi-account-circle-outline"
            />
            <span class="font-weight-bold me-2">نام و نام خانوادگی:</span>
            <span>{{ payrollData.employee.name }}</span>
          </div>
          <div class="d-flex align-center">
            <VIcon
              start
              icon="mdi-card-account-details-outline"
            />
            <span class="font-weight-bold me-2">کد پرسنلی:</span>
            <span>{{ payrollData.employee.id }}</span>
          </div>
        </VCol>
        <VCol cols="6">
          <div class="d-flex align-center mb-2">
            <VIcon
              start
              icon="mdi-office-building-outline"
            />
            <span class="font-weight-bold me-2">واحد:</span>
            <span>{{ payrollData.employee.department }}</span>
          </div>
          <div class="d-flex align-center">
            <VIcon
              start
              icon="mdi-calendar-month-outline"
            />
            <span class="font-weight-bold me-2">سال و ماه:</span>
            <span>{{ payrollData.employee.year }} / {{ payrollData.employee.month }}</span>
          </div>
        </VCol>
      </VRow>

      <VDivider class="my-4" />

      <!-- Payments and Deductions -->
      <VRow>
        <VCol cols="6">
          <h5 class="text-h5 mb-3">
            پرداخت ها (ریال)
          </h5>
          <VTable density="compact">
            <thead>
              <tr>
                <th class="text-right">
                  شرح
                </th>
                <th class="text-left">
                  مبلغ
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="payment in payrollData.payments"
                :key="payment.item"
              >
                <td>{{ payment.item }}</td>
                <td class="text-left">
                  {{ payment.amount }}
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCol>
        <VCol cols="6">
          <h5 class="text-h5 mb-3">
            کسورات (ریال)
          </h5>
          <VTable density="compact">
            <thead>
              <tr>
                <th class="text-right">
                  شرح
                </th>
                <th class="text-left">
                  مبلغ
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="deduction in payrollData.deductions"
                :key="deduction.item"
              >
                <td>{{ deduction.item }}</td>
                <td class="text-left">
                  {{ deduction.amount }}
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCol>
      </VRow>

      <!-- Summary -->
      <VRow class="mt-4">
        <VCol cols="6">
          <VAlert
            color="success"
            variant="tonal"
          >
            <div class="d-flex justify-space-between align-center">
              <span class="font-weight-bold">جمع ناخالص پرداختی</span>
              <span class="font-weight-bold">{{ payrollData.summary.grossEarnings }} ریال</span>
            </div>
          </VAlert>
        </VCol>
        <VCol cols="6">
          <VAlert
            color="error"
            variant="tonal"
          >
            <div class="d-flex justify-space-between align-center">
              <span class="font-weight-bold">جمع کسورات</span>
              <span class="font-weight-bold">{{ payrollData.summary.totalDeductions }} ریال</span>
            </div>
          </VAlert>
        </VCol>
      </VRow>
      <VRow class="mt-4">
        <VCol cols="12">
          <VAlert
            color="primary"
            variant="elevated"
          >
            <div class="d-flex justify-space-between align-center text-h6">
              <span class="font-weight-bold">خالص پرداختی</span>
              <span class="font-weight-bold">{{ payrollData.summary.netPay }} ریال</span>
            </div>
          </VAlert>
        </VCol>
      </VRow>

      <VDivider class="my-6" />

      <!-- Additional Details -->
      <VRow>
        <!-- Bonuses -->
        <VCol cols="4">
          <h6 class="text-h6 mb-3">
            پاداش
          </h6>
          <VTable density="compact">
            <tbody>
              <tr
                v-for="bonus in payrollData.bonuses"
                :key="bonus.item"
              >
                <td>{{ bonus.item }}</td>
                <td class="text-left">
                  {{ bonus.amount }}
                </td>
              </tr>
              <tr class="font-weight-bold">
                <td>جمع پاداش</td>
                <td class="text-left">
                  {{ payrollData.summary.totalBonus }}
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCol>

        <!-- Allowances -->
        <VCol cols="4">
          <h6 class="text-h6 mb-3">
            فوق العاده
          </h6>
          <VTable density="compact">
            <tbody>
              <tr
                v-for="allowance in payrollData.allowances.items"
                :key="allowance.name"
              >
                <td>{{ allowance.name }}</td>
                <td class="text-left">
                  {{ allowance.amount }}
                </td>
              </tr>
              <tr class="font-weight-bold">
                <td>جمع فوق العاده</td>
                <td class="text-left">
                  {{ payrollData.summary.totalAllowance }}
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCol>

        <!-- Overtime -->
        <VCol cols="4">
          <h6 class="text-h6 mb-3">
            اضافه کاری
          </h6>
          <VTable density="compact">
            <tbody>
              <tr>
                <td>اضافه کاری (دقیقه: {{ payrollData.overtime.regular.minutes }})</td>
                <td class="text-left">
                  {{ payrollData.overtime.regular.amount }}
                </td>
              </tr>
              <tr>
                <td>جمعه کاری (دقیقه: {{ payrollData.overtime.friday.minutes }})</td>
                <td class="text-left">
                  {{ payrollData.overtime.friday.amount }}
                </td>
              </tr>
              <tr class="font-weight-bold">
                <td>جمع اضافه کاری</td>
                <td class="text-left">
                  {{ payrollData.summary.totalOvertime }}
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCol>
      </VRow>

      <VDivider class="my-6" />

      <!-- Final Summary & Legal Costs -->
      <VRow>
        <VCol cols="6">
          <h6 class="text-h6 mb-3">
            هزینه های قانونی
          </h6>
          <VTable density="compact">
            <tbody>
              <tr
                v-for="cost in payrollData.legalCosts"
                :key="cost.item"
              >
                <td>{{ cost.item }}</td>
                <td class="text-left">
                  {{ cost.amount }}
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCol>
        <VCol
          cols="6"
          class="d-flex flex-column justify-space-between"
        >
          <div>
            <h6 class="text-h6 mb-3">
              جمع ناخالص پرداختی کل
            </h6>
            <VAlert
              color="info"
              variant="tonal"
            >
              <div class="d-flex justify-space-between align-center">
                <span class="font-weight-bold">{{ payrollData.summary.totalGrossPay }} ریال</span>
              </div>
            </VAlert>
          </div>
          <div>
            <h6 class="text-h6 mb-3">
              جمع کل پرداخت ها
            </h6>
            <VAlert
              color="secondary"
              variant="tonal"
            >
              <div class="d-flex justify-space-between align-center">
                <span class="font-weight-bold">{{ payrollData.summary.totalPayments }} ریال</span>
              </div>
            </VAlert>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.payslip-card {
  direction: rtl;
  font-family: Vazirmatn, sans-serif;
}

.text-left {
  text-align: start;
}

.text-right {
  text-align: end;
}
</style>
