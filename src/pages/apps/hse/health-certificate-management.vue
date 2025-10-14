<script setup>
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'
import BirthdayFileCreateDialog from '@/views/apps/payroll/birthday/BirthdayFileCreateDialog.vue'
import BirthdayFileDetailsDialog from '@/views/apps/payroll/birthday/BirthdayFileDetailsDialog.vue'
import BirthdayFileEditDialog from '@/views/apps/payroll/birthday/BirthdayFileEditDialog.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'Birthdays',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isBirthdayFileCreateDialogVisible: false,
  isBirthdayFileEditDialogVisible: false,
  isBirthdayFileDeleteDialogVisible: false,
  isBirthdayFileDetailsDialogVisible: false,
})

const pendingState = reactive({
  createBirthdayFile: false,
  editBirthdayFile: false,
  fetchingBirthdayFiles: false,
  deleteBirthdayFile: false,
  detailsBirthdayFile: false,
})

const birthdayFiles = ref([])

const selectedBirthdayFile = ref(null)
const selectedNodes = ref([])
const gridApi = ref(null)
// ----- start ag-grid -----

const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption('loading', true)
}

const columnDefs = ref([
  { headerName: 'نام فایل', field: 'name' },
  { headerName: 'ماه', field: 'month' },
  { headerName: 'سال', field: 'year' },
  {
    headerName: 'وضعیت',
    field: 'status',
    cellRenderer: 'Active',
    cellStyle: { 'display': 'flex', 'align-items': 'center' },
    filterParams: {
      valueFormatter: params => (params.value === 1 ? 'فعال' : 'غیرفعال'),
    },
  },
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
            uiState.isBirthdayFileDeleteDialogVisible = true
          },
          onDetailsClick: (selectedNode) => {
            selectedNodes.value = [selectedNode]
            selectedBirthdayFile.value = birthdayFiles.value.find(
              file => file.id === selectedNode.data.id,
            )
            uiState.isBirthdayFileDetailsDialogVisible = true
          },
          onEditClick: (selectedNode) => {
            selectedNodes.value = [selectedNode]
            selectedBirthdayFile.value = birthdayFiles.value.find(
              gift => gift.id === selectedNode.data.id,
            )
            uiState.isBirthdayFileEditDialogVisible = true
          },
        },
      }
    },
  },
])

const rowData = computed(() =>
  birthdayFiles.value?.map((file) => {
    return {
      id: file.id,
      name: file.name,
      month: file.month,
      year: file.year,
      status: file.status,
      uploadedBy: file.uploadedBy?.fullName || '--',
      editedBy: file.editedBy?.fullName || '--',
      createdAt: moment(file.createdAt).format('jYYYY-jMM-jDD HH:mm:ss'),
      updatedAt: moment(file.updatedAt).format('jYYYY-jMM-jDD HH:mm:ss'),
      actions: {
        deletable: true,
        detailsable: true,
        editable: {
          status: true,
          mode: 'view',
        },
      },
    }
  }),
)

// ----- end ag-grid -----

// ----- -----

async function fetchbirthdayFiles() {
  pendingState.fetchingBirthdayFiles = true
  gridApi.value?.setGridOption('loading', true)
  try {
    const res = await $api('/birthday/file/', { method: 'GET' })

    birthdayFiles.value = res?.data?.birthdayFiles || []
  }
  catch (e) {
    console.error('Error fetching birthdayFiles:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت فایل‌های هدیه'
  }
  finally {
    pendingState.fetchingBirthdayFiles = false
    gridApi.value?.setGridOption('loading', false)
  }
}

fetchbirthdayFiles()

async function onCreateBirthdayFile(payload) {
  const formData = new FormData()

  formData.append('month', Number(payload.birthdayFileDate.split('/')[1]))
  formData.append('year', Number(payload.birthdayFileDate.split('/')[0]))

  formData.append('file', payload.birthdayFile)
  formData.append('file_name', payload.birthdayFile.name)

  pendingState.createBirthdayFile = true
  try {
    await $api('/birthday/file/', {
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
            = response._data?.message || 'خطا در آپلود فایل هدیه'
        }
      },
    })

    uiState.isBirthdayFileCreateDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.createBirthdayFile = false
    fetchbirthdayFiles()
  }
}

async function onEditBirthdayFile(payload) {
  const id = selectedNodes.value[0].data.id
  const formData = new FormData()
  if (payload.birthdayFileDate) {
    formData.append('month', Number(payload.birthdayFileDate.split('/')[1]))
    formData.append('year', Number(payload.birthdayFileDate.split('/')[0]))
  }
  if (payload.birthdayFile) {
    formData.append('file', payload.birthdayFile)
    formData.append('file_name', payload.birthdayFile.name)
  }
  formData.append('status', payload.birthdayFileStatus)

  pendingState.editBirthdayFile = true
  try {
    await $api(`/birthday/file/${id}`, {
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
            = response._data?.message || 'خطا در ویرایش فایل هدیه'
        }
      },
    })

    uiState.isBirthdayFileEditDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.editBirthdayFile = false
    fetchbirthdayFiles()
  }
}

async function onDelete() {
  const id = selectedNodes.value[0].data.id
  pendingState.deleteBirthdayFile = true
  try {
    await $api(`/birthday/file/${id}`, {
      method: 'DELETE',
      onResponseError({ response }) {
        pendingState.deleteBirthdayFile = false
        uiState.hasError = true
        uiState.errorMessage = response._data.message || 'خطا در حذف فایل هدیه'
      },
    })

    pendingState.deleteBirthdayFile = false
    uiState.isBirthdayFileDeleteDialogVisible = false
    birthdayFiles.value = birthdayFiles.value.filter(
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

    <BirthdayFileCreateDialog
      v-if="uiState.isBirthdayFileCreateDialogVisible"
      v-model:is-dialog-visible="uiState.isBirthdayFileCreateDialogVisible"
      :loading="pendingState.createBirthdayFile"
      @submit="onCreateBirthdayFile"
    />

    <BirthdayFileEditDialog
      v-if="uiState.isBirthdayFileEditDialogVisible"
      v-model:is-dialog-visible="uiState.isBirthdayFileEditDialogVisible"
      :loading="pendingState.editBirthdayFile"
      :file="{ selectedBirthdayFile }"
      @submit="onEditBirthdayFile"
    />

    <BirthdayFileDetailsDialog
      v-if="uiState.isBirthdayFileDetailsDialogVisible"
      v-model:is-dialog-visible="uiState.isBirthdayFileDetailsDialogVisible"
      :loading="pendingState.detailsBirthdayFile"
      :file="selectedBirthdayFile"
      @update:selected-birthday-file-users="selectedBirthdayFile.users = $event"
    />

    <AreYouSureDialog
      v-if="uiState.isBirthdayFileDeleteDialogVisible"
      v-model:is-dialog-visible="uiState.isBirthdayFileDeleteDialogVisible"
      title="آیا از حذف این فایل هدیه اطمینان دارید؟"
      :loading="pendingState.deleteBirthdayFile"
      @confirm="onDelete"
    />

    <VApp>
      <VFab app icon="tabler-plus" size="x-large" @click="uiState.isBirthdayFileCreateDialogVisible = true" />
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
