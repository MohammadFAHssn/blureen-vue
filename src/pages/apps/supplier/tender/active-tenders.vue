<script setup>
const router = useRouter()

// --- Constants ---
const API_BASE_PATH = import.meta.env.VITE_API_LEGACY_INTEGRATED_SYSTEM

//
const userData = useCookie("userData")

const { data: apiData, error: apiError } = await useApi(
  createUrl(
    `${API_BASE_PATH}/tenderSMS/get-active-tenders-by-supplierId?supplierId=${userData.value.id}`,
  ),
)

if (apiError.value) {
  hasError.value = true
  errorMessage.value = apiError.value.message || "خطا در دریافت اطلاعات."
}

const tenders = apiData.value.data
</script>

<template>
  <VSnackbar
    v-model="hasError"
    :timeout="2000"
    location="center"
    variant="flat"
    color="error"
  >
    {{ errorMessage }}
  </VSnackbar>

  <VRow>
    <VCol
      v-for="tender in tenders"
      :key="tender.id"
      cols="12"
      md="6"
      lg="4"
    >
      <VCard class="text-center">
        <VCardItem>
          <VCardTitle>{{ tender.title }}</VCardTitle>
        </VCardItem>

        <VCardText class="justify-center">
          <VBtn
            @click="
              router.push({
                name: 'apps-supplier-token',
                params: { token: tender.token },
              })
            "
          >
            ورود به مناقصه
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
