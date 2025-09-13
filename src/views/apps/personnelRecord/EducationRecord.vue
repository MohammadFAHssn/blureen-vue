<script setup>
defineProps({
  educationData: {
    type: Object,
    required: true,
  },
  type: {
    required: true,
  },
})
function convertDate(date) {
  return (date && moment(date).isValid()) ? moment(date, 'YYYY-MM-DD').format('jYYYY/jM/jD') : '-'
}
</script>

<template>
  <!-- دسکتاپ: نمایش با جدول -->
  <VRow v-for="(trainings, index) in educationData" :key="index" class="d-none d-md-flex mt-3">
    <VCol cols="12" md="7">
      <VCard class="pa-4">
        <h4 class="mb-3">
          آموزش‌های واحد
        </h4>
        <table class="training-table">
          <thead>
            <tr>
              <th>تاریخ</th>
              <th>عنوان</th>
              <th>نوع</th>
              <th>اعتبارسنجی</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, unitTrainingIndex) in trainings.unit_training"
              :key="unitTrainingIndex"
            >
              <td>{{ item.date }}</td>
              <td>{{ item.title }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.validation }}</td>
            </tr>
          </tbody>
        </table>
      </VCard>
    </VCol>

    <VCol cols="12" md="5">
      <VCard class="pa-4">
        <h4 class="mb-3">
          آموزش‌های ایمنی
        </h4>
        <table class="training-table">
          <thead>
            <tr>
              <th>تاریخ</th>
              <th>عنوان</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, hseTrainingIndex) in trainings.hse_training"
              :key="hseTrainingIndex"
            >
              <td>{{ item.date }}</td>
              <td>{{ item.title }}</td>
            </tr>
          </tbody>
        </table>
      </VCard>
    </VCol>
  </VRow>

  <!-- موبایل: نمایش لیست در کارت جدا -->
  <VRow v-for="(trainings, index) in educationData" :key="index" class="d-flex d-md-none">
    <VCol cols="12">
      <VCard class="pa-4 mb-4">
        <h3 class="mb-3">
          آموزش‌های واحد
        </h3>
        <div
          v-for="(item, unitTrainingIndex) in trainings.unit_training"
          :key="unitTrainingIndex"
          class="mobile-training-row"
          :class="{
            'last-row':
              index === item.length - 1,
          }"
        >
          <p><strong>تاریخ:</strong> {{ convertDate(item.date) }}</p>
          <p><strong>عنوان:</strong> {{ item.title }}</p>
          <p><strong>نوع:</strong> {{ item.type }}</p>
          <p><strong>اعتبارسنجی:</strong> {{ item.validation }}</p>
        </div>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard class="pa-4">
        <h3 class="mb-3">
          آموزش‌های ایمنی
        </h3>
        <div
          v-for="(item, hseTrainingIndex) in trainings.hse_training"
          :key="hseTrainingIndex"
          class="mobile-training-row"
          :class="{
            'last-row':
              index === item.length - 1,
          }"
        >
          <p><strong>تاریخ:</strong> {{ convertDate(item.date) }}</p>
          <p><strong>عنوان:</strong> {{ item.title }}</p>
        </div>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.training-table {
  width: 100%;
  border-collapse: collapse;
}
.training-table th,
.training-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.training-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.mobile-training-row {
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}
.mobile-training-row.last-row {
  border-bottom: none;
}
</style>
