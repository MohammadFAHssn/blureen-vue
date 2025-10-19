<script setup>
import jalaali from 'jalaali-js'

definePage({
  meta: { layoutWrapperClasses: 'layout-content-height-fixed' },
})

const uiState = reactive({
  isImageDialogVisible: false,
})

const pendingState = reactive({
  fetchingHealthCertificateImage: false,
})

const healthCertificatePeriod = ref('')
const selectedImage = ref('')
const year = computed(() => healthCertificatePeriod.value)

async function fetchLatestHealthCertificateImage(year = null) {
  pendingState.fetchingHealthCertificateImage = true
  selectedImage.value = ''
  try {
    const res = await $api('/hse/health-certificate/user/image', {
      params: { year },
    })
    selectedImage.value = res.data ?? res
  }
  catch (e) {
    console.error(e)
    selectedImage.value = ''
  }
  finally {
    pendingState.fetchingHealthCertificateImage = false
  }
}

onMounted(async () => {
  const d = new Date()
  const jYear = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate()).jy
  healthCertificatePeriod.value = jYear
  await fetchLatestHealthCertificateImage(jYear)
})
</script>

<template>
  <div class="flex-grow-1 overflow-y-auto pb-8">
    <VRow justify="center">
      <VCol cols="12" sm="6" md="4">
        <VInput>
          <PersianDatetimePicker
            v-model="healthCertificatePeriod"
            type="year"
            simple
            label="دوره"
            @change="() => fetchLatestHealthCertificateImage(year)"
          />
        </VInput>
      </VCol>
    </VRow>

    <VRow justify="center">
      <VCol cols="12" sm="6" md="4">
        <!-- Loading state -->
        <VCard v-if="pendingState.fetchingHealthCertificateImage" class="text-center">
          <VCardText>
            <VProgressCircular indeterminate color="primary" />
          </VCardText>
        </VCard>

        <!-- Image exists -->
        <VCard v-else-if="selectedImage" class="text-center">
          <VImg
            :src="selectedImage"
            cover
            height="100%"
            class="cursor-pointer"
            @click="uiState.isImageDialogVisible = true"
          />
          <VCardTitle>{{ year }}</VCardTitle>
          <VBtn
            :href="selectedImage"
            download
            color="primary"
            variant="flat"
            class="mb-2"
            :disabled="pendingState.fetchingHealthCertificateImage"
          >
            دانلود
          </VBtn>
        </VCard>

        <!-- Image does not exist -->
        <VCard v-else class="text-center">
          تصویر در دسترس نیست
        </VCard>
      </VCol>
    </VRow>

    <VDialog v-model="uiState.isImageDialogVisible" width="1000">
      <VCard>
        <VCardText class="text-center">
          <VImg :src="selectedImage" />
        </VCardText>
        <VCardActions class="justify-center">
          <VBtn @click="uiState.isImageDialogVisible = false">
            بستن
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
:deep(.v-input__control) {
  justify-content: center;
}
</style>
