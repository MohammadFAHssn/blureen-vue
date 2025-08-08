<script setup>
import { computed } from 'vue'

// Mock props/data – replace with real API data when available
const company = 'گروه کارخانجات شیشه اردکان'
const period = { month: 'فروردین', year: '1404' }
const employee = {
  fullName: 'محمد حسنی احمدآبادی',
  code: '6649',
  unit: 'واحد برنامه‌نویسی',
  group: '6',
}

// Tables
const payments = [
  { label: 'حقوق پایه', amount: 250000000 },
  { label: 'حق مسکن', amount: 9000000 },
  { label: 'خواربار', amount: 11000000 },
  { label: 'حق تاهل', amount: 5000000 },
  { label: 'بن کارگری', amount: 15000000 },
  { label: 'پایه سنوات', amount: 3500000 },
]

const deductions = [
  { label: 'بیمه سهم کارمند', amount: 38000000 },
  { label: 'مالیات ماه', amount: 27000000 },
  { label: 'بیمه تکمیلی', amount: 6000000 },
  { label: 'کسر جاری کارکنان', amount: 4000000 },
]

const otherInfo = [
  { label: 'دقیقه کارکرد عادی', value: 176 * 60 },
]

const bonuses = [
  { label: 'پاداش شناور فردی (ارزیابی)', amount: 12000000 },
  { label: 'پاداش شناور گروهی (بهره‌وری)', amount: 10000000 },
  { label: 'پاداش شناور مدیر واحد', amount: 8000000 },
  { label: 'فوق‌العاده بهره‌وری', amount: 5000000 },
]

const allowances = {
  items: [
    { label: 'فوق‌العاده', amount: 9000000 },
    { label: 'ماندگاری', amount: 7000000 },
    { label: 'پاداش فنی', amount: 6000000 },
    { label: 'فوق‌العاده مدیریت', amount: 4000000 },
    { label: 'رفاهیات', amount: 3000000 },
    { label: 'کمک هزینه درمان', amount: 2500000 },
    { label: 'کمک هزینه سفر', amount: 2000000 },
  ],
  deduction: 1500000, // کسورات فوق‌العاده
  deductionReason: 'بازپرداخت مساعده',
}

const overtime = {
  minutes: 163,
  amount: 4500000,
  fridayMinutes: 60,
  fridayAmount: 1800000,
}

const legalCosts = [
  { label: 'بیمه سهم کارمند', amount: 38000000 },
  { label: 'بیمه سهم کارفرما', amount: 76000000 },
  { label: 'بیمه بیکاری سهم کارفرما', amount: 12000000 },
  { label: 'مالیات', amount: 27000000 },
]

// Computations
const sum = arr => arr.reduce((acc, cur) => acc + (cur.amount || 0), 0)
const paymentsTotal = computed(() => sum(payments))
const deductionsTotal = computed(() => sum(deductions))
const bonusesTotal = computed(() => sum(bonuses))
const allowancesTotal = computed(() => sum(allowances.items))
const overtimeTotal = computed(() => (overtime.amount || 0) + (overtime.fridayAmount || 0))

const grossTotal = computed(
  () => paymentsTotal.value + bonusesTotal.value + allowancesTotal.value + overtimeTotal.value,
)

const totalDeductions = computed(() => deductionsTotal.value + (allowances.deduction || 0))
const netPay = computed(() => grossTotal.value - totalDeductions.value)

// Utils
function formatCurrency(v) {
  return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(v)
}

const onPrint = () => window.print()
</script>

<template>
  <section class="payroll-slip-container">
    <section class="payroll-slip-a4-page elevation-1">
      <!-- Header -->
      <header class="text-center py-4">
        <h1 class="mb-2">
          {{ company }}
        </h1>
        <div class="d-flex justify-center align-center gap-x-3 text-primary">
          <VChip color="primary" variant="tonal">
            فیش حقوقی
          </VChip>
          <VChip color="primary" variant="flat">
            {{ period.month }}
          </VChip>
          <VChip color="primary" variant="flat">
            {{ period.year }}
          </VChip>
        </div>
      </header>

      <!-- Employee Info -->
      <VCard class="mb-4" variant="tonal">
        <VCardText class="d-flex align-center flex-wrap gap-6">
          <div class="d-flex align-center gap-2">
            <VIcon color="primary" icon="tabler-user" size="22" />
            <span>نام و نام خانوادگی:</span>
            <strong>{{ employee.fullName }}</strong>
          </div>
          <VDivider vertical :thickness="1" class="mx-2" />
          <div class="d-flex align-center gap-2">
            <VIcon color="primary" icon="tabler-id" size="22" />
            <span>کد پرسنلی:</span>
            <strong>{{ employee.code }}</strong>
          </div>
          <VDivider vertical :thickness="1" class="mx-2" />
          <div class="d-flex align-center gap-2">
            <VIcon color="primary" icon="tabler-building" size="22" />
            <span>واحد:</span>
            <strong>{{ employee.unit }}</strong>
          </div>
          <VDivider vertical :thickness="1" class="mx-2" />
          <div class="d-flex align-center gap-2">
            <VIcon color="primary" icon="tabler-star" size="22" />
            <span>گروه:</span>
            <strong>{{ employee.group }}</strong>
          </div>
        </VCardText>
      </VCard>

      <!-- Main tables: Payments / Deductions / Other info -->
      <VRow>
        <!-- Payments -->
        <VCol cols="12" md="5">
          <VCard>
            <VCardItem class="py-3">
              <template #prepend>
                <VAvatar color="success" variant="tonal" rounded icon="tabler-cash" />
              </template>
              <VCardTitle>پرداخت‌ها</VCardTitle>
              <VCardSubtitle>ریال</VCardSubtitle>
            </VCardItem>
            <VCardText>
              <VTable density="compact">
                <thead>
                  <tr>
                    <th scope="col">
                      عنوان
                    </th>
                    <th scope="col" class="text-left">
                      مبلغ (ریال)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in payments" :key="row.label">
                    <td>
                      {{ row.label }}
                    </td>
                    <td class="text-left">
                      {{ formatCurrency(row.amount) }}
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Deductions -->
        <VCol cols="12" md="5">
          <VCard>
            <VCardItem class="py-3">
              <template #prepend>
                <VAvatar color="error" variant="tonal" rounded icon="tabler-cash-off" />
              </template>
              <VCardTitle>کسورات</VCardTitle>
              <VCardSubtitle>ریال</VCardSubtitle>
            </VCardItem>
            <VCardText>
              <VTable density="compact">
                <thead>
                  <tr>
                    <th scope="col">
                      عنوان
                    </th>
                    <th scope="col" class="text-left">
                      مبلغ (ریال)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in deductions" :key="row.label">
                    <td>
                      {{ row.label }}
                    </td>
                    <td class="text-left">
                      {{ formatCurrency(row.amount) }}
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Other info -->
        <VCol cols="12" md="2">
          <VCard>
            <VCardItem class="py-3">
              <template #prepend>
                <VAvatar color="info" variant="tonal" rounded icon="tabler-info-circle" />
              </template>
              <VCardTitle>سایر اطلاعات</VCardTitle>
            </VCardItem>
            <VCardText>
              <VTable density="compact">
                <thead>
                  <tr>
                    <th scope="col">
                      شرح
                    </th>
                    <th scope="col" class="text-left">
                      مقدار
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in otherInfo" :key="row.label">
                    <td>
                      {{ row.label }}
                    </td>
                    <td class="text-left">
                      {{ row.value }}
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Summary cards -->
      <VRow class="mt-2">
        <VCol cols="12" md="4">
          <VCard color="primary" variant="tonal">
            <VCardText class="d-flex justify-space-between align-center">
              <div class="text-body-1">
                جمع ناخالص پرداختی
              </div>
              <div class="text-h6">
                {{ formatCurrency(grossTotal) }}
              </div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" md="4">
          <VCard color="error" variant="tonal">
            <VCardText class="d-flex justify-space-between align-center">
              <div class="text-body-1">
                جمع کسورات
              </div>
              <div class="text-h6">
                {{ formatCurrency(totalDeductions) }}
              </div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" md="4">
          <VCard color="success" variant="tonal">
            <VCardText class="d-flex justify-space-between align-center">
              <div class="text-body-1">
                خالص پرداختی
              </div>
              <div class="text-h6">
                {{ formatCurrency(netPay) }}
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Bonuses -->
      <VRow class="mt-4">
        <VCol cols="12" md="6">
          <VCard>
            <VCardItem class="py-3">
              <template #prepend>
                <VAvatar color="warning" variant="tonal" rounded icon="tabler-award" />
              </template>
              <VCardTitle>پاداش</VCardTitle>
            </VCardItem>
            <VCardText>
              <VTable density="compact">
                <thead>
                  <tr>
                    <th scope="col">
                      عنوان
                    </th>
                    <th scope="col" class="text-left">
                      مبلغ (ریال)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in bonuses" :key="row.label">
                    <td>{{ row.label }}</td>
                    <td class="text-left">
                      {{ formatCurrency(row.amount) }}
                    </td>
                  </tr>
                </tbody>
              </VTable>
              <div class="d-flex justify-space-between align-center mt-3">
                <span class="text-high-emphasis">جمع پاداش</span>
                <strong>
                  {{ formatCurrency(bonusesTotal) }}
                </strong>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Allowances -->
        <VCol cols="12" md="6">
          <VCard>
            <VCardItem class="py-3">
              <template #prepend>
                <VAvatar color="secondary" variant="tonal" rounded icon="tabler-gift" />
              </template>
              <VCardTitle>فوق‌العاده‌ها و رفاهیات</VCardTitle>
            </VCardItem>
            <VCardText>
              <VTable density="compact">
                <thead>
                  <tr>
                    <th scope="col">
                      عنوان
                    </th>
                    <th scope="col" class="text-left">
                      مبلغ (ریال)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in allowances.items" :key="row.label">
                    <td>
                      {{ row.label }}
                    </td>
                    <td class="text-left">
                      {{ formatCurrency(row.amount) }}
                    </td>
                  </tr>
                </tbody>
              </VTable>

              <VRow class="mt-3" align="center">
                <VCol cols="12" md="6">
                  <div class="d-flex justify-space-between align-center">
                    <span>کسورات فوق‌العاده:</span>
                    <strong>
                      {{ formatCurrency(allowances.deduction) }}
                    </strong>
                  </div>
                </VCol>
                <VCol cols="12" md="6">
                  <div class="d-flex justify-space-between align-center">
                    <span>علت کسر:</span>
                    <span>{{ allowances.deductionReason }}</span>
                  </div>
                </VCol>
              </VRow>

              <div class="d-flex justify-space-between align-center mt-3">
                <span class="text-high-emphasis">جمع فوق‌العاده</span>
                <strong>
                  {{ formatCurrency(allowancesTotal) }}
                </strong>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Overtime -->
      <VRow class="mt-4">
        <VCol cols="12" md="6">
          <VCard>
            <VCardItem class="py-3">
              <template #prepend>
                <VAvatar color="info" variant="tonal" rounded icon="tabler-clock" />
              </template>
              <VCardTitle>اضافه‌کاری</VCardTitle>
            </VCardItem>
            <VCardText>
              <VTable density="compact">
                <tbody>
                  <tr>
                    <td>دقیقه اضافه‌کاری</td>
                    <td class="text-left">
                      {{ overtime.minutes }}
                    </td>
                  </tr>
                  <tr>
                    <td>مبلغ</td>
                    <td class="text-left">
                      {{ formatCurrency(overtime.amount) }}
                    </td>
                  </tr>
                  <tr>
                    <td>دقیقه جمعه‌کاری</td>
                    <td class="text-left">
                      {{ overtime.fridayMinutes }}
                    </td>
                  </tr>
                  <tr>
                    <td>مبلغ</td>
                    <td class="text-left">
                      {{ formatCurrency(overtime.fridayAmount) }}
                    </td>
                  </tr>
                </tbody>
              </VTable>
              <div class="d-flex justify-space-between align-center mt-3">
                <span class="text-high-emphasis">جمع اضافه‌کاری</span>
                <strong>
                  {{ formatCurrency(overtimeTotal) }}
                </strong>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Legal costs and aggregate gross -->
        <VCol cols="12" md="6">
          <VCard>
            <VCardItem class="py-3">
              <template #prepend>
                <VAvatar color="primary" variant="tonal" rounded icon="tabler-scale" />
              </template>
              <VCardTitle>
                جمع ناخالص پرداختی (حقوق، پاداش، فوق‌العاده، اضافه‌کاری)
              </VCardTitle>
            </VCardItem>
            <VCardText>
              <div class="d-flex justify-space-between align-center mb-4">
                <span>جمع ناخالص</span>
                <strong>
                  {{ formatCurrency(grossTotal) }}
                </strong>
              </div>
              <VTable density="compact">
                <thead>
                  <tr>
                    <th scope="col">
                      هزینه‌های قانونی
                    </th>
                    <th scope="col" class="text-left">
                      مبلغ (ریال)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in legalCosts" :key="row.label">
                    <td>
                      {{ row.label }}
                    </td>
                    <td class="text-left">
                      {{ formatCurrency(row.amount) }}
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Footer total -->
      <VCard class="mt-4" color="primary" variant="tonal">
        <VCardText class="d-flex justify-space-between align-center">
          <div>
            جمع کل پرداخت‌ها
          </div>
          <div class="text-h5">
            {{ formatCurrency(grossTotal) }}
          </div>
        </VCardText>
      </VCard>

      <!-- Action bar: Print -->
      <div class="d-flex justify-end mt-6 no-print">
        <VBtn color="primary" prepend-icon="tabler-printer" @click="onPrint">
          چاپ فیش
        </VBtn>
      </div>
    </section>
  </section>
</template>

<style scoped>
.payroll-slip-container {
  direction: rtl;
  padding-block: 16px;
  padding-inline: 16px;
}

.payroll-slip-a4-page {
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  inline-size: 210mm;
  margin-inline: auto;
  min-block-size: 297mm;
  padding-block: 20px;
  padding-inline: 20px;
}

h1 {
  margin: 0;
  font-size: 18pt;
}

@media print {
  .no-print {
    display: none !important;
  }

  .payroll-slip-container {
    background: white;
    padding-block: 0;
    padding-inline: 0;
  }

  .payroll-slip-a4-page {
    border-radius: 0;
    margin: 0;
    box-shadow: none !important;
    inline-size: 100%;
    min-block-size: auto;
    padding-block: 0;
    padding-inline: 8mm;
  }
}
</style>
