<script setup>
defineProps({
  userData: {
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
})
function convertDate(date) {
  return (date && moment(date).isValid()) ? moment(date, 'YYYY-MM-DD').format('jYYYY/jM/jD') : '-'
}
</script>

<template>
  <VRow justify="center" class="mt-4">
    <VCol
      cols="12"
      sm="12"
      md="10"
      lg="8"
      xl="6"
    >
      <VSkeletonLoader v-if="isLoading" type="card" />
      <VCard v-else class="pa-4">
        <VRow>
          <!-- عکس پرسنل -->
          <VCol cols="12" sm="4" class="d-flex justify-center align-center">
            <VAvatar size="120">
              <img src="https://1shoo.ir/wp-content/themes/diako/assets/images/userman.svg" alt="عکس پرسنل" />
            </VAvatar>
          </VCol>

          <!-- اطلاعات فردی -->
          <VCol cols="12" sm="8">
            <p class="text-lg font-weight-bold mb-2">
              {{ userData ? userData.full_name : ' ' }}
            </p>
            <p class="mb-1">
              کد پرسنلی: <strong>{{ userData ? userData.personnel_code : '-' }}</strong>
            </p>
            <p class="mb-1">
              واحد: <strong>{{ userData ? userData.unit : '-' }}</strong>
            </p>
            <p class="mb-1">
              سمت شغلی: <strong>{{ userData ? userData.job_position : '-' }}</strong>
            </p>
            <p class="mb-1">
              مقطع تحصیلی: <strong>{{ userData ? userData.education_level : '-' }}</strong>
            </p>
            <p class="mb-1">
              تاریخ استخدام: <strong>{{ userData ? convertDate(userData.employment_date) : '-' }}</strong>
            </p>
          </VCol>
        </VRow>
      </VCard>
    </VCol>
  </VRow>
</template>
