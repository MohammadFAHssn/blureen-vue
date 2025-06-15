<script setup>
const router = useRouter()

// --- Constants ---
const API_BASE_PATH = import.meta.env.VITE_API_LEGACY_INTEGRATED_SYSTEM

//
const userData = useCookie("userData")

const { data: apiData, error: apiError } = await useApi(
  createUrl(
    `${API_BASE_PATH}/tenderSMS/get-active-tenders-by-supplierId?supplier_id=${userData.value.id}`,
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
  <div>!!</div>
</template>
