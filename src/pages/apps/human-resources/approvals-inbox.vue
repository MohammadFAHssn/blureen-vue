<script setup>
import { useDisplay } from 'vuetify'
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'

definePage({ meta: { layoutWrapperClasses: 'layout-content-height-fixed' } })

const { theme } = useAGGridTheme()
const { mdAndUp } = useDisplay()
const isMobile = computed(() => !mdAndUp.value)

const state = reactive({
  ui: { hasError: false, errorMessage: '', success: false, successMessage: '' },
  loading: false,
  requests: [],
  gridApi: null,
  selection: { gridNodes: [], cardIds: [] },
  dialogs: { reject: false, approveConfirm: false, details: false },
  detailsItem: null,
  rejectReason: '',
  pendingNodes: [],
})

const fmtTimeRange = (r) =>
  r.start_time && r.end_time ? `${r.start_time} - ${r.end_time}` : '-'
const toIds = (nodes) =>
  (nodes ?? [])
    .map((n) => (n?.data ?? n)?.currentItemId ?? (n?.data ?? n)?.id)
    .filter(Boolean)
function resetSelection() {
  state.gridApi?.deselectAll?.()
  state.selection.gridNodes = []
  state.selection.cardIds = []
}
function raiseError(msg) {
  state.ui.hasError = true
  state.ui.errorMessage = msg
}
function raiseSuccess(msg) {
  state.ui.success = true
  state.ui.successMessage = msg
}

const rowData = computed(() =>
  (state.requests ?? []).map((item) => ({
    currentItemId: item.id,
    personnelCode: item.request.user.personnel_code,
    fullName: `${item.request.user.first_name} ${item.request.user.last_name}`,
    requestType: item.request.type.name,
    startDate: item.request.start_date,
    endDate: item.request.end_date,
    timeRange: fmtTimeRange(item.request),
    actions: { approvable: true, detailsable: true },
    raw: item,
  })),
)

const columnDefs = ref([
  { headerName: 'کد پرسنلی', field: 'personnelCode' },
  { headerName: 'نام و نام خانوادگی', field: 'fullName' },
  { headerName: 'نوع درخواست', field: 'requestType' },
  { headerName: 'تاریخ شروع', field: 'startDate' },
  { headerName: 'تاریخ پایان', field: 'endDate' },
  { headerName: 'زمان', field: 'timeRange' },
  {
    headerName: 'عملیات',
    field: 'actions',
    valueFormatter: () => '',
    suppressHeaderMenuButton: true,
    suppressHeaderContextMenu: true,
    cellRendererSelector: () => ({
      component: 'Actions',
      params: {
        onApproveClick: approveSingleRequest,
        onDetailsClick: openDetails,
      },
    }),
  },
])

const selectedCount = computed(() => effectiveSelectedIds().length)
const approveConfirmTitle = computed(() => {
  const count = toIds(state.pendingNodes).length || 1
  return `آیا از تایید ${count === 1 ? 'این مورد' : `${count} مورد`} اطمینان دارید؟`
})

function onGridReady(params) {
  state.gridApi = params.api
  state.gridApi.setGridOption('rowData', rowData.value)
}

watch(rowData, (rows) => state.gridApi?.setGridOption?.('rowData', rows))

const effectiveSelectedIds = () =>
  isMobile.value
    ? [...state.selection.cardIds]
    : toIds(state.selection.gridNodes)
const isCardSelected = (id) => state.selection.cardIds.includes(id)
function toggleCardSelection(id) {
  state.selection.cardIds = isCardSelected(id)
    ? state.selection.cardIds.filter((x) => x !== id)
    : [...state.selection.cardIds, id]
}
function selectAllMobile() {
  state.selection.cardIds = state.requests.map((r) => r.id)
}
function clearMobileSelection() {
  state.selection.cardIds = []
}

function openDetails(item) {
  state.detailsItem = item?.raw ?? item
  state.dialogs.details = true
}
function resetRejectDialogState() {
  state.dialogs.reject = false
  state.pendingNodes = []
  state.rejectReason = ''
}

async function handleApproveOrReject(approve, nodes) {
  const ids = toIds(nodes)
  if (!ids.length) return raiseError('هیچ ردیفی انتخاب نشده است.')
  if (approve === false && !state.rejectReason?.trim())
    return raiseError('ثبت علت رد الزامی است.')

  state.loading = true
  try {
    const body = {
      approve,
      approvalRequestsIds: ids,
      ...(approve === false ? { description: state.rejectReason.trim() } : {}),
    }
    // eslint-disable-next-line style/max-statements-per-line
    await $api('/hr-request/request/approve', {
      method: 'POST',
      body,
      onResponseError({ response }) {
        throw new Error(
          response?._data?.message || 'خطا در ثبت تایید/رد درخواست',
        )
      },
    })
    raiseSuccess(`با موفقیت ${approve ? 'تایید' : 'رد'} شد.`)
    resetRejectDialogState()
    await fetchRequests()
    resetSelection()
  } catch (err) {
    raiseError(err?.message || 'خطایی رخ داد')
  } finally {
    state.loading = false
  }
}

async function approveSingleRequest(rowOrNode, action) {
  const data = rowOrNode?.data ?? rowOrNode
  state.pendingNodes = [data]
  if (action === false) {
    state.rejectReason = ''
    state.dialogs.reject = true
    return
  }
  state.dialogs.approveConfirm = true
}

async function approveMultiRequest() {
  state.pendingNodes = isMobile.value
    ? state.selection.cardIds.map((id) => ({ id }))
    : state.gridApi?.getSelectedRows?.() || []
  state.dialogs.approveConfirm = true
}

function openRejectSelectedDialog() {
  state.pendingNodes = isMobile.value
    ? state.selection.cardIds.map(id => ({ id }))
    : state.gridApi?.getSelectedRows?.() || []
  state.rejectReason = ''
  state.dialogs.reject = true
}

const confirmRejectDialog = () =>
  handleApproveOrReject(false, state.pendingNodes)
async function confirmApproveDialog() {
  await handleApproveOrReject(true, state.pendingNodes)
  state.dialogs.approveConfirm = false
}

async function fetchRequests() {
  state.loading = true
  try {
    const { data, error } = await useApi(
      createUrl('/hr-request/requests/get-by-approver'),
    )
    if (error.value) throw error.value
    state.requests = data.value.data || []
    resetSelection()
  } catch (e) {
    raiseError(e?.message || 'خطا در دریافت درخواست‌ها')
  } finally {
    state.loading = false
  }
}

function onSelectionChanged() {
  state.selection.gridNodes = state.gridApi?.getSelectedRows?.() ?? []
  state.gridApi?.refreshCells?.({ force: true })
}

onMounted(() => {
  fetchRequests()
})
</script>

<template>
  <VLayout class="app-layout">
    <VSnackbar
      v-model="state.ui.hasError"
      :timeout="3000"
      location="center"
      variant="flat"
      color="error"
    >
      {{ state.ui.errorMessage }}
    </VSnackbar>
    <VSnackbar
      v-model="state.ui.success"
      :timeout="2000"
      location="center"
      variant="flat"
      color="success"
    >
      {{ state.ui.successMessage }}
    </VSnackbar>

    <section class="toolbar">
      <div class="left-actions">
        <VBtn
          v-if="selectedCount > 1"
          color="success"
          @click="approveMultiRequest"
        >
          تایید انتخاب‌شده‌ها ({{ selectedCount }})
        </VBtn>
        <VBtn
          v-if="selectedCount > 1"
          color="error"
          @click="openRejectSelectedDialog"
        >
          رد انتخاب‌شده‌ها ({{ selectedCount }})
        </VBtn>

        <template v-if="isMobile">
          <VBtn
            variant="text"
            density="comfortable"
            :disabled="!state.requests?.length"
            @click="selectAllMobile"
          >
            انتخاب همه
          </VBtn>
          <VBtn
            variant="text"
            density="comfortable"
            :disabled="!selectedCount"
            @click="clearMobileSelection"
          >
            حذف انتخاب‌ها
          </VBtn>
        </template>
      </div>
      <VSpacer />
      <VBtn
        variant="flat"
        color="primary"
        :loading="state.loading"
        :disabled="state.loading"
        title="بروزرسانی لیست"
        @click="fetchRequests"
      >
        <VIcon icon="tabler-refresh" />
      </VBtn>
    </section>

    <section v-show="!isMobile" style="block-size: 100%">
      <AgGridVue
        style="block-size: 100%; inline-size: 100%"
        :column-defs="columnDefs"
        :suppress-click-edit="true"
        :loading="state.loading"
        enable-rtl
        row-numbers
        pagination
        :row-selection="{
          mode: 'multiRow',
          enableClickSelection: false,
          enableSelectionWithoutKeys: true,
          checkboxes: true,
          headerCheckbox: true,
        }"
        :theme="theme"
        @grid-ready="onGridReady"
        @selection-changed="onSelectionChanged"
      />
    </section>

    <section v-show="isMobile" class="cards-wrapper">
      <VEmptyState
        v-if="!state.loading && !state.requests.length"
        headline="درخواستی یافت نشد"
        title="لیست خالی است"
      />
      <VContainer v-else fluid class="pa-2">
        <VRow dense>
          <VCol v-for="item in state.requests" :key="item.id" cols="12">
            <VCard
              class="request-card"
              :elevation="isCardSelected(item.id) ? 6 : 2"
              :class="{ 'request-card--selected': isCardSelected(item.id) }"
            >
              <VCardText class="pa-3">
                <div class="card-header">
                  <div class="card-title">
                    <div class="name">
                      {{ item.request.user.first_name }}
                      {{ item.request.user.last_name }}
                    </div>
                    <div class="meta">
                      کد پرسنلی: {{ item.request.user.personnel_code }}
                    </div>
                  </div>
                  <VCheckbox
                    :model-value="isCardSelected(item.id)"
                    density="comfortable"
                    :ripple="false"
                    class="card-checkbox"
                    color="primary"
                    hide-details
                    @update:model-value="toggleCardSelection(item.id)"
                  />
                </div>

                <div class="chips">
                  <VChip size="small" color="primary" variant="flat">
                    {{ item.request.type.name }}
                  </VChip>
                </div>

                <div class="rows">
                  <div class="row">
                    <span class="label">تاریخ شروع</span>
                    <span class="value">{{ item.request.start_date }}</span>
                  </div>
                  <div class="row">
                    <span class="label">تاریخ پایان</span>
                    <span class="value">{{ item.request.end_date }}</span>
                  </div>
                  <div class="row">
                    <span class="label">زمان</span>
                    <span class="value">{{ fmtTimeRange(item.request) }}</span>
                  </div>
                </div>
              </VCardText>

              <VDivider />

              <VCardActions class="pa-2 actions">
                <VBtn
                  size="small"
                  color="success"
                  @click="approveSingleRequest({ id: item.id }, true)"
                >
                  تایید
                </VBtn>
                <VBtn
                  size="small"
                  color="error"
                  variant="tonal"
                  @click="approveSingleRequest({ id: item.id }, false)"
                >
                  رد
                </VBtn>
                <VSpacer />
                <VBtn
                  size="small"
                  variant="outlined"
                  color="primary"
                  @click="openDetails(item)"
                >
                  جزئیات
                </VBtn>
              </VCardActions>
            </VCard>
          </VCol>
        </VRow>
      </VContainer>
    </section>

    <VDialog v-model="state.dialogs.reject" max-width="520">
      <VCard>
        <VCardTitle class="text-h6"> علت رد درخواست </VCardTitle>
        <VCardText>
          <VTextarea
            v-model="state.rejectReason"
            label="علت رد"
            auto-grow
            rows="3"
            :rules="[(v) => !!v || 'وارد کردن علت الزامی است']"
            :disabled="state.loading"
          />
        </VCardText>
        <VCardActions class="justify-space-between">
          <VBtn
            variant="text"
            :disabled="state.loading"
            @click="resetRejectDialogState"
          >
            لغو
          </VBtn>
          <VBtn
            color="error"
            :loading="state.loading"
            :disabled="!state.rejectReason"
            @click="confirmRejectDialog"
          >
            تایید رد
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VDialog v-model="state.dialogs.details" max-width="640">
      <VCard>
        <VCardTitle class="text-h6"> جزئیات درخواست </VCardTitle>
        <VCardText>
          <div v-if="state.detailsItem" class="text-body-2">
            <p>
              اینجا محل نمایش جزئیات است. بعداً فیلدهای موردنظر اضافه می‌شود.
            </p>
          </div>
        </VCardText>
        <VCardActions class="justify-end">
          <VBtn variant="text" @click="state.dialogs.details = false">
            بستن
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <AreYouSureDialog
      v-if="state.dialogs.approveConfirm"
      v-model:is-dialog-visible="state.dialogs.approveConfirm"
      :title="approveConfirmTitle"
      :loading="state.loading"
      @confirm="confirmApproveDialog"
    />
  </VLayout>
</template>

<style lang="scss" scoped>
.app-layout {
  display: grid;
  grid-template-rows: auto 1fr;
  inline-size: 100%;
  block-size: 100%;
  overflow-x: hidden;
}
.toolbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem;
  flex-wrap: wrap;
}
.left-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  max-inline-size: 100%;
}
.cards-wrapper {
  block-size: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-inline: 0.25rem;
}
.request-card {
  inline-size: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
.request-card--selected {
  outline: 2px solid rgba(var(--v-theme-primary), 0.45);
  outline-offset: 0;
}
.request-card .card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  justify-content: space-between;
}
.request-card .card-title {
  display: grid;
  gap: 0.125rem;
}
.request-card .card-title .name {
  font-weight: 600;
}
.request-card .card-title .meta {
  font-size: 0.85rem;
  opacity: 0.7;
}
.request-card .card-checkbox {
  margin-inline-start: 0.25rem;
  margin-inline-end: 0;
}
.request-card .chips {
  margin-block: 0.5rem;
}
.request-card .rows {
  display: grid;
  gap: 0.375rem;
}
.request-card .row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  column-gap: 1rem;
}
.request-card .label {
  opacity: 0.75;
  font-size: 0.9rem;
}
.request-card .value {
  font-weight: 500;
}
.request-card .actions {
  gap: 0.5rem;
}
:deep(.v-btn) {
  min-height: 36px;
}
@media (max-width: 960px) {
  .left-actions .v-btn {
    flex: 1 1 48%;
    min-width: 0;
  }
}
</style>
