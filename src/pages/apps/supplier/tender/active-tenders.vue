<script setup>
const router = useRouter()

//
const userData = useCookie("userData")

// --- States ---
const hasError = ref(false)
const errorMessage = ref("")

let tenders

const { data: apiData, error: apiError } = await useApi(
  createUrl(
    `/commerce/tender/get-actives?supplier_id=${userData.value.username}`,
  ),
)

if (apiError.value) {
  hasError.value = true
  errorMessage.value = apiError.value.message || "خطایی رخ داده‌است."
}

if (apiData.value) {
  tenders = apiData.value.data
}
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

  <VRow v-if="apiData">
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
