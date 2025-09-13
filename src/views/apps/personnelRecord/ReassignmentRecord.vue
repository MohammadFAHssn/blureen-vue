<script setup>
defineProps({
  reassignmentData: {
    type: Array,
    required: true,
  },
})
function convertDate(date) {
  return (date && moment(date).isValid()) ? moment(date, 'YYYY-MM-DD').format('jYYYY/jM/jD') : '-'
}
</script>

<template>
  <!-- نمایش برای دسکتاپ (جدول) -->
  <VRow class="d-none d-md-flex ">
    <VCol cols="12">
      <VCard class="pa-4">
        <table class="transfer-table">
          <thead>
            <tr>
              <th>تاریخ جابجایی</th>
              <th>واحد قبلی</th>
              <th>محل کار</th>
              <th>حوزه کاری</th>
              <th>واحد جدید</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in reassignmentData" :key="index">
              <td>{{ convertDate(item.reassignment_date) }}</td>
              <td>{{ item.old_unit }}</td>
              <td>{{ item.workplace }}</td>
              <td>{{ item.work_aria }}</td>
              <td>{{ item.new_unit }}</td>
            </tr>
          </tbody>
        </table>
      </VCard>
    </VCol>
  </VRow>

  <!-- نمایش برای موبایل (Card-based) -->
  <VRow class="d-flex d-md-none mt-6">
    <VCol v-for="(item, index) in reassignmentData" :key="index" cols="12">
      <VCard class="pa-4 mb-3">
        <p><strong>تاریخ جابجایی:</strong> {{ convertDate(item.reassignment_date) }}</p>
        <p><strong>واحد قبلی:</strong> {{ item.old_unit }}</p>
        <p><strong>محل کار:</strong> {{ item.workplace }}</p>
        <p><strong>حوزه کاری:</strong> {{ item.work_aria }}</p>
        <p><strong>واحد جدید:</strong> {{ item.new_unit }}</p>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.transfer-table {
  width: 100%;
  border-collapse: collapse;
}
.transfer-table th,
.transfer-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.transfer-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}
</style>
