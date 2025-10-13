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
  <VLayout class="pa-4 d-flex flex-column h-100">
    <VSnackbar
      v-model="uiState.hasError"
      :timeout="2000"
      location="center"
      variant="flat"
      color="error"
    >
      {{ uiState.errorMessage }}
    </VSnackbar>

    <VAlert
      v-if="theGift === null"
      type="error"
      variant="tonal"
    >
      در حال حاضر شما اجازه مشاهده یا انتخاب هدیه را ندارید.
    </VAlert>

    <div v-else class="flex-grow-1 overflow-y-auto pb-8">
      <div v-if="pendingState.fetchingBirthdayGifts" class="d-flex justify-center align-center h-100">
        <VProgressCircular indeterminate color="primary" size="64" />
      </div>

      <!-- Gift Cards -->
      <VContainer v-else-if="birthdayGifts.length" fluid>
        <VRow dense justify="center">
          <VCol
            v-for="gift in birthdayGifts"
            :key="gift.id"
            cols="12"
            sm="6"
            md="4"
            lg="2"
            class="d-flex"
          >
            <VCard
              class="d-flex flex-column text-center"
              :elevation="theGift === gift.id ? 10 : 2"
              :class="{ 'border-primary': theGift === gift.id }"
              max-width="280"
              width="100%"
            >
              <VImg
                :src="`${storageBase}/${gift.image}`"
                cover
                height="200"
                class="flex-sm-grow-0 flex-sm-shrink-0 cursor-pointer"
                width="100%"
                min-width="120"
                @click="openImageDialog(gift)"
              />

              <div class="d-flex flex-column justify-center align-center flex-grow-1 pa-3">
                <VCardTitle class="text-center text-wrap mb-2">
                  {{ gift.name }}
                </VCardTitle>

                <VBtn
                  :color="gift.amount > 0 ? 'primary' : 'error'"
                  variant="flat"
                  :disabled="gift.amount <= 0"
                  class="mb-2"
                  @click="gift.amount > 0 && openChooseDialog(gift)"
                >
                  {{ gift.amount > 0 ? 'انتخاب هدیه' : 'ناموجود' }}
                </VBtn>

                <VChip
                  v-if="theGift === gift.id"
                  color="success"
                  variant="flat"
                  size="small"
                >
                  هدیه شما
                </VChip>
              </div>
            </VCard>
          </VCol>
        </VRow>
      </VContainer>

      <VAlert
        v-else
        type="info"
        variant="tonal"
        class="text-center mt-8"
      >
        هیچ هدیه‌ای یافت نشد.
      </VAlert>
    </div>

    <AreYouSureDialog
      v-if="uiState.isBirthdayGiftChooseDialogVisible"
      v-model:is-dialog-visible="uiState.isBirthdayGiftChooseDialogVisible"
      title="آیا از انتخاب این هدیه اطمینان دارید؟"
      :loading="pendingState.chooseBirthdayGift"
      @confirm="onChoose"
    />

    <VDialog
      v-model="uiState.isImageDialogVisible"
      width="500"
      transition="dialog-bottom-transition"
    >
      <VCard>
        <VCardText class="text-center">
          <VImg
            :src="selectedImage"
            alt="gift preview"
            max-width="100%"
            max-height="70vh"
            class="rounded-lg"
            contain
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
