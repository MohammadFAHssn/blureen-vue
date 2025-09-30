<script setup>
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'
import SurveyCreateDialog from '@/views/apps/survey/SurveyCreateDialog.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
    action: 'read',
    subject: 'Surveys',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isSurveyDeleteDialogVisible: false,
})

const pendingState = reactive({
  createSurvey: false,
  fetchingSurveys: false,
  deleteSurveys: false,
})

const Surveys = ref([])

const selectedNodes = ref([])
const gridApi = ref(null)
// ----- start ag-grid -----

const { theme } = useAGGridTheme()

function onGridReady(params) {
  gridApi.value = params.api

  gridApi.value.setGridOption('rowData', rowData())
}

const getRowId = ref(params => params.data.id)

const columnDefs = ref([
  {
    headerName: 'تاریخ ایجاد',
    field: 'createdAt',
    valueFormatter: params =>
      moment(params.value, 'jYYYY-jMM-jDD HH:mm:ss').format(
        'jYYYY/jMM/jD HH:mm:ss',
      ),
  },
  { headerName: 'عنوان نظرسنجی', field: 'title' },
  { headerName: 'شناسه نظرسنجی', field: 'porslineId' },
  {
    headerName: 'عملیات',
    field: 'actions',
    cellRendererSelector: () => {
      return {
        component: 'Actions',
        params: {
          onDeleteClick: (selectedNode) => {
            selectedNodes.value = [selectedNode]
            uiState.isSurveyDeleteDialogVisible = true
          },
        },
      }
    },
  },
])

function rowData() {
  return Surveys.value?.map((survey) => {
    return {
      id: survey.id,
      createdAt: moment(survey.created_at).format('jYYYY-jMM-jDD HH:mm:ss'),
      title: survey.title,
      porslineId: survey.porsline_id,
      actions: {
        deletable: true,
      },
    }
  })
}

// ----- end ag-grid -----

// ----- -----

async function fetchSurveys() {
  pendingState.fetchingSurveys = true
  try {
    const { data, error } = await useApi(
      createUrl('/survey/survey'),
    )

    pendingState.fetchingSurveys = false

    if (error.value) throw error.value

    Surveys.value = data.value.data
    gridApi.value.setGridOption('rowData', rowData())
  }
  catch (e) {
    console.error('Error fetching Surveys:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت نظرسنجی‌ها'
  }
}

fetchSurveys()

async function onCreateSurvey(payload) {
  console.log('!')
  //   const formData = new FormData()

  //   formData.append('month', Number(payload.payrollBatchDate.split('/')[1]))
  //   formData.append('year', Number(payload.payrollBatchDate.split('/')[0]))

  //   formData.append('file', payload.payrollBatchFile)

  //   pendingState.createSurvey = true
  //   try {
  //     await $api('/payroll/payroll-batch/create', {
  //       method: 'POST',
  //       body: formData,
  //       onResponseError({ response }) {
  //         uiState.hasError = true
  //         uiState.errorMessage
  //           = response._data.message || 'خطا در ایجاد فیش حقوقی'
  //       },
  //     })

//     uiState.isSurveyCreateDialogVisible = false
//   }
//   catch (err) {
//     console.error(err)
//   }
//   finally {
//     pendingState.createSurvey = false
//     fetchSurveys()
//   }
}

async function onDelete() {
  pendingState.deleteSurveys = true
  try {
    await $api('/survey/survey', {
      method: 'DELETE',
      body: {
        ids: [selectedNodes.value[0].data.id],
      },
      onResponseError({ response }) {
        pendingState.deleteSurveys = false
        uiState.hasError = true
        uiState.errorMessage = response._data.message || 'خطا در حذف نظرسنجی'
      },
    })

    pendingState.deleteSurveys = false
    uiState.isSurveyDeleteDialogVisible = false
    fetchSurveys()
  }
  catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <VLayout class="app-layout">
    <VSnackbar
      v-model="uiState.hasError"
      :timeout="2000"
      location="center"
      variant="outlined"
      color="error"
    >
      {{ uiState.errorMessage }}
    </VSnackbar>

    <section style="block-size: 100%;">
      <AgGridVue
        style="block-size: 100%; inline-size: 100%;"
        :column-defs="columnDefs"
        :get-row-id="getRowId"
        :loading="pendingState.fetchingSurveys"
        enable-rtl
        row-numbers
        pagination
        :theme="theme"
        @grid-ready="onGridReady"
      />
    </section>

    <SurveyCreateDialog
      v-if="uiState.isSurveyCreateDialogVisible"
      v-model:is-dialog-visible="uiState.isSurveyCreateDialogVisible"
      :loading="pendingState.createSurvey"
      @submit="onCreateSurvey"
    />

    <AreYouSureDialog
      v-if="uiState.isSurveyDeleteDialogVisible"
      v-model:is-dialog-visible="uiState.isSurveyDeleteDialogVisible"
      title="آیا از حذف این نظرسنجی اطمینان دارید؟"
      :loading="pendingState.deleteSurveys"
      @confirm="onDelete"
    />

    <VApp>
      <VFab
        app
        icon="tabler-plus"
        size="x-large"
        @click="uiState.isSurveyCreateDialogVisible = true"
      />
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
