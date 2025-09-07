<script setup>
const router = useRouter()

//
const userData = useCookie('userData')

// --- States ---

const uiState = reactive({
  hasError: false,
  errorMessage: '',
})

const tenders = ref([])

// --- Methods ---
async function fetchTenders() {
  try {
    const { data, error } = await useApi(
      createUrl(
        `/commerce/tender/get-actives?supplier_id=${userData.value.username}`,
      ),
    )

    if (error.value) throw error.value

    tenders.value = data.value.data
  }
  catch (e) {
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت مناقصات فعال'
  }
}

await fetchTenders()
</script>

<template>
  <VSnackbar
    v-model="uiState.hasError"
    :timeout="2000"
    location="center"
    variant="flat"
    color="error"
  >
    {{ uiState.errorMessage }}
  </VSnackbar>

  <VRow>
    <VCol v-for="tender in tenders" :key="tender.id" cols="12" md="6" lg="4">
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
