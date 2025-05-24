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

const isPricingDialogVisible = ref([])

const products = ref([
  {
    id: 1,
    name: "دستگاه پمپ چسب آکواریوم",
    description: "توضیحات",
    brands: [{ name: "آذرخش" }, { name: "شهاب" }, { name: "پارس" }],
  },
  {
    id: 2,
    name: "الک",
    description:
      "توضیحاتی که طولانی باشد. توضیحاتی که طولانی باشد. توضیحاتی که طولانی باشد. توضیحاتی که طولانی باشد. توضیحاتی که طولانی باشد. توضیحاتی که طولانی باشد.",
    brands: [],
  },
  {
    id: 3,
    name: "فوم عایق صدا 5 سانتی ( شونه تخم مرغی)",
    description: "توضیحات",
    brands: [{ name: "ایگو" }],
  },
])
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
          v-for="(product, index) in products"
          :key="product.id"
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
  
            <VCardActions>
              <VDialog
                v-model="isPricingDialogVisible[index]"
                fullscreen
                :scrim="false"
                transition="dialog-bottom-transition"
              >
                <!-- Dialog Activator -->
                <template #activator="{ props }">
                  <VBtn v-bind="props">
                    قیمت گذاری
                  </VBtn>
                </template>

                <!-- Dialog Content -->
                <VCard>
                  <!-- Toolbar -->
                  <div>
                    <VToolbar color="primary">
                      <VBtn
                        icon
                        variant="plain"
                        @click="isPricingDialogVisible[index] = false"
                      >
                        <VIcon
                          color="white"
                          icon="tabler-x"
                        />
                      </VBtn>

                      <VToolbarTitle class="custom-v-toolbar-title">
                        {{ product.name }}
                      </VToolbarTitle>

                      <VSpacer />

                      <VToolbarItems>
                        <VBtn
                          variant="text"
                          @click="isPricingDialogVisible[index] = false"
                        >
                          ذخیره
                        </VBtn>
                      </VToolbarItems>
                    </VToolbar>
                  </div>
                </VCard>
              </VDialog>
            </VCardActions>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </main>
</template>

<style lang="scss">
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

.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.2s ease-in-out;
}
</style>
