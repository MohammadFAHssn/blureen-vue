<script setup>
const router = useRouter()

const supplier = { id: 1 }

const tenders = ref([
  {
    id: 1,
    product: {
      id: 1,
      name: "داس",
    },
    brand: {
      id: 1,
      name: "آذرخش",
    },
    bids: [
      { supplierId: 1, bidPrice: 420 },
      { supplierId: 3, bidPrice: 450 },
      { supplierId: 4, bidPrice: 480 },
    ],
  },
  {
    id: 2,
    product: {
      id: 2,
      name: "چکش",
    },
    brand: {
      id: 2,
      name: "پتک صنعت",
    },
    bids: [
      { supplierId: 1, bidPrice: 310 },
      { supplierId: 2, bidPrice: 320 },
    ],
  },
  {
    id: 3,
    product: {
      id: 3,
      name: "پیچ گوشتی",
    },
    brand: null,
    bids: [
      { supplierId: 3, bidPrice: 140 },
      { supplierId: 1, bidPrice: 150 },
      { supplierId: 2, bidPrice: 155 },
      { supplierId: 4, bidPrice: 160 },
    ],
  },
  {
    id: 4,
    product: {
      id: 4,
      name: "انبردست",
    },
    brand: {
      id: 4,
      name: "ایران صنعت",
    },
    bids: [
      { supplierId: 3, bidPrice: 210 },
      { supplierId: 5, bidPrice: 220 },
      { supplierId: 1, bidPrice: 230 },
    ],
  },
  {
    id: 5,
    product: {
      id: 5,
      name: "اره",
    },
    brand: {
      id: 5,
      name: "برش گستر",
    },
    bids: [
      { supplierId: 4, bidPrice: 680 },
      { supplierId: 1, bidPrice: 700 },
    ],
  },
  {
    id: 6,
    product: {
      id: 6,
      name: "سیم چین",
    },
    brand: {
      id: 1,
      name: "آذرخش",
    },
    bids: [
      { supplierId: 5, bidPrice: 170 },
      { supplierId: 3, bidPrice: 180 },
      { supplierId: 4, bidPrice: 185 },
      { supplierId: 1, bidPrice: 190 },
    ],
  },
  {
    id: 7,
    product: {
      id: 7,
      name: "فرغون",
    },
    brand: {
      id: 2,
      name: "پتک صنعت",
    },
    bids: [
      { supplierId: 3, bidPrice: 820 },
      { supplierId: 5, bidPrice: 830 },
      { supplierId: 4, bidPrice: 840 },
      { supplierId: 2, bidPrice: 850 },
      { supplierId: 1, bidPrice: 880 },
    ],
  },
  {
    id: 8,
    product: {
      id: 8,
      name: "آچار فرانسه",
    },
    brand: {
      id: 3,
      name: "فن ابزار",
    },
    bids: [
      { supplierId: 1, bidPrice: 270 },
      { supplierId: 4, bidPrice: 280 },
    ],
  },
  {
    id: 9,
    product: {
      id: 9,
      name: "دریل",
    },
    brand: {
      id: 4,
      name: "ایران صنعت",
    },
    bids: [
      { supplierId: 2, bidPrice: 900 },
      { supplierId: 4, bidPrice: 910 },
      { supplierId: 5, bidPrice: 920 },
      { supplierId: 1, bidPrice: 930 },
      { supplierId: 2, bidPrice: 940 },
      { supplierId: 3, bidPrice: 950 },
    ],
  },
  {
    id: 10,
    product: {
      id: 9,
      name: "دریل",
    },
    brand: {
      id: 3,
      name: "فن ابزار",
    },
    bids: [
      { supplierId: 1, bidPrice: 930 },
      { supplierId: 2, bidPrice: 940 },
      { supplierId: 3, bidPrice: 950 },
    ],
  },
])

const removeTender = id => {
  tenders.value = tenders.value.filter(tender => tender.id != id)
}

const bidPriceColor = (index, length) => {
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

const hasVCardBeenTouched = ref([])

const hasError = ref(false)
const isSuccessful = ref(false)
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

  <VRow>
    <VScrollXTransition group>
      <VCol
        v-for="(tender, index) in tenders"
        :key="tender.id"
        v-touch="{
          left: () => removeTender(tender.id),
          right: () => removeTender(tender.id),
        }"
        cols="12"
        md="6"
        lg="4"
      >
        <VCard
          :variant="hasVCardBeenTouched[index] ? 'tonal' : 'elevated'"
          @touchstart="hasVCardBeenTouched[index] = true"
          @touchend="hasVCardBeenTouched[index] = false"
          @mousedown="hasVCardBeenTouched[index] = true"
          @mouseup="hasVCardBeenTouched[index] = false"
        >
          <VCardTitle class="custom-v-card-title">
            {{
              tender.product.name +
                (tender.brand ? ` (${tender.brand.name})` : "")
            }}
          </VCardTitle>

          <VCardText>
            قیمت پیشنهادی شما:
            <VChip color="primary">
              {{
                tender.bids.find((bid) => bid.supplierId === supplier.id)
                  .bidPrice
              }}
              ریال
            </VChip>
          </VCardText>

          <VCardText>
            قیمت‌های پیشنهادی از سایر تأمین‌کنندگان (ریال):
          </VCardText>

          <VCardText class="d-flex flex-wrap gap-x-4 gap-y-2">
            <VChip
              v-for="(bid, bid_index) in tender.bids"
              :key="bid.supplierId"
              :variant="bid.supplierId === supplier.id ? 'flat' : 'outlined'"
              :color="bidPriceColor(bid_index, tender.bids.length)"
            >
              {{ bid.bidPrice }}
            </VChip>
          </VCardText>

          <VCardActions>
            <VBtn
              variant="outlined"
              prepend-icon="tabler-edit"
              color="warning"
              @click="
                router.replace({
                  name: 'apps-supplier-id',
                  params: { id: 123 },
                })
              "
            >
              ویرایش قیمت پیشنهادی
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VScrollXTransition>
  </VRow>
</template>

<style lang="scss" scoped>
.custom-v-card-title {
  white-space: break-spaces !important;
}
</style>
