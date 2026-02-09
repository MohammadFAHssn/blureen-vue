<script setup>
import { useDisplay } from 'vuetify/framework'
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'
import ApprovalsFlowDialog from '@/views/apps/humanResources/Components/ApprovalsFlowDialog.vue'
import EditForm from '@/views/apps/humanResources/LeaveRequest/DailyLeave/EditForm.vue'

const props = defineProps({
  userId: {
    required: true,
  },
})
const { mdAndUp } = useDisplay()
const isMobile = computed(() => !mdAndUp.value)
const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isEditRequestDialogVisible: false,
  isDeleteRequestDialogVisible: false,
  isApprovalsFlowDialogVisible: false,
  deleteLoading: false,
})
const { theme } = useAGGridTheme()
const loading = ref(false)
const selectedRequest = ref(null)
const currentMonthRequests = ref([])
const columnDefs = ref([
  {
    headerName: 'تاریخ شروع',
    field: 'startDate',
    valueFormatter: params =>
      params.value
        ? moment(params.value, 'jYYYY-jMM-jDD').format('jYYYY/jMM/jD')
        : null,
  },
  {
    headerName: 'تاریخ پایان',
    field: 'endDate',
    valueFormatter: params =>
      params.value
        ? moment(params.value, 'jYYYY-jMM-jDD').format('jYYYY/jMM/jD')
        : null,
  },
  {
    headerName: 'وضعیت',
    field: 'status',
  },
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
        onShowApprovalFlowClick,
      },
    }),
    sortable: false,
  },
])

const rowData = computed(() =>
  currentMonthRequests.value?.map((item) => {
    return {
      currentItem: item,
      startDate: item.start_date,
      endDate: item.end_date,
      status: item.status.title ?? '-',
      actions: {
        editable: {
          status: useCookie('userData').value.id === props.userId,
          mode: 'view',
        },
        deletable: useCookie('userData').value.id === props.userId,
        approvalFlow: true,
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
        request_type: HR_REQUEST_TYPES.DAILY_LEAVE,
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

function onShowApprovalFlowClick(request) {
  selectedRequest.value = request.data.currentItem
  uiState.isApprovalsFlowDialogVisible = true
}

function onDeleteClick(request) {
  selectedRequest.value = request.data.currentItem
  uiState.isDeleteRequestDialogVisible = true
}
async function onDelete() {
  uiState.deleteLoading = true
  try {
    await axiosInstance.delete('hr-request/request/delete', {
      params: {
        requestId: selectedRequest.value.id,
      },
    })
    await getCurrentMonthRequests()
    uiState.successMessage = `درخواست مرخصی با موفقیت حذف شد`
    uiState.success = true
  }
  catch (error) {
    let error_message
    if (!('errors' in error.response.data)) {
      error_message = error.response.data.message
    }
    else {
      error_message = error.response.data.message
    }

    uiState.hasError = true
    uiState.errorMessage = error_message
  }
  finally {
    uiState.deleteLoading = false
    uiState.isDeleteRequestDialogVisible = false
  }
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
    @submit="
      () => {
        uiState.successMessage = 'ویرایش درخواست با موفقیت انجام شد.'
        uiState.success = true
        getCurrentMonthRequests()
      }
    "
  />
  <ApprovalsFlowDialog
    v-if="uiState.isApprovalsFlowDialogVisible"
    v-model:is-dialog-visible="uiState.isApprovalsFlowDialogVisible"
    :request="selectedRequest"
  />

  <AreYouSureDialog
    v-if="uiState.isDeleteRequestDialogVisible"
    v-model:is-dialog-visible="uiState.isDeleteRequestDialogVisible"
    title="آیا از حذف این درخواست اطمینان دارید؟"
    :loading="uiState.deleteLoading"
    @confirm="onDelete"
  />
  <div v-if="isMobile" class="pa-3">
    <VExpansionPanels variant="accordion">
      <VExpansionPanel>
        <VExpansionPanelTitle>
          <span class="font-weight-medium"> مرخصی‌های روزانه ماه جاری </span>
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
                  <strong>تاریخ شروع:</strong>
                  <span dir="rtl">{{ item.start_date }}</span>
                </div>
                <div>
                  <strong>تاریخ پایان:</strong>
                  <span dir="rtl">{{ item.end_date }}</span>
                </div>

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
                    v-if="useCookie('userData').value.id === props.userId"
                    color="orange"
                    variant="text"
                    size="small"
                    @click="
                      () => {
                        selectedRequest = item
                        uiState.isEditRequestDialogVisible = true
                      }
                    "
                  >
                    <VIcon icon="tabler-edit" size="20" />
                  </VBtn>
                  <VBtn
                    color="primary"
                    variant="text"
                    size="small"
                    @click="
                      () => {
                        selectedRequest = item
                        uiState.isApprovalsFlowDialogVisible = true
                      }
                    "
                  >
                    <VIcon icon="tabler-git-branch" size="20" />
                  </VBtn>
                  <VBtn
                    v-if="useCookie('userData').value.id === props.userId"
                    color="red"
                    variant="text"
                    size="small"
                    @click="
                      () => {
                        selectedRequest = item
                        uiState.isDeleteRequestDialogVisible = true
                      }
                    "
                  >
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
  <div v-else class="ma-3 overflow-auto">
    <VCard class="desktop-view">
      <label class="font-weight-medium mb-4 d-block text-center pt-3">
        مرخصی‌های روزانه ماه جاری
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
</template>

<style scoped>
.desktop-view {
  height: 500px;
  display: grid;
  grid-template-rows: auto 1fr;
}
</style>
