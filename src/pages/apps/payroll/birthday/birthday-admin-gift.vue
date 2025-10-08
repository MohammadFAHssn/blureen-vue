<script setup>
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'
import BirthdayGiftCreateDialog from '@/views/apps/payroll/birthday/BirthdayGiftCreateDialog.vue'
import BirthdayGiftImageDialog from '@/views/apps/payroll/birthday/BirthdayGiftImageDialog.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isBirthdayGiftCreateDialogVisible: false,
  isBirthdayGiftDeleteDialogVisible: false,
  isBirthdayGiftImageDialogVisible: false,
})

const pendingState = reactive({
  createBirthdayGift: false,
  fetchingsBirthdayGifts: false,
  deleteBirthdayGift: false,
  detailsBirthdayGift: false,
})

const birthdayGifts = ref([])
const selectedImage = ref(null)
const showImageDialog = ref(false)

const selectedBirthdayGift = ref(null)
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
  { headerName: 'کد', field: 'code' },
  {
    headerName: 'تصویر',
    field: 'image',
    cellRenderer: ({ value }) => {
      if (!value) return ''
      return `<img src="${value}" style="width:50px; height:auto; cursor:pointer;" />`
    },
    cellRendererParams: {
      onClick: (params) => {
        selectedImage.value = params.value
        showImageDialog.value = true
      },
    },
  },
  {
    headerName: 'وضعیت',
    field: 'status',
    cellRenderer: 'Active',
    cellStyle: { display: 'flex', 'align-items': 'center' },
    filterParams: {
      valueFormatter: (params) => (params.value === 1 ? 'فعال' : 'غیرفعال'),
    },
  },
  { headerName: 'موجودی', field: 'amount' },
  { headerName: 'ایجاد شده توسط', field: 'createdBy' },
  { headerName: 'آخرین ویرایش توسط', field: 'editedBy' },
  {
    headerName: 'تاریخ ایجاد',
    field: 'createdAt',
    valueFormatter: (params) =>
      moment(params.value, 'jYYYY-jMM-jDD HH:mm:ss').format(
        'jYYYY/jMM/jD HH:mm:ss',
      ),
  },
  {
    headerName: 'تاریخ آخرین ویرایش',
    field: 'updatedAt',
    valueFormatter: (params) =>
      moment(params.value, 'jYYYY-jMM-jDD HH:mm:ss').format(
        'jYYYY/jMM/jD HH:mm:ss',
      ),
  },
  {
    headerName: 'عملیات',
    field: 'actions',
    cellRendererSelector: (params) => {
      return {
        component: 'Actions',
        params: {
          onDeleteClick: (selectedNode) => {
            selectedNodes.value = [selectedNode]
            uiState.isBirthdayGiftDeleteDialogVisible = true
          },
          onDetailsClick: (selectedNode) => {
            selectedNodes.value = [selectedNode]
            selectedBirthdayGift.value = birthdayGifts.value.find(
              (gift) => gift.id === selectedNode.data.id,
            )
            uiState.isBirthdayGiftImageDialogVisible = true
          },
        },
      }
    },
  },
])

const rowData = computed(() =>
  birthdayGifts.value?.map((gift) => {
    return {
      id: gift.id,
      name: gift.name,
      code: gift.code,
      image: gift.image,
      status: gift.status,
      amount: gift.amount,
      createdBy: gift.createdBy?.fullName || '--',
      editedBy: gift.editedBy?.fullName || '--',
      createdAt: moment(gift.createdAt).format('jYYYY-jMM-jDD HH:mm:ss'),
      updatedAt: moment(gift.updatedAt).format('jYYYY-jMM-jDD HH:mm:ss'),
      actions: {
        deletable: true,
        detailsable: true,
      },
    }
  }),
)

// ----- end ag-grid -----

// ----- -----

async function fetchBirthdayGifts() {
  pendingState.fetchingsBirthdayGifts = true
  gridApi.value?.setGridOption('loading', true)
  try {
    const res = await $api('/birthday/gift/', { method: 'GET' })

    birthdayGifts.value = res?.data?.birthdayGifts || []
  } catch (e) {
    console.error('Error fetching birthdayGifts:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت هدایا'
  } finally {
    pendingState.fetchingsBirthdayGifts = false
    gridApi.value?.setGridOption('loading', false)
  }
}

fetchBirthdayGifts()

async function onCreateBirthdayGift(payload) {
  const formData = new FormData()

  formData.append('name', payload.birthdayGiftName)
  formData.append('code', payload.birthdayGiftCode)
  formData.append('amount', payload.birthdayGiftAmount)
  formData.append('image', payload.birthdayGiftImage)

  pendingState.createBirthdayGift = true

  try {
    await $api('/birthday/gift/', {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        } else {
          uiState.errorMessage = response._data?.message || 'خطا در ایجاد هدیه'
        }
      },
    })

    uiState.isBirthdayGiftCreateDialogVisible = false
  } catch (err) {
    console.error(err)
  } finally {
    pendingState.createBirthdayGift = false
    fetchBirthdayGifts()
  }
}

async function onDelete() {
  const id = selectedNodes.value[0].data.id
  pendingState.deleteBirthdayGift = true
  try {
    await $api(`/birthday/gift/${id}`, {
      method: 'DELETE',
      onResponseError({ response }) {
        pendingState.deleteBirthdayGift = false
        uiState.hasError = true
        uiState.errorMessage = response._data.message || 'خطا در حذف هدیه'
      },
    })

    pendingState.deleteBirthdayGift = false
    uiState.isBirthdayGiftDeleteDialogVisible = false
    birthdayGifts.value = birthdayGifts.value.filter(
      (gift) => gift.id !== selectedNodes.value[0].data.id,
    )
  } catch (err) {
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
      variant="flat"
      color="error"
    >
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

    <BirthdayGiftCreateDialog
      v-if="uiState.isBirthdayGiftCreateDialogVisible"
      v-model:is-dialog-visible="uiState.isBirthdayGiftCreateDialogVisible"
      :loading="pendingState.createBirthdayGift"
      @submit="onCreateBirthdayGift"
    />

    <BirthdayGiftImageDialog
      v-model:is-dialog-visible="showImageDialog"
      :file="{ image: selectedImage }"
    />

    <AreYouSureDialog
      v-if="uiState.isBirthdayGiftDeleteDialogVisible"
      v-model:is-dialog-visible="uiState.isBirthdayGiftDeleteDialogVisible"
      title="آیا از حذف این هدیه اطمینان دارید؟"
      :loading="pendingState.deleteBirthdayGift"
      @confirm="onDelete"
    />

    <VApp>
      <VFab
        app
        icon="tabler-plus"
        size="x-large"
        @click="uiState.isBirthdayGiftCreateDialogVisible = true"
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
