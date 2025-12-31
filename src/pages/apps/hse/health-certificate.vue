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
  downloadingHealthCertificate: false,
})

const storageBase = import.meta.env.VITE_STORAGE_BASE_URL

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

async function downloadHealthCertificateImage() {
  if (!selectedImage.value) return

  pendingState.downloadingHealthCertificate = true

  try {
    const res = await $api('/hse/health-certificate/user/image/download', {
      params: { year: year.value },
      responseType: 'blob',
    })

    const responseData = res.data ?? res
    const headers = (res.headers ?? res?.headers) ?? {}

    const contentType = headers['content-type'] ?? headers['Content-Type'] ?? 'application/octet-stream'
    const blob = new Blob([responseData], { type: contentType })
    const downloadUrl = URL.createObjectURL(blob)

    // DEFAULT filename with .jpg suffix (fixed)
    let filename = `health-certificate-${year.value || 'latest'}.jpg`

    const contentDisposition = headers['content-disposition'] ?? headers['Content-Disposition']
    if (contentDisposition) {
      const match = /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i.exec(contentDisposition)
      if (match && match[1]) {
        try {
          filename = decodeURIComponent(match[1])
        }
        catch {
          filename = match[1]
        }
      }
    }

    // fallback: use last segment of public URL if possible
    if (!filename || filename === '') {
      try {
        const urlObj = new URL(selectedImage.value, window.location.origin)
        const pathParts = urlObj.pathname.split('/')
        const lastPart = pathParts[pathParts.length - 1]
        if (lastPart) filename = lastPart
      }
      catch {
        console.error('error in filename')
      }
    }

    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(downloadUrl)
  }
  catch (downloadErr) {
    console.error(downloadErr)
  }
  finally {
    pendingState.downloadingHealthCertificate = false
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
  <VContainer>
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
            :src="`${storageBase}/${selectedImage}`"
            cover
            height="100%"
            class="cursor-pointer"
            @click="uiState.isImageDialogVisible = true"
          />
          <VCardTitle>{{ year }}</VCardTitle>
          <VBtn
            color="primary"
            variant="flat"
            class="mb-2"
            :disabled="pendingState.fetchingHealthCertificateImage || pendingState.downloadingHealthCertificate"
            @click="downloadHealthCertificateImage"
          >
            <VProgressCircular v-if="pendingState.downloadingHealthCertificate" indeterminate size="18" />
            <div v-else>
              دانلود
            </div>
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
          <VImg :src="`${storageBase}/${selectedImage}`" />
        </VCardText>
        <VCardActions class="justify-center">
          <VBtn @click="uiState.isImageDialogVisible = false">
            بستن
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<style scoped>
:deep(.v-input__control) {
  justify-content: center;
}
</style>
