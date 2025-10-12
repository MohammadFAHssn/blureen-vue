<script setup>
// computed handy for display (format dates)
import moment from 'moment-jalaali'
import { computed, onMounted, reactive, ref } from 'vue'
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'
import BirthdayGiftCreateDialog from '@/views/apps/payroll/birthday/BirthdayGiftCreateDialog.vue'
import BirthdayGiftDetailsDialog from '@/views/apps/payroll/birthday/BirthdayGiftDetailsDialog.vue'
import BirthdayGiftEditDialog from '@/views/apps/payroll/birthday/BirthdayGiftEditDialog.vue'

const storageBase = import.meta.env.VITE_STORAGE_BASE_URL

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
  isBirthdayGiftEditDialogVisible: false,
  isBirthdayGiftDeleteDialogVisible: false,
  isBirthdayGiftImageDialogVisible: false,
  // new preview dialog:
  isImagePreviewVisible: false,
  previewImageUrl: '',
})

const pendingState = reactive({
  createBirthdayGift: false,
  editBirthdayGift: false,
  imageBirthdayGift: false,
  fetchingsBirthdayGifts: false,
  deleteBirthdayGift: false,
  detailsBirthdayGift: false,
})

const birthdayGifts = ref([])
const selectedBirthdayGift = ref(null)

// Attempt to resolve storage base (safe fallback)
// let storageBase = '/storage'
// try {
//   const runtime = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : {}
//   storageBase = runtime?.public?.storageBase || storageBase
// }
// catch (e) {
//   // fallback kept
// }

// helper to build image URL (handles absolute urls too)
function getImageUrl(gift) {
  if (!gift) return ''
  const img = gift.image || gift.image_path || gift.file || ''
  if (!img) return ''
  if (img.startsWith('http') || img.startsWith('/')) return img
  return `${storageBase}/${img}`
}

// fetcher (kept your existing API usage)
async function fetchBirthdayGifts() {
  pendingState.fetchingsBirthdayGifts = true
  try {
    const res = await $api('/birthday/gift/', { method: 'GET' })
    birthdayGifts.value = res?.data?.birthdayGifts || []
  }
  catch (e) {
    console.error('Error fetching birthdayGifts:', e)
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت هدایا'
  }
  finally {
    pendingState.fetchingsBirthdayGifts = false
  }
}

onMounted(() => {
  fetchBirthdayGifts()
})

// create
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
        }
        else {
          uiState.errorMessage = response._data?.message || 'خطا در ایجاد هدیه'
        }
      },
    })
    uiState.isBirthdayGiftCreateDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.createBirthdayGift = false
    fetchBirthdayGifts()
  }
}

// edit
async function onEditBirthdayGift(payload) {
  const formData = new FormData()
  formData.append('name', payload.birthdayGiftName)
  formData.append('code', payload.birthdayGiftCode)
  formData.append('amount', payload.birthdayGiftAmount)
  if (payload.birthdayGiftImage) formData.append('image', payload.birthdayGiftImage)
  formData.append('status', payload.birthdayGiftStatus)

  const id = selectedBirthdayGift.value?.id
  if (!id) {
    uiState.hasError = true
    uiState.errorMessage = 'هدیه‌ای انتخاب نشده است'
    return
  }

  pendingState.editBirthdayGift = true

  try {
    await $api(`/birthday/gift/${id}`, {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage = response._data?.message || 'خطا در ویرایش هدیه'
        }
      },
    })
    uiState.isBirthdayGiftEditDialogVisible = false
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.editBirthdayGift = false
    fetchBirthdayGifts()
  }
}

// delete
async function onDelete() {
  const id = selectedBirthdayGift.value?.id
  if (!id) {
    uiState.hasError = true
    uiState.errorMessage = 'هدیه‌ای انتخاب نشده است'
    return
  }

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

    uiState.isBirthdayGiftDeleteDialogVisible = false
    // optimistic remove
    birthdayGifts.value = birthdayGifts.value.filter(g => g.id !== id)
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.deleteBirthdayGift = false
  }
}

// card actions
function openEdit(gift) {
  selectedBirthdayGift.value = gift
  uiState.isBirthdayGiftEditDialogVisible = true
}

function openDelete(gift) {
  selectedBirthdayGift.value = gift
  uiState.isBirthdayGiftDeleteDialogVisible = true
}

function openDetails(gift) {
  selectedBirthdayGift.value = gift
  uiState.isBirthdayGiftImageDialogVisible = true // if you want to reuse your details dialog
}

function openImagePreview(gift) {
  selectedBirthdayGift.value = gift
  uiState.previewImageUrl = getImageUrl(gift)
  uiState.isImagePreviewVisible = true
}
const displayGifts = computed(() =>
  birthdayGifts.value.map(gift => ({
    ...gift,
    createdByText: gift.createdBy?.fullName || '--',
    editedByText: gift.editedBy?.fullName || '--',
    createdAtText: gift.createdAt ? moment(gift.createdAt).format('jYYYY/jMM/jD HH:mm:ss') : '--',
    updatedAtText: gift.updatedAt ? moment(gift.updatedAt).format('jYYYY/jMM/jD HH:mm:ss') : '--',
    imageUrl: getImageUrl(gift),
  })),
)
</script>

<template>
  <VLayout class="app-layout">
    <VSnackbar
      v-model="uiState.hasError"
      :timeout="4000"
      location="center"
      variant="flat"
      color="error"
    >
      {{ uiState.errorMessage }}
    </VSnackbar>

    <section class="cards-section">
      <div class="cards-container">
        <template v-if="displayGifts.length">
          <div class="cards-grid">
            <VCard
              v-for="gift in displayGifts"
              :key="gift.id"
              class="gift-card"
              elevation="2"
            >
              <VCardText class="card-image-wrap" @click="openImagePreview(gift)">
                <VImg
                  :src="`${storageBase}/${gift.image}`"
                  aspect-ratio="16/9"
                  class="card-image"
                  cover
                >
                  <template #placeholder>
                    <div class="image-placeholder">
                      بدون تصویر
                    </div>
                  </template>
                </VImg>
              </VCardText>

              <VCardTitle class="card-title">
                {{ gift.name || 'بدون عنوان' }}
              </VCardTitle>

              <VCardText class="card-meta">
                <div>کد: {{ gift.code || '--' }}</div>
                <div>موجودی: {{ gift.amount ?? '--' }}</div>
                <div>وضعیت: {{ gift.status === 1 ? 'فعال' : 'غیرفعال' }}</div>
              </VCardText>

              <VCardActions>
                <VBtn text small @click="openDetails(gift)">
                  جزییات
                </VBtn>
                <VBtn text small @click="openEdit(gift)">
                  ویرایش
                </VBtn>
                <VBtn text small color="error" @click="openDelete(gift)">
                  حذف
                </VBtn>
              </VCardActions>
            </VCard>
          </div>
        </template>

        <div v-else class="empty-state">
          هیچ هدیه‌ای برای نمایش وجود ندارد.
        </div>
      </div>
    </section>

    <!-- image preview dialog (original image) -->
    <VDialog v-model="uiState.isImagePreviewVisible" persistent max-width="900">
      <VCard>
        <VCardTitle>مشاهده تصویر</VCardTitle>
        <VCardText class="preview-wrap">
          <img
            :src="uiState.previewImageUrl"
            alt="original image"
            class="preview-image"
            onerror="this.style.display='none'"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="uiState.isImagePreviewVisible = false">
            بستن
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- existing dialogs (create / edit / details / delete) -->
    <BirthdayGiftCreateDialog
      v-if="uiState.isBirthdayGiftCreateDialogVisible"
      v-model:is-dialog-visible="uiState.isBirthdayGiftCreateDialogVisible"
      :loading="pendingState.createBirthdayGift"
      @submit="onCreateBirthdayGift"
    />

    <BirthdayGiftEditDialog
      v-if="uiState.isBirthdayGiftEditDialogVisible"
      v-model:is-dialog-visible="uiState.isBirthdayGiftEditDialogVisible"
      :loading="pendingState.editBirthdayGift"
      :file="{ selectedBirthdayGift }"
      @submit="onEditBirthdayGift"
    />

    <BirthdayGiftDetailsDialog
      v-if="uiState.isBirthdayGiftImageDialogVisible"
      v-model:is-dialog-visible="uiState.isBirthdayGiftImageDialogVisible"
      :loading="pendingState.imageBirthdayGift"
      :file="{ image: selectedBirthdayGift }"
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

<style scoped lang="scss">
@use '@styles/variables/vuetify';
@use '@core/scss/base/mixins';

.app-layout {
  @include mixins.elevation(vuetify.$card-elevation);
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: 1fr auto;
  height: 100%;
}

/* make section fill available area, cards container scrollable */
.cards-section {
  block-size: 100%;
  display: flex;
  padding: 12px;
}

.cards-container {
  block-size: 100%;
  inline-size: 100%;
  overflow: auto; /* enables scrolling when content overflows */
  -webkit-overflow-scrolling: touch;
}

/* responsive grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  align-items: start;
  padding-bottom: 16px;
}

/* card styling */
.gift-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-image-wrap {
  cursor: pointer;
  padding: 0;
}

.card-image {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  min-height: 140px;
  max-height: 180px;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 140px;
  color: rgba(0, 0, 0, 0.4);
}

/* content spacing */
.card-title {
  font-weight: 600;
}

.card-meta {
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.7);
  margin-top: 6px;
  margin-bottom: 6px;
}

/* image preview */
.preview-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

/* empty state */
.empty-state {
  padding: 40px;
  text-align: center;
  color: rgba(0, 0, 0, 0.6);
}
</style>
