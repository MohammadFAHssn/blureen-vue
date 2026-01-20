<script setup>
import ExceptionCreateDialog from '@/views/apps/food/rep/ExceptionCreateDialog.vue'
// emit
const emit = defineEmits(['back'])
const current = ref('root')
function goBack() {
  if (current.value !== 'root') {
    current.value = 'root'
  }
  else {
    emit('back')
  }
}

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isExceptionCreateDialogVisible: false,
})

const pendingState = reactive({
  fetchingsExceptions: false,
  createException: false,
  changeStatus: false,
})

function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}

const exceptions = ref([])
const users = ref([])
const meals = ref([])

// ----- start ag-grid -----
const gridApi = ref(null)
const { theme } = useAGGridTheme()
const selectedNodes = ref([])

function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption('loading', true)
}

const columnDefs = ref([
  { headerName: 'نام', field: 'fullName' },
  { headerName: 'کد پرسنلی', field: 'userName' },
  { headerName: 'وعده', field: 'mealName' },
  {
    headerName: 'وضعیت',
    field: 'status',
    cellRenderer: 'Active',
    cellStyle: { 'display': 'flex', 'align-items': 'center' },
    filterParams: {
      valueFormatter: params => (params.value === 1 ? 'فعال' : 'غیرفعال'),
    },
  },
  {
    headerName: 'عملیات',
    field: 'actions',
    cellRendererSelector: (_params) => {
      return {
        component: 'Actions',
        params: {
          onStatusClick: (selectedNode) => {
            selectedNodes.value = [selectedNode]
            onChangeStatusClick()
          },
        },
      }
    },
  },
])

const rowData = computed(() =>
  exceptions.value?.map((exception) => {
    return {
      id: exception.id,
      fullName: exception.user.fullName,
      userName: exception.user.username,
      mealName: exception.meal.name,
      status: exception.status,
      actions: {
        status: true,
      },
    }
  }),
)
// ----- end ag-grid -----

async function fetchExceptions() {
  pendingState.fetchingsExceptions = true
  gridApi.value?.setGridOption('loading', true)
  try {
    const res = await $api('/food/exception', { method: 'GET' })

    exceptions.value = res?.data?.mealReservationExceptions || []
  }
  catch (e) {
    console.error('Error fetching exceptions:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت پیمانکاران'
  }
  finally {
    pendingState.fetchingsExceptions = false
    gridApi.value?.setGridOption('loading', false)
  }
}
async function onCreateException(payload) {
  pendingState.createException = true

  try {
    await $api('/food/exception', {
      method: 'POST',
      body: {
        meal_id: payload.selectedMeal,
        users: payload.selectedPersonnels,
      },
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage = response._data?.message || 'خطا در ایجاد استثناء'
        }
      },
    })

    uiState.isExceptionCreateDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.createException = false
    fetchExceptions()
  }
}
async function onChangeStatusClick() {
  const id = selectedNodes.value[0].data.id
  pendingState.changeStatus = true
  try {
    await $api(`/food/exception/status/${id}`, {
      method: 'POST',
      onResponseError({ response }) {
        pendingState.changeStatus = false
        uiState.hasError = true
        uiState.errorMessage = response._data.message || 'خطا در تغییر وضعیت'
      },
    })

    const index = exceptions.value.findIndex(item => item.id === id)
    if (index !== -1) {
      exceptions.value[index].status = exceptions.value[index].status === 1 ? 0 : 1
    }
  }
  catch (err) {
    console.error(err)
  }
}
async function fetchUsers() {
  try {
    const { data, error } = await useApi(createUrl('/base/user/details'))
    if (error.value) {
      setError('خطا در دریافت کاربران')
      throw error.value
    }

    if (data.value?.data) {
      users.value = data.value.data.map(u => ({
        ...u,
        fullName: `${u.first_name} ${u.last_name} - ${u.personnel_code}`,
      }))
    }
  }
  catch (e) {
    console.error('Unexpected error fetching users:', e)
    setError('خطای غیرمنتظره در دریافت کاربران')
  }
}
async function fetchMeals() {
  pendingState.fetchingMeals = true
  try {
    const res = await $api('/food/meal/get-actives', { method: 'GET' })

    meals.value = res?.data.meals || []
  }
  catch (e) {
    console.error('Error fetching meals:', e)
    setError(e.message || 'خطا در دریافت وعده‌ها')
  }
  finally {
    pendingState.fetchingMeals = false
  }
}
onMounted(async () => {
  await Promise.all([fetchMeals(), fetchUsers(), fetchExceptions()])
})
</script>

<template>
  <VLayout class="app-layout">
    <VSnackbar
      v-model="uiState.hasError"
      :timeout="2000"
      location="center"
      variant="flat"
      color="error"
    >
      {{ uiState.errorMessage }}
    </VSnackbar>

    <div>
      <VBtn
        variant="text"
        prepend-icon="tabler-arrow-right"
        class="mb-4"
        @click="goBack"
      >
        {{ current === 'root' ? 'گزارش' : 'صفحه قبل' }}
      </VBtn>
    </div>

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

    <ExceptionCreateDialog
      v-if="uiState.isExceptionCreateDialogVisible"
      v-model:is-dialog-visible="uiState.isExceptionCreateDialogVisible"
      :loading="pendingState.createException"
      :meals="meals"
      :users="users"
      @submit="onCreateException"
    />

    <VApp>
      <VFab
        app
        icon="tabler-plus"
        size="x-large"
        @click="uiState.isExceptionCreateDialogVisible = true"
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
  grid-template-rows: auto 1fr;
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
