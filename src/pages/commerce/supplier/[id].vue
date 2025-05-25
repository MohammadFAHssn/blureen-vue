<script setup>
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue"

definePage({
  meta: {
    layout: "blank",
    public: true,
  },
})

// const route = useRoute()
// <div>{{ route.params.id }}</div>

// const { execute: fetchUsers, data, error } = await useApi(createUrl("/test"))

const products = ref([
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
])

const firstName = ref("")
const lastName = ref("")
const city = ref("")
const country = ref("")
const company = ref("")
const email = ref("")
const checkbox = ref(false)

const tenderBids = computed(() => {
  let initialTenderBids = []

  const initialTenderBid = {
    supplierId: "",
    productId: "",
    brandId: "",
    bidPrice: "",
    bidQuantity: "",
    description: "",
  }

  products.value.map(product => {
    if (!product.brands) {
      initialTenderBids.push(initialTenderBid)
    }
    product.brands.map(brand => {
      initialTenderBids.push(initialTenderBid)
    })
  })

  return initialTenderBids
})

console.log(tenderBids)
</script>

<template>
  <main class="layout-page-content">
    <div>
      <VRow>
        <VCol>
          <div>
            <h6 class="text-h6 mb-2">
              مدیریت محترم شرکت/فروشگاه
            </h6>
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
          v-for="(product, product_index) in products"
          :key="product.id"
          cols="12"
        >
          <VRow>
            <VCol
              v-for="(brand, brand_index) in product.brands"
              :key="brand.id"
              lg="4"
              md="6"
              cols="12"
            >
              <VCard>
                <VCardTitle class="custom-v-card-title">
                  {{ product.name + " " + "(" + brand.name + ")" }}
                </VCardTitle>

                <VCardText>
                  {{ product.description }}
                </VCardText>
                <VCardText>
                  <VForm
                    class="custom-v-form"
                    @submit.prevent="
                      {
                      }
                    "
                  >
                    <VRow>
                      <VCol cols="12">
                        <AppTextField
                          v-model="firstName"
                          prepend-inner-icon="tabler-coin"
                          label="قیمت"
                          suffix="ریال"
                          type="number"
                        />
                      </VCol>

                      <VCol cols="12">
                        <AppTextField
                          v-model="email"
                          prepend-inner-icon="tabler-scale"
                          label="تعداد"
                          type="number"
                          :suffix="product.unit.name"
                        />
                      </VCol>

                      <VCol cols="12">
                        <AppTextarea
                          v-model="mobile"
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

            <VCol
              v-if="!product.brands.length"
              lg="4"
              md="6"
              cols="12"
            >
              <VCard>
                <VCardTitle class="custom-v-card-title">
                  {{ product.name }}
                </VCardTitle>

                <VCardText>
                  {{ product.description }}
                </VCardText>
                <VCardText>
                  <VForm
                    class="custom-v-form"
                    @submit.prevent="
                      {
                      }
                    "
                  >
                    <VRow>
                      <VCol cols="12">
                        <AppTextField
                          v-model="firstName"
                          prepend-inner-icon="tabler-coin"
                          label="قیمت"
                          suffix="ریال"
                          type="number"
                        />
                      </VCol>

                      <VCol cols="12">
                        <AppTextField
                          v-model="email"
                          prepend-inner-icon="tabler-scale"
                          label="تعداد"
                          type="number"
                          :suffix="product.unit.name"
                        />
                      </VCol>

                      <VCol cols="12">
                        <AppTextarea
                          v-model="mobile"
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

.custom-v-toolbar-title {
  flex: 10 1 !important;
  font-size: 1.1em !important;
}

.custom-v-form {
  // margin: 1em;marginmargin
}

.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.2s ease-in-out;
}
</style>
