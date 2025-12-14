<script setup>
import jalaali from 'jalaali-js'

const emit = defineEmits(['back'])

const current = ref('root')

function goBack() {
  if (current.value !== 'root') {
    current.value = 'root'
  }
  else {
    emit('back')
  }
}

const uiState = reactive({
  success: false,
  successMessage: '',
  hasError: false,
  errorMessage: '',
  isDeliveryDialogVisible: false,
})
const pendingState = reactive({
  fetchingUndeliveredReservedMeals: false,
  searchUndeliveredReservedMeal: false,
})

const undeliveredReservedMeals = ref([])
const undeliveredReservedMeal = ref(null)
const todayDate = ref(null)
const deliveryCode = ref(null)

// rules
const countInputRules = [
  (value) => {
    if (value === null || value === undefined || value === '')
      return true

    const isInteger = /^\d+$/.test(String(value))
    if (!isInteger)
      return 'فقط باید عدد باشد!'

    return true
  },
]

// helper methods
function setError(message) {
  uiState.hasError = true
  uiState.errorMessage = message
}

// methods
async function search() {
  if (!deliveryCode.value) {
    setError('لطفاً ابتدا، کد تحویل را وارد کنید کنید.')
    return
  }

  pendingState.searchUndeliveredReservedMeal = true

  try {
    const res = await $api('/food/delivery/find', {
      method: 'GET',
      params: {
        date: todayDate.value,
        delivery_code: deliveryCode.value,
      },
      onResponseError({ response }) {
        if (response._data?.errors) {
          setError('رزروی با این کد تحویل یافت نشد.')
        }
        else {
          uiState.errorMessage = 'خطا در جستجو'
        }
      },
    })

    // API might return object or array; normalize to single item
    const data = res?.data ?? null
    undeliveredReservedMeal.value = Array.isArray(data) ? (data[0] ?? null) : data

    uiState.isDeliveryDialogVisible = true
  }
  catch (err) {
    console.error('Error fetching reserved meal:', err)
  }
  finally {
    pendingState.searchUndeliveredReservedMeal = false
  }
}

async function fetchUndeliveredReservedMealsOnDate() {
  undeliveredReservedMeals.value = []
  pendingState.fetchingUndeliveredReservedMeals = true

  try {
    const res = await $api('/food/delivery', {
      method: 'GET',
      params: {
        date: todayDate.value,
      },
    })

    undeliveredReservedMeals.value = (res?.data || []).flat()
  }
  catch (err) {
    console.error('Error fetching reserved meals:', err)
    setError('خطا در دریافت رزروها')
  }
  finally {
    pendingState.fetchingUndeliveredReservedMeals = false
  }
}

function dialogModelValueUpdate(val) {
  uiState.isDeliveryDialogVisible = val
  if (!val)
    onResetForm()
}

function onResetForm() {
  undeliveredReservedMeal.value = null
  deliveryCode.value = null
}

const sortedReservedMealsForContractor = computed(() =>
  [...undeliveredReservedMeals.value].sort((a, b) =>
    String(a?.meal?.name || '').localeCompare(String(b?.meal?.name || '')),
  ),
)

onMounted(async () => {
  const today = new Date()
  const jToday = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate())
  const fmt = j => `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`

  todayDate.value = fmt(jToday)

  await fetchUndeliveredReservedMealsOnDate()
})
</script>

<template>
  <div>
    <VBtn
      variant="text"
      prepend-icon="tabler-arrow-right"
      class="mb-4"
      @click="goBack"
    >
      {{ current === 'root' ? 'آشپزخانه' : 'صفحه قبل' }}
    </VBtn>
  </div>

  <VContainer>
    <VSnackbar
      v-model="uiState.hasError"
      :timeout="2000"
      location="center"
      variant="flat"
      color="error"
    >
      {{ uiState.errorMessage }}
    </VSnackbar>

    <VSnackbar
      v-model="uiState.success"
      :timeout="2000"
      location="center"
      variant="flat"
      color="success"
    >
      {{ uiState.successMessage }}
    </VSnackbar>

    <VRow dense>
      <VCol cols="12" md="12">
        <VCard class="mb-4">
          <label class="font-weight-medium mb-2 mt-2 d-block text-center">
            تحویل غذا
          </label>

          <VRow class="mb-4 px-4">
            <VCol cols="12" sm="12" md="12">
              <VTextField
                v-model="deliveryCode"
                label="کد تحویل"
                variant="outlined"
                :rules="[requiredValidator, ...countInputRules]"
                @keydown.enter="search"
              />
            </VCol>
          </VRow>

          <VRow justify="center" class="mb-4">
            <VCol cols="auto">
              <VBtn
                color="primary"
                :loading="pendingState.searchUndeliveredReservedMeal"
                :disabled="pendingState.searchUndeliveredReservedMeal"
                @click="search"
              >
                جستجو
              </VBtn>
            </VCol>
          </VRow>
        </VCard>

        <!-- برای دسکتاپ -->
        <div class="ma-3 overflow-auto d-none d-md-block">
          <VCard class="pa-4">
            <label class="font-weight-medium mb-4 d-block text-center">
              رزروهای تحویل نشده امروز
            </label>

            <VTable v-if="!pendingState.fetchingUndeliveredReservedMeals">
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>وعده</th>
                  <th>رزرو کننده</th>
                  <th>کد پرسنلی</th>
                  <th>کد تحویل</th>
                  <th>نوع رزرو</th>
                  <th>وضعیت</th>
                  <th>پیمانکار</th>
                  <th>تعداد</th>
                  <th>توضیحات</th>
                  <th>عملیات</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(item, index) in sortedReservedMealsForContractor"
                  :key="item.id"
                >
                  <td>{{ index + 1 }}</td>

                  <td>{{ item.meal?.name }}</td>

                  <td>
                    <VChip>
                      {{ item.created_by ? `${item.created_by.first_name} ${item.created_by.last_name}` : '—' }}
                    </VChip>
                  </td>

                  <td>
                    <VChip>
                      {{ item.created_by ? `${item.created_by.personnel_code}` : '—' }}
                    </VChip>
                  </td>

                  <td>
                    <VChip color="success">
                      {{ item.delivery_code }}
                    </VChip>
                  </td>

                  <td>
                    <VChip>
                      {{
                        {
                          personnel: 'پرسنل',
                          contractor: 'پیمانکار',
                          guest: 'مهمان',
                        }[item.reserve_type] || ''
                      }}
                    </VChip>
                  </td>

                  <td>
                    <VChip :color="item.status ? 'success' : 'error'" size="small">
                      {{ item.status ? 'تحویل شده' : 'تحویل نشده' }}
                    </VChip>
                  </td>

                  <td>
                    <VChip v-if="item.details?.[0]?.contractor">
                      {{
                        `${item.details[0].contractor.first_name} ${item.details[0].contractor.last_name}`
                      }}
                    </VChip>
                    <span v-else>—</span>
                  </td>

                  <td>
                    {{
                      item.details?.reduce(
                        (sum, detail) => sum + (detail.quantity || 0),
                        0,
                      )
                    }}
                  </td>

                  <td class="py-2">
                    <VTooltip location="top" :disabled="!(item.description?.length > 6)">
                      <template #activator="{ props }">
                        <div
                          v-bind="props"
                          class="text-truncate"
                          style="max-width: 120px;"
                        >
                          {{ item.description || '—' }}
                        </div>
                      </template>

                      <div style="max-width: 420px; white-space: normal; overflow-wrap: anywhere;">
                        {{ item.description }}
                      </div>
                    </VTooltip>
                  </td>

                  <td>
                    <VBtn
                      color="orange-darken-2"
                      variant="plain"
                      @click="undeliveredReservedMeal = item; uiState.isDeliveryDialogVisible = true"
                    >
                      <VIcon icon="tabler-circle-dashed-check" size="20" start />
                      تحویل
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>

            <VSkeletonLoader v-else type="card" />
          </VCard>
        </div>

        <!-- برای موبایل -->
        <div class="d-md-none pa-3">
          <VExpansionPanels variant="accordion">
            <VExpansionPanel>
              <VExpansionPanelTitle class="font-weight-bold">
                رزروهای تحویل نشده امروز
              </VExpansionPanelTitle>

              <VExpansionPanelText v-if="!pendingState.fetchingUndeliveredReservedMeals">
                <VExpansionPanels variant="accordion">
                  <VExpansionPanel
                    v-for="item in sortedReservedMealsForContractor"
                    :key="item.id"
                    class="mb-2"
                  >
                    <VExpansionPanelTitle>
                      <div class="d-flex flex-column w-100">
                        <div class="d-flex justify-space-between align-center mb-1">
                          <span>{{ item.meal?.name }}</span>
                          <VChip>
                            {{ item.created_by ? `${item.created_by.first_name} ${item.created_by.last_name}` : '—' }}
                          </VChip>
                        </div>
                        <div class="d-flex justify-space-between align-center">
                          <VChip>
                            {{ item.created_by ? `${item.created_by.personnel_code}` : '—' }}
                          </VChip>
                          <VChip color="success">
                            {{ item.delivery_code }}
                          </VChip>
                        </div>
                      </div>
                    </VExpansionPanelTitle>

                    <VExpansionPanelText>
                      <div class="pa-2">
                        <div class="mb-2 d-flex justify-space-between">
                          <strong>نوع رزرو:</strong>
                          <VChip>
                            {{
                              {
                                personnel: 'پرسنل',
                                contractor: 'پیمانکار',
                                guest: 'مهمان',
                              }[item.reserve_type] || ''
                            }}
                          </VChip>
                        </div>

                        <div class="mb-2 d-flex justify-space-between">
                          <strong>پیمانکار:</strong>
                          <VChip>
                            {{
                              item.details?.[0]?.contractor
                                ? `${item.details[0].contractor.first_name} ${item.details[0].contractor.last_name}`
                                : '—'
                            }}
                          </VChip>
                        </div>

                        <div class="mb-2 d-flex justify-space-between">
                          <VChip :color="item.status ? 'success' : 'error'" size="small">
                            {{ item.status ? 'تحویل شده' : 'تحویل نشده' }}
                          </VChip>
                          {{
                            item.details?.reduce(
                              (sum, detail) => sum + (detail.quantity || 0),
                              0,
                            )
                          }} عدد
                        </div>

                        <div class="mb-2 d-flex justify-space-between align-start">
                          <strong class="me-2">توضیحات:</strong>
                          <div
                            style="
                              max-width: 100%;
                              white-space: normal;
                              overflow-wrap: anywhere;
                              word-break: break-word;
                              text-align: right;
                              flex: 1;
                            "
                          >
                            {{ item.description || '—' }}
                          </div>
                        </div>

                        <div class="mt-2 text-center">
                          <VBtn
                            color="orange-darken-2"
                            variant="plain"
                            @click="undeliveredReservedMeal = item; uiState.isDeliveryDialogVisible = true"
                          >
                            <VIcon icon="tabler-circle-dashed-check" size="20" start />
                            تحویل
                          </VBtn>
                        </div>
                      </div>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
              </VExpansionPanelText>

              <VSkeletonLoader v-else type="card" />
            </VExpansionPanel>
          </VExpansionPanels>
        </div>
      </VCol>
    </VRow>
  </VContainer>

  <!-- Reserved Meal Delivery Dialog -->
  <VDialog
    v-if="undeliveredReservedMeal"
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="uiState.isDeliveryDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="uiState.isDeliveryDialogVisible = false" />

    <VCard v-if="undeliveredReservedMeal">
      <VCardTitle class="text-h6">
        جزئیات
      </VCardTitle>

      <VCardText>
        <VRow>
          <VCol cols="12" sm="6">
            <p><strong>رزرو کننده:</strong> {{ undeliveredReservedMeal.created_by ? `${undeliveredReservedMeal.created_by.first_name} ${undeliveredReservedMeal.created_by.last_name}` : '—' }}</p>
          </VCol>

          <VCol cols="12" sm="6">
            <p><strong>کد پرسنلی:</strong> {{ undeliveredReservedMeal.created_by ? `${undeliveredReservedMeal.created_by.personnel_code}` : '—' }}</p>
          </VCol>
        </VRow>

        <VRow>
          <VCol cols="12" sm="6">
            <p><strong>کد تحویل:</strong> {{ undeliveredReservedMeal.delivery_code }}</p>
          </VCol>

          <VCol cols="12" sm="6">
            <p><strong>وعده:</strong> {{ undeliveredReservedMeal.meal?.name }}</p>
          </VCol>

          <VCol cols="12" sm="6">
            <p>
              <strong>نوع رزرو:</strong> {{
                {
                  personnel: 'پرسنل',
                  contractor: 'پیمانکار',
                  guest: 'مهمان',
                }[undeliveredReservedMeal.reserve_type] || ''
              }}
            </p>
          </VCol>

          <VCol v-if="undeliveredReservedMeal.details?.[0]?.contractor" cols="12" sm="6">
            <p>
              <strong>پیمانکار:</strong> {{
                `${undeliveredReservedMeal.details[0].contractor.first_name} ${undeliveredReservedMeal.details[0].contractor.last_name}`
              }}
            </p>
          </VCol>
        </VRow>

        <VRow>
          <VCol cols="12" sm="6">
            <p><strong>وضعیت:</strong> {{ undeliveredReservedMeal.status ? 'تحویل شده' : 'تحویل نشده' }}</p>
          </VCol>

          <VCol cols="12" sm="6">
            <p>
              <strong>تعداد:</strong> {{
                undeliveredReservedMeal.details?.reduce(
                  (sum, detail) => sum + (detail.quantity || 0),
                  0,
                )
              }}
            </p>
          </VCol>
        </VRow>

        <VRow>
          <VCol v-if="undeliveredReservedMeal.details?.[0]?.contractor" cols="12" sm="6">
            <p>
              <strong>پیمانکار:</strong> {{
                `${undeliveredReservedMeal.details[0].contractor.first_name} ${undeliveredReservedMeal.details[0].contractor.last_name}`
              }}
            </p>
          </VCol>
        </VRow>

        <VRow>
          <VCol v-if="undeliveredReservedMeal.description" cols="12" sm="12">
            <p style="white-space: normal; overflow-wrap: anywhere;">
              <strong>توضیحات:</strong> {{ undeliveredReservedMeal.description }}
            </p>
          </VCol>
        </VRow>

        <VDivider class="my-3" />
      </VCardText>
    </VCard>
  </VDialog>
</template>
