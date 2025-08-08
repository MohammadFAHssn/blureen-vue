<script setup>
// --- Meta ---
definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const route = useRoute()
const router = useRouter()

// --- States ---
const tender = ref(null)
const supplier = ref(null)
const tenderBids = ref([])

const tenderExpiresIn = ref(0)

const uiState = reactive({
  hasError: false,
  errorMessage: '',
  isSuccessful: false,
  HaveTenderBidsBeenSent: [],
  isSendTenderBidPending: [],
})

const formState = reactive({
  paymentTerms: 'cash',
  creditDescription: '',
  invoiceType: 'taxInvoice',
})

let intervalId = null

// --- Methods ---
function startCountDown() {
  tenderExpiresIn.value = Math.max(
    0,
    tender.value.tenderExpiresAt - Math.floor(Date.now() / 1000),
  )

  intervalId = setInterval(() => {
    tenderExpiresIn.value--
    if (tenderExpiresIn.value <= 0) {
      router.replace({ name: 'login-supplier' })
    }
  }, 1000)
}

function bidPriceColor(index, length) {
  if (length <= 1) return '#28a745'
  const hue = 120 - (index / (length - 1)) * 120

  return `hsl(${hue}, 100%, 50%)`
}

async function sendTenderBid(tenderBid) {
  const { id, bidPrice, bidQuantity, bidDescription } = tenderBid
  if (!bidPrice || !bidQuantity) return

  uiState.isSendTenderBidPending[id] = true

  try {
    await $api('/commerce/tender/submit-bid', {
      method: 'POST',

      // TODO: we should send the token
      body: {
        id,
        bid_price: bidPrice,
        bid_quantity: bidQuantity,
        bid_description: bidDescription || '',
        payment_terms: formState.paymentTerms,
        payment_terms_description:
          formState.paymentTerms === 'credit'
            ? formState.creditDescription
            : '',
        invoice_type: formState.invoiceType,
      },
      onResponseError({ response }) {
        uiState.hasError = true
        uiState.errorMessage = response._data.message || 'خطا در ارسال پیشنهاد'
      },
    })

    uiState.HaveTenderBidsBeenSent[id] = true
    uiState.isSuccessful = true
  } catch (err) {
    console.error(err)
  } finally {
    uiState.isSendTenderBidPending[id] = false
  }
}

async function fetchTenderData() {
  try {
    const { data, error } = await useApi(
      createUrl(`/commerce/tender/get-by-token?token=${route.params.token}`),
    )

    if (error.value) throw error.value

    tender.value = data.value.data
    supplier.value = data.value.data.supplier
    tenderBids.value = data.value.data.tenderBids || []

    startCountDown()
  } catch (e) {
    uiState.hasError = true
    uiState.errorMessage = e.message || 'خطا در دریافت اطلاعات مناقصه'
    setTimeout(() => {
      router.replace({ name: 'login-supplier' })
    }, 2000)
  }
}

await fetchTenderData()

const timeRemaining = computed(() => {
  const totalSeconds = tenderExpiresIn.value
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    days,
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  }
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<template>
  <VSnackbar
    v-model="uiState.hasError"
    timeout="2000"
    location="center"
    variant="flat"
    color="error"
  >
    {{ uiState.errorMessage }}، در حال انتقال به پنل تأمین‌کننده ...
  </VSnackbar>

  <VSnackbar
    v-model="uiState.isSuccessful"
    timeout="1500"
    location="center"
    variant="flat"
    color="success"
  >
    ارسال شد!
  </VSnackbar>

  <main v-if="tender" class="layout-page-content">
    <VRow>
      <VCol>
        <div class="text-wrap mb-2">
          مدیریت محترم شرکت/فروشگاه
          <span class="text-h6">{{ supplier.name }}</span>
        </div>
        <div class="text-body-1">
          لیست کالاهای مورد نیاز مجموعه کارخانجات شیشه اردکان به شرح زیر
          می‌باشد.
        </div>
        <div class="text-body-1">
          لطفاً قیمت‌های پیشنهادی خود را ارائه دهید.
        </div>
      </VCol>
    </VRow>

    <VRow>
      <VList style="background-color: rgb(var(--v-theme-background))">
        <VListItem>
          <template #prepend>
            <VAvatar
              color="warning"
              variant="tonal"
              rounded
              icon="tabler-stopwatch"
            />
          </template>
          <VListItemTitle class="font-weight-medium">
            مدت زمان باقی‌مانده تا پایان مناقصه:
          </VListItemTitle>
          <VListItemSubtitle class="text-body-1">
            <VChip v-if="timeRemaining.days > 0">
              {{ timeRemaining.days }} روز و {{ timeRemaining.hours }} ساعت
            </VChip>
            <VChip v-else>
              {{ timeRemaining.hours }}:{{ timeRemaining.minutes }}:{{
                timeRemaining.seconds
              }}
            </VChip>
          </VListItemSubtitle>
        </VListItem>
      </VList>
    </VRow>

    <VRow>
      <VCol cols="12" md="6" lg="4">
        <VCard>
          <VCardText class="custom-v-card-text">
            <VLabel class="mb-2"> شرایط پرداخت </VLabel>
            <VRadioGroup v-model="formState.paymentTerms" inline>
              <VRadio label="نقدی" value="cash" />
              <VRadio label="شرایطی" value="credit" />
            </VRadioGroup>
            <AppTextField
              v-if="formState.paymentTerms === 'credit'"
              v-model="formState.creditDescription"
              type="text"
              placeholder="توضیحات"
            />
          </VCardText>

          <VDivider />

          <VCardText class="custom-v-card-text">
            <VLabel class="mb-2"> نوع فاکتور </VLabel>
            <VRadioGroup v-model="formState.invoiceType" inline>
              <VRadio label="فاکتور رسمی" value="taxInvoice" />
              <VRadio label="فاکتور فروشگاهی" value="commercialInvoice" />
            </VRadioGroup>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <VExpandTransition group>
        <VCol
          v-for="tenderBid in tenderBids.filter(
            (tb) => !uiState.HaveTenderBidsBeenSent[tb.id],
          )"
          :key="tenderBid.id"
          cols="12"
          md="6"
          lg="4"
        >
          <VCard>
            <VCardItem>
              <VCardTitle class="custom-v-card-title">
                {{ tenderBid.tenderProduct.product.name }}
                <template v-if="tenderBid.tenderProduct.brand">
                  ({{ tenderBid.tenderProduct.brand.name }})
                </template>
              </VCardTitle>
            </VCardItem>

            <VCardText>
              {{ tenderBid.tenderProduct.purchaseExpertDescription }}
            </VCardText>

            <VCardText>
              <VCard variant="outlined">
                <VCardText>
                  قیمت‌های پیشنهادی از سایر تأمین‌کنندگان (تومان):
                </VCardText>
                <VCardText class="d-flex flex-wrap gap-x-4 gap-y-2">
                  <VChip
                    v-for="(bid, index) in tenderBid.bidOfOtherSuppliers"
                    :key="bid.supplierId"
                    :variant="
                      bid.supplierId === supplier.id ? 'flat' : 'outlined'
                    "
                    :color="
                      bidPriceColor(index, tenderBid.bidOfOtherSuppliers.length)
                    "
                  >
                    {{ bid.bidPrice }}
                  </VChip>
                </VCardText>
              </VCard>
            </VCardText>

            <VCardText>
              <VForm
                validate-on="submit lazy"
                @submit.prevent="sendTenderBid(tenderBid)"
              >
                <VRow>
                  <VCol cols="12">
                    <AppTextField
                      v-model="tenderBid.bidPrice"
                      label="قیمت"
                      type="number"
                      prepend-inner-icon="tabler-coin"
                      suffix="تومان"
                      :rules="[requiredValidator]"
                    />
                  </VCol>

                  <VCol cols="12">
                    <AppTextField
                      v-model="tenderBid.bidQuantity"
                      label="تعداد"
                      type="number"
                      prepend-inner-icon="tabler-scale"
                      :suffix="
                        tenderBid.tenderProduct.product.counting_unit.UntName
                      "
                      :placeholder="`مقدار مورد نیاز: ${tenderBid.tenderProduct.quantityRequired}`"
                      :rules="[requiredValidator]"
                    />
                  </VCol>

                  <VCol cols="12">
                    <AppTextarea
                      v-model="tenderBid.bidDescription"
                      label="توضیحات"
                      rows="3"
                    />
                  </VCol>

                  <VCol cols="12">
                    <VBtn
                      type="submit"
                      :loading="uiState.isSendTenderBidPending[tenderBid.id]"
                      :disabled="!tenderBid.bidPrice || !tenderBid.bidQuantity"
                    >
                      <VIcon icon="tabler-send" />ارسال
                    </VBtn>
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VCard>
        </VCol>
      </VExpandTransition>
    </VRow>
  </main>
</template>

<style scoped lang="scss">
.layout-page-content {
  overflow: hidden;

  > :first-child {
    max-block-size: 100%;
  }
}

.custom-v-card-title {
  white-space: break-spaces !important;
}

.custom-v-card-text {
  padding: 1em !important;
}
</style>
