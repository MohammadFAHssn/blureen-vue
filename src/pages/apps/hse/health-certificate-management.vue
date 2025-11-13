<script setup>
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'
import HealthCertificateAddImageDialog from '@/views/apps/hse/HealthCertificateAddImageDialog.vue'
import HealthCertificateCreateDialog from '@/views/apps/hse/HealthCertificateCreateDialog.vue'
import HealthCertificateDetailsDialog from '@/views/apps/hse/HealthCertificateDetailsDialog.vue'
import HealthCertificateEditDialog from '@/views/apps/hse/HealthCertificateEditDialog.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'Health-Certificate',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isHealthCertificateCreateDialogVisible: false,
  isHealthCertificateEditDialogVisible: false,
  isHealthCertificateAddImageDialogVisible: false,
  isHealthCertificateDeleteDialogVisible: false,
  isHealthCertificateDetailsDialogVisible: false,
})

const pendingState = reactive({
  createHealthCertificate: false,
  editHealthCertificate: false,
  addImageHealthCertificate: false,
  fetchingHealthCertificates: false,
  deleteHealthCertificate: false,
  detailsHealthCertificate: false,
})

const healthCertificates = ref([])

const selectedHealthCertificate = ref(null)
const selectedNodes = ref([])
const gridApi = ref(null)

// ----- start ag-grid -----
const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption('loading', true)
}

const columnDefs = ref([
  { headerName: 'نام', field: 'name' },
  { headerName: 'ماه', field: 'month' },
  { headerName: 'سال', field: 'year' },
  { headerName: 'بارگذاری توسط', field: 'uploadedBy' },
  { headerName: 'آخرین ویرایش توسط', field: 'editedBy' },
  {
    headerName: 'تاریخ بارگذاری',
    field: 'createdAt',
    valueFormatter: params =>
      moment(params.value, 'jYYYY-jMM-jDD HH:mm:ss').format(
        'jYYYY/jMM/jD HH:mm:ss',
      ),
  },
  {
    headerName: 'تاریخ آخرین ویرایش',
    field: 'updatedAt',
    valueFormatter: params =>
      moment(params.value, 'jYYYY-jMM-jDD HH:mm:ss').format(
        'jYYYY/jMM/jD HH:mm:ss',
      ),
  },
  {
    headerName: 'عملیات',
    field: 'actions',
    cellRendererSelector: (_params) => {
      return {
        component: 'Actions',
        params: {
          onDeleteClick: (selectedNode) => {
            selectedNodes.value = [selectedNode]
            uiState.isHealthCertificateDeleteDialogVisible = true
          },
          onDetailsClick: (selectedNode) => {
            selectedNodes.value = [selectedNode]
            selectedHealthCertificate.value = healthCertificates.value.find(
              file => file.id === selectedNode.data.id,
            )
            uiState.isHealthCertificateDetailsDialogVisible = true
          },
          onAddImageClick: (selectedNode) => {
            selectedNodes.value = [selectedNode]
            selectedHealthCertificate.value = healthCertificates.value.find(
              gift => gift.id === selectedNode.data.id,
            )
            uiState.isHealthCertificateAddImageDialogVisible = true
          },
        },
      }
    },
  },
])

const rowData = computed(() =>
  healthCertificates.value?.map((file) => {
    return {
      id: file.id,
      name: file.name,
      month: file.month,
      year: file.year,
      uploadedBy: file.uploadedBy?.fullName || '--',
      editedBy: file.editedBy?.fullName || '--',
      createdAt: moment(file.createdAt).format('jYYYY-jMM-jDD HH:mm:ss'),
      updatedAt: moment(file.updatedAt).format('jYYYY-jMM-jDD HH:mm:ss'),
      actions: {
        deletable: true,
        detailsable: true,
        addImage: true,
      },
    }
  }),
)

// ----- end ag-grid -----

async function fetchHealthCertificates() {
  pendingState.fetchingHealthCertificates = true
  gridApi.value?.setGridOption('loading', true)
  try {
    const res = await $api('/hse/health-certificate/file/', { method: 'GET' })

    healthCertificates.value = res?.data?.healthCertificates || []
  }
  catch (e) {
    console.error('Error fetching healthCertificates:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت دوره‌های شناسنامه‌ها'
  }
  finally {
    pendingState.fetchingHealthCertificates = false
    gridApi.value?.setGridOption('loading', false)
  }
}

fetchHealthCertificates()

async function onCreateHealthCertificate(payload) {
  const formData = new FormData()

  formData.append('month', Number(payload.healthCertificateDate.split('/')[1]))
  formData.append('year', Number(payload.healthCertificateDate.split('/')[0]))
  formData.append('file_name', payload.healthCertificateName)

  pendingState.createHealthCertificate = true
  try {
    await $api('/hse/health-certificate/file/', {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage
            = response._data?.message || 'خطا در ایجاد'
        }
      },
    })

    uiState.isHealthCertificateCreateDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.createHealthCertificate = false
    fetchHealthCertificates()
  }
}

async function onEditHealthCertificate(payload) {
  const id = selectedHealthCertificate.value.id
  const formData = new FormData()
  if (payload.healthCertificateDate) {
    formData.append('month', Number(payload.healthCertificateDate.split('/')[1]))
    formData.append('year', Number(payload.healthCertificateDate.split('/')[0]))
  }
  formData.append('file_name', payload.healthCertificateName)

  pendingState.editHealthCertificate = true
  try {
    await $api(`/hse/health-certificate/file/${id}`, {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage
            = response._data?.message || 'خطا در ویرایش'
        }
      },
    })

    uiState.isHealthCertificateEditDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.editHealthCertificate = false
    fetchHealthCertificates()
  }
}

// progress state
const upload = reactive({
  active: false,
  total: 0,
  done: 0,
  failed: 0,
  percent: 0, // 0..100
})

function resetUpload() {
  upload.active = false
  upload.total = 0
  upload.done = 0
  upload.failed = 0
  upload.percent = 0
}

async function onAddImageToHealthCertificate(payload) {
  const id = selectedHealthCertificate.value.id
  const year = selectedHealthCertificate.value.year
  const files = payload.healthCertificateImages || []
  const chunkSize = 19

  if (!files.length) return

  // init progress
  resetUpload()
  upload.active = true
  upload.total = files.length

  pendingState.addImageHealthCertificate = true
  uiState.hasError = false
  uiState.errorMessage = ''

  try {
    for (let i = 0; i < files.length; i += chunkSize) {
      const chunk = files.slice(i, i + chunkSize)

      const formData = new FormData()
      chunk.forEach(f => formData.append('images[]', f, f.name))
      formData.append('id', String(id))
      formData.append('year', String(year))

      try {
        await $api('/hse/health-certificate/file/image', {
          method: 'POST',
          body: formData,
        })
        // success: mark these as done
        upload.done += chunk.length
      }
      catch (e) {
        console.error('batch upload failed:', e)
        // failure: count as failed but keep going
        upload.failed += chunk.length
        uiState.hasError = true
        uiState.errorMessage = 'برخی از فایل‌ها بارگذاری نشدند.'
      }

      // update percent after each batch
      const completed = upload.done + upload.failed
      upload.percent = upload.total ? (completed / upload.total) * 100 : 0
    }

    // close dialog if at least something uploaded and no hard error desired
    uiState.isHealthCertificateAddImageDialogVisible = false
  }
  catch (err) {
    console.error(err)
    uiState.hasError = true
    uiState.errorMessage = 'خطای غیرمنتظره در آپلود'
  }
  finally {
    pendingState.addImageHealthCertificate = false
    upload.active = false
    fetchHealthCertificates()
  }
}

async function onDelete() {
  const id = selectedNodes.value[0].data.id
  pendingState.deleteHealthCertificate = true
  try {
    await $api(`/hse/health-certificate/file/${id}`, {
      method: 'DELETE',
      onResponseError({ response }) {
        pendingState.deleteHealthCertificate = false
        uiState.hasError = true
        uiState.errorMessage = response._data.message || 'خطا در حذف'
      },
    })

    pendingState.deleteHealthCertificate = false
    uiState.isHealthCertificateDeleteDialogVisible = false
    healthCertificates.value = healthCertificates.value.filter(
      file => file.id !== selectedNodes.value[0].data.id,
    )
  }
  catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <VLayout class="app-layout">
    <VSnackbar v-model="uiState.hasError" :timeout="2000" location="center" variant="flat" color="error">
      {{ uiState.errorMessage }}
    </VSnackbar>

    <section style="block-size: 100%">
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

    <HealthCertificateCreateDialog
      v-if="uiState.isHealthCertificateCreateDialogVisible"
      v-model:is-dialog-visible="uiState.isHealthCertificateCreateDialogVisible"
      :loading="pendingState.createHealthCertificate"
      @submit="onCreateHealthCertificate"
    />

    <HealthCertificateEditDialog
      v-if="uiState.isHealthCertificateEditDialogVisible"
      v-model:is-dialog-visible="uiState.isHealthCertificateEditDialogVisible"
      :loading="pendingState.editHealthCertificate"
      :file="selectedHealthCertificate"
      @submit="onEditHealthCertificate"
    />

    <HealthCertificateAddImageDialog
      v-if="uiState.isHealthCertificateAddImageDialogVisible"
      v-model:is-dialog-visible="uiState.isHealthCertificateAddImageDialogVisible"
      :loading="pendingState.addImageHealthCertificate || upload.active"
      :progress="upload.percent"
      :total="upload.total"
      :done="upload.done"
      :failed="upload.failed"
      @submit="onAddImageToHealthCertificate"
    />

    <HealthCertificateDetailsDialog
      v-if="uiState.isHealthCertificateDetailsDialogVisible"
      v-model:is-dialog-visible="uiState.isHealthCertificateDetailsDialogVisible"
      :loading="pendingState.detailsHealthCertificate"
      :file="selectedHealthCertificate"
    />

    <AreYouSureDialog
      v-if="uiState.isHealthCertificateDeleteDialogVisible"
      v-model:is-dialog-visible="uiState.isHealthCertificateDeleteDialogVisible"
      title="آیا از حذف این شناسنامه اطمینان دارید؟"
      :loading="pendingState.deleteHealthCertificate"
      @confirm="onDelete"
    />

    <VApp>
      <VFab app icon="tabler-plus" size="x-large" @click="uiState.isHealthCertificateCreateDialogVisible = true" />
    </VApp>
  </VLayout>
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
