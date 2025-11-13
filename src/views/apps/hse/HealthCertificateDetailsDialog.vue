<script setup>
const props = defineProps({
  file: Object,
  loading: Boolean,
  isDialogVisible: Boolean,
})
const emit = defineEmits(['update:isDialogVisible'])

// local states
const pendingState = reactive({
  fetchingHealthCertificateUsers: false,
})
const healthCertificateUsers = ref([])
const uiState = reactive({
  hasError: false,
  message: '',
})

// functions
async function fetchHealthCertificateUsers(id) {
  if (!id) return
  pendingState.fetchingHealthCertificateUsers = true
  try {
    const res = await $api(`/hse/health-certificate/file/${id}`, { method: 'GET' })
    healthCertificateUsers.value = res?.data ?? []
    uiState.hasError = false
    uiState.message = ''
  }
  catch (e) {
    console.error('fetchHealthCertificateUsers error:', e)
    uiState.hasError = true
    uiState.message = e?.message ?? 'خطا در دریافت کاربران'
    healthCertificateUsers.value = []
  }
  finally {
    pendingState.fetchingHealthCertificateUsers = false
  }
}

watch(
  () => props.file?.id,
  (id) => {
    if (id) fetchHealthCertificateUsers(id)
    else healthCertificateUsers.value = []
  },
  { immediate: true },
)
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    @update:model-value="emit('update:isDialogVisible', $event)"
  >
    <VCard>
      <VCardTitle class="text-h6 text-center">
        کاربران دوره شناسنامه: {{ props.file.name }}
      </VCardTitle>

      <VCardText class="scrollable-content">
        <div v-if="pendingState.fetchingHealthCertificateUsers" class="d-flex justify-center align-center h-100">
          <VProgressCircular indeterminate color="primary" size="64" />
        </div>

        <div v-else-if="healthCertificateUsers">
          <VTable fixed-header :height="400" density="comfortable">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>نام</th>
                <th>کد پرسنلی</th>
                <th>شناسنامه</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(u, index) in healthCertificateUsers" :key="u.id">
                <td>{{ index + 1 }}</td>
                <td>{{ u.first_name }} {{ u.last_name }}</td>
                <td>{{ u.personnel_code }}</td>
                <td>{{ u.health_certificate.some(h => h.health_certificate_id === props.file?.id) ? 'آپلود شده' : 'ندارد' }}</td>
              </tr>
            </tbody>
          </VTable>
        </div>

        <div v-else class="text-center text-medium-emphasis mt-3">
          هیچ کاربری یافت نشد.
        </div>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn
          color="primary"
          text
          @click="emit('update:isDialogVisible', false)"
        >
          بستن
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
