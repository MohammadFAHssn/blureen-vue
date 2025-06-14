<script setup>
const router = useRouter()

const tenders = [
  {
    id: 1,
    title: "مناقصه برای لوازم اداری",
    token: "09d5dc2e4b3705b5b8f718a88cc07885",
  },
  {
    id: 2,
    title: "مناقصه برای تجهیزات کامپیوتری",
    token: "09d5dc2e4b3705b5b8f718a88cc07885",
  },
  {
    id: 3,
    title: "مناقصه برای خدمات نظافتی",
    token: "09d5dc2e4b3705b5b8f718a88cc07885",
  },
]
</script>

<template>
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
