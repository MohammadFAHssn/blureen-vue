<script setup>
import EditForm from '@/views/apps/humanResources/OvertimeRequest/EditForm.vue'

const props = defineProps({
  userId: {
    required: true,
  },
})
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
    headerName: 'تاریخ',
    field: 'startDate',
    maxWidth: 150,
    valueFormatter: params =>
      params.value ? moment(params.value, 'jYYYY-jMM-jDD').format('jYYYY/jMM/jD') : null,
  },
  { headerName: 'زمان شروع', field: 'startTime', maxWidth: 180 },
  { headerName: 'زمان پایان', field: 'endTime', maxWidth: 180 },
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
      startTime: item.start_time,
      endTime: item.end_time,
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
    .get('/hr-request/request/get-user-requests', {
      params: {
        user_id: props.userId,
        request_type: HR_REQUEST_TYPES.OVERTIME,
      },
    })
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
  <EditForm
    v-if="uiState.isEditRequestDialogVisible"
    v-model:is-dialog-visible="uiState.isEditRequestDialogVisible"
    :request="selectedRequest"
    @submit="getCurrentMonthRequests"
  />
  <div class="ma-3 overflow-auto d-none d-md-block">
    <VCard class="desktop-view">
      <label class="font-weight-medium mb-4 d-block text-center pt-3">
        لیست اضافه کار ماه جاری
      </label>
      <section>
        <VSkeletonLoader v-if="loading" type="card" />
        <AgGridVue
          v-else
          style="block-size: 100%; inline-size: 100%"
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
      <!-- کشوی اصلی مربوط به "اضافه کارهای ماه جاری" -->
      <VExpansionPanel>
        <VExpansionPanelTitle class="font-weight-bold">
          اضافه کارهای ماه جاری
        </VExpansionPanelTitle>

        <VExpansionPanelText>
          <!-- کشوهای داخلی برای هر اضافه کار -->
          <VExpansionPanels variant="accordion">
            <VExpansionPanel
              v-for="(item, index) in currentMonthRequests"
              :key="index"
              class="mb-2"
            >
              <VExpansionPanelTitle>
                <div class="d-flex justify-space-between w-100 align-center">
                  <span>{{ item.date }}</span>
                  <VChip
                    :color="item.status.color"
                    size="small"
                    label
                  >
                    {{ item.status.title }}
                  </VChip>
                </div>
              </VExpansionPanelTitle>

              <VExpansionPanelText>
                <div class="pa-2">
                  <div><strong>تاریخ:</strong> {{ item.start_date }}</div>
                  <div><strong>ساعت شروع:</strong> {{ item.start_time }}</div>
                  <div><strong>ساعت پایان:</strong> {{ item.end_time }}</div>
                  <div class="mt-2 text-center">
                    <VBtn color="orange" variant="text" size="small">
                      <VIcon icon="tabler-edit" size="20" />
                    </VBtn>
                    <VBtn color="red" variant="text" size="small">
                      <VIcon icon="tabler-trash" size="20" />
                    </VBtn>
                  </div>
                </div>
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
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
