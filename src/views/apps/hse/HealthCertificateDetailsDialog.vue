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
const gridApi = ref(null)

// functions
async function fetchHealthCertificateUsers(id) {
  if (!id) return
  pendingState.fetchingHealthCertificateUsers = true
  gridApi.value?.setGridOption('loading', true)
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
    gridApi.value?.setGridOption('loading', false)
  }
}
// ----- start ag-grid -----
const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption('loading', true)
}

const columnDefs = ref([
  { headerName: 'نام', field: 'name' },
  { headerName: 'کد پرسنلی', field: 'personnel_code' },
  { headerName: 'شناسنامه', field: 'health_certificate' },
])

const rowData = computed(() =>
  healthCertificateUsers.value?.map((user) => {
    const hasThisCertificate = user.health_certificate?.some(
      c => c.health_certificate_id === props.file.id,
    )

    return {
      name: `${user.first_name} ${user.last_name}`,
      personnel_code: user.personnel_code,
      health_certificate: hasThisCertificate ? 'دارد' : 'آپلود نشده',
    }
  }),
)
// ----- end ag-grid -----
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

      <section style="height: 400px">
        <AgGridVue
          style="block-size: 100%; inline-size: 100%"
          :column-defs="columnDefs"
          :row-data="rowData"
          enable-rtl
          row-numbers
          pagination
          :theme="theme"
          @grid-ready="onGridReady"
        />
      </section>

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

<style lang="scss" scoped>
@use '@styles/variables/vuetify';
@use '@core/scss/base/mixins';

.app-layout {
  @include mixins.elevation(vuetify.$card-elevation);

  display: grid;
  grid-template-columns: auto;
  grid-template-rows: 1fr auto;
}

.v-application {
  max-block-size: 100%;
  min-block-size: 100%;
}

:deep(.v-application__wrap) {
  max-block-size: 100% !important;
  min-block-size: 100% !important;
}
</style>
