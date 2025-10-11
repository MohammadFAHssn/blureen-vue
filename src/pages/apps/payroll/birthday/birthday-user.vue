<script setup>
import AreYouSureDialog from '@/components/dialogs/AreYouSureDialog.vue'

const storageBase = import.meta.env.VITE_STORAGE_BASE_URL

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
  },
})

const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isBirthdayGiftChooseDialogVisible: false,
  isImageDialogVisible: false,
})

const pendingState = reactive({
  fetchingBirthdayGifts: false,
  chooseBirthdayGift: false,
})

const birthdayGifts = ref([])
const theGift = ref(null)
const selectedGift = ref(null)
const selectedImage = ref('')

// Fetch gifts
async function fetchBirthdayGifts() {
  pendingState.fetchingBirthdayGifts = true
  try {
    const res = await $api('/birthday/gift/get-actives', { method: 'GET' })
    birthdayGifts.value = res?.data?.birthdayGifts || []
  }
  catch (e) {
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت هدایا'
  }
  finally {
    pendingState.fetchingBirthdayGifts = false
  }
}

// Choose gift
async function onChoose() {
  const id = selectedGift.value?.id
  if (!id) return

  pendingState.chooseBirthdayGift = true
  try {
    await $api('/birthday/user/choose/', {
      method: 'POST',
      body: JSON.stringify({ id }),
      onResponseError({ response }) {
        uiState.hasError = true
        uiState.errorMessage
          = response._data?.error
            || Object.values(response._data?.errors || {}).flat().join(' | ')
            || 'خطا در انتخاب هدیه'
      },
    })
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pendingState.chooseBirthdayGift = false
    uiState.isBirthdayGiftChooseDialogVisible = false
    await fetchBirthdayGifts()
    await canSee()
  }
}

// Check user access
async function canSee() {
  try {
    const res = await $api('/birthday/user/check', { method: 'GET' })
    theGift.value = res?.data ?? null
  }
  catch (e) {
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در بررسی دسترسی'
  }
}

// Dialog handlers
function openChooseDialog(gift) {
  selectedGift.value = gift
  uiState.isBirthdayGiftChooseDialogVisible = true
}

function openImageDialog(gift) {
  selectedImage.value = `${storageBase}/${gift.image}`
  uiState.isImageDialogVisible = true
}

// Init
await fetchBirthdayGifts()
await canSee()
</script>

<template>
  <VLayout class="app-layout pa-4">
    <VSnackbar
      v-model="uiState.hasError"
      :timeout="2000"
      location="center"
      variant="flat"
      color="error"
    >
      {{ uiState.errorMessage }}
    </VSnackbar>

    <!-- No access -->
    <div v-if="theGift === null" class="no-access-message">
      در حال حاضر شما اجازه مشاهده یا انتخاب هدیه را ندارید.
    </div>

    <!-- Gift list -->
    <div v-else class="gift-grid-container">
      <VProgressCircular
        v-if="pendingState.fetchingBirthdayGifts"
        indeterminate
        color="primary"
        size="64"
        class="mx-auto mt-10"
      />

      <div v-else-if="birthdayGifts.length" class="gift-grid">
        <div
          v-for="gift in birthdayGifts"
          :key="gift.id"
          class="gift-card"
          :class="{ 'selected-gift': theGift === gift.id }"
        >
          <img
            :src="`${storageBase}/${gift.image}`"
            alt="gift image"
            class="gift-image"
            @click="openImageDialog(gift)"
          />

          <div class="gift-info">
            <p class="gift-name">
              {{ gift.name }}
            </p>
          </div>

          <VBtn
            :color="gift.amount > 0 ? 'primary' : 'error'"
            variant="flat"
            :disabled="gift.amount <= 0"
            @click="gift.amount > 0 && openChooseDialog(gift)"
          >
            {{ gift.amount > 0 ? 'انتخاب هدیه' : 'ناموجود' }}
          </VBtn>

          <!-- Already chosen -->
          <span
            v-if="theGift === gift.id"
            style="color: #5abe5f; font-size: 0.9rem; margin-top: 0.5rem;"
          >
            هدیه شما
          </span>
        </div>
      </div>

      <p v-else class="text-center">
        هیچ هدیه‌ای یافت نشد.
      </p>
    </div>

    <!-- Confirm Dialog -->
    <AreYouSureDialog
      v-if="uiState.isBirthdayGiftChooseDialogVisible"
      v-model:is-dialog-visible="uiState.isBirthdayGiftChooseDialogVisible"
      title="آیا از انتخاب این هدیه اطمینان دارید؟"
      :loading="pendingState.chooseBirthdayGift"
      @confirm="onChoose"
    />

    <!-- Image Preview Dialog -->
    <VDialog
      v-model="uiState.isImageDialogVisible"
      width="500"
      transition="dialog-bottom-transition"
    >
      <VCard>
        <VCardText class="text-center">
          <img
            :src="selectedImage"
            alt="gift preview"
            style="max-width: 100%; max-height: 70vh; border-radius: 8px;"
          />
        </VCardText>
        <VCardActions class="justify-center">
          <VBtn color="primary" variant="tonal" @click="uiState.isImageDialogVisible = false">
            بستن
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VLayout>
</template>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fafafa;
}

.gift-grid-container {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 2rem;
}

.gift-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-top: 1rem;
}

.gift-card {
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: 0.2s ease-in-out;
  position: relative;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
}

.selected-gift {
  border: 2px solid #1976d2;
  box-shadow: 0 0 10px rgba(25, 118, 210, 0.4);
}

.gift-image {
  height: 60px;
  margin-bottom: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  object-fit: contain;
}

.gift-info {
  margin-bottom: 0.5rem;
}

.gift-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.gift-code,
.gift-amount {
  font-size: 0.875rem;
  color: #666;
}

.chosen-text {
  color: #5abe5f;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.no-access-message {
  margin: auto;
  font-size: 1.1rem;
  color: #d32f2f;
  text-align: center;
  padding: 2rem;
}
</style>
