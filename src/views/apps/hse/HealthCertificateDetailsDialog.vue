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
    healthCertificateUsers.value = res?.data?.users ?? []
    uiState.hasError = false
    uiState.message = ''
  }
  catch (e) {
    console.error('fetchHealthCertificateUsers error:', e)
    uiState.hasError = true
    uiState.message = e?.message ?? 'خطا در دریافت کاربرهای شناسنامه'
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
      <!-- Sticky top section -->
      <div class="sticky-header">
        <VCardTitle class="text-h6">
          جزئیات دوره شناسنامه: {{ props.file.name }}
        </VCardTitle>

        <VCardText>
          <VRow>
            <VCol cols="12" sm="6">
              <p><strong>ماه:</strong> {{ props.file.month }}</p>
              <p><strong>سال:</strong> {{ props.file.year }}</p>
            </VCol>

            <VCol cols="12" sm="6">
              <p>
                <strong>وضعیت:</strong>
                {{ props.file.status === 1 ? 'فعال' : 'غیرفعال' }}
              </p>
              <p>
                <strong>تعداد کاربران:</strong>
                <template v-if="pendingState.fetchingHealthCertificateUsers">
                  <VProgressCircular
                    indeterminate
                    color="primary"
                    size="16"
                    width="2"
                    class="ms-2"
                  />
                </template>
                <template v-else>
                  {{ healthCertificateUsers?.length || 0 }}
                </template>
              </p>
            </VCol>
          </VRow>
        </VCardText>
      </div>

      <!-- Scrollable content -->
      <VCardText class="scrollable-content">
        <div v-if="pendingState.fetchingHealthCertificateUsers" class="d-flex justify-center align-center h-100">
          <VProgressCircular indeterminate color="primary" size="64" />
        </div>

        <div v-else-if="healthCertificateUsers.length">
          <VTable density="comfortable">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>نام</th>
                <th>کد پرسنلی</th>
                <th>شناسنامه</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(u, index) in healthCertificateUsers" :key="u.id">
                <td>{{ index + 1 }}</td>
                <td>{{ u.user?.fullName }}</td>
                <td>{{ u.user?.username }}</td>
                <td>{{ u.image }}</td>
                <td class="text-center">
                  تغییر و
                </td>
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

<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.scrollable-content {
  max-height: 400px;
  overflow-y: auto;
}
</style>
