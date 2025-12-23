<script setup>
import EditDailyLeaveRequestDialog from '@/views/apps/humanResources/DailyLeaveRequest/EditDailyLeaveRequestDialog.vue'

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isEditRequestDialogVisible: false,
})
const { theme } = useAGGridTheme()
const loading = ref(false)
const selectedRequest = ref(null)
const currentMonthRequests = ref([])
const columnDefs = ref([
  {
    headerName: 'تاریخ شروع',
    field: 'startDate',
    maxWidth: 150,
    valueFormatter: params =>
      params.value ? moment(params.value, 'jYYYY-jMM-jDD').format('jYYYY/jMM/jD') : null,
  },
  {
    headerName: 'تاریخ پایان',
    field: 'endDate',
    maxWidth: 150,
    valueFormatter: params =>
      params.value ? moment(params.value, 'jYYYY-jMM-jDD').format('jYYYY/jMM/jD') : null,
  },

  { headerName: 'وضعیت', field: 'status', maxWidth: 150 },
  {
    headerName: 'عملیات',
    field: 'actions',
    suppressHeaderMenuButton: true,
    suppressHeaderContextMenu: true,
    cellRendererSelector: () => ({
      component: 'Actions',
      params: {
        onEditClick,
        onDeleteClick,
      },
    }),
    sortable: false,
    maxWidth: 150,
  },
])

const rowData = computed(() =>
  currentMonthRequests.value?.map((item) => {
    return {
      currentItem: item,
      startDate: item.start_date,
      endDate: item.end_date,
      status: item.status.title,
      actions: {
        editable: {
          status: true,
          mode: 'view',
        },
        deletable: true,
      },

    }
  }),
)
async function getCurrentMonthRequests() {
  loading.value = true
  await axiosInstance
    .get(
      `/hr-request/requests/get-user-requests?request_type=${HR_REQUEST_TYPES.DAILY_LEAVE}`,
    )
    .then(({ data }) => {
      loading.value = false
      currentMonthRequests.value = data.data
    })
    .catch((error) => {
      uiState.hasError = true
      uiState.errorMessage = error.message ?? 'خطا در دریافت درخواست ها'
    })
}
async function onEditClick(request) {
  selectedRequest.value = request.data.currentItem
  uiState.isEditRequestDialogVisible = true
}
async function onDeleteClick(request) {
  // eslint-disable-next-line no-alert
  alert(`delete${request.data.currentItem.id}`)
}

onMounted(() => {
  getCurrentMonthRequests()
})
</script>

<template>
  <VSnackbar
    v-model="uiState.hasError"
    :timeout="2000"
    location="center"
    variant="flat"
    color="error"
  >
    {{ uiState.errorMessage }}
  </VSnackbar>
  <VSnackbar
    v-model="uiState.success"
    :timeout="2000"
    location="center"
    variant="flat"
    color="success"
  >
    {{ uiState.successMessage }}
  </VSnackbar>
  <EditDailyLeaveRequestDialog
    v-if="uiState.isEditRequestDialogVisible"
    v-model:is-dialog-visible="uiState.isEditRequestDialogVisible"
    :request="selectedRequest"
    @submit="getCurrentMonthRequests"
  />
  <div class="ma-3 overflow-auto d-none d-md-block">
    <VCard class="desktop-view">
      <label class="font-weight-medium mb-4 d-block text-center pt-3">
        مرخصی‌های روزانه ماه جاری
      </label>
      <section>
        <VSkeletonLoader v-if="loading" type="card" />
        <AgGridVue
          v-else
          style="block-size: 100%; inline-size: 100%;"
          :column-defs="columnDefs"
          :row-data="rowData"
          enable-rtl
          row-numbers
          pagination
          :theme="theme"
        />
      </section>
    </VCard>
  </div>
  <div class="d-md-none pa-3">
    <VExpansionPanels variant="accordion">
      <VExpansionPanel>
        <VExpansionPanelTitle>
          <span class="font-weight-medium">
            مرخصی‌های روزانه ماه جاری
          </span>
        </VExpansionPanelTitle>

        <VExpansionPanelText>
          <VRow dense>
            <VCol
              v-for="(item, index) in currentMonthRequests"
              :key="index"
              cols="12"
            >
              <VCard outlined class="pa-3 mb-3">
                <div>
                  <strong>تاریخ شروع:</strong> {{ item.start_date }}
                </div>
                <div><strong>تاریخ پایان:</strong> {{ item.end_date }}</div>

                <div class="d-flex align-center mt-1">
                  <strong class="mr-1">وضعیت:</strong>
                  <VChip
                    :color="item.status.color"
                    size="small"
                    label
                    variant="tonal"
                  >
                    {{ item.status.title }}
                  </VChip>
                </div>

                <div class="mt-3 text-center">
                  <VBtn
                    color="orange"
                    variant="text"
                    size="small"
                    @click="onEditClick(item)"
                  >
                    <VIcon icon="tabler-edit" size="20" />
                  </VBtn>
                  <VBtn color="red" variant="text" size="small">
                    <VIcon icon="tabler-trash" size="20" />
                  </VBtn>
                </div>
              </VCard>
            </VCol>
          </VRow>

          <div
            v-if="!currentMonthRequests.length"
            class="text-center text-medium-emphasis mt-2"
          >
            موردی یافت نشد!
          </div>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </div>
</template>

<style scoped>
.desktop-view {
  height: 500px;
  display: grid;
  grid-template-rows: auto 1fr;
}
</style>
