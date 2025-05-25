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
  },
  {
    id: 3,
    name: "فوم عایق صدا 5 سانتی ( شونه تخم مرغی)",
    description: "توضیحات",
    brands: [{ id: 1, name: "ایگو" }],
    unit: { name: "متر" },
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
  },
]

const supplier = { id: 1, name: "امید ترمه گستر یزد شهاب" }

const tenderBids = ref([])

console.log(tenderBids)

onMounted(() => {
  // start init tenderBids
  let initialTenderBids = []
  let id = 1

  products.forEach(product => {
    if (!product.brands.length) {
      initialTenderBids.push({ id: id++, product, brand: {}, bidPrice: '', bidQuantity: '', description: '' })
    }
    product.brands.forEach(brand => {
      initialTenderBids.push({ id: id++, product, brand, bidPrice: '', bidQuantity: '', description: '' })
    })
  })

  tenderBids.value = initialTenderBids

  // end init tenderBids
})
</script>

<template>
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
        <VCol
          v-for="tenderBid in tenderBids"
          :key="tenderBid.id"
          cols="12"
        >
          <VCard>
            <VCardTitle class="custom-v-card-title">
              {{ tenderBid.product.name + (tenderBid.brand.name ? ` (${tenderBid.brand.name})` : "") }}
            </VCardTitle>

            <VCardText>
              {{ tenderBid.product.description }}
            </VCardText>

            <VCardText>
              <VForm
                @submit.prevent="
                  {
                  }
                "
              >
                <VRow>
                  <VCol cols="12">
                    <AppTextField
                      v-model="tenderBid.bidPrice"
                      label="قیمت"
                      type="number"
                      prepend-inner-icon="tabler-coin"
                      suffix="ریال"
                    />
                  </VCol>

                  <VCol cols="12">
                    <AppTextField
                      v-model="tenderBid.bidQuantity"
                      label="تعداد"
                      type="number"
                      prepend-inner-icon="tabler-scale"
                      :suffix="tenderBid.product.unit.name"
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
                    <VBtn type="submit">
                      <VIcon icon="tabler-send" />
                      ارسال
                    </VBtn>
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VCard>
        </VCol>
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
</style>
