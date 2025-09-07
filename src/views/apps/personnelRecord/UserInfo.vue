<script setup>
defineProps({
  userData: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <VRow justify="center" class="mt-4">
    <VCol cols="12" sm="12" md="10" lg="8" xl="6">
      <VCard class="pa-4">
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
              {{ userData.full_name }}
            </p>
            <p class="mb-1">
              کد پرسنلی: <strong>{{ userData.personnel_code }}</strong>
            </p>
            <p class="mb-1">
              واحد: <strong>{{ userData.unit }}</strong>
            </p>
            <p class="mb-1">
              سمت شغلی: <strong>{{ userData.job_position }}</strong>
            </p>
            <p class="mb-1">
              تاریخ معرفی: <strong>{{ userData.introduced_date }}</strong>
            </p>
            <p class="mb-1">
              تاریخ استخدام: <strong>{{ userData.recruitment_date }}</strong>
            </p>
          </VCol>
        </VRow>
      </VCard>
    </VCol>
  </VRow>
</template>
