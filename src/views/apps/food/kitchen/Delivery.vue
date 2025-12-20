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
  fetchingReservedMeals: false,
  searchReservedMeal: false,
  deliverReservedMeal: false,
  fetchingFoods: false,
})

const reservedMeals = ref([])
const reservedMeal = ref(null)
const todayDate = ref(null)
const deliveryCode = ref(null)

// details dialog data
// personnel reservation
const selectedUsers = ref([])

// contractor reservation
const maxCount = computed(() =>
  reservedMeal.value?.details?.reduce(
    (sum, detail) => sum + (detail.quantity || 0),
    0,
  ) || 0,
)

const receivedCount = ref(0)
watch(maxCount, (v) => {
  receivedCount.value = v
}, { immediate: true })

const todayFoodCount = ref(0)
watch(receivedCount, (v) => {
  todayFoodCount.value = v
}, { immediate: true })

const foods = ref([])
const secondFood = ref(null)
const secondFoodReceivedCount = ref(0)
const thirdFood = ref(null)
const thirdFoodReceivedCount = ref(0)

const remainingAfterToday = computed(() =>
  Math.max(receivedCount.value - todayFoodCount.value, 0),
)

const remainingAfterSecond = computed(() =>
  Math.max(receivedCount.value - todayFoodCount.value - secondFoodReceivedCount.value, 0),
)

watch([receivedCount, todayFoodCount, secondFoodReceivedCount, thirdFoodReceivedCount], () => {
  if (todayFoodCount.value > receivedCount.value)
    todayFoodCount.value = receivedCount.value

  if (secondFoodReceivedCount.value > remainingAfterToday.value)
    secondFoodReceivedCount.value = remainingAfterToday.value

  if (remainingAfterToday.value === 0) {
    secondFood.value = null
    secondFoodReceivedCount.value = 0
  }

  if (thirdFoodReceivedCount.value > remainingAfterSecond.value)
    thirdFoodReceivedCount.value = remainingAfterSecond.value

  if (remainingAfterSecond.value === 0) {
    thirdFood.value = null
    thirdFoodReceivedCount.value = 0
  }
})

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

  pendingState.searchReservedMeal = true

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

    const data = res?.data ?? null
    reservedMeal.value = Array.isArray(data) ? (data[0] ?? null) : data

    if (!reservedMeal.value) {
      setError('این رزرو، تحویل داده شده است یا در بازه تحویل قرار ندارد.')
      return
    }

    uiState.isDeliveryDialogVisible = true
  }
  catch (err) {
    console.error('Error fetching reserved meal:', err)
  }
  finally {
    pendingState.searchReservedMeal = false
  }
}

async function fetchReservedMealsOnDate() {
  reservedMeals.value = []
  pendingState.fetchingReservedMeals = true

  try {
    const res = await $api('/food/delivery', {
      method: 'GET',
      params: {
        date: todayDate.value,
      },
    })

    reservedMeals.value = (res?.data || []).flat()
  }
  catch (err) {
    console.error('Error fetching reserved meals:', err)
    setError('خطا در دریافت رزروها')
  }
  finally {
    pendingState.fetchingReservedMeals = false
  }
}

async function fetchFoods() {
  pendingState.fetchingFoods = true
  try {
    const res = await $api('/food/food/get-actives', { method: 'GET' })

    foods.value = res?.data.foods || []
  }
  catch (e) {
    console.error('Error fetching foods:', e)
    setError('خطا در دریافت غذاها')
  }
  finally {
    pendingState.fetchingFoods = false
  }
}

// dialog related methods
function dialogModelValueUpdate(val) {
  uiState.isDeliveryDialogVisible = val
  if (!val)
    onResetForm()
}

function onResetForm() {
  reservedMeal.value = null
  deliveryCode.value = null
  selectedUsers.value = []
  secondFood.value = null
  secondFoodReceivedCount.value = 0
  thirdFood.value = null
  thirdFoodReceivedCount.value = 0
}

async function deliver() {
  // validation only (no side effects)
  if (!reservedMeal.value) {
    setError('رزروی انتخاب نشده است.')
    return
  }

  // personnel validation: can't mark all as "didn't receive"
  if (reservedMeal.value.reserve_type === 'personnel') {
    const personnelDetails = (reservedMeal.value.details || []).filter(d => d.personnel)
    const allIds = personnelDetails.map(d => d.id)

    if (allIds.length > 0 && selectedUsers.value.length === allIds.length) {
      setError('نمیتوان گزینه تحویل نگرفت را برای تمام کاربران درخواست، انتخاب کرد')
      return
    }
  }

  // contractor validation: totals must match received
  if (reservedMeal.value.reserve_type === 'contractor') {
    const received = Number(receivedCount.value) || 0
    const today = Number(todayFoodCount.value) || 0
    const second = Number(secondFoodReceivedCount.value) || 0
    const third = Number(thirdFoodReceivedCount.value) || 0

    if (secondFood.value && second <= 0) {
      setError('برای غذای دوم، تعداد دریافتی را وارد کنید')
      return
    }

    if (thirdFood.value && third <= 0) {
      setError('برای غذای سوم، تعداد دریافتی را وارد کنید')
      return
    }

    if (today + second + third !== received) {
      setError('مجموع دریافتی‌ها باید دقیقاً برابر تعداد دریافتی کل باشد')
      return
    }
  }

  // continue (send api) only if valid
  pendingState.deliverReservedMeal = true

  try {
    let payload

    if (reservedMeal.value.reserve_type === 'personnel') {
      payload = {
        type: 'personnel',
        reserved_meal_id: reservedMeal.value.id,
        ...(selectedUsers.value.length > 0 ? { noDeliveryFor: selectedUsers.value } : {}),
      }
    }
    else if (reservedMeal.value.reserve_type === 'contractor') {
      payload = {
        type: 'contractor',
        contractor: reservedMeal.value.details[0].contractor.id,
        reserved_meal_id: reservedMeal.value.id,
        received_count: receivedCount.value,
        today_food_count: todayFoodCount.value,
        ...(secondFood.value ? { second_food: secondFood.value } : {}),
        ...(secondFood.value ? { second_food_received_count: secondFoodReceivedCount.value } : {}),
        ...(thirdFood.value ? { third_food: thirdFood.value } : {}),
        ...(thirdFood.value ? { third_food_received_count: thirdFoodReceivedCount.value } : {}),
      }
    }
    else if (reservedMeal.value.reserve_type === 'guest') {
      payload = {
        type: 'guest',
        reserved_meal_id: reservedMeal.value.id,
      }
    }

    const res = await $api('/food/delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      onResponseError({ response }) {
        uiState.hasError = true
        if (response._data?.errors) {
          const errors = Object.values(response._data.errors).flat().join(' | ')
          uiState.errorMessage = errors
        }
        else {
          uiState.errorMessage = response._data?.message || 'خطا در ایجاد'
        }
      },
    })

    await fetchReservedMealsOnDate()

    return res
  }
  catch (err) {
    console.error('Error deliver:', err)
    setError('خطا در ارسال اطلاعات')
  }
  finally {
    pendingState.deliverReservedMeal = false
    uiState.isDeliveryDialogVisible = false
    onResetForm()
  }
}

const sortedReservedMeals = computed(() =>
  [...reservedMeals.value].sort((a, b) =>
    String(a?.meal?.name || '').localeCompare(String(b?.meal?.name || '')),
  ),
)

onMounted(async () => {
  const today = new Date()
  const jToday = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate())
  const fmt = j => `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`

  todayDate.value = fmt(jToday)

  await fetchReservedMealsOnDate()
  await fetchFoods()
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
                :loading="pendingState.searchReservedMeal"
                :disabled="pendingState.searchReservedMeal"
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
              رزروهای امروز
            </label>

            <VTable v-if="!pendingState.fetchingReservedMeals">
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
                  v-for="(item, index) in sortedReservedMeals"
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
                      @click="reservedMeal = item; uiState.isDeliveryDialogVisible = true"
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
                رزروهای امروز
              </VExpansionPanelTitle>

              <VExpansionPanelText v-if="!pendingState.fetchingReservedMeals">
                <VExpansionPanels variant="accordion">
                  <VExpansionPanel
                    v-for="item in sortedReservedMeals"
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
                            @click="reservedMeal = item; uiState.isDeliveryDialogVisible = true"
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
    v-if="reservedMeal"
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="uiState.isDeliveryDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="uiState.isDeliveryDialogVisible = false" />

    <VCard>
      <VCardTitle class="text-h6">
        تحویل
      </VCardTitle>

      <VCardActions class="justify-end">
        <VBtn
          color="primary"
          variant="tonal"
          :loading="pendingState.deliverReservedMeal"
          :disabled="pendingState.deliverReservedMeal || reservedMeal.status"
          @click="deliver"
        >
          ارسال
        </VBtn>
      </VCardActions>

      <VCardText>
        <VRow>
          <VCol cols="12" sm="6">
            <p><strong>رزرو کننده:</strong> {{ reservedMeal.created_by ? `${reservedMeal.created_by.first_name} ${reservedMeal.created_by.last_name}` : '—' }}</p>
          </VCol>

          <VCol cols="12" sm="6">
            <p><strong>کد پرسنلی:</strong> {{ reservedMeal.created_by ? `${reservedMeal.created_by.personnel_code}` : '—' }}</p>
          </VCol>
        </VRow>

        <VDivider class="my-3" />

        <VRow>
          <VCol cols="12" sm="6">
            <p><strong>کد تحویل:</strong> {{ reservedMeal.delivery_code }}</p>
          </VCol>

          <VCol cols="12" sm="6">
            <p><strong>وعده:</strong> {{ reservedMeal.meal?.name }}</p>
          </VCol>

          <VDivider class="my-3" />

          <VCol cols="12" sm="6">
            <p>
              <strong>نوع رزرو:</strong> {{
                {
                  personnel: 'پرسنل',
                  contractor: 'پیمانکار',
                  guest: 'مهمان',
                }[reservedMeal.reserve_type] || ''
              }}
            </p>
          </VCol>

          <VCol v-if="reservedMeal.details?.[0]?.contractor" cols="12" sm="6">
            <p>
              <strong>پیمانکار:</strong> {{
                `${reservedMeal.details[0].contractor.first_name} ${reservedMeal.details[0].contractor.last_name}`
              }}
            </p>
          </VCol>

          <VCol v-if="reservedMeal.reserve_type === 'guest'" cols="12" sm="6">
            <p>
              <strong>نوع سرو:</strong> {{
                {
                  serve_in_kitchen: 'سرو در آشپزخانه',
                  deliver: 'تحویل',
                }[reservedMeal.serve_place] || ''
              }}
            </p>
          </VCol>
        </VRow>

        <VDivider class="my-3" />

        <VRow>
          <VCol cols="12" sm="6">
            <p><strong>وضعیت:</strong> {{ reservedMeal.status ? 'تحویل شده' : 'تحویل نشده' }}</p>
          </VCol>

          <VCol cols="12" sm="6">
            <p>
              <strong>تعداد:</strong> {{
                reservedMeal.details?.reduce(
                  (sum, detail) => sum + (detail.quantity || 0),
                  0,
                )
              }}
            </p>
          </VCol>
        </VRow>

        <VDivider class="my-3" />

        <VRow>
          <VCol v-if="reservedMeal.description" cols="12" sm="12">
            <p style="white-space: normal; overflow-wrap: anywhere;">
              <strong>توضیحات:</strong> {{ reservedMeal.description }}
            </p>
          </VCol>
        </VRow>

        <VDivider class="my-3" />

        <!-- Show personnel list for personnel reservation -->
        <div v-if="reservedMeal.reserve_type === 'personnel'">
          <VTable density="comfortable">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>نام</th>
                <th>کد پرسنلی</th>
                <th>تحویل نگرفت</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(d, index) in (reservedMeal.details || []).filter(x => x.personnel)"
                :key="d.id"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ `${d.personnel.first_name} ${d.personnel.last_name}` }}</td>
                <td>{{ d.personnel.personnel_code }}</td>
                <td>
                  <VCheckbox
                    v-if="!reservedMeal.status"
                    v-model="selectedUsers"
                    :value="d.id"
                    hide-details
                    color="red"
                  />
                  <VIcon v-if="reservedMeal.status && !d.delivery_status" icon="tabler-square-check" />
                </td>
              </tr>
            </tbody>
          </VTable>
        </div>

        <!-- Show select and quantity options for contractor reservation -->
        <div v-if="reservedMeal.reserve_type === 'contractor'">
          <VContainer v-if="!reservedMeal.status">
            <VRow>
              <VCol>
                <h5>تعداد دریافتی کل</h5>

                <VNumberInput
                  v-model="receivedCount"
                  :min="1"
                  :max="maxCount"
                />
              </VCol>
              <VCol>
                <h5>غذای روز</h5>

                <VNumberInput
                  v-model="todayFoodCount"
                  :min="1"
                  :max="receivedCount"
                />
              </VCol>
            </VRow>

            <VRow v-if="remainingAfterToday > 0">
              <VCol cols="12" md="12">
                <VSelect
                  v-model="secondFood"
                  :items="foods"
                  item-title="name"
                  item-value="id"
                  label="غذای دوم"
                  variant="outlined"
                  clearable
                  :rules="[requiredValidator]"
                />
              </VCol>

              <VCol v-if="secondFood">
                <h5>تعداد دریافتی</h5>

                <VNumberInput
                  v-model="secondFoodReceivedCount"
                  :min="1"
                  :max="remainingAfterToday"
                />
              </VCol>
            </VRow>

            <VRow v-if="secondFood && remainingAfterSecond > 0">
              <VCol cols="12" md="12">
                <VSelect
                  v-model="thirdFood"
                  :items="foods.filter(f => f.id !== secondFood)"
                  item-title="name"
                  item-value="id"
                  label="غذای سوم"
                  variant="outlined"
                  clearable
                  :rules="[requiredValidator]"
                />
              </VCol>

              <VCol v-if="thirdFood">
                <h5>تعداد دریافتی</h5>

                <VNumberInput
                  v-model="thirdFoodReceivedCount"
                  :min="1"
                  :max="remainingAfterSecond"
                />
              </VCol>
            </VRow>
          </VContainer>
        </div>

        <VDivider v-if="reservedMeal.reserve_type !== 'guest' && (reservedMeal.reserve_type === 'contractor' && !reservedMeal.status)" class="my-3" />
      </VCardText>
    </VCard>
  </VDialog>
</template>
