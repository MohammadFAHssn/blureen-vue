<script setup>
defineProps({
  assessmentData: {
    type: Array,
    required: true,
  },
})
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
              <th>ماه</th>
              <th>سال</th>
              <th>امتیاز مدیر</th>
              <th>نتیجه مدیر</th>
              <th>امتیاز حضور</th>
              <th>امتیاز انضباط</th>
              <th>امتیاز ایمنی</th>
              <th>امتیاز امنیت</th>
              <th>امتیاز نهایی</th>
              <th>نتیجه نهایی</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in assessmentData" :key="index">
              <td>{{ item.assessment_period }}</td>
              <td>{{ item.assessment_month }}</td>
              <td>{{ item.assessment_year }}</td>
              <td>{{ item.manager_assessment_score }}</td>
              <td>{{ item.manager_assessment_result }}</td>
              <td>{{ item.attendance_score }}</td>
              <td>{{ item.disciplinary_score }}</td>
              <td>{{ item.hse_score }}</td>
              <td>{{ item.security_score }}</td>
              <td>{{ item.final_score }}</td>
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
          <strong>ماه/سال:</strong> {{ item.assessment_month }}/{{ item.assessment_year }}
        </p>
        <p>
          <strong>امتیاز مدیر:</strong>
          {{ item.manager_assessment_score }} ({{ item.manager_assessment_result }})
        </p>
        <p><strong>امتیاز حضور:</strong> {{ item.attendance_score }}</p>
        <p><strong>امتیاز انضباط:</strong> {{ item.disciplinary_score }}</p>
        <p><strong>امتیاز ایمنی:</strong> {{ item.hse_score }}</p>
        <p><strong>امتیاز امنیت:</strong> {{ item.security_score }}</p>
        <p>
          <strong>امتیاز نهایی:</strong> {{ item.final_score }} - {{ item.final_result }}
        </p>
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
