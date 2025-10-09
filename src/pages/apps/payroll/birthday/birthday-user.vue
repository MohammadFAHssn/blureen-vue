<script setup>
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
  },
})

// states
const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isBirthdayGiftChooseDialogVisible: false,
})

const pendingState = reactive({
  fetchingBirthdayGifts: false,
  chooseBirthdayGift: false,
})

const birthdayGifts = ref([])

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
  { headerName: 'تصویر', field: 'image' },
  { headerName: 'موجودی', field: 'amount' },
  {
    headerName: 'عملیات',
    field: 'actions',
    cellRendererSelector: (_params) => {
      return {
        component: 'Actions',
        params: {
          onChooseClick: (selectedNode) => {
            selectedNodes.value = [selectedNode]
            uiState.isBirthdayGiftChooseDialogVisible = true
          },
        },
      }
    },
  },
])

const rowData = computed(() =>
  birthdayGifts.value?.map((file) => {
    return {
      id: file.id,
      name: file.name,
      code: file.code,
      image: file.image,
      amount: file.amount,
      actions: {
        chooseable: true,
      },
    }
  }),
)

async function fetchbirthdayGifts() {
  pendingState.fetchingBirthdayGifts = true
  gridApi.value?.setGridOption('loading', true)
  try {
    const res = await $api('/birthday/gift/get-actives', { method: 'GET' })

    birthdayGifts.value = res?.data?.birthdayGifts || []
  }
  catch (e) {
    console.error('Error fetching birthdayGifts:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت هدایا'
  }
  finally {
    pendingState.fetchingBirthdayGifts = false
    gridApi.value?.setGridOption('loading', false)
  }
}

fetchbirthdayGifts()

async function onChoose() {
  const id = selectedNodes.value[0].data.id
  pendingState.chooseBirthdayGift = true
  try {
    await $api('/birthday/user/choose/', {
      method: 'POST',
      body: JSON.stringify({ id }),
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage
            = response._data?.error || 'خطا در انتخاب هدیه'
        }
      },
    })
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.chooseBirthdayGift = false
    uiState.isBirthdayGiftChooseDialogVisible = false
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

    <AreYouSureDialog
      v-if="uiState.isBirthdayGiftChooseDialogVisible"
      v-model:is-dialog-visible="uiState.isBirthdayGiftChooseDialogVisible"
      title="آیا از انتخاب این هدیه اطمینان دارید؟"
      :loading="pendingState.chooseBirthdayGift"
      @confirm="onChoose"
    />
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
