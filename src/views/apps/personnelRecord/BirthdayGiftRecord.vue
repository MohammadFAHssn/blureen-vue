<script setup>
defineProps({
  birthdayGifts: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <VRow class="m3-3">
    <VCol cols="12">
      <h3 class="text-lg font-weight-bold">
        🎁سامانه هدایای تولد
      </h3>
    </VCol>
  </VRow>
  <!-- نمایش برای دسکتاپ (جدول) -->
  <VRow class="d-none d-md-flex mt-6">
    <VCol cols="12">
      <VCard class="pa-4">
        <table class="gift-table">
          <thead>
            <tr>
              <th>سال</th>
              <th>ماه</th>
              <th>هدیه</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in birthdayGifts" :key="index">
              <td>{{ item.year }}</td>
              <td>{{ item.month }}</td>
              <td>{{ item.gift }}</td>
            </tr>
          </tbody>
        </table>
      </VCard>
    </VCol>
  </VRow>

  <!-- نمایش برای موبایل (Card-based) -->
  <VRow class="d-flex d-md-none mt-6">
    <VCol v-for="(item, index) in birthdayGifts" :key="index" cols="12">
      <VCard class="pa-4 mb-3">
        <p><strong>سال:</strong> {{ item.year }}</p>
        <p><strong>ماه:</strong> {{ item.month }}</p>
        <p><strong>هدیه:</strong> {{ item.gift }}</p>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.gift-table {
  width: 100%;
  border-collapse: collapse;
}
.gift-table th,
.gift-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.gift-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}
</style>
