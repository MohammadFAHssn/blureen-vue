<script setup>
definePage({
  meta: {
    layout: "blank",
    public: true,
  },
})

const route = useRoute()
const router = useRouter()

const hasError = ref(false)
const tenderBids = ref([])
const tenderExpiresIn = ref()
let timeRemaining
const HaveTenderBidsBeenSent = ref([])
const isSendTenderBidPending = ref([])
const isSuccessful = ref(false)

let supplier
let tender

const startCountDown = () => {
  const tenderExpiresAt = data.value.data.tenderExpiresAt

  tenderExpiresIn.value = tenderExpiresAt - Math.floor(Date.now() / 1000)

  const intervalId = setInterval(() => {
    tenderExpiresIn.value -= 1

    if (tenderExpiresIn.value <= 0) {
      clearInterval(intervalId)
      tenderExpiresIn.value = 0
    }
  }, 1000)

  timeRemaining = computed(() => {
    const totalSeconds = tenderExpiresIn.value

    const days = Math.floor(totalSeconds / (3600 * 24))
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return {
      days,
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
    }
  })
}


const bidPriceColor = (index, length) => {
  if (length === 1) {
    return "#00ff00"
  }

  const red = Math.round((255 * index) / (length - 1))
  const green = Math.round(255 * (1 - index / (length - 1)))
  const blue = 0

  return (
    "#" +
    [red, green, blue]
      .map(x => {
        const hex = x.toString(16)

        return hex.length === 1 ? "0" + hex : hex
      })
      .join("")
  )
}

const sendTenderBid = async tenderBid => {
  if (!tenderBid.bidPrice || !tenderBid.bidQuantity) {
    return
  }

  isSendTenderBidPending.value[tenderBid.id] = true
  try {
    const res = await $api(
      import.meta.env.VITE_API_LEGACY_INTEGRATED_SYSTEM +
        "/tenderDetail/store-supplier-bids",
      {
        method: "POST",
        body: {
          id: tenderBid.id,
          bid_price: tenderBid.bidPrice,
          bid_quantity: tenderBid.bidQuantity,
          bid_description: tenderBid.bidDescription,
          payment_terms: tenderBid.paymentTerms,
          payment_terms_description: tenderBid.creditDescription,
          invoice_type: tenderBid.invoiceType,
        },
        onResponseError({ response }) {
          isSendTenderBidPending.value[tenderBid.id] = false
          if (response._data.errors) {
            errors.value = response._data.errors
          } else {
            isSendTenderBidPending.value[tenderBid.id] = false
            hasError.value = true
          }
        },
      },
    )

    isSendTenderBidPending.value[tenderBid.id] = false
    HaveTenderBidsBeenSent.value[tenderBid.id] = true
    isSuccessful.value = true
  } catch (err) {
    console.error(err)
  }
}

const { data, error } = await useApi(
  createUrl(
    import.meta.env.VITE_API_LEGACY_INTEGRATED_SYSTEM +
      "/tenderDetail/get-by-token?token=" +
      route.params.id,
  ),
)

hasError.value = !!error.value

if (hasError.value) {
  setTimeout(() => {
    router.replace({
      name: "login-supplier",
    })
  }, 2000)
} else {
  tender = data.value.data

  supplier = {
    id: tender.supplier.id,
    name: tender.supplier.name,
  }

  tenderBids.value = tender.tenderBids

  startCountDown()
}

onUnmounted(() => clearInterval(intervalId))
</script>

<template>
  <VSnackbar
    v-model="hasError"
    :timeout="2000"
    location="center"
    variant="flat"
    color="error"
  >
    {{ error.message }}
    ، در حال انتقال به پنل تأمین‌کننده ...
  </VSnackbar>

  <VSnackbar
    v-model="isSuccessful"
    :timeout="2000"
    location="center"
    variant="flat"
    color="success"
  >
    ارسال شد
  </VSnackbar>

  <main class="layout-page-content">
    <div>
      <VRow>
        <VCol>
          <div class="text-wrap mb-2">
            مدیریت محترم شرکت/فروشگاه
            <span class="text-h6">
              {{ supplier.name }}
            </span>
          </div>

          <div class="text-wrap text-body-1">
            لیست کالاهای مورد نیاز مجموعه کارخانجات شیشه اردکان به شرح زیر
            می‌باشد.
          </div>

          <div class="text-wrap text-body-1">
            لطفاً قیمت‌های پیشنهادی خود را ارائه دهید.
          </div>
        </VCol>
      </VRow>

      <VRow>
        <VList style="background-color: rgb(var(--v-theme-background));">
          <VListItem>
            <VListItemTitle class="font-weight-medium">
              مدت زمان باقی‌مانده تا پایان مناقصه:
            </VListItemTitle>

            <template #prepend>
              <VAvatar
                color="warning"
                variant="tonal"
                rounded
                icon="tabler-stopwatch"
              />
            </template>

            <VListItemSubtitle class="text-wrap text-body-1">
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
        <VCol
          cols="12"
          md="6"
          lg="4"
        >
          <VCard>
            <VCardText class="custom-v-card-text">
              <VLabel class="mb-2">
                شرایط پرداخت
              </VLabel>
              <VRadioGroup
                v-model="tenderBids[0].paymentTerms"
                inline
              >
                <VRadio
                  label="نقدی"
                  value="cash"
                />
                <VRadio
                  label="شرایطی"
                  value="credit"
                />
              </VRadioGroup>

              <AppTextField
                v-if="tenderBids[0].paymentTerms === 'credit'"
                v-model="tenderBids[0].creditDescription"
                type="text"
                placeholder="توضیحات"
              />
            </VCardText>

            <VDivider />

            <VCardText class="custom-v-card-text">
              <VLabel class="mb-2">
                نوع فاکتور
              </VLabel>
              <VRadioGroup
                v-model="tenderBids[0].invoiceType"
                inline
              >
                <VRadio
                  label="فاکتور رسمی"
                  value="taxInvoice"
                />
                <VRadio
                  label="فاکتور فروشگاهی"
                  value="commercialInvoice"
                />
              </VRadioGroup>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <VRow>
        <VExpandTransition group>
          <VCol
            v-for="tenderBid in tenderBids.filter(
              (tenderBid) => !HaveTenderBidsBeenSent[tenderBid.id],
            )"
            :key="tenderBid.id"
            cols="12"
            md="6"
            lg="4"
          >
            <VCard>
              <VCardTitle class="custom-v-card-title">
                {{
                  tenderBid.tenderProduct.product.name +
                    (tenderBid.brand ? ` (${tenderBid.brand.name})` : "")
                }}
              </VCardTitle>

              <VCardText>
                {{ tenderBid.tenderProduct.purchaseExpertDescription }}
              </VCardText>

              <VCardText>
                <VCard variant="outlined">
                  <VCardText>
                    قیمت‌های پیشنهادی از سایر تأمین‌کنندگان (ریال):
                  </VCardText>

                  <VCardText class="d-flex flex-wrap gap-x-4 gap-y-2">
                    <VChip
                      v-for="(bid, index) in tenderBid.bidOfOtherSuppliers"
                      :key="bid.supplierId"
                      :variant="
                        bid.supplierId === supplier.id ? 'flat' : 'outlined'
                      "
                      :color="
                        bidPriceColor(
                          index,
                          tenderBid.bidOfOtherSuppliers.length,
                        )
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
                        suffix="ریال"
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
                        :loading="isSendTenderBidPending[tenderBid.id]"
                      >
                        <VIcon icon="tabler-send" />
                        ارسال
                      </VBtn>
                    </VCol>
                  </VRow>
                </VForm>
              </VCardText>
            </VCard>
          </VCol>
        </VExpandTransition>
      </VRow>
    </div>
  </main>
</template>

<style lang="scss" scoped>
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
