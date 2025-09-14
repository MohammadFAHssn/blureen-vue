<script setup>
defineProps({
  assessmentData: {
    type: Array,
    required: true,
  },
})
function strToFloat(value) {
  if (value === null || value === undefined || value === '') return '-'
  const num = Number.parseFloat(value)
  if (Number.isNaN(num)) return '-'
  return Number.parseFloat(num.toFixed(2))
}
</script>

<template>
  <!-- نمایش برای دسکتاپ (جدول) -->
  <VRow class="d-none d-md-flex">
    <VCol cols="12">
      <VCard class="pa-4">
        <table class="assessment-table">
          <thead>
            <tr>
              <th>دوره</th>
              <th>سال</th>
              <th>ماه</th>
              <th>جایگاه در واحد</th>
              <th>ارزیابی مدیر</th>
              <th>مدیر</th>
              <th>میدانی</th>
              <th>کارگزینی</th>
              <th>کمیته انضباطی</th>
              <th>HSE</th>
              <th>انتظامات</th>
              <th>مانیتورینگ</th>
              <th>خودارزیابی</th>
              <th>امتیاز نهایی</th>
              <th>نتیجه نهایی</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in assessmentData" :key="index">
              <td>{{ item.assessment_period }}</td>
              <td>{{ item.assessment_year }}</td>
              <td>{{ item.assessment_month }}</td>
              <td>{{ item.personnel_rank_status }}</td>
              <td>{{ item.manager_assessment_result }}</td>
              <td>{{ strToFloat(item.manager_assessment_score) }}</td>
              <td>{{ strToFloat(item.field_assessment_score) }}</td>
              <td>{{ strToFloat(item.attendance_score) }}</td>
              <td>{{ strToFloat(item.disciplinary_score) }}</td>
              <td>{{ strToFloat(item.hse_score) }}</td>
              <td>{{ strToFloat(item.security_score) }}</td>
              <td>{{ strToFloat(item.monitoring_score) }}</td>
              <td>{{ strToFloat(item.self_assessment_score) }}</td>
              <td>{{ strToFloat(item.final_score) }}</td>
              <td>{{ item.final_result }}</td>
            </tr>
          </tbody>
        </table>
      </VCard>
    </VCol>
  </VRow>

  <!-- نمایش برای موبایل (Card-based) -->
  <VRow class="d-flex d-md-none mt-6">
    <VCol v-for="(item, index) in assessmentData" :key="index" cols="12">
      <VCard class="pa-4 mb-4">
        <p><strong>دوره:</strong> {{ item.assessment_period }}</p>
        <p>
          <strong>ماه/سال:</strong> {{ item.assessment_year }}/{{ item.assessment_month }}
        </p>
        <p><strong>جایگاه در واحد: </strong>{{ item.personnel_rank_status }}</p>
        <p>
          <strong>امتیاز مدیر:</strong>
          {{ item.manager_assessment_score }} ({{ item.manager_assessment_result }})
        </p>
        <p><strong>امتیاز میدانی: </strong> {{ strToFloat(item.field_assessment_score) }}</p>
        <p><strong>امتیاز کارگزینی: </strong> {{ strToFloat(item.attendance_score) }}</p>
        <p><strong>امتیاز کمیته انضباطی: </strong> {{ strToFloat(item.disciplinary_score) }}</p>
        <p><strong>امتیاز ایمنی: </strong> {{ strToFloat(item.hse_score) }}</p>
        <p><strong>امتیاز انتظامات: </strong> {{ strToFloat(item.security_score) }}</p>
        <p><strong>امتیاز مانیتورینگ: </strong> {{ strToFloat(item.monitoring_score) }}</p>
        <p><strong>امتیاز خودارزیابی: </strong> {{ strToFloat(item.self_assessment_score) }}</p>
        <p><strong>امتیاز نهایی: </strong> {{ strToFloat(item.final_score) }}</p>
        <p><strong>نتیجه نهایی: </strong> {{ item.final_result }}</p>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.assessment-table {
  width: 100%;
  border-collapse: collapse;
}
.assessment-table th,
.assessment-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.assessment-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}
</style>
