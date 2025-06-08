<script setup>
definePage({
  meta: {
    layout: "blank",
    public: true,
  },
})

// const route = useRoute()
// <div>{{ route.params.id }}</div>
// const { execute: fetchUsers, data, error } = await useApi(createUrl("/test"))

const products = [
  {
    id: 1,
    name: "دستگاه پمپ چسب آکواریوم",
    description: "توضیحات",
    brands: [
      { id: 1, name: "آذرخش" },
      { id: 2, name: "شهاب" },
      { id: 3, name: "پارس" },
    ],
    unit: { name: "انس" },
    requiredQuantity: 50,
  },
  {
    id: 2,
    name: "الک",
    description:
      "توضیحاتی که طولانی باشد. توضیحاتی که طولانی باشد. توضیحاتی که طولانی باشد. توضیحاتی که طولانی باشد. توضیحاتی که طولانی باشد. توضیحاتی که طولانی باشد.",
    brands: [
      // { id: 1, name: "طهماسب" },
      // { id: 2, name: "دولک" },
    ],
    unit: { name: "کیلوگرم" },
    requiredQuantity: 100,
  },
  {
    id: 3,
    name: "فوم عایق صدا 5 سانتی ( شونه تخم مرغی)",
    description: "توضیحات",
    brands: [{ id: 1, name: "ایگو" }],
    unit: { name: "متر" },
    requiredQuantity: 1,
  },
  {
    id: 4,
    name: "درزگیر",
    description: "",
    brands: [
      { id: 1, name: "ضد" },
      { id: 2, name: "آسمان" },
    ],
    unit: { name: "رأس" },
    requiredQuantity: 1000,
  },
]

const supplier = { id: 1, name: "امید ترمه گستر یزد شهاب" }

const tenderBids = ref([])

const isTenderBidsVisible = ref([])

const isSendTenderBidsPending = ref([])

const hasError = ref(false)
const isSuccessful = ref(false)

const paymentTerms = ref()
const invoiceType = ref()

const tenderExpiresAt = 1748869346842
const tenderExpiresIn = ref(tenderExpiresAt - Date.now())

const intervalId = setInterval(() => {
  tenderExpiresIn.value -= 1000

  if (tenderExpiresIn.value <= 0) {
    clearInterval(intervalId)
    tenderExpiresIn.value = 0
  }
}, 1000)

const timeRemaining = computed(() => {
  const totalSeconds = Math.floor(tenderExpiresIn.value / 1000)

  const days = Math.floor(totalSeconds / (3600 * 24))
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  return {
    days,
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  }
})

const sendTenderBid = async tenderBidId => {
  const tenderBid = tenderBids.value.find(
    tenderBid => tenderBid.id === tenderBidId,
  )

  if (!tenderBid.bidPrice || !tenderBid.bidQuantity) {
    return
  }

  isSendTenderBidsPending.value[tenderBidId] = true

  await new Promise((resolve, reject) => {
    setTimeout(() => {
      if (tenderBidId === 2) {
        hasError.value = true
        isSendTenderBidsPending.value[tenderBidId] = false

        return reject(false)
      } else {
        return resolve(true)
      }
    }, 1000)
  })

  isSendTenderBidsPending.value[tenderBidId] = false
  isTenderBidsVisible.value[tenderBidId] = false
  isSuccessful.value = true
}

onMounted(() => {
  // start init tenderBids
  let initialTenderBids = []
  let id = 1

  products.forEach(product => {
    if (!product.brands.length) {
      initialTenderBids.push({
        id: id++,
        product,
        brand: {},
        bidPrice: "",
        bidQuantity: "",
        description: "",
      })
    }
    isTenderBidsVisible.value[id] = true
    product.brands.forEach(brand => {
      initialTenderBids.push({
        id: id++,
        product,
        brand,
        bidPrice: "",
        bidQuantity: "",
        description: "",
      })
      isTenderBidsVisible.value[id] = true
    })
  })

  tenderBids.value = initialTenderBids

  // end init tenderBids
})

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
    مشکلی پیش آمده‌است
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
        <VList style="background-color: rgb(var(--v-theme-background))">
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
                v-model="paymentTerms"
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
                v-if="paymentTerms === 'credit'"
                v-model="creditDescription"
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
                v-model="invoiceType"
                inline
              >
                <VRadio
                  label="فاکتور رسمی"
                  value="cash"
                />
                <VRadio
                  label="فاکتور فروشگاهی"
                  value="credit"
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
              (tenderBid) => isTenderBidsVisible[tenderBid.id],
            )"
            :key="tenderBid.id"
            cols="12"
            md="6"
            lg="4"
          >
            <VCard>
              <VCardTitle class="custom-v-card-title">
                {{
                  tenderBid.product.name +
                    (tenderBid.brand.name ? ` (${tenderBid.brand.name})` : "")
                }}
              </VCardTitle>

              <VCardText>
                {{ tenderBid.product.description }}
              </VCardText>

              <VCardText>
                <VForm
                  validate-on="submit lazy"
                  @submit.prevent="sendTenderBid(tenderBid.id)"
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
                        :suffix="tenderBid.product.unit.name"
                        :placeholder="`مقدار مورد نیاز: ${tenderBid.product.requiredQuantity}`"
                        :rules="[requiredValidator]"
                      />
                    </VCol>

                    <VCol cols="12">
                      <AppTextarea
                        v-model="tenderBid.description"
                        label="توضیحات"
                        rows="3"
                      />
                    </VCol>

                    <VCol cols="12">
                      <VBtn
                        type="submit"
                        :loading="isSendTenderBidsPending[tenderBid.id]"
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
